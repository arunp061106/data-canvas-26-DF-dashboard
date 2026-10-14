/**
 * WHERE TIRUPPUR'S WATER BREAKS FIRST
 * Isolated Dual-Map Workspace & Executive Pitch Deck Controller
 * Inspired by: Sentiment-Scope UI
 */

(function () {
  'use strict';

  // Master State
  let isElNinoActive = true; // Default ON for pitch deck impact
  let currentViewMode = 'pitch'; // 'pitch' | 'dossier'
  let sortColumn = 'rank';
  let sortAsc = true;

  // Leaflet Map Objects
  let mapLeft = null;
  let mapRight = null;
  let satLayerLeft = null;
  let satLayerRight = null;
  let rightTaluksLayer = null;
  let rightBorewellsLayer = null;
  let leftBorewellsLayer = null;

  // Chart Objects
  let divergenceChartInstance = null;
  let proximityChartInstance = null;
  let technicalDossierInitialized = false;

  // Center of Tiruppur District
  const TIRUPPUR_CENTER = [10.88, 77.44];
  const DEFAULT_ZOOM = 9.8;

  // Noyyal River Geometry across Tiruppur
  const NOYYAL_RIVER_COORDS = [
    [11.0820, 77.2600],
    [11.0890, 77.2920],
    [11.0980, 77.3200],
    [11.1040, 77.3420],
    [11.1085, 77.3650],
    [11.1140, 77.3950],
    [11.1190, 77.4320],
    [11.1235, 77.4680],
    [11.1270, 77.5100],
    [11.1300, 77.5450]
  ];

  // Top 10 Priority Wards & Firkas ranked by Expected vs El Niño Delta %
  const PRIORITY_WARDS = [
    {
      rank: 1,
      id: "W-41",
      ward: "Ward 41 (Nallur)",
      locality: "Nallur Corridor",
      distNoyyalKm: 0.95,
      lat: 11.0845,
      lon: 77.3814,
      expDepth: 18.2,
      expTds: 1540,
      shockDepth: 25.5,
      shockTds: 2510,
      drop: "-7.3m",
      tdsSurgePct: "+63.0%",
      status: "RED ALERT: Test & Cap First",
      actionClass: "status-critical"
    },
    {
      rank: 2,
      id: "W-08",
      ward: "Ward 8 (Vellampalayam)",
      locality: "15 Velampalayam",
      distNoyyalKm: 1.15,
      lat: 11.1412,
      lon: 77.3289,
      expDepth: 17.8,
      expTds: 1480,
      shockDepth: 25.7,
      shockTds: 2420,
      drop: "-7.9m",
      tdsSurgePct: "+63.5%",
      status: "RED ALERT: Test & Cap First",
      actionClass: "status-critical"
    },
    {
      rank: 3,
      id: "W-34",
      ward: "Ward 34 (Tiruppur South / Market)",
      locality: "Weekly Market / South Bank",
      distNoyyalKm: 0.42,
      lat: 11.0882,
      lon: 77.3431,
      expDepth: 18.8,
      expTds: 1580,
      shockDepth: 27.5,
      shockTds: 2750,
      drop: "-8.7m",
      tdsSurgePct: "+74.1%",
      status: "RED ALERT: Test & Cap First",
      actionClass: "status-critical"
    },
    {
      rank: 4,
      id: "W-22",
      ward: "Ward 22 (Kasipalayam)",
      locality: "Kasipalayam East",
      distNoyyalKm: 0.70,
      lat: 11.1156,
      lon: 77.3857,
      expDepth: 18.5,
      expTds: 1560,
      shockDepth: 26.9,
      shockTds: 2690,
      drop: "-8.4m",
      tdsSurgePct: "+72.4%",
      status: "RED ALERT: Test & Cap First",
      actionClass: "status-critical"
    },
    {
      rank: 5,
      id: "W-52",
      ward: "Ward 52 (Veerapandi)",
      locality: "Veerapandi West",
      distNoyyalKm: 0.85,
      lat: 11.0721,
      lon: 77.3612,
      expDepth: 18.0,
      expTds: 1520,
      shockDepth: 25.8,
      shockTds: 2580,
      drop: "-7.8m",
      tdsSurgePct: "+69.7%",
      status: "RED ALERT: Test & Cap First",
      actionClass: "status-critical"
    },
    {
      rank: 6,
      id: "W-15",
      ward: "Ward 15 (Agraharam)",
      locality: "Tiruppur Agraharam",
      distNoyyalKm: 0.35,
      lat: 11.1243,
      lon: 77.4157,
      expDepth: 18.6,
      expTds: 1600,
      shockDepth: 28.4,
      shockTds: 2840,
      drop: "-9.8m",
      tdsSurgePct: "+77.5%",
      status: "RED ALERT: Test & Cap First",
      actionClass: "status-critical"
    },
    {
      rank: 7,
      id: "W-28",
      ward: "Ward 28 (Kumaran Road)",
      locality: "Kumaran Road / Central",
      distNoyyalKm: 0.55,
      lat: 11.1078,
      lon: 77.3542,
      expDepth: 18.9,
      expTds: 1620,
      shockDepth: 28.2,
      shockTds: 2820,
      drop: "-9.3m",
      tdsSurgePct: "+74.1%",
      status: "RED ALERT: Test & Cap First",
      actionClass: "status-critical"
    },
    {
      rank: 8,
      id: "W-03",
      ward: "Ward 3 (Poopunagar)",
      locality: "Poopunagar North",
      distNoyyalKm: 1.65,
      lat: 11.1589,
      lon: 77.3412,
      expDepth: 17.5,
      expTds: 1390,
      shockDepth: 24.2,
      shockTds: 2190,
      drop: "-6.7m",
      tdsSurgePct: "+57.6%",
      status: "HIGH: Monitor Weekly",
      actionClass: "status-high"
    },
    {
      rank: 9,
      id: "W-19",
      ward: "Ward 19 (Mannarai)",
      locality: "Mannarai North",
      distNoyyalKm: 1.30,
      lat: 11.1354,
      lon: 77.3621,
      expDepth: 17.9,
      expTds: 1440,
      shockDepth: 24.8,
      shockTds: 2360,
      drop: "-6.9m",
      tdsSurgePct: "+63.9%",
      status: "HIGH: Monitor Weekly",
      actionClass: "status-high"
    },
    {
      rank: 10,
      id: "W-58",
      ward: "Ward 58 (Andipalayam)",
      locality: "Andipalayam Lake Belt",
      distNoyyalKm: 1.80,
      lat: 11.0543,
      lon: 77.3210,
      expDepth: 18.1,
      expTds: 1380,
      shockDepth: 25.1,
      shockTds: 2120,
      drop: "-7.0m",
      tdsSurgePct: "+53.6%",
      status: "HIGH: Monitor Weekly",
      actionClass: "status-high"
    }
  ];

  // =========================================================================
  // 1. INITIALIZE ISOLATED DUAL MAP WORKSPACE
  // =========================================================================
  function initDualMaps() {
    initLeftMap();
    initRightMap();
  }

  function initLeftMap() {
    const el = document.getElementById('mapLeft2025');
    if (!el) return;

    mapLeft = L.map('mapLeft2025', {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false
    }).setView(TIRUPPUR_CENTER, DEFAULT_ZOOM);

    // 1. Inverted Void Mask Layer (Covers everything outside Tiruppur with solid #090D16)
    if (window.TIRUPPUR_INVERTED_MASK_GEOJSON) {
      L.geoJSON(window.TIRUPPUR_INVERTED_MASK_GEOJSON, {
        style: {
          fillColor: '#090D16',
          fillOpacity: 1.0,
          stroke: false,
          interactive: false
        }
      }).addTo(mapLeft);
    }

    // 2. Summer 2025 Taluk Polygons (Calm Baseline: Cyan / Emerald / mild Amber)
    if (window.TIRUPPUR_TALUKS_GEOJSON) {
      L.geoJSON(window.TIRUPPUR_TALUKS_GEOJSON, {
        style: function (f) {
          const depth = f.properties.baseline_25_depth;
          let fill = '#10b981';
          if (depth > 20) fill = '#f59e0b';
          else if (depth > 16) fill = '#06b6d4';
          return {
            fillColor: fill,
            weight: 1.5,
            color: '#38bdf8',
            opacity: 0.75,
            fillOpacity: 0.45
          };
        },
        onEachFeature: function (f, layer) {
          layer.bindTooltip(`<strong>${f.properties.name}</strong><br>2025 Baseline: ${f.properties.baseline_25_depth}m bgl &bull; ${f.properties.baseline_25_tds} mg/L`, {
            direction: 'top',
            sticky: true
          });
        }
      }).addTo(mapLeft);
    }

    // 3. Noyyal River Corridor Vector
    L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#06b6d4',
      weight: 3.5,
      opacity: 0.95
    }).addTo(mapLeft);

    // 4. Glowing District Outer Silhouette Border
    if (window.TIRUPPUR_BOUNDARY_GEOJSON) {
      L.geoJSON(window.TIRUPPUR_BOUNDARY_GEOJSON, {
        style: {
          color: '#38bdf8',
          weight: 2.2,
          fill: false,
          opacity: 0.95,
          className: 'district-glow-border'
        }
      }).addTo(mapLeft);
    }

    // 5. Left Map Borewells Overlay
    leftBorewellsLayer = L.layerGroup().addTo(mapLeft);
    PRIORITY_WARDS.forEach(w => {
      L.circleMarker([w.lat, w.lon], {
        radius: 5,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 1.2,
        fillOpacity: 0.85
      }).bindTooltip(`${w.ward} &bull; 2025 Depth: 18.4m`).addTo(leftBorewellsLayer);
    });
  }

  function initRightMap() {
    const el = document.getElementById('mapRight2026');
    if (!el) return;

    mapRight = L.map('mapRight2026', {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false
    }).setView(TIRUPPUR_CENTER, DEFAULT_ZOOM);

    // 1. Inverted Void Mask Layer
    if (window.TIRUPPUR_INVERTED_MASK_GEOJSON) {
      L.geoJSON(window.TIRUPPUR_INVERTED_MASK_GEOJSON, {
        style: {
          fillColor: '#090D16',
          fillOpacity: 1.0,
          stroke: false,
          interactive: false
        }
      }).addTo(mapRight);
    }

    // 2. Noyyal River Line & Critical 1km Leachate Buffer
    L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#ef4444',
      weight: 18,
      opacity: 0.22,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(mapRight);

    L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#06b6d4',
      weight: 3.5,
      opacity: 0.95
    }).addTo(mapRight);

    // 3. Glowing District Silhouette
    if (window.TIRUPPUR_BOUNDARY_GEOJSON) {
      L.geoJSON(window.TIRUPPUR_BOUNDARY_GEOJSON, {
        style: {
          color: '#ef4444',
          weight: 2.4,
          fill: false,
          opacity: 0.95,
          className: 'district-glow-border-shock'
        }
      }).addTo(mapRight);
    }

    // 4. Render Dynamic Right Map Layer (Expected vs El Niño)
    updateRightMapDisplay();
  }

  function getRightTalukStyle(feature) {
    const p = feature.properties;
    const isCritical = p.critical_flag; // Tiruppur North, South, Uthukkuli, Kangayam

    if (!isElNinoActive) {
      // Expected 2026 Historical Trend (Gentle drift)
      return {
        fillColor: '#f59e0b',
        weight: 1.5,
        color: '#facc15',
        opacity: 0.75,
        fillOpacity: 0.40,
        className: ''
      };
    } else {
      // EL NIÑO STRESS 2026: Pulsing Crimson on Noyyal Corridor
      return {
        fillColor: isCritical ? '#ef4444' : '#f97316',
        weight: isCritical ? 2.8 : 1.6,
        color: isCritical ? '#ff1a53' : '#fb923c',
        opacity: 0.95,
        fillOpacity: isCritical ? 0.72 : 0.48,
        className: isCritical ? 'pulse-shock-corridor' : ''
      };
    }
  }

  function updateRightMapDisplay() {
    if (!mapRight) return;

    if (rightTaluksLayer) {
      mapRight.removeLayer(rightTaluksLayer);
    }

    if (window.TIRUPPUR_TALUKS_GEOJSON) {
      rightTaluksLayer = L.geoJSON(window.TIRUPPUR_TALUKS_GEOJSON, {
        style: getRightTalukStyle,
        onEachFeature: function (f, layer) {
          const p = f.properties;
          const depth = isElNinoActive ? p.el_nino_26_depth : p.expected_26_depth;
          const tds = isElNinoActive ? p.el_nino_26_tds : p.expected_26_tds;
          const stateTxt = isElNinoActive ? `<strong style="color: #ef4444;">EL NIÑO SHOCK: ${depth}m bgl &bull; ${tds} mg/L TDS (${p.anomaly_depth}m drop)</strong>` : `Expected '26: ${depth}m bgl &bull; ${tds} mg/L TDS`;

          layer.bindTooltip(`<strong>${p.name} Taluk</strong><br>${stateTxt}`, {
            direction: 'top',
            sticky: true
          });
        }
      }).addTo(mapRight);
    }

    // Right Map Borewells
    if (rightBorewellsLayer) {
      mapRight.removeLayer(rightBorewellsLayer);
    }
    rightBorewellsLayer = L.layerGroup().addTo(mapRight);

    PRIORITY_WARDS.forEach(w => {
      const color = isElNinoActive ? '#ef4444' : '#f59e0b';
      const radius = isElNinoActive ? 7 : 5;
      const depth = isElNinoActive ? w.shockDepth : w.expDepth;
      const tds = isElNinoActive ? w.shockTds : w.expTds;

      const marker = L.circleMarker([w.lat, w.lon], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        fillOpacity: 0.9
      });

      marker.bindPopup(`
        <div style="font-size: 0.75rem;">
          <strong style="color: #38bdf8;">${w.ward}</strong><br>
          <span style="color: #94a3b8;">${w.locality} &bull; ${w.distNoyyalKm} km to Noyyal</span>
          <div style="margin-top: 4px; padding: 4px; background: rgba(255,255,255,0.06); border-radius: 4px;">
            <div><strong>2026 Level:</strong> ${depth} m bgl</div>
            <div><strong>TDS Salinity:</strong> ${tds} mg/L</div>
            <div style="color: #ef4444; font-weight: 800;">${isElNinoActive ? w.status : 'Normal Trend'}</div>
          </div>
        </div>
      `);

      marker.addTo(rightBorewellsLayer);
    });

    // Update Header Pill on Right Map
    const badge = document.getElementById('rightMapStatusBadge');
    const dot = document.getElementById('rightPanelDot');
    const callouts = document.getElementById('rightMapDeltaCallouts');
    const btn = document.getElementById('btnElNinoTrigger');
    const btnLabel = document.getElementById('elNinoBtnLabel');

    if (isElNinoActive) {
      if (badge) {
        badge.innerHTML = "🔥 EL NIÑO SHOCK: 28.6m bgl (-9.4m) &bull; 2,940 mg/L (+89.6%)";
        badge.className = "panel-kpi-pill pill-shock-active";
      }
      if (dot) dot.className = "panel-status-dot dot-shock active";
      if (callouts) callouts.style.display = "flex";
      if (btn) btn.className = "el-nino-trigger-btn active";
      if (btnLabel) btnLabel.textContent = "EL NIÑO EFFECT ACTIVE (CLICK TO RESET)";
    } else {
      if (badge) {
        badge.innerHTML = "Expected Historical Trend: 19.2m bgl &bull; 1,550 mg/L TDS";
        badge.className = "panel-kpi-pill";
      }
      if (dot) dot.className = "panel-status-dot dot-shock";
      if (callouts) callouts.style.display = "none";
      if (btn) btn.className = "el-nino-trigger-btn";
      if (btnLabel) btnLabel.textContent = "APPLY EL NIÑO EFFECT";
    }
  }

  // =========================================================================
  // 2. SATELLITE BASEMAP TOGGLE (STRICTLY CLIPPED INSIDE BOUNDARY)
  // =========================================================================
  function setBasemapLayer(mapSide, layerType) {
    const targetMap = mapSide === 'left' ? mapLeft : mapRight;
    if (!targetMap) return;

    if (layerType === 'satellite') {
      const tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      if (mapSide === 'left') {
        if (!satLayerLeft) {
          satLayerLeft = L.tileLayer(tileUrl, { className: 'satellite-masked-layer', maxZoom: 18 });
        }
        satLayerLeft.addTo(targetMap);
        satLayerLeft.bringToBack();
      } else {
        if (!satLayerRight) {
          satLayerRight = L.tileLayer(tileUrl, { className: 'satellite-masked-layer', maxZoom: 18 });
        }
        satLayerRight.addTo(targetMap);
        satLayerRight.bringToBack();
      }
    } else {
      // Vector: remove satellite
      if (mapSide === 'left' && satLayerLeft) {
        targetMap.removeLayer(satLayerLeft);
      } else if (mapSide === 'right' && satLayerRight) {
        targetMap.removeLayer(satLayerRight);
      }
    }
  }

  // =========================================================================
  // 3. TIER 2: UPDATE KPI CARDS ON EL NIÑO TOGGLE
  // =========================================================================
  function updateKpiRibbon() {
    const elTdsVal = document.getElementById('kpiTdsVal');
    const elTdsComp = document.getElementById('kpiTdsComp');
    const elTdsDelta = document.getElementById('kpiTdsDelta');

    const elDepthVal = document.getElementById('kpiDepthVal');
    const elDepthComp = document.getElementById('kpiDepthComp');
    const elDepthDelta = document.getElementById('kpiDepthDelta');

    const elSewageVal = document.getElementById('kpiSewageVal');
    const elSewageComp = document.getElementById('kpiSewageComp');
    const elSewageDelta = document.getElementById('kpiSewageDelta');

    const elWardsVal = document.getElementById('kpiWardsVal');
    const elWardsComp = document.getElementById('kpiWardsComp');
    const elWardsDelta = document.getElementById('kpiWardsDelta');

    const cards = [
      document.getElementById('kpiCardSalinity'),
      document.getElementById('kpiCardDepth'),
      document.getElementById('kpiCardSewage'),
      document.getElementById('kpiCardWards')
    ];

    if (isElNinoActive) {
      // EL NIÑO ACTIVE NUMBERS
      if (elTdsVal) elTdsVal.innerHTML = `<span class="val-prev">1,550</span> <span class="val-arrow">&#10142;</span> <span class="val-active text-danger">2,940</span> <span class="kpi-unit">mg/L</span>`;
      if (elTdsComp) elTdsComp.textContent = "Expected: 1,550 mg/L • El Niño: 2,940 mg/L";
      if (elTdsDelta) {
        elTdsDelta.innerHTML = `&#9650; +89.6% Over Expected Trend`;
        elTdsDelta.className = "kpi-delta-chip delta-danger";
      }

      if (elDepthVal) elDepthVal.innerHTML = `<span class="val-prev">19.2</span> <span class="val-arrow">&#10142;</span> <span class="val-active text-danger">28.6</span> <span class="kpi-unit">m bgl</span>`;
      if (elDepthComp) elDepthComp.textContent = "Expected: 19.2m • El Niño: 28.6m bgl";
      if (elDepthDelta) {
        elDepthDelta.innerHTML = `&#9660; +48.9% Faster Depletion (-9.4m)`;
        elDepthDelta.className = "kpi-delta-chip delta-danger";
      }

      if (elSewageVal) elSewageVal.innerHTML = `<span class="val-prev">42.0%</span> <span class="val-arrow">&#10142;</span> <span class="val-active text-purple">78.4%</span> <span class="kpi-unit">Aquifer Share</span>`;
      if (elSewageComp) elSewageComp.textContent = "Expected: 42% Share • El Niño: 78.4% Share";
      if (elSewageDelta) {
        elSewageDelta.innerHTML = `&#9650; +86% Sewage Intrusion (Zero Dilution)`;
        elSewageDelta.className = "kpi-delta-chip delta-warn";
      }

      if (elWardsVal) elWardsVal.innerHTML = `<span class="val-prev">5</span> <span class="val-arrow">&#10142;</span> <span class="val-active text-danger">14</span> <span class="kpi-unit">/ 60 Wards</span>`;
      if (elWardsComp) elWardsComp.textContent = "Expected: 5 Wards • El Niño: 14 Wards Critical";
      if (elWardsDelta) {
        elWardsDelta.innerHTML = `&#9888; Tiruppur North & South Break First`;
        elWardsDelta.className = "kpi-delta-chip delta-danger";
      }

      cards.forEach(c => c?.classList.add('shock-highlight'));
    } else {
      // EXPECTED 2026 BASELINE NUMBERS
      if (elTdsVal) elTdsVal.innerHTML = `<span class="val-active" style="color: #38bdf8;">1,550</span> <span class="kpi-unit">mg/L</span>`;
      if (elTdsComp) elTdsComp.textContent = "Expected Summer '26 Historical Trend";
      if (elTdsDelta) {
        elTdsDelta.innerHTML = `&#9679; Within Permissible Ceiling (2,000 mg/L)`;
        elTdsDelta.className = "kpi-delta-chip";
      }

      if (elDepthVal) elDepthVal.innerHTML = `<span class="val-active" style="color: #38bdf8;">19.2</span> <span class="kpi-unit">m bgl</span>`;
      if (elDepthComp) elDepthComp.textContent = "Expected Summer '26 Historical Trend";
      if (elDepthDelta) {
        elDepthDelta.innerHTML = `&#9660; Normal Seasonal Drift (+0.8m drop)`;
        elDepthDelta.className = "kpi-delta-chip";
      }

      if (elSewageVal) elSewageVal.innerHTML = `<span class="val-active" style="color: #c084fc;">42.0%</span> <span class="kpi-unit">Aquifer Share</span>`;
      if (elSewageComp) elSewageComp.textContent = "Normal Monsoon Recharge Active";
      if (elSewageDelta) {
        elSewageDelta.innerHTML = `&#9679; Dilution Buffer Intact`;
        elSewageDelta.className = "kpi-delta-chip";
      }

      if (elWardsVal) elWardsVal.innerHTML = `<span class="val-active" style="color: #facc15;">5</span> <span class="kpi-unit">/ 60 Wards</span>`;
      if (elWardsComp) elWardsComp.textContent = "Localized Shallow Dug Wells Only";
      if (elWardsDelta) {
        elWardsDelta.innerHTML = `&#9679; Standard Corporation Maintenance`;
        elWardsDelta.className = "kpi-delta-chip";
      }

      cards.forEach(c => c?.classList.remove('shock-highlight'));
    }
  }

  // =========================================================================
  // 4. TIER 3: CHARTS (DIVERGENCE CURVE & PROXIMITY VS SALT SPIKE)
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
    
    // Depth in m bgl
    const expectedPath = [16.2, 12.8, 17.1, 13.5, 18.4, 19.2];
    const elNinoReality = [16.2, 12.8, 17.1, 13.5, 18.4, 28.6];

    divergenceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: "Expected '26 Past Trend (No El Niño)",
            data: expectedPath,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            tension: 0.25
          },
          {
            label: "El Niño '26 Reality Shock",
            data: elNinoReality,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.25)',
            fill: {
              target: 0,
              above: 'rgba(239, 68, 68, 0.22)' // Fills the 9.4m climate gap
            },
            borderWidth: 2.8,
            pointRadius: 5,
            pointBackgroundColor: '#ef4444',
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
              color: '#94a3b8',
              font: { size: 10, weight: '700' },
              boxWidth: 12,
              padding: 8
            }
          },
          tooltip: {
            backgroundColor: '#0d1424',
            titleColor: '#38bdf8',
            bodyColor: '#f8fafc',
            borderColor: '#2d3c54',
            borderWidth: 1,
            callbacks: {
              label: function (c) {
                return `${c.dataset.label}: ${c.raw} m bgl`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { size: 10 } }
          },
          y: {
            min: 10,
            max: 32,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: function (val) { return val + 'm'; }
            },
            title: {
              display: true,
              text: 'Depth to Water (m bgl)',
              color: '#64748b',
              font: { size: 9, weight: '700' }
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
            label: "Expected '26 Past Trend TDS",
            data: expectedTds,
            backgroundColor: '#06b6d4',
            borderRadius: 3,
            barPercentage: 0.65,
            categoryPercentage: 0.7
          },
          {
            label: "El Niño '26 Reality TDS",
            data: shockTds,
            backgroundColor: '#ef4444',
            borderRadius: 3,
            barPercentage: 0.65,
            categoryPercentage: 0.7
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
              color: '#94a3b8',
              font: { size: 10, weight: '700' },
              boxWidth: 12,
              padding: 8
            }
          },
          tooltip: {
            backgroundColor: '#0d1424',
            titleColor: '#38bdf8',
            bodyColor: '#f8fafc',
            borderColor: '#2d3c54',
            borderWidth: 1,
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
            ticks: { color: '#64748b', font: { size: 10 } },
            title: {
              display: true,
              text: 'Distance from Noyyal Sewage Corridor',
              color: '#64748b',
              font: { size: 9, weight: '700' }
            }
          },
          y: {
            min: 0,
            max: 3300,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: function (val) {
                if (val === 2000) return '2,000 (BIS Limit)';
                return val;
              }
            },
            title: {
              display: true,
              text: 'TDS Salinity (mg/L)',
              color: '#64748b',
              font: { size: 9, weight: '700' }
            }
          }
        }
      }
    });
  }

  // =========================================================================
  // 5. RANKED PRIORITY ACTION TABLE
  // =========================================================================
  function renderActionTable() {
    const tbody = document.getElementById('actionTableBody');
    const searchVal = (document.getElementById('tableSearch')?.value || '').toLowerCase().trim();
    if (!tbody) return;

    let items = [...PRIORITY_WARDS];

    if (searchVal) {
      items = items.filter(w =>
        w.ward.toLowerCase().includes(searchVal) ||
        w.locality.toLowerCase().includes(searchVal)
      );
    }

    tbody.innerHTML = '';

    items.forEach(w => {
      const tr = document.createElement('tr');
      const depthVal = isElNinoActive ? `${w.shockDepth}m (${w.drop})` : `${w.expDepth}m`;
      const tdsVal = isElNinoActive ? `${w.shockTds} (${w.tdsSurgePct})` : `${w.expTds} mg/L`;
      const statusText = isElNinoActive ? `<span class="status-badge status-critical">🔴 TEST & CAP FIRST</span>` : `<span class="status-badge status-high">MONITOR PRE-MONSOON</span>`;

      tr.innerHTML = `
        <td><span class="rank-badge">#${w.rank}</span></td>
        <td><strong style="color: #ffffff;">${w.ward}</strong><br><span style="font-size: 0.64rem; color: var(--text-dim);">${w.locality}</span></td>
        <td><span style="color: ${w.distNoyyalKm <= 1.0 ? '#ef4444' : 'inherit'}; font-weight: 700;">${w.distNoyyalKm} km</span></td>
        <td><span style="color: #f87171; font-weight: 700;">${depthVal}</span></td>
        <td><strong style="color: ${w.shockTds >= 2000 ? '#ef4444' : '#facc15'};">${tdsVal}</strong></td>
        <td>${statusText}</td>
      `;

      tr.addEventListener('click', () => {
        if (mapRight) {
          mapRight.setView([w.lat, w.lon], 13, { animate: true });
        }
        if (mapLeft) {
          mapLeft.setView([w.lat, w.lon], 13, { animate: true });
        }
      });

      tbody.appendChild(tr);
    });
  }

  // =========================================================================
  // 6. EVENT BINDINGS
  // =========================================================================
  function initEvents() {
    // 1. Bottom El Niño Trigger Button
    const btnTrigger = document.getElementById('btnElNinoTrigger');
    if (btnTrigger) {
      btnTrigger.addEventListener('click', () => {
        isElNinoActive = !isElNinoActive;
        updateRightMapDisplay();
        updateKpiRibbon();
        renderActionTable();
      });
    }

    // 2. Basemap Layer Switches (Vector vs Satellite)
    document.querySelectorAll('.basemap-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const side = btn.getAttribute('data-map');
        const layer = btn.getAttribute('data-layer');
        document.querySelectorAll(`.basemap-btn[data-map="${side}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setBasemapLayer(side, layer);
      });
    });

    // 3. Live Pitch Deck QR Dock & Modal
    const qrDock = document.getElementById('qrDockCard');
    const qrModal = document.getElementById('qrModal');
    const qrClose = document.getElementById('btnQrModalClose');

    if (qrDock && qrModal) {
      qrDock.addEventListener('click', () => {
        qrModal.showModal();
      });
    }
    if (qrClose && qrModal) {
      qrClose.addEventListener('click', () => {
        qrModal.close();
      });
    }
    if (qrModal) {
      qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) qrModal.close();
      });
    }

    // 4. Action Table Search
    document.getElementById('tableSearch')?.addEventListener('input', renderActionTable);

    // 5. Global View Mode Switcher (Pitch Deck vs Technical Dossier)
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

      setTimeout(() => {
        mapLeft?.invalidateSize();
        mapRight?.invalidateSize();
      }, 150);
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
  // 7. PRESERVED TECHNICAL DOSSIER INITIALIZER
  // =========================================================================
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
  // 8. BOOTSTRAP APP
  // =========================================================================
  function init() {
    initDualMaps();
    initCharts();
    updateKpiRibbon();
    renderActionTable();
    initEvents();

    console.log("Where Tiruppur's Water Breaks First: Isolated Dual-Map Workspace Ready.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
