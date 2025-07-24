import { useState } from "react";
import FrameworkAnalyzer from "@/components/framework-analyzer";
import AnalysisResults from "@/components/analysis-results";
import { ChartLine, HelpCircle, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string;
  framework: string;
}

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [currentInputText, setCurrentInputText] = useState<string>("");

  const handleAnalysisComplete = (analysis: AnalysisResult, inputText: string) => {
    setCurrentAnalysis(analysis);
    setCurrentInputText(inputText);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="text-primary-foreground text-sm" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Frameworks</h1>
                <p className="text-xs text-slate-500">Análise Crítica para PMs</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <UserCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-5">
            <FrameworkAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-7">
            <AnalysisResults analysis={currentAnalysis} inputText={currentInputText} />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Action (Hidden on desktop) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <ChartLine className="mr-2 h-4 w-4" />
          Analisar Documento
        </Button>
      </div>
    </div>
  );
}
