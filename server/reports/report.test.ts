
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes'; 
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { PDFImage } from 'pdf-image';
import fs from 'fs/promises';
import path from 'path';

// Configurar o matcher de snapshot de imagem
expect.extend({ toMatchImageSnapshot });

// Configurar um app Express para o teste
const app = express();
app.use(express.json());

// Armazenar a instância do servidor para fechar depois
let server;

beforeAll(async () => {
  server = await registerRoutes(app);
});

describe('PDF Generation Visual Regression Test', () => {
  it('should generate a PDF that matches the visual snapshot', async () => {
    // 1. Mock dos dados de análise
    const mockAnalysisData = {
      analysis: {
        framework: 'Exemplo Framework',
        summary: 'Este é um resumo executivo da análise. O documento demonstra um bom entendimento dos princípios básicos, mas carece de profundidade em áreas críticas.',
        strengths: ['Clareza na definição de objetivos.', 'Boa estrutura inicial de projeto.'],
        gaps: ['Falta de métricas de sucesso claras.', 'Análise de risco superficial.'],
        recommendations: 'Recomenda-se a implementação de um sistema de OKRs para monitorar o progresso e a realização de workshops de análise de risco com stakeholders.'
      },
      inputText: 'Documento de Exemplo para Teste de PDF'
    };

    // 2. Fazer a requisição para a API
    const response = await request(app)
      .post('/api/generate-pdf')
      .send(mockAnalysisData);

    // Verificar se a resposta é um PDF
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');

    // 3. Salvar o PDF gerado
    const pdfPath = path.join(__dirname, 'test-report.pdf');
    await fs.writeFile(pdfPath, response.body);

    // 4. Converter o PDF para Imagem
    const pdfImage = new PDFImage(pdfPath);
    const imagePaths = await pdfImage.convertFile();
    const imagePath = imagePaths[0]; // Pegar a primeira página

    // 5. Ler a imagem e comparar com o snapshot
    const image = await fs.readFile(imagePath);
    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.02, // 2% de tolerância a diferenças
      failureThresholdType: 'percent'
    });

    // 6. Limpar arquivos gerados
    await fs.unlink(pdfPath);
    await fs.unlink(imagePath);

  }, { timeout: 20000 }); // Aumentar o timeout para o teste
});
