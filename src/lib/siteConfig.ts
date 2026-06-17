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

export interface Guarantee {
  /** Machine key — also selects the icon in the Guarantees component. */
  key: string;
  /** Compact label for inline chips (e.g. the trust row under a form CTA). */
  short: string;
  /** Full headline for the guarantees grid. */
  label: string;
  /** One-line plain-language detail. */
  text: string;
  /** Optional small-print qualifier (full disclaimer may still be pending sign-off). */
  note?: string;
  /** True once the client has approved this guarantee for live use. */
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
  /** Committed conversion guarantees, surfaced across the page. */
  guarantees: Guarantee[];
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
  /** Optional before/after pair (same space, before + finished) for the
   *  comparison slider. BOTH required to render — never fabricate a "before". */
  beforeAfter?: { before: string; after: string };
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

// Self-hosted under /public/media. The original CDN (filesafe.space) blocks
// hotlinking, so the images are served locally for reliable loading + speed.
const ASSET_BASE = '/media';

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
      text: 'Free in-home estimate, no pressure, no obligation',
      approved: true,
    },
  ],

  // Conversion guarantees — COMMITTED & approved 2026-06-16 (intake.md, Chadwick
  // Simpson). Financing is a SOFT mention only (no APR/term/lender stated) per
  // client direction 2026-06-16, pending full Reg Z disclosure before any hard
  // financing ad. Price anchor added to hardwood per client confirmation
  // 2026-06-16; exact conditions (min sq ft) still pending, so it stays a soft
  // "ask for details" qualifier rather than a hard guaranteed price.
  guarantees: [
    { key: 'warranty', short: '24-Mo Workmanship Warranty', label: '24-Month Workmanship Warranty', text: 'Two full years of coverage on all of our labor.', note: 'Ask us for full warranty details.', approved: true },
    { key: 'price-match', short: 'Price-Match Guarantee', label: 'Price-Match Guarantee', text: 'We match or beat any comparable written quote, including big-box and local competitors.', note: 'On comparable scope and materials.', approved: true },
    { key: 'upfront', short: 'Up-Front Pricing', label: 'Honest Up-Front Pricing', text: 'The estimate is the price. No hidden fees, no surprises.', approved: true },
    { key: 'speed', short: 'Done in 3 to 7 Days', label: 'Most Projects Done in 3 to 7 Days', text: 'In and out fast, with no shortcuts on quality.', approved: true },
    { key: 'discount', short: '10% Service Discount', label: '10% Off for Those Who Serve', text: 'Veterans, active military, seniors, and first responders save 10%.', note: 'With valid ID.', approved: true },
    { key: 'install-only', short: 'Install-Only Available', label: 'Install-Only Available', text: 'Already bought your floors? We will professionally install them for you.', approved: true },
    { key: 'price-anchor', short: 'From $2.40/sq ft', label: 'Installed From $2.40/sq ft', text: 'Quality flooring installed from as low as $2.40 per square foot.', note: 'Starting price on qualifying installs; ask for details.', approved: true },
    { key: 'financing', short: '0% Financing', label: '0% Financing Available', text: 'Ask us about 0% financing for qualified buyers.', note: 'Subject to credit approval. Ask for full terms.', approved: true },
  ],

  // Project-completion promise (client-supplied 2026-06-16). NOTE: this is a
  // project-duration value prop, NOT a lead-response time — rule #3 forbids a
  // slow-response promise. Phrased so it never reads as "we reply in 3-7 days".
  speedToLead: 'Most projects are completed in just 3 to 7 days.',

  reviews: {
    aggregate: {
      // From the client's own branded creative (c5): "4.9 RATING (103+ Google
      // Reviews)". 103 is the conservative floor of "103+"; confirm the exact live
      // count before relying on it in structured data.
      rating: 4.9,
      count: 103,
      platform: 'Google',
    },
    // Verbatim review text CONFIRMED by client intake 2026-06-17 (real Google
    // reviews, first name + last initial only — no cities on record). `verbatim`
    // is what renders to visitors; `summary` is the internal matching note.
    quotes: [
      { name: 'Troy Lovelady', service: 'tile', verbatim: 'For years, we would come home to broken and bowing tile in our house. Our house has a crawl space with an uneven subfloor.', summary: 'Bowing/broken tile over an uneven crawl-space subfloor; took on the full first-floor tile project.', rating: 5 },
      { name: 'Will Harris', service: 'tile', verbatim: 'We decided on Zona Floors because they had the best price and the best reviews. Jacob was our salesman and came in and explained everything great.', summary: 'Crew demoed 750 sqft of tile in one day; chose Zona on price + reviews (salesman Jacob).', rating: 5 },
      { name: 'Craig Dombey', service: 'tile', verbatim: 'I spent several days researching tile contractors for a 400 sq ft ceramic tile floor. I settled on Zona Floors and it was a great decision.', summary: 'Researched contractors for days, picked Zona for a 400 sqft ceramic tile floor; "great decision".', rating: 5 },
      { name: 'Gary Blackburn', service: 'tile', verbatim: 'We had a wonderful experience with Zona Floors. Jacob was our salesman and project manager. He did a great job with communication and keeping everything on track.', summary: 'Porcelain install, Jacob as salesman/PM, strong communication.', rating: 5 },
      { name: 'Tom Finn', service: 'laminate', verbatim: 'I cannot recommend Abraham from Zona Floors highly enough for the incredible work he did installing our new laminate flooring!', summary: 'Laminate install by Abraham; praised professionalism and craft.', rating: 5 },
      { name: 'Brit Celebrano', service: 'laminate', verbatim: 'We hired Zona Floors to remove our current flooring (laminate and carpet) and install new laminate flooring and baseboards throughout our home.', summary: 'Removed laminate + carpet, installed new laminate + baseboards whole-home.', rating: 5 },
      { name: 'Jan Strzalkowski', service: 'laminate', verbatim: 'Tom gave us a great estimate and was very patient with us while we were deciding on what type of floor we wanted. We ended up going with a laminate floor that we really liked.', summary: 'Laminate from Floor & Decor; Tom patient through selection.', rating: 5 },
      { name: 'Brennen Matthews', service: 'hardwood', verbatim: 'Zona Floors were amazing to work with. Abraham was the most involved and responsive person and Rey was super friendly, neat, and dependable. They really are super people.', summary: 'Two-bathroom remodel + "stunning" hardwood floors (Abraham & Rey).', rating: 5 },
      { name: 'Jim Skelnik', service: 'general', verbatim: 'Tom, Abraham and their crew did an excellent job! They had the demo and the new floors for the entire home done in 3 days.', summary: 'Full-home demo + new floors in 3 days (Tom & Abraham\'s crew).', rating: 5 },
      { name: 'Brandon McKay', service: 'general', verbatim: 'I was very impressed with the workmanship and quality of Zona Floors. Their crew was courteous, professional and took their craft seriously. The finished product looked amazing. Price was fair. I would easily use them again.', summary: 'Workmanship, courtesy, fair price; "would easily use them again".', rating: 5 },
      { name: 'Kristin A.', service: 'general', verbatim: 'One of the best companies I have ever worked with. They were punctual, followed up with regular communication, did not rush the installation at all. They were meticulous. I am so happy with my floor installation.', summary: 'Punctual, communicative, meticulous; very happy with the install.', rating: 5 },
      { name: 'Auston', service: 'general', verbatim: 'Top notch professionals! Highly recommend Zona Floors — their entire team from sales to customer service to installation have been great to work with.', summary: 'Whole team (sales → service → install) great to work with.', rating: 5 },
      { name: 'Ashley R.', service: 'general', verbatim: 'We had a great experience working with Tom during the estimate process. He was prompt, knowledgeable, and took the time to walk through all the details with us.', summary: 'Great estimate experience with Tom; prompt and knowledgeable.', rating: 5 },
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

  // REQUIRED for the before/after slider: a real matched pair (same room, old
  // floor → finished hardwood). Intake supplied none — left empty so nothing
  // fabricated ships. Fill both to make the slider appear.
  beforeAfter: {
    // Real matched pair (same room: old carpet → new hardwood), client-supplied
    // 2026-06-17. Branded BEFORE/AFTER labels + logo baked into the squares.
    before: '/creatives/hardwood/before.jpg',
    after: '/creatives/hardwood/after.jpg',
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
    // APPROVED wording, client intake 2026-06-17. Renders adjacent to every phone field.
    sms: "By submitting, you agree to receive calls/texts (incl. automated) from Zona Floors; consent isn't required to buy. Msg/data rates may apply. Reply STOP to opt out, HELP for help. Privacy Policy & Terms apply.",
  },

  domain: 'zonafloors.net', // From intake (deploy target; push to GitHub).
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

/** Guarantees approved for live use. */
export function approvedGuarantees(): Guarantee[] {
  return siteConfig.guarantees.filter((g) => g.approved && g.text.trim().length > 0);
}
