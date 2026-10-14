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
