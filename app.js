/**
 * CATASTROPHE BEHIND THE COLOURS
 * Bklit UI + Oceanic Hydro-Thermal Telemetry Dashboard Engine
 * Implements View Switcher (Pitch Deck vs Detailed Takedown),
 * Rock-solid SVG Map Points with Live Data Pills, Top-Left HUD Docking on Double-Click,
 * Continuous ENSO Simulation, and Interactive Provenance Dossier.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. TELEMETRY REGISTRY & INITIAL STATE
  // ==========================================================================
  const state = {
    currentView: 'pitch', // 'pitch' | 'detailed'
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
      shortName: "Nallur",
      taluk: "Tirupur Taluk",
      distNoyyalKm: 0.4,
      baseTds: 1580,
      shockTds: 3120,
      surgePct: "+97.4%",
      depth: 28.8,
      action: "CAP & TEST FIRST",
      actionClass: "tag-cap",
      x: 345,
      y: 375,
      barPct: 98
    },
    {
      id: "w-02",
      rank: "02",
      name: "Tiruppur North (Kasipalayam)",
      shortName: "Kasipalayam",
      taluk: "Tirupur Taluk",
      distNoyyalKm: 0.6,
      baseTds: 1510,
      shockTds: 2940,
      surgePct: "+94.7%",
      depth: 27.4,
      action: "CAP & TEST FIRST",
      actionClass: "tag-cap",
      x: 310,
      y: 340,
      barPct: 94
    },
    {
      id: "w-03",
      rank: "03",
      name: "Veerapandi Corridor",
      shortName: "Veerapandi",
      taluk: "Tirupur Taluk",
      distNoyyalKm: 0.8,
      baseTds: 1490,
      shockTds: 2840,
      surgePct: "+90.6%",
      depth: 26.5,
      action: "CAP & TEST FIRST",
      actionClass: "tag-cap",
      x: 380,
      y: 390,
      barPct: 91
    },
    {
      id: "w-04",
      rank: "04",
      name: "Kangayam (Orathupalayam)",
      shortName: "Orathupalayam",
      taluk: "Kangayam Taluk",
      distNoyyalKm: 1.1,
      baseTds: 1610,
      shockTds: 2980,
      surgePct: "+85.1%",
      depth: 29.2,
      action: "CAP & TEST FIRST",
      actionClass: "tag-cap",
      x: 530,
      y: 410,
      barPct: 85
    },
    {
      id: "w-05",
      rank: "05",
      name: "Avinashi East Buffer",
      shortName: "Avinashi",
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
      shortName: "Palladam",
      taluk: "Palladam Taluk",
      distNoyyalKm: 2.4,
      baseTds: 1470,
      shockTds: 1890,
      surgePct: "+28.4%",
      depth: 20.4,
      action: "MONITOR",
      actionClass: "tag-log",
      x: 230,
      y: 420,
      barPct: 28
    },
    {
      id: "w-07",
      rank: "07",
      name: "Dharapuram Central",
      shortName: "Dharapuram",
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
      name: "Udumalpet Foothills",
      shortName: "Udumalpet",
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
    // View Switcher Elements
    DOM.tabPitchDeck = document.getElementById('tabPitchDeck');
    DOM.tabDetailedTakedown = document.getElementById('tabDetailedTakedown');
    DOM.viewPitchDeck = document.getElementById('viewPitchDeck');
    DOM.viewDetailedTakedown = document.getElementById('viewDetailedTakedown');

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

    // Top-Left HUD Modes
    DOM.hudSummaryMode = document.getElementById('hudSummaryMode');
    DOM.hudStationDossier = document.getElementById('hudStationDossier');
    DOM.hudExpectedVal = document.getElementById('hudExpectedVal');
    DOM.hudRealityVal = document.getElementById('hudRealityVal');
    DOM.hudDropAnomaly = document.getElementById('hudDropAnomaly');
    DOM.hudSalinityAnomaly = document.getElementById('hudSalinityAnomaly');
    DOM.hudDossierName = document.getElementById('hudDossierName');
    DOM.hudDossierSub = document.getElementById('hudDossierSub');
    DOM.hudDossierTds = document.getElementById('hudDossierTds');
    DOM.hudDossierDepth = document.getElementById('hudDossierDepth');
    DOM.hudDossierAction = document.getElementById('hudDossierAction');
    DOM.btnResetHud = document.getElementById('btnResetHud');

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
  // 2. VIEW SWITCHER ENGINE (PITCH DECK vs DETAILED TAKEDOWN)
  // ==========================================================================
  function switchView(viewName) {
    state.currentView = viewName;

    if (viewName === 'pitch') {
      if (DOM.tabPitchDeck) DOM.tabPitchDeck.classList.add('active');
      if (DOM.tabDetailedTakedown) DOM.tabDetailedTakedown.classList.remove('active');
      if (DOM.viewPitchDeck) DOM.viewPitchDeck.style.display = 'block';
      if (DOM.viewDetailedTakedown) DOM.viewDetailedTakedown.classList.remove('active');
    } else {
      if (DOM.tabDetailedTakedown) DOM.tabDetailedTakedown.classList.add('active');
      if (DOM.tabPitchDeck) DOM.tabPitchDeck.classList.remove('active');
      if (DOM.viewPitchDeck) DOM.viewPitchDeck.style.display = 'none';
      if (DOM.viewDetailedTakedown) DOM.viewDetailedTakedown.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ==========================================================================
  // 3. 60FPS CUBIC ODOMETER COUNT-UP ANIMATION
  // ==========================================================================
  function animateOdometer(el, start, end, duration = 380, decimals = 0, suffix = "") {
    if (!el) return;
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
  // 4. HTML5 CANVAS MAP SHADER ENGINE (HIGH-CONTRAST TALUK BOUNDARIES)
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

    // Load pre-processed high-contrast dark map with 2px bright boundary lines
    img.src = "assets/tiruppur-dark-processed.png";
  }

  function processCanvasShader(canvasId, img) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    canvas.width = img.naturalWidth || 748;
    canvas.height = img.naturalHeight || 1024;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Canvas rendered successfully, hide fallback img
    const viewport = canvas.closest('.map-viewport');
    if (viewport) {
      const fallback = viewport.querySelector('.tiruppur-map-img');
      if (fallback) fallback.style.display = 'none';
    }
  }

  // ==========================================================================
  // 5. ROCK-SOLID MAP POINTS WITH DATA PILLS & TOP-LEFT CORNER HUD DOCKING
  // ==========================================================================
  function renderMapPins() {
    // Left Map Baseline Pins (Rendered ONCE with stable positioning & visible data badges)
    if (DOM.leftPinsGroup) {
      DOM.leftPinsGroup.innerHTML = WARDS_DATA.map(w => `
        <g class="borewell-node" id="left-pin-${w.id}" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
          <circle class="node-ring" cx="0" cy="0" r="8" />
          <circle class="node-core" cx="0" cy="0" r="4" />
          <g class="node-pill-tag" transform="translate(10, -9)">
            <rect class="pill-bg" rx="3" width="76" height="18" />
            <text class="pill-name" x="5" y="12">${w.shortName}</text>
            <text class="pill-val" x="48" y="12">${(w.baseTds / 1000).toFixed(1)}k</text>
          </g>
          <title>${w.name} (${w.taluk})&#10;2025 Baseline TDS: ${w.baseTds} mg/L&#10;Depth: ${(w.depth - 9.4).toFixed(1)}m bgl</title>
        </g>
      `).join('');
    }

    // Right Map Reality Pins (Rendered ONCE with permanent data pills & sonar waves)
    if (DOM.rightPinsGroup) {
      DOM.rightPinsGroup.innerHTML = WARDS_DATA.map(w => `
        <g class="borewell-node" id="right-pin-${w.id}" data-id="${w.id}" transform="translate(${w.x}, ${w.y})">
          <circle class="sonar-wave sonar-wave-1" cx="0" cy="0" r="6" />
          <circle class="sonar-wave sonar-wave-2" cx="0" cy="0" r="6" />
          <circle class="node-ring" cx="0" cy="0" r="8" />
          <circle class="node-core" cx="0" cy="0" r="4" />
          <g class="node-pill-tag" transform="translate(10, -9)">
            <rect class="pill-bg" rx="3" width="76" height="18" />
            <text class="pill-name" x="5" y="12">${w.shortName}</text>
            <text class="pill-val" id="pill-val-${w.id}" x="48" y="12">${(w.shockTds / 1000).toFixed(1)}k</text>
          </g>
          <title>${w.name} (${w.taluk})&#10;Distance to Noyyal: ${w.distNoyyalKm} km&#10;TDS: ${w.shockTds} mg/L&#10;Depth: ${w.depth}m bgl</title>
        </g>
      `).join('');
    }

    attachPinEvents();
  }

  // Updates existing nodes WITHOUT recreation to ensure zero jitter or instability
  function updateRightMapPins() {
    const isShock = state.ensoValue >= 0.8;
    const isSevere = state.ensoValue >= 1.8;

    WARDS_DATA.forEach(w => {
      const node = document.getElementById(`right-pin-${w.id}`);
      const pillVal = document.getElementById(`pill-val-${w.id}`);
      if (!node) return;

      const isCorridor = w.distNoyyalKm <= 1.5;
      const isShockNode = isShock && isCorridor;

      if (isShockNode) {
        node.classList.add('node-shock');
      } else {
        node.classList.remove('node-shock');
      }

      const currentTds = isShock ? (isSevere ? w.shockTds : Math.round(w.baseTds * 1.45)) : w.baseTds;
      if (pillVal) {
        pillVal.textContent = currentTds >= 1000 ? `${(currentTds / 1000).toFixed(1)}k` : currentTds;
      }
    });

    // If a station is currently docked in top-left HUD, update its live values
    if (state.activeWardId) {
      dockStationToTopLeft(state.activeWardId, false);
    }
  }

  // Docks station details to top-left corner HUD on double-click or click
  function dockStationToTopLeft(wardId, triggerPulse = true) {
    state.activeWardId = wardId;
    const ward = WARDS_DATA.find(w => w.id === wardId);
    if (!ward) return;

    if (DOM.hudSummaryMode) DOM.hudSummaryMode.style.display = 'none';
    if (DOM.hudStationDossier) DOM.hudStationDossier.classList.add('active');

    const isShock = state.ensoValue >= 0.8;
    const isSevere = state.ensoValue >= 1.8;
    const currentTds = isShock ? (isSevere ? ward.shockTds : Math.round(ward.baseTds * 1.45)) : ward.baseTds;
    const currentDepth = isShock ? (isSevere ? ward.depth : (ward.depth - 4.5).toFixed(1)) : (ward.depth - 9.4).toFixed(1);

    if (DOM.hudDossierName) DOM.hudDossierName.textContent = ward.name;
    if (DOM.hudDossierSub) DOM.hudDossierSub.textContent = `${ward.taluk} • ${ward.distNoyyalKm} km to Noyyal Channel`;
    if (DOM.hudDossierTds) {
      DOM.hudDossierTds.textContent = `${currentTds.toLocaleString()} mg/L (${isShock ? ward.surgePct : 'Baseline'})`;
      DOM.hudDossierTds.style.color = currentTds >= 2000 ? 'var(--accent-coral)' : 'var(--accent-amber)';
    }
    if (DOM.hudDossierDepth) {
      DOM.hudDossierDepth.textContent = `${currentDepth}m bgl (${isShock ? '-9.4m extra' : 'Normal'})`;
    }
    if (DOM.hudDossierAction) {
      DOM.hudDossierAction.textContent = `[${ward.action}]`;
      DOM.hudDossierAction.className = `lb-action-tag ${ward.actionClass}`;
    }

    // Highlight row in leaderboard
    document.querySelectorAll('.leaderboard-item').forEach(item => {
      if (item.getAttribute('data-id') === wardId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // Trigger visual pulse on node
    if (triggerPulse) {
      const pinNode = document.getElementById(`right-pin-${wardId}`);
      if (pinNode) {
        pinNode.style.transform = `translate(${ward.x}px, ${ward.y}px) scale(1.75)`;
        setTimeout(() => {
          pinNode.style.transform = `translate(${ward.x}px, ${ward.y}px)`;
        }, 900);
      }
    }
  }

  function resetTopLeftHudToSummary() {
    state.activeWardId = null;
    if (DOM.hudStationDossier) DOM.hudStationDossier.classList.remove('active');
    if (DOM.hudSummaryMode) DOM.hudSummaryMode.style.display = 'flex';

    document.querySelectorAll('.leaderboard-item').forEach(item => {
      item.classList.remove('selected');
    });
  }

  function attachPinEvents() {
    // Single click & double click both cleanly dock station to top-left corner HUD
    document.querySelectorAll('.borewell-node').forEach(node => {
      node.addEventListener('click', () => {
        const id = node.getAttribute('data-id');
        dockStationToTopLeft(id, true);
      });
      node.addEventListener('dblclick', () => {
        const id = node.getAttribute('data-id');
        dockStationToTopLeft(id, true);
      });
    });

    if (DOM.btnResetHud) {
      DOM.btnResetHud.addEventListener('click', (e) => {
        e.stopPropagation();
        resetTopLeftHudToSummary();
      });
    }
  }

  // ==========================================================================
  // 6. CONTINUOUS SIMULATION ENGINE (DRIVEN BY ENSO ANOMALY)
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

    // 1. Top Nav Status Orb
    if (DOM.statusOrb) {
      if (state.elNinoActive) {
        DOM.statusOrb.classList.add('shock');
      } else {
        DOM.statusOrb.classList.remove('shock');
      }
    }

    // 2. Floating Dock Controls
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

    // 3. Center Map Header & HUD Chips
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

    // 4. Center Map Ambient Heat Aura & River Flow
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

    if (DOM.sparklineDot && DOM.sparklineLine && DOM.sparklineArea) {
      const sparkY = Math.round(28 - 24 * p);
      DOM.sparklineDot.setAttribute('cy', sparkY);
      DOM.sparklineLine.setAttribute('d', `M 0 28 L 18 25 L 36 21 L 54 16 L 64 ${sparkY}`);
      DOM.sparklineArea.setAttribute('d', `M 0 28 L 18 25 L 36 21 L 54 16 L 64 ${sparkY} L 64 32 L 0 32 Z`);
      DOM.sparklineDot.setAttribute('fill', p > 0.5 ? '#f97316' : '#f59e0b');
      DOM.sparklineLine.setAttribute('stroke', p > 0.5 ? '#f97316' : '#f59e0b');
    }

    if (DOM.ringDepletion) {
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

    // 7. Update Map Pins with rock-solid stability
    updateRightMapPins();

    // 8. Update Chart.js Series
    updateCharts(p, targetSalinity);

    // 9. Update Leaderboard Bar Fills
    updateLeaderboardBars(p);
  }

  // ==========================================================================
  // 7. LIVE UNDERGROUND AQUIFER X-RAY CUTAWAY (0m to 35m DEPTH)
  // ==========================================================================
  function updateXray(p, depth) {
    if (!DOM.xrayWaterFill || !DOM.xrayWaterLine || !DOM.xrayWaterLabel) return;

    // ViewBox: 0 0 340 380
    // Ground level at Y=45 (0m). 35m at Y=315.
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
  // 8. BKLIT SPLINE & PILL-BAR CHARTS INITIALIZATION
  // ==========================================================================
  function initCharts() {
    // Chart 1: Dual-Gradient Spline Area Chart
    const ctxDiv = document.getElementById('chartDivergence');
    if (ctxDiv) {
      const ctx = ctxDiv.getContext('2d');
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

    // Chart 2: Grouped Pill-Bar Chart
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
  // 9. BKLIT HORIZONTAL PROGRESS LEADERBOARD
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
        dockStationToTopLeft(id, true);
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

  // ==========================================================================
  // 10. QR PITCH MODAL HANDLERS
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
  // 11. EVENT LISTENERS & BOOTSTRAP
  // ==========================================================================
  function attachControls() {
    // View Switcher Tabs
    if (DOM.tabPitchDeck) {
      DOM.tabPitchDeck.addEventListener('click', () => switchView('pitch'));
    }
    if (DOM.tabDetailedTakedown) {
      DOM.tabDetailedTakedown.addEventListener('click', () => switchView('detailed'));
    }

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

  // Global window hook for tab switching if needed
  window.switchDashboardView = switchView;

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
