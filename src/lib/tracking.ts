/**
 * tracking.ts — client-side attribution capture + conversion firing.
 *
 * Loaded as an Astro client island (`<script>` in components). It reads the
 * Google Ads IDs from `window.__ZF_TRACKING`, which the root layout injects
 * server-side from siteConfig — so we never bundle the whole config (or any
 * server-only value) into the browser, keeping JS within the budget.
 *
 * Click IDs are captured on first touch and persisted to localStorage so they
 * survive navigation between the ad landing page and the form/thank-you page.
 */

/** Attribution params we capture from the URL (claude.md "Architecture"). */
export const ATTRIBUTION_PARAMS = [
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'fbclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'keyword',
] as const;

export type AttributionParam = (typeof ATTRIBUTION_PARAMS)[number];
export type Attribution = Partial<Record<AttributionParam, string>>;

const STORAGE_KEY = 'zf_attribution';

function readStore(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Attribution;
  } catch {
    return {};
  }
}

/**
 * First-touch capture: merge any attribution params from the current URL into
 * localStorage WITHOUT overwriting values already stored on an earlier visit.
 * Safe to call on every page load. Returns the merged attribution.
 */
export function captureClickIds(): Attribution {
  if (typeof window === 'undefined') return {};
  const stored = readStore();
  const url = new URLSearchParams(window.location.search);
  let changed = false;

  for (const key of ATTRIBUTION_PARAMS) {
    const value = url.get(key);
    if (value && !stored[key]) {
      stored[key] = value;
      changed = true;
    }
  }

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* storage unavailable (private mode) — fail silently */
    }
  }
  return stored;
}

/** The stored first-touch attribution. Used to populate hidden form fields. */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  return readStore();
}

/**
 * Fire a Google Ads conversion for the given action label
 * ('form' | 'call' | 'sms'). No-ops with a warning if tracking isn't configured
 * yet (e.g. during scaffold/dev before IDs are supplied).
 */
export function trackConversion(action: 'form' | 'call' | 'sms'): void {
  if (typeof window === 'undefined') return;
  const t = window.__ZF_TRACKING;
  const label = t?.labels?.[action];

  if (!t?.conversionId || !label) {
    console.warn(`[tracking] conversion "${action}" skipped — Google Ads ID/label not configured.`);
    return;
  }
  if (typeof window.gtag !== 'function') {
    console.warn('[tracking] gtag not loaded — conversion not fired.');
    return;
  }
  window.gtag('event', 'conversion', {
    send_to: `${t.conversionId}/${label}`,
  });
}
