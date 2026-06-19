import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const ROOT = path.resolve(".");
const OUT = path.join(ROOT, "store-assets");
await mkdir(OUT, { recursive: true });

// 1. Feature graphic: 1024x500 PNG
await sharp(path.join(OUT, "feature-graphic.svg"))
  .resize(1024, 500)
  .png()
  .toFile(path.join(OUT, "feature-graphic.png"));
console.log("✓ feature-graphic.png (1024x500)");

// 2. App icon for Play Store: 512x512 PNG (round corners handled by Google)
await sharp(path.join(ROOT, "assets", "icon-only.svg"))
  .resize(512, 512)
  .png()
  .toFile(path.join(OUT, "app-icon-512.png"));
console.log("✓ app-icon-512.png (512x512)");
