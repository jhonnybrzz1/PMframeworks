import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getRecentAnalyses } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  Star,
  FileDown,
  Eye,
  Calendar,
  User
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
  }) as { data: any[] };

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
      const analysisElement = document.getElementById('analysis-content');
      if (!analysisElement) return;

      // Temporarily show all content for PDF generation
      const tabsElements = analysisElement.querySelectorAll('[data-state="inactive"]');
      tabsElements.forEach(el => {
        (el as HTMLElement).style.display = 'block';
      });

      const canvas = await html2canvas(analysisElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
      });

      // Restore original display
      tabsElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`analise-frameworks-${Date.now()}.pdf`);

      toast({
        title: "PDF Exportado",
        description: "Análise exportada como arquivo PDF com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
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
      {analysis ? (
        <div id="analysis-content">
          <Tabs defaultValue="analysis" className="w-full">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Análise Crítica</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Análise baseada no framework <Badge variant="secondary">{analysis.framework}</Badge>
                    </p>
                  </div>
                  
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
                      onClick={handleExportMarkdown}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      MD
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    >
                      <FileDown className="mr-1 h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>

                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="analysis" className="text-xs">Visão Geral</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">Resumo</TabsTrigger>
                  <TabsTrigger value="strengths" className="text-xs">Pontos Fortes</TabsTrigger>
                  <TabsTrigger value="gaps" className="text-xs">Lacunas</TabsTrigger>
                  <TabsTrigger value="recommendations" className="text-xs">Recomendações</TabsTrigger>
                  <TabsTrigger value="framework" className="text-xs">Framework</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="pt-0">
                <TabsContent value="analysis" className="mt-0">
                  <div className="space-y-6">
                    {/* Quick Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-medium text-green-700">Pontos Fortes</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600 mt-2">{analysis.strengths.length}</p>
                          <p className="text-sm text-slate-600">itens identificados</p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="font-medium text-red-700">Lacunas</span>
                          </div>
                          <p className="text-2xl font-bold text-red-600 mt-2">{analysis.gaps.length}</p>
                          <p className="text-sm text-slate-600">pontos a melhorar</p>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-blue-500" />
                            <span className="font-medium text-blue-700">Status</span>
                          </div>
                          <p className="text-lg font-bold text-blue-600 mt-2">Analisado</p>
                          <p className="text-sm text-slate-600">pronto para ação</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Complete Analysis Preview */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Resumo Executivo
                        </h4>
                        <p className="text-blue-800 text-sm line-clamp-3">{analysis.summary}</p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Recomendação Principal
                        </h4>
                        <p className="text-amber-800 text-sm line-clamp-2">{analysis.recommendations}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="mt-0">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <FileText className="text-blue-500 mr-2 h-5 w-5" />
                        1. Resumo do Documento Recebido
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-slate max-w-none">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="strengths" className="mt-0">
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                        2. Pontos Fortes segundo o framework
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {formatListItems(analysis.strengths).map((strength, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-green-500 mt-1 text-lg">✅</span>
                            <div className="flex-1">
                              <p className="text-slate-700 leading-relaxed">{strength}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="gaps" className="mt-0">
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />
                        3. Lacunas ou Pontos Fracos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {formatListItems(analysis.gaps).map((gap, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-red-500 mt-1 text-lg">❌</span>
                            <div className="flex-1">
                              <p className="text-slate-700 leading-relaxed">{gap}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-0">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Lightbulb className="text-amber-500 mr-2 h-5 w-5" />
                        4. Recomendações Práticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                        <div className="prose prose-slate max-w-none">
                          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{analysis.recommendations}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="framework" className="mt-0">
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Settings className="text-purple-500 mr-2 h-5 w-5" />
                        5. Framework Utilizado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <div className="prose prose-slate max-w-none">
                          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{analysis.framework}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <ChartLine className="mx-auto h-16 w-16 text-slate-300 mb-6" />
              <h3 className="text-xl font-medium text-slate-900 mb-3">Nenhuma análise ainda</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Selecione um framework e adicione um documento para começar a análise crítica baseada em IA.
              </p>
              <div className="flex justify-center space-x-2">
                <Badge variant="outline">Business Model Canvas</Badge>
                <Badge variant="outline">Lean Canvas</Badge>
                <Badge variant="outline">RICE Score</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <History className="text-slate-600 mr-2 h-5 w-5" />
            Análises Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map((recentAnalysis: any, index: number) => {
                const icons = [ChartLine, Target, Star];
                const colors = ["blue", "green", "amber"];
                const IconComponent = icons[index % icons.length];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div
                    key={recentAnalysis.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 bg-${colorClass}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`text-${colorClass}-600 h-5 w-5`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {recentAnalysis.framework.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center text-xs text-slate-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(recentAnalysis.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <User className="mr-1 h-3 w-3" />
                            Análise PM
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-400 h-5 w-5" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="mx-auto h-8 w-8 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Nenhuma análise recente encontrada.</p>
              <p className="text-xs text-slate-400 mt-1">Suas análises aparecerão aqui após serem processadas.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
