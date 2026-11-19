// Firebase anonymous-auth UIDs of the developer's own devices/browsers —
// each origin (web browser, Android app, iOS app) gets its own separate
// anonymous identity, so every one that should have moderation rights
// (approve/reject pending customRestaurants/customMenus) needs listing here.
// Mirrored manually in firestore.rules' isAdmin() function since security
// rules can't import this file.
const ADMIN_UIDS = [
  "M9CroYw64wejaVzizvTdi1pMA7s1", // web browser
  "sqfzuAly3DYxbZUJyou0qKEbFSA3", // Android app
  "G0Jb4L7NFccBCXDsBAbO7jYCGum1", // notebook
  "1UjHah0eKahNm0scYAuzDM1C0883", // notebook (Whale browser)
];

export function isAdminUid(uid) {
  return ADMIN_UIDS.includes(uid);
}
