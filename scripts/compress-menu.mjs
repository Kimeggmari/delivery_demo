import sharp from "sharp";
import { readdir, stat, rename, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve("public/menu");
const BACKUP = path.resolve("public/menu-original");
const MAX_DIM = 800;
const WEBP_QUALITY = 78;

if (!existsSync(BACKUP)) await mkdir(BACKUP);

const files = (await readdir(SRC)).filter(f => /\.(png|jpe?g)$/i.test(f));
let before = 0, after = 0;

for (const file of files) {
  const src = path.join(SRC, file);
  const backup = path.join(BACKUP, file);
  const base = file.replace(/\.(png|jpe?g)$/i, "");
  const out = path.join(SRC, `${base}.webp`);

  if (existsSync(backup)) continue;          // already processed
  if (file.endsWith(".webp")) continue;

  const beforeSize = (await stat(src)).size;
  before += beforeSize;

  await rename(src, backup);                  // move original to backup
  await sharp(backup)
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(out);

  const afterSize = (await stat(out)).size;
  after += afterSize;
  console.log(`${file.padEnd(15)} ${(beforeSize/1024).toFixed(0).padStart(6)} KB  →  ${path.basename(out).padEnd(15)} ${(afterSize/1024).toFixed(0).padStart(5)} KB`);
}

console.log(`\nTotal: ${(before/1024/1024).toFixed(1)} MB  →  ${(after/1024/1024).toFixed(1)} MB`);
console.log(`Saved: ${((before-after)/1024/1024).toFixed(1)} MB (${((1-after/before)*100).toFixed(0)}%)`);
