import fs from "node:fs"
import path from "node:path"
import type { TestUser } from "./supabase-admin"

export const AUTH_FILE = path.join(__dirname, "..", ".auth", "test-user.json")

export function readTestUser(): TestUser {
     return JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"))
}
