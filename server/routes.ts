import express from "express";
import type { Request, Response, NextFunction } from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import {
  DEFAULT_RECENT_ANALYSES_LIMIT,
  MAX_FILE_SIZE,
  PDF_FILE_PREFIX,
  PDF_PAGE_OPTIONS,
  PDF_TEMPLATE_RELATIVE_PATH,
  SUPPORTED_UPLOAD_EXTENSIONS,
} from "../shared/constants";
import { AppError } from "./middleware/error-handler";
import {
  applyPDFTemplateReplacements,
  buildPDFTemplateReplacements,
  createTimestampedFileName,
  formatAnalysisForPDF,
  getPDFFooterTemplate,
  getPDFHeaderTemplate,
} from "../shared/pdf-helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer config for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
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

    if (!SUPPORTED_UPLOAD_EXTENSIONS.includes(ext as typeof SUPPORTED_UPLOAD_EXTENSIONS[number])) {
      const err: AppError = new Error(`Formato ${ext || 'desconhecido'} ainda não é suportado. Use arquivo .txt ou cole o texto diretamente.`);
      err.status = 501;
      err.code = 'UNSUPPORTED_FORMAT';
      err.details = { supportedFormats: [...SUPPORTED_UPLOAD_EXTENSIONS] };
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
    const pdfStart = Date.now();
    try {
      const { chromium } = await import('playwright');
      const { analysis, inputText } = req.body;

      if (!analysis) {
        const err: AppError = new Error('Dados de análise são obrigatórios');
        err.status = 400;
        err.code = 'MISSING_DATA';
        return next(err);
      }

      const templateStart = Date.now();
      const templatePath = path.join(__dirname, ...PDF_TEMPLATE_RELATIVE_PATH);
      if (!fs.existsSync(templatePath)) {
        console.error('PDF template missing', { templatePath });
        const err: AppError = new Error('Template de relatório não encontrado.');
        err.status = 500;
        err.code = 'TEMPLATE_NOT_FOUND';
        return next(err);
      }
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
      const templateDuration = Date.now() - templateStart;

      const formatStart = Date.now();
      const pdfData = formatAnalysisForPDF(analysis, inputText);
      htmlTemplate = applyPDFTemplateReplacements(htmlTemplate, buildPDFTemplateReplacements(pdfData));
      const formatDuration = Date.now() - formatStart;
      
      const playwrightStart = Date.now();
      const browser = await chromium.launch();
      let pdfBuffer: Buffer;
      try {
        const page = await browser.newPage();
        
        await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlTemplate)}`, { waitUntil: 'networkidle' });

        pdfBuffer = await page.pdf({
          format: PDF_PAGE_OPTIONS.format,
          printBackground: true,
          displayHeaderFooter: true,
          headerTemplate: getPDFHeaderTemplate(),
          footerTemplate: getPDFFooterTemplate(),
          margin: PDF_PAGE_OPTIONS.margin,
        });
      } finally {
        await browser.close();
      }
      const playwrightDuration = Date.now() - playwrightStart;
      const totalPdfDuration = Date.now() - pdfStart;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId,
        event: 'pdf_generation_complete',
        durations: {
          template: `${templateDuration}ms`,
          format: `${formatDuration}ms`,
          playwright: `${playwrightDuration}ms`,
          total: `${totalPdfDuration}ms`
        }
      }));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${createTimestampedFileName(PDF_FILE_PREFIX, 'pdf')}"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('PDF generation failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      return next(error);
    }
  });

  // LLM analyze route
  app.post('/api/analyze', async (req: Request, res: Response, next: NextFunction) => {
    const analyzeStart = Date.now();
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
        console.error('Analysis failed', {
          framework,
          message: analysisResult.error,
        });
        const err: AppError = new Error(analysisResult.error || 'Não foi possível concluir a análise com IA. Tente novamente.');
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

      const totalAnalyzeDuration = Date.now() - analyzeStart;
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId,
        event: 'analysis_complete',
        framework,
        duration: `${totalAnalyzeDuration}ms`
      }));

      res.json({ success: true, analysis: analysisResult.analysis, id: saved.id });
    } catch (err: any) {
      return next(err);
    }
  });

  // List recent analyses
  app.get('/api/analyses/recent', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || DEFAULT_RECENT_ANALYSES_LIMIT;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const { storage } = await import('./storage');
      const items = await storage.getRecentAnalyses(limit, offset);
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
