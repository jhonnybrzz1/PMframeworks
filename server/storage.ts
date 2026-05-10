import { analyses, type Analysis, type InsertAnalysis } from "@shared/schema";
import { getDb } from "./db";
import { desc, eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

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

// File-based storage (persistent locally in server/data/analyses.json)
export class FileStorage implements IStorage {
  private dataDir: string;
  private dataFile: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'server', 'data');
    this.dataFile = path.join(this.dataDir, 'analyses.json');

    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
    } catch (e) {
      // ignore
    }

    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, JSON.stringify([]), 'utf8');
    }
  }

  private readAll(): Analysis[] {
    try {
      const raw = fs.readFileSync(this.dataFile, 'utf8');
      const parsed = JSON.parse(raw || '[]');
      return parsed.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) }));
    } catch (e) {
      return [];
    }
  }

  private writeAll(items: Analysis[]) {
    fs.writeFileSync(this.dataFile, JSON.stringify(items, null, 2), 'utf8');
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const items = this.readAll();
    const maxId = items.reduce((m, it) => Math.max(m, it.id || 0), 0);
    const id = maxId + 1;
    const analysis: Analysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    } as unknown as Analysis;
    items.push(analysis);
    this.writeAll(items);
    return analysis;
  }

  async getRecentAnalyses(limit = 10): Promise<Analysis[]> {
    const items = this.readAll();
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const items = this.readAll();
    return items.find(i => i.id === id);
  }
}

export class PostgresStorage implements IStorage {
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const db = getDb();
    const [row] = await db.insert(analyses).values({
      framework: insertAnalysis.framework,
      inputText: insertAnalysis.inputText,
      analysis: insertAnalysis.analysis,
      createdAt: new Date(),
    }).returning();

    return {
      id: row.id as number,
      framework: row.framework,
      inputText: row.inputText,
      analysis: row.analysis,
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
    } as Analysis;
  }

  async getRecentAnalyses(limit = 10): Promise<Analysis[]> {
    const db = getDb();
    const rows = await db.select().from(analyses).orderBy(desc(analyses.createdAt)).limit(limit);
    return rows.map(r => ({
      id: r.id as number,
      framework: r.framework,
      inputText: r.inputText,
      analysis: r.analysis,
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
    }));
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const db = getDb();
    const row = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);
    if (!row || row.length === 0) return undefined;
    const r = row[0];
    return {
      id: r.id as number,
      framework: r.framework,
      inputText: r.inputText,
      analysis: r.analysis,
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
    };
  }
}

const usePostgres = !!process.env.DATABASE_URL;
export const storage = usePostgres ? new PostgresStorage() : new FileStorage();
