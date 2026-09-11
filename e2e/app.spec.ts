import { test, expect, type Page } from "@playwright/test"
import { readTestUser } from "./utils/auth-file"

/**
 * Golden-path smoke test: sign in, walk every page, confirm data loads,
 * open (but don't complete) a couple of modals, sign out.
 *
 * Deliberately excludes: registration, password reset, contact-form
 * submission, completing 2FA enrollment, and any Polar.sh checkout /
 * customer-portal / cancel-subscription action.
 */
test.describe.configure({ mode: "serial" })

let page: Page

test.beforeAll(async ({ browser }) => {
     page = await browser.newPage()
})

test.afterAll(async () => {
     await page.close()
})

test("sign in with the seeded test user", async () => {
     const { email, password } = readTestUser()

     await page.goto("/auth/sign-in")
     await page.getByLabel("Email Address").fill(email)
     await page.getByLabel("Password", { exact: true }).fill(password)
     // Scoped to the form: the header also renders a "Sign In" nav button on this page.
     await page.locator("form").getByRole("button", { name: "Sign In", exact: true }).click()

     await expect(page).toHaveURL("/")
     await expect(page.getByRole("button", { name: "Profile", exact: true })).toBeVisible()
     await expect(page.getByRole("link", { name: /Dashboard/ })).toBeVisible()
})

test("home page loads", async () => {
     await page.goto("/")
     await expect(
          page.getByRole("heading", { level: 1, name: /Building Management Software/ })
     ).toBeVisible()
})

test("docs page loads", async () => {
     await page.goto("/docs")
     await expect(page.getByRole("heading", { level: 1, name: "Everything about NestLink" })).toBeVisible()
})

test("pricing page loads plan data", async () => {
     await page.goto("/pricing")
     await expect(page.getByRole("heading", { level: 1, name: "Simple, transparent pricing" })).toBeVisible()
     // Plans are fetched from Polar (read-only) — assert at least one plan
     // card rendered. No checkout CTA is clicked.
     await expect(
          page.getByRole("button", { name: /Start Free Trial|Change Plan|Current Plan/ }).first()
     ).toBeVisible()
})

test("contact page loads", async () => {
     await page.goto("/contact")
     await expect(page.getByRole("heading", { level: 1, name: "We're here to help" })).toBeVisible()
     await expect(page.getByLabel("Full Name")).toBeVisible()
     await expect(page.getByLabel("Email", { exact: true })).toBeVisible()
})

test("privacy policy page loads", async () => {
     await page.goto("/privacy-policy")
     await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible()
})

test("terms and conditions page loads", async () => {
     await page.goto("/terms-and-conditions")
     await expect(page.getByRole("heading", { level: 1, name: "Terms and Conditions" })).toBeVisible()
})

test("404 page renders for an unknown route", async () => {
     await page.goto("/this-page-does-not-exist")
     await expect(page.getByText("Page Not Found")).toBeVisible()
})

test("profile - account tab shows the signed-in user's data", async () => {
     const { email } = readTestUser()

     await page.goto("/profile")
     await expect(page).toHaveURL("/profile")
     await expect(page.getByText(email).first()).toBeVisible()
     await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible()
})

test("profile - subscription tab loads and 'Select a Plan' dialog opens/closes", async () => {
     await page.getByRole("tab", { name: "Subscription" }).click()

     const selectPlanButton = page.getByRole("button", { name: "Select a Plan" })
     await expect(selectPlanButton).toBeVisible()
     await selectPlanButton.click()

     const dialog = page.getByRole("dialog")
     await expect(dialog).toBeVisible()
     await expect(dialog.getByText("Upgrade Your Plan")).toBeVisible()
     // Close without navigating into a real Polar checkout.
     await dialog.getByRole("button", { name: "Cancel", exact: true }).click()
     await expect(dialog).toBeHidden()
})

test("profile - security tab loads", async () => {
     await page.getByRole("tab", { name: "Security" }).click()
     await expect(page.getByText("Two-Factor Authentication")).toBeVisible()
     // Intentionally not clicking "Enable" — it triggers a real Supabase MFA
     // enrollment call, not just a UI dialog.
     await expect(page.getByRole("button", { name: "Enable" })).toBeVisible()
})

test("sign out", async () => {
     await page.getByRole("tab", { name: "Account" }).click()
     await page.getByRole("button", { name: "Sign out" }).click()

     // Protected route should now bounce to sign-in (also exercises the
     // middleware/get-session auth changes from the performance pass).
     await expect(async () => {
          await page.goto("/profile")
          await expect(page).toHaveURL(/\/auth\/sign-in/)
     }).toPass({ timeout: 15_000 })
})
