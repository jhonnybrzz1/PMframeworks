import { apiRequest } from "./queryClient";

export interface AnalyzeRequest {
  framework: string;
  inputText: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: {
    summary: string;
    strengths: string[];
    gaps: string[];
    recommendations: string;
    framework: string;
  };
  error?: string;
}

export const analyzeDocument = async (data: AnalyzeRequest): Promise<AnalyzeResponse> => {
  const response = await apiRequest("POST", "/api/analyze", data);
  return response.json();
};

export interface UploadError {
  error: string;
  code: string;
  supportedFormats?: string[];
}

export const uploadFile = async (file: File): Promise<{ text: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData: UploadError = await response.json().catch(() => ({
      error: "Erro ao fazer upload do arquivo",
      code: "UNKNOWN"
    }));

    throw new Error(errorData.error);
  }

  return response.json();
};

export const getRecentAnalyses = async () => {
  const response = await fetch("/api/analyses/recent");
  if (!response.ok) {
    throw new Error("Erro ao buscar análises recentes");
  }
  return response.json();
};
