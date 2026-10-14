/**
 * WHERE TIRUPPUR'S WATER BREAKS FIRST
 * Kinetic Hydro-Simulation Telemetry Controller
 * Implements 60fps Odometer animations, X-Ray Aquifer Cutaway transitions,
 * River particle flows, Sonar shockwaves, and ENSO continuous scrub simulation.
 */

(function () {
  'use strict';

  // --- 1. STATE & TELEMETRY REGISTRY ---
  const state = {
    elNinoActive: true,
    ensoValue: 2.4, // 0.0 to 2.4
    severity: 'severe', // 'normal' | 'moderate' | 'severe'
    activeWardId: null,
    currentValues: {
      salinity: 2940,
      depth: 28.6,
      sewage: 78.4,
      wards: 14
    },
    charts: {
      divergence: null,
      proximity: null
    }
  };

  // Telemetry Ward Locations (748x1024 Tiruppur Taluk Map coordinates)
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

  // DOM Elements
  const DOM = {
    btnToggleShock: document.getElementById('btnToggleShock'),
    ensoSlider: document.getElementById('ensoSlider'),
    ensoValTag: document.getElementById('ensoValTag'),
    rightMapTag: document.getElementById('rightMapTag'),
    rightMapMetricPill: document.getElementById('rightMapMetricPill'),
    rightMapHeatAura: document.getElementById('rightMapHeatAura'),
    rightMapAnomalyCard: document.getElementById('rightMapAnomalyCard'),
    rightMapRiver: document.getElementById('rightMapRiver'),
    rightRiverParticles: document.getElementById('rightRiverParticles'),
    leftPinsGroup: document.getElementById('leftPinsGroup'),
    rightPinsGroup: document.getElementById('rightPinsGroup'),

    // X-Ray Elements
    xrayBadgeStatus: document.getElementById('xrayBadgeStatus'),
    xrayWaterFill: document.getElementById('xrayWaterFill'),
    xrayWaterLine: document.getElementById('xrayWaterLine'),
    xrayWaterLabel: document.getElementById('xrayWaterLabel'),
    xraySewagePlume: document.getElementById('xraySewagePlume'),
    xrayDilutionArrows: document.getElementById('xrayDilutionArrows'),
    xrayRiverBedWater: document.getElementById('xrayRiverBedWater'),

    // KPIs & Visual Vial/Gauge
    kpiSalinityVal: document.getElementById('kpiSalinityVal'),
    kpiSalinityPill: document.getElementById('kpiSalinityPill'),
    vialLiquid: document.getElementById('vialLiquid'),
    kpiDepletionVal: document.getElementById('kpiDepletionVal'),
    kpiDepletionPill: document.getElementById('kpiDepletionPill'),
    depthGaugeBar: document.getElementById('depthGaugeBar'),
    kpiSewageVal: document.getElementById('kpiSewageVal'),
    kpiSewagePill: document.getElementById('kpiSewagePill'),
    kpiWardsVal: document.getElementById('kpiWardsVal'),
    kpiWardsPill: document.getElementById('kpiWardsPill'),

    // Table & Modal
    actionTableBody: document.getElementById('actionTableBody'),
    btnOpenQr: document.getElementById('btnOpenQr'),
    btnCloseQr: document.getElementById('btnCloseQr'),
    qrModal: document.getElementById('qrModal')
  };

  // --- 2. 60FPS COUNT-UP ODOMETER ANIMATION ---
  function animateOdometer(el, start, end, duration = 400, decimals = 0, suffix = "") {
    if (!el) return;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;

      el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.round(current)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = (decimals > 0 ? end.toFixed(decimals) : Math.round(end)) + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  // --- 3. DUAL MAP PINS WITH SONAR SHOCKWAVES ---
  function renderMapPins() {
    if (!DOM.leftPinsGroup || !DOM.rightPinsGroup) return;

    // Left Baseline Pins
    DOM.leftPinsGroup.innerHTML = WARDS_DATA.map(w => `
      <g class="borewell-pin pin-baseline" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
        <circle class="pin-ring" cx="0" cy="0" r="10" />
        <circle class="pin-core" cx="0" cy="0" r="5" />
        <title>${w.name} (${w.taluk})&#10;Baseline TDS: ${w.baseTds} mg/L&#10;Depth: ${(w.depth - 7).toFixed(1)}m bgl</title>
      </g>
    `).join('');

    updateRightMapPins();
  }

  function updateRightMapPins() {
    if (!DOM.rightPinsGroup) return;

    const isShock = state.ensoValue >= 1.0;
    const isSevere = state.ensoValue >= 1.8;

    DOM.rightPinsGroup.innerHTML = WARDS_DATA.map(w => {
      const isCorridor = w.distNoyyalKm <= 1.5;
      const pinClass = isShock && isCorridor ? 'pin-shock' : 'pin-baseline';

      const currentTds = isShock ? (isSevere ? w.shockTds : Math.round(w.baseTds * 1.45)) : w.baseTds;
      const currentDepth = isShock ? (isSevere ? w.depth : (w.depth - 4.5).toFixed(1)) : (w.depth - 9.4).toFixed(1);

      return `
        <g class="borewell-pin ${pinClass}" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
          <circle class="sonar-ring sonar-ring-1" cx="0" cy="0" r="6" />
          <circle class="sonar-ring sonar-ring-2" cx="0" cy="0" r="6" />
          <circle class="pin-ring" cx="0" cy="0" r="10" />
          <circle class="pin-core" cx="0" cy="0" r="5" />
          <title>${w.name} (${w.taluk})&#10;2026 Salinity: ${currentTds} mg/L&#10;Depth: ${currentDepth}m bgl&#10;Status: ${w.status}</title>
        </g>
      `;
    }).join('');

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

  // --- 4. CONTINUOUS SIMULATION ENGINE (DRIVEN BY ENSO ANOMALY) ---
  function applySimulation(enso, triggerSource = 'slider') {
    state.ensoValue = enso;
    state.elNinoActive = enso > 0.2;

    // Severity category
    if (enso < 0.6) {
      state.severity = 'normal';
    } else if (enso < 1.8) {
      state.severity = 'moderate';
    } else {
      state.severity = 'severe';
    }

    // Normalized progress 0 to 1
    const p = Math.min(Math.max(enso / 2.4, 0), 1);

    // Target Telemetry Values
    const targetSalinity = Math.round(1550 + (2940 - 1550) * p);
    const targetDepth = +(19.2 + (28.6 - 19.2) * p).toFixed(1);
    const targetSewage = +(42.0 + (78.4 - 42.0) * p).toFixed(1);
    const targetWards = Math.round(5 + (14 - 5) * p);

    // 1. Update Trigger Button & Label
    if (DOM.btnToggleShock) {
      if (state.elNinoActive) {
        DOM.btnToggleShock.classList.remove('inactive');
        DOM.btnToggleShock.innerHTML = `<span class="btn-bolt">⚡</span> EL NIÑO SHOCK ACTIVE (+${enso.toFixed(1)}°C)`;
      } else {
        DOM.btnToggleShock.classList.add('inactive');
        DOM.btnToggleShock.innerHTML = `<span class="btn-bolt">⚡</span> TRIGGER EL NIÑO SHOCK`;
      }
    }

    if (DOM.ensoValTag) {
      let label = "Normal Trend";
      if (state.severity === 'moderate') label = "Moderate El Niño";
      if (state.severity === 'severe') label = "Severe El Niño Shock";
      DOM.ensoValTag.textContent = `+${enso.toFixed(1)}°C (${label})`;
      DOM.ensoValTag.style.color = state.severity === 'normal' ? 'var(--accent-cyan)' : (state.severity === 'moderate' ? 'var(--accent-amber)' : 'var(--accent-crimson)');
    }

    if (triggerSource !== 'slider' && DOM.ensoSlider) {
      DOM.ensoSlider.value = enso;
    }

    // 2. Animate Odometer KPIs
    animateOdometer(DOM.kpiSalinityVal, state.currentValues.salinity, targetSalinity, 350, 0, " mg/L");
    animateOdometer(DOM.kpiDepletionVal, state.currentValues.depth, targetDepth, 350, 1, "m bgl");
    animateOdometer(DOM.kpiSewageVal, state.currentValues.sewage, targetSewage, 350, 1, "%");
    animateOdometer(DOM.kpiWardsVal, state.currentValues.wards, targetWards, 350, 0, " / 60 Wards");

    state.currentValues.salinity = targetSalinity;
    state.currentValues.depth = targetDepth;
    state.currentValues.sewage = targetSewage;
    state.currentValues.wards = targetWards;

    // 3. Update Visual Water Sample Vial
    if (DOM.vialLiquid) {
      if (targetSalinity >= 2000) {
        DOM.vialLiquid.classList.add('toxic');
        DOM.kpiSalinityPill.className = "kpi-impact-pill pill-crimson";
        DOM.kpiSalinityPill.textContent = `▲ +${((targetSalinity - 1550) / 1550 * 100).toFixed(1)}% Spike (Exceeds BIS 2,000 mg/L)`;
      } else if (targetSalinity > 1700) {
        DOM.vialLiquid.classList.remove('toxic');
        DOM.vialLiquid.style.background = 'rgba(245, 158, 11, 0.65)';
        DOM.kpiSalinityPill.className = "kpi-impact-pill pill-amber";
        DOM.kpiSalinityPill.textContent = `▲ +${((targetSalinity - 1550) / 1550 * 100).toFixed(1)}% Elevated Salinity`;
      } else {
        DOM.vialLiquid.classList.remove('toxic');
        DOM.vialLiquid.style.background = 'rgba(6, 182, 212, 0.45)';
        DOM.kpiSalinityPill.className = "kpi-impact-pill";
        DOM.kpiSalinityPill.textContent = "▲ Baseline Trend Creep";
      }
    }

    // 4. Update Vertical Mini Depth Gauge
    if (DOM.depthGaugeBar) {
      const pct = Math.round(55 + (82 - 55) * p);
      DOM.depthGaugeBar.style.height = `${pct}%`;
      if (p > 0.5) {
        DOM.depthGaugeBar.classList.add('shock');
        DOM.kpiDepletionPill.className = "kpi-impact-pill pill-crimson";
        DOM.kpiDepletionPill.textContent = `▼ -${(targetDepth - 19.2).toFixed(1)}m Deeper (+${((targetDepth - 19.2)/19.2*100).toFixed(1)}% Faster Drop)`;
      } else {
        DOM.depthGaugeBar.classList.remove('shock');
        DOM.kpiDepletionPill.className = "kpi-impact-pill";
        DOM.kpiDepletionPill.textContent = "▼ Baseline Seasonal Range";
      }
    }

    // 5. Update KPI 3 & 4 Pills
    if (DOM.kpiSewagePill) {
      if (p > 0.5) {
        DOM.kpiSewagePill.className = "kpi-impact-pill pill-crimson";
        DOM.kpiSewagePill.textContent = `▲ +${((targetSewage - 42.0)/42.0*100).toFixed(1)}% (Zero Monsoon Dilution)`;
      } else {
        DOM.kpiSewagePill.className = "kpi-impact-pill";
        DOM.kpiSewagePill.textContent = "▲ 42% Baseline Seepage";
      }
    }

    if (DOM.kpiWardsPill) {
      if (p > 0.5) {
        DOM.kpiWardsPill.className = "kpi-impact-pill pill-crimson";
        DOM.kpiWardsPill.textContent = `▲ +${((targetWards - 5)/5*100).toFixed(0)}% Immediate Priority`;
      } else {
        DOM.kpiWardsPill.className = "kpi-impact-pill";
        DOM.kpiWardsPill.textContent = "Routine Monitoring Wards";
      }
    }

    // 6. Update Right Map Aesthetics
    if (DOM.rightMapTag) {
      if (state.severity === 'normal') {
        DOM.rightMapTag.textContent = "Expected Trend";
        DOM.rightMapTag.className = "map-card-tag tag-baseline";
        DOM.rightMapMetricPill.innerHTML = `Mean Depth: <strong>19.2m bgl</strong> | Trend TDS: <strong>1,550 mg/L</strong>`;
      } else if (state.severity === 'moderate') {
        DOM.rightMapTag.textContent = "Moderate El Niño";
        DOM.rightMapTag.className = "map-card-tag";
        DOM.rightMapTag.style.background = "var(--accent-amber-dim)";
        DOM.rightMapTag.style.border = "1px solid rgba(245, 158, 11, 0.4)";
        DOM.rightMapTag.style.color = "var(--accent-amber)";
        DOM.rightMapMetricPill.innerHTML = `Mean Depth: <strong>${targetDepth}m bgl</strong> | TDS: <strong>${targetSalinity} mg/L</strong>`;
      } else {
        DOM.rightMapTag.textContent = "Severe El Niño Shock";
        DOM.rightMapTag.className = "map-card-tag tag-shock";
        DOM.rightMapTag.removeAttribute('style');
        DOM.rightMapMetricPill.innerHTML = `Mean Depth: <strong>${targetDepth}m bgl</strong> | TDS: <strong>${targetSalinity} mg/L</strong>`;
      }
    }

    if (DOM.rightMapHeatAura) {
      DOM.rightMapHeatAura.style.opacity = p * 0.95;
    }

    if (DOM.rightMapRiver && DOM.rightRiverParticles) {
      if (p > 0.4) {
        DOM.rightMapRiver.classList.add('river-path-shock');
        DOM.rightRiverParticles.classList.add('river-flow-particles-shock');
      } else {
        DOM.rightMapRiver.classList.remove('river-path-shock');
        DOM.rightRiverParticles.classList.remove('river-flow-particles-shock');
      }
    }

    if (DOM.rightMapAnomalyCard) {
      DOM.rightMapAnomalyCard.innerHTML = `
        <div class="anomaly-row"><span class="anomaly-label">Expected '26</span><span class="anomaly-val">19.2m | 1,550 mg/L</span></div>
        <div class="anomaly-row"><span class="anomaly-label">El Niño '26</span><span class="anomaly-val" style="color: ${p > 0.5 ? 'var(--accent-crimson)' : 'var(--accent-amber)'};">${targetDepth}m | ${targetSalinity} mg/L</span></div>
        <div class="anomaly-penalty-pill" style="color: ${p > 0.5 ? 'var(--accent-crimson)' : 'var(--accent-amber)'};">
          <span>▼ -${(targetDepth - 19.2).toFixed(1)}m Extra Drop</span>
          <span>▲ +${((targetSalinity - 1550)/1550*100).toFixed(1)}% Salinity Surge</span>
        </div>
      `;
    }

    // 7. Update Live Underground Aquifer X-Ray Cutaway
    updateXraySimulation(p, targetDepth);

    // 8. Update Map Pins
    updateRightMapPins();
  }

  // --- 5. LIVE UNDERGROUND AQUIFER X-RAY CONTROLLER ---
  function updateXraySimulation(p, depth) {
    if (!DOM.xrayWaterFill || !DOM.xrayWaterLine || !DOM.xrayWaterLabel) return;

    // Depth scales: 0m at Y=40, 35m at Y=240 -> Scale: ~5.7 pixels per meter
    // 19.2m -> Y = 40 + (19.2 * 5.7) = 149
    // 28.6m -> Y = 40 + (28.6 * 5.7) = 203
    const targetY = Math.round(149 + (203 - 149) * p);
    const targetHeight = Math.max(240 - targetY, 15);

    DOM.xrayWaterFill.setAttribute('y', targetY);
    DOM.xrayWaterFill.setAttribute('height', targetHeight);

    DOM.xrayWaterLine.setAttribute('y1', targetY);
    DOM.xrayWaterLine.setAttribute('y2', targetY);

    DOM.xrayWaterLabel.setAttribute('y', targetY - 6);
    DOM.xrayWaterLabel.textContent = `Water Table: ${depth.toFixed(1)}m bgl ${p > 0.5 ? '▼ CRITICAL DROP' : '• Baseline'}`;

    if (p > 0.5) {
      DOM.xrayWaterFill.setAttribute('fill', 'url(#waterGradSaline)');
      DOM.xrayWaterLine.setAttribute('stroke', '#f43f5e');
      DOM.xrayWaterLabel.setAttribute('fill', '#f43f5e');
      if (DOM.xrayBadgeStatus) {
        DOM.xrayBadgeStatus.className = 'xray-badge-status';
        DOM.xrayBadgeStatus.textContent = 'EL NIÑO SHOCK: SEWAGE PLUME PENETRATING INTAKE';
      }
      if (DOM.xrayRiverBedWater) DOM.xrayRiverBedWater.setAttribute('fill', '#701a75');
      if (DOM.xraySewagePlume) DOM.xraySewagePlume.style.opacity = Math.min(p * 1.1, 1);
      if (DOM.xrayDilutionArrows) DOM.xrayDilutionArrows.style.opacity = Math.max(1 - p * 1.5, 0);
    } else {
      DOM.xrayWaterFill.setAttribute('fill', 'url(#waterGradCyan)');
      DOM.xrayWaterLine.setAttribute('stroke', '#06b6d4');
      DOM.xrayWaterLabel.setAttribute('fill', '#06b6d4');
      if (DOM.xrayBadgeStatus) {
        DOM.xrayBadgeStatus.className = 'xray-badge-status normal';
        DOM.xrayBadgeStatus.textContent = 'EXPECTED 2026: NORMAL RECHARGE & DILUTION';
      }
      if (DOM.xrayRiverBedWater) DOM.xrayRiverBedWater.setAttribute('fill', '#0284c7');
      if (DOM.xraySewagePlume) DOM.xraySewagePlume.style.opacity = 0;
      if (DOM.xrayDilutionArrows) DOM.xrayDilutionArrows.style.opacity = 1;
    }
  }

  // --- 6. CORPORATION ACTION TABLE & CLICK-TO-LOCATE ---
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
    const ward = WARDS_DATA.find(w => w.id === id);

    // Highlight row
    DOM.actionTableBody.querySelectorAll('tr').forEach(r => {
      if (r.getAttribute('data-id') === id) {
        r.classList.add('active-row');
      } else {
        r.classList.remove('active-row');
      }
    });

    // Pulse & highlight map pin
    document.querySelectorAll('.borewell-pin').forEach(pin => {
      const pinId = pin.getAttribute('data-id');
      const core = pin.querySelector('.pin-core');
      const ring = pin.querySelector('.pin-ring');

      if (pinId === id) {
        pin.style.transform = 'scale(1.5)';
        core.setAttribute('r', '8');
        ring.setAttribute('r', '18');
        ring.style.stroke = '#ffffff';
        ring.style.strokeWidth = '2px';
      } else {
        pin.style.transform = 'scale(1)';
        core.setAttribute('r', '5');
        ring.setAttribute('r', '10');
        ring.style.strokeWidth = '1.2px';
      }
    });
  }

  // --- 7. CHART.JS PROOFS ---
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

  // --- 8. EVENT LISTENERS ---
  function initEvents() {
    // Slider Dragging
    if (DOM.ensoSlider) {
      DOM.ensoSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        applySimulation(val, 'slider');
      });
    }

    // Toggle Button Click
    if (DOM.btnToggleShock) {
      DOM.btnToggleShock.addEventListener('click', () => {
        if (state.elNinoActive) {
          applySimulation(0.0, 'button');
        } else {
          applySimulation(2.4, 'button');
        }
      });
    }

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
    applySimulation(2.4, 'init'); // Start in high-impact shock mode for live pitch demo
    console.log("Hydro-Simulation Command Center Initialized.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
