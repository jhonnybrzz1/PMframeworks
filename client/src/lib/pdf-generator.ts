import { AnalysisResult } from "@/types/analysis";

interface GeneratePDFProps {
  analysis: AnalysisResult;
  inputText?: string;
}

export const generatePDFWithPlaywright = async ({ analysis, inputText }: GeneratePDFProps): Promise<void> => {
  // This function would be called from a server-side context or through an API
  // because Playwright requires a browser environment that isn't available in client-side React
  
  // For now, we'll create the HTML content that would be used by the Playwright script
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
        }
        .header {
          background-color: #2196F3;
          color: white;
          padding: 20px;
          margin-bottom: 20px;
          height: 100px;
        }
        .section {
          margin-bottom: 20px;
          break-inside: avoid;
        }
        .section-header {
          padding: 10px;
          margin-bottom: 10px;
        }
        .blue-header { background-color: #2196F3; }
        .green-header { background-color: #4CAF50; }
        .red-header { background-color: #F44336; }
        .orange-header { background-color: #FF9800; }
        .purple-header { background-color: #9C27B0; }
        .section-content {
          padding: 15px;
          border: 1px solid #ddd;
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
              return `<li>• ${cleanStrength}</li>`;
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
              return `<li>• ${cleanGap}</li>`;
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

  // In a real implementation, you would send this HTML to a server endpoint
  // that uses Playwright to generate the PDF, as Playwright needs a server environment
  // For now, we'll just create a blob and trigger a download
  
  // Since Playwright runs in Node.js environment and not in browser,
  // we'll need to create a temporary solution that works in browser
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analise-frameworks-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};