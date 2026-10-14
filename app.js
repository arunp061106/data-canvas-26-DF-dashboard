/**
 * WHERE TIRUPPUR'S WATER BREAKS FIRST
 * Bklit UI + Oceanic Hydro-Thermal Telemetry Dashboard Engine
 * Zero-paragraph, high-impact geospatial analytics controller
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. TELEMETRY REGISTRY & INITIAL STATE
  // ==========================================================================
  const state = {
    elNinoActive: true,
    ensoValue: 2.4, // 0.0 (Normal) -> 1.2 (Moderate) -> 2.4 (Severe)
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

  // Top Vulnerable Zones / Monitoring Wards (748x1024 Taluk coordinate space)
  const WARDS_DATA = [
    {
      id: "w-01",
      rank: "01",
      name: "Tiruppur South (Nallur)",
      taluk: "Tirupur Taluk",
      distNoyyalKm: 0.4,
      baseTds: 1580,
      shockTds: 3120,
      surgePct: "+97.4%",
      depth: 28.8,
      action: "CAP & TEST",
      actionClass: "tag-cap",
      x: 345,
      y: 375,
      barPct: 98
    },
    {
      id: "w-02",
      rank: "02",
      name: "Tiruppur North (Kasipalayam)",
      taluk: "Tirupur Taluk",
      distNoyyalKm: 0.6,
      baseTds: 1510,
      shockTds: 2940,
      surgePct: "+94.7%",
      depth: 27.4,
      action: "CAP & TEST",
      actionClass: "tag-cap",
      x: 310,
      y: 340,
      barPct: 94
    },
    {
      id: "w-03",
      rank: "03",
      name: "Veerapandi Corridor",
      taluk: "Tirupur Taluk",
      distNoyyalKm: 0.8,
      baseTds: 1490,
      shockTds: 2840,
      surgePct: "+90.6%",
      depth: 26.5,
      action: "CAP & TEST",
      actionClass: "tag-cap",
      x: 380,
      y: 390,
      barPct: 91
    },
    {
      id: "w-04",
      rank: "04",
      name: "Kangayam (Orathupalayam Belt)",
      taluk: "Kangayam Taluk",
      distNoyyalKm: 1.1,
      baseTds: 1610,
      shockTds: 2980,
      surgePct: "+85.1%",
      depth: 29.2,
      action: "CAP & TEST",
      actionClass: "tag-cap",
      x: 530,
      y: 410,
      barPct: 85
    },
    {
      id: "w-05",
      rank: "05",
      name: "Avinashi East Buffer",
      taluk: "Avinashi Taluk",
      distNoyyalKm: 1.6,
      baseTds: 1390,
      shockTds: 2310,
      surgePct: "+66.2%",
      depth: 22.8,
      action: "WEEKLY LOG",
      actionClass: "tag-log",
      x: 260,
      y: 245,
      barPct: 66
    },
    {
      id: "w-06",
      rank: "06",
      name: "Palladam Border Zone",
      taluk: "Palladam Taluk",
      distNoyyalKm: 2.4,
      baseTds: 1470,
      shockTds: 1890,
      surgePct: "+28.4%",
      depth: 20.4,
      action: "WEEKLY LOG",
      actionClass: "tag-log",
      x: 230,
      y: 420,
      barPct: 28
    },
    {
      id: "w-07",
      rank: "07",
      name: "Dharapuram Central Aquifer",
      taluk: "Dharapuram Taluk",
      distNoyyalKm: 5.2,
      baseTds: 1120,
      shockTds: 1210,
      surgePct: "+8.0%",
      depth: 18.2,
      action: "MONITOR",
      actionClass: "tag-log",
      x: 390,
      y: 580,
      barPct: 15
    },
    {
      id: "w-08",
      rank: "08",
      name: "Udumalpet Foothills Basin",
      taluk: "Udumalpet Taluk",
      distNoyyalKm: 8.4,
      baseTds: 860,
      shockTds: 910,
      surgePct: "+5.8%",
      depth: 16.5,
      action: "MONITOR",
      actionClass: "tag-log",
      x: 170,
      y: 780,
      barPct: 10
    }
  ];

  // DOM Elements Cache
  const DOM = {};

  function initDOM() {
    DOM.statusOrb = document.getElementById('statusOrb');
    DOM.btnElNinoToggle = document.getElementById('btnElNinoToggle');
    DOM.ensoSlider = document.getElementById('ensoSlider');
    DOM.ensoValTag = document.getElementById('ensoValTag');

    // Right Map Elements
    DOM.rightMapTag = document.getElementById('rightMapTag');
    DOM.rightMapMetricPill = document.getElementById('rightMapMetricPill');
    DOM.rightMapHeatAura = document.getElementById('rightMapHeatAura');
    DOM.rightMapRiver = document.getElementById('rightMapRiver');
    DOM.rightRiverParticles = document.getElementById('rightRiverParticles');
    DOM.rightPinsGroup = document.getElementById('rightPinsGroup');
    DOM.leftPinsGroup = document.getElementById('leftPinsGroup');
    DOM.hudExpectedVal = document.getElementById('hudExpectedVal');
    DOM.hudRealityVal = document.getElementById('hudRealityVal');
    DOM.hudDropAnomaly = document.getElementById('hudDropAnomaly');
    DOM.hudSalinityAnomaly = document.getElementById('hudSalinityAnomaly');

    // Aquifer X-Ray Elements
    DOM.xrayBadgeStatus = document.getElementById('xrayBadgeStatus');
    DOM.xrayWaterFill = document.getElementById('xrayWaterFill');
    DOM.xrayWaterLine = document.getElementById('xrayWaterLine');
    DOM.xrayWaterLabel = document.getElementById('xrayWaterLabel');
    DOM.xraySewagePlume = document.getElementById('xraySewagePlume');
    DOM.xrayDilutionArrows = document.getElementById('xrayDilutionArrows');
    DOM.xrayRiverBedWater = document.getElementById('xrayRiverBedWater');

    // 4 KPI Cards
    DOM.kpiSalinityVal = document.getElementById('kpiSalinityVal');
    DOM.kpiSalinityPill = document.getElementById('kpiSalinityPill');
    DOM.vialFill = document.getElementById('vialFill');
    DOM.sparklineDot = document.getElementById('sparklineDot');
    DOM.sparklineLine = document.getElementById('sparklineLine');
    DOM.sparklineArea = document.getElementById('sparklineArea');

    DOM.kpiDepletionVal = document.getElementById('kpiDepletionVal');
    DOM.kpiDepletionPill = document.getElementById('kpiDepletionPill');
    DOM.ringDepletion = document.getElementById('ringDepletion');

    DOM.kpiSewageVal = document.getElementById('kpiSewageVal');
    DOM.kpiSewagePill = document.getElementById('kpiSewagePill');
    DOM.ringSewage = document.getElementById('ringSewage');

    DOM.kpiWardsVal = document.getElementById('kpiWardsVal');
    DOM.kpiWardsPill = document.getElementById('kpiWardsPill');
    DOM.ringWards = document.getElementById('ringWards');

    // Leaderboard
    DOM.leaderboardList = document.getElementById('leaderboardList');

    // QR Modal
    DOM.btnOpenQr = document.getElementById('btnOpenQr');
    DOM.btnCloseQr = document.getElementById('btnCloseQr');
    DOM.qrModal = document.getElementById('qrModal');
  }

  // ==========================================================================
  // 2. 60FPS CUBIC ODOMETER COUNT-UP ANIMATION
  // ==========================================================================
  function animateOdometer(el, start, end, duration = 380, decimals = 0, suffix = "") {
    if (!el) return;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;

      el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()) + suffix;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = (decimals > 0 ? end.toFixed(decimals) : Math.round(end).toLocaleString()) + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  // ==========================================================================
  // 3. HTML5 CANVAS MAP SHADER ENGINE (STRIP EXTERIOR WHITE + INVERT LABELS)
  // ==========================================================================
  function initMapShaders() {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = function () {
      processCanvasShader('canvasLeftMap', img);
      processCanvasShader('canvasRightMap', img);
    };

    img.onerror = function () {
      console.warn("Canvas shader fallback: image loading error, fallback active.");
    };

    // Load user's cleaned Tiruppur 6-Taluk map
    img.src = "image_8454d9.jpg";
  }

  function processCanvasShader(canvasId, img) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    canvas.width = img.naturalWidth || 748;
    canvas.height = img.naturalHeight || 1024;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 1. Exterior White / Light Margin Pixels -> 100% Transparent
        if (r > 236 && g > 236 && b > 236) {
          data[i + 3] = 0;
        }
        // 2. Black Taluk Text Labels & Dark Boundaries -> Invert to Ice-White (#E2E8F0)
        else if (r < 75 && g < 75 && b < 75) {
          data[i] = 226;
          data[i + 1] = 232;
          data[i + 2] = 240;
          data[i + 3] = 255;
        }
        // 3. Dotted Internal Boundaries / Medium Grey
        else if (Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r < 165) {
          data[i] = 203;
          data[i + 1] = 213;
          data[i + 2] = 225;
          data[i + 3] = 255;
        }
        // 4. Pastel Taluk Fills -> Shift into deep slate-indigo hues (#162238 to #1E293B)
        else {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const factor = lum / 255;
          data[i] = Math.round(18 + factor * 14);     // Red 18-32
          data[i + 1] = Math.round(28 + factor * 22); // Green 28-50
          data[i + 2] = Math.round(44 + factor * 30); // Blue 44-74
          data[i + 3] = 245;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Hide fallback layer as shader rendered successfully
      const viewport = canvas.closest('.map-viewport');
      if (viewport) {
        const fallback = viewport.querySelector('.tiruppur-map-img');
        if (fallback) fallback.style.display = 'none';
      }
    } catch (err) {
      // If local origin security prevents getImageData, CSS filter handles transparency
      console.warn("Canvas getImageData origin restricted, using CSS filter fallback:", err);
      canvas.style.display = 'none';
      const viewport = canvas.closest('.map-viewport');
      if (viewport) {
        const fallback = viewport.querySelector('.tiruppur-map-img');
        if (fallback) fallback.style.display = 'block';
      }
    }
  }

  // ==========================================================================
  // 4. MAP PINS & EXPANDING SONAR SHOCKWAVES
  // ==========================================================================
  function renderMapPins() {
    if (DOM.leftPinsGroup) {
      DOM.leftPinsGroup.innerHTML = WARDS_DATA.map(w => `
        <g class="borewell-node" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
          <circle class="node-ring" cx="0" cy="0" r="9" />
          <circle class="node-core" cx="0" cy="0" r="4.5" />
          <title>${w.name} (${w.taluk})&#10;2025 Baseline TDS: ${w.baseTds} mg/L&#10;Depth: ${(w.depth - 9.4).toFixed(1)}m bgl</title>
        </g>
      `).join('');
    }

    updateRightMapPins();
  }

  function updateRightMapPins() {
    if (!DOM.rightPinsGroup) return;

    const isShock = state.ensoValue >= 0.8;
    const isSevere = state.ensoValue >= 1.8;

    DOM.rightPinsGroup.innerHTML = WARDS_DATA.map(w => {
      const isCorridor = w.distNoyyalKm <= 1.5;
      const isShockNode = isShock && isCorridor;
      const nodeClass = isShockNode ? 'borewell-node node-shock' : 'borewell-node';

      const currentTds = isShock ? (isSevere ? w.shockTds : Math.round(w.baseTds * 1.45)) : w.baseTds;
      const currentDepth = isShock ? (isSevere ? w.depth : (w.depth - 4.5).toFixed(1)) : (w.depth - 9.4).toFixed(1);

      return `
        <g class="${nodeClass}" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
          ${isShockNode ? `
            <circle class="sonar-wave sonar-wave-1" cx="0" cy="0" r="6" />
            <circle class="sonar-wave sonar-wave-2" cx="0" cy="0" r="6" />
          ` : ''}
          <circle class="node-ring" cx="0" cy="0" r="9" />
          <circle class="node-core" cx="0" cy="0" r="4.5" />
          <title>${w.name} (${w.taluk})&#10;Distance to Noyyal: ${w.distNoyyalKm} km&#10;TDS: ${currentTds} mg/L (${w.surgePct})&#10;Water Table: ${currentDepth}m bgl</title>
        </g>
      `;
    }).join('');

    attachPinEvents();
  }

  function attachPinEvents() {
    document.querySelectorAll('.borewell-node').forEach(node => {
      node.addEventListener('click', () => {
        const id = node.getAttribute('data-id');
        highlightWard(id);
      });
    });
  }

  // ==========================================================================
  // 5. CONTINUOUS SIMULATION ENGINE (DRIVEN BY ENSO ANOMALY)
  // ==========================================================================
  function applySimulation(enso, triggerSource = 'slider') {
    state.ensoValue = enso;
    state.elNinoActive = enso > 0.2;

    if (enso < 0.6) {
      state.severity = 'normal';
    } else if (enso < 1.8) {
      state.severity = 'moderate';
    } else {
      state.severity = 'severe';
    }

    const p = Math.min(Math.max(enso / 2.4, 0), 1);

    // Target Telemetry Values
    const targetSalinity = Math.round(1550 + (2940 - 1550) * p);
    const targetDepth = +(19.2 + (28.6 - 19.2) * p).toFixed(1);
    const targetSewage = +(42.0 + (78.4 - 42.0) * p).toFixed(1);
    const targetWards = Math.round(5 + (14 - 5) * p);

    // 1. Update Top Nav Status Orb
    if (DOM.statusOrb) {
      if (state.elNinoActive) {
        DOM.statusOrb.classList.add('shock');
      } else {
        DOM.statusOrb.classList.remove('shock');
      }
    }

    // 2. Update Floating Dock Controls
    if (DOM.btnElNinoToggle) {
      if (state.elNinoActive) {
        DOM.btnElNinoToggle.classList.remove('inactive');
        DOM.btnElNinoToggle.innerHTML = `<span style="font-size:14px">⚡</span> EL NIÑO EFFECT ACTIVE (+${enso.toFixed(1)}°C)`;
      } else {
        DOM.btnElNinoToggle.classList.add('inactive');
        DOM.btnElNinoToggle.innerHTML = `<span style="font-size:14px">⚡</span> APPLY EL NIÑO EFFECT`;
      }
    }

    if (DOM.ensoValTag) {
      let label = "Normal Trend";
      if (state.severity === 'moderate') label = "Moderate El Niño";
      if (state.severity === 'severe') label = "Severe El Niño";
      DOM.ensoValTag.textContent = `+${enso.toFixed(1)}°C (${label})`;
      DOM.ensoValTag.style.color = state.severity === 'normal' ? 'var(--accent-glacier)' : 'var(--accent-amber)';
    }

    if (triggerSource !== 'slider' && DOM.ensoSlider) {
      DOM.ensoSlider.value = enso;
    }

    // 3. Update Center Map Header & HUD Comparison Chips
    if (DOM.rightMapTag) {
      if (state.severity === 'normal') {
        DOM.rightMapTag.textContent = "Expected Trend";
        DOM.rightMapTag.className = "bklit-badge badge-baseline";
        DOM.rightMapMetricPill.innerHTML = `Depth: <strong>19.2m bgl</strong> &bull; TDS: <strong>1,550 mg/L</strong>`;
      } else if (state.severity === 'moderate') {
        DOM.rightMapTag.textContent = "Moderate El Niño";
        DOM.rightMapTag.className = "bklit-badge badge-shock";
        DOM.rightMapMetricPill.innerHTML = `Depth: <strong>${targetDepth}m bgl</strong> &bull; TDS: <strong>${targetSalinity.toLocaleString()} mg/L</strong>`;
      } else {
        DOM.rightMapTag.textContent = "Severe El Niño Shock";
        DOM.rightMapTag.className = "bklit-badge badge-shock";
        DOM.rightMapMetricPill.innerHTML = `Depth: <strong>${targetDepth}m bgl</strong> &bull; TDS: <strong>${targetSalinity.toLocaleString()} mg/L</strong>`;
      }
    }

    if (DOM.hudRealityVal) {
      DOM.hudRealityVal.textContent = `${targetDepth}m · ${targetSalinity.toLocaleString()} mg/L`;
      DOM.hudRealityVal.style.color = p > 0.5 ? 'var(--accent-coral)' : 'var(--accent-amber)';
    }
    if (DOM.hudDropAnomaly) {
      DOM.hudDropAnomaly.textContent = `▼ -${(targetDepth - 19.2).toFixed(1)}m Drop`;
    }
    if (DOM.hudSalinityAnomaly) {
      DOM.hudSalinityAnomaly.textContent = `▲ +${((targetSalinity - 1550) / 1550 * 100).toFixed(1)}% Salinity Surge`;
    }

    // 4. Update Center Map Ambient Heat Aura & River Flow
    if (DOM.rightMapHeatAura) {
      DOM.rightMapHeatAura.style.opacity = (p * 0.42).toFixed(3);
    }

    if (DOM.rightMapRiver && DOM.rightRiverParticles) {
      if (p > 0.4) {
        DOM.rightMapRiver.className = 'river-stream-base river-stream-shock';
        DOM.rightRiverParticles.className = 'river-particle-track river-particle-track-shock';
      } else {
        DOM.rightMapRiver.className = 'river-stream-base';
        DOM.rightRiverParticles.className = 'river-particle-track';
      }
    }

    // 5. Update KPI Cards with Odometer
    animateOdometer(DOM.kpiSalinityVal, state.currentValues.salinity, targetSalinity, 350, 0, " mg/L");
    animateOdometer(DOM.kpiDepletionVal, state.currentValues.depth, targetDepth, 350, 1, "m bgl");
    animateOdometer(DOM.kpiSewageVal, state.currentValues.sewage, targetSewage, 350, 1, "%");
    animateOdometer(DOM.kpiWardsVal, state.currentValues.wards, targetWards, 350, 0, " / 60 Wards");

    state.currentValues.salinity = targetSalinity;
    state.currentValues.depth = targetDepth;
    state.currentValues.sewage = targetSewage;
    state.currentValues.wards = targetWards;

    // Visual Water Clarity Vial & Mini Sparkline
    if (DOM.vialFill) {
      if (targetSalinity >= 2000) {
        DOM.vialFill.classList.add('concentrated');
        DOM.kpiSalinityPill.className = "kpi-bottom-pill pill-coral";
        DOM.kpiSalinityPill.textContent = `▲ +${((targetSalinity - 1550) / 1550 * 100).toFixed(1)}% vs. Expected`;
      } else if (targetSalinity > 1700) {
        DOM.vialFill.classList.remove('concentrated');
        DOM.vialFill.style.background = 'rgba(245, 158, 11, 0.65)';
        DOM.kpiSalinityPill.className = "kpi-bottom-pill pill-amber";
        DOM.kpiSalinityPill.textContent = `▲ +${((targetSalinity - 1550) / 1550 * 100).toFixed(1)}% vs. Expected`;
      } else {
        DOM.vialFill.classList.remove('concentrated');
        DOM.vialFill.style.background = 'rgba(56, 189, 248, 0.45)';
        DOM.kpiSalinityPill.className = "kpi-bottom-pill";
        DOM.kpiSalinityPill.textContent = "▲ +0.0% Baseline Trend";
      }
    }

    // Animate Mini Sparkline in Card 1
    if (DOM.sparklineDot && DOM.sparklineLine && DOM.sparklineArea) {
      const sparkY = Math.round(28 - 24 * p);
      DOM.sparklineDot.setAttribute('cy', sparkY);
      DOM.sparklineLine.setAttribute('d', `M 0 28 L 18 25 L 36 21 L 54 16 L 64 ${sparkY}`);
      DOM.sparklineArea.setAttribute('d', `M 0 28 L 18 25 L 36 21 L 54 16 L 64 ${sparkY} L 64 32 L 0 32 Z`);
      DOM.sparklineDot.setAttribute('fill', p > 0.5 ? '#f97316' : '#f59e0b');
      DOM.sparklineLine.setAttribute('stroke', p > 0.5 ? '#f97316' : '#f59e0b');
    }

    // KPI 2: Water Table Radial Ring
    if (DOM.ringDepletion) {
      // Offset: 100 is 0%, 51.1 is 48.9%
      const offset = 100 - (48.9 * p);
      DOM.ringDepletion.style.strokeDashoffset = offset;
      DOM.ringDepletion.style.stroke = p > 0.5 ? 'var(--accent-coral)' : 'var(--accent-amber)';
      if (p > 0.5) {
        DOM.kpiDepletionPill.className = "kpi-bottom-pill pill-coral";
        DOM.kpiDepletionPill.textContent = `▼ -${(targetDepth - 19.2).toFixed(1)}m Deeper (+48.9% Faster Drop)`;
      } else {
        DOM.kpiDepletionPill.className = "kpi-bottom-pill";
        DOM.kpiDepletionPill.textContent = "▼ Baseline Seasonal Range";
      }
    }

    // KPI 3: Untreated Sewage Radial Ring
    if (DOM.ringSewage) {
      const offset = 100 - targetSewage;
      DOM.ringSewage.style.strokeDashoffset = offset;
      DOM.ringSewage.style.stroke = p > 0.5 ? 'var(--accent-coral)' : 'var(--accent-amber)';
      if (p > 0.5) {
        DOM.kpiSewagePill.className = "kpi-bottom-pill pill-coral";
        DOM.kpiSewagePill.textContent = `▲ +${((targetSewage - 42.0) / 42.0 * 100).toFixed(1)}% Seepage Surge`;
      } else {
        DOM.kpiSewagePill.className = "kpi-bottom-pill";
        DOM.kpiSewagePill.textContent = "▲ 42% Baseline Seepage";
      }
    }

    // KPI 4: Critical Wards Radial Ring
    if (DOM.ringWards) {
      const offset = 100 - ((targetWards / 60) * 100);
      DOM.ringWards.style.strokeDashoffset = offset;
      DOM.ringWards.style.stroke = p > 0.5 ? 'var(--accent-coral)' : 'var(--accent-amber)';
      if (p > 0.5) {
        DOM.kpiWardsPill.className = "kpi-bottom-pill pill-coral";
        DOM.kpiWardsPill.textContent = `▲ +${((targetWards - 5) / 5 * 100).toFixed(0)}% Immediate Testing Priority`;
      } else {
        DOM.kpiWardsPill.className = "kpi-bottom-pill";
        DOM.kpiWardsPill.textContent = "Routine Monitoring Wards";
      }
    }

    // 6. Update Aquifer X-Ray
    updateXray(p, targetDepth);

    // 7. Update Map Pins
    updateRightMapPins();

    // 8. Update Chart.js Series
    updateCharts(p, targetSalinity);

    // 9. Update Leaderboard Bar Fills
    updateLeaderboardBars(p);
  }

  // ==========================================================================
  // 6. LIVE UNDERGROUND AQUIFER X-RAY CUTAWAY (0m to 35m DEPTH)
  // ==========================================================================
  function updateXray(p, depth) {
    if (!DOM.xrayWaterFill || !DOM.xrayWaterLine || !DOM.xrayWaterLabel) return;

    // ViewBox: 0 0 340 380
    // Ground level at Y=45 (0m). 35m at Y=315. Scale: ~7.71 px per meter.
    // 19.2m -> Y = 45 + (19.2 * 7.71) = 193
    // 28.6m -> Y = 45 + (28.6 * 7.71) = 265
    const targetY = Math.round(193 + (265 - 193) * p);
    const targetHeight = Math.max(380 - targetY, 20);

    DOM.xrayWaterFill.setAttribute('y', targetY);
    DOM.xrayWaterFill.setAttribute('height', targetHeight);

    DOM.xrayWaterLine.setAttribute('y1', targetY);
    DOM.xrayWaterLine.setAttribute('y2', targetY);

    DOM.xrayWaterLabel.setAttribute('y', targetY - 6);
    DOM.xrayWaterLabel.textContent = `Water Table: ${depth.toFixed(1)}m bgl ${p > 0.5 ? '▼ CRITICAL DROP' : '• Normal'}`;

    if (p > 0.5) {
      DOM.xrayWaterFill.setAttribute('fill', 'url(#xrayWaterGradSaline)');
      DOM.xrayWaterLine.setAttribute('stroke', '#f97316');
      DOM.xrayWaterLabel.setAttribute('fill', '#f59e0b');

      if (DOM.xrayBadgeStatus) {
        DOM.xrayBadgeStatus.className = 'bklit-badge badge-shock';
        DOM.xrayBadgeStatus.textContent = 'SEWAGE PLUME DOMINATES INTAKE';
      }
      if (DOM.xrayRiverBedWater) DOM.xrayRiverBedWater.setAttribute('fill', '#f59e0b');
      if (DOM.xraySewagePlume) DOM.xraySewagePlume.style.opacity = Math.min(p * 1.15, 1);
      if (DOM.xrayDilutionArrows) DOM.xrayDilutionArrows.style.opacity = Math.max(1 - p * 1.8, 0);
    } else {
      DOM.xrayWaterFill.setAttribute('fill', 'url(#xrayWaterGradGlacier)');
      DOM.xrayWaterLine.setAttribute('stroke', '#38bdf8');
      DOM.xrayWaterLabel.setAttribute('fill', '#38bdf8');

      if (DOM.xrayBadgeStatus) {
        DOM.xrayBadgeStatus.className = 'bklit-badge badge-baseline';
        DOM.xrayBadgeStatus.textContent = 'NORMAL MONSOON RECHARGE';
      }
      if (DOM.xrayRiverBedWater) DOM.xrayRiverBedWater.setAttribute('fill', '#0284c7');
      if (DOM.xraySewagePlume) DOM.xraySewagePlume.style.opacity = 0;
      if (DOM.xrayDilutionArrows) DOM.xrayDilutionArrows.style.opacity = 1;
    }
  }

  // ==========================================================================
  // 7. BKLIT SPLINE & PILL-BAR CHARTS INITIALIZATION
  // ==========================================================================
  function initCharts() {
    // 1. Chart 1: Bklit Dual-Gradient Spline Area Chart
    const ctxDiv = document.getElementById('chartDivergence');
    if (ctxDiv) {
      const ctx = ctxDiv.getContext('2d');

      // Create Solar-Amber vertical gradient
      const amberGrad = ctx.createLinearGradient(0, 0, 0, 220);
      amberGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      amberGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

      state.charts.divergence = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Summer 2023', 'Summer 2024', 'Summer 2025', 'Summer 2026'],
          datasets: [
            {
              label: "Expected Trend ('26)",
              data: [1320, 1380, 1420, 1550],
              borderColor: '#38bdf8',
              borderWidth: 2,
              borderDash: [5, 5],
              pointBackgroundColor: '#38bdf8',
              pointRadius: 3,
              tension: 0.35,
              fill: false
            },
            {
              label: "El Niño Reality ('26)",
              data: [1320, 1380, 1420, 2940],
              borderColor: '#f59e0b',
              borderWidth: 2.5,
              pointBackgroundColor: '#f97316',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 1.5,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.4,
              backgroundColor: amberGrad,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                color: '#94a3b8',
                font: { family: "'JetBrains Mono', monospace", size: 10 }
              }
            },
            tooltip: {
              backgroundColor: '#11192b',
              borderColor: 'rgba(148, 163, 184, 0.25)',
              borderWidth: 1,
              titleFont: { family: "'Inter', sans-serif", size: 12 },
              bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
              padding: 10,
              callbacks: {
                label: function (context) {
                  return ` ${context.dataset.label}: ${context.parsed.y} mg/L TDS`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(148, 163, 184, 0.06)' },
              ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 10 } }
            },
            y: {
              min: 1000,
              max: 3300,
              grid: { color: 'rgba(148, 163, 184, 0.08)' },
              ticks: {
                color: '#64748b',
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: v => `${v} mg/L`
              }
            }
          }
        }
      });
    }

    // 2. Chart 2: Bklit Grouped Pill-Bar Chart
    const ctxProx = document.getElementById('chartProximity');
    if (ctxProx) {
      const ctx = ctxProx.getContext('2d');

      state.charts.proximity = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['<0.5 km', '0.5–1.5 km', '1.5–3.0 km', '>3.0 km'],
          datasets: [
            {
              label: 'Expected Trend',
              data: [9.2, 8.5, 5.4, 3.1],
              backgroundColor: 'rgba(56, 189, 248, 0.45)',
              borderColor: '#38bdf8',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'El Niño Reality',
              data: [97.4, 90.6, 28.4, 8.0],
              backgroundColor: 'rgba(245, 158, 11, 0.85)',
              borderColor: '#f97316',
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                color: '#94a3b8',
                font: { family: "'JetBrains Mono', monospace", size: 10 }
              }
            },
            tooltip: {
              backgroundColor: '#11192b',
              borderColor: 'rgba(148, 163, 184, 0.25)',
              borderWidth: 1,
              titleFont: { family: "'Inter', sans-serif", size: 12 },
              bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
              padding: 10,
              callbacks: {
                label: function (context) {
                  return ` ${context.dataset.label}: +${context.parsed.y}% TDS Increase`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#64748b', font: { family: "'JetBrains Mono', monospace", size: 10 } }
            },
            y: {
              min: 0,
              max: 110,
              grid: { color: 'rgba(148, 163, 184, 0.08)' },
              ticks: {
                color: '#64748b',
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: v => `+${v}%`
              }
            }
          }
        }
      });
    }
  }

  function updateCharts(p, targetSalinity) {
    if (state.charts.divergence) {
      state.charts.divergence.data.datasets[1].data[3] = targetSalinity;
      state.charts.divergence.update('none');
    }

    if (state.charts.proximity) {
      // Dynamic scaling of shock bars
      state.charts.proximity.data.datasets[1].data = [
        +(9.2 + (97.4 - 9.2) * p).toFixed(1),
        +(8.5 + (90.6 - 8.5) * p).toFixed(1),
        +(5.4 + (28.4 - 5.4) * p).toFixed(1),
        +(3.1 + (8.0 - 3.1) * p).toFixed(1)
      ];
      state.charts.proximity.update('none');
    }
  }

  // ==========================================================================
  // 8. BKLIT HORIZONTAL PROGRESS LEADERBOARD
  // ==========================================================================
  function renderLeaderboard() {
    if (!DOM.leaderboardList) return;

    DOM.leaderboardList.innerHTML = WARDS_DATA.slice(0, 5).map(w => `
      <div class="leaderboard-item" data-id="${w.id}">
        <div class="lb-left">
          <span class="lb-rank-badge">#${w.rank}</span>
          <div class="lb-name-group">
            <span class="lb-name">${w.name}</span>
            <span class="lb-dist">${w.distNoyyalKm} km to Noyyal</span>
          </div>
        </div>

        <div class="lb-bar-track">
          <div class="lb-bar-fill" id="bar-${w.id}" style="width: ${w.barPct}%;"></div>
        </div>

        <div class="lb-right">
          <span class="lb-tds-num" id="tds-${w.id}">${w.shockTds.toLocaleString()} mg/L</span>
          <span class="lb-action-tag ${w.actionClass}">[${w.action}]</span>
        </div>
      </div>
    `).join('');

    DOM.leaderboardList.querySelectorAll('.leaderboard-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        highlightWard(id);
      });
    });
  }

  function updateLeaderboardBars(p) {
    WARDS_DATA.slice(0, 5).forEach(w => {
      const bar = document.getElementById(`bar-${w.id}`);
      const tds = document.getElementById(`tds-${w.id}`);
      if (bar) {
        const currentBar = Math.round(15 + (w.barPct - 15) * p);
        bar.style.width = `${currentBar}%`;
      }
      if (tds) {
        const currentVal = Math.round(w.baseTds + (w.shockTds - w.baseTds) * p);
        tds.textContent = `${currentVal.toLocaleString()} mg/L`;
      }
    });
  }

  function highlightWard(id) {
    state.activeWardId = id;

    // Highlight row in leaderboard
    document.querySelectorAll('.leaderboard-item').forEach(item => {
      if (item.getAttribute('data-id') === id) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // Pulse corresponding pin on Center Map
    document.querySelectorAll('.borewell-node').forEach(node => {
      if (node.getAttribute('data-id') === id) {
        node.style.transform = 'scale(1.85)';
        setTimeout(() => { node.style.transform = ''; }, 1200);
      }
    });
  }

  // ==========================================================================
  // 9. QR PITCH MODAL HANDLERS
  // ==========================================================================
  function initQrModal() {
    if (!DOM.qrModal) return;

    if (DOM.btnOpenQr) {
      DOM.btnOpenQr.addEventListener('click', () => {
        DOM.qrModal.classList.add('active');
      });
    }

    if (DOM.btnCloseQr) {
      DOM.btnCloseQr.addEventListener('click', () => {
        DOM.qrModal.classList.remove('active');
      });
    }

    DOM.qrModal.addEventListener('click', (e) => {
      if (e.target === DOM.qrModal) {
        DOM.qrModal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.qrModal.classList.contains('active')) {
        DOM.qrModal.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 10. EVENT LISTENERS & BOOTSTRAP
  // ==========================================================================
  function attachControls() {
    // ENSO continuous slider scrub
    if (DOM.ensoSlider) {
      DOM.ensoSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        applySimulation(val, 'slider');
      });
    }

    // El Niño toggle button (toggles between 0.0 and 2.4)
    if (DOM.btnElNinoToggle) {
      DOM.btnElNinoToggle.addEventListener('click', () => {
        if (state.ensoValue > 0.4) {
          applySimulation(0.0, 'button');
        } else {
          applySimulation(2.4, 'button');
        }
      });
    }
  }

  // DOMContentLoaded initialization
  document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    initMapShaders();
    renderMapPins();
    renderLeaderboard();
    initCharts();
    initQrModal();
    attachControls();

    // Trigger default state: Severe El Niño (+2.4°C)
    applySimulation(2.4, 'init');
  });

})();
