import React from "react";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { ExportButtons } from "./export-buttons";

interface ExportActions {
  onCopy: () => void;
  onExportMarkdown: () => void;
  onExportPDF: () => void;
}

interface AnalysisResultsHeaderProps {
  framework: string;
  exportActions: ExportActions;
  isCopied: boolean;
}

export function AnalysisResultsHeader({ framework, exportActions, isCopied }: AnalysisResultsHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">Análise Crítica</CardTitle>
          <div className="text-sm text-slate-600 mt-1 flex items-center gap-2">
            <span>Análise baseada no framework</span>
            <Badge variant="secondary">{framework}</Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-xs text-slate-500 mr-4 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString('pt-BR')}
          </div>
          <ExportButtons
            onCopy={exportActions.onCopy}
            onExportMarkdown={exportActions.onExportMarkdown}
            onExportPDF={exportActions.onExportPDF}
            isCopied={isCopied}
          />
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
    </>
  );
}
