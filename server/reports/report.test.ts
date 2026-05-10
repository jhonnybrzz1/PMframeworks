import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';

const app = express();
app.use(express.json());

let server: any;

beforeAll(async () => {
  server = await registerRoutes(app);
});

describe('POST /api/generate-pdf', () => {
  it('should generate a PDF with valid analysis data', async () => {
    const mockAnalysisData = {
      analysis: {
        framework: 'Test Framework',
        summary: 'Este é um resumo executivo da análise.',
        strengths: ['Ponto forte 1', 'Ponto forte 2'],
        gaps: ['Gap identificado 1', 'Gap identificado 2'],
        recommendations: 'Recomendações para melhoria do documento.'
      },
      inputText: 'Documento de teste para geração de PDF'
    };

    const response = await request(app)
      .post('/api/generate-pdf')
      .send(mockAnalysisData);

    // Contract: status 200
    expect(response.status).toBe(200);

    // Contract: correct content-type
    expect(response.headers['content-type']).toBe('application/pdf');

    // Contract: non-empty PDF buffer (minimum size check)
    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(1000); // A valid PDF should be > 1KB

    // Contract: PDF magic bytes (starts with %PDF-)
    const pdfHeader = response.body.slice(0, 5).toString('utf-8');
    expect(pdfHeader).toBe('%PDF-');
  }, 30000);

  it('should return 400 when analysis data is missing', async () => {
    const response = await request(app)
      .post('/api/generate-pdf')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should handle analysis with special characters', async () => {
    const mockAnalysisData = {
      analysis: {
        framework: 'Framework <Test> & "Quotes"',
        summary: 'Resumo com caracteres especiais: <script>alert("xss")</script>',
        strengths: ['Força com & ampersand', 'Força com <tags>'],
        gaps: ['Gap com "aspas"'],
        recommendations: "Recomendação com 'apóstrofo'"
      },
      inputText: 'Texto com <html> & caracteres "especiais"'
    };

    const response = await request(app)
      .post('/api/generate-pdf')
      .send(mockAnalysisData);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
    expect(response.body.length).toBeGreaterThan(1000);
  }, 30000);
});

describe('POST /api/upload', () => {
  it('should accept .txt files and return text content', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('Conteúdo do arquivo de teste'), {
        filename: 'test.txt',
        contentType: 'text/plain'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('text');
    expect(response.body.text).toBe('Conteúdo do arquivo de teste');
  });

  it('should return 501 for unsupported file formats', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('fake pdf content'), {
        filename: 'test.pdf',
        contentType: 'application/pdf'
      });

    expect(response.status).toBe(501);
    expect(response.body).toHaveProperty('code', 'UNSUPPORTED_FORMAT');
    expect(response.body).toHaveProperty('supportedFormats');
    expect(response.body.supportedFormats).toContain('.txt');
  });

  it('should return 400 when no file is provided', async () => {
    const response = await request(app)
      .post('/api/upload')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'NO_FILE');
  });

  it('should return 400 for empty files', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from(''), {
        filename: 'empty.txt',
        contentType: 'text/plain'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'EMPTY_FILE');
  });
});

describe('POST /api/analyze', () => {
  it('should return 400 for invalid request body', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 when framework is missing', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ inputText: 'Some text' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should return 400 when inputText is missing', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ framework: 'lean-canvas' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
