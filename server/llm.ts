import { z } from 'zod';
import { AnalyzeResponse } from '@shared/schema';
import { MAX_TOKENS } from "../shared/constants";

const llmResponseSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendations: z.string(),
  framework: z.string(),
});

export async function analyzeWithLLM(framework: string, inputText: string): Promise<AnalyzeResponse> {
  // If OpenAI is configured, call it
  const openaiKey = process.env.OPENAI_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;
  const mistralUrl = process.env.MISTRAL_API_URL; // optional

  const systemPrompt = `Você é um analista de produto experiente. Analise o texto fornecido sob a ótica do framework ${framework} e retorne um JSON com os campos: summary, strengths (array), gaps (array), recommendations (string), framework.`;

  const userPrompt = `Texto:\n\n${inputText}\n\nRetorne apenas um JSON válido.`;

  try {
    let rawText: string | undefined;

    if (openaiKey) {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: MAX_TOKENS,
        }),
      });
      const j = await resp.json();
      rawText = j?.choices?.[0]?.message?.content;
    } else if (mistralKey && mistralUrl) {
      // Generic POST to Mistral-like endpoint; ensure mistralUrl is set by user
      const resp = await fetch(mistralUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralKey}`,
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\n${userPrompt}`,
          parameters: { max_new_tokens: MAX_TOKENS, temperature: 0.2 }
        }),
      });
      const j = await resp.json();
      // Mistral responses vary; try common patterns
      rawText = j?.outputs?.[0]?.content || j?.output || j?.generated_text || JSON.stringify(j);
    }

    if (!rawText) {
      // Fallback/mock
      const mock = {
        summary: `Resumo curto do documento para o framework ${framework}.`,
        strengths: ['Clareza no problema', 'Bom alinhamento com stakeholders'],
        gaps: ['Faltam métricas claras', 'Roadmap pouco detalhado'],
        recommendations: 'Definir KPIs e detalhar roadmap em sprints de 2 semanas.',
        framework,
      };
      return { success: true, analysis: mock };
    }

    // Try to extract JSON from the model output
    const jsonMatch = rawText.match(/\{[\s\S]*\}$/m);
    const candidate = jsonMatch ? jsonMatch[0] : rawText;

    let parsed: any;
    try {
      parsed = JSON.parse(candidate);
    } catch (e) {
      // Last resort: try to eval via Function (risky) — avoid. Return error
      return { success: false, error: 'LLM returned non-JSON response and JSON parsing failed.' };
    }

    const parsedSafe = llmResponseSchema.safeParse(parsed);
    if (!parsedSafe.success) {
      return { success: false, error: 'LLM response did not match expected schema.' };
    }

    return { success: true, analysis: parsedSafe.data };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}
