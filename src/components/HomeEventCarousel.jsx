import { useEffect, useRef, useState } from "react";

const SLIDE_BG = [
  "linear-gradient(135deg,#0f766e,#14b8a6)",
  "linear-gradient(135deg,#4f46e5,#7c3aed)",
  "linear-gradient(135deg,#ea580c,#f97316)",
];

// Auto-advancing promo banners (swipeable, scroll-snap based).
// slides: [{ tag, title, sub, emoji }]
export default function HomeEventCarousel({ slides }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  const onScroll = () => {
    const el = ref.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div style={{ minWidth: 0 }}>
      <div
        ref={ref}
        onScroll={onScroll}
        role="region"
        aria-label="Events"
        tabIndex={0}
        className="noScrollbar"
        style={{
          display: "flex", overflowX: "auto", scrollSnapType: "x mandatory",
          borderRadius: 20, WebkitOverflowScrolling: "touch",
          boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
        }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            style={{
              flex: "0 0 100%", scrollSnapAlign: "start", minHeight: 124, position: "relative", overflow: "hidden",
              background: SLIDE_BG[i % SLIDE_BG.length], color: "#fff", padding: "18px 20px", boxSizing: "border-box",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "inline-block", fontSize: 10, fontWeight: 900, background: "rgba(255,255,255,0.22)", borderRadius: 999, padding: "4px 10px", letterSpacing: 0.2 }}>{s.tag}</span>
              <div style={{ fontSize: 18, fontWeight: 900, marginTop: 9, lineHeight: 1.3, letterSpacing: -0.3 }}>{s.title}</div>
              <div style={{ fontSize: 12, opacity: 0.88, marginTop: 5, lineHeight: 1.45 }}>{s.sub}</div>
            </div>
            <div style={{
              width: 68, height: 68, borderRadius: 999, flexShrink: 0,
              background: "rgba(255,255,255,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, lineHeight: 1,
            }}>{s.emoji}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
        {slides.map((_, i) => (
          <span key={i} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 999, background: i === index ? "#f97316" : "#fed7aa", transition: "width .2s, background-color .2s" }} />
        ))}
      </div>
    </div>
  );
}
