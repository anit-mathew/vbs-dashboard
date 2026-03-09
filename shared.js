/* ══════════════════════════════════════
   shared.js — Utilities used by BOTH tabs.
   Edit this file to change: CSV parsing,
   tab switching, colour maps, t-shirt logic.
══════════════════════════════════════ */

/* ── Config ── */
const CSV_KIDS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQI-vHJhZBtLtBBn94Eq_0beJYuNhywqgP4dpgpd0sjPfvPzgnLq8NtAAQvYTmN_0OBFpb7X1q-G20Y/pub?output=csv";
const CSV_VOLS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1qao6oa4ze6Hzmy6q6DeltkBWYzgr8Dtp29zYROsFbjpxpOqNveYjU2cNbSbIVAfduJEYsrXh1v83/pub?output=csv";

/* ── Tab Switcher ── */
function switchTab(name, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

/* ── CSV Parser ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = splitLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = splitLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h] = (vals[i] || '').trim().replace(/^"|"$/g, ''));
    return obj;
  });
}
function splitLine(line) {
  const r = []; let c = '', q = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { q = !q; }
    else if (line[i] === ',' && !q) { r.push(c); c = ''; }
    else c += line[i];
  }
  r.push(c); return r;
}

/* ── Colour Maps ── */
const GRADE_C = {
  'Pre':'#FF7043','K':'#FF9800','1st':'#FDD835','2nd':'#66BB6A',
  '3rd':'#26C6DA','4th':'#42A5F5','5th':'#7E57C2','6th':'#EC407A',
  '7th':'#8D6E63','8th':'#546E7A','default':'#9C6FDE'
};
function gradeColor(g) {
  for (const k of Object.keys(GRADE_C)) {
    if (k !== 'default' && g && g.includes(k)) return GRADE_C[k];
  }
  return GRADE_C.default;
}

const ROLE_C = {
  'Arts and Crafts':'#FF7043','Decoration':'#26C6DA','Media':'#42A5F5',
  'Food':'#FF9800','Worship Team':'#9C6FDE','Bible Lessons':'#66BB6A',
  'Medical Team':'#F06292','Crew Leader':'#EC407A','Recreation':'#26A69A',
  'Registration':'#5C6BC0','Facility Management':'#FFB300',
  'Facility Mangement':'#FFB300','default':'#7A8BAD'
};
const SHIRT_C    = ['#4FC3F7','#FF7043','#66BB6A','#9C6FDE','#FFB300','#26C6DA'];
const AGE_C      = {'19-30':'#4FC3F7','31-45':'#9C6FDE','46+':'#66BB6A','Under 18':'#FF7043'};
const DAY_COLORS = ['#26C6DA','#9C6FDE','#FF7043'];

/* ── T-Shirt Summary ── */
const SIZE_ORDER = ['2T','3T','4T','XS','S','M','L','XL','XXL','2XL','3XL','2-4','6-8','10-12','14-16'];

function normalizeSize(raw) {
  if (!raw) return null;
  let s = raw.trim()
    .replace(/\(adult\)/gi, '')
    .replace(/\(youth\)/gi, ' Youth')
    .replace(/\(kids\s*size\)/gi, '')
    .replace(/\(kidssize\)/gi, '')
    .trim();
  const u = s.toUpperCase().replace(/\s+/g, '');
  if (/^2[-–]4$/.test(s.replace(/\s/g, ''))) return '2-4';
  if (/^6[-–]8$/.test(s.replace(/\s/g, ''))) return '6-8';
  if (/^10[-–]12$/.test(s.replace(/\s/g, ''))) return '10-12';
  if (/^14[-–]16$/.test(s.replace(/\s/g, ''))) return '14-16';
  if (u === '2T') return '2T'; if (u === '3T') return '3T'; if (u === '4T') return '4T';
  if (u==='XS'||u==='XSMALL'||u==='X-SMALL') return 'XS';
  if (u==='S'||u==='SMALL') return 'S';
  if (u==='M'||u==='MED'||u==='MEDIUM') return 'M';
  if (u==='L'||u==='LARGE') return 'L';
  if (u==='XL'||u==='XLARGE'||u==='X-LARGE') return 'XL';
  if (u==='XXL'||u==='2XL'||u==='XXLARGE'||u==='XX-LARGE') return 'XXL';
  if (u==='3XL'||u==='XXXL'||u==='XXXLARGE') return '3XL';
  if (s) return s.replace(/\s+/g, ' ').trim();
  return null;
}

function countShirts(people, getSize) {
  const counts = {};
  people.forEach(p => {
    const size = normalizeSize(getSize(p));
    if (size) counts[size] = (counts[size] || 0) + 1;
  });
  return counts;
}

function sortedSizes(counts) {
  return Object.keys(counts).sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a), bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });
}

