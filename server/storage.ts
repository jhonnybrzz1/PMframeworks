import { analyses, type Analysis, type InsertAnalysis } from "@shared/schema";
import { getDb } from "./db";
import { Pool } from 'pg';

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
  private pool: Pool;

  constructor() {
    const db = getDb();
    // getDb previously initialises drizzle with Pool; attempt to access underlying pool
    // If getDb returned drizzle, its config contains the pool under 'client' (internal) — safer to create a new Pool from DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || '';
    this.pool = new Pool({ connectionString: dbUrl });
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const query = `INSERT INTO analyses (framework, input_text, analysis, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`;
    const values = [insertAnalysis.framework, insertAnalysis.inputText, JSON.stringify(insertAnalysis.analysis)];
    const res = await this.pool.query(query, values);
    const row = res.rows[0];
    return {
      id: row.id,
      framework: row.framework,
      inputText: row.input_text,
      analysis: row.analysis,
      createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    } as Analysis;
  }

  async getRecentAnalyses(limit = 10): Promise<Analysis[]> {
    const q = `SELECT * FROM analyses ORDER BY created_at DESC LIMIT $1`;
    const res = await this.pool.query(q, [limit]);
    return res.rows.map((row: any) => ({
      id: row.id,
      framework: row.framework,
      inputText: row.input_text,
      analysis: row.analysis,
      createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    } as Analysis));
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const q = `SELECT * FROM analyses WHERE id = $1 LIMIT 1`;
    const res = await this.pool.query(q, [id]);
    if (!res.rows || res.rows.length === 0) return undefined;
    const row = res.rows[0];
    return {
      id: row.id,
      framework: row.framework,
      inputText: row.input_text,
      analysis: row.analysis,
      createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    } as Analysis;
  }
}

const usePostgres = !!process.env.DATABASE_URL;
export const storage = usePostgres ? new PostgresStorage() : new MemStorage();