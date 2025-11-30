import React from "react";

interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  framework: string;
}

interface PDFLayoutProps {
  analysis: AnalysisResult;
  inputText?: string;
  docName?: string;
}

const PDFLayout: React.FC<PDFLayoutProps> = ({ analysis, inputText, docName }) => {
  const getDocumentName = () => {
    return docName || inputText?.substring(0, 60).replace(/[^\w\s]/g, '').trim() || 'Documento';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 mb-8" style={{ height: '100px' }}>
        <h1 className="text-2xl font-bold mb-2">Análise Crítica - Frameworks PM</h1>
        <p className="text-lg">Framework: {analysis.framework}</p>
        <p>Documento: {getDocumentName()}...</p>
      </div>

      {/* Summary Section */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <div className="bg-blue-600 text-white p-3 mb-4">
          <h2 className="text-lg font-bold">1. Resumo do Conteúdo Recebido</h2>
        </div>
        <div className="p-4 border border-blue-200">
          <p className="text-gray-800 leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      {/* Strengths Section */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <div className="bg-green-600 text-white p-3 mb-4">
          <h2 className="text-lg font-bold">2. Pontos Fortes segundo o framework</h2>
        </div>
        <div className="p-4 border border-green-200">
          <ul className="list-disc pl-5 space-y-2">
            {analysis.strengths.map((strength, index) => {
              const cleanStrength = strength.replace(/^[•\-\*✅❌]\s*/, '').trim();
              return (
                <li key={index} className="text-gray-800 leading-relaxed">• {cleanStrength}</li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Gaps Section */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <div className="bg-red-600 text-white p-3 mb-4">
          <h2 className="text-lg font-bold">3. Lacunas ou Pontos Fracos</h2>
        </div>
        <div className="p-4 border border-red-200">
          <ul className="list-disc pl-5 space-y-2">
            {analysis.gaps.map((gap, index) => {
              const cleanGap = gap.replace(/^[•\-\*✅❌]\s*/, '').trim();
              return (
                <li key={index} className="text-gray-800 leading-relaxed">• {cleanGap}</li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <div className="bg-orange-500 text-white p-3 mb-4">
          <h2 className="text-lg font-bold">4. Recomendações Práticas</h2>
        </div>
        <div className="p-4 border border-orange-200">
          <p className="text-gray-800 leading-relaxed">{analysis.recommendations}</p>
        </div>
      </div>

      {/* Framework Section */}
      <div className="mb-8" style={{ breakInside: 'avoid' }}>
        <div className="bg-purple-600 text-white p-3 mb-4">
          <h2 className="text-lg font-bold">5. Framework Utilizado</h2>
        </div>
        <div className="p-4 border border-purple-200">
          <p className="text-gray-800">{analysis.framework}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
        <p>Gerado por Frameworks - Análise Crítica para PMs</p>
        <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  );
};

export default PDFLayout;