import { useEffect, useState } from "react";

// iPhone Duo keeps its camera, Dynamic Island and status bar in a column along
// one side of the display (the folded cover screen and the unfolded inner
// display held in landscape). Per the HIG ("Designing for iPhone Duo" →
// Vertical controls), tab bars and toolbars line up vertically in that same
// column, on the camera side, so they stay put as the device opens and closes.
// This hook reports which side has such a column: "right" | "left" | null.
function measureSide() {
  if (typeof document === "undefined" || !document.body) return null;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;" +
    "padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)";
  document.body.appendChild(probe);
  const s = getComputedStyle(probe);
  const left = parseFloat(s.paddingLeft) || 0;
  const right = parseFloat(s.paddingRight) || 0;
  probe.remove();
  // A rail needs room; ignore the slim side insets of a landscape notch phone.
  if (right >= 60 && right >= left) return "right";
  if (left >= 60) return "left";
  return null;
}

export default function useEdgeRailSide() {
  const [side, setSide] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let timer;
    const update = () => {
      clearTimeout(timer);
      // Safe-area values settle a moment after a fold/rotation resize.
      timer = setTimeout(() => setSide(measureSide()), 150);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return side;
}
