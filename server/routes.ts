import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateLearningPath } from "./openai";
import { insertPathSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/paths/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const path = await generateLearningPath(req.body.skill);
      res.json(path);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate learning path" });
    }
  });

  app.post("/api/paths", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const parsedPath = insertPathSchema.parse(req.body);
      const path = await storage.createPath(req.user.id, parsedPath);
      res.status(201).json(path);
    } catch (error) {
      res.status(400).json({ message: "Invalid path data" });
    }
  });

  app.get("/api/paths", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const paths = await storage.getUserPaths(req.user.id);
    res.json(paths);
  });

  app.delete("/api/paths/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const path = await storage.getPath(parseInt(req.params.id));
    if (!path || path.userId !== req.user.id) {
      return res.sendStatus(404);
    }
    
    await storage.deletePath(path.id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
