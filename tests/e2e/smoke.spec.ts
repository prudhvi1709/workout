import { test, expect } from "@playwright/test";

// These run against a dev build pointed at placeholder Supabase creds, so they
// exercise boot + render + responsiveness, NOT the authenticated data flows.
// Authenticated e2e (login -> log -> chart) needs real test credentials; see
// the TODO at the bottom.

test("boots to the login screen with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Recomp Tracker" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();

  expect(errors, `console/page errors:\n${errors.join("\n")}`).toEqual([]);
});

test("login card fits the mobile viewport (no horizontal scroll)", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflow, "page should not scroll horizontally on a phone").toBe(false);
});

test("shows a clear error on bad credentials (Supabase round-trip)", async ({ page }) => {
  // With placeholder creds this fails at the network/auth layer; we assert the
  // app surfaces an error rather than hanging or crashing.
  await page.goto("/");
  await page.getByRole("textbox", { name: /email/i }).fill("nobody@example.com");
  await page.getByLabel(/password/i).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Either an auth error ("Invalid login") or a network error message appears.
  await expect(page.locator("p.text-rose-400")).toBeVisible({ timeout: 15_000 });
});

// TODO: authenticated flow. Provide E2E_EMAIL / E2E_PASSWORD for a throwaway
// test user, then: sign in -> log a weight -> assert it renders in the chart;
// and an RLS check that the other user's row is read-only.
