import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight, X } from "lucide-react";

export function WhyChooseSection() {
  const [expanded, setExpanded] = useState(false);
  const [near, setNear] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollReveal, setScrollReveal] = useState(0);
  const [scrollRadius, setScrollRadius] = useState(0);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const expansionRef = useRef<HTMLDivElement>(null);
  const dismissedOnMobileRef = useRef(false);
  const scrollRevealRef = useRef(0);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 800px), (pointer: coarse)");
    const syncMode = () => setIsMobile(query.matches);
    syncMode();
    query.addEventListener("change", syncMode);
    return () => query.removeEventListener("change", syncMode);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setScrollReveal(0);
      setScrollRadius(0);
      return;
    }

    let frame = 0;
    const updateScrollReveal = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) return;
        const bounds = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (bounds.bottom <= 0 || bounds.top >= viewportHeight) {
          if (dismissedOnMobileRef.current) dismissedOnMobileRef.current = false;
          if (!dismissedOnMobileRef.current) {
            scrollRevealRef.current = 0;
            setScrollReveal(0);
            setScrollRadius(0);
            setExpanded(false);
          }
          return;
        }
        if (dismissedOnMobileRef.current) return;

        const centerHold = viewportHeight * 0.08;
        const scrollRange = Math.max(1, viewportHeight - centerHold);
        const enteringProgress = (viewportHeight - bounds.top) / scrollRange;
        const leavingProgress = (bounds.bottom - centerHold) / scrollRange;
        const sectionProgress = Math.max(0, Math.min(1, enteringProgress, leavingProgress));
        const revealStart = 0.8;
        const progress = Math.max(0, Math.min(1, (sectionProgress - revealStart) / (1 - revealStart)));
        if (progress > 0 && scrollRevealRef.current === 0) {
          setOrigin({ x: window.innerWidth / 2, y: viewportHeight / 2 });
        }
        scrollRevealRef.current = progress;
        setScrollReveal(progress);
        setScrollRadius(progress * Math.max(window.innerWidth, viewportHeight) * 1.5);
        setExpanded(progress >= 0.995);
      });
    };

    window.addEventListener("scroll", updateScrollReveal, { passive: true });
    window.addEventListener("resize", updateScrollReveal);
    updateScrollReveal();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateScrollReveal);
      window.removeEventListener("resize", updateScrollReveal);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    if (!isMobile) document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
        window.setTimeout(() => triggerRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (!isMobile) document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, isMobile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (expanded) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [expanded, near, scrollReveal]);

  function openPanel() {
    dismissedOnMobileRef.current = false;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setExpanded(true);
  }

  function openPanelFromPointer() {
    if (!window.matchMedia("(max-width: 800px), (pointer: coarse)").matches) openPanel();
  }

  function closePanel() {
    if (isMobile) dismissedOnMobileRef.current = true;
    setExpanded(false);
    setNear(false);
    setScrollReveal(0);
    scrollRevealRef.current = 0;
    triggerRef.current?.style.setProperty("--proximity-scale", "1");
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  function updateProximity(event: PointerEvent<HTMLElement>) {
    if (window.matchMedia("(max-width: 800px), (pointer: coarse)").matches) return;
    const button = triggerRef.current;
    if (!button) return;
    const bounds = button.getBoundingClientRect();
    const distance = Math.hypot(event.clientX - (bounds.left + bounds.width / 2), event.clientY - (bounds.top + bounds.height / 2));
    const proximity = Math.max(0, 1 - distance / 360);
    button.style.setProperty("--proximity-scale", (1 + proximity * 0.26).toFixed(3));
    expansionRef.current?.style.setProperty("--preview-scale", (0.4 + proximity * 0.6).toFixed(3));
    expansionRef.current?.style.setProperty("--preview-radius", `${Math.round(80 + proximity * 220)}px`);
    const isNear = proximity > 0.04;
    if (isNear && !near && !expanded) setOrigin({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
    setNear(isNear && !expanded);
  }

  return (
    <section ref={sectionRef} className="why-choose-section" id="why-choose" aria-labelledby="why-choose-title" onPointerMove={updateProximity} onPointerLeave={() => { triggerRef.current?.style.setProperty("--proximity-scale", "1"); setNear(false); }}>
      <div className="why-choose-content">
        <p className="section-label">WHY CHOOSE US</p>
        <h2 id="why-choose-title">Why choose <em>us?</em></h2>
        <button ref={triggerRef} className="why-choose-trigger" type="button" onClick={openPanel} onPointerEnter={openPanelFromPointer} onPointerMove={updateProximity} aria-haspopup="dialog" aria-expanded={expanded}>
          <span>Move closer</span><ArrowUpRight aria-hidden="true" />
        </button>
      </div>

      <div
        ref={expansionRef}
        className={`why-choose-expansion${near ? " is-near" : ""}${scrollReveal > 0 && !expanded ? " is-scroll-revealing" : ""}${expanded ? " is-open" : ""}`}
        style={{ "--reveal-x": `${origin.x}px`, "--reveal-y": `${origin.y}px`, "--scroll-radius": `${scrollRadius}px`, "--video-progress": `${0.2 + scrollReveal * 0.8}` } as CSSProperties}
        role={expanded ? "dialog" : undefined}
        aria-modal={expanded || undefined}
        aria-label="Why choose FaceBuilds"
        aria-hidden={!expanded}
      >
        {expanded && <button className="why-choose-close" type="button" onClick={closePanel} aria-label="Close video"><X aria-hidden="true" /></button>}
        <div className="why-choose-expanded-content">
          {(near || scrollReveal > 0 || expanded) && (
            <video
              ref={videoRef}
              className="why-choose-video"
              src="/why-choose-video.mp4"
              autoPlay={expanded}
              loop
              playsInline
              controls
              preload="auto"
              aria-label="FaceBuilds video"
            />
          )}
        </div>
      </div>
    </section>
  );
}
