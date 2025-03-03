import { User, InsertUser, LearningPath, InsertPath } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createPath(userId: number, path: InsertPath): Promise<LearningPath>;
  getUserPaths(userId: number): Promise<LearningPath[]>;
  getPath(id: number): Promise<LearningPath | undefined>;
  deletePath(id: number): Promise<void>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private paths: Map<number, LearningPath>;
  private currentUserId: number;
  private currentPathId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.paths = new Map();
    this.currentUserId = 1;
    this.currentPathId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPath(userId: number, insertPath: InsertPath): Promise<LearningPath> {
    const id = this.currentPathId++;
    const path: LearningPath = {
      ...insertPath,
      id,
      userId,
      createdAt: new Date(),
    };
    this.paths.set(id, path);
    return path;
  }

  async getUserPaths(userId: number): Promise<LearningPath[]> {
    return Array.from(this.paths.values()).filter(
      (path) => path.userId === userId,
    );
  }

  async getPath(id: number): Promise<LearningPath | undefined> {
    return this.paths.get(id);
  }

  async deletePath(id: number): Promise<void> {
    this.paths.delete(id);
  }
}

export const storage = new MemStorage();
