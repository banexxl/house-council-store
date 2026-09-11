import fs from "node:fs"
import { deprovisionTestUser } from "./utils/supabase-admin"
import { AUTH_FILE, readTestUser } from "./utils/auth-file"

export default async function globalTeardown() {
     if (!fs.existsSync(AUTH_FILE)) return

     const testUser = readTestUser()
     await deprovisionTestUser(testUser.userId)
     fs.rmSync(AUTH_FILE, { force: true })
}
