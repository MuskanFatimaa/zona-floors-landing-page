/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ZfTracking {
  conversionId: string;
  labels: { form: string; call: string; sms: string };
}

interface Window {
  /** Injected server-side by the root layout from siteConfig. */
  __ZF_TRACKING?: ZfTracking;
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
  clarity?: (...args: unknown[]) => void;
}

interface ImportMetaEnv {
  /** Server-only CRM webhook destination. Read in the API route, never client. */
  readonly CRM_WEBHOOK_URL: string;
}
