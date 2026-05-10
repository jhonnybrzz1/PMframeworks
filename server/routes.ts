import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { MAX_FILE_SIZE, DEFAULT_RECENT_ANALYSES_LIMIT } from "../shared/constants";
import { AppError } from "./middleware/error-handler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(__dirname);

// Multer config for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE }, // 5MB limit
});

export async function registerRoutes(app: express.Application) {
  // Upload endpoint - currently supports .txt only
  app.post('/api/upload', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    if (!file) {
      const err: AppError = new Error('Nenhum arquivo enviado.');
      err.status = 400;
      err.code = 'NO_FILE';
      return next(err);
    }

    const ext = path.extname(file.originalname).toLowerCase();

    // Only .txt is supported for now
    if (ext !== '.txt') {
      const err: AppError = new Error(`Formato ${ext || 'desconhecido'} ainda não é suportado. Use arquivo .txt ou cole o texto diretamente.`);
      err.status = 501;
      err.code = 'UNSUPPORTED_FORMAT';
      err.details = { supportedFormats: ['.txt'] };
      return next(err);
    }

    try {
      const text = file.buffer.toString('utf-8');

      if (!text.trim()) {
        const err: AppError = new Error('Arquivo vazio ou sem conteúdo de texto.');
        err.status = 400;
        err.code = 'EMPTY_FILE';
        return next(err);
      }

      return res.json({ text });
    } catch (err) {
      return next(err);
    }
  });

  // Rota para gerar PDF com Playwright
  app.post('/api/generate-pdf', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chromium } = await import('playwright');
      const { analysis, inputText } = req.body;

      if (!analysis) {
        const err: AppError = new Error('Dados de análise são obrigatórios');
        err.status = 400;
        err.code = 'MISSING_DATA';
        return next(err);
      }

      // --- 1. Ler o Template HTML ---
      const templatePath = path.join(__dirname, 'reports', 'templates', 'analise.html');
      if (!fs.existsSync(templatePath)) {
        const err: AppError = new Error('Template de relatório não encontrado.');
        err.status = 500;
        err.code = 'TEMPLATE_NOT_FOUND';
        return next(err);
      }
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      // --- 2. Popular o Template com Dados Dinâmicos ---
      const { formatAnalysisForPDF } = await import('../shared/pdf-helpers');
      const pdfData = formatAnalysisForPDF(analysis, inputText);
      
      const strengthsHtml = pdfData.strengths.map(s => `<li>${s}</li>`).join('');
      const gapsHtml = pdfData.gaps.map(g => `<li>${g}</li>`).join('');

      const replacements = {
        '{{framework}}': pdfData.framework,
        '{{docName}}': pdfData.docName,
        '{{currentDate}}': pdfData.currentDate,
        '{{summary}}': pdfData.summary,
        '{{strengths}}': strengthsHtml,
        '{{gaps}}': gapsHtml,
        '{{recommendations}}': pdfData.recommendations,
        '{{chartImagePath}}': pdfData.chartImagePath || ''
      };

      for (const [key, value] of Object.entries(replacements)) {
        htmlTemplate = htmlTemplate.replace(new RegExp(key, 'g'), value);
      }
      
      // --- 3. Gerar o PDF com Playwright ---
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlTemplate)}`, { waitUntil: 'networkidle' });

      const headerTemplate = `<div style="font-family: Arial, sans-serif; font-size: 10px; color: #555; width: 100%; text-align: center; padding: 0 24mm;">Análise Crítica de Frameworks PM</div>`;
      const footerTemplate = `<div style="font-family: Arial, sans-serif; font-size: 10px; color: #555; width: 100%; padding: 0 24mm; display: flex; justify-content: space-between;"><span>Data: <span class="date"></span></span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`;

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: { top: '40px', bottom: '40px', left: '24mm', right: '24mm' }
      });
      
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="analise-frameworks-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      return next(error);
    }
  });

  // LLM analyze route
  app.post('/api/analyze', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { analyzeRequestSchema } = await import('@shared/schema');
      const parse = analyzeRequestSchema.safeParse(req.body);
      if (!parse.success) {
        const err: AppError = new Error(parse.error.errors.map(e => e.message).join(', '));
        err.status = 400;
        err.code = 'VALIDATION_ERROR';
        return next(err);
      }

      const { framework, inputText } = parse.data;
      const { analyzeWithLLM } = await import('./llm');
      const analysisResult = await analyzeWithLLM(framework, inputText);

      if (!analysisResult.success) {
        const err: AppError = new Error(analysisResult.error || 'Erro na análise do LLM');
        err.status = 500;
        err.code = 'LLM_ERROR';
        return next(err);
      }

      if (!analysisResult.analysis) {
        const err: AppError = new Error('LLM não retornou análise válida.');
        err.status = 500;
        err.code = 'LLM_EMPTY_RESPONSE';
        return next(err);
      }

      const { storage } = await import('./storage');
      const saved = await storage.createAnalysis({ framework, inputText, analysis: analysisResult.analysis as any });

      res.json({ success: true, analysis: analysisResult.analysis, id: saved.id });
    } catch (err: any) {
      return next(err);
    }
  });

  // List recent analyses
  app.get('/api/analyses/recent', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { storage } = await import('./storage');
      const items = await storage.getRecentAnalyses(DEFAULT_RECENT_ANALYSES_LIMIT);
      res.json(items);
    } catch (err: any) {
      return next(err);
    }
  });

  // Get analysis by id
  app.get('/api/analyses/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        const err: AppError = new Error('ID de análise inválido');
        err.status = 400;
        err.code = 'INVALID_ID';
        return next(err);
      }
      const { storage } = await import('./storage');
      const item = await storage.getAnalysis(id);
      if (!item) {
        const err: AppError = new Error('Análise não encontrada');
        err.status = 404;
        err.code = 'NOT_FOUND';
        return next(err);
      }
      res.json(item);
    } catch (err: any) {
      return next(err);
    }
  });

  // Middleware de erro centralizado (deve ser o último após todas as rotas)
  const { errorHandler } = await import('./middleware/error-handler');
  app.use(errorHandler);

  const server = await import("node:http").then(m => m.createServer(app));
  return server;
}
