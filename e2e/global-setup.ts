import fs from "node:fs"
import path from "node:path"
import { provisionTestUser } from "./utils/supabase-admin"
import { AUTH_FILE } from "./utils/auth-file"

export default async function globalSetup() {
     const testUser = await provisionTestUser()
     fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
     fs.writeFileSync(AUTH_FILE, JSON.stringify(testUser, null, 2))
}
