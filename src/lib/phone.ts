/**
 * phone.ts, the single canonical phone format used sitewide.
 *
 * claude.md non-negotiable #6: every rendered phone number uses the format
 * (XXX) XXX-XXXX. The GHL/CallRail pool-swap script matches on this exact
 * format; an inconsistent format breaks number replacement silently.
 *
 * Display strings always go through `formatPhone`. tel:/sms: hrefs always go
 * through `telHref` / `smsHref` so links and display stay in lockstep.
 */

/** Strips everything but digits, dropping a leading US country code. */
export function digits(input: string): string {
  const d = input.replace(/\D/g, '');
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
}

/** Canonical display format: (XXX) XXX-XXXX. Throws on a non-10-digit input. */
export function formatPhone(input: string): string {
  const d = digits(input);
  if (d.length !== 10) {
    throw new Error(`phone.ts: expected a 10-digit US number, got "${input}" (${d.length} digits)`);
  }
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** tel: href, e.g. tel:+14805658236 */
export function telHref(input: string): string {
  return `tel:+1${digits(input)}`;
}

/** sms: href, e.g. sms:+14805658236 */
export function smsHref(input: string): string {
  return `sms:+1${digits(input)}`;
}
