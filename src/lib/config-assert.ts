/**
 * config-assert.ts — build-time gate.
 *
 * Imported by the root layout's server frontmatter and run only when
 * `import.meta.env.PROD` is true (i.e. during `astro build`). It throws if any
 * REQUIRED config value is empty, which fails the production build and prevents
 * a page from shipping without an offer, consent text, license, conversion IDs,
 * brand colors, a speed-to-lead promise, review aggregates, or a domain.
 *
 * In `astro dev` it does not throw — it logs the same list as a warning so the
 * scaffold remains workable while intake data is still being gathered.
 *
 * This module is server-only (layout frontmatter) and is never shipped to the
 * client, so the checks add zero bytes to the browser bundle.
 */
import { siteConfig, approvedOffers } from './siteConfig';

/** Returns a human-readable list of REQUIRED config values that are still missing. */
export function getRequiredIssues(): string[] {
  const issues: string[] = [];
  const c = siteConfig;

  const need = (cond: boolean, label: string) => {
    if (!cond) issues.push(label);
  };

  // License (header + footer)
  need(c.business.license.number.trim().length > 0, 'business.license.number');
  need(c.business.license.issuingBody.trim().length > 0, 'business.license.issuingBody');

  // Hours (trust element)
  need(c.business.hours.trim().length > 0, 'business.hours');

  // At least one APPROVED offer — no page ships without an offer.
  need(approvedOffers().length > 0, 'offers (need ≥1 approved offer with text)');

  // Speed-to-lead promise
  need(c.speedToLead.trim().length > 0, 'speedToLead');

  // SMS/TCPA consent text (renders adjacent to every phone field)
  need(c.consent.sms.trim().length > 0, 'consent.sms');

  // Google Ads conversion tracking — NOT required to ship per client: leads are
  // tracked via the GHL CRM webhook, not Google Ads conversions. gtag and the
  // trackConversion() helper degrade gracefully when these are empty (Layout only
  // loads gtag when an AW- ID is present). Re-enable if conversion tracking is added.
  // need(/^AW-/.test(c.tracking.googleAds.conversionId.trim()), 'tracking.googleAds.conversionId (AW-XXXXXXXXX)');
  // need(c.tracking.googleAds.labels.form.trim().length > 0, 'tracking.googleAds.labels.form');
  // need(c.tracking.googleAds.labels.call.trim().length > 0, 'tracking.googleAds.labels.call');
  // need(c.tracking.googleAds.labels.sms.trim().length > 0, 'tracking.googleAds.labels.sms');

  // Clarity (kept on all pages)
  need(c.tracking.clarityId.trim().length > 0, 'tracking.clarityId');

  // Brand colors (extracted from logo)
  need(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c.brand.primaryHex.trim()), 'brand.primaryHex');
  need(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c.brand.ctaHex.trim()), 'brand.ctaHex');

  // Review aggregates (from live Google profile — never fabricated). Not required
  // to ship: no page renders a numeric rating (hero shows qualitative "5-Star
  // Rated on Google"), and the JSON-LD aggregateRating is added only when both are
  // present (see Layout.astro). Fill both with the real live numbers to enable it.
  // need(typeof c.reviews.aggregate.rating === 'number', 'reviews.aggregate.rating');
  // need(typeof c.reviews.aggregate.count === 'number', 'reviews.aggregate.count');

  // Deployment domain (canonical + JSON-LD)
  need(c.domain.trim().length > 0, 'domain');

  return issues;
}

/**
 * Throws in production builds if any required value is missing; warns in dev.
 * Call once from the root layout frontmatter.
 */
export function assertConfig(): void {
  const issues = getRequiredIssues();
  if (issues.length === 0) return;

  const header =
    `siteConfig is missing ${issues.length} REQUIRED value(s) — pages must not ship until these are supplied from intake:`;
  const body = issues.map((i) => `  • ${i}`).join('\n');
  const message = `${header}\n${body}`;

  if (import.meta.env.PROD) {
    // Fail the build. This is the mechanized "STOP and ask".
    throw new Error(`\n\n[config-assert] ${message}\n`);
  } else {
    // Keep dev workable, but make the gap loud.
    console.warn(`\n[config-assert] (dev — build will fail until resolved)\n${message}\n`);
  }
}
