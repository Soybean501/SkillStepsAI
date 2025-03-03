
import { sqliteStorage } from "./sqlite-storage";
import BetterSqlite3 from "better-sqlite3";
import path from "path";

// This script provides a simple view of your database tables

const DATA_DIR = path.join(process.cwd(), "data");
const db = new BetterSqlite3(path.join(DATA_DIR, "app.db"));

console.log("=== Database Tables ===");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables.map(t => t.name).join(", "));

console.log("\n=== Users Table ===");
const users = db.prepare("SELECT * FROM users").all();
console.log(users);

console.log("\n=== Learning Paths Table ===");
const paths = db.prepare("SELECT id, userId, title, description, createdAt FROM learning_paths").all();
console.log(paths);

db.close();
