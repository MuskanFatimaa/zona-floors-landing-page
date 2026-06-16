// Landing-page gate check (scratch tool — not part of the app).
// Renders /wood-flooring at 390x844, verifies H1 / rating / offer / CTA are
// above the fold, screenshots the viewport, and prints full visible text.
import { chromium } from "playwright";

const URL = process.env.GATE_URL || "http://localhost:4321/wood-flooring";
const FOLD = 844;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(800);

async function fold(label, locator) {
  const el = locator.first();
  const n = await el.count();
  if (!n) return { label, found: false };
  const box = await el.boundingBox();
  if (!box) return { label, found: true, visible: false };
  const aboveFold = box.y >= 0 && box.y + box.height <= FOLD;
  const text = (await el.innerText().catch(() => "")).replace(/\s+/g, " ").trim().slice(0, 80);
  return { label, found: true, top: Math.round(box.y), bottom: Math.round(box.y + box.height), aboveFold, text };
}

const checks = [
  await fold("H1", page.locator("h1")),
  await fold("Rating", page.getByText("5-Star Rated on Google")),
  await fold("Offer", page.locator("main p", { hasText: "Free in-home estimate" })),
  await fold("CTA", page.getByRole("link", { name: "Get My Free Estimate" })),
];

console.log("=== ABOVE-THE-FOLD @ 390x844 ===");
for (const c of checks) {
  const status = !c.found ? "MISSING" : c.aboveFold ? "VISIBLE ✓" : `BELOW FOLD (bottom ${c.bottom}px)`;
  console.log(`${c.label.padEnd(7)} ${status}  ${c.text ? `“${c.text}”` : ""}`);
}

await page.screenshot({ path: "scripts/gate-390.png" });
console.log("\nScreenshot: scripts/gate-390.png");

// Full visible text (filter the off-screen honeypot label).
const visibleText = await page.evaluate(() => document.body.innerText);
console.log("\n=== FULL VISIBLE TEXT ===\n");
console.log(visibleText.split("\n").map((l) => l.trimEnd()).filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n"));

await browser.close();
