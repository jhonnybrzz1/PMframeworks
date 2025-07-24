import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { analyzeRequestSchema, type AnalyzeResponse } from "@shared/schema";
import { ZodError } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze document endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { framework, inputText } = analyzeRequestSchema.parse(req.body);

      // Call Mistral AI API
      const mistralApiKey = process.env.MISTRAL_API_KEY || "A0d94lrcBf49pfjx4t1yG8siY46Xwqmq";
      
      const systemPrompt = `
Você é o motor oficial do produto Frameworks, uma ferramenta de análise crítica baseada em IA, criada para Product Managers, com base no documento oficial "Guia de Frameworks para Product Managers" da PM3.

## 🎯 **IMPORTANTE: Analise IDEIAS e CONCEITOS, nunca a forma como está escrito**
- Extraia as IDEIAS CENTRAIS, estratégias, objetivos e informações de negócio
- Ignore totalmente: formatação, títulos, estrutura, layout, apresentação visual
- Concentre-se APENAS no MÉRITO das informações e conceitos de Product Management
- Não comente sobre "o documento diz", "está bem estruturado" ou "apresenta claramente"
- Foque nas IDEIAS SUBSTANTIVAS que podem ser analisadas pelo framework selecionado

📚 **Base completa de Frameworks disponíveis (PM3):**

1. **Estratégia e Negócios:**  
- Business Model Canvas  
- Lean Canvas  
- Product Strategy Guide (DHM - Delight, Hard to Copy, Margin)  
- Tamanho de Mercado (TAM/SAM/SOM)  
- Análise SWOT  
- Análise Competitiva  

2. **Discovery e Experimentação:**  
- Matriz CSD  
- Continuous Discovery (Teresa Torres)  
- Opportunity Solution Tree (Teresa Torres)  

3. **Avaliação e Oportunidade:**  
- Opportunity Assessment (Inspired, Marty Cagan)  

4. **Processos e Priorização:**  
- User Story Mapping  
- Press Release + FAQ (Amazon style)  
- Escrevendo boas User Stories  
- PMWheel (autoavaliação para PMs)  
- RICE Score  
- RAPID Framework  

5. **Métricas:**  
- North Star Metric  
- Árvore de Métricas  
- KPIs de Produto  

6. **Extras:**  
- PPM Canvas (Vision, Goals, Bets, Indicators)  
- Estratégia Now/Next/Later

## 🧩 **Estrutura exata da análise gerada (CADA SEÇÃO DEVE TER CONTEÚDO ÚNICO E ESPECÍFICO):**

**1. Resumo do Conteúdo Recebido**  
APENAS um resumo conciso do que foi apresentado no documento (2-3 frases máximo). NÃO mencione o framework aqui.

**2. Pontos Fortes segundo o framework escolhido**  
Liste APENAS os elementos específicos que estão bem alinhados com o framework. Use bullet points. Seja específico sobre QUAIS elementos do framework estão bem cobertos. NÃO repita informações de outras seções.

**3. Lacunas ou Pontos Fracos**  
Liste APENAS o que está FALTANDO ou MAL ESTRUTURADO segundo o framework. Use bullet points. Seja específico sobre QUAIS componentes do framework estão ausentes ou inadequados. NÃO repita os pontos fortes.

**4. Recomendações Práticas (baseadas no framework)**  
APENAS ações concretas e específicas para melhorar o documento. Use bullet points. Cada recomendação deve ser uma ação clara e direta. NÃO repita lacunas, apenas soluções.

**5. Framework Utilizado**  
APENAS o nome do framework e uma frase sobre como foi aplicado. NÃO repita análises das outras seções.

🚨 **REGRA FUNDAMENTAL: CADA SEÇÃO DEVE TER INFORMAÇÕES ÚNICAS. NÃO REPITA CONTEÚDO ENTRE SEÇÕES.**

## ⚡ **Diretrizes de Análise:**
- Extraia APENAS as ideias de negócio e estratégias relevantes para PM
- Ignore referências a "documento", "PRD", "seção", "campo", "estrutura"
- Foque no VALOR e IMPACTO dos conceitos apresentados
- Analise as ESTRATÉGIAS e DECISÕES de produto por trás das informações
- Use linguagem direta sobre os conceitos, não sobre como estão apresentados

Sua resposta deve ser sempre uma **análise crítica estruturada** do conteúdo, focando nas ideias e conceitos de PM apresentados.
`;

      const userPrompt = `
CONTEÚDO PARA ANÁLISE:
${inputText}

FRAMEWORK SELECIONADO: ${framework}

INSTRUÇÕES ESPECÍFICAS PARA CADA SEÇÃO:

**SEÇÃO 1 - Resumo:** 
Máximo 3 frases resumindo APENAS o que o documento apresenta. Não mencione análise ou framework.

**SEÇÃO 2 - Pontos Fortes:**
Liste com bullet points APENAS os elementos do ${framework} que JÁ EXISTEM no documento. 
Exemplo: "• Problema claramente definido", "• Métricas específicas identificadas"

**SEÇÃO 3 - Lacunas:**
Liste com bullet points APENAS os elementos do ${framework} que estão AUSENTES ou INADEQUADOS no documento.
Exemplo: "• Falta definição de segmento de clientes", "• Ausência de análise competitiva"

**SEÇÃO 4 - Recomendações:**
Liste com bullet points APENAS ações práticas e específicas para preencher as lacunas.
Exemplo: "• Definir personas específicas dos usuários", "• Criar matriz de priorização RICE"

**SEÇÃO 5 - Framework:**
Uma frase sobre como o ${framework} foi aplicado.

🚨 CRÍTICO: NÃO REPITA INFORMAÇÕES ENTRE SEÇÕES. CADA SEÇÃO DEVE SER ÚNICA E ESPECÍFICA.
`;

      const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mistralApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!mistralResponse.ok) {
        throw new Error(`Mistral API error: ${mistralResponse.statusText}`);
      }

      const mistralData = await mistralResponse.json();
      const analysisText = mistralData.choices[0].message.content;

      // Parse the structured response - improved parsing logic
      console.log("Raw analysis from Mistral:", analysisText);
      
      // Extract sections using more flexible patterns
      const summaryMatch = analysisText.match(/(?:\*\*)?1\.?\s*Resumo[\s\S]*?\*\*([\s\S]*?)(?=\*\*2\.|$)/i);
      const strengthsMatch = analysisText.match(/(?:\*\*)?2\.?\s*Pontos Fortes[\s\S]*?\*\*([\s\S]*?)(?=\*\*3\.|$)/i);
      const gapsMatch = analysisText.match(/(?:\*\*)?3\.?\s*Lacunas[\s\S]*?\*\*([\s\S]*?)(?=\*\*4\.|$)/i);
      const recommendationsMatch = analysisText.match(/(?:\*\*)?4\.?\s*Recomendações[\s\S]*?\*\*([\s\S]*?)(?=\*\*5\.|$)/i);
      const frameworkMatch = analysisText.match(/(?:\*\*)?5\.?\s*Framework[\s\S]*?\*\*([\s\S]*?)$/i);
      
      // If structured parsing fails, try a simpler approach
      let summary = summaryMatch?.[1]?.trim() || "";
      let strengths = strengthsMatch?.[1]?.trim().split('\n').filter((s: string) => s.trim()) || [];
      let gaps = gapsMatch?.[1]?.trim().split('\n').filter((s: string) => s.trim()) || [];
      let recommendations = recommendationsMatch?.[1]?.trim() || "";
      let frameworkUsed = frameworkMatch?.[1]?.trim() || framework;
      
      // Fallback: if no structured content found, use the full text
      if (!summary && !strengths.length && !gaps.length && !recommendations) {
        summary = analysisText.substring(0, 500) + "...";
        strengths = ["Análise completa disponível no texto principal"];
        gaps = ["Consulte a análise completa para detalhes"];
        recommendations = analysisText.length > 500 ? analysisText.substring(500, 1000) + "..." : analysisText;
        frameworkUsed = `Análise usando ${framework}`;
      }
      
      // Calculate quality score based on content completeness
      const qualityScore = Math.min(100, Math.round(
        (summary.length > 50 ? 20 : 10) + 
        (strengths.length * 15) + 
        (gaps.length * 15) + 
        (recommendations.length > 100 ? 25 : 10) + 
        (frameworkUsed.length > 10 ? 15 : 5)
      ));

      const analysis = {
        summary,
        strengths,
        gaps,
        recommendations,
        framework: frameworkUsed,
        qualityScore,
        generatedAt: new Date().toISOString(),
        fullText: analysisText // Keep full text as backup
      };

      // Save analysis to storage
      await storage.createAnalysis({
        framework,
        inputText,
        analysis,
      });

      const response: AnalyzeResponse = {
        success: true,
        analysis,
      };

      res.json(response);
    } catch (error) {
      console.error("Analysis error:", error);
      
      if (error instanceof ZodError) {
        const response: AnalyzeResponse = {
          success: false,
          error: "Dados inválidos: " + error.errors.map(e => e.message).join(", "),
        };
        return res.status(400).json(response);
      }

      const response: AnalyzeResponse = {
        success: false,
        error: "Erro interno do servidor. Tente novamente.",
      };
      res.status(500).json(response);
    }
  });

  // Get recent analyses
  app.get("/api/analyses/recent", async (req, res) => {
    try {
      const recentAnalyses = await storage.getRecentAnalyses(5);
      res.json(recentAnalyses);
    } catch (error) {
      console.error("Get recent analyses error:", error);
      res.status(500).json({ error: "Erro ao buscar análises recentes" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      // Convert file content to text (basic implementation)
      const text = req.file.buffer.toString('utf-8');
      
      res.json({ text });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Erro ao processar arquivo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
