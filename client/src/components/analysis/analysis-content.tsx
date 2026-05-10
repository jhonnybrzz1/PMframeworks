import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  FileText, 
  Lightbulb, 
  Settings 
} from "lucide-react";

interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  framework: string;
}

interface AnalysisContentProps {
  analysis: AnalysisResult;
}

export function AnalysisContent({ analysis }: AnalysisContentProps) {
  const formatListItems = (items: string[]) => {
    return items.map((item) => {
      return item.replace(/^[•\-\*✅❌]\s*/, '').trim();
    });
  };

  return (
    <>
      <TabsContent value="analysis" className="mt-0">
        <div className="space-y-6">
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
    </>
  );
}
