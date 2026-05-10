import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface AnalysisHeaderProps {
  framework: string;
}

export function AnalysisHeader({ framework }: AnalysisHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <CardTitle className="text-xl font-bold text-slate-900">Análise Crítica</CardTitle>
        <div className="text-sm text-slate-600 mt-1 flex items-center gap-2">
          <span>Análise baseada no framework</span>
          <Badge variant="secondary">{framework}</Badge>
        </div>
      </div>

      <div className="flex space-x-2">
        <div className="text-xs text-slate-500 mr-4 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
