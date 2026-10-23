/* ===== تقویم شمسی و ابزار اعداد فارسی ===== */
'use strict';

const JDate = (function () {
  const div = (a, b) => ~~(a / b);
  const mod = (a, b) => a - ~~(a / b) * b;

  function jalCal(jy) {
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    let bl = breaks.length, jump = 0, leapJ = -14, jp = breaks[0], jm;
    if (jy < jp || jy >= breaks[bl - 1]) throw new Error('year out of range');
    for (let i = 1; i < bl; i++) {
      jm = breaks[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    let n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
    const leapG = div(jy + 621, 4) - div((div(jy + 621, 100) + 1) * 3, 4) - 150;
    const march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
    return { leap, gy: jy + 621, march };
  }
  function g2d(gy, gm, gd) {
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
  }
  function d2g(jdn) {
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div(mod(j, 1461), 4) * 5 + 308;
    const gd = div(mod(i, 153), 5) + 1;
    const gm = mod(div(i, 153), 12) + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy, gm, gd };
  }
  function d2j(jdn) {
    const gy = d2g(jdn).gy;
    let jy = gy - 621;
    const r = jalCal(jy);
    const jdn1f = g2d(gy, 3, r.march);
    let k = jdn - jdn1f;
    if (k >= 0) {
      if (k <= 185) return [jy, 1 + div(k, 31), mod(k, 31) + 1];
      k -= 186;
    } else {
      jy -= 1;
      k += 179;
      if (r.leap === 1) k += 1;
    }
    return [jy, 7 + div(k, 30), mod(k, 30) + 1];
  }
  function j2d(jy, jm, jd) {
    const r = jalCal(jy);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }
  function gregorianToJalali(gy, gm, gd) { return d2j(g2d(gy, gm, gd)); }
  function jalaliToGregorian(jy, jm, jd) { const r = d2g(j2d(jy, jm, jd)); return [r.gy, r.gm, r.gd]; }
  function isLeap(jy) { return jalCal(jy).leap === 0; }
  function monthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeap(jy) ? 30 : 29;
  }
  // امروز (شمسی، وقت تهران)
  function today() {
    const now = new Date(Date.now() + 12600000); // UTC+3:30
    const j = gregorianToJalali(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate());
    return pad(j[0]) + '-' + pad(j[1]) + '-' + pad(j[2]);
  }
  const pad = n => String(n).padStart(2, '0');
  function pad4(n) { return String(n).padStart(4, '0'); }

  // رشته YYYY-MM-DD شمسی — بدون اعتبارسنجی سال
  function format(str, withYear) {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    const mn = J_MONTHS[+m - 1] || '';
    const dd = toFa(d);
    if (withYear === false) return `${dd} ${mn}`;
    return `${dd} ${mn} ${toFa(y)}`;
  }
  // شیفت شمسی: rFrom = {y,m,d}, n روز
  function shift(jstr, n) {
    const [y, m, d] = jstr.split('-').map(Number);
    const g = jalaliToGregorian(y, m, d);
    const t = new Date(Date.UTC(g[0], g[1] - 1, g[2]) + n * 86400000);
    const j = gregorianToJalali(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
    return pad4(j[0]) + '-' + pad(j[1]) + '-' + pad(j[2]);
  }
  // روز هفته: 0 = شنبه
  function weekday(jstr) {
    const [y, m, d] = jstr.split('-').map(Number);
    const g = jalaliToGregorian(y, m, d);
    return (new Date(Date.UTC(g[0], g[1] - 1, g[2])).getUTCDay() + 1) % 7;
  }
  const J_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const J_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  return {
    gregorianToJalali, jalaliToGregorian, isLeap, monthLength, today,
    format, shift, weekday, J_MONTHS, J_WEEKDAYS,
    isValid: s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && +s.split('-')[1] >= 1 && +s.split('-')[1] <= 12 && +s.split('-')[2] >= 1 && +s.split('-')[2] <= monthLength(+s.split('-')[0], +s.split('-')[1])
  };
})();

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function toFa(v) {
  return String(v ?? '').replace(/[0-9]/g, d => FA_DIGITS[+d]);
}
function faNum(v) { return toFa((+v).toLocaleString ? Number(v).toLocaleString('fa-IR') : v); }
// ساعت کارکرد
function hoursBetween(ci, co) {
  if (!ci || !co) return null;
  const [h1, m1] = ci.split(':').map(Number), [h2, m2] = co.split(':').map(Number);
  let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins < 0) mins += 24 * 60;
  return Math.round(mins / 60 * 100) / 100;
}