function renderShirtBars(counts, color) {
  const sizes = sortedSizes(counts);
  if (!sizes.length) return '<p style="color:var(--muted);font-size:.8rem">No data yet</p>';
  const maxN = Math.max(...Object.values(counts), 1);
  return sizes.map(s => `
    <div class="tshirt-size-row">
      <div class="tshirt-size-lbl">${s}</div>
      <div class="tshirt-bar-track">
        <div class="tshirt-bar-fill" style="width:${counts[s]/maxN*100}%;background:${color}">${counts[s]} shirt${counts[s]>1?'s':''}</div>
      </div>
      <div class="tshirt-bar-n">${counts[s]}</div>
    </div>`).join('');
}

function refreshTshirtSummary() {
  const el = document.getElementById('k-tshirt');
  if (!el) return;
  const kids = window._allKids || null;
  const vols = window._allVols || null;
  if (!kids && !vols) { el.innerHTML = ''; return; }

  const kCounts = kids ? countShirts(kids, k => k.tshirt) : {};
  const vCounts = vols ? countShirts(vols, v => v.tshirt) : {};
  const combined = { ...kCounts };
  Object.entries(vCounts).forEach(([s, n]) => combined[s] = (combined[s] || 0) + n);

  const grandTotal = Object.values(combined).reduce((a, b) => a + b, 0);
  const kTotal     = Object.values(kCounts).reduce((a, b) => a + b, 0);
  const vTotal     = Object.values(vCounts).reduce((a, b) => a + b, 0);

  const grandChips = sortedSizes(combined).map(s => `
    <div class="tshirt-grand-chip">
      <div class="gc-size">${s}</div>
      <div class="gc-n">${combined[s]}</div>
      <div class="gc-sub">${kCounts[s]||0}K + ${vCounts[s]||0}V</div>
    </div>`).join('');

  el.innerHTML = `
    <div class="ts-accordion">
      <div class="ts-header" onclick="toggleTshirt(this)">
        <div class="ts-header-left">
          <span style="font-size:1.3rem">👕</span>
          <span class="ts-title">T-Shirt Order Summary</span>
          <span class="tshirt-total-badge">🛒 ${grandTotal} total shirts</span>
        </div>
        <span class="ts-chevron">▼</span>
      </div>
      <div class="ts-body">
        <div class="tshirt-summary">
          <div>
            <div class="tshirt-group-title">🧒 Kids
              <span class="tshirt-group-badge" style="background:rgba(79,195,247,.12);border:1px solid rgba(79,195,247,.3);color:#0369a1">${kTotal} shirts</span>
            </div>
            ${kids ? renderShirtBars(kCounts,'#4FC3F7') : '<p class="tshirt-waiting">⏳ Loading kids data…</p>'}
          </div>
          <div>
            <div class="tshirt-group-title">🙋 Volunteers
              <span class="tshirt-group-badge" style="background:rgba(102,187,106,.12);border:1px solid rgba(102,187,106,.3);color:#166534">${vTotal} shirts</span>
            </div>
            ${vols ? renderShirtBars(vCounts,'#66BB6A') : '<p class="tshirt-waiting">⏳ Loading volunteer data…</p>'}
          </div>
        </div>
        <hr class="tshirt-divider">
        <div class="tshirt-group-title" style="margin-bottom:12px">📦 Grand Total to Order
          <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted);font-size:.72rem">(kids + volunteers combined)</span>
        </div>
        <div class="tshirt-grand">${grandChips || '<p style="color:var(--muted);font-size:.8rem">No shirt data</p>'}</div>
        <p style="font-size:.7rem;color:var(--muted);margin-top:12px;font-weight:700">💡 Each chip: total · K = kids · V = volunteers</p>
      </div>
    </div>`;
}

function toggleTshirt(header) {
  const chevron = header.querySelector('.ts-chevron');
  const body    = header.nextElementSibling;
  const isOpen  = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('open', !isOpen);
}

/* ── Init ── */
function refreshAll() {
  loadKids();
  loadVols();
  document.getElementById('ts').textContent =
    'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
