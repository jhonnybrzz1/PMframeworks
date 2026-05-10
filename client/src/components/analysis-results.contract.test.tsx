import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { analysisFixture, inputTextFixture } from "@shared/fixtures/analysis-fixture";
import AnalysisResults from "./analysis-results";

// Mock do TabsContent para garantir que todo o conteúdo seja renderizado no markup estático
vi.mock("@/components/ui/tabs", async () => {
  const actual = await vi.importActual("@/components/ui/tabs");
  return {
    ...actual,
    TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

function renderAnalysisResults(analysis = analysisFixture) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: false,
        retry: false,
      },
    },
  });

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <AnalysisResults analysis={analysis} inputText={inputTextFixture} />
    </QueryClientProvider>,
  );
}

describe("AnalysisResults behavior contract", () => {
  it("renders the same critical sections and fixture data after component extraction", () => {
    const html = renderAnalysisResults();

    expect(html).toContain("Análise Crítica");
    expect(html).toContain("Lean Canvas");
    expect(html).toContain("Visão Geral");
    expect(html).toContain("Resumo Executivo");
    expect(html).toContain("Clareza no problema");
    expect(html).toContain("Faltam metricas claras");
    expect(html).toContain("Definir KPIs");
    expect(html).toContain("PDF");
  });

  it("renders the empty state when analysis is not available", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          enabled: false,
          retry: false,
        },
      },
    });

    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <AnalysisResults analysis={null} />
      </QueryClientProvider>,
    );

    expect(html).toContain("Nenhuma análise ainda");
    expect(html).toContain("Business Model Canvas");
  });
});
