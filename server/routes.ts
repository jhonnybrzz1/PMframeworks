import express from "express";
import type { Request, Response } from "express";
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(__dirname);

export async function registerRoutes(app: express.Application) {
  // Rota para gerar PDF com Playwright (REFATORADA)
  app.post('/api/generate-pdf', async (req: Request, res: Response) => {
    try {
      const { chromium } = await import('playwright');
      const { analysis, inputText } = req.body;

      if (!analysis) {
        return res.status(400).json({ error: 'Dados de análise são obrigatórios' });
      }

      // --- 1. Ler o Template HTML ---
      const templatePath = path.join(__dirname, 'reports', 'templates', 'analise.html');
      let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

      // --- 2. Popular o Template com Dados Dinâmicos ---
      const docName = inputText?.substring(0, 60).replace(/[^\w\s]/g, '').trim() || 'Documento';
      const now = new Date().toLocaleDateString('pt-BR');
      
      const strengthsHtml = analysis.strengths?.map((s: string) => `<li>${s.replace(/^[•\-\*✅❌]\s*/, '').trim()}</li>`).join('') || '';
      const gapsHtml = analysis.gaps?.map((g: string) => `<li>${g.replace(/^[•\-\*✅❌]\s*/, '').trim()}</li>`).join('') || '';

      // Simulação de um gráfico estático
      // Em um cenário real, este seria o path para um gráfico gerado dinamicamente (ex: /tmp/chart-123.png)
      const chartImagePath = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 pixel transparente

      const replacements = {
        '{{framework}}': analysis.framework || 'N/A',
        '{{docName}}': docName,
        '{{currentDate}}': now,
        '{{summary}}': analysis.summary || 'N/A',
        '{{strengths}}': strengthsHtml,
        '{{gaps}}': gapsHtml,
        '{{recommendations}}': analysis.recommendations || 'N/A',
        '{{chartImagePath}}': chartImagePath
      };

      for (const [key, value] of Object.entries(replacements)) {
        htmlTemplate = htmlTemplate.replace(new RegExp(key, 'g'), value);
      }
      
      // --- 3. Gerar o PDF com Playwright ---
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Usar data URI para carregar o HTML dinâmico sem precisar de um arquivo temporário
      await page.goto(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlTemplate)}`, { waitUntil: 'networkidle' });

      // Template para o cabeçalho e rodapé
      const headerTemplate = `
        <div style="font-family: Arial, sans-serif; font-size: 10px; color: #555; width: 100%; text-align: center; padding: 0 24mm;">
          Análise Crítica de Frameworks PM
        </div>`;
      
      const footerTemplate = `
        <div style="font-family: Arial, sans-serif; font-size: 10px; color: #555; width: 100%; padding: 0 24mm; display: flex; justify-content: space-between;">
          <span>Data: <span class="date"></span></span>
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>`;

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: {
          top: '40px',  // Espaço para o cabeçalho
          bottom: '40px', // Espaço para o rodapé
          left: '24mm',
          right: '24mm'
        }
      });
      
      await browser.close();

      // --- 4. Enviar Resposta ---
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="analise-frameworks-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ error: 'Erro ao gerar PDF', details: (error as Error).message });
    }
  });

  // LLM analyze route
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const { analyzeRequestSchema } = await import('@shared/schema');
      const parse = analyzeRequestSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ success: false, error: parse.error.errors.map(e => e.message).join(', ') });
      }

      const { framework, inputText } = parse.data;
      const { analyzeWithLLM } = await import('./llm');
      const analysisResult = await analyzeWithLLM(framework, inputText);

      if (!analysisResult.success) {
        return res.status(500).json({ success: false, error: analysisResult.error });
      }

      // store analysis in DB/storage
      if (!analysisResult.analysis) {
        return res.status(500).json({ success: false, error: 'LLM não retornou análise válida.' });
      }
      const { storage } = await import('./storage');
      const saved = await storage.createAnalysis({ framework, inputText, analysis: analysisResult.analysis as any });

      res.json({ success: true, analysis: analysisResult.analysis, id: saved.id });
    } catch (err: any) {
      console.error('Error in /api/analyze', err);
      res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // List recent analyses (used by client)
  app.get('/api/analyses/recent', async (_req: Request, res: Response) => {
    try {
      const { storage } = await import('./storage');
      const items = await storage.getRecentAnalyses(10);
      res.json(items);
    } catch (err: any) {
      console.error('Error in /api/analyses/recent', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // Get analysis by id
  app.get('/api/analyses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
      const { storage } = await import('./storage');
      const item = await storage.getAnalysis(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err: any) {
      console.error('Error in /api/analyses/:id', err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  const server = await import("node:http").then(m => m.createServer(app));
  return server;
}