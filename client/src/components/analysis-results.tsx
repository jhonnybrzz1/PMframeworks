import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { ChartLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/types/analysis";

import { AnalysisResultsHeader } from "./analysis/analysis-results-header";
import { ResultsTable } from "./analysis/results-table";
import { RecentAnalysesList } from "./analysis/recent-analyses-list";
import { useAnalysisExport } from "@/hooks/use-analysis-export";

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
                <AnalysisResultsHeader
                  framework={analysis.framework}
                  exportActions={{
                    onCopy: handleCopy,
                    onExportMarkdown: handleExportMarkdown,
                    onExportPDF: handleExportPDF,
                  }}
                  isCopied={isCopied}
                />
              </CardHeader>

              <CardContent className="pt-0">
                <ResultsTable analysis={analysis} />
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
