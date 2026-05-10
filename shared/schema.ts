import { pgTable, text, serial, timestamp, json, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { MAX_ANALYSIS_TEXT_LENGTH } from "./constants";

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  framework: text("framework").notNull(),
  inputText: text("input_text").notNull(),
  analysis: json("analysis").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    createdAtIndex: index("created_at_idx").on(table.createdAt),
  };
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
  framework: z
    .string({ required_error: "Framework é obrigatório" })
    .min(1, "Framework é obrigatório"),
  inputText: z
    .string({ required_error: "Texto do documento é obrigatório" })
    .min(1, "Texto do documento é obrigatório")
    .max(MAX_ANALYSIS_TEXT_LENGTH, `Texto do documento deve ter no máximo ${MAX_ANALYSIS_TEXT_LENGTH} caracteres`),
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
