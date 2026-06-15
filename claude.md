# Landing Page System Rules

You are building Google Ads landing pages for a local service business.
Traffic is 100% paid. The only goal is lead generation (calls, texts,
form fills). These rules override anything else.

## Non-negotiables
1. NEVER fabricate reviews, ratings, review counts, badges, photos,
   license numbers, or offers. If intake data is missing, STOP and ask.
2. Every page must contain: license number (header AND footer), the
   offer block, SMS/TCPA consent text adjacent to every phone field,
   privacy policy and terms links.
3. Never write slow response promises. The speed-to-lead line comes
   from intake only.
4. robots.txt must allow AdsBot-Google and AdsBot-Google-Mobile,
   disallow all other agents. Every page gets meta robots noindex.
   Verify both exist; they serve different purposes and AdsBot ignores
   blanket disallows only if explicitly allowed.
5. One H1 per page. H1 must contain the ad group's primary keyword
   and location. The visitor must see their search query reflected
   within the first viewport on a 390x844 mobile screen.
6. Phone numbers render in ONE consistent format sitewide: (XXX) XXX-XXXX.
   The pool swap script matches on format; inconsistent formats break
   number replacement silently.
7. All copy is hand-written per page from intake facts. No lorem ipsum,
   no placeholder anything in shipped code.

## Architecture
- Config-driven: one siteConfig.ts holds business facts, colors, offers,
  tracking IDs, consent text. Pages consume config; never hardcode
  business facts in components.
- Shared chrome (header, footer, form, badge row, review components),
  unique copy per page.
- Forms post to an internal /api/submit-lead route which forwards to the
  CRM webhook server-side. Payload must include: all form fields, page
  slug, gclid, gbraid, wbraid, msclkid, fbclid, all utm_* params, and
  the keyword param if present. Persist click IDs to localStorage on
  first touch so they survive navigation.
- Include a honeypot field (visually hidden, tabindex -1, aria-hidden).
- Forms: name, phone, ZIP maximum for residential. Phone is the only
  thing that matters; do not add email as required.

## Page anatomy (top to bottom, mobile-first)
1. Slim header: logo, license number, click-to-call button.
2. Hero: H1 (keyword + city), one-line subhead, star rating + count,
   offer line, lead form OR tap-to-call + tap-to-text pair. Hero must
   fit the offer and a CTA inside 600px of mobile viewport.
3. Trust strip: rating, count, platform badges (real ones only),
   licensed and insured line.
4. Offer block: the intake offer, stated plainly, with its own CTA.
5. Proof: 3+ real project photos with descriptive labels, 3-5 verbatim
   reviews with names. Vary reviews per page when supply allows.
6. Problem / Solution section (2-4 concrete pain points, specific
   craft details, no generic filler).
7. Three-step process.
8. Final form section repeating the offer and speed promise.
9. Footer: NAP, license, privacy, terms.
10. Sticky mobile bar: call button + text button, visible after the
    user scrolls past the hero.

## Conversion tracking
- Load gtag with the Google Ads conversion ID on every page.
- Fire conversion events for: form submit (on thank-you page),
  tel: link clicks, sms: link clicks. Use distinct labels.
- Thank-you page is a real route (/thank-you), fires the form
  conversion exactly once, restates the speed promise, and asks 1-2
  optional qualifying questions (rooms, sqft, timeline) that post as
  a contact update. Never a dead end.
- Keep Clarity on all pages.

## Performance budget
- LCP under 2.0s on simulated 4G, CLS under 0.1, total JS under 150KB
  gzipped, hero image properly sized and priority-loaded, fonts
  self-hosted or swap.


PROMPT 1: Scaffold
Read CLAUDE.md and the intake block below. Build the project scaffold
only. No landing pages yet.

[PASTE COMPLETED INTAKE]

Tasks:
1. Init the project (Next.js App Router, TypeScript, Tailwind).
2. Create siteConfig.ts populated entirely from intake. Add a build-time
   assertion that fails the build if any REQUIRED config value is empty,
   including offers, consent text, license, and conversion IDs.
3. Build shared components: Header, Footer, StickyMobileBar, LeadForm
   (with honeypot, consent text, click-ID capture from URL +
   localStorage), TrustStrip, ReviewCard, OfferBlock, ProcessSteps,
   ProblemSolution, ProjectGallery.
4. Build /api/submit-lead: validate, drop honeypot hits silently,
   forward to the CRM webhook with full attribution payload, return
   fast, redirect client to /thank-you.
5. Build /thank-you per CLAUDE.md, /privacy, /terms.
6. robots.txt per CLAUDE.md, noindex metadata in the root layout,
   LocalBusiness JSON-LD fed from siteConfig.
7. Wire gtag + Clarity in the layout with IDs from config. Create a
   trackConversion(label) helper used by tel:, sms:, and the thank-you
   page.

Gate: run the build, then prove with grep output that (a) no component
contains a hardcoded phone number, license, or business name, (b) every
phone number rendered uses the single canonical format, (c) consent text
renders adjacent to every phone input. Show me the /api/submit-lead
payload shape.
