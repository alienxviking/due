// Rasterises public/icons/icon.svg into the PNG sizes the PWA manifest and iOS need.
// Run: node scripts/icons.mjs
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const svg = await readFile("public/icons/icon.svg");
const out = [
  ["public/icons/due-192.png", 192],
  ["public/icons/due-512.png", 512],
  ["public/icons/due-apple-180.png", 180],
  ["src/app/icon.png", 64],
];
for (const [file, size] of out) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(file);
}
// Maskable: shrink the artwork into the 80% safe zone on the same background.
const inner = await sharp(svg, { density: 300 }).resize(410, 410).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0063e6" } })
  .composite([{ input: inner, gravity: "center" }])
  .png()
  .toFile("public/icons/due-maskable-512.png");
console.log("icons written");
