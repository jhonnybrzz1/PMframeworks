import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FRAMEWORKS, type FrameworkInfo } from "@/types/analysis";
import { ChartLine, Upload, Trash2, Info, Loader2, Star } from "lucide-react";

import { FavoriteFrameworks } from "./analyzer/favorite-frameworks";
import { FrameworkSuggestions } from "./analyzer/framework-suggestions";
import { useFrameworkAnalyzer } from "@/hooks/use-framework-analyzer";

interface FrameworkAnalyzerProps {
  onAnalysisComplete: (analysis: any, inputText: string) => void;
}

export default function FrameworkAnalyzer({ onAnalysisComplete }: FrameworkAnalyzerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    selectedFramework,
    documentText,
    setDocumentText,
    selectedFrameworkInfo,
    favoriteFrameworks,
    analyzeMutation,
    uploadMutation,
    handleFrameworkChange,
    toggleFavorite,
    handleAnalyze,
    handleClear
  } = useFrameworkAnalyzer(onAnalysisComplete);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const frameworksByCategory = FRAMEWORKS.reduce((acc, framework) => {
    if (!acc[framework.category]) {
      acc[framework.category] = [];
    }
    acc[framework.category].push(framework);
    return acc;
  }, {} as Record<string, FrameworkInfo[]>);

  return (
    <div className="space-y-6">
      <FavoriteFrameworks 
        favorites={favoriteFrameworks}
        frameworks={FRAMEWORKS}
        onSelect={handleFrameworkChange}
        onToggle={toggleFavorite}
      />

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Análise de Documento</h2>
            <p className="text-sm text-slate-600">
              Envie seu PRD, pitch, user story ou briefing para análise crítica usando frameworks de PM.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="framework" className="text-sm font-medium text-slate-700">
                Framework de Análise <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedFramework} onValueChange={handleFrameworkChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione um framework..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frameworksByCategory).map(([category, frameworks]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-medium text-slate-500 bg-slate-50">
                        {category}
                      </div>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document" className="text-sm font-medium text-slate-700">
                Documento para Análise <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary-300 transition-colors">
                <div className="text-center mb-4">
                  <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Arraste arquivo .txt aqui ou</p>
                  <Button
                    type="button"
                    variant="link"
                    className="text-primary-500 hover:text-primary-600 font-medium text-sm p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? "Processando..." : "clique para selecionar"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileUpload}
                  />
                </div>
                <Textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Ou cole seu texto aqui (PRD, pitch, user story, briefing)..."
                  className="min-h-32 resize-y"
                />
                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                  <span>{documentText.length} caracteres</span>
                  <span className={documentText.length < 100 ? "text-orange-500" : documentText.length > 8000 ? "text-red-500" : "text-green-600"}>
                    {documentText.length < 100 ? "Muito curto para análise detalhada" : 
                     documentText.length > 8000 ? "Texto muito longo (máx. 8000)" : 
                     "Tamanho ideal"}
                  </span>
                </div>
              </div>
            </div>

            {!selectedFramework && documentText.length > 100 && (
              <FrameworkSuggestions 
                frameworks={FRAMEWORKS}
                onSelect={handleFrameworkChange}
              />
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || !selectedFramework || !documentText.trim() || documentText.length > 8000}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {analyzeMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ChartLine className="mr-2 h-4 w-4" />
                )}
                {analyzeMutation.isPending ? "Analisando..." : "Analisar Documento"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={analyzeMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {analyzeMutation.isPending && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary" />
                    <div>
                      <span className="text-sm font-medium text-blue-900">Analisando documento com IA Mistral...</span>
                      <p className="text-xs text-blue-700 mt-1">Aplicando framework {selectedFrameworkInfo?.name}</p>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    ~30s
                  </div>
                </div>
                <div className="mt-3 bg-blue-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedFrameworkInfo && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <Info className="text-primary mr-2 h-4 w-4" />
                Framework Selecionado
              </div>
              <div>
                <Button size="sm" variant="ghost" onClick={() => selectedFramework && toggleFavorite(selectedFramework)}>
                  {favoriteFrameworks.includes(selectedFramework) ? <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> : <Star className="h-4 w-4 text-slate-400" />}
                </Button>
              </div>
            </h3>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">{selectedFrameworkInfo.name}</h4>
              <p className="text-sm text-slate-600">{selectedFrameworkInfo.description}</p>
              <div className="bg-primary/10 p-3 rounded-lg mt-3">
                <p className="text-sm text-primary-800">
                  <strong>Como será aplicado:</strong> {selectedFrameworkInfo.application}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
