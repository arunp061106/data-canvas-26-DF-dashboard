/**
 * WHERE TIRUPPUR'S WATER BREAKS FIRST
 * Executive Geospatial Pitch Deck & Technical Dossier Unified Controller
 * Inspired by: Sentiment-Scope UI
 */

(function () {
  'use strict';

  // Master State
  let currentViewMode = 'pitch'; // 'pitch' | 'dossier'
  let currentScenario = 'severe'; // 'baseline' | 'moderate' | 'severe'
  let currentMasterTab = 'tab2'; // 'tab1' (Baseline) | 'tab2' (Expected vs Shock)
  let currentSubToggle = 'shock'; // 'ghost' | 'shock' | 'delta'
  let sortColumn = 'rank';
  let sortAsc = true;

  // Map & Chart Objects
  let map = null;
  let talukGeoJsonLayer = null;
  let riverLayerGroup = null;
  let borewellLayerGroup = null;
  let divergenceChartInstance = null;
  let proximityChartInstance = null;
  let technicalDossierInitialized = false;

  // Master 14 Prioritized Wards & Borewells (Noyyal Corridor)
  const WARD_BOREWELLS = [
    {
      id: "W-15",
      ward: "Ward 15 (Agraharam)",
      locality: "Tiruppur Agraharam",
      zone: "Zone 1 (North)",
      lat: 11.1243,
      lon: 77.4157,
      distNoyyalKm: 0.35,
      baseDepth: 11.1,
      baseTds: 1217,
      modDrop: 4.8,
      modTds: 2150,
      sevDrop: 7.6,
      sevTds: 2840,
      rank: 1,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Direct 350m Noyyal buffer; acute sewage seepage upon water table drop."
    },
    {
      id: "W-34",
      ward: "Ward 34 (Weekly Market)",
      locality: "Weekly Market / South Bank",
      zone: "Zone 2 (Central)",
      lat: 11.0882,
      lon: 77.3431,
      distNoyyalKm: 0.42,
      baseDepth: 5.8,
      baseTds: 1380,
      modDrop: 3.9,
      modTds: 2090,
      sevDrop: 6.2,
      sevTds: 2750,
      rank: 2,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Dense textile market core; unlined storm drains feed sewage leachate."
    },
    {
      id: "W-28",
      ward: "Ward 28 (Central Textile)",
      locality: "Kumaran Road / Central",
      zone: "Zone 2 (Central)",
      lat: 11.1078,
      lon: 77.3542,
      distNoyyalKm: 0.55,
      baseDepth: 7.6,
      baseTds: 1410,
      modDrop: 4.2,
      modTds: 2210,
      sevDrop: 6.8,
      sevTds: 2820,
      rank: 3,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "High domestic discharge volume; historic subsurface sludge accumulation."
    },
    {
      id: "W-22",
      ward: "Ward 22 (Kasipalayam)",
      locality: "Kasipalayam East",
      zone: "Zone 2 (East)",
      lat: 11.1156,
      lon: 77.3857,
      distNoyyalKm: 0.70,
      baseDepth: 8.7,
      baseTds: 1290,
      modDrop: 4.5,
      modTds: 1980,
      sevDrop: 7.1,
      sevTds: 2690,
      rank: 4,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Downstream percolation cone; domestic runoff mixes with crystalline recharge."
    },
    {
      id: "W-52",
      ward: "Ward 52 (Veerapandi)",
      locality: "Veerapandi West",
      zone: "Zone 3 (South)",
      lat: 11.0721,
      lon: 77.3612,
      distNoyyalKm: 0.85,
      baseDepth: 9.2,
      baseTds: 1340,
      modDrop: 4.1,
      modTds: 1920,
      sevDrop: 6.5,
      sevTds: 2580,
      rank: 5,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Rapid peri-urban growth without septic sewage connections."
    },
    {
      id: "W-41",
      ward: "Ward 41 (Nallur)",
      locality: "Nallur Corridor",
      zone: "Zone 3 (Southeast)",
      lat: 11.0845,
      lon: 77.3814,
      distNoyyalKm: 0.95,
      baseDepth: 10.4,
      baseTds: 1260,
      modDrop: 4.6,
      modTds: 1890,
      sevDrop: 7.3,
      sevTds: 2510,
      rank: 6,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Critical 1km buffer limit; aquifer transition from weathered to hard gneiss."
    },
    {
      id: "W-08",
      ward: "Ward 8 (Vellampalayam)",
      locality: "15 Velampalayam",
      zone: "Zone 1 (Northwest)",
      lat: 11.1412,
      lon: 77.3289,
      distNoyyalKm: 1.15,
      baseDepth: 12.3,
      baseTds: 1180,
      modDrop: 5.1,
      modTds: 1810,
      sevDrop: 7.9,
      sevTds: 2420,
      rank: 7,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Dense worker housing density; shallow dug wells dry out earliest."
    },
    {
      id: "W-19",
      ward: "Ward 19 (Mannarai)",
      locality: "Mannarai North",
      zone: "Zone 1 (North)",
      lat: 11.1354,
      lon: 77.3621,
      distNoyyalKm: 1.30,
      baseDepth: 13.8,
      baseTds: 1120,
      modDrop: 5.4,
      modTds: 1750,
      sevDrop: 8.4,
      sevTds: 2360,
      rank: 8,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Hard rock fissure recharge rate drops >50% during dry conditions."
    },
    {
      id: "W-46",
      ward: "Ward 46 (Chettipalayam)",
      locality: "Chettipalayam Road",
      zone: "Zone 4 (South)",
      lat: 11.0610,
      lon: 77.3488,
      distNoyyalKm: 1.45,
      baseDepth: 14.2,
      baseTds: 1090,
      modDrop: 5.2,
      modTds: 1680,
      sevDrop: 8.1,
      sevTds: 2280,
      rank: 9,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Transition zone between agricultural extraction and urban domestic stress."
    },
    {
      id: "W-03",
      ward: "Ward 3 (Poopunagar)",
      locality: "Poopunagar North",
      zone: "Zone 1 (Far North)",
      lat: 11.1589,
      lon: 77.3412,
      distNoyyalKm: 1.65,
      baseDepth: 15.6,
      baseTds: 1040,
      modDrop: 5.6,
      modTds: 1620,
      sevDrop: 8.8,
      sevTds: 2190,
      rank: 10,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Borewells over 150m depth show accelerating fluoride and TDS concentrations."
    },
    {
      id: "W-58",
      ward: "Ward 58 (Andipalayam)",
      locality: "Andipalayam Lake Belt",
      zone: "Zone 4 (Southwest)",
      lat: 11.0543,
      lon: 77.3210,
      distNoyyalKm: 1.80,
      baseDepth: 16.9,
      baseTds: 1010,
      modDrop: 5.9,
      modTds: 1580,
      sevDrop: 9.2,
      sevTds: 2120,
      rank: 11,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Lake bed dries up completely during El Niño; artificial recharge halts."
    },
    {
      id: "W-NP",
      ward: "Nachipalayam Telemetry Node",
      locality: "Nachipalayam1_1 Piezometer",
      zone: "West Corridor (WRIS)",
      lat: 11.0267,
      lon: 77.3344,
      distNoyyalKm: 1.95,
      baseDepth: 20.4,
      baseTds: 980,
      modDrop: 6.8,
      modTds: 1720,
      sevDrop: 11.5,
      sevTds: 2490,
      rank: 12,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Historic reservoir backwater salinity zone; deep fractured rock drawdown."
    },
    {
      id: "W-PL",
      ward: "Palladam Border (Pallapalayam)",
      locality: "Pallapalayam Pz",
      zone: "Southwest Sector",
      lat: 10.5256,
      lon: 77.2181,
      distNoyyalKm: 2.40,
      baseDepth: 84.7,
      baseTds: 720,
      modDrop: 8.2,
      modTds: 1240,
      sevDrop: 14.5,
      sevTds: 1850,
      rank: 13,
      actionBase: "HIGH",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Extreme structural drawdown depth (84.7m bgl); critical yield collapse risk."
    },
    {
      id: "W-PY",
      ward: "Periyapatti Sector",
      locality: "Periyapatti Dug Well",
      zone: "South Sector",
      lat: 10.7583,
      lon: 77.2708,
      distNoyyalKm: 2.80,
      baseDepth: 11.7,
      baseTds: 1310,
      modDrop: 3.5,
      modTds: 1820,
      sevDrop: 6.4,
      sevTds: 2420,
      rank: 14,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Post-monsoon TDS surged to 1,310 mg/L; second-tier priority node."
    }
  ];

  // Noyyal River Corridor Polyline Coordinates (Avinashi through Tiruppur to Kangayam)
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

  // Scenario Metric Definitions (Tier 2 KPIs)
  const SCENARIOS = {
    baseline: {
      depthVal: "18.4",
      depthComp: "Summer '25 Baseline Pre-Monsoon Level",
      depthDelta: "<span class='kpi-delta-chip'>Historical Steady Mean</span>",
      tdsVal: "1,450",
      tdsComp: "Permissible Drinking Threshold Limit",
      tdsDelta: "<span class='kpi-delta-chip'>Within BIS 2,000 Limit</span>",
      wardsVal: "5 / 60",
      wardsComp: "Low Buffer Alert Wards",
      wardsDelta: "<span class='kpi-delta-chip delta-warn'>Local Leachate Pockets</span>",
      sewageVal: "42%",
      sewageComp: "Dry Season Dilution Buffer",
      sewageDelta: "<span class='kpi-delta-chip'>Open Seepage via Runoff</span>"
    },
    moderate: {
      depthVal: "23.2",
      depthComp: "Expected '26: 18.4 m &bull; El Niño: 23.2 m",
      depthDelta: "<span class='kpi-delta-chip delta-warn'>&#9660; -4.8m depletion (+26%)</span>",
      tdsVal: "2,180",
      tdsComp: "Expected '26: 1,450 mg/L &bull; El Niño: 2,180 mg/L",
      tdsDelta: "<span class='kpi-delta-chip delta-warn'>&#9650; +50% surge (Exceeds BIS)</span>",
      wardsVal: "9 / 60",
      wardsComp: "Expected '26: 5 Wards &bull; El Niño: 9 Wards",
      wardsDelta: "<span class='kpi-delta-chip delta-warn'>&#9888; High Risk Intrusion Belt</span>",
      sewageVal: "55%",
      sewageComp: "Expected '26: 42% &bull; El Niño: 55%",
      sewageDelta: "<span class='kpi-delta-chip delta-warn'>&#9889; Dilution loss in 1.5km buffer</span>"
    },
    severe: {
      depthVal: "27.8",
      depthComp: "Expected '26: 18.4 m &bull; El Niño Shock: 27.8 m",
      depthDelta: "<span class='kpi-delta-chip delta-danger'>&#9660; -9.4m (+51% deeper depletion)</span>",
      tdsVal: "2,890",
      tdsComp: "Expected '26: 1,450 mg/L &bull; El Niño Shock: 2,890 mg/L",
      tdsDelta: "<span class='kpi-delta-chip delta-danger'>&#9650; +99% Salinity Spike (Exceeds BIS)</span>",
      wardsVal: "14 / 60",
      wardsComp: "Expected '26: 5 Wards &bull; El Niño Shock: 14 Wards",
      wardsDelta: "<span class='kpi-delta-chip delta-warn'>&#9888; 70% clustered in 1.5km Noyyal belt</span>",
      sewageVal: "68%",
      sewageComp: "Expected '26: 42% &bull; El Niño Shock: 68%",
      sewageDelta: "<span class='kpi-delta-chip delta-warn'>&#9889; Zero rain dilution (&gt;35% deficit)</span>"
    }
  };

  // =========================================================================
  // 1. INITIALIZE LEAFLET MAP & GEOJSON TALUKS
  // =========================================================================
  function initMap() {
    const mapEl = document.getElementById('leafletMap');
    if (!mapEl) return;

    // Centered on Tiruppur District (upright North)
    map = L.map('leafletMap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([10.92, 77.42], 10);

    // Standard OpenStreetMap Tiles (100% reliable, zero API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // River Layer Group
    riverLayerGroup = L.layerGroup().addTo(map);
    drawNoyyalVector();

    // Taluks GeoJSON Layer Group
    renderTaluksLayer();

    // Borewell Overlay Layer Group
    borewellLayerGroup = L.layerGroup().addTo(map);
    updateBorewellMarkers();
  }

  function drawNoyyalVector() {
    riverLayerGroup.clearLayers();

    // 2km Secondary Buffer Band
    L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#f59e0b',
      weight: 38,
      opacity: 0.12,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(riverLayerGroup);

    // 1km Critical Leachate Buffer Band
    L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#ef4444',
      weight: 20,
      opacity: 0.22,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(riverLayerGroup);

    // Main Noyyal River Line
    const riverLine = L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#06b6d4',
      weight: 4,
      opacity: 0.95
    }).addTo(riverLayerGroup);

    riverLine.bindTooltip("Noyyal River Corridor (Sewage Contamination Vector)", {
      direction: 'top',
      className: 'river-tooltip'
    });
  }

  function getTalukStyle(feature) {
    const p = feature.properties;

    // If Tab 1: Historical Baseline
    if (currentMasterTab === 'tab1') {
      let fillColor = '#10b981';
      if (p.baseline_25_depth > 20) fillColor = '#f59e0b';
      else if (p.baseline_25_depth > 16) fillColor = '#06b6d4';
      return {
        fillColor: fillColor,
        weight: 1.5,
        opacity: 0.8,
        color: '#38bdf8',
        fillOpacity: 0.45,
        className: ''
      };
    }

    // Tab 2: Sub-Toggles
    if (currentSubToggle === 'ghost') {
      // Expected '26 Trend (Gentle historical path)
      return {
        fillColor: '#f59e0b',
        weight: 1.5,
        opacity: 0.75,
        color: '#facc15',
        dashArray: '4, 4',
        fillOpacity: 0.35,
        className: ''
      };
    } else if (currentSubToggle === 'shock') {
      // Live Shock: El Niño '26 Reality
      const isCritical = p.critical_flag; // Tiruppur North, South, Uthukkuli, Kangayam
      return {
        fillColor: isCritical ? '#ef4444' : '#f97316',
        weight: isCritical ? 2.5 : 1.5,
        opacity: 0.95,
        color: isCritical ? '#ff1a53' : '#fb923c',
        fillOpacity: isCritical ? 0.65 : 0.45,
        className: isCritical ? 'pulse-shock-corridor' : ''
      };
    } else {
      // Net Anomaly Delta (Delta Drop & TDS Spike)
      const isCritical = p.critical_flag;
      return {
        fillColor: isCritical ? '#ec4899' : '#a855f7',
        weight: isCritical ? 3.0 : 1.5,
        opacity: 0.95,
        color: isCritical ? '#f43f5e' : '#c084fc',
        fillOpacity: isCritical ? 0.70 : 0.45,
        className: isCritical ? 'pulse-anomaly-corridor' : ''
      };
    }
  }

  function renderTaluksLayer() {
    if (talukGeoJsonLayer) {
      map.removeLayer(talukGeoJsonLayer);
    }

    if (!window.TIRUPPUR_TALUKS_GEOJSON) return;

    talukGeoJsonLayer = L.geoJSON(window.TIRUPPUR_TALUKS_GEOJSON, {
      style: getTalukStyle,
      onEachFeature: function (feature, layer) {
        const p = feature.properties;

        // Mouse hover inspector trigger
        layer.on('mouseover', function (e) {
          updateHoverInspector({
            title: `${p.name} Taluk (${p.area_sq_km} sq.km)`,
            baseDepth: `${p.baseline_25_depth} m bgl`,
            shockDepth: `${p.el_nino_26_depth} m bgl`,
            tds: `${p.el_nino_26_tds} mg/L (+${p.anomaly_tds_pct}%)`,
            anomaly: `${p.anomaly_depth}m drop &bull; ${p.critical_flag ? 'CRITICAL NOYYAL BELT' : 'PERIPHERAL'}`,
            footer: `Firkas: ${p.firkas}`
          });
          layer.bringToFront();
          if (borewellLayerGroup) borewellLayerGroup.bringToFront();
        });

        layer.on('click', function () {
          map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 12 });
        });
      }
    }).addTo(map);
  }

  function updateHoverInspector(data) {
    const elTitle = document.getElementById('hoverTitle');
    const elBase = document.getElementById('hoverBaseDepth');
    const elShock = document.getElementById('hoverShockDepth');
    const elTds = document.getElementById('hoverTds');
    const elAnom = document.getElementById('hoverAnomaly');
    const elFoot = document.getElementById('hoverFooter');

    if (elTitle) elTitle.textContent = data.title;
    if (elBase) elBase.textContent = data.baseDepth;
    if (elShock) elShock.textContent = data.shockDepth;
    if (elTds) elTds.textContent = data.tds;
    if (elAnom) elAnom.innerHTML = data.anomaly;
    if (elFoot) elFoot.textContent = data.footer;
  }

  function getNodeData(st) {
    if (currentMasterTab === 'tab1' || currentScenario === 'baseline') {
      return {
        depth: st.baseDepth,
        tds: st.baseTds,
        action: st.actionBase,
        isProjected: false
      };
    } else if (currentScenario === 'moderate') {
      return {
        depth: +(st.baseDepth + st.modDrop).toFixed(1),
        tds: st.modTds,
        action: st.actionMod,
        isProjected: true
      };
    } else {
      // severe
      return {
        depth: +(st.baseDepth + st.sevDrop).toFixed(1),
        tds: st.sevTds,
        action: st.actionSev,
        isProjected: true
      };
    }
  }

  function updateBorewellMarkers() {
    if (!borewellLayerGroup) return;
    borewellLayerGroup.clearLayers();

    WARD_BOREWELLS.forEach(st => {
      const live = getNodeData(st);

      let color = '#10b981'; // Green
      let radius = 6;

      if (live.action.includes('CRITICAL')) {
        color = '#ef4444'; // Red
        radius = 8;
      } else if (live.action.includes('HIGH')) {
        color = '#f97316'; // Orange
        radius = 7;
      } else if (live.tds >= 1200 || st.distNoyyalKm <= 1.0) {
        color = '#eab308'; // Yellow
        radius = 6;
      }

      const marker = L.circleMarker([st.lat, st.lon], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.85
      });

      const popupHtml = `
        <div style="font-size: 0.75rem; line-height: 1.35; min-width: 190px;">
          <div style="font-weight: 800; font-size: 0.85rem; color: #38bdf8; margin-bottom: 0.2rem;">${st.ward}</div>
          <div style="color: #94a3b8; margin-bottom: 0.4rem;">${st.locality} &bull; ${st.distNoyyalKm} km to Noyyal</div>
          <div style="background: rgba(255,255,255,0.06); padding: 0.35rem 0.5rem; border-radius: 4px; margin-bottom: 0.4rem;">
            <div><strong>2025 Level:</strong> ${st.baseDepth} m bgl</div>
            <div><strong>2026 Shock:</strong> ${live.depth} m bgl</div>
            <div><strong>TDS Salinity:</strong> ${live.tds} mg/L</div>
          </div>
          <div style="font-weight: 800; color: ${color};">
            Priority Rank #${st.rank} &bull; ${live.action}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('mouseover', function () {
        updateHoverInspector({
          title: `Rank #${st.rank}: ${st.ward}`,
          baseDepth: `${st.baseDepth} m bgl`,
          shockDepth: `${live.depth} m bgl`,
          tds: `${live.tds} mg/L (${st.distNoyyalKm}km to Noyyal)`,
          anomaly: `${live.action}`,
          footer: `${st.rationale}`
        });
      });

      marker.wardId = st.id;
      marker.addTo(borewellLayerGroup);
    });
  }

  // =========================================================================
  // 2. TIER 2: UPDATE KPI CARDS
  // =========================================================================
  function updateKpiRibbon() {
    const scen = SCENARIOS[currentScenario];
    if (!scen) return;

    const elDepth = document.getElementById('kpiDepthVal');
    const elDepthComp = document.getElementById('kpiDepthComp');
    const elDepthDelta = document.getElementById('kpiDepthDelta');

    const elTds = document.getElementById('kpiTdsVal');
    const elTdsComp = document.getElementById('kpiTdsComp');
    const elTdsDelta = document.getElementById('kpiTdsDelta');

    const elWards = document.getElementById('kpiWardsVal');
    const elWardsComp = document.getElementById('kpiWardsComp');
    const elWardsDelta = document.getElementById('kpiWardsDelta');

    const elSewage = document.getElementById('kpiSewageVal');
    const elSewageComp = document.getElementById('kpiSewageComp');
    const elSewageDelta = document.getElementById('kpiSewageDelta');

    if (elDepth) elDepth.innerHTML = `${scen.depthVal} <span class="kpi-unit">m bgl</span>`;
    if (elDepthComp) elDepthComp.innerHTML = scen.depthComp;
    if (elDepthDelta) elDepthDelta.innerHTML = scen.depthDelta;

    if (elTds) elTds.innerHTML = `${scen.tdsVal} <span class="kpi-unit">mg/L</span>`;
    if (elTdsComp) elTdsComp.innerHTML = scen.tdsComp;
    if (elTdsDelta) elTdsDelta.innerHTML = scen.tdsDelta;

    if (elWards) elWards.innerHTML = `${scen.wardsVal} <span class="kpi-unit">Wards</span>`;
    if (elWardsComp) elWardsComp.innerHTML = scen.wardsComp;
    if (elWardsDelta) elWardsDelta.innerHTML = scen.wardsDelta;

    if (elSewage) elSewage.innerHTML = `${scen.sewageVal} <span class="kpi-unit">Risk</span>`;
    if (elSewageComp) elSewageComp.innerHTML = scen.sewageComp;
    if (elSewageDelta) elSewageDelta.innerHTML = scen.sewageDelta;
  }

  // =========================================================================
  // 3. TIER 3: CHARTS (DIVERGENCE CURVE & NOYYAL PROXIMITY)
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

    const labels = ["Summer '23", "Winter '23", "Summer '24", "Winter '24", "Summer '25", "Summer '26 (El Niño)"];
    
    // Water level depth in m bgl (higher value = deeper water table)
    const expectedPath = [16.2, 12.8, 17.1, 13.5, 17.8, 18.4];
    const elNinoReality = [16.2, 12.8, 17.1, 13.5, 18.4, 27.8];

    divergenceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: "Expected Historical Path (No El Niño)",
            data: expectedPath,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 4,
            pointBackgroundColor: '#38bdf8',
            tension: 0.3
          },
          {
            label: "El Niño Reality Shock Path",
            data: elNinoReality,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.22)',
            fill: {
              target: 0,
              above: 'rgba(239, 68, 68, 0.22)' // Fill the gap between Expected & Shock
            },
            borderWidth: 2.5,
            pointRadius: 5,
            pointBackgroundColor: '#ef4444',
            tension: 0.3
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
            backgroundColor: '#0f172a',
            titleColor: '#38bdf8',
            bodyColor: '#f8fafc',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.raw} m bgl`;
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
            // Depict depth from 5m to 32m
            min: 5,
            max: 32,
            reverse: false,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: function (val) {
                return val + 'm';
              }
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
    const baselineTds = [1217, 1290, 1180, 950];
    const shockTds = [2840, 2420, 1740, 1120];

    proximityChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: "Summer 2025 Baseline TDS",
            data: baselineTds,
            backgroundColor: '#06b6d4',
            borderRadius: 3,
            borderWidth: 0,
            barPercentage: 0.65,
            categoryPercentage: 0.7
          },
          {
            label: "Summer 2026 Shock TDS",
            data: shockTds,
            backgroundColor: '#ef4444',
            borderRadius: 3,
            borderWidth: 0,
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
            backgroundColor: '#0f172a',
            titleColor: '#38bdf8',
            bodyColor: '#f8fafc',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.raw} mg/L`;
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
              text: 'Distance from Noyyal Riverbed',
              color: '#64748b',
              font: { size: 9, weight: '700' }
            }
          },
          y: {
            min: 0,
            max: 3200,
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
  // 4. TIER 3: RANKED ACTION TABLE
  // =========================================================================
  function renderActionTable() {
    const tbody = document.getElementById('actionTableBody');
    const searchVal = (document.getElementById('tableSearch')?.value || '').toLowerCase().trim();
    if (!tbody) return;

    let items = [...WARD_BOREWELLS];

    // Filter
    if (searchVal) {
      items = items.filter(st =>
        st.ward.toLowerCase().includes(searchVal) ||
        st.locality.toLowerCase().includes(searchVal) ||
        st.zone.toLowerCase().includes(searchVal)
      );
    }

    // Sort
    items.sort((a, b) => {
      let valA, valB;
      const liveA = getNodeData(a);
      const liveB = getNodeData(b);

      if (sortColumn === 'rank') { valA = a.rank; valB = b.rank; }
      else if (sortColumn === 'ward') { valA = a.ward; valB = b.ward; }
      else if (sortColumn === 'dist') { valA = a.distNoyyalKm; valB = b.distNoyyalKm; }
      else if (sortColumn === 'drop') { valA = currentScenario === 'severe' ? a.sevDrop : a.modDrop; valB = currentScenario === 'severe' ? b.sevDrop : b.modDrop; }
      else if (sortColumn === 'tds') { valA = liveA.tds; valB = liveB.tds; }
      else { valA = a.rank; valB = b.rank; }

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    tbody.innerHTML = '';

    items.forEach(st => {
      const live = getNodeData(st);
      const tr = document.createElement('tr');

      const dropDisplay = currentScenario === 'baseline' ? '0.0 m' : (currentScenario === 'moderate' ? `-${st.modDrop}m` : `-${st.sevDrop}m`);

      let badgeClass = 'status-moderate';
      if (live.action.includes('CRITICAL')) badgeClass = 'status-critical';
      else if (live.action.includes('HIGH')) badgeClass = 'status-high';

      tr.innerHTML = `
        <td><span class="rank-badge">#${st.rank}</span></td>
        <td><strong style="color: #ffffff;">${st.ward}</strong><br><span style="font-size: 0.65rem; color: var(--text-dim);">${st.zone}</span></td>
        <td><span style="color: ${st.distNoyyalKm <= 1.0 ? '#ef4444' : 'inherit'}; font-weight: 700;">${st.distNoyyalKm} km</span></td>
        <td><span style="color: #f87171; font-weight: 700;">${dropDisplay}</span></td>
        <td><strong style="color: ${live.tds >= 2000 ? '#ef4444' : '#facc15'};">${live.tds}</strong></td>
        <td><span class="status-badge ${badgeClass}">${live.action}</span></td>
      `;

      tr.addEventListener('click', () => {
        if (map) {
          map.setView([st.lat, st.lon], 14, { animate: true });
          borewellLayerGroup.eachLayer(layer => {
            if (layer.wardId === st.id) {
              layer.openPopup();
            }
          });
        }
      });

      tbody.appendChild(tr);
    });
  }

  // =========================================================================
  // 5. VIEW MODE CONTROLLER & EVENT LISTENERS
  // =========================================================================
  function setScenario(scenKey) {
    currentScenario = scenKey;
    updateKpiRibbon();
    updateBorewellMarkers();
    renderActionTable();
  }

  function setMasterTab(tabKey) {
    currentMasterTab = tabKey;
    const btnTab1 = document.getElementById('btnMasterTab1');
    const btnTab2 = document.getElementById('btnMasterTab2');
    const subWrap = document.getElementById('mapSubToggles');

    if (tabKey === 'tab1') {
      btnTab1?.classList.add('active');
      btnTab1?.setAttribute('aria-selected', 'true');
      btnTab2?.classList.remove('active');
      btnTab2?.setAttribute('aria-selected', 'false');
      if (subWrap) subWrap.style.opacity = '0.35';
      setScenario('baseline');
    } else {
      btnTab2?.classList.add('active');
      btnTab2?.setAttribute('aria-selected', 'true');
      btnTab1?.classList.remove('active');
      btnTab1?.setAttribute('aria-selected', 'false');
      if (subWrap) subWrap.style.opacity = '1';
      setScenario('severe');
    }

    renderTaluksLayer();
  }

  function setSubToggle(subKey) {
    currentSubToggle = subKey;
    const subBtns = document.querySelectorAll('.sub-toggle-btn');
    subBtns.forEach(btn => {
      if (btn.getAttribute('data-sub') === subKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderTaluksLayer();
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
      btnPitch?.setAttribute('aria-pressed', 'true');
      btnDossier?.classList.remove('active');
      btnDossier?.setAttribute('aria-pressed', 'false');

      if (map) {
        setTimeout(() => { map.invalidateSize(); }, 150);
      }
    } else {
      pitchView.style.display = 'none';
      dossierView.style.display = 'block';
      btnDossier?.classList.add('active');
      btnDossier?.setAttribute('aria-pressed', 'true');
      btnPitch?.classList.remove('active');
      btnPitch?.setAttribute('aria-pressed', 'false');

      // Initialize technical dossier if first time viewing
      if (!technicalDossierInitialized) {
        technicalDossierInitialized = true;
        initTechnicalDossier();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function initEvents() {
    // Top View Mode Switcher
    document.getElementById('btnModePitch')?.addEventListener('click', () => switchViewMode('pitch'));
    document.getElementById('btnModeDossier')?.addEventListener('click', () => switchViewMode('dossier'));
    document.getElementById('btnBackToPitch')?.addEventListener('click', () => switchViewMode('pitch'));

    // Master Tabs on Map
    document.getElementById('btnMasterTab1')?.addEventListener('click', () => setMasterTab('tab1'));
    document.getElementById('btnMasterTab2')?.addEventListener('click', () => setMasterTab('tab2'));

    // Sub-Toggles on Map
    document.querySelectorAll('.sub-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setSubToggle(btn.getAttribute('data-sub'));
      });
    });

    // Extent Pills
    document.getElementById('btnExtentDistrict')?.addEventListener('click', (e) => {
      document.querySelectorAll('.extent-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      map?.setView([10.92, 77.42], 10, { animate: true });
    });

    document.getElementById('btnExtentCity')?.addEventListener('click', (e) => {
      document.querySelectorAll('.extent-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      map?.setView([11.1085, 77.3800], 12, { animate: true });
    });

    // Scenario Controller Segmented Buttons
    const scenBtns = document.querySelectorAll('.scenario-btn');
    scenBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scenBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        setScenario(btn.getAttribute('data-scenario'));
      });
    });

    // Action Table Search
    document.getElementById('tableSearch')?.addEventListener('input', () => {
      renderActionTable();
    });

    // Action Table Header Sort
    document.querySelectorAll('#actionTable th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-col');
        if (sortColumn === col) {
          sortAsc = !sortAsc;
        } else {
          sortColumn = col;
          sortAsc = true;
        }
        renderActionTable();
      });
    });
  }

  // =========================================================================
  // 6. TECHNICAL DOSSIER INITIALIZER (PRESERVED COMPLETE SCIENCE DOSSIER)
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
  // 7. INITIALIZE APPLICATION
  // =========================================================================
  function init() {
    initMap();
    initCharts();
    updateKpiRibbon();
    renderActionTable();
    initEvents();

    console.log("Where Tiruppur's Water Breaks First: Pitch Deck UI Ready.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
