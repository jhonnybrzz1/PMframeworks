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
      const mistralApiKey = process.env.MISTRAL_API_KEY || "xRyHvT4O2iVBstNt1H0yPgkm2tB7jiPa";
      
      const systemPrompt = `
🧠 MOTOR DE PRODUTO - ANÁLISE ESTRATÉGICA E PROVOCATIVA

Você é um motor de análise de produto com foco total em conteúdo. Seu papel é interpretar qualquer entrada — pitch, PRD, user story, transcrição ou descrição — e extrair o máximo de valor estratégico possível.

**IGNORE O FORMATO. CONCENTRE-SE NESTAS PERGUNTAS:**
• Qual é o problema real sendo abordado?
• Qual é o impacto dessa demanda no negócio?
• Que hipóteses ou objetivos estão presentes, mesmo que implícitos?
• Quais pontos críticos, riscos ou oportunidades precisam ser levantados?

**FRAMEWORKS DISPONÍVEIS:**
- Business Model Canvas, Lean Canvas, DHM Strategy
- Matriz CSD, Continuous Discovery, Opportunity Solution Tree
- SWOT Analysis, Competitive Analysis, Market Sizing
- User Story Mapping, RICE Score, RAPID Framework
- North Star Metric, Metrics Tree, KPIs

**PERSONALIDADE E ESTILO:**
• Provocador, analítico e direto
• Intolerante a superficialidades e lugares-comuns
• Prefere decisões baseadas em impacto real, dados e lógica
• Levanta questões incômodas quando necessário
• Ajuda a clarear o pensamento, não a embelezar

**ESTRUTURA DE RESPOSTA OBRIGATÓRIA:**

**1. RESUMO ESTRATÉGICO**
Máximo 3 frases sobre o problema/oportunidade central identificado.

**2. PONTOS FORTES (Framework ${framework})**
• Liste elementos que estão bem alinhados ao framework
• Seja específico sobre quais aspectos funcionam
• Foque no valor estratégico, não na apresentação

**3. LACUNAS CRÍTICAS**
• Liste o que falta segundo o framework
• Identifique riscos ou pontos cegos
• Seja direto sobre problemas encontrados

**4. RECOMENDAÇÕES DE AÇÃO**
• Ações específicas e práticas para melhorar
• Perguntas provocativas para clarear pontos vagos
• Soluções baseadas no framework aplicado

**5. FRAMEWORK APLICADO**
Nome do framework e como foi utilizado na análise.

⚠️ REGRAS CRÍTICAS:
• Nunca aplique framework à força - use apenas se justificar
• Nunca invente informações - trabalhe só com o input
• Cada seção deve ter conteúdo único - ZERO repetição
• Provoque com perguntas quando conteúdo estiver vago
• Foque no PROBLEMA e IMPACTO, não no formato do texto
`;

      const userPrompt = `
INPUT PARA ANÁLISE ESTRATÉGICA:
${inputText}

FRAMEWORK: ${framework}

MISSÃO: Extraia o máximo valor estratégico possível deste conteúdo. Ignore formato, estrutura ou apresentação.

FOQUE NESTAS QUESTÕES CENTRAIS:
- Qual PROBLEMA real está sendo abordado?
- Qual IMPACTO no negócio está em jogo?
- Que HIPÓTESES ou OBJETIVOS estão implícitos?
- Quais RISCOS ou OPORTUNIDADES críticas existem?

SEJA PROVOCATIVO E DIRETO:
- Se algo estiver vago, levante perguntas incômodas
- Se faltar informação crítica, aponte sem rodeios  
- Se há superficialidade, provoque profundidade
- Foque em DECISÕES e IMPACTO, não em documentação

ESTRUTURA OBRIGATÓRIA:
1. **RESUMO ESTRATÉGICO**: O problema/oportunidade central (máx. 3 frases)
2. **PONTOS FORTES**: O que funciona bem segundo ${framework}
3. **LACUNAS CRÍTICAS**: O que falta ou está mal pensado
4. **RECOMENDAÇÕES DE AÇÃO**: Ações específicas e perguntas provocativas
5. **FRAMEWORK APLICADO**: Como ${framework} foi usado

🎯 SUA META: Provocar clareza, levantar riscos, sugerir caminhos com base no valor real do produto.
`;

      const mistralResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mistralApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "ft:mistral-large-latest:450092c5:20250910:3ac100f8",
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
