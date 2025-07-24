import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  framework: text("framework").notNull(),
  inputText: text("input_text").notNull(),
  analysis: json("analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  framework: true,
  inputText: true,
  analysis: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analyses.$inferSelect;

// API request/response types
export const analyzeRequestSchema = z.object({
  framework: z.string().min(1, "Framework é obrigatório"),
  inputText: z.string().min(1, "Texto do documento é obrigatório"),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

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
