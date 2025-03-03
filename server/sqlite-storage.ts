
import { User, InsertUser, LearningPath, InsertPath } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import BetterSqlite3 from "better-sqlite3";
import fs from "fs";
import path from "path";

const MemoryStore = createMemoryStore(session);

// Ensure the data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

export class SqliteStorage {
  private db: BetterSqlite3.Database;
  sessionStore: session.Store;

  constructor() {
    this.db = new BetterSqlite3(path.join(DATA_DIR, "app.db"));
    this.setupDatabase();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  private setupDatabase() {
    // Create users table
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `).run();

    // Create learning_paths table
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        steps TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `).run();
  }

  async getUser(id: number): Promise<User | undefined> {
    const user = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = this.db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const stmt = this.db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    const result = stmt.run(insertUser.username, insertUser.password);
    const id = result.lastInsertRowid as number;
    return { id, ...insertUser };
  }

  async createPath(userId: number, insertPath: InsertPath): Promise<LearningPath> {
    const createdAt = new Date().toISOString();
    const steps = JSON.stringify(insertPath.steps);
    
    const stmt = this.db.prepare(
      "INSERT INTO learning_paths (userId, title, description, steps, createdAt) VALUES (?, ?, ?, ?, ?)"
    );
    
    const result = stmt.run(
      userId, 
      insertPath.title, 
      insertPath.description, 
      steps, 
      createdAt
    );
    
    const id = result.lastInsertRowid as number;
    
    return {
      id,
      userId,
      title: insertPath.title,
      description: insertPath.description,
      steps: insertPath.steps,
      createdAt: new Date(createdAt)
    };
  }

  async getUserPaths(userId: number): Promise<LearningPath[]> {
    const paths = this.db.prepare("SELECT * FROM learning_paths WHERE userId = ?").all(userId) as any[];
    
    return paths.map(path => ({
      ...path,
      steps: JSON.parse(path.steps),
      createdAt: new Date(path.createdAt)
    }));
  }

  async getPath(id: number): Promise<LearningPath | undefined> {
    const path = this.db.prepare("SELECT * FROM learning_paths WHERE id = ?").get(id) as any | undefined;
    
    if (!path) return undefined;
    
    return {
      ...path,
      steps: JSON.parse(path.steps),
      createdAt: new Date(path.createdAt)
    };
  }

  async deletePath(id: number): Promise<void> {
    this.db.prepare("DELETE FROM learning_paths WHERE id = ?").run(id);
  }
}

export const sqliteStorage = new SqliteStorage();
