import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  framework: string;
}

export function useAnalysisExport(analysis: AnalysisResult | null, inputText?: string) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Copiado",
        description: "Conteúdo copiado para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const handleExportMarkdown = () => {
    if (!analysis) return;

    const content = `
# Análise Crítica - ${analysis.framework}

## 1. Resumo do Documento Recebido
${analysis.summary}

## 2. Pontos Fortes segundo o framework
${analysis.strengths.map(strength => `• ${strength}`).join('\n')}

## 3. Lacunas ou Pontos Fracos
${analysis.gaps.map(gap => `• ${gap}`).join('\n')}

## 4. Recomendações Práticas
${analysis.recommendations}

## 5. Framework Utilizado
${analysis.framework}

---
Gerado por Frameworks - Análise Crítica para PMs
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Análise exportada como arquivo Markdown.",
    });
  };

  const handleExportPDF = async () => {
    if (!analysis) return;

    try {
      const pdfData = {
        analysis,
        inputText,
        timestamp: Date.now()
      };

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF no servidor');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analise-frameworks-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Exportado",
        description: "Análise exportada como PDF estruturado com sucesso.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Erro no PDF",
        description: "Falha ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    isCopied,
    handleCopy,
    handleExportMarkdown,
    handleExportPDF
  };
}
