/**
 * WHERE TIRUPPUR'S WATER BREAKS FIRST
 * Executive Geospatial Analytics & Pitch Deck Controller
 */

(function () {
  'use strict';

  // Scenario Model State
  let currentScenario = 'baseline'; // 'baseline' | 'moderate' | 'severe'
  let currentMapView = 'viewA';    // 'viewA' (2025 Baseline) | 'viewB' (2026 Projected)
  let sortColumn = 'rank';
  let sortAsc = true;
  let map = null;
  let borewellLayerGroup = null;
  let riverLayerGroup = null;
  let activeMarker = null;

  // Master Ward & Borewell Dataset (Tiruppur Corporation & Noyyal Corridor)
  const WARD_BOREWELLS = [
    {
      id: "W-15",
      ward: "Ward 15 (Agraharam)",
      locality: "Tiruppur Agraharam",
      zone: "Zone 1 (North)",
      lat: 11.1243,
      lon: 77.4157,
      distNoyyalKm: 0.35,
      // Baseline 2025
      baseDepth: 11.1,
      baseTds: 1217,
      // Moderate El Niño 2026
      modDrop: 4.8,
      modTds: 2150,
      // Severe El Niño 2026
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
      rationale: "Noyyal flood plain depression; high suction gradient during dry spell."
    },
    {
      id: "W-52",
      ward: "Ward 52 (Nachipalayam)",
      locality: "Nachipalayam Downstream",
      zone: "Zone 4 (East Downstream)",
      lat: 11.0855,
      lon: 77.4438,
      distNoyyalKm: 0.85,
      baseDepth: 6.9,
      baseTds: 1709,
      modDrop: 5.1,
      modTds: 2450,
      sevDrop: 8.4,
      sevTds: 3120,
      rank: 5,
      actionBase: "CRITICAL: Test & Cap",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Downstream confluence; TDS already exceeds 1,700 mg/L before El Niño."
    },
    {
      id: "W-41",
      ward: "Ward 41 (Veerapandi / Odakadu)",
      locality: "Odakadu Textile Belt",
      zone: "Zone 3 (South)",
      lat: 11.1118,
      lon: 77.3344,
      distNoyyalKm: 0.95,
      baseDepth: 7.2,
      baseTds: 1180,
      modDrop: 3.8,
      modTds: 1850,
      sevDrop: 6.0,
      sevTds: 2480,
      rank: 6,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Deep unconfined aquifer; domestic sewage mixing with bleaching runoff."
    },
    {
      id: "W-UT",
      ward: "Uthukuli Corridor (Arugampalayam)",
      locality: "Arugampalayam Sector",
      zone: "Noyyal East Buffer",
      lat: 11.1247,
      lon: 77.4644,
      distNoyyalKm: 1.10,
      baseDepth: 8.8,
      baseTds: 2789,
      modDrop: 5.8,
      modTds: 3450,
      sevDrop: 9.2,
      sevTds: 4180,
      rank: 7,
      actionBase: "CRITICAL: Test & Cap",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Highest baseline salinity in district (TDS 2,789 mg/L); hypersaline vector."
    },
    {
      id: "W-19",
      ward: "Ward 19 (Kovilvazhi)",
      locality: "Kovilvazhi Industrial",
      zone: "Zone 3 (South East)",
      lat: 11.0582,
      lon: 77.3877,
      distNoyyalKm: 1.25,
      baseDepth: 7.0,
      baseTds: 898,
      modDrop: 3.2,
      modTds: 1520,
      sevDrop: 5.4,
      sevTds: 2190,
      rank: 8,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Rapid draw-down during summer; pulls from peripheral wastewater channels."
    },
    {
      id: "W-12",
      ward: "Ward 12 (P.N. Road)",
      locality: "P.N. Road / North Hub",
      zone: "Zone 1 (North)",
      lat: 11.1191,
      lon: 77.3399,
      distNoyyalKm: 1.40,
      baseDepth: 3.8,
      baseTds: 950,
      modDrop: 2.9,
      modTds: 1480,
      sevDrop: 4.8,
      sevTds: 2080,
      rank: 9,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "High residential borewell density; drawdown triggers cone of depression."
    },
    {
      id: "W-48",
      ward: "Ward 48 (Nagalapuram)",
      locality: "Nagalapuram Pz",
      zone: "Zone 3 (South)",
      lat: 11.0756,
      lon: 77.3628,
      distNoyyalKm: 1.60,
      baseDepth: 9.4,
      baseTds: 870,
      modDrop: 3.1,
      modTds: 1380,
      sevDrop: 5.2,
      sevTds: 1990,
      rank: 10,
      actionBase: "MODERATE",
      actionMod: "HIGH: Monitor Weekly",
      actionSev: "HIGH: Monitor Weekly",
      rationale: "Secondary buffer boundary; moderate sewage infiltration."
    },
    {
      id: "W-GP",
      ward: "Dharapuram Buffer (Ganapathipalayam)",
      locality: "Ganapathipalayam",
      zone: "South East Corridor",
      lat: 10.7681,
      lon: 77.6547,
      distNoyyalKm: 1.85,
      baseDepth: 23.2,
      baseTds: 920,
      modDrop: 7.5,
      modTds: 1650,
      sevDrop: 12.8,
      sevTds: 2350,
      rank: 11,
      actionBase: "HIGH",
      actionMod: "CRITICAL: Test & Cap",
      actionSev: "CRITICAL: Test & Cap",
      rationale: "Severe deep aquifer drawdown (23.2m); acute El Niño drought vulnerability."
    },
    {
      id: "W-OP",
      ward: "Orathupalayam Upstream (Oothukadu)",
      locality: "Oothukadu Reservoir Buffer",
      zone: "East Reservoir Zone",
      lat: 11.1119,
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

  // Noyyal River Geometry across Tiruppur Corporation
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

  // Scenario Metric Definitions
  const SCENARIOS = {
    baseline: {
      depthVal: "18.4 <span style='font-size: 0.95rem; font-weight: 500;'>m bgl</span>",
      depthDelta: "Summer '25 Pre-Monsoon Baseline",
      tdsVal: "1,450 <span style='font-size: 0.95rem; font-weight: 500;'>mg/L</span>",
      tdsDelta: "Permissible Drinking Ceiling",
      wardsVal: "5 / 60 <span style='font-size: 0.95rem; font-weight: 500;'>Wards</span>",
      wardsDelta: "<span class='delta-warn'>Low Buffer Alert</span>",
      sewageVal: "42% <span style='font-size: 0.95rem; font-weight: 500;'>Risk</span>",
      sewageDelta: "Open Seepage Gap via Municipal Runoff"
    },
    moderate: {
      depthVal: "23.2 <span style='font-size: 0.95rem; font-weight: 500;'>m bgl</span>",
      depthDelta: "<span class='delta-warn'>&#9660; -4.8m depletion</span>",
      tdsVal: "2,180 <span style='font-size: 0.95rem; font-weight: 500;'>mg/L</span>",
      tdsDelta: "<span class='delta-warn'>&#9650; +50% surge (Exceeds BIS)</span>",
      wardsVal: "9 / 60 <span style='font-size: 0.95rem; font-weight: 500;'>Wards</span>",
      wardsDelta: "<span class='delta-warn'>High Risk Intrusion Belt</span>",
      sewageVal: "55% <span style='font-size: 0.95rem; font-weight: 500;'>Risk</span>",
      sewageDelta: "<span class='delta-warn'>Dilution Loss in 1.5km Buffer</span>"
    },
    severe: {
      depthVal: "27.8 <span style='font-size: 0.95rem; font-weight: 500;'>m bgl</span>",
      depthDelta: "<span class='delta-danger'>&#9660; -9.4m depletion</span>",
      tdsVal: "2,890 <span style='font-size: 0.95rem; font-weight: 500;'>mg/L</span>",
      tdsDelta: "<span class='delta-danger'>&#9650; +99% spike (Hazardous)</span>",
      wardsVal: "14 / 60 <span style='font-size: 0.95rem; font-weight: 500;'>Wards</span>",
      wardsDelta: "<span class='delta-danger'>Critical Depletion + Sewage Intrusion</span>",
      sewageVal: "68% <span style='font-size: 0.95rem; font-weight: 500;'>Risk</span>",
      sewageDelta: "<span class='delta-danger'>Aquifer Seepage Risk along Noyyal Buffer</span>"
    }
  };

  // =========================================================================
  // Initialize Leaflet Map
  // =========================================================================
  function initMap() {
    const mapEl = document.getElementById('leafletMap');
    if (!mapEl) return;

    // Centered on Tiruppur Urban & Noyyal Corridor
    map = L.map('leafletMap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([11.1085, 77.3800], 12);

    // Standard OpenStreetMap Tiles (100% reliable, zero API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // 1. Draw Noyyal River Corridor & Buffers
    riverLayerGroup = L.layerGroup().addTo(map);
    drawNoyyalVector();

    // 2. Draw Borewell Markers
    borewellLayerGroup = L.layerGroup().addTo(map);
    updateMapMarkers();
  }

  function drawNoyyalVector() {
    riverLayerGroup.clearLayers();

    // 2km Secondary Buffer
    const buffer2km = L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#f59e0b',
      weight: 38,
      opacity: 0.12,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(riverLayerGroup);

    // 1km Critical Leachate Buffer
    const buffer1km = L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#ef4444',
      weight: 20,
      opacity: 0.22,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(riverLayerGroup);

    // Main Noyyal River Channel
    const riverLine = L.polyline(NOYYAL_RIVER_COORDS, {
      color: '#06b6d4',
      weight: 4,
      opacity: 0.95
    }).addTo(riverLayerGroup);

    riverLine.bindTooltip("Noyyal River Corridor (Municipal Sewage Vector)", {
      permanent: false,
      direction: 'top',
      className: 'river-tooltip'
    });
  }

  // Calculate current node attributes based on scenario & view
  function getNodeData(st) {
    if (currentMapView === 'viewA' || currentScenario === 'baseline') {
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

  function updateMapMarkers() {
    if (!borewellLayerGroup) return;
    borewellLayerGroup.clearLayers();

    WARD_BOREWELLS.forEach(st => {
      const live = getNodeData(st);

      // Color logic based on status
      let color = '#10b981'; // Green
      let radius = 6;

      if (live.action.includes('CRITICAL')) {
        color = '#ef4444'; // Red
        radius = 8;
      } else if (live.action.includes('HIGH')) {
        color = '#f97316'; // Amber / Orange
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

      // Tooltip content
      const popupHtml = `
        <div style="font-size: 0.75rem; line-height: 1.35; min-width: 190px;">
          <div style="font-weight: 800; font-size: 0.85rem; color: #38bdf8; margin-bottom: 0.2rem;">${st.ward}</div>
          <div style="color: #94a3b8; margin-bottom: 0.4rem;">${st.locality} &bull; ${st.distNoyyalKm} km to Noyyal</div>
          <div style="background: rgba(255,255,255,0.06); padding: 0.35rem 0.5rem; border-radius: 4px; margin-bottom: 0.4rem;">
            <div><strong>2025 Level:</strong> ${st.baseDepth} m bgl</div>
            <div><strong>2026 Projected:</strong> ${live.depth} m bgl</div>
            <div><strong>TDS Salinity:</strong> ${live.tds} mg/L</div>
          </div>
          <div style="font-weight: 800; color: ${color};">
            Priority Rank #${st.rank} &bull; ${live.action}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.bindTooltip(`Rank #${st.rank}: ${st.ward} (${live.tds} mg/L)`, { direction: 'top' });
      marker.wardId = st.id;
      marker.addTo(borewellLayerGroup);
    });
  }

  // =========================================================================
  // Render Ranked Action Table
  // =========================================================================
  function renderActionTable() {
    const tbody = document.getElementById('actionTableBody');
    const searchVal = document.getElementById('tableSearch').value.toLowerCase().trim();
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

      // Click row to pan map to ward
      tr.addEventListener('click', () => {
        if (map) {
          map.setView([st.lat, st.lon], 14, { animate: true });
          // Open matching popup
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
  // Update Scenario State & Dynamic KPIs
  // =========================================================================
  function setScenario(scenKey) {
    currentScenario = scenKey;
    const scen = SCENARIOS[scenKey];
    if (!scen) return;

    // Update KPI Ribbon
    document.getElementById('kpiDepthVal').innerHTML = scen.depthVal;
    document.getElementById('kpiDepthDelta').innerHTML = scen.depthDelta;

    document.getElementById('kpiTdsVal').innerHTML = scen.tdsVal;
    document.getElementById('kpiTdsDelta').innerHTML = scen.tdsDelta;

    document.getElementById('kpiWardsVal').innerHTML = scen.wardsVal;
    document.getElementById('kpiWardsDelta').innerHTML = scen.wardsDelta;

    document.getElementById('kpiSewageVal').innerHTML = scen.sewageVal;
    document.getElementById('kpiSewageDelta').innerHTML = scen.sewageDelta;

    // Update Map and Table
    updateMapMarkers();
    renderActionTable();
  }

  // =========================================================================
  // Event Bindings
  // =========================================================================
  function initEvents() {
    // 1. Scenario Toggle Buttons
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

    // 2. Map View Switcher (View A Baseline vs View B Projected)
    const btnViewA = document.getElementById('btnViewA');
    const btnViewB = document.getElementById('btnViewB');

    if (btnViewA && btnViewB) {
      btnViewA.addEventListener('click', () => {
        btnViewA.classList.add('active');
        btnViewA.setAttribute('aria-selected', 'true');
        btnViewB.classList.remove('active');
        btnViewB.setAttribute('aria-selected', 'false');
        currentMapView = 'viewA';
        updateMapMarkers();
        renderActionTable();
      });

      btnViewB.addEventListener('click', () => {
        btnViewB.classList.add('active');
        btnViewB.setAttribute('aria-selected', 'true');
        btnViewA.classList.remove('active');
        btnViewA.setAttribute('aria-selected', 'false');
        currentMapView = 'viewB';
        updateMapMarkers();
        renderActionTable();
      });
    }

    // 3. Search Filter in Action Table
    const searchInput = document.getElementById('tableSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderActionTable();
      });
    }

    // 4. Table Header Sorting
    const ths = document.querySelectorAll('#actionTable th[data-col]');
    ths.forEach(th => {
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
  // Initialize App
  // =========================================================================
  function init() {
    initMap();
    initEvents();
    renderActionTable();
    console.log("Where Tiruppur's Water Breaks First: Bento Box UI Initialized.");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
