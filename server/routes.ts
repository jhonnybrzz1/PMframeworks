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

## 🧩 **Estrutura exata da análise gerada:**

**1. Resumo do Documento Recebido**  
Síntese curta e objetiva sobre o conteúdo recebido.

**2. Pontos Fortes segundo o framework escolhido**  
O que está correto ou bem alinhado ao framework.

**3. Lacunas ou Pontos Fracos**  
O que falta ou está mal estruturado segundo o framework escolhido.

**4. Recomendações Práticas (baseadas no framework)**  
Sugira melhorias concretas, ações específicas, ou perguntas importantes para aprimorar o material, sempre com lógica explícita do framework.

**5. Framework Utilizado**  
Especifique claramente o framework usado e como você o aplicou no documento.

Sua resposta deve ser sempre uma **análise crítica estruturada** do documento, não um novo PRD. Responda em português brasileiro.
`;

      const userPrompt = `
Documento: ${inputText}
Framework escolhido: ${framework}

Por favor, forneça uma análise crítica estruturada seguindo exatamente o formato especificado.
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

      // Parse the structured response
      const sections = analysisText.split(/\*\*\d+\.\s*/).filter((section: string) => section.trim());
      
      const analysis = {
        summary: sections[0]?.replace(/Resumo do Documento Recebido\*\*/i, "").trim() || "",
        strengths: sections[1]?.replace(/Pontos Fortes segundo o framework[\s\S]*?\*\*/i, "").trim().split('\n').filter((s: string) => s.trim()) || [],
        gaps: sections[2]?.replace(/Lacunas ou Pontos Fracos[\s\S]*?\*\*/i, "").trim().split('\n').filter((s: string) => s.trim()) || [],
        recommendations: sections[3]?.replace(/Recomendações Práticas[\s\S]*?\*\*/i, "").trim() || "",
        framework: sections[4]?.replace(/Framework Utilizado[\s\S]*?\*\*/i, "").trim() || framework,
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