/* ===== انتخابگر تاریخ شمسی ===== */
let _openCal = null;

function createJDatePicker(input) {
  // input: <input type="hidden" data-jdate> داخل .jdate-wrap همراه .jdate-box
  const wrap = input.closest('.jdate-wrap');
  const box = wrap.querySelector('.jdate-box');
  const txtEl = box.querySelector('.txt');
  let val = input.value || '';

  function render() {
    if (JDate.isValid(val)) txtEl.textContent = JDate.format(val);
    else if (val) txtEl.textContent = val;
    else { txtEl.textContent = 'انتخاب تاریخ'; txtEl.classList.add('ph'); }
    if (JDate.isValid(val)) txtEl.classList.remove('ph');
  }

  function openCal() {
    closeCal();
    let [y, m] = val && JDate.isValid(val) ? val.split('-').map(Number) : (() => { const t = JDate.today().split('-').map(Number); return t; })();
    const cal = document.createElement('div');
    cal.className = 'jcal';
    function renderCal() {
      const todayStr = JDate.today();
      const days = JDate.monthLength(y, m);
      const firstWd = JDate.weekday(`${pad4fix(y)}-${pad2(m)}-01`);
      const sel = val;
      let cells = '';
      for (let i = 0; i < firstWd; i++) cells += '<div></div>';
      for (let d2 = 1; d2 <= days; d2++) {
        const jstr = `${pad4fix(y)}-${pad2(m)}-${pad2(d2)}`;
        const cls = jstr === sel ? 'jcal-cell sel' : (jstr === todayStr ? 'jcal-cell today' : 'jcal-cell');
        cells += `<div class="${cls}" data-d="${d2}">${toFa(d2)}</div>`;
      }
      cal.innerHTML = `
        <div class="jcal-head">
          <div class="m">${JDate.J_MONTHS[m - 1]} <span class="y">${toFa(y)}</span></div>
          <div class="jcal-nav">
            <button type="button" class="icon-btn" data-nav="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
            <button type="button" class="icon-btn" data-nav="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>
          </div>
        </div>
        <div class="jcal-days">
          ${JDate.J_WEEKDAYS.map(w => `<div class="wd">${w}</div>`).join('')}
          ${cells}
        </div>
        <div class="jcal-foot">
          <button type="button" class="btn sm soft" data-act="today">امروز</button>
          <button type="button" class="btn sm ghost" data-act="clear">پاک کردن</button>
        </div>`;
      cal.querySelector('.jcal-nav [data-nav="-1"]').onclick = () => { m--; if (m < 1) { m = 12; y--; } renderCal(); };
      cal.querySelector('.jcal-nav [data-nav="1"]').onclick = () => { m++; if (m > 12) { m = 1; y++; } renderCal(); };
      cal.querySelectorAll('.jcal-cell').forEach(c => {
        c.onclick = () => {
          const d3 = +c.dataset.d;
          val = `${pad4fix(y)}-${pad2(m)}-${pad2(d3)}`;
          input.value = val;
          render();
          closeCal();
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };
      });
      cal.querySelector('[data-act="today"]').onclick = () => {
        val = JDate.today();
        input.value = val;
        render();
        closeCal();
      };
      cal.querySelector('[data-act="clear"]').onclick = () => {
        val = '';
        input.value = '';
        render();
        closeCal();
      };
    }
    function pad4fix(n) { return String(n).padStart(4, '0'); }
    function pad2(n) { return String(n).padStart(2, '0'); }
    renderCal();
    box.after(cal);
    _openCal = { el: cal, input };
    render();
    setTimeout(() => {
      document.addEventListener('mousedown', onDocDown);
      document.addEventListener('keydown', onEsc);
    }, 0);
  }
  function onDocDown(e) {
    if (_openCal && !_openCal.el.contains(e.target) && !wrap.contains(e.target)) closeCal();
  }
  function onEsc(e) { if (e.key === 'Escape') closeCal(); }
  function closeCal() {
    if (_openCal) { _openCal.el.remove(); _openCal = null; document.removeEventListener('mousedown', onDocDown); document.removeEventListener('keydown', onEsc); }
    box.classList.remove('open');
  }

  box.addEventListener('click', (e) => {
    e.stopPropagation();
    if (_openCal && _openCal.input === input) closeCal();
    else openCal();
  });
  render();
}
// فعال‌سازی همه پیکرها داخل کانتینر
function iPickers(root) {
  root.querySelectorAll('input[data-jdate]').forEach(inp => {
    if (!inp._jdp) { inp._jdp = true; createJDatePicker(inp); }
  });
}
