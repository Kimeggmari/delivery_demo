import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// Fires a real OS-level notification when the (fake) delivery "completes" —
// a local push on native Android/iOS, a Web Notification API call as a
// browser fallback. Both are best-effort: most platforms suppress banners
// while the app is foregrounded, so App.jsx also shows an in-app banner
// (NotificationBanner) to make the moment felt even then.

let permissionRequested = false;

export async function ensureNotificationPermission() {
  if (permissionRequested) return;
  permissionRequested = true;

  if (Capacitor.isNativePlatform()) {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      if (display !== "granted") await LocalNotifications.requestPermissions();
    } catch (err) {
      console.warn("Local notification permission check failed", err);
    }
    return;
  }

  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch { /* ignore */ }
  }
}

export async function notifyDeliveryComplete({ title, body }) {
  if (Capacitor.isNativePlatform()) {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      if (display !== "granted") return;
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 1e9),
          title,
          body,
          smallIcon: "ic_launcher",
        }],
      });
    } catch (err) {
      console.warn("Local notification failed", err);
    }
    return;
  }

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try { new Notification(title, { body }); } catch { /* ignore */ }
  }
}
