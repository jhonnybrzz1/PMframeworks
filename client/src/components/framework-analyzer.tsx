import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocument, uploadFile } from "@/lib/api";
import { FRAMEWORKS, type FrameworkInfo } from "@/types/analysis";
import { ChartLine, Upload, Trash2, Info, Loader2 } from "lucide-react";

interface FrameworkAnalyzerProps {
  onAnalysisComplete: (analysis: any, inputText: string) => void;
}

export default function FrameworkAnalyzer({ onAnalysisComplete }: FrameworkAnalyzerProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [documentText, setDocumentText] = useState<string>("");
  const [selectedFrameworkInfo, setSelectedFrameworkInfo] = useState<FrameworkInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: analyzeDocument,
    onSuccess: (data) => {
      if (data.success && data.analysis) {
        onAnalysisComplete(data.analysis, documentText);
        toast({
          title: "Análise concluída",
          description: "Documento analisado com sucesso!",
        });
      } else {
        toast({
          title: "Erro na análise",
          description: data.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro na análise",
        description: "Erro ao processar documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      setDocumentText(data.text);
      toast({
        title: "Arquivo carregado",
        description: "Conteúdo do arquivo foi adicionado ao campo de texto.",
      });
    },
    onError: () => {
      toast({
        title: "Erro no upload",
        description: "Erro ao processar arquivo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleFrameworkChange = (value: string) => {
    setSelectedFramework(value);
    const framework = FRAMEWORKS.find(f => f.id === value);
    setSelectedFrameworkInfo(framework || null);
  };

  const handleAnalyze = () => {
    if (!selectedFramework) {
      toast({
        title: "Framework obrigatório",
        description: "Selecione um framework para análise.",
        variant: "destructive",
      });
      return;
    }

    if (!documentText.trim()) {
      toast({
        title: "Documento obrigatório",
        description: "Adicione o texto do documento para análise.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      framework: selectedFramework,
      inputText: documentText,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleClear = () => {
    setDocumentText("");
    setSelectedFramework("");
    setSelectedFrameworkInfo(null);
  };

  // Group frameworks by category
  const frameworksByCategory = FRAMEWORKS.reduce((acc, framework) => {
    if (!acc[framework.category]) {
      acc[framework.category] = [];
    }
    acc[framework.category].push(framework);
    return acc;
  }, {} as Record<string, FrameworkInfo[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Análise de Documento</h2>
            <p className="text-sm text-slate-600">
              Envie seu PRD, pitch, user story ou briefing para análise crítica usando frameworks de PM.
            </p>
          </div>

          <div className="space-y-6">
            {/* Framework Selection */}
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

            {/* Document Input */}
            <div>
              <Label htmlFor="document" className="text-sm font-medium text-slate-700">
                Documento para Análise <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary-300 transition-colors">
                <div className="text-center mb-4">
                  <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Arraste arquivos aqui ou</p>
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
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                  />
                </div>
                <Textarea
                  value={documentText}
                  onChange={(e) => setDocumentText(e.target.value)}
                  placeholder="Ou cole seu texto aqui (PRD, pitch, user story, briefing)..."
                  className="min-h-32 resize-y"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending || !selectedFramework || !documentText.trim()}
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

            {/* Loading State */}
            {analyzeMutation.isPending && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-blue-800">Analisando documento com IA...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Framework Info Card */}
      {selectedFrameworkInfo && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <Info className="text-primary mr-2 h-4 w-4" />
              Framework Selecionado
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
