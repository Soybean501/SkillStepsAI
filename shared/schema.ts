import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const learningPaths = pgTable("learning_paths", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  steps: jsonb("steps").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPathSchema = createInsertSchema(learningPaths).pick({
  title: true,
  description: true,
  steps: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertPath = z.infer<typeof insertPathSchema>;
