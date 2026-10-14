/**
 * WHERE TIRUPPUR'S WATER BREAKS FIRST
 * Linear / Vercel / Palantir Foundry Geospatial Telemetry Controller
 * Handles El Niño shock state transitions, SVG map overlays, and Chart.js proofs
 */

(function () {
  'use strict';

  // --- 1. STATE & CONFIGURATION ---
  const state = {
    elNinoActive: true,
    severity: 'severe', // 'normal' | 'moderate' | 'severe'
    activeWardId: null,
    charts: {
      divergence: null,
      proximity: null
    }
  };

  // Telemetry Ward Locations (calibrated to the 748x1024 Tiruppur Taluk Map)
  const WARDS_DATA = [
    {
      id: "w-01",
      rank: 1,
      name: "Tiruppur South (Nallur Zone)",
      taluk: "Tirupur Taluk",
      x: 345,
      y: 375,
      distNoyyalKm: 0.4,
      baseTds: 1580,
      shockTds: 3120,
      surgePct: "+97.4%",
      depth: 28.8,
      status: "CAP & TEST FIRST",
      badgeClass: "badge-cap-first"
    },
    {
      id: "w-02",
      rank: 2,
      name: "Tiruppur North (Kasipalayam)",
      taluk: "Tirupur Taluk",
      x: 310,
      y: 340,
      distNoyyalKm: 0.6,
      baseTds: 1510,
      shockTds: 2940,
      surgePct: "+94.7%",
      depth: 27.4,
      status: "CAP & TEST FIRST",
      badgeClass: "badge-cap-first"
    },
    {
      id: "w-03",
      rank: 3,
      name: "Veerapandi Corridor",
      taluk: "Tirupur Taluk",
      x: 380,
      y: 390,
      distNoyyalKm: 0.8,
      baseTds: 1490,
      shockTds: 2840,
      surgePct: "+90.6%",
      depth: 26.5,
      status: "CAP & TEST FIRST",
      badgeClass: "badge-cap-first"
    },
    {
      id: "w-04",
      rank: 4,
      name: "Kangayam (Orathupalayam Belt)",
      taluk: "Kangayam Taluk",
      x: 530,
      y: 410,
      distNoyyalKm: 1.1,
      baseTds: 1610,
      shockTds: 2980,
      surgePct: "+85.1%",
      depth: 29.2,
      status: "CAP & TEST FIRST",
      badgeClass: "badge-cap-first"
    },
    {
      id: "w-05",
      rank: 5,
      name: "Avinashi East Buffer",
      taluk: "Avinashi Taluk",
      x: 260,
      y: 245,
      distNoyyalKm: 1.6,
      baseTds: 1390,
      shockTds: 2310,
      surgePct: "+66.2%",
      depth: 22.8,
      status: "MONITOR WEEKLY",
      badgeClass: "badge-monitor"
    },
    {
      id: "w-06",
      rank: 6,
      name: "Palladam Border Zone",
      taluk: "Palladam Taluk",
      x: 230,
      y: 420,
      distNoyyalKm: 2.4,
      baseTds: 1470,
      shockTds: 1890,
      surgePct: "+28.4%",
      depth: 20.4,
      status: "SAFE / WATCH",
      badgeClass: "badge-safe"
    },
    {
      id: "w-07",
      rank: 7,
      name: "Dharapuram Central Aquifer",
      taluk: "Dharapuram Taluk",
      x: 390,
      y: 580,
      distNoyyalKm: 5.2,
      baseTds: 1120,
      shockTds: 1210,
      surgePct: "+8.0%",
      depth: 18.2,
      status: "SAFE / WATCH",
      badgeClass: "badge-safe"
    },
    {
      id: "w-08",
      rank: 8,
      name: "Udumalpet Foothills Basin",
      taluk: "Udumalpet Taluk",
      x: 170,
      y: 780,
      distNoyyalKm: 8.4,
      baseTds: 860,
      shockTds: 910,
      surgePct: "+5.8%",
      depth: 16.5,
      status: "SAFE / WATCH",
      badgeClass: "badge-safe"
    }
  ];

  // DOM Elements Cache
  const DOM = {
    toggleElNino: document.getElementById('toggleElNino'),
    sevButtons: document.querySelectorAll('.sev-btn'),
    rightMapTag: document.getElementById('rightMapTag'),
    rightMapMetricPill: document.getElementById('rightMapMetricPill'),
    rightMapHeatAura: document.getElementById('rightMapHeatAura'),
    rightMapAnomalyCard: document.getElementById('rightMapAnomalyCard'),
    rightMapRiver: document.getElementById('rightMapRiver'),
    kpiSalinityVal: document.getElementById('kpiSalinityVal'),
    kpiSalinityPill: document.getElementById('kpiSalinityPill'),
    kpiDepletionVal: document.getElementById('kpiDepletionVal'),
    kpiDepletionPill: document.getElementById('kpiDepletionPill'),
    kpiSewageVal: document.getElementById('kpiSewageVal'),
    kpiSewagePill: document.getElementById('kpiSewagePill'),
    kpiWardsVal: document.getElementById('kpiWardsVal'),
    kpiWardsPill: document.getElementById('kpiWardsPill'),
    actionTableBody: document.getElementById('actionTableBody'),
    leftPinsGroup: document.getElementById('leftPinsGroup'),
    rightPinsGroup: document.getElementById('rightPinsGroup'),
    btnOpenQr: document.getElementById('btnOpenQr'),
    btnCloseQr: document.getElementById('btnCloseQr'),
    qrModal: document.getElementById('qrModal')
  };

  // --- 2. MAP SVG PIN INJECTION ---
  function renderMapPins() {
    if (!DOM.leftPinsGroup || !DOM.rightPinsGroup) return;

    const leftPinsHtml = WARDS_DATA.map(w => `
      <g class="borewell-pin pin-baseline" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
        <circle class="pin-ring" cx="0" cy="0" r="10" />
        <circle class="pin-core" cx="0" cy="0" r="5" />
        <title>${w.name} (${w.taluk})&#10;Baseline TDS: ${w.baseTds} mg/L&#10;Depth: ${(w.depth - 7).toFixed(1)}m bgl</title>
      </g>
    `).join('');

    DOM.leftPinsGroup.innerHTML = leftPinsHtml;
    updateRightMapPins();
  }

  function updateRightMapPins() {
    if (!DOM.rightPinsGroup) return;

    const isShock = state.elNinoActive && state.severity !== 'normal';
    const isSevere = state.severity === 'severe';

    const rightPinsHtml = WARDS_DATA.map(w => {
      const isCorridor = w.distNoyyalKm <= 1.5;
      const pinClass = isShock && isCorridor ? 'pin-shock' : 'pin-baseline';
      const currentTds = isShock ? (isSevere ? w.shockTds : Math.round(w.baseTds * 1.45)) : w.baseTds;
      const currentDepth = isShock ? (isSevere ? w.depth : (w.depth - 4.5).toFixed(1)) : (w.depth - 9.4).toFixed(1);

      return `
        <g class="borewell-pin ${pinClass}" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
          <circle class="pin-ring" cx="0" cy="0" r="10" />
          <circle class="pin-core" cx="0" cy="0" r="5" />
          <title>${w.name} (${w.taluk})&#10;2026 Salinity: ${currentTds} mg/L&#10;Depth: ${currentDepth}m bgl&#10;Status: ${w.status}</title>
        </g>
      `;
    }).join('');

    DOM.rightPinsGroup.innerHTML = rightPinsHtml;
    attachPinHoverEvents();
  }

  function attachPinHoverEvents() {
    document.querySelectorAll('.borewell-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const id = pin.getAttribute('data-id');
        highlightWard(id);
      });
    });
  }

  // --- 3. STATE TELEMETRY UPDATE ---
  function updateTelemetry() {
    const isShock = state.elNinoActive && state.severity !== 'normal';
    const isSevere = state.severity === 'severe';

    // 1. Update Right Map Header & Aura
    if (!state.elNinoActive || state.severity === 'normal') {
      DOM.rightMapTag.textContent = "Expected Trend";
      DOM.rightMapTag.className = "map-card-tag tag-baseline";
      DOM.rightMapMetricPill.innerHTML = "Mean Depth: <strong>19.2m bgl</strong> | Trend TDS: <strong>1,550 mg/L</strong>";
      DOM.rightMapHeatAura.classList.remove('active');
      DOM.rightMapRiver.classList.remove('river-path-shock');

      DOM.rightMapAnomalyCard.innerHTML = `
        <div class="anomaly-row"><span class="anomaly-label">Status</span><span class="anomaly-val" style="color: var(--accent-cyan);">Normal Multi-Year Trend</span></div>
        <div class="anomaly-row"><span class="anomaly-label">Expected '26</span><span class="anomaly-val">19.2m | 1,550 mg/L</span></div>
        <div class="anomaly-row"><span class="anomaly-label">Corridor Seepage</span><span class="anomaly-val">42.0% (Stable)</span></div>
        <div class="anomaly-penalty-pill" style="color: var(--text-slate);">
          <span>Baseline Monitoring Mode</span>
        </div>
      `;

      // KPIs
      DOM.kpiSalinityVal.textContent = "1,550 mg/L";
      DOM.kpiSalinityPill.className = "kpi-impact-pill";
      DOM.kpiSalinityPill.textContent = "▲ +9.2% (Normal Annual Drift)";

      DOM.kpiDepletionVal.textContent = "19.2m bgl";
      DOM.kpiDepletionPill.className = "kpi-impact-pill";
      DOM.kpiDepletionPill.textContent = "▼ -0.8m (Seasonal Stable)";

      DOM.kpiSewageVal.textContent = "42.0%";
      DOM.kpiSewagePill.className = "kpi-impact-pill";
      DOM.kpiSewagePill.textContent = "▲ Baseline Intrusion";

      DOM.kpiWardsVal.textContent = "5 Wards";
      DOM.kpiWardsPill.className = "kpi-impact-pill";
      DOM.kpiWardsPill.textContent = "Routine Pre-Monsoon Watch";

    } else if (state.severity === 'moderate') {
      DOM.rightMapTag.textContent = "Moderate El Niño";
      DOM.rightMapTag.className = "map-card-tag";
      DOM.rightMapTag.style.background = "var(--accent-amber-dim)";
      DOM.rightMapTag.style.border = "1px solid rgba(245, 158, 11, 0.4)";
      DOM.rightMapTag.style.color = "var(--accent-amber)";
      DOM.rightMapMetricPill.innerHTML = "Mean Depth: <strong>24.1m bgl</strong> | TDS: <strong>2,280 mg/L</strong>";
      DOM.rightMapHeatAura.classList.add('active');
      DOM.rightMapRiver.classList.add('river-path-shock');

      DOM.rightMapAnomalyCard.innerHTML = `
        <div class="anomaly-row"><span class="anomaly-label">Expected '26</span><span class="anomaly-val">19.2m | 1,550 mg/L</span></div>
        <div class="anomaly-row"><span class="anomaly-label">Moderate '26</span><span class="anomaly-val" style="color: var(--accent-amber);">24.1m | 2,280 mg/L</span></div>
        <div class="anomaly-penalty-pill" style="color: var(--accent-amber);">
          <span>▼ -4.9m Extra Drawdown</span>
          <span>▲ +47.1% Salinity Surge</span>
        </div>
      `;

      // KPIs
      DOM.kpiSalinityVal.textContent = "2,280 mg/L";
      DOM.kpiSalinityPill.className = "kpi-impact-pill pill-amber";
      DOM.kpiSalinityPill.textContent = "▲ +47.1% Spike (Exceeds BIS Limit)";

      DOM.kpiDepletionVal.textContent = "24.1m bgl";
      DOM.kpiDepletionPill.className = "kpi-impact-pill pill-amber";
      DOM.kpiDepletionPill.textContent = "▼ -4.9m Deeper (+25.5% Drop)";

      DOM.kpiSewageVal.textContent = "61.5%";
      DOM.kpiSewagePill.className = "kpi-impact-pill pill-amber";
      DOM.kpiSewagePill.textContent = "▲ +46.4% Seepage Intrusion";

      DOM.kpiWardsVal.textContent = "9 / 60 Wards";
      DOM.kpiWardsPill.className = "kpi-impact-pill pill-amber";
      DOM.kpiWardsPill.textContent = "▲ +80% Escalated Watch";

    } else {
      // Severe El Niño Shock
      DOM.rightMapTag.textContent = "Severe El Niño Shock";
      DOM.rightMapTag.className = "map-card-tag tag-shock";
      DOM.rightMapTag.removeAttribute('style');
      DOM.rightMapMetricPill.innerHTML = "Mean Depth: <strong>28.6m bgl</strong> | TDS: <strong>2,940 mg/L</strong>";
      DOM.rightMapHeatAura.classList.add('active');
      DOM.rightMapRiver.classList.add('river-path-shock');

      DOM.rightMapAnomalyCard.innerHTML = `
        <div class="anomaly-row"><span class="anomaly-label">Expected '26</span><span class="anomaly-val">19.2m | 1,550 mg/L</span></div>
        <div class="anomaly-row"><span class="anomaly-label">El Niño '26</span><span class="anomaly-val" style="color: var(--accent-crimson);">28.6m | 2,940 mg/L</span></div>
        <div class="anomaly-penalty-pill">
          <span>▼ -9.4m Extra Drop (+48.9%)</span>
          <span>▲ +89.6% Salinity Surge</span>
        </div>
      `;

      // KPIs
      DOM.kpiSalinityVal.textContent = "2,940 mg/L";
      DOM.kpiSalinityPill.className = "kpi-impact-pill pill-crimson";
      DOM.kpiSalinityPill.textContent = "▲ +89.6% Spike (Exceeds 2,000 mg/L BIS Limit)";

      DOM.kpiDepletionVal.textContent = "28.6m bgl";
      DOM.kpiDepletionPill.className = "kpi-impact-pill pill-crimson";
      DOM.kpiDepletionPill.textContent = "▼ -9.4m Deeper (+48.9% Faster Drop)";

      DOM.kpiSewageVal.textContent = "78.4%";
      DOM.kpiSewagePill.className = "kpi-impact-pill pill-crimson";
      DOM.kpiSewagePill.textContent = "▲ +86.6% (Zero Monsoon Dilution)";

      DOM.kpiWardsVal.textContent = "14 / 60 Wards";
      DOM.kpiWardsPill.className = "kpi-impact-pill pill-crimson";
      DOM.kpiWardsPill.textContent = "▲ +180% Immediate Testing Priority";
    }

    updateRightMapPins();
  }

  // --- 4. ACTION TABLE INJECTION ---
  function renderActionTable() {
    if (!DOM.actionTableBody) return;

    DOM.actionTableBody.innerHTML = WARDS_DATA.slice(0, 6).map(w => `
      <tr data-id="${w.id}">
        <td class="tbl-rank">#0${w.rank}</td>
        <td class="tbl-zone">${w.name}</td>
        <td class="tbl-dist">${w.distNoyyalKm} km</td>
        <td class="tbl-tds">${w.shockTds} mg/L <span style="font-size: 10px; color: var(--accent-crimson);">(${w.surgePct})</span></td>
        <td><span class="action-badge ${w.badgeClass}">${w.status}</span></td>
      </tr>
    `).join('');

    DOM.actionTableBody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        highlightWard(id);
      });
    });
  }

  function highlightWard(id) {
    state.activeWardId = id;

    // Highlight table row
    DOM.actionTableBody.querySelectorAll('tr').forEach(r => {
      if (r.getAttribute('data-id') === id) {
        r.classList.add('active-row');
      } else {
        r.classList.remove('active-row');
      }
    });

    // Highlight map pin
    document.querySelectorAll('.borewell-pin').forEach(pin => {
      if (pin.getAttribute('data-id') === id) {
        pin.querySelector('.pin-core').setAttribute('r', '7');
        pin.querySelector('.pin-ring').setAttribute('r', '14');
        pin.querySelector('.pin-ring').style.strokeWidth = '2px';
      } else {
        pin.querySelector('.pin-core').setAttribute('r', '5');
        pin.querySelector('.pin-ring').setAttribute('r', '10');
        pin.querySelector('.pin-ring').style.strokeWidth = '1.2px';
      }
    });
  }

  // --- 5. CHART.JS PROOFS ---
  function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Chart 1: Trajectory Divergence Line Chart
    const ctxDiv = document.getElementById('chartDivergence');
    if (ctxDiv) {
      state.charts.divergence = new Chart(ctxDiv, {
        type: 'line',
        data: {
          labels: ['Summer 2023', 'Summer 2024', 'Summer 2025', 'Summer 2026'],
          datasets: [
            {
              label: "Expected '26 (Past Trend)",
              data: [1380, 1420, 1480, 1550],
              borderColor: '#94a3b8',
              borderDash: [5, 4],
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: '#94a3b8',
              tension: 0.2
            },
            {
              label: "Moderate El Niño '26",
              data: [1380, 1420, 1480, 2280],
              borderColor: '#f59e0b',
              borderWidth: 2.2,
              pointRadius: 4,
              pointBackgroundColor: '#f59e0b',
              tension: 0.25
            },
            {
              label: "Severe El Niño '26",
              data: [1380, 1420, 1480, 2940],
              borderColor: '#f43f5e',
              borderWidth: 2.6,
              pointRadius: 5,
              pointBackgroundColor: '#f43f5e',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              fill: true,
              tension: 0.25
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { size: 10.5, family: "'Inter', sans-serif" },
                color: '#cbd5e1'
              }
            },
            tooltip: {
              callbacks: {
                label: (c) => `${c.dataset.label}: ${c.raw} mg/L TDS`
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { font: { size: 10 } }
            },
            y: {
              min: 1000,
              max: 3200,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: {
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: v => v + ' mg/L'
              }
            }
          }
        }
      });
    }

    // Chart 2: Noyyal Proximity vs Salinity Surge Grouped Bar Chart
    const ctxProx = document.getElementById('chartProximity');
    if (ctxProx) {
      state.charts.proximity = new Chart(ctxProx, {
        type: 'bar',
        data: {
          labels: ['<0.5 km', '0.5–1.5 km', '1.5–3.0 km', '>3.0 km'],
          datasets: [
            {
              label: 'Expected Trend (% TDS Increase)',
              data: [12.4, 10.1, 6.5, 3.2],
              backgroundColor: '#334155',
              borderRadius: 3
            },
            {
              label: 'El Niño Stress (% TDS Surge)',
              data: [97.4, 90.6, 28.4, 8.5],
              backgroundColor: '#f43f5e',
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                font: { size: 10.5 },
                color: '#cbd5e1'
              }
            },
            tooltip: {
              callbacks: {
                label: (c) => `${c.dataset.label}: +${c.raw}%`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } }
            },
            y: {
              max: 110,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: {
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: v => '+' + v + '%'
              }
            }
          }
        }
      });
    }
  }

  // --- 6. EVENT LISTENERS & INITIALIZATION ---
  function initEvents() {
    // El Niño Toggle
    if (DOM.toggleElNino) {
      DOM.toggleElNino.addEventListener('change', (e) => {
        state.elNinoActive = e.target.checked;
        if (!state.elNinoActive) {
          DOM.sevButtons.forEach(b => b.classList.remove('active'));
          const normBtn = document.querySelector('.sev-btn[data-sev="normal"]');
          if (normBtn) normBtn.classList.add('active');
          state.severity = 'normal';
        } else {
          DOM.sevButtons.forEach(b => b.classList.remove('active'));
          const sevBtn = document.querySelector('.sev-btn[data-sev="severe"]');
          if (sevBtn) sevBtn.classList.add('active');
          state.severity = 'severe';
        }
        updateTelemetry();
      });
    }

    // Severity Selector
    DOM.sevButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.sevButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.severity = btn.getAttribute('data-sev');

        if (state.severity === 'normal') {
          state.elNinoActive = false;
          if (DOM.toggleElNino) DOM.toggleElNino.checked = false;
        } else {
          state.elNinoActive = true;
          if (DOM.toggleElNino) DOM.toggleElNino.checked = true;
        }

        updateTelemetry();
      });
    });

    // QR Modal
    if (DOM.btnOpenQr) {
      DOM.btnOpenQr.addEventListener('click', () => {
        DOM.qrModal.style.display = 'flex';
      });
    }

    if (DOM.btnCloseQr) {
      DOM.btnCloseQr.addEventListener('click', () => {
        DOM.qrModal.style.display = 'none';
      });
    }

    if (DOM.qrModal) {
      DOM.qrModal.addEventListener('click', (e) => {
        if (e.target === DOM.qrModal) {
          DOM.qrModal.style.display = 'none';
        }
      });
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.qrModal && DOM.qrModal.style.display === 'flex') {
        DOM.qrModal.style.display = 'none';
      }
    });
  }

  // --- BOOTSTRAP ---
  function init() {
    renderMapPins();
    renderActionTable();
    initCharts();
    initEvents();
    updateTelemetry();
    console.log("Where Tiruppur's Water Breaks First: Geospatial Dashboard Initialized.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
