// Resizes + JPEG-compresses a user-picked photo client-side and returns a
// data URL small enough to store directly as a Firestore field (menu/
// restaurant photos, capped well under Firestore's 1MiB document limit).

const MAX_DIMENSION = 480;
const JPEG_QUALITY = 0.72;

export function compressImageFile(file, { maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}
