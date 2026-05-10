import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@/types/analysis";
import {
  buildPDFRequestPayload,
  createTimestampedFileName,
  formatAnalysisForPDF,
} from "@shared/pdf-helpers";
import { COPY_RESET_DELAY_MS, MARKDOWN_FILE_PREFIX, PDF_FILE_PREFIX } from "@shared/constants";

export function useAnalysisExport(analysis: AnalysisResult | null, inputText?: string) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_RESET_DELAY_MS);
      toast({
        title: "Copiado",
        description: "Conteúdo copiado para a área de transferência.",
      });
    } catch (error) {
      console.error("Copy analysis failed", {
        message: error instanceof Error ? error.message : String(error),
      });
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível acessar a área de transferência do navegador.",
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
    a.download = createTimestampedFileName(MARKDOWN_FILE_PREFIX, 'md');
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
      formatAnalysisForPDF(analysis, inputText);
      const pdfData = buildPDFRequestPayload(analysis, inputText);

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Falha no servidor ao gerar PDF (${response.status}).`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = createTimestampedFileName(PDF_FILE_PREFIX, 'pdf', pdfData.timestamp);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Exportado",
        description: "Análise exportada como PDF estruturado com sucesso.",
      });
    } catch (error) {
      console.error('PDF export failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      toast({
        title: "Erro no PDF",
        description: error instanceof Error ? error.message : "Falha ao gerar o PDF. Tente novamente.",
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
