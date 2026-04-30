import { useMemo, useState } from "react";

export default function MenuImage({
  src,
  alt,
  width = 92,
  height = 92,
  borderRadius = 16,
  label = "??? ???",
}) {
  const candidates = useMemo(() => {
    if (Array.isArray(src)) return src.filter(Boolean);
    return src ? [src] : [];
  }, [src]);

  const [failedSources, setFailedSources] = useState([]);
  const currentSrc = candidates.find((candidate) => !failedSources.includes(candidate));
  const showImage = Boolean(currentSrc);

  const wrapperStyle = {
    width,
    height,
    borderRadius,
    overflow: "hidden",
    flexShrink: 0,
    background: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
    border: "1px solid #e5e7eb",
    position: "relative",
  };

  const handleError = () => {
    if (!currentSrc) return;
    setFailedSources((prev) => (prev.includes(currentSrc) ? prev : [...prev, currentSrc]));
  };

  if (!showImage) {
    return (
      <div style={{ ...wrapperStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: 10, textAlign: "center" }}>
        <span style={{ fontSize: 11, lineHeight: 1.45, color: "#64748b", fontWeight: 700 }}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onError={handleError}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}
