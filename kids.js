/* ══════════════════════════════════════
   kids.js — Kids Registration tab logic.
   Edit this file to change anything in the
   🧒 Kids Registration tab.
══════════════════════════════════════ */

function extractChildren(rows) {
  const kids = [];
  rows.forEach(r => {
    const p = r["Parent's Full Name"] || '', ch = r["Church Name"] || '';
    const add = (n, g, gr, ts, al) => {
      if (n && n.trim()) kids.push({ name:n, gender:g||'', grade:gr||'', tshirt:ts||'', allergies:al||'None', parent:p, church:ch });
    };
    add(r["Child #1 Name"], r["Gender"],    r["Grade in Spetmber"],    r["T Shirt Size"],    r["Allergies"]);
    add(r["Child #2 Name"], r["Gender (1)"], r["Grade in Spetmber (1)"], r["T Shirt Size (1)"], r["Allergies (1)"]);
    add(r["Child #3 Name"], r["Gender (2)"], r["Grade in Spetmber (2)"], r["T Shirt Size (2)"], r["Allergies (2)"]);
  });
  return kids.filter(k => k.name.trim());
}

function buildDonut(boys, girls, total) {
  if (!total) return '';
  const r = 56, cx = 66, cy = 66, circ = 2 * Math.PI * r;
  const bd = (boys / total) * circ, gd = (girls / total) * circ;
  return `<div class="donut-wrap">
    <svg width="132" height="132" viewBox="0 0 132 132">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#EEF3FB" stroke-width="20"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#4FC3F7" stroke-width="20"
        stroke-dasharray="${bd} ${circ}" stroke-dashoffset="${circ/4}" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#F48FB1" stroke-width="20"
        stroke-dasharray="${gd} ${circ}" stroke-dashoffset="${circ/4-bd}" stroke-linecap="round"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
        font-family="Fredoka One,cursive" font-size="20" fill="#1A2744">${total}</text>
      <text x="${cx}" y="${cy+18}" text-anchor="middle" dominant-baseline="middle"
        font-family="Nunito,sans-serif" font-size="8" fill="#7A8BAD" font-weight="700">KIDS</text>
    </svg>
    <div class="legend">
      <div class="legend-row"><div class="legend-dot" style="background:#4FC3F7"></div>Boys — ${boys}</div>
      <div class="legend-row"><div class="legend-dot" style="background:#F48FB1"></div>Girls — ${girls}</div>
    </div>
  </div>`;
}

function buildKidsRow(c, query = '') {
  const hl = (str) => {
    if (!query || !str) return str || '';
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return str.replace(re, '<mark>$1</mark>');
  };
  return `<tr>
    <td><strong>${hl(c.name)}</strong></td>
    <td><span class="chip" style="background:${gradeColor(c.grade)}">${c.grade||'—'}</span></td>
    <td><span class="${c.gender.toLowerCase()==='male'?'chip-m':'chip-f'}">${c.gender}</span></td>
    <td>${c.tshirt||'—'}</td>
    <td>${c.allergies||'None'}</td>
    <td style="color:var(--muted);font-size:.78rem">${hl(c.parent)}</td>
  </tr>`;
}

