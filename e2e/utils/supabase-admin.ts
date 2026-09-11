import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

/**
 * Standalone admin client for the E2E test runner (plain Node process, not a
 * Next.js request) — can't reuse app/lib's service-role helper since that one
 * depends on next/headers.
 */
function getAdminClient() {
     const url = process.env.NEXT_PUBLIC_SUPABASE_URL
     const serviceKey = process.env.SB_SERVICE_KEY

     if (!url || !serviceKey) {
          throw new Error(
               "NEXT_PUBLIC_SUPABASE_URL and SB_SERVICE_KEY must be set to run the E2E suite."
          )
     }

     return createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
     })
}

export type TestUser = {
     userId: string
     email: string
     password: string
}

/**
 * Creates a disposable, pre-confirmed Supabase auth user, plus the
 * `tblPolarCustomers` row that sign-in (checkUserPermissionServer) and
 * /profile both require — without ever calling the real Polar API.
 */
export async function provisionTestUser(): Promise<TestUser> {
     const admin = getAdminClient()
     const stamp = Date.now()
     const email = `e2e+${stamp}@nest-link.test`
     const password = `E2e-Test-Pass-${stamp}!`

     const { data: userData, error: userError } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name: "E2E Test User" },
     })

     if (userError || !userData.user) {
          throw new Error(`Failed to create E2E test user: ${userError?.message}`)
     }

     const userId = userData.user.id

     // organizationId is a foreign key into the Polar organization synced to
     // this project — reuse whatever real customer rows already point at
     // rather than fabricating one (which would violate the FK constraint).
     const { data: existingCustomer, error: orgLookupError } = await admin
          .from("tblPolarCustomers")
          .select("organizationId")
          .limit(1)
          .maybeSingle()

     if (orgLookupError || !existingCustomer?.organizationId) {
          await admin.auth.admin.deleteUser(userId)
          throw new Error(
               `Could not find an existing organizationId to seed the E2E test customer with: ${orgLookupError?.message ?? "no rows in tblPolarCustomers"}`
          )
     }

     const { error: customerError } = await admin.from("tblPolarCustomers").insert({
          id: randomUUID(),
          externalId: userId,
          email,
          emailVerified: true,
          name: "E2E Test User",
          metadata: {},
          billingAddress: null,
          taxId: null,
          organizationId: existingCustomer.organizationId,
          deletedAt: null,
          avatarUrl: null,
     })

     if (customerError) {
          await admin.auth.admin.deleteUser(userId)
          throw new Error(`Failed to seed tblPolarCustomers for E2E test user: ${customerError.message}`)
     }

     return { userId, email, password }
}

export async function deprovisionTestUser(userId: string): Promise<void> {
     const admin = getAdminClient()
     await admin.from("tblPolarCustomers").delete().eq("externalId", userId)
     await admin.auth.admin.deleteUser(userId)
}
