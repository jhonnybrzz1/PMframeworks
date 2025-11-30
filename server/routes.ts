import express from "express";
import type { Request, Response } from "express";
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(__dirname);

export async function registerRoutes(app: express.Application) {
  // Rota para gerar PDF com Playwright
  app.post('/api/generate-pdf', async (req: Request, res: Response) => {
    try {
      // Importar Playwright dinamicamente
      const { chromium } = await import('playwright');
      
      const { analysis, inputText } = req.body;
      
      if (!analysis) {
        return res.status(400).json({ error: 'Dados de análise são obrigatórios' });
      }

      // Gerar HTML para o PDF
      const docName = inputText?.substring(0, 60).replace(/[^\w\s]/g, '').trim() || 'Documento';
      const now = new Date().toLocaleDateString('pt-BR');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Análise Crítica - Frameworks PM</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              background-color: #2196F3;
              color: white;
              padding: 20px;
              margin-bottom: 20px;
              height: auto;
              text-align: center;
            }
            .section {
              margin-bottom: 20px;
              break-inside: avoid;
            }
            .section-header {
              padding: 10px;
              margin-bottom: 10px;
              color: white;
            }
            .blue-header { background-color: #2196F3; }
            .green-header { background-color: #4CAF50; }
            .red-header { background-color: #F44336; }
            .orange-header { background-color: #FF9800; }
            .purple-header { background-color: #9C27B0; }
            .section-content {
              padding: 15px;
              border: 1px solid #ddd;
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 0.8em;
              color: #666;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 8px;
            }
            h1, h2 {
              margin-top: 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Análise Crítica - Frameworks PM</h1>
            <p>Framework: ${analysis.framework}</p>
            <p>Documento: ${docName}...</p>
          </div>

          <div class="section">
            <div class="section-header blue-header">
              <h2>1. Resumo do Conteúdo Recebido</h2>
            </div>
            <div class="section-content">
              <p>${analysis.summary}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-header green-header">
              <h2>2. Pontos Fortes segundo o framework</h2>
            </div>
            <div class="section-content">
              <ul>
                ${analysis.strengths.map((strength) => {
                  const cleanStrength = strength.replace(/^[•\-\*✅❌]\s*/, '').trim();
                  return '<li>• ' + cleanStrength + '</li>';
                }).join('')}
              </ul>
            </div>
          </div>

          <div class="section">
            <div class="section-header red-header">
              <h2>3. Lacunas ou Pontos Fracos</h2>
            </div>
            <div class="section-content">
              <ul>
                ${analysis.gaps.map((gap) => {
                  const cleanGap = gap.replace(/^[•\-\*✅❌]\s*/, '').trim();
                  return '<li>• ' + cleanGap + '</li>';
                }).join('')}
              </ul>
            </div>
          </div>

          <div class="section">
            <div class="section-header orange-header">
              <h2>4. Recomendações Práticas</h2>
            </div>
            <div class="section-content">
              <p>${analysis.recommendations}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-header purple-header">
              <h2>5. Framework Utilizado</h2>
            </div>
            <div class="section-content">
              <p>${analysis.framework}</p>
            </div>
          </div>

          <div class="footer">
            <p>Gerado por Frameworks - Análise Crítica para PMs</p>
            <p>Data: ${now}</p>
          </div>
        </body>
        </html>
      `;

      // Iniciar o navegador
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Definir o conteúdo HTML
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });
      
      // Gerar o PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      // Fechar o navegador
      await browser.close();

      // Enviar o PDF como resposta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="analise-frameworks-' + Date.now() + '.pdf"');
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ error: 'Erro ao gerar PDF', details: (error as Error).message });
    }
  });
  
  const server = await import("node:http").then(m => m.createServer(app));
  return server;
}