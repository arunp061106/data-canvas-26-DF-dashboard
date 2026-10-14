/**
 * WHERE TIRUPPUR'S WATER BREAKS FIRST
 * Linear / Vercel / Palantir Foundry Matte-Dark Telemetry Controller
 * Designed for High-Impact Executive Pitch & Geospatial Analytics
 */

(function () {
  'use strict';

  // Master State
  let isElNinoActive = true; // Default Shock ON for live pitch demonstration
  let currentViewMode = 'pitch'; // 'pitch' | 'dossier'
  let sortColumn = 'rank';
  let sortAsc = true;

  // Chart Objects
  let divergenceChartInstance = null;
  let proximityChartInstance = null;
  let technicalDossierInitialized = false;

  // 10 Priority Telemetry Wards (calibrated to the 748x1024 Tiruppur Taluk Map)
  const PRIORITY_WARDS = [
    {
      rank: 1,
      id: "W-41",
      ward: "Ward 41 (Nallur)",
      taluk: "Tirupur Taluk",
      locality: "Nallur Corridor",
      x: 345,
      y: 355,
      distNoyyalKm: 0.95,
      baseDepth: 10.4,
      baseTds: 1260,
      expDepth: 18.2,
      expTds: 1540,
      shockDepth: 25.5,
      shockTds: 2510,
      drop: "-7.3m",
      tdsSurgePct: "+63.0%",
      status: "CAP & TEST",
      actionClass: "status-cap"
    },
    {
      rank: 2,
      id: "W-08",
      ward: "Ward 8 (Vellampalayam)",
      taluk: "Avinashi / Tirupur Border",
      locality: "15 Velampalayam",
      x: 290,
      y: 260,
      distNoyyalKm: 1.15,
      baseDepth: 12.3,
      baseTds: 1180,
      expDepth: 17.8,
      expTds: 1480,
      shockDepth: 25.7,
      shockTds: 2420,
      drop: "-7.9m",
      tdsSurgePct: "+63.5%",
      status: "CAP & TEST",
      actionClass: "status-cap"
    },
    {
      rank: 3,
      id: "W-34",
      ward: "Ward 34 (Tiruppur South)",
      taluk: "Tirupur Taluk",
      locality: "Weekly Market / South Bank",
      x: 310,
      y: 335,
      distNoyyalKm: 0.42,
      baseDepth: 5.8,
      baseTds: 1380,
      expDepth: 18.8,
      expTds: 1580,
      shockDepth: 27.5,
      shockTds: 2750,
      drop: "-8.7m",
      tdsSurgePct: "+74.1%",
      status: "CAP & TEST",
      actionClass: "status-cap"
    },
    {
      rank: 4,
      id: "W-22",
      ward: "Ward 22 (Kasipalayam)",
      taluk: "Tirupur Taluk",
      locality: "Kasipalayam East",
      x: 375,
      y: 325,
      distNoyyalKm: 0.70,
      baseDepth: 8.7,
      baseTds: 1290,
      expDepth: 18.5,
      expTds: 1560,
      shockDepth: 26.9,
      shockTds: 2690,
      drop: "-8.4m",
      tdsSurgePct: "+72.4%",
      status: "CAP & TEST",
      actionClass: "status-cap"
    },
    {
      rank: 5,
      id: "W-52",
      ward: "Ward 52 (Veerapandi)",
      taluk: "Tirupur Taluk",
      locality: "Veerapandi West",
      x: 295,
      y: 360,
      distNoyyalKm: 0.85,
      baseDepth: 9.2,
      baseTds: 1340,
      expDepth: 18.4,
      expTds: 1550,
      shockDepth: 26.8,
      shockTds: 2680,
      drop: "-8.4m",
      tdsSurgePct: "+72.9%",
      status: "CAP & TEST",
      actionClass: "status-cap"
    },
    {
      rank: 6,
      id: "W-15",
      ward: "Ward 15 (Agraharam)",
      taluk: "Tirupur Taluk",
      locality: "Agraharam Riverbank",
      x: 330,
      y: 320,
      distNoyyalKm: 0.35,
      baseDepth: 11.1,
      baseTds: 1410,
      expDepth: 19.0,
      expTds: 1600,
      shockDepth: 28.4,
      shockTds: 2840,
      drop: "-9.4m",
      tdsSurgePct: "+77.5%",
      status: "CAP & TEST",
      actionClass: "status-cap"
    },
    {
      rank: 7,
      id: "W-27",
      ward: "Ward 27 (Rayapuram)",
      taluk: "Tirupur Taluk",
      locality: "Rayapuram Central",
      x: 340,
      y: 310,
      distNoyyalKm: 0.60,
      baseDepth: 11.9,
      baseTds: 1390,
      expDepth: 18.7,
      expTds: 1570,
      shockDepth: 27.6,
      shockTds: 2710,
      drop: "-8.9m",
      tdsSurgePct: "+72.6%",
      status: "MONITOR",
      actionClass: "status-monitor"
    },
    {
      rank: 8,
      id: "W-48",
      ward: "Ward 48 (Kovilvazhi)",
      taluk: "Kangayam / Tirupur Border",
      locality: "Kovilvazhi Bypass",
      x: 410,
      y: 340,
      distNoyyalKm: 1.45,
      baseDepth: 14.5,
      baseTds: 1040,
      expDepth: 17.5,
      expTds: 1390,
      shockDepth: 24.2,
      shockTds: 2190,
      drop: "-6.7m",
      tdsSurgePct: "+57.6%",
      status: "MONITOR",
      actionClass: "status-monitor"
    },
    {
      rank: 9,
      id: "W-19",
      ward: "Ward 19 (Mannarai)",
      taluk: "Tirupur Taluk",
      locality: "Mannarai North",
      x: 370,
      y: 285,
      distNoyyalKm: 1.30,
      baseDepth: 13.8,
      baseTds: 1120,
      expDepth: 17.9,
      expTds: 1440,
      shockDepth: 24.8,
      shockTds: 2360,
      drop: "-6.9m",
      tdsSurgePct: "+63.9%",
      status: "MONITOR",
      actionClass: "status-monitor"
    },
    {
      rank: 10,
      id: "W-58",
      ward: "Ward 58 (Andipalayam)",
      taluk: "Palladam / Tirupur Border",
      locality: "Andipalayam Lake Belt",
      x: 275,
      y: 385,
      distNoyyalKm: 1.80,
      baseDepth: 16.9,
      baseTds: 1010,
      expDepth: 18.1,
      expTds: 1380,
      shockDepth: 25.1,
      shockTds: 2120,
      drop: "-7.0m",
      tdsSurgePct: "+53.6%",
      status: "MONITOR",
      actionClass: "status-monitor"
    }
  ];

  // =========================================================================
  // STEP 1: CUT OUT WHITE BACKGROUND & APPLY MATTE-DARK CANVAS SHADER
  // =========================================================================
  function renderDarkIsolatedMap(canvasId, imageSrc, onComplete) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Flood-Fill BFS from exterior borders to cut out white background
      const visited = new Uint8Array(w * h);
      const queueX = [];
      const queueY = [];

      function isWhite(idx) {
        return data[idx] > 230 && data[idx + 1] > 230 && data[idx + 2] > 230;
      }

      // Seed outer boundary pixels
      for (let x = 0; x < w; x++) {
        let topIdx = x * 4;
        if (isWhite(topIdx)) { visited[x] = 1; queueX.push(x); queueY.push(0); }
        let botIdx = ((h - 1) * w + x) * 4;
        if (isWhite(botIdx)) { visited[(h - 1) * w + x] = 1; queueX.push(x); queueY.push(h - 1); }
      }
      for (let y = 0; y < h; y++) {
        let leftIdx = (y * w + 0) * 4;
        if (isWhite(leftIdx) && !visited[y * w + 0]) { visited[y * w + 0] = 1; queueX.push(0); queueY.push(y); }
        let rightIdx = (y * w + (w - 1)) * 4;
        if (isWhite(rightIdx) && !visited[y * w + (w - 1)]) { visited[y * w + (w - 1)] = 1; queueX.push(w - 1); queueY.push(y); }
      }

      let head = 0;
      while (head < queueX.length) {
        const cx = queueX[head];
        const cy = queueY[head];
        head++;

        const neighbors = [
          [cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]
        ];
        for (let n = 0; n < 4; n++) {
          const nx = neighbors[n][0];
          const ny = neighbors[n][1];
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const npos = ny * w + nx;
            if (!visited[npos]) {
              const nidx = npos * 4;
              if (isWhite(nidx)) {
                visited[npos] = 1;
                queueX.push(nx);
                queueY.push(ny);
              }
            }
          }
        }
      }

      for (let i = 0; i < data.length; i += 4) {
        const pixelPos = i / 4;

        // 1. Cut out exterior white background pixels -> 100% Transparent
        if (visited[pixelPos]) {
          data[i + 3] = 0;
          continue;
        }

        const r = data[i], g = data[i + 1], b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        // 2. Keep black Taluk labels & dotted boundaries crisp -> Invert to crisp #E4E4E7
        if (luminance < 75) {
          data[i] = 228;
          data[i + 1] = 228;
          data[i + 2] = 231;
          data[i + 3] = 255;
          continue;
        }

        // 3. Keep outer district boundary subtle slate accent
        if (r > 85 && b > 75 && g < 70) {
          data[i] = 56;
          data[i + 1] = 189;
          data[i + 2] = 248;
          data[i + 3] = 240;
          continue;
        }

        // 4. Dim bright pastel Taluk fills into matte dark-slate tones (blended with #111114)
        data[i] = Math.round(r * 0.18 + 17 * 0.82);
        data[i + 1] = Math.round(g * 0.20 + 17 * 0.80);
        data[i + 2] = Math.round(b * 0.24 + 20 * 0.76);
        data[i + 3] = 255;
      }

      ctx.putImageData(imgData, 0, 0);
      if (onComplete) onComplete();
    };

    img.onerror = () => {
      // Fallback to pre-processed png
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        canvas.width = fallbackImg.width;
        canvas.height = fallbackImg.height;
        ctx.drawImage(fallbackImg, 0, 0);
        if (onComplete) onComplete();
      };
      fallbackImg.src = 'assets/tiruppur-dark-processed.png';
    };

    img.src = imageSrc;
  }

  // =========================================================================
  // STEP 2: AMBIENT, NON-DESTRUCTIVE INTERACTIVE SVG LAYER
  // =========================================================================
  function renderBorewellPins(svgContainerId, isRightMap) {
    const group = document.getElementById(svgContainerId);
    if (!group) return;
    group.innerHTML = '';

    PRIORITY_WARDS.forEach(w => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'map-borewell-node');
      g.setAttribute('data-ward-id', w.id);

      const color = (!isRightMap) ? '#06B6D4' : (isElNinoActive ? '#F43F5E' : '#F59E0B');
      const radius = 5;

      // Outer Ring
      const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulseRing.setAttribute('cx', w.x);
      pulseRing.setAttribute('cy', w.y);
      pulseRing.setAttribute('r', radius + 3.5);
      pulseRing.setAttribute('fill', 'none');
      pulseRing.setAttribute('stroke', color);
      pulseRing.setAttribute('stroke-width', '1');
      pulseRing.setAttribute('opacity', '0.5');
      pulseRing.setAttribute('class', 'pin-pulse-ring');
      g.appendChild(pulseRing);

      // Core Solid Pin
      const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pin.setAttribute('cx', w.x);
      pin.setAttribute('cy', w.y);
      pin.setAttribute('r', radius);
      pin.setAttribute('fill', color);
      pin.setAttribute('stroke', '#111114');
      pin.setAttribute('stroke-width', '1.2');
      g.appendChild(pin);

      // Mouse Interactions for Matte Tooltip
      g.addEventListener('mouseenter', (e) => showTooltip(e, w, isRightMap));
      g.addEventListener('mousemove', (e) => moveTooltip(e));
      g.addEventListener('mouseleave', hideTooltip);

      group.appendChild(g);
    });
  }

  // Tooltip Controller
  const tooltip = document.getElementById('mapGlassTooltip');

  function showTooltip(e, w, isRightMap) {
    if (!tooltip) return;
    const ttHeader = document.getElementById('ttHeader');
    const ttSub = document.getElementById('ttSub');
    const ttBaseDepth = document.getElementById('ttBaseDepth');
    const ttShockDepth = document.getElementById('ttShockDepth');
    const ttTds = document.getElementById('ttTds');
    const ttSpike = document.getElementById('ttSpike');
    const ttAction = document.getElementById('ttAction');

    if (ttHeader) ttHeader.textContent = w.ward;
    if (ttSub) ttSub.textContent = `${w.taluk} • ${w.distNoyyalKm} km to Noyyal`;
    if (ttBaseDepth) ttBaseDepth.textContent = `${w.baseDepth} m bgl`;

    if (!isRightMap) {
      if (ttShockDepth) ttShockDepth.textContent = `${w.expDepth} m bgl`;
      if (ttTds) ttTds.textContent = `${w.baseTds} mg/L`;
      if (ttSpike) ttSpike.textContent = "0.0%";
      if (ttAction) {
        ttAction.textContent = "BASELINE SAMPLE";
        ttAction.style.background = "var(--color-cyan-dim)";
        ttAction.style.color = "var(--color-cyan)";
        ttAction.style.borderColor = "rgba(6, 182, 212, 0.3)";
      }
    } else if (!isElNinoActive) {
      if (ttShockDepth) ttShockDepth.textContent = `${w.expDepth} m bgl`;
      if (ttTds) ttTds.textContent = `${w.expTds} mg/L`;
      if (ttSpike) ttSpike.textContent = "+4.2%";
      if (ttAction) {
        ttAction.textContent = "EXPECTED DRIFT";
        ttAction.style.background = "var(--color-amber-dim)";
        ttAction.style.color = "var(--color-amber)";
        ttAction.style.borderColor = "rgba(245, 158, 11, 0.3)";
      }
    } else {
      if (ttShockDepth) ttShockDepth.textContent = `${w.shockDepth} m bgl`;
      if (ttTds) ttTds.textContent = `${w.shockTds} mg/L`;
      if (ttSpike) ttSpike.textContent = w.tdsSurgePct;
      if (ttAction) {
        ttAction.textContent = w.rank <= 6 ? "CAP & TEST" : "MONITOR";
        ttAction.style.background = w.rank <= 6 ? "var(--color-rose-dim)" : "var(--color-amber-dim)";
        ttAction.style.color = w.rank <= 6 ? "var(--color-rose)" : "var(--color-amber)";
        ttAction.style.borderColor = w.rank <= 6 ? "rgba(244, 63, 94, 0.35)" : "rgba(245, 158, 11, 0.3)";
      }
    }

    tooltip.style.display = 'block';
    moveTooltip(e);
  }

  function moveTooltip(e) {
    if (!tooltip) return;
    const pad = 12;
    tooltip.style.left = `${e.clientX + pad}px`;
    tooltip.style.top = `${e.clientY}px`;
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = 'none';
  }

  // =========================================================================
  // HARDWARE-STYLE SCENARIO SWITCH CONTROLLER (RIGHT MAP)
  // =========================================================================
  function updateElNinoState() {
    const auraExpected = document.getElementById('auraExpected');
    const auraShock1 = document.getElementById('auraShock1');
    const auraShock2 = document.getElementById('auraShock2');
    const callouts = document.getElementById('rightMapDeltaCallouts');
    const badge = document.getElementById('rightMapStatusBadge');
    const dot = document.getElementById('rightPanelDot');
    const btnExpected = document.getElementById('btnScenarioExpected');
    const btnShock = document.getElementById('btnScenarioShock');
    const riverRight = document.getElementById('noyyalRiverRight');

    if (isElNinoActive) {
      // 1. Ambient Translucent Crimson Heat-Haze Active
      if (auraExpected) auraExpected.style.opacity = '0';
      if (auraShock1) auraShock1.style.opacity = '0.28';
      if (auraShock2) auraShock2.style.opacity = '0.24';

      // 2. Segmented buttons state
      if (btnShock) btnShock.className = 'segment-btn active';
      if (btnExpected) btnExpected.className = 'segment-btn';

      // 3. Status Badge & Dot
      if (badge) {
        badge.textContent = "28.6m bgl • 2,940 mg/L TDS";
        badge.className = "mono-pill pill-rose";
      }
      if (dot) dot.className = "status-dot dot-rose";
      if (riverRight) riverRight.setAttribute('stroke', '#F43F5E');

      // 4. Anomaly Badges visible
      if (callouts) callouts.style.display = 'flex';
    } else {
      // Ambient Expected Amber Glow
      if (auraExpected) auraExpected.style.opacity = '0.22';
      if (auraShock1) auraShock1.style.opacity = '0';
      if (auraShock2) auraShock2.style.opacity = '0';

      // Segmented buttons state
      if (btnShock) btnShock.className = 'segment-btn';
      if (btnExpected) btnExpected.className = 'segment-btn active';

      // Status Badge & Dot
      if (badge) {
        badge.textContent = "19.2m bgl • 1,550 mg/L TDS";
        badge.className = "mono-pill pill-amber";
      }
      if (dot) dot.className = "status-dot dot-amber";
      if (riverRight) riverRight.setAttribute('stroke', '#F59E0B');

      // Anomaly Badges hidden
      if (callouts) callouts.style.display = 'none';
    }

    // Refresh borewell pins on right map with appropriate color
    renderBorewellPins('borewellNodesRight', true);

    // Update Tier 2 KPIs & Tier 3 Charts
    updateKpiRibbon();
    renderActionTable();
  }

  // =========================================================================
  // TIER 2: 4-COLUMN TELEMETRY STRIP (EXPECTED vs. EL NIÑO DELTA)
  // =========================================================================
  function updateKpiRibbon() {
    const elTdsVal = document.getElementById('kpiTdsVal');
    const elTdsDelta = document.getElementById('kpiTdsDelta');
    const elTdsComp = document.getElementById('kpiTdsComp');

    const elDepthVal = document.getElementById('kpiDepthVal');
    const elDepthDelta = document.getElementById('kpiDepthDelta');
    const elDepthComp = document.getElementById('kpiDepthComp');

    const elSewageVal = document.getElementById('kpiSewageVal');
    const elSewageDelta = document.getElementById('kpiSewageDelta');
    const elSewageComp = document.getElementById('kpiSewageComp');

    const elWardsVal = document.getElementById('kpiWardsVal');
    const elWardsDelta = document.getElementById('kpiWardsDelta');
    const elWardsComp = document.getElementById('kpiWardsComp');

    if (isElNinoActive) {
      if (elTdsVal) { elTdsVal.textContent = "2,940"; elTdsVal.className = "telemetry-num num-rose"; }
      if (elTdsDelta) { elTdsDelta.textContent = "+89.6% over Expected"; elTdsDelta.className = "delta-badge badge-rose"; }
      if (elTdsComp) elTdsComp.textContent = "BIS limit 2,000 mg/L breached in 14 wards";

      if (elDepthVal) { elDepthVal.textContent = "28.6"; elDepthVal.className = "telemetry-num num-rose"; }
      if (elDepthDelta) { elDepthDelta.textContent = "-9.4m faster drawdown"; elDepthDelta.className = "delta-badge badge-rose"; }
      if (elDepthComp) elDepthComp.textContent = "Severe structural deficit across Noyyal corridor";

      if (elSewageVal) { elSewageVal.textContent = "78.4%"; elSewageVal.className = "telemetry-num num-amber"; }
      if (elSewageDelta) { elSewageDelta.textContent = "+86% sewage intrusion"; elSewageDelta.className = "delta-badge badge-amber"; }
      if (elSewageComp) elSewageComp.textContent = "Zero river dilution accelerates aquifer contamination";

      if (elWardsVal) { elWardsVal.textContent = "14 / 60"; elWardsVal.className = "telemetry-num num-rose"; }
      if (elWardsDelta) { elWardsDelta.textContent = "9 additional wards at risk"; elWardsDelta.className = "delta-badge badge-rose"; }
      if (elWardsComp) elWardsComp.textContent = "Tiruppur North and South wards deplete first";
    } else {
      if (elTdsVal) { elTdsVal.textContent = "1,550"; elTdsVal.className = "telemetry-num num-amber"; }
      if (elTdsDelta) { elTdsDelta.textContent = "+9.2% normal annual drift"; elTdsDelta.className = "delta-badge badge-amber"; }
      if (elTdsComp) elTdsComp.textContent = "Approaching permissible BIS threshold 2,000 mg/L";

      if (elDepthVal) { elDepthVal.textContent = "19.2"; elDepthVal.className = "telemetry-num num-cyan"; }
      if (elDepthDelta) { elDepthDelta.textContent = "+0.8m normal annual drift"; elDepthDelta.className = "delta-badge badge-cyan"; }
      if (elDepthComp) elDepthComp.textContent = "Standard seasonal drawdown without El Niño shock";

      if (elSewageVal) { elSewageVal.textContent = "42.0%"; elSewageVal.className = "telemetry-num"; }
      if (elSewageDelta) { elSewageDelta.textContent = "Baseline dry-weather discharge"; elSewageDelta.className = "delta-badge"; }
      if (elSewageComp) elSewageComp.textContent = "Controlled effluent dilution along municipal banks";

      if (elWardsVal) { elWardsVal.textContent = "5 / 60"; elWardsVal.className = "telemetry-num"; }
      if (elWardsDelta) { elWardsDelta.textContent = "Core urban bank wards only"; elWardsDelta.className = "delta-badge"; }
      if (elWardsComp) elWardsComp.textContent = "Isolated stress confined to immediate riverbank";
    }
  }

  // =========================================================================
  // TIER 3: EMPIRICAL PROOF CHARTS
  // =========================================================================
  function initCharts() {
    initDivergenceChart();
    initProximityChart();
  }

  function initDivergenceChart() {
    const ctx = document.getElementById('divergenceChart');
    if (!ctx) return;

    if (divergenceChartInstance) {
      divergenceChartInstance.destroy();
    }

    const labels = ["2023 Actual", "Winter '23", "2024 Actual", "Winter '24", "2025 Actual", "2026 Split"];
    const expectedPath = [16.2, 12.8, 17.1, 13.5, 18.4, 19.2];
    const elNinoReality = [16.2, 12.8, 17.1, 13.5, 18.4, 28.6];

    divergenceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: "Expected '26 Trend (Baseline)",
            data: expectedPath,
            borderColor: '#71717A',
            borderWidth: 1.8,
            borderDash: [4, 4],
            pointRadius: 3,
            pointBackgroundColor: '#71717A',
            tension: 0.2
          },
          {
            label: "El Niño '26 Reality Shock",
            data: elNinoReality,
            borderColor: '#F43F5E',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            fill: {
              target: 0,
              above: 'rgba(244, 63, 94, 0.10)'
            },
            borderWidth: 2.2,
            pointRadius: 3.5,
            pointBackgroundColor: '#F43F5E',
            tension: 0.2
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
              color: '#A1A1AA',
              font: { family: 'Inter', size: 10, weight: '500' },
              boxWidth: 10,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: '#18181C',
            titleColor: '#F4F4F5',
            bodyColor: '#A1A1AA',
            borderColor: '#27272A',
            borderWidth: 1,
            titleFont: { family: 'Inter', size: 11, weight: '600' },
            bodyFont: { family: 'JetBrains Mono', size: 11 },
            padding: 8,
            callbacks: {
              label: function (c) {
                return `${c.dataset.label}: ${c.raw}m bgl`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#71717A',
              font: { family: 'Inter', size: 10 }
            }
          },
          y: {
            min: 10,
            max: 32,
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#71717A',
              font: { family: 'JetBrains Mono', size: 10 },
              callback: function (val) { return val + 'm'; }
            },
            title: {
              display: true,
              text: 'Depth to Water (m bgl)',
              color: '#71717A',
              font: { family: 'Inter', size: 9, weight: '500' }
            }
          }
        }
      }
    });
  }

  function initProximityChart() {
    const ctx = document.getElementById('proximityChart');
    if (!ctx) return;

    if (proximityChartInstance) {
      proximityChartInstance.destroy();
    }

    const categories = ["< 0.5 km", "0.5 – 1.0 km", "1.0 – 2.0 km", "> 3.0 km"];
    const expectedTds = [1550, 1420, 1180, 950];
    const shockTds = [2940, 2420, 1740, 1120];

    proximityChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: "Baseline 2025 TDS",
            data: expectedTds,
            backgroundColor: '#06B6D4',
            borderRadius: 2,
            barPercentage: 0.55,
            categoryPercentage: 0.65
          },
          {
            label: "El Niño 2026 Reality TDS",
            data: shockTds,
            backgroundColor: '#F43F5E',
            borderRadius: 2,
            barPercentage: 0.55,
            categoryPercentage: 0.65
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
              color: '#A1A1AA',
              font: { family: 'Inter', size: 10, weight: '500' },
              boxWidth: 10,
              padding: 10
            }
          },
          tooltip: {
            backgroundColor: '#18181C',
            titleColor: '#F4F4F5',
            bodyColor: '#A1A1AA',
            borderColor: '#27272A',
            borderWidth: 1,
            titleFont: { family: 'Inter', size: 11, weight: '600' },
            bodyFont: { family: 'JetBrains Mono', size: 11 },
            padding: 8,
            callbacks: {
              label: function (c) {
                return `${c.dataset.label}: ${c.raw} mg/L`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#71717A',
              font: { family: 'Inter', size: 10 }
            },
            title: {
              display: true,
              text: 'Distance from Noyyal Sewage Corridor',
              color: '#71717A',
              font: { family: 'Inter', size: 9, weight: '500' }
            }
          },
          y: {
            min: 0,
            max: 3300,
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#71717A',
              font: { family: 'JetBrains Mono', size: 10 },
              callback: function (val) {
                if (val === 2000) return '2,000 (BIS)';
                return val;
              }
            },
            title: {
              display: true,
              text: 'TDS Salinity (mg/L)',
              color: '#71717A',
              font: { family: 'Inter', size: 9, weight: '500' }
            }
          }
        }
      }
    });
  }

  // =========================================================================
  // RANKED PRIORITY ACTION TABLE
  // =========================================================================
  function renderActionTable() {
    const tbody = document.getElementById('actionTableBody');
    const searchVal = (document.getElementById('tableSearch')?.value || '').toLowerCase().trim();
    if (!tbody) return;

    let items = [...PRIORITY_WARDS];

    if (searchVal) {
      items = items.filter(w =>
        w.ward.toLowerCase().includes(searchVal) ||
        w.locality.toLowerCase().includes(searchVal) ||
        w.taluk.toLowerCase().includes(searchVal)
      );
    }

    tbody.innerHTML = '';

    items.forEach(w => {
      const tr = document.createElement('tr');
      const depthVal = isElNinoActive ? `${w.shockDepth}m (${w.drop})` : `${w.expDepth}m`;
      const tdsVal = isElNinoActive ? `${w.shockTds} (${w.tdsSurgePct})` : `${w.expTds} mg/L`;
      const statusPill = (isElNinoActive && w.rank <= 6)
        ? '<span class="status-pill status-cap">CAP &amp; TEST</span>'
        : '<span class="status-pill status-monitor">MONITOR</span>';

      tr.innerHTML = `
        <td>#${w.rank}</td>
        <td><strong>${w.ward}</strong> &bull; <span style="color: var(--text-muted); font-size: 10px;">${w.taluk}</span></td>
        <td>${w.distNoyyalKm} km</td>
        <td style="color: ${isElNinoActive ? 'var(--color-rose)' : 'inherit'};">${depthVal}</td>
        <td style="color: ${w.shockTds >= 2000 && isElNinoActive ? 'var(--color-rose)' : 'var(--color-amber)'};">${tdsVal}</td>
        <td>${statusPill}</td>
      `;

      tr.addEventListener('mouseenter', () => {
        document.querySelectorAll(`[data-ward-id="${w.id}"]`).forEach(node => {
          node.classList.add('node-focused');
        });
      });

      tr.addEventListener('mouseleave', () => {
        document.querySelectorAll(`[data-ward-id="${w.id}"]`).forEach(node => {
          node.classList.remove('node-focused');
        });
      });

      tbody.appendChild(tr);
    });
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  function initEvents() {
    // 1. Hardware-style Segmented Scenario Switch
    const btnExpected = document.getElementById('btnScenarioExpected');
    const btnShock = document.getElementById('btnScenarioShock');

    if (btnExpected) {
      btnExpected.addEventListener('click', () => {
        isElNinoActive = false;
        updateElNinoState();
      });
    }

    if (btnShock) {
      btnShock.addEventListener('click', () => {
        isElNinoActive = true;
        updateElNinoState();
      });
    }

    // 2. Live Pitch Deck QR Trigger & Modal
    const btnQrTrigger = document.getElementById('btnQrTrigger');
    const qrModal = document.getElementById('qrModal');
    const qrClose = document.getElementById('btnQrModalClose');

    if (btnQrTrigger && qrModal) {
      btnQrTrigger.addEventListener('click', () => qrModal.showModal());
    }
    if (qrClose && qrModal) {
      qrClose.addEventListener('click', () => qrModal.close());
    }
    if (qrModal) {
      qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) qrModal.close();
      });
    }

    // 3. Action Table Search
    document.getElementById('tableSearch')?.addEventListener('input', renderActionTable);

    // 4. Global View Mode Switcher (Pitch Deck vs Technical Dossier)
    document.getElementById('btnModePitch')?.addEventListener('click', () => switchViewMode('pitch'));
    document.getElementById('btnModeDossier')?.addEventListener('click', () => switchViewMode('dossier'));
    document.getElementById('btnBackToPitch')?.addEventListener('click', () => switchViewMode('pitch'));
  }

  function switchViewMode(mode) {
    currentViewMode = mode;
    const pitchView = document.getElementById('pitchDeckView');
    const dossierView = document.getElementById('technicalDossierSection');
    const btnPitch = document.getElementById('btnModePitch');
    const btnDossier = document.getElementById('btnModeDossier');

    if (mode === 'pitch') {
      pitchView.style.display = 'flex';
      dossierView.style.display = 'none';
      btnPitch?.classList.add('active');
      btnDossier?.classList.remove('active');
    } else {
      pitchView.style.display = 'none';
      dossierView.style.display = 'block';
      btnDossier?.classList.add('active');
      btnPitch?.classList.remove('active');

      if (!technicalDossierInitialized) {
        technicalDossierInitialized = true;
        initTechnicalDossier();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // =========================================================================
  // BOOTSTRAP APP
  // =========================================================================
  function init() {
    const mapSrc = 'assets/tiruppur-taluk-map.png';

    renderDarkIsolatedMap('canvasMapLeft', mapSrc, () => {
      renderBorewellPins('borewellNodesLeft', false);
    });

    renderDarkIsolatedMap('canvasMapRight', mapSrc, () => {
      updateElNinoState();
    });

    initCharts();
    renderActionTable();
    initEvents();

    console.log("Where Tiruppur's Water Breaks First: Linear/Palantir Matte Controller Active.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }


function initTechnicalDossier() {
    console.log("Initializing technical dossier scientific controller...");
    try {
      /**
 * A Catastrophe behind Colours — Groundwater Stress Analytics
 * Professional Environmental Dashboard Controller
 */

(function () {
  'use strict';

  const state = {
    filters: {
      taluk: 'all',
      wellType: 'all',
      priority: 'all',
      search: ''
    },
    sortColumn: 'priority_score',
    sortDirection: 'desc',
    selectedStation: null,
    charts: {},
    map: null,
    markers: []
  };

  const DOM = {
    filterTaluk: document.getElementById('filterTaluk'),
    filterWellType: document.getElementById('filterWellType'),
    filterPriority: document.getElementById('filterPriority'),
    filterSearch: document.getElementById('filterSearch'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    jumpLinks: document.querySelectorAll('.jump-link'),
    priorityTableBody: document.getElementById('priorityTableBody'),
    priorityCountLabel: document.getElementById('priorityCountLabel'),
    qualitySamplesTable: document.getElementById('qualitySamplesTable').querySelector('tbody'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    stationModal: document.getElementById('stationModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalStationTitle: document.getElementById('modalStationTitle'),
    modalStationSub: document.getElementById('modalStationSub'),
    modalScore: document.getElementById('modalScore'),
    modalTierPill: document.getElementById('modalTierPill'),
    modalMaxDepth: document.getElementById('modalMaxDepth'),
    modalTds: document.getElementById('modalTds'),
    modalSwing: document.getElementById('modalSwing'),
    modalGeoDetails: document.getElementById('modalGeoDetails'),
    modalRationale: document.getElementById('modalRationale'),
    modalIntervention: document.getElementById('modalIntervention')
  };

  function getData() {
    if (window.DASHBOARD_DATA) {
      return window.DASHBOARD_DATA;
    }
    console.error("Dashboard data bundle not found on window object.");
    return null;
  }

  // =========================================================================
  // Quick-Jump Navigation
  // =========================================================================
  function initQuickJump() {
    DOM.jumpLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        DOM.jumpLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });

    // Update active jump link on scroll
    const sections = document.querySelectorAll('section.dashboard-block, section.hero-card');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        if (window.pageYOffset >= top) {
          current = sec.getAttribute('id');
        }
      });
      if (current) {
        DOM.jumpLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
          }
        });
      }
    }, { passive: true });
  }

  // =========================================================================
  // Filter Dropdowns
  // =========================================================================
  function initFilters(data) {
    const taluks = new Set();
    data.priority_table.forEach(s => {
      if (s.taluk && s.taluk !== '-') taluks.add(s.taluk);
    });
    data.water_levels.forEach(w => {
      if (w.taluk && w.taluk !== '-') taluks.add(w.taluk);
    });

    const sortedTaluks = Array.from(taluks).sort();
    sortedTaluks.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = `${t} Taluk`;
      DOM.filterTaluk.appendChild(opt);
    });

    DOM.filterTaluk.addEventListener('change', e => {
      state.filters.taluk = e.target.value;
      applyFilters();
    });

    DOM.filterWellType.addEventListener('change', e => {
      state.filters.wellType = e.target.value;
      applyFilters();
    });

    DOM.filterPriority.addEventListener('change', e => {
      state.filters.priority = e.target.value;
      applyFilters();
    });

    DOM.filterSearch.addEventListener('input', e => {
      state.filters.search = e.target.value.toLowerCase().trim();
      applyFilters();
    });

    DOM.resetFiltersBtn.addEventListener('click', () => {
      DOM.filterTaluk.value = 'all';
      DOM.filterWellType.value = 'all';
      DOM.filterPriority.value = 'all';
      DOM.filterSearch.value = '';
      state.filters = { taluk: 'all', wellType: 'all', priority: 'all', search: '' };
      applyFilters();
    });
  }

  function applyFilters() {
    renderPriorityTable();
    updateMapMarkers();
  }

  // =========================================================================
  // Leaflet GIS Station Map (Standard OpenStreetMap - Zero API Key Needed)
  // =========================================================================
  function initMap(data) {
    const mapContainer = document.getElementById('stationMap');
    if (!mapContainer) return;

    // Centered over Tiruppur District & Noyyal Basin
    state.map = L.map('stationMap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([11.08, 77.40], 10);

    // Standard OpenStreetMap Tiles (100% free, reliable, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 18,
      subdomains: ['a', 'b', 'c']
    }).addTo(state.map);

    renderMapMarkers(data);
  }

  function renderMapMarkers(data) {
    state.markers.forEach(m => state.map.removeLayer(m));
    state.markers = [];

    const stations = data.priority_table;

    stations.forEach(st => {
      if (!st.latitude || !st.longitude) return;

      const isHigh = st.priority_tier === 'High Priority';
      const isMed = st.priority_tier === 'Medium Priority';
      const color = isHigh ? '#dc2626' : (isMed ? '#d97706' : '#059669');
      const radius = isHigh ? 8 : (isMed ? 7 : 6);

      const circle = L.circleMarker([st.latitude, st.longitude], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.85
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 0.85rem; min-width: 210px; color: #0f172a;">
          <div style="font-weight: 800; font-size: 1rem; margin-bottom: 0.15rem; color: #1e3a8a;">${st.station_name}</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem;">${st.taluk} Taluk &bull; ${st.well_type}</div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.4rem; border-radius: 4px; margin-bottom: 0.5rem; font-size: 0.78rem;">
            <div><strong>Max Water Depth:</strong> ${st.max_depth_mbgl ? st.max_depth_mbgl + ' m bgl' : 'N/A'}</div>
            <div><strong>Latest TDS:</strong> ${st.post_monsoon_tds ? st.post_monsoon_tds + ' mg/L' : (st.pre_monsoon_tds ? st.pre_monsoon_tds + ' mg/L (Pre)' : 'No sample')}</div>
          </div>
          <div style="font-size: 0.78rem; font-weight: 700; color: ${color}; margin-bottom: 0.5rem;">
            ${st.priority_tier} (Risk Score: ${st.priority_score}/100)
          </div>
          <button onclick="window.openStationModal('${st.station_name.replace(/'/g, "\\'")}')" 
                  style="width: 100%; background: #1e40af; color: white; border: none; padding: 0.35rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer;">
            View Station Dossier
          </button>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.stationData = st;
      circle.addTo(state.map);
      state.markers.push(circle);
    });
  }

  function updateMapMarkers() {
    state.markers.forEach(marker => {
      const st = marker.stationData;
      let visible = true;

      if (state.filters.taluk !== 'all' && st.taluk !== state.filters.taluk) visible = false;
      if (state.filters.wellType !== 'all') {
        if (!st.well_type || !st.well_type.toLowerCase().includes(state.filters.wellType.toLowerCase())) visible = false;
      }
      if (state.filters.priority !== 'all' && st.priority_tier !== state.filters.priority) visible = false;
      if (state.filters.search) {
        const q = state.filters.search;
        const nameMatch = st.station_name && st.station_name.toLowerCase().includes(q);
        const talukMatch = st.taluk && st.taluk.toLowerCase().includes(q);
        if (!nameMatch && !talukMatch) visible = false;
      }

      if (visible) {
        if (!state.map.hasLayer(marker)) state.map.addLayer(marker);
      } else {
        if (state.map.hasLayer(marker)) state.map.removeLayer(marker);
      }
    });
  }

  // =========================================================================
  // Chart Initializations (Clean Scientific Theme)
  // =========================================================================
  function initCharts(data) {
    const textColor = '#475569';
    const gridColor = '#f1f5f9';

    // 1. Top 12 Deepest Wells (Horizontal Bar)
    const deepestCtx = document.getElementById('chartDeepestWells');
    if (deepestCtx) {
      const sortedByDepth = [...data.priority_table]
        .filter(s => s.max_depth_mbgl !== null && s.max_depth_mbgl !== undefined)
        .sort((a, b) => b.max_depth_mbgl - a.max_depth_mbgl)
        .slice(0, 12);

      const labels = sortedByDepth.map(s => `${s.station_name} (${s.taluk || 'Tiruppur'})`);
      const depths = sortedByDepth.map(s => s.max_depth_mbgl);
      const bgColors = depths.map(d => d >= 20 ? '#dc2626' : (d >= 10 ? '#d97706' : '#0284c7'));

      state.charts.deepestWells = new Chart(deepestCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Max Depth to Water (m bgl)',
            data: depths,
            backgroundColor: bgColors,
            borderRadius: 3
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Depth: ${ctx.parsed.x} meters below ground level`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Depth to Water Table (m bgl)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            y: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 11 } }
            }
          }
        }
      });
    }

    // 2. 2024-25 Core Wells Seasonal Dynamics (Grouped Bar)
    const coreCtx = document.getElementById('chartSeasonalCoreWells');
    if (coreCtx) {
      const coreRecords = data.water_levels.filter(w => w.period === '2024-2025');
      const coreLabels = coreRecords.map(r => r.station_name);

      state.charts.seasonalCore = new Chart(coreCtx, {
        type: 'bar',
        data: {
          labels: coreLabels,
          datasets: [
            {
              label: 'May-24 (Pre-Monsoon)',
              data: coreRecords.map(r => r.may_val),
              backgroundColor: '#dc2626',
              borderRadius: 2
            },
            {
              label: 'Aug-24 (SW Monsoon)',
              data: coreRecords.map(r => r.aug_val),
              backgroundColor: '#d97706',
              borderRadius: 2
            },
            {
              label: 'Nov-24 (Post-Monsoon)',
              data: coreRecords.map(r => r.nov_val),
              backgroundColor: '#059669',
              borderRadius: 2
            },
            {
              label: 'Jan-25 (Winter)',
              data: coreRecords.map(r => r.jan_val),
              backgroundColor: '#0284c7',
              borderRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw + ' m bgl' : 'No measurement'}`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Water Level Depth (m bgl)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 10 } }
            }
          }
        }
      });
    }

    // 3. Nachipalayam Telemetry Hydrograph (India-WRIS)
    const telemetryCtx = document.getElementById('chartTelemetryNachipalayam');
    if (telemetryCtx) {
      const telemetry = data.nachipalayam_telemetry;
      const tLabels = telemetry.map(t => t.date);
      const tDepths = telemetry.map(t => t.depth_mbgl);

      state.charts.telemetry = new Chart(telemetryCtx, {
        type: 'line',
        data: {
          labels: tLabels,
          datasets: [{
            label: 'Nachipalayam1_1 Piezometer Depth (m bgl)',
            data: tDepths,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.08)',
            fill: true,
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor } },
            tooltip: {
              callbacks: {
                label: (ctx) => `Depth to Water: ${ctx.parsed.y} m bgl`
              }
            }
          },
          scales: {
            x: {
              ticks: { color: textColor, maxTicksLimit: 12 },
              grid: { color: gridColor }
            },
            y: {
              title: { display: true, text: 'Depth to Water Table (m bgl)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor },
              reverse: true
            }
          }
        }
      });
    }

    // 4. Pre vs Post Monsoon TDS Comparison (CGWB Quality 2024)
    const tdsCtx = document.getElementById('chartTdsComparison');
    if (tdsCtx) {
      const preSamples = data.water_quality.filter(q => q.season.includes('Pre-Monsoon'));
      const postSamples = data.water_quality.filter(q => q.season.includes('Post-Monsoon'));

      const stations = ['Arugampalayam', 'Nachipalayam', 'Periyapatti', 'Udumalpet 1', 'Karamadai', 'Tiruppur Agraharam', 'Kovilvazhi I'];
      const preTds = stations.map(s => {
        const found = preSamples.find(x => x.station_name === s);
        return found ? found.TDS_mg_L : null;
      });
      const postTds = stations.map(s => {
        const found = postSamples.find(x => x.station_name === s);
        return found ? found.TDS_mg_L : null;
      });

      state.charts.tdsComparison = new Chart(tdsCtx, {
        type: 'bar',
        data: {
          labels: stations,
          datasets: [
            {
              label: 'Pre-Monsoon TDS (May 2024)',
              data: preTds,
              backgroundColor: '#f59e0b',
              borderRadius: 3
            },
            {
              label: 'Post-Monsoon TDS (Nov 2024)',
              data: postTds,
              backgroundColor: '#6366f1',
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor, boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw + ' mg/L' : 'No sample'}`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Total Dissolved Solids (mg/L)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 10 } }
            }
          }
        }
      });
    }

    // 5. Electrical Conductivity (EC Profile)
    const ecCtx = document.getElementById('chartEcProfile');
    if (ecCtx) {
      const stations = ['Arugampalayam', 'Nachipalayam', 'Periyapatti', 'Udumalpet 1', 'Karamadai', 'Tiruppur Agraharam', 'Kovilvazhi I'];
      const preSamples = data.water_quality.filter(q => q.season.includes('Pre-Monsoon'));
      const postSamples = data.water_quality.filter(q => q.season.includes('Post-Monsoon'));

      const preEc = stations.map(s => {
        const found = preSamples.find(x => x.station_name === s);
        return found ? found.EC_uS_cm : null;
      });
      const postEc = stations.map(s => {
        const found = postSamples.find(x => x.station_name === s);
        return found ? found.EC_uS_cm : null;
      });

      state.charts.ecProfile = new Chart(ecCtx, {
        type: 'bar',
        data: {
          labels: stations,
          datasets: [
            {
              label: 'Pre-Monsoon EC (µS/cm)',
              data: preEc,
              backgroundColor: '#0284c7',
              borderRadius: 3
            },
            {
              label: 'Post-Monsoon EC (µS/cm)',
              data: postEc,
              backgroundColor: '#1e40af',
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor, boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw + ' µS/cm' : 'No sample'}`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'EC (µS/cm at 25°C)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { size: 10 } }
            }
          }
        }
      });
    }

    // 6. Monthly Rainfall (2023 vs 2024)
    const monthlyRainCtx = document.getElementById('chartMonthlyRainfall');
    if (monthlyRainCtx) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const rain2023 = [];
      const rain2024 = [];

      for (let m = 1; m <= 12; m++) {
        const mKey = m < 10 ? `0${m}` : `${m}`;
        const item23 = data.rainfall_monthly.find(r => r.month === `2023-${mKey}`);
        const item24 = data.rainfall_monthly.find(r => r.month === `2024-${mKey}`);
        rain2023.push(item23 ? item23.total_mm : 0);
        rain2024.push(item24 ? item24.total_mm : 0);
      }

      state.charts.monthlyRain = new Chart(monthlyRainCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: '2023 Monthly (Total: 582.4 mm)',
              data: rain2023,
              backgroundColor: '#f87171',
              borderRadius: 3
            },
            {
              label: '2024 Monthly (Total: 812.6 mm)',
              data: rain2024,
              backgroundColor: '#0284c7',
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor, boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label.split(' ')[0]}: ${ctx.raw} mm`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Rainfall (mm/month)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });
    }

    // 7. NOAA RONI ENSO Index (2021-2025)
    const roniCtx = document.getElementById('chartRoniEnso');
    if (roniCtx) {
      const roniFiltered = data.enso_roni.filter(r => r.year >= 2021 && r.year <= 2025);
      const rLabels = roniFiltered.map(r => r.label);
      const rAnoms = roniFiltered.map(r => r.anomaly);
      const rColors = rAnoms.map(a => a >= 0.5 ? '#dc2626' : (a <= -0.5 ? '#0284c7' : '#64748b'));

      state.charts.roniEnso = new Chart(roniCtx, {
        type: 'line',
        data: {
          labels: rLabels,
          datasets: [{
            label: 'Relative Oceanic Niño Index Anomaly (°C)',
            data: rAnoms,
            borderColor: '#1e40af',
            backgroundColor: 'rgba(30, 64, 175, 0.05)',
            fill: true,
            borderWidth: 2,
            pointBackgroundColor: rColors,
            pointBorderColor: '#ffffff',
            pointRadius: 4,
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: textColor } },
            tooltip: {
              callbacks: {
                label: (ctx) => `RONI SST Anomaly: ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y} °C (${ctx.parsed.y >= 0.5 ? 'El Niño' : (ctx.parsed.y <= -0.5 ? 'La Niña' : 'Neutral')})`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'SST Anomaly (°C)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              ticks: { color: textColor, maxTicksLimit: 12 },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // 8. 731-Day Daily Hyetograph
    const dailyRainCtx = document.getElementById('chartDailyHyetograph');
    if (dailyRainCtx) {
      const daily = data.rainfall_daily;
      const dLabels = daily.map(d => d.date);
      const dValues = daily.map(d => d.precip_mm);

      state.charts.dailyHyetograph = new Chart(dailyRainCtx, {
        type: 'bar',
        data: {
          labels: dLabels,
          datasets: [{
            label: 'Daily Precipitation (mm/day)',
            data: dValues,
            backgroundColor: dValues.map(v => v >= 40 ? '#dc2626' : (v >= 10 ? '#1e40af' : '#0284c7')),
            borderRadius: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Precipitation: ${ctx.parsed.y} mm/day`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Precipitation (mm/day)', color: textColor },
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              ticks: { color: textColor, maxTicksLimit: 14 },
              grid: { display: false }
            }
          }
        }
      });
    }
  }

  // =========================================================================
  // Priority Table Rendering
  // =========================================================================
  function renderPriorityTable() {
    const data = getData();
    if (!data) return;

    let stations = [...data.priority_table];

    if (state.filters.taluk !== 'all') {
      stations = stations.filter(s => s.taluk === state.filters.taluk);
    }
    if (state.filters.wellType !== 'all') {
      stations = stations.filter(s => s.well_type && s.well_type.toLowerCase().includes(state.filters.wellType.toLowerCase()));
    }
    if (state.filters.priority !== 'all') {
      stations = stations.filter(s => s.priority_tier === state.filters.priority);
    }
    if (state.filters.search) {
      const q = state.filters.search;
      stations = stations.filter(s =>
        (s.station_name && s.station_name.toLowerCase().includes(q)) ||
        (s.taluk && s.taluk.toLowerCase().includes(q)) ||
        (s.evidence_rationale && s.evidence_rationale.toLowerCase().includes(q))
      );
    }

    stations.sort((a, b) => {
      let valA = a[state.sortColumn];
      let valB = b[state.sortColumn];

      if (valA === null || valA === undefined) valA = -999;
      if (valB === null || valB === undefined) valB = -999;

      if (typeof valA === 'string') {
        return state.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return state.sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    DOM.priorityCountLabel.textContent = stations.length;
    DOM.priorityTableBody.innerHTML = '';

    if (stations.length === 0) {
      DOM.priorityTableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2rem; color: #64748b;">
            No stations match the selected filter combination. Click 'Reset All Filters' to view all stations.
          </td>
        </tr>
      `;
      return;
    }

    stations.forEach(st => {
      const tr = document.createElement('tr');
      const tierClass = st.priority_tier === 'High Priority' ? 'high' : (st.priority_tier === 'Medium Priority' ? 'med' : 'low');

      tr.innerHTML = `
        <td><span class="score-num">${st.priority_score}</span></td>
        <td><span class="tier-pill ${tierClass}">${st.priority_tier.replace(' Priority', '')}</span></td>
        <td><strong style="color: #0f172a;">${st.station_name}</strong></td>
        <td>${st.taluk || 'Tiruppur'}</td>
        <td><span style="font-size: 0.75rem; color: #64748b;">${st.well_type || 'Well'}</span></td>
        <td><strong>${st.max_depth_mbgl ? st.max_depth_mbgl.toFixed(1) : '--'}</strong> m</td>
        <td>${st.seasonal_range_m !== null ? st.seasonal_range_m.toFixed(1) + ' m' : '--'}</td>
        <td>${st.post_monsoon_tds ? `<strong style="color: ${st.post_monsoon_tds >= 2000 ? '#dc2626' : 'inherit'};">${st.post_monsoon_tds}</strong>` : (st.pre_monsoon_tds ? `${st.pre_monsoon_tds} (Pre)` : '<span style="color: #94a3b8;">--</span>')}</td>
        <td style="max-width: 280px; font-size: 0.78rem; line-height: 1.4;">${st.evidence_rationale}</td>
        <td>
          <button class="btn-inspect" onclick="window.openStationModal('${st.station_name.replace(/'/g, "\\'")}')">
            Inspect
          </button>
        </td>
      `;
      DOM.priorityTableBody.appendChild(tr);
    });
  }

  function initTableSorting() {
    const headers = document.querySelectorAll('#priorityDataTable th[data-sort]');
    headers.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (state.sortColumn === col) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortColumn = col;
          state.sortDirection = 'desc';
        }
        renderPriorityTable();
      });
    });
  }

  // =========================================================================
  // Render Verified Water Quality Table
  // =========================================================================
  function renderQualityTable(data) {
    if (!DOM.qualitySamplesTable) return;
    DOM.qualitySamplesTable.innerHTML = '';

    data.water_quality.forEach(q => {
      const tr = document.createElement('tr');
      const isHighTds = q.TDS_mg_L >= 2000;
      const tdsColor = isHighTds ? '#dc2626' : (q.TDS_mg_L >= 1200 ? '#d97706' : 'inherit');

      tr.innerHTML = `
        <td><strong>${q.station_name}</strong><br><span style="font-size: 0.72rem; color: #64748b;">${q.taluk || ''}</span></td>
        <td><span style="font-size: 0.75rem;">${q.season}</span></td>
        <td>${q.pH}</td>
        <td><strong>${q.EC_uS_cm}</strong></td>
        <td style="color: ${tdsColor}; font-weight: 700;">${q.TDS_mg_L}</td>
        <td>${q.Total_Hardness_mg_L || '--'}</td>
        <td>${q.Cl_mg_L || '--'}</td>
        <td>${q.SO4_mg_L || '--'}</td>
        <td>${q.NO3_mg_L || '--'}</td>
        <td>${q.F_mg_L || '--'}</td>
        <td><span style="font-size: 0.7rem; color: #64748b;">Page ${q.source_page}</span></td>
      `;
      DOM.qualitySamplesTable.appendChild(tr);
    });
  }

  // =========================================================================
  // Modal Dialog Controller
  // =========================================================================
  window.openStationModal = function (stationName) {
    const data = getData();
    if (!data) return;

    const st = data.priority_table.find(s => s.station_name === stationName);
    if (!st) return;

    state.selectedStation = st;

    DOM.modalStationTitle.textContent = st.station_name;
    DOM.modalStationSub.textContent = `${st.taluk} Taluk • ${st.well_type} • Source: ${st.source}`;
    DOM.modalScore.textContent = `${st.priority_score}/100`;

    const tierClass = st.priority_tier === 'High Priority' ? 'high' : (st.priority_tier === 'Medium Priority' ? 'med' : 'low');
    DOM.modalTierPill.innerHTML = `<span class="tier-pill ${tierClass}">${st.priority_tier}</span>`;

    DOM.modalMaxDepth.textContent = st.max_depth_mbgl ? `${st.max_depth_mbgl.toFixed(1)} m bgl` : 'No Record';
    DOM.modalTds.textContent = st.post_monsoon_tds ? `${st.post_monsoon_tds} mg/L` : (st.pre_monsoon_tds ? `${st.pre_monsoon_tds} mg/L (Pre)` : 'No 2024 chemical sample');
    DOM.modalSwing.textContent = st.seasonal_range_m !== null ? `${st.seasonal_range_m.toFixed(1)} m` : '--';

    DOM.modalGeoDetails.textContent = `Coordinates: ${st.latitude.toFixed(4)}°N, ${st.longitude.toFixed(4)}°E. Infrastructure: ${st.well_type}. Observation period: ${st.monitoring_period}.`;
    DOM.modalRationale.textContent = st.evidence_rationale;

    let advice = "";
    if (st.priority_tier === 'High Priority') {
      if (st.post_monsoon_tds && st.post_monsoon_tds >= 2000) {
        advice = "CRITICAL SALINITY INTERVENTION: Immediate chemical speciation testing (heavy metals, dye aromatics, sulfates). Provide community RO/nanofiltration dispensing for nearby households. Restrict untreated dye effluent disposal in catchment.";
      } else if (st.max_depth_mbgl && st.max_depth_mbgl >= 20) {
        advice = "AQUIFER EXHAUSTION INTERVENTION: Implement Managed Aquifer Recharge (MAR) shafts with filtered rooftop rainwater harvesting. Mandate agricultural micro-irrigation and meter industrial drawdowns.";
      } else {
        advice = "ENHANCED SURVEILLANCE: Bi-monthly chemical profiling and dye tracer tracking to monitor industrial plume migration from Noyyal textile clusters.";
      }
    } else if (st.priority_tier === 'Medium Priority') {
      advice = "ROUTINE INTERVENTION: Maintain monthly water table dip-logging. Conduct baseline fluoride and nitrate testing.";
    } else {
      advice = "BASELINE INTERVENTION: Continue standard CGWB seasonal monitoring network measurements. Maintain sanitary wellhead seals.";
    }

    DOM.modalIntervention.textContent = advice;

    if (typeof DOM.stationModal.showModal === 'function') {
      DOM.stationModal.showModal();
    } else {
      DOM.stationModal.setAttribute('open', '');
    }
  };

  function initModal() {
    DOM.modalCloseBtn.addEventListener('click', () => {
      DOM.stationModal.close();
    });

    DOM.stationModal.addEventListener('click', (e) => {
      const rect = DOM.stationModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        DOM.stationModal.close();
      }
    });
  }

  // =========================================================================
  // CSV Export Utility
  // =========================================================================
  function initExportCsv() {
    DOM.exportCsvBtn.addEventListener('click', () => {
      const data = getData();
      if (!data) return;

      const items = data.priority_table;
      if (!items || !items.length) return;

      const keys = Object.keys(items[0]);
      let csv = keys.join(',') + '\n';

      items.forEach(row => {
        csv += keys.map(k => {
          let val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = '"' + val.replace(/"/g, '""') + '"';
          }
          return val;
        }).join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiruppur_groundwater_priority_matrix_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // =========================================================================
  // Bootstrap Application
  // =========================================================================
  function init() {
    const data = getData();
    if (!data) return;

    initQuickJump();
    initFilters(data);
    initMap(data);
    initCharts(data);
    initTableSorting();
    renderPriorityTable();
    renderQualityTable(data);
    initModal();
    initExportCsv();

    console.log("“A Catastrophe behind Colours” dashboard initialized successfully.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
    } catch (e) {
      console.warn("Notice during technical dossier initialization:", e);
    }
  }

  // =========================================================================
  // BOOTSTRAP APP
  // =========================================================================
  function init() {
    // 1. Process & Render Dark Isolated Maps on HTML5 Canvases
    const mapSrc = 'assets/tiruppur-taluk-map.png';

    renderDarkIsolatedMap('canvasMapLeft', mapSrc, () => {
      renderBorewellPins('borewellNodesLeft', false);
    });

    renderDarkIsolatedMap('canvasMapRight', mapSrc, () => {
      updateElNinoState();
    });

    // 2. Initialize Charts & Tables
    initCharts();
    renderActionTable();
    initEvents();

    console.log("Where Tiruppur's Water Breaks First: Canvas Map Shader & El Niño Workspace Ready.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
