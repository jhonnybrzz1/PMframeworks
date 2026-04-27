import { analyses, type Analysis, type InsertAnalysis } from "@shared/schema";
import { getDb } from "./db";

export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getRecentAnalyses(limit?: number): Promise<Analysis[]>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, Analysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentId++;
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getRecentAnalyses(limit = 10): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }
}

export class PostgresStorage implements IStorage {
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const db = getDb();
    const [result] = await db.insert(analyses).values({
      framework: insertAnalysis.framework,
      inputText: insertAnalysis.inputText,
      result: insertAnalysis.result,
      createdAt: new Date(),
    }).returning();

    // drizzle's returning may return different shape; coerce into Analysis
    return {
      id: (result.id as number) ?? 0,
      framework: result.framework,
      inputText: result.inputText,
      result: result.result,
      createdAt: result.createdAt instanceof Date ? result.createdAt : new Date(result.createdAt),
    };
  }

  async getRecentAnalyses(limit = 10): Promise<Analysis[]> {
    const db = getDb();
    const rows = await db.select().from(analyses).orderBy(analyses.createdAt.desc).limit(limit);
    return rows.map(r => ({
      id: r.id as number,
      framework: r.framework,
      inputText: r.inputText,
      result: r.result,
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
    }));
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const db = getDb();
    const row = await db.select().from(analyses).where(analyses.id.equals(id)).limit(1);
    if (!row || row.length === 0) return undefined;
    const r = row[0];
    return {
      id: r.id as number,
      framework: r.framework,
      inputText: r.inputText,
      result: r.result,
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
    };
  }
}

const usePostgres = !!process.env.DATABASE_URL;
export const storage = usePostgres ? new PostgresStorage() : new MemStorage();
