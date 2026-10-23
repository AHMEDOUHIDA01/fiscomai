/**
 * Copie dans public/emoji/ la version 3D (Fluent Emoji, MIT) de chaque émoji
 * utilisé dans src/, et écrit src/ui/emoji-map.json (émoji → fichier).
 */
import { readdirSync, readFileSync, statSync, mkdirSync, copyFileSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = join(root, "node_modules/@lobehub/fluent-emoji-3d/assets");
const out = join(root, "public/emoji");

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f) && !f.endsWith(".test.ts")) files.push(p);
  }
};
walk(join(root, "src"));

const re = /\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*|[0-9#*]️?⃣/gu;
const emojis = new Set();
for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(re)) emojis.add(m[0]);

const code = (s) => [...s].map((c) => c.codePointAt(0).toString(16)).join("-");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const map = {};
const missing = [];
for (const e of emojis) {
  const full = code(e);
  const candidates = [full, full.replace(/-fe0f/g, ""), `${full}-fe0f`];
  const hit = candidates.find((c) => existsSync(join(assets, `${c}.webp`)));
  if (!hit) {
    missing.push(e);
    continue;
  }
  copyFileSync(join(assets, `${hit}.webp`), join(out, `${hit}.webp`));
  map[e] = hit;
}
writeFileSync(join(root, "src/ui/emoji-map.json"), JSON.stringify(map, null, 0) + "\n");
console.log(`emoji3d: ${Object.keys(map).length} icônes 3D, ${missing.length} sans équivalent (${missing.join(" ")})`);
