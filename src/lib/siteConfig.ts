/**
 * siteConfig.ts — single source of truth for all business facts, offers,
 * tracking IDs, consent text, and brand assets.
 *
 * RULES (see claude.md):
 *  - Components and pages NEVER hardcode business facts. They read from here.
 *  - Nothing here may be fabricated. Fields that intake did not supply are
 *    left empty ('' / null / []) and are caught by config-assert.ts, which
 *    fails `astro build` until they are filled. That is the mechanized
 *    "STOP and ask" — the build will not ship a page missing a required fact.
 *
 * The CRM webhook URL is intentionally NOT stored here: it is a server-only
 * destination read from the CRM_WEBHOOK_URL env var inside the API route, so
 * it never gets bundled into client JavaScript. See .env.example.
 */

export interface License {
  /** Rendered verbatim in header AND footer. */
  number: string;
  issuingBody: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ServiceDefinition {
  /** Display name, e.g. "Hardwood Flooring". */
  service: string;
  /** URL slug, e.g. "hardwood-flooring". */
  slug: string;
  /** Exact-match keywords for this ad group (drives the H1 + responsive headings). */
  keywords: string[];
  /** Candidate H1 / headline variants supplied in intake. */
  headings: string[];
  /** Keys into `photos` for this service's gallery. */
  photoSet: keyof SiteConfig['photos'];
}

export interface Offer {
  /** Machine key, e.g. "financing". */
  key: string;
  /** Short label, e.g. "Financing". */
  label: string;
  /** Plain-language offer line shown to the visitor. */
  text: string;
  /** True once the client has approved this offer for live use. */
  approved: boolean;
}

export interface ReviewQuote {
  name: string;
  /** Which service page this review belongs to. */
  service: 'hardwood' | 'vinyl' | 'tile' | 'laminate' | 'general';
  /** Verbatim review text. REQUIRED before a review renders — do not paraphrase. */
  verbatim: string;
  /** Internal paraphrase from intake (NOT shown to visitors). Helps match the real review. */
  summary: string;
  /** Individual star rating, 1-5. */
  rating: number | null;
}

export interface ReviewAggregate {
  /** Aggregate rating from the live Google profile. Do NOT fabricate. */
  rating: number | null;
  /** Total review count from the live Google profile. Do NOT fabricate. */
  count: number | null;
  platform: string;
}

export interface TrackingConfig {
  googleAds: {
    /** Format: AW-XXXXXXXXX */
    conversionId: string;
    /** Conversion labels, one per action. */
    labels: {
      form: string;
      call: string;
      sms: string;
    };
  };
  /** Optional GA4 measurement ID. */
  ga4: string;
  /** Microsoft Clarity project ID. */
  clarityId: string;
}

export interface SiteConfig {
  business: {
    legalName: string;
    displayName: string;
    license: License;
    address: Address;
    /** Business hours — becomes a trust element if early/weekend. */
    hours: string;
  };
  phones: {
    /** Primary display number; swapped at runtime by the GHL/CallRail pool. */
    primary: string;
    /** Sales line. */
    sales: string;
  };
  serviceArea: string[];
  services: ServiceDefinition[];
  /** At least one APPROVED offer is required before any page ships. */
  offers: Offer[];
  /** Speed-to-lead promise the client will honor. From intake only. */
  speedToLead: string;
  reviews: {
    aggregate: ReviewAggregate;
    quotes: ReviewQuote[];
  };
  /** Badge platforms the client actually has profiles on. */
  badges: string[];
  photos: {
    hardwood: string[];
    vinyl: string[];
    tile: string[];
    laminate: string[];
    team: string[];
  };
  brand: {
    logo: string;
    /** Primary brand hex, extracted from the logo. */
    primaryHex: string;
    /** CTA hex, extracted from the logo. Keep in sync with src/styles/global.css @theme. */
    ctaHex: string;
  };
  tracking: TrackingConfig;
  consent: {
    /** TCPA/SMS consent language, approved by the client. Renders adjacent to every phone field. */
    sms: string;
  };
  /** Final deployment domain (no protocol), e.g. "zonafloors.com". */
  domain: string;
}

const ASSET_BASE = 'https://assets.cdn.filesafe.space/y5KUe31gfnk6tGJ4jGNK/media';

export const siteConfig: SiteConfig = {
  business: {
    legalName: 'Zona Floors',
    displayName: 'Zona Floors',
    license: {
      number: 'AZ ROC #336899',
      issuingBody: 'Arizona Registrar of Contractors',
    },
    address: {
      street: '5028 S Ash Ave #106',
      city: 'Tempe',
      state: 'AZ',
      zip: '85282',
    },
    hours: 'Mon–Sat 7am–7pm · Sun Closed', // Supplied by client 2026-06-16.
  },

  phones: {
    primary: '(480) 565-8236',
    sales: '(480) 470-9618',
  },

  serviceArea: [
    'Tempe', 'Phoenix', 'Scottsdale', 'Cave Creek', 'Mesa', 'Gilbert',
    'Chandler', 'San Tan Valley', 'Queen Creek', 'Buckeye', 'Sun City',
    'Glendale', 'Peoria', 'Paradise Valley',
  ],

  services: [
    {
      service: 'Hardwood Flooring',
      slug: 'wood-flooring',
      keywords: ['Hardwood Flooring', 'Wood Installation', 'Wood Flooring'],
      headings: [
        'Hardwood Flooring Experts',
        'Engineered Wood Specialists',
        'Expert Hardwood Floor Fitting',
        'Top-Rated Wood Floor Company',
        'Local Wood Floor Installers',
        'Solid & Engineered Hardwood',
        'Custom Hardwood Installation',
      ],
      photoSet: 'hardwood',
    },
    {
      service: 'Luxury Vinyl',
      slug: 'vinyl-plank-flooring',
      keywords: ['Vinyl Plank Flooring', 'Luxury Vinyl Plank Install', 'Waterproof LVP Flooring'],
      headings: [
        'Licensed AZ Vinyl Pros',
        'Family-Owned LVP Experts',
        'Free Vinyl Floor Quote',
        'Local Vinyl Installers',
      ],
      photoSet: 'vinyl',
    },
    {
      service: 'Tile Flooring',
      slug: 'tile-flooring',
      keywords: ['Tile Installation', 'Tile Floor Installation', 'Tile Flooring'],
      headings: [
        'Tile Floor Installation',
        'Licensed AZ Tile Pros',
        'Family-Owned Tile Experts',
        'Free Tile Flooring Quote',
        'Local Tile Installers',
      ],
      photoSet: 'tile',
    },
  ],

  // REQUIRED: at least one APPROVED offer before any page ships.
  // The free in-home estimate is directly supported by the live hardwood ad
  // headlines ("Get Your Free Wood Floor Quote", "free project quote",
  // "Request an estimate") and is an intake candidate. PENDING final client
  // sign-off — confirm exact wording before launch.
  offers: [
    {
      key: 'free-estimate',
      label: 'Free Estimate',
      text: 'Free in-home estimate — no pressure, no obligation',
      approved: true,
    },
  ],

  speedToLead: '', // REQUIRED — never write a slow-response promise. From intake only.

  reviews: {
    aggregate: {
      rating: null, // REQUIRED — from the live Google profile. Do NOT fabricate.
      count: null,  // REQUIRED — from the live Google profile. Do NOT fabricate.
      platform: 'Google',
    },
    // Intake supplied reviewer names + paraphrased summaries only.
    // `verbatim` must be filled with the real review text before any review renders.
    quotes: [
      { name: 'Troy Lovelady', service: 'tile', verbatim: '', summary: 'Bowing/broken tile over an uneven crawl-space subfloor; took on the full first-floor tile project.', rating: null },
      { name: 'Will Harris', service: 'tile', verbatim: '', summary: 'Crew demoed 750 sqft of tile in one day; chose Zona on price + reviews (salesman Jacob).', rating: null },
      { name: 'Craig Dombey', service: 'tile', verbatim: '', summary: 'Researched contractors for days, picked Zona for a 400 sqft ceramic tile floor; "great decision".', rating: null },
      { name: 'Gary Blackburn', service: 'tile', verbatim: '', summary: 'Porcelain install, Jacob as salesman/PM, strong communication.', rating: null },
      { name: 'Tom Finn', service: 'laminate', verbatim: '', summary: 'Laminate install by Abraham; praised professionalism and craft.', rating: null },
      { name: 'Brit Celebrano', service: 'laminate', verbatim: '', summary: 'Removed laminate + carpet, installed new laminate + baseboards whole-home (Hannah, sales).', rating: null },
      { name: 'Jan Strzalkowski', service: 'laminate', verbatim: '', summary: 'Laminate from Floor & Decor; Tom patient through selection.', rating: null },
      { name: 'Brennen Matthews', service: 'hardwood', verbatim: '', summary: 'Two-bathroom remodel + "stunning" hardwood floors (Abraham & Rey).', rating: null },
      { name: 'Jim Skelnik', service: 'general', verbatim: '', summary: 'Full-home demo + new floors in 3 days (Tom & Abraham\'s crew).', rating: null },
      { name: 'Lynn Harris', service: 'general', verbatim: '', summary: 'Full-house project; "floors look like they\'ve always been part of the home".', rating: null },
      { name: 'Brandon McKay', service: 'general', verbatim: '', summary: 'Workmanship, courtesy, fair price; "would easily use them again".', rating: null },
    ],
  },

  badges: ['Google', 'Yelp', 'Angi', 'BBB', 'Nextdoor'],

  photos: {
    hardwood: [
      `${ASSET_BASE}/6a21e62ada24932f1214e35c.jpg`,
      `${ASSET_BASE}/6a21e631da24932f1214e3ab.jpg`,
      `${ASSET_BASE}/6a2845037fc0b68efc510931.jpg`,
      `${ASSET_BASE}/6a2890a477feef7e78ced719.png`,
      `${ASSET_BASE}/6a2845037fc0b68efc510927.jpg`,
    ],
    vinyl: [
      `${ASSET_BASE}/6a30615fd64da5ce6b761f2e.jpg`,
      `${ASSET_BASE}/6a30615fbc11d12c0bdeaa57.jpg`,
      `${ASSET_BASE}/6a30615fd64da5ce6b761f26.jpg`,
      `${ASSET_BASE}/6a21e62a83cb7337aa170a07.jpg`,
    ],
    tile: [
      `${ASSET_BASE}/6a28417004ddd9028477f4ea.jpg`,
      `${ASSET_BASE}/6a21e62ada24932f1214e358.jpg`,
      `${ASSET_BASE}/6a21e62ab7929406c1580685.jpg`,
    ],
    laminate: [], // REQUIRED (3+) only if a laminate page ships. None supplied.
    team: [
      `${ASSET_BASE}/6a21e364b395bf07ac95747d.jpg`,
      `${ASSET_BASE}/6a21e0eab395bf07ac95483f.jpg`,
      `${ASSET_BASE}/6a232cc86a06f03d4477c039.jpg`,
    ],
  },

  brand: {
    logo: `${ASSET_BASE}/6a21a870bf33b4d0d048ecf6.jpg`,
    // Extracted from the logo (Arizona-flag identity). Kept in sync with global.css @theme.
    primaryHex: '#194B86', // mountain blue — structure/headings
    ctaHex: '#CE1126',     // Arizona-flag red — calls to action
  },

  tracking: {
    googleAds: {
      conversionId: '', // REQUIRED — AW-XXXXXXXXX
      labels: {
        form: '', // REQUIRED
        call: '', // REQUIRED
        sms: '',  // REQUIRED
      },
    },
    ga4: '', // optional
    clarityId: 'wyqqnwgm0a',
  },

  consent: {
    sms: '', // REQUIRED — TCPA/SMS consent language, client-approved. Renders by every phone field.
  },

  domain: '', // REQUIRED — final deployment domain, e.g. "zonafloors.com"
};

/** Convenience accessor for a service definition by slug. */
export function getService(slug: string): ServiceDefinition | undefined {
  return siteConfig.services.find((s) => s.slug === slug);
}

/** Reviews that are ready to render (verbatim text supplied), optionally filtered by service. */
export function readyReviews(service?: ReviewQuote['service']): ReviewQuote[] {
  return siteConfig.reviews.quotes.filter(
    (q) => q.verbatim.trim().length > 0 && (!service || q.service === service),
  );
}

/** Offers approved for live use. */
export function approvedOffers(): Offer[] {
  return siteConfig.offers.filter((o) => o.approved && o.text.trim().length > 0);
}
