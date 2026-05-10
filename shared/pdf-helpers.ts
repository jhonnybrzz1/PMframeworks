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

export function formatAnalysisForPDF(analysis: any, inputText?: string): PDFData {
  const docName = inputText?.substring(0, 60).replace(/[^\w\s]/g, '').trim() || 'Documento';
  const now = new Date().toLocaleDateString('pt-BR');

  const cleanList = (items: string[]) => 
    (items || []).map(item => item.replace(/^[•\-\*✅❌]\s*/, '').trim());

  return {
    framework: analysis.framework || 'N/A',
    docName,
    currentDate: now,
    summary: analysis.summary || 'N/A',
    strengths: cleanList(analysis.strengths),
    gaps: cleanList(analysis.gaps),
    recommendations: analysis.recommendations || 'N/A',
    chartImagePath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
  };
}