function renderKids(rows) {
  const kids  = extractChildren(rows);
  const total = kids.length;
  const boys  = kids.filter(c => c.gender.toLowerCase() === 'male').length;
  const girls = kids.filter(c => c.gender.toLowerCase() === 'female').length;
  const gc = {};
  kids.forEach(c => { const g = c.grade.trim() || 'Unknown'; gc[g] = (gc[g] || 0) + 1; });
  const maxG = Math.max(...Object.values(gc), 1);

  document.getElementById('k-stats').innerHTML = `
    <div class="stat-card"><div class="stat-e">🧒</div><div class="stat-n">${total}</div><div class="stat-l">Total Children</div></div>
    <div class="stat-card sc-coral"><div class="stat-e">👨‍👩‍👧</div><div class="stat-n">${rows.length}</div><div class="stat-l">Families</div></div>
    <div class="stat-card sc-grass"><div class="stat-e">👦</div><div class="stat-n">${boys}</div><div class="stat-l">Boys</div></div>
    <div class="stat-card sc-purple"><div class="stat-e">👧</div><div class="stat-n">${girls}</div><div class="stat-l">Girls</div></div>`;

  const gradeBars = Object.entries(gc).sort((a, b) => b[1] - a[1]).map(([g, n]) => `
    <div class="bar-row">
      <div class="bar-lbl">${g}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${n/maxG*100}%;background:${gradeColor(g)}">${n} kid${n>1?'s':''}</div></div>
      <div class="bar-n">${n}</div>
    </div>`).join('');

  const tRows = kids.map(c => buildKidsRow(c, '')).join('');

  document.getElementById('k-content').innerHTML = `
    <div class="grid2">
      <div class="card">
        <div class="card-title">📊 Kids by Grade</div>
        ${gradeBars || '<p style="color:var(--muted)">No grade data</p>'}
      </div>
      <div class="card">
        <div class="card-title">⚧ Gender Breakdown</div>
        ${buildDonut(boys, girls, total)}
      </div>
    </div>
    <div class="vol-accordion">
      <div class="vol-acc-header" onclick="toggleKidsTable()">
        <div class="vol-acc-left">
          <span style="font-size:1.2rem">🧒</span>
          <span class="vol-acc-title">All Registered Children</span>
          <span class="tshirt-total-badge">${total} total</span>
        </div>
        <span class="vol-acc-chev" id="k-acc-chev">▼</span>
      </div>
      <div class="vol-acc-body" id="k-acc-body">
        <div class="search-bar">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input class="search-input" id="k-search" type="text" placeholder="Search by child or parent name…" oninput="filterKidsTable(this.value)">
            <button class="btn-clear" id="k-clear" onclick="clearKidsSearch()" title="Clear search">✕</button>
          </div>
          <div class="search-count" id="k-count"><strong>${total}</strong> of ${total} children</div>
        </div>
        <div class="tbl-wrap">
          <table class="tbl" id="k-table">
            <thead><tr><th>Name</th><th>Grade</th><th>Gender</th><th>T-Shirt</th><th>Allergies</th><th>Parent</th></tr></thead>
            <tbody id="k-tbody">${tRows}</tbody>
          </table>
          <div class="no-results" id="k-no-results" style="display:none">
            <div class="nr-icon">🔎</div>
            <div>No children found matching your search</div>
          </div>
        </div>
      </div>
    </div>`;

  window._allKids = kids;
  refreshTshirtSummary();
}

function filterKidsTable(query) {
  const kids = window._allKids || [];
  const q = query.trim().toLowerCase();
  const clearBtn = document.getElementById('k-clear');
  const countEl  = document.getElementById('k-count');
  const tbody    = document.getElementById('k-tbody');
  const noRes    = document.getElementById('k-no-results');
  const table    = document.getElementById('k-table');

  if (clearBtn) clearBtn.classList.toggle('vis', q.length > 0);
  const filtered = q ? kids.filter(c => c.name.toLowerCase().includes(q) || c.parent.toLowerCase().includes(q)) : kids;
  if (tbody)  tbody.innerHTML = filtered.map(c => buildKidsRow(c, q)).join('');
  if (countEl) countEl.innerHTML = `<strong>${filtered.length}</strong> of ${kids.length} children`;
  if (noRes && table) {
    noRes.style.display = filtered.length === 0 ? 'block' : 'none';
    table.style.display = filtered.length === 0 ? 'none'  : '';
  }
}

function clearKidsSearch() {
  const inp = document.getElementById('k-search');
  if (inp) { inp.value = ''; inp.focus(); }
  filterKidsTable('');
}

function toggleKidsTable() {
  const body = document.getElementById('k-acc-body');
  const chev = document.getElementById('k-acc-chev');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev.classList.toggle('open', !isOpen);
}

async function loadKids() {
  document.getElementById('k-stats').innerHTML = `<div class="loading-box" style="grid-column:1/-1"><span class="spin">⏳</span> Loading…</div>`;
  document.getElementById('k-content').innerHTML = '';
  try {
    const res = await fetch(CSV_KIDS + '&t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    renderKids(parseCSV(await res.text()));
  } catch(e) {
    document.getElementById('k-stats').innerHTML = `<div class="err-box" style="grid-column:1/-1">⚠️ Could not load kids data.<br><small>${e.message}</small></div>`;
  }
}
