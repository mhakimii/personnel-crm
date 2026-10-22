// دانلود فونت وزیرمتن (woff2) برای اجرای محلی/استقرار
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts';
const WEIGHTS = ['Regular', 'Medium', 'SemiBold', 'Bold'];
const dir = join(process.cwd(), 'public', 'fonts');
mkdirSync(dir, { recursive: true });

for (const w of WEIGHTS) {
  const res = await fetch(`${BASE}/Vazirmatn-${w}.woff2`);
  if (!res.ok) { console.error(`failed: ${w} (${res.status})`); process.exitCode = 1; continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(dir, `Vazirmatn-${w}.woff2`), buf);
  console.log(`ok: Vazirmatn-${w}.woff2 (${buf.length} bytes)`);
}
