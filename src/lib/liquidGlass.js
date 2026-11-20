import { useEffect, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";

// Bridges Apple's native iOS 26/27 Metal UIGlassEffect / UIGlassContainerEffect
// chrome (defined in ios/App/App/MainViewController.swift) into React.
export const LiquidGlass = registerPlugin("LiquidGlass");

export function isNativeLiquidGlassPlatform() {
  return Capacitor.getPlatform() === "ios";
}

export function useNativeLiquidGlass() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!isNativeLiquidGlassPlatform()) return undefined;
    let cancelled = false;
    LiquidGlass.isAvailable()
      .then((res) => {
        if (!cancelled && res?.available) setAvailable(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return available;
}
