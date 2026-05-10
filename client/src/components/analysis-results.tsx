import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { ChartLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { AnalysisHeader } from "./analysis/analysis-header";
import { AnalysisContent } from "./analysis/analysis-content";
import { ExportButtons } from "./analysis/export-buttons";
import { RecentAnalysesList } from "./analysis/recent-analyses-list";
import { useAnalysisExport } from "@/hooks/use-analysis-export";

interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  framework: string;
}

interface AnalysisResultsProps {
  analysis: AnalysisResult | null;
  inputText?: string;
}

export default function AnalysisResults({ analysis, inputText }: AnalysisResultsProps) {
  const { data: recentAnalyses = [] } = useQuery({
    queryKey: ["/api/analyses/recent"],
    enabled: true,
  }) as { data: any[] };

  const {
    isCopied,
    handleCopy,
    handleExportMarkdown,
    handleExportPDF
  } = useAnalysisExport(analysis, inputText);

  return (
    <div className="space-y-6">
      {analysis ? (
        <div id="analysis-content">
          <Tabs defaultValue="analysis" className="w-full">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <AnalysisHeader framework={analysis.framework} />
                  <ExportButtons 
                    onCopy={handleCopy}
                    onExportMarkdown={handleExportMarkdown}
                    onExportPDF={handleExportPDF}
                    isCopied={isCopied}
                  />
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
                <AnalysisContent analysis={analysis} />
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

      <RecentAnalysesList analyses={recentAnalyses} />
    </div>
  );
}
