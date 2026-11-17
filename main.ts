// Entry program for the makefun-frontend-01 bounty (Node 22, standard library only).
//
// The frontend itself lives in app/: plain static files (HTML, CSS, ES modules,
// a local font) that a browser opens at app/index.html — no build step — reading
// make.fun's public API at https://make.fun/api. This program hands the entry in:
// it copies app/ and screenshots/ from beside this file into the output directory
// ($MAKEFUN_OUTPUT_DIR, or /output where that is unset) and writes dossier.json
// there with the vendored make.fun library, byte for byte as the scorer's own
// copy writes it. vendor/makefun-frontend.ts is left exactly as handed out.
//
// Run it locally with `node serve.ts` for the app itself; to produce the output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps, passed unchanged: only text_max_bytes shapes the bytes;
// the rest refuse anything the scorer would refuse (more than 3 screenshots, one
// screenshot over 256 KiB, more than 993 files under app/, more than 16 MiB of app).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 3, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
