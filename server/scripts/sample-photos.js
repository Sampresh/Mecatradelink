// Adds placeholder product photos (clean illustrations per product type) to every product
// that has no photos yet, through the admin API so they get the normal image processing.
// Samples are tagged and removed automatically when real photos are uploaded.
//
//   node scripts/sample-photos.js                 # add samples to products without photos
//   node scripts/sample-photos.js --remove        # delete all sample photos
//   node scripts/sample-photos.js --api https://api.example.com/api/v1
//
// Uses ADMIN_EMAIL / ADMIN_PASSWORD from .env.
import sharp from 'sharp';
import { env } from '../src/config/env.js';
import { SAMPLE_SUFFIX } from '../src/lib/sampleImages.js';

const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : undefined; };
const API = (arg('--api') ?? `${env.SERVER_PUBLIC_URL}/api/v1`).replace(/\/+$/, '');
const REMOVE = process.argv.includes('--remove');

// ── Illustrations (1000×1000, white background) ──────────────
const DEFS = `
  <linearGradient id="plastic" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9e9ec"/></linearGradient>
  <linearGradient id="plasticSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f4f6"/><stop offset="1" stop-color="#d9d9de"/></linearGradient>
  <linearGradient id="rocker" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfc"/><stop offset=".5" stop-color="#ececef"/><stop offset=".5" stop-color="#e0e0e5"/><stop offset="1" stop-color="#f3f3f5"/></linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f3f5"/><stop offset=".5" stop-color="#b8bcc4"/><stop offset="1" stop-color="#e3e5e9"/></linearGradient>
  <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a40"/><stop offset="1" stop-color="#18181b"/></linearGradient>
  <linearGradient id="copper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c28b"/><stop offset=".5" stop-color="#c97a36"/><stop offset="1" stop-color="#e9a868"/></linearGradient>
  <radialGradient id="coolGlow"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#eef6ff"/><stop offset="1" stop-color="#d7e6f7"/></radialGradient>
  <radialGradient id="warmGlow"><stop offset="0" stop-color="#fffdf5"/><stop offset=".7" stop-color="#fff2d6"/><stop offset="1" stop-color="#f6dfb0"/></radialGradient>
  <radialGradient id="amberGlow"><stop offset="0" stop-color="#fde68a" stop-opacity=".95"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;

const shadow = (cx, cy, rx, ry = 34) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".16" filter="url(#blur)"/>`;
const screw = (x, y, r = 16) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#metal)" stroke="#9aa0a8" stroke-width="2"/><line x1="${x - r * 0.6}" y1="${y}" x2="${x + r * 0.6}" y2="${y}" stroke="#7c828b" stroke-width="3"/>`;

const plate = (x, y, w, h) => `
  <rect x="${x + 10}" y="${y + 14}" width="${w}" height="${h}" rx="44" fill="#d4d4d8"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="44" fill="url(#plastic)" stroke="#dcdce0" stroke-width="3"/>`;
const rockerSwitch = (cx, cy, w = 150, h = 250, led = true) => `
  <rect x="${cx - w / 2 - 14}" y="${cy - h / 2 - 14}" width="${w + 28}" height="${h + 28}" rx="20" fill="#e4e4e8"/>
  <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="16" fill="url(#rocker)" stroke="#cfcfd5" stroke-width="2"/>
  <line x1="${cx - w / 2 + 12}" y1="${cy}" x2="${cx + w / 2 - 12}" y2="${cy}" stroke="#d2d2d8" stroke-width="2"/>
  ${led ? `<rect x="${cx - 18}" y="${cy - h / 2 + 22}" width="36" height="8" rx="4" fill="#f59e0b"/>` : ''}`;
const socketFace = (cx, cy, r = 150) => `
  <circle cx="${cx}" cy="${cy}" r="${r + 18}" fill="#e4e4e8"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#plastic)" stroke="#cfcfd5" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy - r * 0.42}" r="${r * 0.15}" fill="#3f3f46"/>
  <circle cx="${cx - r * 0.42}" cy="${cy + r * 0.3}" r="${r * 0.11}" fill="#3f3f46"/>
  <circle cx="${cx + r * 0.42}" cy="${cy + r * 0.3}" r="${r * 0.11}" fill="#3f3f46"/>`;

