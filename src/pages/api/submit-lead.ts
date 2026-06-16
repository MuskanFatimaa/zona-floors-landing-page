/**
 * POST /api/submit-lead
 *
 * Server-side lead handler (claude.md "Architecture"):
 *  1. Parse the submitted form.
 *  2. Drop honeypot hits SILENTLY (look like success, never reach the CRM).
 *  3. Validate name + 10-digit phone + 5-digit ZIP.
 *  4. Forward the full attribution payload to the CRM webhook server-side.
 *  5. Return fast and 303-redirect the client to /thank-you.
 *
 * The CRM URL is read from CRM_WEBHOOK_URL (server env) so it never reaches the
 * client bundle. A slow/failing CRM never blocks or fails the visitor.
 */
import type { APIRoute } from "astro";
import { siteConfig } from "@/lib/siteConfig";
import { ATTRIBUTION_PARAMS } from "@/lib/tracking";
import { digits, formatPhone } from "@/lib/phone";

export const prerender = false;

const THANK_YOU = "/thank-you";

function redirect(location: string, status = 303): Response {
  return new Response(null, { status, headers: { Location: location } });
}

async function forwardToCrm(payload: unknown): Promise<void> {
  const url = import.meta.env.CRM_WEBHOOK_URL;
  if (!url) {
    console.error("[submit-lead] CRM_WEBHOOK_URL is not set — lead NOT forwarded.");
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) console.error(`[submit-lead] CRM responded ${res.status}`);
  } catch (err) {
    console.error("[submit-lead] CRM forward failed:", err);
  } finally {
    clearTimeout(timeout);
  }
}

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const get = (k: string) => (form.get(k) ?? "").toString().trim();

  // 2. Honeypot — silently accept-and-discard.
  if (get("company") !== "") {
    return redirect(THANK_YOU);
  }

  // Thank-you qualifying answers post back as a CRM contact update (rooms, sqft,
  // timeline). No lead validation; never re-fires the form conversion.
  if (get("intent") === "qualify") {
    const attribution: Record<string, string> = {};
    for (const key of ATTRIBUTION_PARAMS) {
      const v = get(key);
      if (v) attribution[key] = v;
    }
    await forwardToCrm({
      business: siteConfig.business.displayName,
      source: "thank-you-qualify",
      type: "contact-update",
      page_slug: get("page_slug"),
      submitted_at: new Date().toISOString(),
      rooms: get("rooms"),
      sqft: get("sqft"),
      timeline: get("timeline"),
      attribution,
    });
    return redirect(`${THANK_YOU}?updated=1`);
  }

  // 3. Validate.
  const name = get("name");
  const phoneDigits = digits(get("phone"));
  const zip = get("zip");
  const backHref = (form.get("page_slug") ? `/${get("page_slug")}` : "/") + "#lead-form";

  if (!name || phoneDigits.length !== 10 || !/^\d{5}$/.test(zip)) {
    return redirect(`${backHref}?error=invalid`);
  }

  // 4. Build the attribution payload and forward.
  const attribution: Record<string, string> = {};
  for (const key of ATTRIBUTION_PARAMS) {
    const v = get(key);
    if (v) attribution[key] = v;
  }

  const payload = {
    business: siteConfig.business.displayName,
    source: "website-lead-form",
    page_slug: get("page_slug"),
    submitted_at: new Date().toISOString(),
    name,
    phone: formatPhone(phoneDigits),
    zip,
    attribution,
  };

  await forwardToCrm(payload);

  // 5. Redirect to the thank-you page (where the form conversion fires).
  return redirect(THANK_YOU);
};

/** Any non-POST method gets a clean 405. */
export const ALL: APIRoute = () =>
  new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
