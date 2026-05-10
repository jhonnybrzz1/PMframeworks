import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, User, ChevronRight, ChartLine, Target, Star } from "lucide-react";

interface RecentAnalysesListProps {
  analyses: any[];
}

export function RecentAnalysesList({ analyses }: RecentAnalysesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <History className="text-slate-600 mr-2 h-5 w-5" />
          Análises Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analyses.length > 0 ? (
          <div className="space-y-3">
            {analyses.map((recentAnalysis: any, index: number) => {
              const icons = [ChartLine, Target, Star];
              const colors = ["blue", "green", "amber"];
              const IconComponent = icons[index % icons.length];
              const colorClass = colors[index % colors.length];

              // Basic mapping for colors (tailwind classes need to be full strings usually, but let's assume these are safe for now or use a mapping)
              const bgColor = {
                blue: "bg-blue-100",
                green: "bg-green-100",
                amber: "bg-amber-100"
              }[colorClass as "blue" | "green" | "amber"];
              
              const textColor = {
                blue: "text-blue-600",
                green: "text-green-600",
                amber: "text-amber-600"
              }[colorClass as "blue" | "green" | "amber"];

              return (
                <div
                  key={recentAnalysis.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`${textColor} h-5 w-5`} />
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
  );
}
