import { test, expect } from "@playwright/test";

/**
 * End-to-end happy path against the real stack (Next.js + Django + Postgres):
 * signup → seeded categories + empty state → create note → edit + autosave →
 * note persists on the grid → logout.
 *
 * Requires the Django backend running (docker compose up) when run locally.
 */
test("signup, create and edit a note, then log out", async ({ page }) => {
  const email = `e2e+${Date.now()}@example.com`;
  const password = "Str0ngPass1";
  const noteTitle = `E2E Note ${Date.now()}`;

  // --- Sign up ---
  await page.goto("/signup");
  await page.getByPlaceholder("Email address").fill(email);
  await page.getByPlaceholder("Password", { exact: true }).fill(password);
  await page.getByPlaceholder("Confirm password").fill(password);
  await page.getByRole("button", { name: "Sign Up" }).click();

  // Lands on the notes dashboard with seeded categories + empty state
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByText("Random Thoughts")).toBeVisible();
  await expect(
    page.getByText(/just here waiting for your charming notes/i)
  ).toBeVisible();

  // --- Create a note ---
  await page.getByRole("button", { name: /New Note/ }).click();
  await expect(page).toHaveURL(/\/notes\/\d+$/);

  // --- Edit + autosave ---
  // Arm the wait before typing so we deterministically catch the debounced save
  const savePromise = page.waitForResponse(
    (r) => r.url().includes("/api/notes/") && r.request().method() === "PATCH"
  );
  await page.getByLabel("Note title").fill(noteTitle);
  await page.getByLabel("Note content").fill("Written by the E2E test.");
  await savePromise; // debounced autosave (~500ms) has landed

  // --- Back to the grid: the note persists ---
  await page.getByLabel("Close note").click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByText(noteTitle)).toBeVisible();

  // --- Log out ---
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
