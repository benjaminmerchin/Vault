import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 920 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

try {
  // 1) Login page -> click demo
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /try the live demo/i }).click();

  // 2) Land on dashboard
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  await page.waitForLoadState("networkidle");
  const netWorth = await page.getByText("Net worth").first().isVisible();
  console.log("✓ dashboard reached, 'Net worth' visible:", netWorth);
  await page.screenshot({ path: "/tmp/vault-dashboard.png", fullPage: true });

  // 3) Open advisor, ask a suggested question
  await page.getByRole("button", { name: /ask vault/i }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /what should i pay off first/i }).click();

  // 4) Wait for a streamed assistant answer (>60 chars)
  await page.waitForFunction(
    () => {
      const bubbles = Array.from(document.querySelectorAll(".bg-secondary"));
      return bubbles.some((b) => (b.textContent || "").trim().length > 60);
    },
    { timeout: 45000 },
  );
  const answer = await page.evaluate(() => {
    const bubbles = Array.from(document.querySelectorAll(".bg-secondary"));
    const longest = bubbles.sort(
      (a, b) => (b.textContent || "").length - (a.textContent || "").length,
    )[0];
    return (longest?.textContent || "").trim();
  });
  console.log("✓ advisor replied:", JSON.stringify(answer.slice(0, 220)));
  await page.screenshot({ path: "/tmp/vault-advisor.png" });

  console.log("\nCONSOLE ERRORS:", errors.length ? errors : "none");
} catch (e) {
  console.log("E2E FAIL:", e.message);
  console.log("recent console errors:", errors.slice(-8));
  await page.screenshot({ path: "/tmp/vault-fail.png" }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
