import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getRecentAnalyses } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Settings,
  History,
  ChevronRight,
  ChartLine,
  Target,
  Star
} from "lucide-react";

interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  framework: string;
}

interface AnalysisResultsProps {
  analysis: AnalysisResult | null;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const { data: recentAnalyses = [] } = useQuery({
    queryKey: ["/api/analyses/recent"],
    enabled: true,
  });

  const handleCopy = async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
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

  const handleExport = () => {
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

  const formatListItems = (items: string[]) => {
    return items.map((item, index) => {
      // Remove existing bullet points and clean up
      const cleanItem = item.replace(/^[•\-\*✅❌]\s*/, '').trim();
      return cleanItem;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Análise Crítica</h2>
            {analysis && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(analysis, null, 2), 'full')}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  {copiedSection === 'full' ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          {analysis ? (
            <div className="space-y-6">
              {/* Analysis Section 1: Summary */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <FileText className="text-blue-500 mr-2 h-4 w-4" />
                  1. Resumo do Documento Recebido
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700">{analysis.summary}</p>
                </div>
              </div>

              {/* Analysis Section 2: Strengths */}
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  2. Pontos Fortes segundo o framework
                </h3>
                <div className="prose prose-sm max-w-none">
                  <ul className="text-slate-700 space-y-1">
                    {formatListItems(analysis.strengths).map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✅</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Analysis Section 3: Gaps */}
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <AlertTriangle className="text-red-500 mr-2 h-4 w-4" />
                  3. Lacunas ou Pontos Fracos
                </h3>
                <div className="prose prose-sm max-w-none">
                  <ul className="text-slate-700 space-y-1">
                    {formatListItems(analysis.gaps).map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">❌</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Analysis Section 4: Recommendations */}
              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <Lightbulb className="text-amber-500 mr-2 h-4 w-4" />
                  4. Recomendações Práticas
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div className="text-slate-700 space-y-3">
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <div className="whitespace-pre-wrap">{analysis.recommendations}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Section 5: Framework Used */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <Settings className="text-purple-500 mr-2 h-4 w-4" />
                  5. Framework Utilizado
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div className="text-slate-700">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="whitespace-pre-wrap">{analysis.framework}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartLine className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma análise ainda</h3>
              <p className="text-slate-500">
                Selecione um framework e adicione um documento para começar a análise.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
            <History className="text-slate-600 mr-2 h-4 w-4" />
            Análises Recentes
          </h3>
          {recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map((recentAnalysis: any, index: number) => {
                const icons = [ChartLine, Target, Star];
                const colors = ["primary", "green", "amber"];
                const IconComponent = icons[index % icons.length];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div
                    key={recentAnalysis.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-${colorClass}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`text-${colorClass}-600 h-4 w-4`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {recentAnalysis.framework.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(recentAnalysis.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 h-4 w-4" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Nenhuma análise recente encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