const DRAW = {
  switch: () => `${shadow(500, 800, 300)}${plate(240, 220, 520, 560)}${rockerSwitch(500, 500, 190, 300)}`,

  socket: () => `${shadow(500, 790, 380)}${plate(130, 250, 740, 520)}${rockerSwitch(300, 510, 130, 220)}${socketFace(600, 510, 160)}`,

  plate8: () => {
    let mods = '';
    for (let i = 0; i < 8; i++) {
      const x = 150 + i * 88;
      mods += `<rect x="${x}" y="410" width="72" height="190" rx="10" fill="#f6f6f8" stroke="#d0d0d6" stroke-width="3"/>`;
      if (i % 2 === 0) mods += `<rect x="${x + 12}" y="430" width="48" height="150" rx="8" fill="url(#rocker)" stroke="#d6d6dc" stroke-width="2"/>`;
    }
    return `${shadow(500, 700, 420)}${plate(100, 330, 800, 350)}<rect x="130" y="390" width="740" height="230" rx="18" fill="#e7e7eb"/>${mods}`;
  },

  wireCoil: (p) => {
    const color = /2\.5/.test(p.name) ? ['#1d4ed8', '#3b82f6', '#1e40af'] : /4|6|10/.test(p.name) ? ['#27272a', '#52525b', '#18181b'] : ['#b91c1c', '#ef4444', '#991b1b'];
    let rings = '';
    for (let r = 175; r <= 315; r += 20) {
      rings += `<circle cx="500" cy="500" r="${r}" fill="none" stroke="${color[(r / 20) % 2 ? 0 : 2]}" stroke-width="22"/>`;
      rings += `<circle cx="500" cy="500" r="${r}" fill="none" stroke="${color[1]}" stroke-width="5" stroke-dasharray="40 900" stroke-dashoffset="${r * 3}" opacity=".7"/>`;
    }
    return `${shadow(500, 860, 300, 40)}
      <g transform="translate(0 20)">${rings}
      <circle cx="500" cy="500" r="155" fill="#fff" stroke="#e5e5e5" stroke-width="3"/>
      <rect x="380" y="455" width="240" height="90" rx="14" fill="#fbbf24" opacity=".9"/>
      <path d="M800 470 C 860 470, 880 520, 870 600" stroke="${color[0]}" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M872 600 l 4 42" stroke="url(#copper)" stroke-width="10" stroke-linecap="round"/></g>`;
  },

  armouredCable: () => `${shadow(520, 720, 420, 40)}
    <g transform="rotate(-8 500 500)">
      <rect x="60" y="410" width="470" height="180" rx="90" fill="url(#dark)"/>
      <rect x="440" y="425" width="160" height="150" rx="20" fill="url(#metal)"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${452 + i * 17}" y1="428" x2="${446 + i * 17}" y2="572" stroke="#8b919a" stroke-width="5"/>`).join('')}
      <rect x="590" y="440" width="90" height="120" rx="16" fill="#3f3f46"/>
      ${[['#dc2626', 452], ['#facc15', 482], ['#2563eb', 512], ['#18181b', 542]].map(([c, y], i) => `
        <rect x="660" y="${y}" width="${200 - i * 20}" height="26" rx="13" fill="${c}"/>
        <rect x="${850 - i * 20}" y="${y + 4}" width="46" height="18" rx="9" fill="url(#copper)"/>`).join('')}
    </g>`,

  bulb: (p) => {
    const glow = /warm|3000/i.test(`${p.name} ${p.model}`) ? 'warmGlow' : 'coolGlow';
    const base = /E27/i.test(`${p.name} ${p.model}`)
      ? Array.from({ length: 5 }, (_, i) => `<rect x="${412 + (i % 2) * 4}" y="${700 + i * 26}" width="${176 - (i % 2) * 8}" height="22" rx="10" fill="url(#metal)"/>`).join('') + '<path d="M440 832 h120 l-24 40 h-72z" fill="#3f3f46"/>'
      : '<rect x="412" y="700" width="176" height="120" rx="14" fill="url(#metal)"/><rect x="430" y="810" width="140" height="22" rx="8" fill="#3f3f46"/><rect x="384" y="740" width="30" height="16" rx="8" fill="url(#metal)"/><rect x="586" y="740" width="30" height="16" rx="8" fill="url(#metal)"/><circle cx="470" cy="846" r="12" fill="url(#copper)"/><circle cx="530" cy="846" r="12" fill="url(#copper)"/>';
    return `${shadow(500, 900, 170, 26)}
      <circle cx="500" cy="380" r="300" fill="url(#amberGlow)" opacity=".35"/>
      <circle cx="500" cy="380" r="230" fill="url(#${glow})" stroke="#e7e7ea" stroke-width="3"/>
      <ellipse cx="420" cy="300" rx="60" ry="90" fill="#fff" opacity=".7" filter="url(#soft)"/>
      <path d="M330 530 Q 500 600 670 530 L 620 700 L 380 700 Z" fill="url(#plasticSide)" stroke="#d4d4d8" stroke-width="3"/>
      ${base}`;
  },

  panel: () => `${shadow(500, 690, 360, 46)}
    <ellipse cx="500" cy="540" rx="360" ry="130" fill="#c9ccd2"/>
    <ellipse cx="500" cy="522" rx="360" ry="130" fill="url(#metal)"/>
    <ellipse cx="500" cy="518" rx="335" ry="118" fill="url(#coolGlow)"/>
    <ellipse cx="500" cy="518" rx="335" ry="118" fill="none" stroke="#fff" stroke-width="6" opacity=".8"/>
    <ellipse cx="430" cy="480" rx="140" ry="40" fill="#fff" opacity=".8" filter="url(#soft)"/>`,

  spotlight: () => `${shadow(500, 820, 260)}
    <circle cx="500" cy="480" r="270" fill="url(#plasticSide)" stroke="#d4d4d8" stroke-width="3"/>
    <circle cx="500" cy="480" r="220" fill="#e7e7eb"/>
    <circle cx="500" cy="480" r="190" fill="url(#metal)"/>
    <circle cx="500" cy="480" r="120" fill="#d4d6db"/>
    <circle cx="500" cy="480" r="70" fill="#facc15"/>
    <circle cx="500" cy="480" r="70" fill="url(#amberGlow)"/>
    <circle cx="470" cy="455" r="18" fill="#fff" opacity=".7"/>`,

  wallLight: () => `${shadow(500, 880, 160, 24)}
    <path d="M440 330 L 300 60 L 700 60 L 560 330 Z" fill="#fde68a" opacity=".35"/>
    <path d="M440 670 L 300 940 L 700 940 L 560 670 Z" fill="#fde68a" opacity=".35"/>
    <rect x="420" y="300" width="160" height="400" rx="22" fill="url(#dark)"/>
    <rect x="432" y="300" width="22" height="400" fill="#52525b" opacity=".6"/>
    <rect x="440" y="300" width="120" height="16" rx="6" fill="#fef3c7"/>
    <rect x="440" y="684" width="120" height="16" rx="6" fill="#fef3c7"/>
    <rect x="580" y="430" width="70" height="140" rx="10" fill="#27272a"/>`,

  ringLight: () => `${shadow(500, 780, 360, 40)}
    <line x1="500" y1="60" x2="500" y2="390" stroke="#a1a1aa" stroke-width="4"/>
    <rect x="440" y="40" width="120" height="30" rx="10" fill="url(#metal)"/>
    <ellipse cx="500" cy="540" rx="360" ry="140" fill="none" stroke="#d4d4d8" stroke-width="64"/>
    <ellipse cx="500" cy="528" rx="360" ry="140" fill="none" stroke="url(#metal)" stroke-width="56"/>
    <ellipse cx="500" cy="540" rx="360" ry="140" fill="none" stroke="#fff7e0" stroke-width="16"/>
    <ellipse cx="500" cy="540" rx="400" ry="170" fill="none" stroke="#fde68a" stroke-width="30" opacity=".35" filter="url(#soft)"/>`,

  mcb: () => `${shadow(500, 860, 180, 26)}
    <rect x="390" y="150" width="220" height="680" rx="20" fill="url(#plasticSide)" stroke="#d1d1d6" stroke-width="3"/>
    <rect x="410" y="170" width="180" height="110" rx="10" fill="#e4e4e8"/>${screw(500, 225)}
    <rect x="410" y="700" width="180" height="110" rx="10" fill="#e4e4e8"/>${screw(500, 755)}
    <rect x="400" y="330" width="200" height="330" rx="12" fill="#f8f8fa" stroke="#dedee3" stroke-width="2"/>
    <rect x="460" y="380" width="80" height="160" rx="14" fill="url(#dark)"/>
    <rect x="474" y="398" width="52" height="56" rx="8" fill="#52525b"/>
    <rect x="440" y="570" width="120" height="18" rx="6" fill="#16a34a"/>
    <rect x="430" y="610" width="140" height="30" rx="6" fill="#f59e0b" opacity=".85"/>`,

  rccb: () => `${shadow(500, 860, 260, 26)}
    <rect x="310" y="150" width="380" height="680" rx="22" fill="url(#plasticSide)" stroke="#d1d1d6" stroke-width="3"/>
    <rect x="330" y="170" width="340" height="110" rx="10" fill="#e4e4e8"/>${screw(410, 225)}${screw(590, 225)}
    <rect x="330" y="700" width="340" height="110" rx="10" fill="#e4e4e8"/>${screw(410, 755)}${screw(590, 755)}
    <rect x="320" y="330" width="360" height="330" rx="12" fill="#f8f8fa" stroke="#dedee3" stroke-width="2"/>
    <rect x="370" y="380" width="120" height="170" rx="16" fill="url(#dark)"/>
    <circle cx="590" cy="440" r="38" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
    <rect x="350" y="600" width="300" height="28" rx="6" fill="#2563eb" opacity=".85"/>`,

  db: () => `${shadow(500, 900, 340, 30)}
    <rect x="180" y="110" width="640" height="760" rx="24" fill="#d4d4d8"/>
    <rect x="170" y="100" width="640" height="760" rx="24" fill="url(#plastic)" stroke="#cfcfd5" stroke-width="3"/>
    <rect x="230" y="190" width="520" height="330" rx="14" fill="#3f3f46"/>
    <rect x="250" y="230" width="480" height="250" rx="8" fill="#e5e7eb"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${262 + i * 58}" y="250" width="50" height="210" rx="6" fill="#fafafa" stroke="#d4d4d8" stroke-width="2"/><rect x="${276 + i * 58}" y="320" width="22" height="64" rx="5" fill="url(#dark)"/>`).join('')}
    <rect x="230" y="560" width="520" height="250" rx="14" fill="#ececf0"/>
    <rect x="700" y="420" width="26" height="90" rx="10" fill="url(#metal)"/>
    ${screw(215, 145, 10)}${screw(765, 145, 10)}${screw(215, 815, 10)}${screw(765, 815, 10)}`,

  plug: () => `${shadow(500, 870, 200, 26)}
    <rect x="452" y="110" width="40" height="150" rx="18" fill="url(#metal)"/>
    <rect x="392" y="170" width="30" height="110" rx="14" fill="url(#metal)"/>
    <rect x="578" y="170" width="30" height="110" rx="14" fill="url(#metal)"/>
    <path d="M330 280 h340 a40 40 0 0 1 40 40 v220 q0 120 -120 160 h-180 q-120 -40 -120 -160 v-220 a40 40 0 0 1 40 -40z" fill="url(#plastic)" stroke="#d1d1d6" stroke-width="3"/>
    <rect x="300" y="320" width="400" height="40" rx="10" fill="#e4e4e8"/>${screw(500, 520, 20)}
    <rect x="455" y="700" width="90" height="190" rx="30" fill="#e7e7ea" stroke="#d1d1d6" stroke-width="3"/>`,

  holder: () => `${shadow(500, 820, 330, 40)}
    <ellipse cx="500" cy="660" rx="330" ry="110" fill="#d6d3d1"/>
    <ellipse cx="500" cy="640" rx="330" ry="110" fill="url(#plastic)" stroke="#d1d1d6" stroke-width="3"/>
    <rect x="370" y="330" width="260" height="300" fill="url(#plasticSide)"/>
    <ellipse cx="500" cy="630" rx="130" ry="44" fill="#e4e4e8"/>
    <ellipse cx="500" cy="330" rx="130" ry="44" fill="#f8f8fa" stroke="#d1d1d6" stroke-width="3"/>
    <ellipse cx="500" cy="330" rx="88" ry="28" fill="#3f3f46"/>
    <rect x="470" y="318" width="22" height="14" rx="4" fill="url(#copper)"/>${screw(260, 650, 14)}${screw(740, 650, 14)}`,

  multimeter: () => `${shadow(500, 900, 260, 26)}
    <rect x="270" y="90" width="460" height="780" rx="60" fill="#f59e0b"/>
    <rect x="300" y="120" width="400" height="720" rx="40" fill="url(#dark)"/>
    <rect x="340" y="170" width="320" height="170" rx="16" fill="#a3b18a"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${372 + i * 70}" y="210" width="44" height="90" rx="6" fill="none" stroke="#3f4a2e" stroke-width="10"/>`).join('')}
    <circle cx="500" cy="530" r="120" fill="#27272a" stroke="#52525b" stroke-width="10"/>
    <rect x="490" y="420" width="20" height="90" rx="10" fill="#d4d4d8"/>
    ${[[380, 760, '#18181b'], [460, 760, '#dc2626'], [540, 760, '#dc2626'], [620, 760, '#18181b']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="26" fill="#3f3f46"/><circle cx="${x}" cy="${y}" r="13" fill="${c}"/>`).join('')}`,

  stripper: () => `${shadow(500, 900, 220, 26)}
    <path d="M440 120 L 560 120 L 600 420 L 400 420 Z" fill="url(#metal)" stroke="#9aa0a8" stroke-width="3"/>
    <path d="M500 140 L 500 380" stroke="#71717a" stroke-width="6"/>
    ${[200, 250, 300].map((y) => `<circle cx="500" cy="${y}" r="${10 - (y - 200) / 25}" fill="#52525b"/>`).join('')}
    <circle cx="500" cy="440" r="34" fill="url(#metal)" stroke="#71717a" stroke-width="4"/>
    <path d="M470 460 C 420 600, 330 760, 300 880 L 360 900 C 400 780, 470 640, 495 480 Z" fill="#dc2626"/>
    <path d="M530 460 C 580 600, 670 760, 700 880 L 640 900 C 600 780, 530 640, 505 480 Z" fill="#facc15"/>`,

  generic: () => `${shadow(500, 820, 260)}
    <circle cx="500" cy="470" r="270" fill="url(#plastic)" stroke="#e4e4e8" stroke-width="4"/>
    <path d="M540 230 L 400 500 H 490 L 450 720 L 610 430 H 515 Z" fill="#f59e0b"/>`,
};

function kindOf(p) {
  const s = `${p.name} ${p.model ?? ''}`.toLowerCase();
  const rules = [
    ['multimeter', /multimeter/], ['stripper', /stripper|crimper|plier/], ['holder', /holder/], ['plug', /plug/],
    ['db', /distribution board|\bdb\b/], ['rccb', /rccb|rcbo|elcb/], ['mcb', /mcb|breaker|isolator/],
    ['ringLight', /ring.*ceiling|ceiling.*ring/], ['wallLight', /wall light/], ['spotlight', /spot ?light|cob/],
    ['panel', /panel|downlight/], ['bulb', /bulb|lamp\b/], ['armouredCable', /armou?red/], ['wireCoil', /wire|cable/],
    ['plate8', /plate|cover/], ['socket', /socket/], ['switch', /switch/],
  ];
  return rules.find(([, re]) => re.test(s))?.[0] ?? 'generic';
}

const svgFor = (p) => `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <defs>${DEFS}</defs><rect width="1000" height="1000" fill="#fff"/>${DRAW[kindOf(p)](p)}</svg>`;

// ── API helpers ──────────────────────────────────────────────
async function api(method, path, { token, body, form } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { ...(token && { authorization: `Bearer ${token}` }), ...(body && { 'content-type': 'application/json' }) },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${json.message ?? ''}`);
  return json;
}

async function allProducts(token) {
  const out = [];
  for (let page = 1; ; page++) {
    const r = await api('GET', `/admin/products?limit=100&page=${page}`, { token });
    out.push(...r.data);
    if (page >= r.meta.totalPages) return out;
  }
}

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
const { data: { accessToken: token } } = await api('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
const products = await allProducts(token);
let changed = 0;

if (REMOVE) {
  for (const p of products) {
    const { data } = await api('GET', `/admin/products/${p.id}`, { token });
    for (const img of data.images.filter((i) => i.alt?.endsWith(SAMPLE_SUFFIX))) {
      await api('DELETE', `/admin/products/${p.id}/images/${img.id}`, { token });
      changed++;
    }
  }
  console.log(`✔ removed ${changed} sample photo(s)`);
} else {
  for (const p of products.filter((x) => x.imageCount === 0)) {
    const png = await sharp(Buffer.from(svgFor(p))).png().toBuffer();
    const form = new FormData();
    form.append('images', new Blob([png], { type: 'image/png' }), `${p.slug}-sample.png`);
    await api('POST', `/admin/products/${p.id}/images?sample=true`, { token, form });
    console.log(`  + ${p.name}  (${kindOf(p)})`);
    changed++;
  }
  console.log(`✔ added sample photos to ${changed} product(s); ${products.length - changed} already had photos`);
}
