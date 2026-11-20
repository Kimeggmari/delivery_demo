import { useEffect, useState } from "react";

// Detects unfolded foldable (iPhone Duo 7.6" = 669pt portrait / 951pt landscape)
// or wide tablet/dual-screen viewports for 2-pane Master–Detail layout.
const DUO_QUERY = "(min-width: 620px), (horizontal-viewport-segments: 2)";

function matchesDuo() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(DUO_QUERY).matches;
}

export default function useDuoLayout() {
  const [isDuo, setIsDuo] = useState(matchesDuo);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia(DUO_QUERY);
    const update = () => setIsDuo(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  return isDuo;
}
