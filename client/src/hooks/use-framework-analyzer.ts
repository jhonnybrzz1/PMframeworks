import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { analyzeDocument, uploadFile } from "@/lib/api";
import { FRAMEWORKS, type FrameworkInfo } from "@/types/analysis";

export function useFrameworkAnalyzer(onAnalysisComplete: (analysis: any, inputText: string) => void) {
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [documentText, setDocumentText] = useState<string>("");
  const [selectedFrameworkInfo, setSelectedFrameworkInfo] = useState<FrameworkInfo | null>(null);
  
  const [favoriteFrameworks, setFavoriteFrameworks] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteFrameworks');
    return saved ? JSON.parse(saved) : [];
  });

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

  const toggleFavorite = (frameworkId: string) => {
    const isNowFavorite = !favoriteFrameworks.includes(frameworkId);
    const newFavorites = isNowFavorite
      ? [...favoriteFrameworks, frameworkId]
      : favoriteFrameworks.filter(id => id !== frameworkId);

    setFavoriteFrameworks(newFavorites);
    localStorage.setItem('favoriteFrameworks', JSON.stringify(newFavorites));
    toast({
      title: isNowFavorite ? "Adicionado aos favoritos" : "Removido dos favoritos",
      description: "Framework atualizado em seus favoritos.",
    });
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

  const handleClear = () => {
    setDocumentText("");
    setSelectedFramework("");
    setSelectedFrameworkInfo(null);
  };

  return {
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
  };
}
