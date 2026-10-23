// بازسازی فایل‌های اصلی از قطعه‌های موجود در پوشه parts/
// (به‌دلیل محدودیت اندازه در API گیت‌هاب، فایل‌های بزرگ به‌صورت قطعه‌قطعه ذخیره شده‌اند)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const TARGETS = [
  {
    out: 'worker.js',
    parts: [
      'parts/worker.js.part-1-of-5',
      'parts/worker.js.part-2-of-5',
      'parts/worker.js.part-3-of-5',
      'parts/worker.js.part-4-of-5',
      'parts/worker.js.part-5-of-5'
    ]
  },
  {
    out: 'public/css/styles.css',
    parts: [
      'parts/styles.css.part-1-of-2',
      'parts/styles.css.part-2-of-2'
    ]
  },
  {
    out: 'public/js/app.js',
    parts: [
      'parts/app.js.part-1-of-6',
      'parts/app.js.part-2-of-6',
      'parts/app.js.part-3-of-6',
      'parts/app.js.part-4-of-6',
      'parts/app.js.part-5-of-6',
      'parts/app.js.part-6-of-6'
    ]
  }
];

for (const t of TARGETS) {
  const body = t.parts.map(p => readFileSync(join(process.cwd(), p), 'utf8')).join('');
  const out = join(process.cwd(), t.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, body);
  console.log('built', t.out, '-', body.length, 'bytes');
}
