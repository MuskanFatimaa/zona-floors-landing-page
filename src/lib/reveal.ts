/**
 * reveal.ts, dependency-free scroll-reveal.
 *
 * Sections marked `data-reveal` fade/slide in as they enter the viewport. The
 * animation itself is defined in global.css and only exists inside a
 * `prefers-reduced-motion: no-preference` media query, so reduced-motion users
 * always see static, fully-visible content. This module just toggles the
 * `is-visible` class; it never animates anything itself.
 *
 * <1KB, no deps, one IntersectionObserver. Safe to call on every page load.
 */
export function initReveal(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (els.length === 0) return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Reduced motion OR no IntersectionObserver → just show everything immediately.
  if (reduceMotion || typeof IntersectionObserver === "undefined") {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );

  els.forEach((el) => observer.observe(el));
}
