import { useEffect, useRef, useState } from "react";
import { GoogleMap } from "@capacitor/google-maps";
import { GOOGLE_MAPS_API_KEY, DEMO_HOME_COORD, storeCoordNear } from "../config/maps";
import rabbitRider from "../assets/riders/rabbit-rider.png";
import turtleRider from "../assets/riders/turtle-rider.png";

const RIDER_IMAGE = { rabbit: rabbitRider, turtle: turtleRider };
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function getCurrentCoord() {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(DEMO_HOME_COORD);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEMO_HOME_COORD),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  });
}

// Real Google Map for the tracking screen — mounted on native (Android/iOS)
// builds only, see App.jsx. The destination uses the device's real location
// when available (falling back to a fixed demo coordinate), and the "store"
// is placed a short fixed distance from it — see storeCoordNear() — so the
// map always shows a close, sane-looking delivery regardless of where the
// device actually is. The rider is a plain image overlay (not a native
// marker) positioned between the two via the map's own lat/lng <-> screen
// bounds, so it renders in full color everywhere.
export default function TrackingMap({ progress, mode, storeLabel }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [screenPath, setScreenPath] = useState(null); // { from:{xPct,yPct}, to:{xPct,yPct} }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const destCoord = await getCurrentCoord();
        if (cancelled) return;
        const storeCoord = storeCoordNear(destCoord);

        const south = Math.min(storeCoord.lat, destCoord.lat);
        const north = Math.max(storeCoord.lat, destCoord.lat);
        const west = Math.min(storeCoord.lng, destCoord.lng);
        const east = Math.max(storeCoord.lng, destCoord.lng);
        const latPad = Math.max((north - south) * 0.6, 0.004);
        const lngPad = Math.max((east - west) * 0.6, 0.004);

        const map = await GoogleMap.create({
          id: "tracking-map",
          element: containerRef.current,
          apiKey: GOOGLE_MAPS_API_KEY,
          config: {
            center: { lat: (north + south) / 2, lng: (east + west) / 2 },
            zoom: 14,
          },
        });
        if (cancelled) { await map.destroy(); return; }
        mapRef.current = map;

        await map.disableTouch();
        await map.fitBounds(
          {
            northeast: { lat: north + latPad, lng: east + lngPad },
            southwest: { lat: south - latPad, lng: west - lngPad },
            center: { lat: (north + south) / 2, lng: (east + west) / 2 },
          },
          40,
        );
        await map.addMarker({ coordinate: storeCoord, title: storeLabel });
        await map.addMarker({ coordinate: destCoord });

        // fitBounds animates the camera — give it a beat to settle before
        // reading back the bounds it actually landed on.
        await new Promise((r) => setTimeout(r, 400));
        if (cancelled) return;

        const viewBounds = await map.getMapBounds();
        const toPct = (coord) => ({
          xPct: clamp(((coord.lng - viewBounds.southwest.lng) / (viewBounds.northeast.lng - viewBounds.southwest.lng)) * 100, 4, 96),
          yPct: clamp(((viewBounds.northeast.lat - coord.lat) / (viewBounds.northeast.lat - viewBounds.southwest.lat)) * 100, 4, 96),
        });
        if (!cancelled) {
          setScreenPath({ from: toPct(storeCoord), to: toPct(destCoord) });
        }
      } catch (err) {
        console.warn("Google Map init failed", err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy().catch(() => {});
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12, textAlign: "center", padding: 16 }}>
        지도를 불러올 수 없어요
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {screenPath && (
        <img
          src={RIDER_IMAGE[mode] || RIDER_IMAGE.rabbit}
          alt=""
          style={{
            position: "absolute",
            left: `${screenPath.from.xPct + (screenPath.to.xPct - screenPath.from.xPct) * progress}%`,
            top: `${screenPath.from.yPct + (screenPath.to.yPct - screenPath.from.yPct) * progress}%`,
            transform: "translate(-50%,-50%)",
            width: 46,
            height: 46,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
            transition: "left .8s ease, top .8s ease",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
