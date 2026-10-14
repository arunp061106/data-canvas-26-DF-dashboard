/**
 * A Catastrophe behind Colours — Groundwater Stress Analytics Dashboard
 * Application Logic & Visualizations
 */

(function () {
  'use strict';

  // State Management
  const state = {
    theme: localStorage.getItem('tac_theme') || 'dark',
    activeTab: 'sectionOverview',
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

  // Cache DOM references
  const DOM = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    filterTaluk: document.getElementById('filterTaluk'),
    filterWellType: document.getElementById('filterWellType'),
    filterPriority: document.getElementById('filterPriority'),
    filterSearch: document.getElementById('filterSearch'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    sections: document.querySelectorAll('.dashboard-section'),
    priorityTableBody: document.getElementById('priorityTableBody'),
    priorityCountLabel: document.getElementById('priorityCountLabel'),
    qualitySamplesTable: document.getElementById('qualitySamplesTable').querySelector('tbody'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    stationModal: document.getElementById('stationModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    // Modal fields
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

  // Helper to ensure data availability
  function getData() {
    if (window.DASHBOARD_DATA) {
      return window.DASHBOARD_DATA;
    }
    console.error("Dashboard data bundle not found on window object.");
    return null;
  }

  // =========================================================================
  // Theme Toggle & Chart Styling Synchronization
  // =========================================================================
  function initTheme() {
    DOM.html.setAttribute('data-theme', state.theme);
    updateThemeIcon();

    DOM.themeToggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      DOM.html.setAttribute('data-theme', state.theme);
      localStorage.setItem('tac_theme', state.theme);
      updateThemeIcon();
      updateMapTileLayer();
      updateChartsTheme();
    });
  }

  function updateThemeIcon() {
    if (state.theme === 'light') {
      DOM.themeToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      DOM.themeToggleBtn.title = "Switch to Dark Mode";
    } else {
      DOM.themeToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      DOM.themeToggleBtn.title = "Switch to Light Mode";
    }
  }

  function getChartColors() {
    const isDark = state.theme === 'dark';
    return {
      textColor: isDark ? '#94a3b8' : '#475569',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
      tooltipBg: isDark ? '#1e293b' : '#ffffff',
      tooltipText: isDark ? '#f8fafc' : '#0f172a',
      accentPrimary: '#6366f1',
      accentRose: '#f43f5e',
      accentAmber: '#f59e0b',
      accentCyan: '#06b6d4',
      accentEmerald: '#10b981',
      accentPurple: '#a855f7'
    };
  }

  function updateChartsTheme() {
    const colors = getChartColors();
    Object.values(state.charts).forEach(chart => {
      if (!chart) return;
      if (chart.options.scales) {
        Object.keys(chart.options.scales).forEach(scaleKey => {
          const scale = chart.options.scales[scaleKey];
          if (scale.ticks) scale.ticks.color = colors.textColor;
          if (scale.grid) scale.grid.color = colors.gridColor;
        });
      }
      if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = colors.textColor;
      }
      chart.update();
    });
  }

  // =========================================================================
  // Tab Navigation
  // =========================================================================
  function initTabs() {
    DOM.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        DOM.tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        DOM.sections.forEach(sec => {
          sec.classList.remove('active');
        });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add('active');
        }
        state.activeTab = targetId;

        // Leaflet map resizing trigger on tab display
        if (targetId === 'sectionOverview' && state.map) {
          setTimeout(() => state.map.invalidateSize(), 150);
        }
      });
    });
  }

  // =========================================================================
  // Populate Filter Dropdowns
  // =========================================================================
  function initFilterOptions(data) {
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

    // Event Listeners for Filters
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
  // Leaflet GIS Station Map
  // =========================================================================
  let mapTileLayer = null;

  function initMap(data) {
    const mapContainer = document.getElementById('stationMap');
    if (!mapContainer) return;

    // Center around Tiruppur & Noyyal basin
    state.map = L.map('stationMap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([11.1085, 77.38], 10);

    updateMapTileLayer();
    renderMapMarkers(data);
  }

  function updateMapTileLayer() {
    if (!state.map) return;
    if (mapTileLayer) {
      state.map.removeLayer(mapTileLayer);
    }
    const isDark = state.theme === 'dark';
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    mapTileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18
    }).addTo(state.map);
  }

  function renderMapMarkers(data) {
    // Clear existing markers
    state.markers.forEach(m => state.map.removeLayer(m));
    state.markers = [];

    const stations = data.priority_table;

    stations.forEach(st => {
      if (!st.latitude || !st.longitude) return;

      const isHigh = st.priority_tier === 'High Priority';
      const isMed = st.priority_tier === 'Medium Priority';
      const color = isHigh ? '#f43f5e' : (isMed ? '#f59e0b' : '#10b981');
      const radius = isHigh ? 8 : (isMed ? 7 : 6);

      const circle = L.circleMarker([st.latitude, st.longitude], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85
      });

      // Bind rich popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 0.85rem; min-width: 200px; color: #1e293b;">
          <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 0.2rem;">${st.station_name}</div>
          <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem;">${st.taluk} Taluk &bull; ${st.well_type}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; margin-bottom: 0.5rem; font-size: 0.78rem;">
            <div><strong>Max Depth:</strong> ${st.max_depth_mbgl ? st.max_depth_mbgl + ' m' : 'N/A'}</div>
            <div><strong>Latest TDS:</strong> ${st.post_monsoon_tds ? st.post_monsoon_tds + ' mg/L' : (st.pre_monsoon_tds ? st.pre_monsoon_tds + ' mg/L' : 'No sample')}</div>
          </div>
          <div style="font-size: 0.75rem; font-weight: 700; color: ${color}; margin-bottom: 0.6rem;">
            ${st.priority_tier} (Score: ${st.priority_score}/100)
          </div>
          <button onclick="window.openStationModal('${st.station_name.replace(/'/g, "\\'")}')" 
                  style="width: 100%; background: #6366f1; color: white; border: none; padding: 0.35rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer;">
            View Station Dossier
          </button>
        </div>
      `;

      circle.bindPopup(popupHtml);
      circle.stationData = st;
      circle.addTo(state.map);
      state.markers.push(circle);
    });
  }

  function updateMapMarkers() {
    state.markers.forEach(marker => {
      const st = marker.stationData;
      let visible = true;

      if (state.filters.taluk !== 'all' && st.taluk !== state.filters.taluk) {
        visible = false;
      }
      if (state.filters.wellType !== 'all') {
        if (!st.well_type || !st.well_type.toLowerCase().includes(state.filters.wellType.toLowerCase())) {
          visible = false;
        }
      }
      if (state.filters.priority !== 'all' && st.priority_tier !== state.filters.priority) {
        visible = false;
      }
      if (state.filters.search) {
        const query = state.filters.search;
        const nameMatch = st.station_name && st.station_name.toLowerCase().includes(query);
        const talukMatch = st.taluk && st.taluk.toLowerCase().includes(query);
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
  // Chart Initializations
  // =========================================================================
  function initCharts(data) {
    const colors = getChartColors();

    // 1. Top 12 Deepest Wells (Horizontal Bar)
    const deepestCtx = document.getElementById('chartDeepestWells');
    if (deepestCtx) {
      // Sort priority table by max depth
      const sortedByDepth = [...data.priority_table]
        .filter(s => s.max_depth_mbgl !== null && s.max_depth_mbgl !== undefined)
        .sort((a, b) => b.max_depth_mbgl - a.max_depth_mbgl)
        .slice(0, 12);

      const labels = sortedByDepth.map(s => `${s.station_name} (${s.taluk || 'Tiruppur'})`);
      const depths = sortedByDepth.map(s => s.max_depth_mbgl);
      const bgColors = depths.map(d => d >= 20 ? colors.accentRose : (d >= 10 ? colors.accentAmber : colors.accentCyan));

      state.charts.deepestWells = new Chart(deepestCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Maximum Depth to Water (m bgl)',
            data: depths,
            backgroundColor: bgColors,
            borderRadius: 4
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
                afterLabel: (ctx) => `Depth: ${ctx.parsed.x} meters below ground level`
              }
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Depth to Water (meters below ground level)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor }
            },
            y: {
              grid: { display: false },
              ticks: { color: colors.textColor, font: { size: 11 } }
            }
          }
        }
      });
    }

    // 2. 2024-25 Core Wells Seasonal Dynamics (Grouped Bar)
    const coreCtx = document.getElementById('chartSeasonalCoreWells');
    if (coreCtx) {
      // Get 2024-25 records from water_levels
      const coreRecords = data.water_levels.filter(w => w.period === '2024-2025');
      const coreLabels = coreRecords.map(r => r.station_name);

      state.charts.seasonalCore = new Chart(coreCtx, {
        type: 'bar',
        data: {
          labels: coreLabels,
          datasets: [
            {
              label: 'May 2024 (Pre-Monsoon)',
              data: coreRecords.map(r => r.may_val),
              backgroundColor: '#ef4444',
              borderRadius: 3
            },
            {
              label: 'Aug 2024 (SW Monsoon)',
              data: coreRecords.map(r => r.aug_val),
              backgroundColor: '#f59e0b',
              borderRadius: 3
            },
            {
              label: 'Nov 2024 (Post-Monsoon)',
              data: coreRecords.map(r => r.nov_val),
              backgroundColor: '#10b981',
              borderRadius: 3
            },
            {
              label: 'Jan 2025 (Winter)',
              data: coreRecords.map(r => r.jan_val),
              backgroundColor: '#06b6d4',
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
              labels: { color: colors.textColor, boxWidth: 12, font: { size: 10 } }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw + ' m bgl' : 'No measurement'}`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Depth to Water (m bgl)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: colors.textColor, font: { size: 10 } }
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
            borderColor: colors.accentCyan,
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
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
            legend: {
              labels: { color: colors.textColor }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `Depth to Water: ${ctx.parsed.y} m below ground level`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: colors.textColor,
                maxTicksLimit: 12
              },
              grid: { color: colors.gridColor }
            },
            y: {
              title: { display: true, text: 'Depth to Water (m bgl)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor },
              // Note: larger depth downwards
              reverse: true
            }
          }
        }
      });
    }

    // 4. Pre vs Post Monsoon TDS Comparison (CGWB Quality 2024)
    const tdsCtx = document.getElementById('chartTdsComparison');
    if (tdsCtx) {
      // Find stations with both pre and post
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
              backgroundColor: '#ec4899',
              borderRadius: 4
            },
            {
              label: 'Post-Monsoon TDS (Nov 2024)',
              data: postTds,
              backgroundColor: '#8b5cf6',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: colors.textColor, boxWidth: 12 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw + ' mg/L' : 'No sample'}`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Total Dissolved Solids (mg/L)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: colors.textColor, font: { size: 10 } }
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
              backgroundColor: 'rgba(6, 182, 212, 0.75)',
              borderRadius: 4
            },
            {
              label: 'Post-Monsoon EC (µS/cm)',
              data: postEc,
              backgroundColor: 'rgba(99, 102, 241, 0.85)',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: colors.textColor, boxWidth: 12 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw + ' µS/cm' : 'No sample'}`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'EC (µS/cm at 25°C)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: colors.textColor, font: { size: 10 } }
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
              label: '2023 Monthly Total (582.4 mm)',
              data: rain2023,
              backgroundColor: 'rgba(244, 63, 94, 0.75)',
              borderRadius: 4
            },
            {
              label: '2024 Monthly Total (812.6 mm)',
              data: rain2024,
              backgroundColor: 'rgba(6, 182, 212, 0.75)',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: colors.textColor, boxWidth: 12 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label.split(' ')[0]}: ${ctx.raw} mm`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Rainfall (mm/month)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: colors.textColor }
            }
          }
        }
      });
    }

    // 7. NOAA RONI ENSO Index (2020-2026)
    const roniCtx = document.getElementById('chartRoniEnso');
    if (roniCtx) {
      const roniFiltered = data.enso_roni.filter(r => r.year >= 2021 && r.year <= 2025);
      const rLabels = roniFiltered.map(r => r.label);
      const rAnoms = roniFiltered.map(r => r.anomaly);
      const rColors = rAnoms.map(a => a >= 0.5 ? '#f43f5e' : (a <= -0.5 ? '#06b6d4' : '#64748b'));

      state.charts.roniEnso = new Chart(roniCtx, {
        type: 'line',
        data: {
          labels: rLabels,
          datasets: [{
            label: 'Relative Oceanic Niño Index Anomaly (°C)',
            data: rAnoms,
            borderColor: colors.accentPrimary,
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
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
            legend: {
              labels: { color: colors.textColor }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `RONI SST Anomaly: ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y} °C (${ctx.parsed.y >= 0.5 ? 'El Niño' : (ctx.parsed.y <= -0.5 ? 'La Niña' : 'Neutral')})`
              }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'SST Anomaly (°C)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor }
            },
            x: {
              ticks: {
                color: colors.textColor,
                maxTicksLimit: 12
              },
              grid: { color: colors.gridColor }
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
            backgroundColor: dValues.map(v => v >= 40 ? '#f43f5e' : (v >= 10 ? '#6366f1' : '#06b6d4')),
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
              title: { display: true, text: 'Rainfall (mm/day)', color: colors.textColor },
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor }
            },
            x: {
              ticks: {
                color: colors.textColor,
                maxTicksLimit: 14
              },
              grid: { display: false }
            }
          }
        }
      });
    }
  }

  // =========================================================================
  // Priority Table Rendering & Sorting
  // =========================================================================
  function renderPriorityTable() {
    const data = getData();
    if (!data) return;

    let stations = [...data.priority_table];

    // Apply Filter State
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

    // Apply Sorting
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

    // Render Table Rows
    DOM.priorityTableBody.innerHTML = '';

    if (stations.length === 0) {
      DOM.priorityTableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No monitored stations match the selected filter combination. Try resetting your filters.
          </td>
        </tr>
      `;
      return;
    }

    stations.forEach(st => {
      const tr = document.createElement('tr');
      const tierClass = st.priority_tier === 'High Priority' ? 'high' : (st.priority_tier === 'Medium Priority' ? 'med' : 'low');

      tr.innerHTML = `
        <td><span class="score-badge">${st.priority_score}</span></td>
        <td><span class="priority-pill ${tierClass}">${st.priority_tier.replace(' Priority', '')}</span></td>
        <td><strong style="color: var(--text-primary);">${st.station_name}</strong></td>
        <td>${st.taluk || 'Tiruppur'}</td>
        <td><span style="font-size: 0.75rem; color: var(--text-muted);">${st.well_type || 'Well'}</span></td>
        <td><strong>${st.max_depth_mbgl ? st.max_depth_mbgl.toFixed(1) : '--'}</strong> m</td>
        <td>${st.seasonal_range_m !== null ? st.seasonal_range_m.toFixed(1) + ' m' : '--'}</td>
        <td>${st.post_monsoon_tds ? `<span style="font-weight: 700; color: ${st.post_monsoon_tds >= 2000 ? 'var(--accent-rose)' : 'inherit'};">${st.post_monsoon_tds}</span>` : (st.pre_monsoon_tds ? `${st.pre_monsoon_tds} (Pre)` : '<span style="color: var(--text-muted);">--</span>')}</td>
        <td style="max-width: 280px; font-size: 0.78rem; line-height: 1.4;">${st.evidence_rationale}</td>
        <td>
          <button class="btn-secondary" style="padding: 0.25rem 0.55rem; font-size: 0.72rem;" onclick="window.openStationModal('${st.station_name.replace(/'/g, "\\'")}')">
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
      const isElevatedTds = q.TDS_mg_L >= 1200;
      const tdsColor = isHighTds ? 'var(--accent-rose)' : (isElevatedTds ? 'var(--accent-amber)' : 'inherit');

      tr.innerHTML = `
        <td><strong>${q.station_name}</strong><br><span style="font-size: 0.72rem; color: var(--text-muted);">${q.taluk || ''}</span></td>
        <td><span style="font-size: 0.75rem;">${q.season}</span></td>
        <td>${q.pH}</td>
        <td><strong>${q.EC_uS_cm}</strong></td>
        <td style="color: ${tdsColor}; font-weight: 700;">${q.TDS_mg_L}</td>
        <td>${q.Total_Hardness_mg_L || '--'}</td>
        <td>${q.Cl_mg_L || '--'}</td>
        <td>${q.SO4_mg_L || '--'}</td>
        <td>${q.NO3_mg_L || '--'}</td>
        <td>${q.F_mg_L || '--'}</td>
        <td><span style="font-size: 0.7rem; color: var(--text-muted);">CGWB Quality 2024 (p. ${q.source_page})</span></td>
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
    DOM.modalStationSub.textContent = `${st.taluk} Taluk &bull; ${st.well_type} &bull; ${st.source}`;
    DOM.modalScore.textContent = `${st.priority_score}/100`;

    const tierClass = st.priority_tier === 'High Priority' ? 'high' : (st.priority_tier === 'Medium Priority' ? 'med' : 'low');
    DOM.modalTierPill.innerHTML = `<span class="priority-pill ${tierClass}">${st.priority_tier}</span>`;

    DOM.modalMaxDepth.textContent = st.max_depth_mbgl ? `${st.max_depth_mbgl.toFixed(1)} m bgl` : 'No Record';
    DOM.modalTds.textContent = st.post_monsoon_tds ? `${st.post_monsoon_tds} mg/L` : (st.pre_monsoon_tds ? `${st.pre_monsoon_tds} mg/L (Pre)` : 'No 2024 chemical sample');
    DOM.modalSwing.textContent = st.seasonal_range_m !== null ? `${st.seasonal_range_m.toFixed(1)} m` : '--';

    DOM.modalGeoDetails.textContent = `Latitude: ${st.latitude.toFixed(4)}°N, Longitude: ${st.longitude.toFixed(4)}°E. Infrastructure: ${st.well_type}. Monitored period: ${st.monitoring_period}.`;
    DOM.modalRationale.textContent = st.evidence_rationale;

    // Actionable Intervention Advice
    let advice = "";
    if (st.priority_tier === 'High Priority') {
      if (st.post_monsoon_tds && st.post_monsoon_tds >= 2000) {
        advice = "CRITICAL HYPERSALINITY INTERVENTION: Immediate chemical speciation testing (heavy metals, dye aromatics, and sulfate levels). Install public RO/nanofiltration dispensing units for surrounding households. Issue groundwater extraction halt notices for dyeing units in immediate catchment.";
      } else if (st.max_depth_mbgl && st.max_depth_mbgl >= 20) {
        advice = "SEVERE AQUIFER EXHAUSTION: Construct pilot Managed Aquifer Recharge (MAR) shafts with rooftop rainwater harvesting filtration. Implement mandatory agricultural micro-irrigation and meter industrial drawdowns.";
      } else {
        advice = "PRIORITY SURVEILLANCE: Schedule quarterly hydrochemical profiling and isotope tracing to evaluate industrial plume migration from Noyyal textile clusters.";
      }
    } else if (st.priority_tier === 'Medium Priority') {
      advice = "ENHANCED MONITORING: Maintain bi-monthly water table dip logging. Commission baseline laboratory testing for fluoride, nitrates, and conductivity.";
    } else {
      advice = "ROUTINE BASELINE: Continue standard CGWB seasonal monitoring network measurements. Maintain community wellhead sanitary seals.";
    }

    DOM.modalIntervention.textContent = advice;

    // Show native modal
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

    // Light-dismiss on backdrop click
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

    initTheme();
    initTabs();
    initFilterOptions(data);
    initMap(data);
    initCharts(data);
    initTableSorting();
    renderPriorityTable();
    renderQualityTable(data);
    initModal();
    initExportCsv();

    console.log("“A Catastrophe behind Colours” dashboard initialized successfully.");
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
