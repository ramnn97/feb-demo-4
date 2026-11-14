import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

type BubbleMenuItem = {
  label: string;
  href: string;
  number: string;
  ariaLabel?: string;
};

const items: BubbleMenuItem[] = [
  { label: "Home", href: "#top", number: "00" },
  { label: "Client", href: "/client", number: "01" },
  { label: "Career", href: "/career", number: "02" },
  { label: "Solution", href: "/solutions", number: "03" },
  { label: "Let’s talk", href: "https://calendly.com/facebuilds", number: "04" },
];

export function BubbleMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);
  const filteredItems = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const links = linksRef.current.filter(Boolean);

    if (open) {
      gsap.set(overlay, { display: "flex" });
      gsap.set(links, { y: 24, autoAlpha: 0 });
      links.forEach((link, index) => {
        gsap.to(link, { y: 0, autoAlpha: 1, duration: 0.38, delay: index * 0.055, ease: "power3.out" });
      });
      searchRef.current?.focus({ preventScroll: true });
    } else {
      gsap.to(links, {
        y: 14,
        autoAlpha: 0,
        duration: 0.14,
        ease: "power2.in",
        onComplete: () => gsap.set(overlay, { display: "none" }),
      });
    }

    return () => gsap.killTweensOf([overlay, ...links]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const oldOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.documentElement.style.overflow = oldOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="responsive-bubble-menu">
      <a className="responsive-bubble-logo" href="#top" aria-label="FaceBuilds home">
        <img src="/logo-transparent.png" alt="FaceBuilds" />
      </a>
      <button
        className="responsive-bubble-toggle"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="responsive-bubble-links"
        tabIndex={open ? -1 : 0}
      >
        <span /><span />
      </button>
      <div className="responsive-bubble-overlay" id="responsive-bubble-links" ref={overlayRef} aria-hidden={!open} inert={!open}>
        <button className="responsive-bubble-close" type="button" onClick={() => setOpen(false)} aria-label="Close navigation">
          <span /><span />
        </button>
        <nav aria-label="Main navigation">
          <label className="responsive-menu-search">
            <span className="responsive-menu-search-label">Search</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4.2 4.2" /></svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search navigation"
              placeholder="Menu"
            />
          </label>
          {filteredItems.map((item, index) => (
            <a
              href={item.href}
              target={item.href.startsWith("https://") ? "_blank" : undefined}
              rel={item.href.startsWith("https://") ? "noreferrer" : undefined}
              key={item.label}
              aria-label={item.ariaLabel ?? item.label}
              target={item.href.startsWith("https://") ? "_blank" : undefined}
              rel={item.href.startsWith("https://") ? "noreferrer" : undefined}
              onClick={() => { setOpen(false); setQuery(""); }}
              ref={(element) => { if (element) linksRef.current[index] = element; }}
            >
              <span className="responsive-menu-link-label">{item.label}</span>
              <span className={`responsive-menu-link-number responsive-menu-number-${index % 4}`}>{item.number}.</span>
            </a>
          ))}
          {filteredItems.length === 0 && <p className="responsive-menu-empty">No matching pages</p>}
        </nav>
      </div>
    </div>
  );
}
