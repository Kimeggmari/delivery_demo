// Firebase anonymous-auth UID of the developer's own device — grants
// moderation rights (approve/reject pending customRestaurants/customMenus).
// Mirrored manually in firestore.rules' isAdmin() function since security
// rules can't import this file.
export const ADMIN_UID = "REPLACE_WITH_YOUR_UID";
