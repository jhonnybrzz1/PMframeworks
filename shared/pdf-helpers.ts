export interface PDFData {
  framework: string;
  docName: string;
  currentDate: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  chartImagePath?: string;
}

export interface PDFRequestPayload {
  analysis: unknown;
  inputText?: string;
  timestamp: number;
}

const DEFAULT_CHART_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const MAX_DOC_NAME_LENGTH = 60;
const LIST_MARKER_PATTERN = /^[•\-\*✅❌]\s*/;

export function formatAnalysisForPDF(analysis: any, inputText?: string): PDFData {
  const docName = inputText?.substring(0, MAX_DOC_NAME_LENGTH).replace(/[^\w\s]/g, '').trim() || 'Documento';
  const now = new Date().toLocaleDateString('pt-BR');

  const cleanList = (items?: string[]) =>
    (items || []).map(item => String(item).replace(LIST_MARKER_PATTERN, '').trim()).filter(Boolean);

  return {
    framework: analysis.framework || 'N/A',
    docName,
    currentDate: now,
    summary: analysis.summary || 'N/A',
    strengths: cleanList(analysis.strengths),
    gaps: cleanList(analysis.gaps),
    recommendations: analysis.recommendations || 'N/A',
    chartImagePath: DEFAULT_CHART_IMAGE
  };
}

export function buildPDFRequestPayload(analysis: unknown, inputText?: string): PDFRequestPayload {
  return {
    analysis,
    inputText,
    timestamp: Date.now(),
  };
}

export function createTimestampedFileName(prefix: string, extension: string, timestamp = Date.now()) {
  return `${prefix}-${timestamp}.${extension}`;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPDFListItems(items: string[]): string {
  return items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

export function buildPDFTemplateReplacements(pdfData: PDFData): Record<string, string> {
  return {
    '{{framework}}': escapeHtml(pdfData.framework),
    '{{docName}}': escapeHtml(pdfData.docName),
    '{{currentDate}}': escapeHtml(pdfData.currentDate),
    '{{summary}}': escapeHtml(pdfData.summary),
    '{{strengths}}': renderPDFListItems(pdfData.strengths),
    '{{gaps}}': renderPDFListItems(pdfData.gaps),
    '{{recommendations}}': escapeHtml(pdfData.recommendations),
    '{{chartImagePath}}': escapeHtml(pdfData.chartImagePath || ''),
  };
}

export function applyPDFTemplateReplacements(template: string, replacements: Record<string, string>): string {
  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replace(new RegExp(key, 'g'), value),
    template,
  );
}

export function getPDFHeaderTemplate(): string {
  return '<div style="font-family: Arial, sans-serif; font-size: 10px; color: #555; width: 100%; text-align: center; padding: 0 24mm;">Análise Crítica de Frameworks PM</div>';
}

export function getPDFFooterTemplate(): string {
  return '<div style="font-family: Arial, sans-serif; font-size: 10px; color: #555; width: 100%; padding: 0 24mm; display: flex; justify-content: space-between;"><span>Data: <span class="date"></span></span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>';
}
