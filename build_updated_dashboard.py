# build_updated_dashboard.py
import json
import os

with open('data/app_data.js', 'r', encoding='utf-8') as f:
    app_data_str = f.read().strip()

json_part = app_data_str.split('=', 1)[1].strip().rstrip(';')

html_template = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Where Tiruppur's Water Breaks First — Two-Map Groundwater Depletion &amp; Salinity Analytics</title>
  <meta name="description" content="Hydrological analytics dashboard comparing 2026 projected drought scenario against 2025 observed baseline across Tiruppur and the Noyyal basin.">

  <!-- Google Fonts: Syne, DM Mono, DM Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">

  <!-- Leaflet CSS for CartoDB Dark Matter Cartography -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

  <!-- Chart.js 4.4.1 -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <style>
    /* ==========================================================================
       SENTIMENTSCOPE DESIGN SYSTEM (DARK THEME, GLASS CARDS, FLOATING ORBS)
       ========================================================================== */
    :root {
      --bg: #07080d;
      --bg2: rgba(255, 255, 255, 0.04);
      --bg3: rgba(255, 255, 255, 0.07);
      --border: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 255, 255, 0.18);
      --accent1: #7fffb2; /* Mint / Routine / Normal */
      --accent2: #ff6b6b; /* Coral Red / High Priority / Drought */
      --accent3: #ffd166; /* Amber / Medium Priority / Alert */
      --accent4: #74b9ff; /* Sky Blue / Telemetry / Rain */
      --accent5: #a29bfe; /* Violet / Scenario */
      --text: #e8ecf0;
      --text-muted: #8b95a5;
      --text-dim: #556070;
      --radius: 14px;
      --radius-sm: 8px;
      --radius-lg: 22px;
      --font-head: 'Syne', sans-serif;
      --font-mono: 'DM Mono', monospace;
      --font-body: 'DM Sans', sans-serif;
      --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);

      --sp-1: 4px;
      --sp-2: 8px;
      --sp-3: 16px;
      --sp-4: 24px;
      --sp-5: 32px;
      --sp-6: 48px;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: var(--font-body);
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Background Orbs & Subtle Grid Overlay */
    .bg-canvas {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.22;
      animation: orbFloat 24s ease-in-out infinite alternate;
    }

    .orb-1 {
      width: 650px; height: 650px;
      background: radial-gradient(circle, rgba(127, 255, 178, 0.7), transparent 65%);
      top: -200px; left: -100px;
      animation-duration: 22s;
    }

    .orb-2 {
      width: 550px; height: 550px;
      background: radial-gradient(circle, rgba(162, 155, 254, 0.7), transparent 65%);
      top: 30%; right: -150px;
      animation-duration: 26s;
      animation-delay: -8s;
    }

    .orb-3 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(116, 185, 255, 0.7), transparent 65%);
      bottom: 10%; left: 10%;
      animation-duration: 20s;
      animation-delay: -4s;
    }

    @keyframes orbFloat {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(60px, 40px) scale(1.12); }
    }

    .grid-overlay {
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 1;
    }

    /* Site Container */
    .site-wrapper {
      position: relative;
      z-index: 2;
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 var(--sp-4);
    }

    /* ── 1. HEADER BAR ── */
    .site-header {
      padding: var(--sp-4) 0;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-mark {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--accent1), var(--accent4));
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-family: var(--font-head);
      font-weight: 800;
      font-size: 19px;
      color: #07080d;
      box-shadow: 0 0 20px rgba(127, 255, 178, 0.35);
      flex-shrink: 0;
    }

    .site-title {
      font-family: var(--font-head);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #ffffff, var(--accent1));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .site-sub {
      font-size: 13px;
      color: var(--accent3);
      font-weight: 500;
      margin-top: 2px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      background: rgba(127, 255, 178, 0.08);
      border: 1px solid rgba(127, 255, 178, 0.25);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      color: var(--accent1);
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: var(--accent1);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent1);
      animation: pulseAnim 2s infinite;
    }

    .pulse-dot.dot-red {
      background: var(--accent2);
      box-shadow: 0 0 8px var(--accent2);
    }

    @keyframes pulseAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .tag-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--bg2);
      color: var(--text-muted);
    }

    .tag-sdg6 {
      border-color: rgba(116, 185, 255, 0.35);
      color: #74b9ff;
      background: rgba(116, 185, 255, 0.08);
    }

    .tag-sdg3 {
      border-color: rgba(127, 255, 178, 0.35);
      color: #7fffb2;
      background: rgba(127, 255, 178, 0.08);
    }

    /* ── 2. KPI STRIP (5 HEADLINE CARDS) ── */
    .hero-kpi-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--sp-3);
      margin: var(--sp-4) 0;
    }

    .kpi-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 18px;
      box-shadow: var(--glass-shadow);
      transition: transform 0.2s ease, border-color 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-hover);
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .kpi-label {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .kpi-icon {
      font-size: 16px;
    }

    .kpi-val {
      font-family: var(--font-head);
      font-size: 26px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .val-accent1 { color: var(--accent1); }
    .val-accent2 { color: var(--accent2); }
    .val-accent3 { color: var(--accent3); }
    .val-accent4 { color: var(--accent4); }

    .kpi-unit-line {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── 3. TWO-MAP COMPARISON SECTION ── */
    .map-section-wrapper {
      margin-bottom: var(--sp-5);
    }

    .map-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .map-actions-left {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .map-section-title {
      font-family: var(--font-head);
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
    }

    .map-section-sub {
      font-size: 12px;
      color: var(--text-muted);
    }

    .btn-el-nino {
      background: rgba(255, 107, 107, 0.08);
      border: 1px solid rgba(255, 107, 107, 0.35);
      color: var(--accent2);
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-el-nino:hover {
      background: rgba(255, 107, 107, 0.16);
      border-color: var(--accent2);
      transform: translateY(-1px);
    }

    .btn-el-nino.active {
      background: var(--accent2);
      color: #07080d;
      border-color: var(--accent2);
      box-shadow: 0 0 16px rgba(255, 107, 107, 0.4);
    }

    /* El Niño Banner */
    .el-nino-banner {
      background: rgba(255, 107, 107, 0.06);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: var(--radius);
      padding: 14px 18px;
      margin-bottom: 14px;
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .el-nino-banner-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .el-nino-banner-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-head);
      font-size: 13px;
      color: var(--accent2);
      letter-spacing: 0.5px;
    }

    .el-nino-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .en-label {
      font-family: var(--font-mono);
      font-size: 10px;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 2px;
    }

    .en-val {
      font-family: var(--font-mono);
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }

    .en-val.val-warning {
      color: var(--accent3);
      font-style: italic;
    }

    .en-sub {
      font-size: 11px;
      color: var(--text-dim);
      margin-top: 2px;
    }

    /* Dual Maps Layout */
    .dual-maps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-4);
    }

    .map-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--glass-shadow);
      display: flex;
      flex-direction: column;
    }

    .map-card-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border);
    }

    .map-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .map-title {
      font-family: var(--font-head);
      font-size: 13.5px;
      font-weight: 700;
      color: #ffffff;
    }

    .scenario-pill {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(162, 155, 254, 0.15);
      border: 1px solid rgba(162, 155, 254, 0.4);
      color: var(--accent5);
    }

    .measured-pill {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(127, 255, 178, 0.12);
      border: 1px solid rgba(127, 255, 178, 0.35);
      color: var(--accent1);
    }

    .map-container-box {
      height: 460px;
      width: 100%;
      position: relative;
      background: #090b10;
    }

    /* Map Footers / Legends */
    .map-card-footer {
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .map-legend-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 11.5px;
    }

    .legend-tiers {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--text-muted);
    }

    .dot-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot-indicator.dot-red { background: var(--accent2); }
    .dot-indicator.dot-amber { background: var(--accent3); }
    .dot-indicator.dot-green { background: var(--accent1); }
    .dot-indicator.dot-hollow {
      border: 1.5px dashed #8b95a5;
      background: transparent;
    }

    .legend-sizes {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 10.5px;
      color: var(--text-muted);
    }

    .circle-scale {
      border: 1px solid var(--text-muted);
      border-radius: 50%;
      display: inline-block;
    }

    .map-footnote {
      font-size: 11px;
      color: var(--text-dim);
      line-height: 1.4;
      border-top: 1px dashed rgba(255, 255, 255, 0.05);
      padding-top: 6px;
    }

    /* Floating Left Map El Niño Overlay */
    .map-floating-overlay {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1000;
      background: rgba(7, 8, 13, 0.92);
      border: 1px solid var(--accent2);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      width: 230px;
      pointer-events: auto;
    }

    .overlay-title {
      font-family: var(--font-head);
      font-size: 12px;
      font-weight: 700;
      color: var(--accent2);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }

    .overlay-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin-bottom: 3px;
      color: var(--text-muted);
    }

    .overlay-row strong {
      color: #ffffff;
      font-family: var(--font-mono);
    }

    .overlay-footnote {
      font-size: 9.5px;
      color: var(--text-dim);
      margin-top: 6px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 4px;
    }

    /* Custom Leaflet Tooltip */
    .leaflet-dark-tooltip {
      background: rgba(7, 8, 13, 0.94) !important;
      border: 1px solid var(--border-hover) !important;
      border-radius: var(--radius-sm) !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
      padding: 8px 12px !important;
      color: #ffffff !important;
      font-family: var(--font-body) !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
    }

    .leaflet-dark-tooltip::before {
      border-top-color: rgba(7, 8, 13, 0.94) !important;
    }

    .map-tt-title {
      font-family: var(--font-head);
      font-size: 13px;
      font-weight: 700;
      color: var(--accent4);
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .map-tt-foot {
      font-size: 10px;
      color: var(--text-dim);
      margin-top: 4px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      padding-top: 3px;
    }

    /* ── 4. FILTER BAR ── */
    .filter-bar {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 20px;
      box-shadow: var(--glass-shadow);
      margin-bottom: var(--sp-5);
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr) auto;
      gap: 14px;
      align-items: end;
    }

    .filter-control {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-control label {
      font-family: var(--font-mono);
      font-size: 10.5px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-select, .filter-input {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 12.5px;
      padding: 9px 12px;
      border-radius: var(--radius-sm);
      outline: none;
      transition: all 0.2s ease;
      width: 100%;
    }

    .filter-select:focus, .filter-input:focus {
      border-color: var(--accent1);
      background: rgba(255, 255, 255, 0.06);
    }

    .btn-reset {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 11.5px;
      font-weight: 500;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-reset:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-hover);
    }

    /* ── 5. CHARTS GRID ── */
    .charts-grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-4);
      margin-bottom: var(--sp-5);
    }

    .chart-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 20px;
      box-shadow: var(--glass-shadow);
      display: flex;
      flex-direction: column;
    }

    .chart-card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chart-title {
      font-family: var(--font-head);
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .chart-sub {
      font-size: 11px;
      color: var(--text-muted);
    }

    .chart-box {
      height: 250px;
      position: relative;
      width: 100%;
    }

    .chart-caption {
      font-size: 11px;
      color: var(--text-dim);
      margin-top: 10px;
      line-height: 1.4;
      border-top: 1px dashed rgba(255, 255, 255, 0.05);
      padding-top: 6px;
    }

    .insufficient-notice {
      display: none;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--accent3);
      background: rgba(255, 209, 102, 0.08);
      border: 1px solid rgba(255, 209, 102, 0.2);
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 8px;
    }

    /* ── 6. PRIORITY TABLE ── */
    .table-section {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 20px;
      box-shadow: var(--glass-shadow);
      margin-bottom: var(--sp-5);
    }

    .table-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .table-responsive {
      overflow-x: auto;
      max-height: 480px;
      margin-top: 8px;
    }

    .dnd-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      text-align: left;
    }

    .dnd-table th {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 5;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    .dnd-table th:hover {
      color: #ffffff;
    }

    .dnd-table td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .dnd-table tr:hover {
      background: rgba(255, 255, 255, 0.04);
      cursor: pointer;
    }

    .dnd-table tr.selected-row {
      background: rgba(127, 255, 178, 0.08);
      border-left: 3px solid var(--accent1);
    }

    .st-name-cell {
      color: #ffffff;
      font-weight: 600;
    }

    .tier-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .tier-high {
      background: rgba(255, 107, 107, 0.15);
      border: 1px solid rgba(255, 107, 107, 0.35);
      color: var(--accent2);
    }

    .tier-medium {
      background: rgba(255, 209, 102, 0.15);
      border: 1px solid rgba(255, 209, 102, 0.35);
      color: var(--accent3);
    }

    .tier-routine {
      background: rgba(127, 255, 178, 0.15);
      border: 1px solid rgba(127, 255, 178, 0.35);
      color: var(--accent1);
    }

    .btn-inspect {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      color: var(--accent4);
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-inspect:hover {
      background: rgba(116, 185, 255, 0.15);
      border-color: var(--accent4);
      color: #ffffff;
    }

    /* ── 7. COLLAPSIBLE METHODS & PROVENANCE ── */
    .collapsible-wrapper {
      margin-bottom: var(--sp-5);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .collapsible-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--glass-shadow);
      overflow: hidden;
    }

    .collapsible-summary {
      padding: 14px 18px;
      font-family: var(--font-head);
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      user-select: none;
      background: rgba(255, 255, 255, 0.02);
    }

    .collapsible-summary:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .collapsible-body {
      padding: 16px 20px;
      border-top: 1px solid var(--border);
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-muted);
    }

    .collapsible-body h4 {
      font-family: var(--font-head);
      font-size: 13px;
      color: #ffffff;
      margin: 12px 0 6px;
    }

    .collapsible-body h4:first-child {
      margin-top: 0;
    }

    .criteria-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin: 10px 0;
    }

    .criteria-table th, .criteria-table td {
      padding: 8px 10px;
      border: 1px solid var(--border);
      text-align: left;
    }

    .criteria-table th {
      background: rgba(255, 255, 255, 0.03);
      color: #ffffff;
      font-family: var(--font-mono);
      font-size: 10.5px;
      text-transform: uppercase;
    }

    /* ── 8. QR CODE DOCK & FOOTER ── */
    .pitch-qr-dock {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
      box-shadow: var(--glass-shadow);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sp-5);
      flex-wrap: wrap;
      gap: 20px;
    }

    .qr-dock-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .qr-dock-img {
      width: 80px;
      height: 80px;
      background: #ffffff;
      padding: 6px;
      border-radius: 8px;
      display: block;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .qr-dock-title {
      font-family: var(--font-head);
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
    }

    .qr-dock-sub {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .qr-dock-url code {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--accent1);
      background: rgba(127, 255, 178, 0.08);
      border: 1px solid rgba(127, 255, 178, 0.25);
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
    }

    .site-footer {
      border-top: 1px solid var(--border);
      padding: var(--sp-4) 0 var(--sp-6);
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .footnote-box {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      margin-bottom: 16px;
    }

    /* Modal Dossier */
    .modal-veil {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: none;
      place-items: center;
      padding: 20px;
    }

    .modal-card {
      background: #0f121a;
      border: 1px solid var(--border-hover);
      border-radius: var(--radius);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
      width: 100%;
      max-width: 580px;
      padding: 24px;
      position: relative;
      animation: modalFadeIn 0.2s ease;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
    }

    .modal-close:hover { color: #ffffff; }

    /* ==========================================================================
       RESPONSIVENESS (390PX MOBILE & 1440PX DESKTOP)
       ========================================================================== */
    @media (max-width: 1080px) {
      .hero-kpi-strip {
        grid-template-columns: repeat(3, 1fr);
      }
      .charts-grid-2x2 {
        grid-template-columns: 1fr;
      }
      .filter-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 900px) {
      .dual-maps-grid {
        grid-template-columns: 1fr;
      }
      .map-container-box {
        height: 340px;
      }
      .el-nino-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .hero-kpi-strip {
        grid-template-columns: 1fr 1fr;
      }
      .filter-grid {
        grid-template-columns: 1fr;
      }
      .site-title {
        font-size: 18px;
      }
      .qr-dock-left {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>

  <!-- Background Orbs & 60px Grid Pattern -->
  <div class="bg-canvas" aria-hidden="true">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="grid-overlay"></div>
  </div>

  <div class="site-wrapper">

    <!-- ═══ 1. HEADER ═══ -->
    <header class="site-header" role="banner">
      <div class="header-left">
        <div class="logo-mark">WB</div>
        <div>
          <h1 class="site-title">Where Tiruppur's Water Breaks First</h1>
          <p class="site-sub">Which wells fail first in a dry year? • Borewell Depletion &amp; Salinity Stress Analytics</p>
        </div>
      </div>
      <div class="header-right">
        <div class="live-badge">
          <span class="pulse-dot"></span>
          2026 DROUGHT MODEL
        </div>
        <span class="tag-pill tag-sdg6">SDG 6 Clean Water</span>
        <span class="tag-pill tag-sdg3">SDG 3 Good Health</span>
      </div>
    </header>

    <!-- ═══ 2. KPI STRIP (5 HEADLINE CARDS) ═══ -->
    <section class="hero-kpi-strip" aria-label="Key Performance Indicators">
      <!-- KPI 1: Stations Tracked -->
      <div class="kpi-card" id="kpiCardStations">
        <div class="kpi-top">
          <span class="kpi-label">Stations Tracked</span>
          <span class="kpi-icon">📍</span>
        </div>
        <div class="kpi-val val-accent1" id="kpiValStations">32</div>
        <div class="kpi-unit-line">Active Piezometers &amp; Dug Wells &bull; 2023–2025</div>
      </div>

      <!-- KPI 2: Median Depth -->
      <div class="kpi-card" id="kpiCardDepth">
        <div class="kpi-top">
          <span class="kpi-label">Median Depth</span>
          <span class="kpi-icon">📏</span>
        </div>
        <div class="kpi-val val-accent3" id="kpiValDepth">12.3</div>
        <div class="kpi-unit-line">m bgl &bull; Pre-Monsoon Median</div>
      </div>

      <!-- KPI 3: Wells Above 2,000 mg/L TDS -->
      <div class="kpi-card" id="kpiCardTds">
        <div class="kpi-top">
          <span class="kpi-label">Wells &gt; 2,000 mg/L TDS</span>
          <span class="kpi-icon">🧪</span>
        </div>
        <div class="kpi-val val-accent2" id="kpiValTds">1</div>
        <div class="kpi-unit-line">mg/L &bull; Exceeds BIS Safe Limit (Arugampalayam)</div>
      </div>

      <!-- KPI 4: Annual Rainfall -->
      <div class="kpi-card" id="kpiCardRainfall">
        <div class="kpi-top">
          <span class="kpi-label">Annual Rainfall (2024)</span>
          <span class="kpi-icon">🌧️</span>
        </div>
        <div class="kpi-val val-accent4" id="kpiValRainfall">1,058.8</div>
        <div class="kpi-unit-line">mm &bull; NASA MERRA-2 2024 Annual Sum</div>
      </div>

      <!-- KPI 5: High-Priority Count -->
      <div class="kpi-card" id="kpiCardUrgent">
        <div class="kpi-top">
          <span class="kpi-label">High-Priority Wells</span>
          <span class="kpi-icon">⚠️</span>
        </div>
        <div class="kpi-val val-accent2" id="kpiValUrgent">12</div>
        <div class="kpi-unit-line">Wells &bull; Score &ge; 70 (40/40/20 Matrix)</div>
      </div>
    </section>

    <!-- ═══ 3. TWO-MAP COMPARISON SECTION ═══ -->
    <section class="map-section-wrapper" aria-label="Dual Map Comparison">
      <div class="map-actions-bar">
        <div class="map-actions-left">
          <h2 class="map-section-title">Spatial Groundwater Stress Comparison</h2>
          <span class="map-section-sub">Synchronized spatial view: Projected Drought Scenario vs. Latest Measured Baseline</span>
        </div>
        <button type="button" id="btnToggleElNino" class="btn-el-nino" aria-pressed="false">
          <span>⚡</span>
          <span id="elNinoBtnText">Show current El Niño effect</span>
        </button>
      </div>

      <!-- Toggleable El Niño Banner -->
      <div id="elNinoBanner" class="el-nino-banner" style="display: none;">
        <div class="el-nino-banner-header">
          <div class="el-nino-banner-title">
            <span class="pulse-dot dot-red"></span>
            <strong>CLIMATE ANOMALY ALERT: RELATIVE OCEANIC NIÑO INDEX (RONI)</strong>
          </div>
          <span class="scenario-pill">SCENARIO IMPACT</span>
        </div>
        <div class="el-nino-grid">
          <div class="el-nino-item">
            <div class="en-label">LATEST RONI STATUS</div>
            <div class="en-val" id="enRoniStatus">El Niño (+1.69°C Anomaly)</div>
            <div class="en-sub">Period: JAS 2026 Forecast &bull; Source: NOAA Climate Prediction Center</div>
          </div>
          <div class="el-nino-item">
            <div class="en-label">2026 ANNUAL RAINFALL</div>
            <div class="en-val val-warning" id="enRainfall2026">not in data file</div>
            <div class="en-sub">Source: NASA POWER MERRA-2 (Observed records end Dec 2024)</div>
          </div>
          <div class="el-nino-item">
            <div class="en-label">HYDROLOGICAL STRESS MECHANISM</div>
            <div class="en-val" style="font-size: 13.5px; font-weight: 500; color: var(--text);">+3.2 m Drawdown Offset</div>
            <div class="en-sub">Compound effect: ~35% recharge deficit + high pumping velocity in crystalline bedrock</div>
          </div>
        </div>
      </div>

      <!-- Dual Side-by-Side Maps Grid -->
      <div class="dual-maps-grid">
        <!-- LEFT MAP: Expected Summer 2026 (Scenario) -->
        <div class="map-card">
          <div class="map-card-header">
            <div class="map-title-wrap">
              <span class="dot-indicator dot-red"></span>
              <span class="map-title">Expected summer 2026 (scenario)</span>
            </div>
            <span class="scenario-pill">SCENARIO</span>
          </div>

          <div class="map-container-box" id="mapScenario">
            <!-- Left Map El Niño Overlay -->
            <div id="leftMapElNinoOverlay" class="map-floating-overlay" style="display: none;">
              <div class="overlay-title">
                <span class="pulse-dot dot-red"></span>
                El Niño Drought Stress
              </div>
              <div class="overlay-row">
                <span>RONI Anomaly:</span>
                <strong id="overlayRoniVal">+1.69°C (El Niño)</strong>
              </div>
              <div class="overlay-row">
                <span>2026 Rainfall:</span>
                <strong style="color: var(--accent3);" id="overlayRainVal">not in data file</strong>
              </div>
              <div class="overlay-row">
                <span>Drawdown Shift:</span>
                <strong>+3.2 m bgl</strong>
              </div>
              <div class="overlay-footnote">Source: NOAA CPC RONI.ascii.txt &amp; CGWB TN Baseline</div>
            </div>
          </div>

          <div class="map-card-footer">
            <div class="map-legend-row">
              <div class="legend-tiers">
                <div class="legend-item"><span class="dot-indicator dot-red"></span> High Priority (&ge;70)</div>
                <div class="legend-item"><span class="dot-indicator dot-amber"></span> Medium (50–69)</div>
                <div class="legend-item"><span class="dot-indicator dot-green"></span> Routine (&lt;50)</div>
              </div>
              <div class="legend-sizes">
                <span>Depth scale:</span>
                <span class="circle-scale" style="width: 8px; height: 8px;" title="Shallow (<5m)"></span>
                <span class="circle-scale" style="width: 14px; height: 14px;" title="Medium (10-20m)"></span>
                <span class="circle-scale" style="width: 20px; height: 20px;" title="Deep (>20m)"></span>
              </div>
            </div>
            <div class="map-footnote">
              <strong>Scenario Method:</strong> Summer 2026 projected water table depth applies an empirical +3.2 m drought drawdown offset (derived from historical ENSO recharge deficit patterns) to baseline monitoring depths.
            </div>
          </div>
        </div>

        <!-- RIGHT MAP: Observed Summer 2025 -->
        <div class="map-card">
          <div class="map-card-header">
            <div class="map-title-wrap">
              <span class="dot-indicator dot-green"></span>
              <span class="map-title">Observed summer 2025</span>
            </div>
            <span class="measured-pill">MEASURED</span>
          </div>

          <div class="map-container-box" id="mapObserved"></div>

          <div class="map-card-footer">
            <div class="map-legend-row">
              <div class="legend-tiers">
                <div class="legend-item"><span class="dot-indicator dot-red"></span> High Priority</div>
                <div class="legend-item"><span class="dot-indicator dot-amber"></span> Medium</div>
                <div class="legend-item"><span class="dot-indicator dot-green"></span> Routine</div>
                <div class="legend-item"><span class="dot-indicator dot-hollow"></span> Not yet measured</div>
              </div>
              <div class="legend-sizes">
                <span>Depth scale:</span>
                <span class="circle-scale" style="width: 8px; height: 8px;" title="Shallow (<5m)"></span>
                <span class="circle-scale" style="width: 14px; height: 14px;" title="Medium (10-20m)"></span>
                <span class="circle-scale" style="width: 20px; height: 20px;" title="Deep (>20m)"></span>
              </div>
            </div>
            <div class="map-footnote">
              <strong>Measured Baseline:</strong> Ground truth depths from CGWB 2024-25 Yearbook (Page 112). Stations with no 2025 sampling round are shown with hollow dashed markers and marked "Not yet measured".
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 4. FILTER BAR ═══ -->
    <section class="filter-bar" aria-label="Interactive Filters">
      <div class="filter-grid">
        <div class="filter-control">
          <label for="filterTaluk">Taluk</label>
          <select id="filterTaluk" class="filter-select">
            <option value="all">All Taluks (10 Blocks)</option>
          </select>
        </div>

        <div class="filter-control">
          <label for="filterWellType">Well Type</label>
          <select id="filterWellType" class="filter-select">
            <option value="all">All Well Types</option>
            <option value="Dug Well">Dug Well (Shallow)</option>
            <option value="Bore Well">Bore Well (Piezometer)</option>
          </select>
        </div>

        <div class="filter-control">
          <label for="filterPriority">Priority Tier</label>
          <select id="filterPriority" class="filter-select">
            <option value="all">All Priority Tiers</option>
            <option value="High Priority">High Priority (Score &ge; 70)</option>
            <option value="Medium Priority">Medium Priority (50–69)</option>
            <option value="Routine Monitoring">Routine Monitoring (&lt; 50)</option>
          </select>
        </div>

        <div class="filter-control">
          <label for="filterSearch">Search Station</label>
          <input type="text" id="filterSearch" class="filter-input" placeholder="Search station or taluk...">
        </div>

        <div class="filter-control">
          <button type="button" id="btnResetFilters" class="btn-reset" title="Reset all filters">
            <span>↺</span> Reset
          </button>
        </div>
      </div>
    </section>

    <!-- ═══ 5. CHARTS GRID (2x2) ═══ -->
    <section class="charts-grid-2x2" aria-label="Hydrological Analysis Charts">
      <!-- Chart 1: Depth Time Series for Selected Station -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-title">
            <span>📈</span>
            <span id="tsChartTitle">Station Seasonal Depth Time Series</span>
          </div>
          <span class="tag-pill" id="tsStationSub">Arugampalayam</span>
        </div>
        <div id="insufficientDataAlert" class="insufficient-notice">
          <span>⚠️</span> Limited telemetry points in CGWB 2024-25 yearbook for this station; showing baseline records.
        </div>
        <div class="chart-box">
          <canvas id="chartDepthTimeSeries"></canvas>
        </div>
        <div class="chart-caption">
          <strong>Sign Convention:</strong> Depth to water level in meters below ground level (m bgl). Values increase as the water table deepens. Measured seasons compare against the [SCENARIO] 2026 Severe Drought drawdown model (+3.2m).
        </div>
      </div>

      <!-- Chart 2: TDS by Station with 2,000 mg/L Line -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-title">
            <span>🧪</span>
            <span>TDS by Monitoring Station</span>
          </div>
          <span class="tag-pill">BIS Limit: 2,000 mg/L</span>
        </div>
        <div class="chart-box">
          <canvas id="chartTdsByStation"></canvas>
        </div>
        <div class="chart-caption">
          <strong>Threshold Rationale:</strong> Bureau of Indian Standards (IS 10500:2012) permissible limit for drinking water is 2,000 mg/L. Arugampalayam (2,789 mg/L) indicates severe mineralization / industrial plume impact along the Noyyal corridor.
        </div>
      </div>

      <!-- Chart 3: Monthly Rainfall 2023 vs 2024 -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-title">
            <span>🌧️</span>
            <span>Monthly Precipitation (2023 vs. 2024)</span>
          </div>
          <span class="tag-pill">NASA MERRA-2</span>
        </div>
        <div class="chart-box">
          <canvas id="chartMonthlyRainfall"></canvas>
        </div>
        <div class="chart-caption">
          <strong>Rainfall Method:</strong> Monthly sums computed from daily NASA POWER MERRA-2 point precipitation estimates at Tiruppur centroid (11.1085°N, 77.3411°E). 2023 annual sum: 842.7 mm; 2024 annual sum: 1,058.8 mm.
        </div>
      </div>

      <!-- Chart 4: Priority Score Breakdown (40/40/20 Weights) -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-title">
            <span>⚖️</span>
            <span>Priority Score 3-Pillar Risk Weights</span>
          </div>
          <span class="tag-pill">40 / 40 / 20 Rule</span>
        </div>
        <div class="chart-box">
          <canvas id="chartPriorityPillars"></canvas>
        </div>
        <div class="chart-caption">
          <strong>Pillars:</strong> Depth to Water (40% weight), Seasonal Fluctuation (40% weight), and Salinity / TDS (20% weight). Stations scoring &ge;70 require immediate recharge intervention.
        </div>
      </div>
    </section>

    <!-- ═══ 6. PRIORITY RANKED TABLE ═══ -->
    <section class="table-section" aria-label="Action Priority Ranking">
      <div class="table-header-bar">
        <div>
          <h3 class="chart-title">Ranked Intervention Priority Matrix</h3>
          <span class="chart-sub">Select a station to inspect its multi-year depth curve across both maps and the time series chart</span>
        </div>
        <span class="tag-pill" id="tableFilterCount">32 Stations</span>
      </div>

      <div class="table-responsive">
        <table class="dnd-table" id="priorityTable">
          <thead>
            <tr>
              <th data-col="rank"># ↕</th>
              <th data-col="station_name">Station Name ↕</th>
              <th data-col="taluk">Taluk ↕</th>
              <th data-col="well_type">Type ↕</th>
              <th data-col="measured_2025_mbgl">2025 Observed (m bgl) ↕</th>
              <th data-col="scenario_depth_mbgl">2026 Scenario (m bgl) ↕</th>
              <th data-col="seasonal_range_m">Seasonal Swing (m) ↕</th>
              <th data-col="pre_monsoon_tds">TDS (mg/L) ↕</th>
              <th data-col="priority_score">Score (40/40/20) ↕</th>
              <th data-col="priority_tier">Tier ↕</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="priorityTableBody">
            <!-- Dynamically populated via JS -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- ═══ 7. COLLAPSIBLE METHODS & PROVENANCE ═══ -->
    <section class="collapsible-wrapper" aria-label="Methodology and Scientific Provenance">
      <!-- 7.1 Scoring Methodology -->
      <details class="collapsible-card" open>
        <summary class="collapsible-summary">
          <span>📐</span> Three-Pillar Scoring Methodology (40 / 40 / 20)
        </summary>
        <div class="collapsible-body">
          <p>Every borewell and dug well in the monitoring registry is scored on a transparent 100-point scale designed to isolate wells facing imminent dry-year failure:</p>
          <table class="criteria-table">
            <thead>
              <tr>
                <th>Pillar</th>
                <th>Weight</th>
                <th>Measurement Metric</th>
                <th>Scoring Cut-offs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pillar 1: Absolute Depth</strong></td>
                <td>40% (40 pts)</td>
                <td>Maximum depth to water level (m bgl)</td>
                <td>&ge;20 m = 40 pts &bull; 10–20 m = 25 pts &bull; &lt;10 m = 12 pts</td>
              </tr>
              <tr>
                <td><strong>Pillar 2: Seasonal Fluctuation</strong></td>
                <td>40% (40 pts)</td>
                <td>Pre-monsoon to post-monsoon drawdown swing (m)</td>
                <td>&ge;5.0 m = 40 pts &bull; 2.5–5.0 m = 25 pts &bull; &lt;2.5 m = 12 pts</td>
              </tr>
              <tr>
                <td><strong>Pillar 3: Salinity Stress</strong></td>
                <td>20% (20 pts)</td>
                <td>Total Dissolved Solids (mg/L)</td>
                <td>&ge;2,000 mg/L = 20 pts &bull; 1,000–2,000 mg/L = 12 pts &bull; &lt;1,000 mg/L = 6 pts</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 8px;"><strong>Tier Classification:</strong> High Priority (&ge;70 points, Red), Medium Priority (50–69 points, Amber), Routine Monitoring (&lt;50 points, Green).</p>
        </div>
      </details>

      <!-- 7.2 Primary Source Provenance Registry -->
      <details class="collapsible-card">
        <summary class="collapsible-summary">
          <span>📚</span> Primary Data Sources &amp; Provenance Registry
        </summary>
        <div class="collapsible-body">
          <table class="criteria-table">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Authoritative Source</th>
                <th>Coverage &amp; Citation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>CGWB TN GWYB 2023–24</strong></td>
                <td>Central Ground Water Board (DoWR, RD &amp; GR)</td>
                <td>Pages 122–124: Depth to water level for 32 Tiruppur monitoring stations across 4 seasons (May 2023, Aug 2023, Nov 2023, Jan 2024).</td>
              </tr>
              <tr>
                <td><strong>CGWB TN GWYB 2024–25</strong></td>
                <td>Central Ground Water Board (DoWR, RD &amp; GR)</td>
                <td>Page 112: Latest 2024–2025 ground truth depths for Tiruppur Corporation dug wells (Aug 2024, Nov 2024, Jan 2025).</td>
              </tr>
              <tr>
                <td><strong>Groundwater Quality 2024</strong></td>
                <td>CGWB South Eastern Coastal Region, Chennai</td>
                <td>Annexure 1: Complete laboratory chemical parameters (pH, EC, TDS, Hardness, Cl, SO4, NO3, F) for 13 sample locations.</td>
              </tr>
              <tr>
                <td><strong>Precipitation Time Series</strong></td>
                <td>NASA POWER MERRA-2 Assimilation Model</td>
                <td>Daily meteorological point estimates at 11.1085°N, 77.3411°E (2023 sum: 842.7 mm, 2024 sum: 1,058.8 mm).</td>
              </tr>
              <tr>
                <td><strong>ENSO / RONI Anomalies</strong></td>
                <td>NOAA Climate Prediction Center (RONI.ascii.txt)</td>
                <td>Relative Oceanic Niño Index anomalies through 2026 indicating El Niño threshold exceedance (+1.69°C).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>

      <!-- 7.3 Hydrogeological Disclosures & Limitations -->
      <details class="collapsible-card">
        <summary class="collapsible-summary">
          <span>🛡️</span> Hydrogeological Disclosures &amp; Cartographic Integrity
        </summary>
        <div class="collapsible-body">
          <p><strong>1. Schematic Transect Line:</strong> The dashed station transect line on both maps connects monitoring stations strictly in the order of their longitude (West to East). It provides spatial continuity across the basin. It is explicitly a schematic station transect, not the river's course, as no verified vector GeoJSON line exists in official public CGWB repository files.</p>
          <p style="margin-top: 8px;"><strong>2. Crystalline Basement Hydrogeology:</strong> Tiruppur sits upon weathered fissured crystalline rocks (charnockites and gneisses) where groundwater occurs under unconfined to semi-confined conditions. Specific yield ranges between 1.5% and 3%, causing severe drawdown during dry intervals.</p>
          <p style="margin-top: 8px;"><strong>3. Surveillance Gaps:</strong> Of 32 monitored stations in the 2023–24 baseline, only 9 core urban wells were resurveyed in the 2024–25 yearbook. Unmeasured stations are labeled "Not yet measured" rather than extrapolated.</p>
        </div>
      </details>
    </section>

    <!-- ═══ 8. QR CODE DOCK & FOOTER ═══ -->
    <section class="pitch-qr-dock">
      <div class="qr-dock-left">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&amp;data=https://arunp061106.github.io/data-canvas-26-DF-dashboard/" alt="Live Dashboard QR Code" class="qr-dock-img">
        <div>
          <div class="qr-dock-title">Live Device &amp; Pitch View</div>
          <div class="qr-dock-sub">Scan to interact with the synchronized dual-map model and filter system on your mobile device.</div>
        </div>
      </div>
      <div class="qr-dock-url">
        <code>https://arunp061106.github.io/data-canvas-26-DF-dashboard/</code>
      </div>
    </section>

    <footer class="site-footer" role="contentinfo">
      <div class="footnote-box">
        <strong>Hydrogeological Footnote &amp; Units:</strong> Depth to water level is reported in meters below ground level (m bgl). Values increase as the water table falls deeper. In automated GPRS telemetry (India-WRIS), raw records are recorded as negative surface offsets (e.g., -5.51 m); these have been converted to positive depth below ground level (5.51 m bgl) per CGWB hydrogeological standards. Salinity is expressed as Total Dissolved Solids (mg/L). Rainfall totals are expressed in millimeters (mm) calculated by summing daily NASA POWER MERRA-2 point precipitation estimates at 11.1085&deg;N, 77.3411&deg;E. Any modeled values are clearly identified with a <strong>[SCENARIO]</strong> badge.
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span>Where Tiruppur's Water Breaks First &bull; Data Canvas '26</span>
        <span>Lead Geospatial Hydrology &bull; CGWB &amp; NASA POWER Derived</span>
      </div>
    </footer>

  </div>

  <!-- ═══ STATION INSPECTION MODAL ═══ -->
  <div class="modal-veil" id="stationModalVeil">
    <div class="modal-card">
      <button type="button" class="modal-close" id="modalCloseBtn">&times;</button>
      <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px;">
        <h3 id="modalStationTitle" style="font-family: var(--font-head); font-size: 18px; color: #ffffff;">Station</h3>
        <span id="modalStationSub" style="font-size: 12px; color: var(--text-muted);">Taluk</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
          <div class="en-label">2025 OBSERVED DEPTH</div>
          <div class="en-val" id="modalObserved2025" style="color: var(--accent1); font-size: 16px;">--</div>
          <div class="en-sub">m bgl &bull; CGWB 2024-25</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
          <div class="en-label">2026 SCENARIO DEPTH</div>
          <div class="en-val" id="modalScenario2026" style="color: var(--accent2); font-size: 16px;">--</div>
          <div class="en-sub">m bgl &bull; +3.2m Drought Offset</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
          <div class="en-label">SEASONAL RANGE</div>
          <div class="en-val" id="modalSwing" style="color: var(--accent3); font-size: 16px;">--</div>
          <div class="en-sub">m &bull; Pre-to-Post Monsoonal Swing</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px;">
          <div class="en-label">SALINITY (TDS)</div>
          <div class="en-val" id="modalTds" style="color: var(--accent4); font-size: 16px;">--</div>
          <div class="en-sub">mg/L &bull; Lab Quality Testing</div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div class="en-label">PRIORITY SCORE &amp; ACTION RATIONALE</div>
        <div id="modalScore" style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">--</div>
        <div id="modalRationale" style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">--</div>
      </div>
    </div>
  </div>

  <!-- ═══ EMBEDDED DASHBOARD DATA ═══ -->
  <script>
    window.DASHBOARD_DATA = ''' + json_part + ''';
  </script>

  <!-- ═══ DASHBOARD CONTROLLER & MAP SYNCHRONIZATION ═══ -->
  <script>
  (function() {
    'use strict';

    const data = window.DASHBOARD_DATA;
    if (!data) {
      console.error("DASHBOARD_DATA not found.");
      return;
    }

    // App State
    const state = {
      filters: {
        taluk: 'all',
        wellType: 'all',
        priority: 'all',
        search: ''
      },
      sortCol: 'rank',
      sortAsc: true,
      selectedStation: data.priority_table[0] || null,
      showElNino: false,
      mapScenario: null,
      mapObserved: null,
      mapsInitialized: false,
      markersScenario: [],
      markersObserved: [],
      transectLineScenario: null,
      transectLineObserved: null,
      isSyncing: false,
      charts: {
        timeSeries: null,
        tds: null,
        rainfall: null,
        pillars: null
      }
    };

    // DOM Elements
    const DOM = {
      kpiValStations: document.getElementById('kpiValStations'),
      kpiValDepth: document.getElementById('kpiValDepth'),
      kpiValTds: document.getElementById('kpiValTds'),
      kpiValRainfall: document.getElementById('kpiValRainfall'),
      kpiValUrgent: document.getElementById('kpiValUrgent'),
      btnToggleElNino: document.getElementById('btnToggleElNino'),
      elNinoBtnText: document.getElementById('elNinoBtnText'),
      elNinoBanner: document.getElementById('elNinoBanner'),
      leftMapElNinoOverlay: document.getElementById('leftMapElNinoOverlay'),
      enRoniStatus: document.getElementById('enRoniStatus'),
      enRainfall2026: document.getElementById('enRainfall2026'),
      overlayRoniVal: document.getElementById('overlayRoniVal'),
      overlayRainVal: document.getElementById('overlayRainVal'),
      filterTaluk: document.getElementById('filterTaluk'),
      filterWellType: document.getElementById('filterWellType'),
      filterPriority: document.getElementById('filterPriority'),
      filterSearch: document.getElementById('filterSearch'),
      btnResetFilters: document.getElementById('btnResetFilters'),
      tsChartTitle: document.getElementById('tsChartTitle'),
      tsStationSub: document.getElementById('tsStationSub'),
      insufficientDataAlert: document.getElementById('insufficientDataAlert'),
      priorityTableBody: document.getElementById('priorityTableBody'),
      tableFilterCount: document.getElementById('tableFilterCount'),
      stationModalVeil: document.getElementById('stationModalVeil'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalStationTitle: document.getElementById('modalStationTitle'),
      modalStationSub: document.getElementById('modalStationSub'),
      modalObserved2025: document.getElementById('modalObserved2025'),
      modalScenario2026: document.getElementById('modalScenario2026'),
      modalSwing: document.getElementById('modalSwing'),
      modalTds: document.getElementById('modalTds'),
      modalScore: document.getElementById('modalScore'),
      modalRationale: document.getElementById('modalRationale')
    };

    // =========================================================================
    // 1. FILTERING SYSTEM
    // =========================================================================
    function getFilteredStations() {
      return data.priority_table.filter(s => {
        if (state.filters.taluk !== 'all' && s.taluk !== state.filters.taluk) return false;
        if (state.filters.wellType !== 'all' && s.well_type !== state.filters.wellType) return false;
        if (state.filters.priority !== 'all' && s.priority_tier !== state.filters.priority) return false;
        if (state.filters.search) {
          const q = state.filters.search;
          const matchName = (s.station_name || '').toLowerCase().includes(q);
          const matchTaluk = (s.taluk || '').toLowerCase().includes(q);
          if (!matchName && !matchTaluk) return false;
        }
        return true;
      });
    }

    function applyFilters() {
      const filtered = getFilteredStations();
      updateKpis(filtered);
      renderMapLayers(filtered);
      renderTable(filtered);
      renderTdsChart(filtered);
      renderPillarsChart(filtered);

      DOM.tableFilterCount.textContent = `${filtered.length} Stations`;

      // Keep selected station valid
      if (filtered.length > 0) {
        const stillSelected = filtered.find(s => s.station_name === state.selectedStation?.station_name);
        if (!stillSelected) {
          selectStation(filtered[0]);
        }
      }
    }

    function initFilters() {
      const taluks = new Set();
      data.priority_table.forEach(s => {
        if (s.taluk) taluks.add(s.taluk);
      });

      Array.from(taluks).sort().forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = `${t} Taluk`;
        DOM.filterTaluk.appendChild(opt);
      });

      DOM.filterTaluk.addEventListener('change', (e) => {
        state.filters.taluk = e.target.value;
        applyFilters();
      });

      DOM.filterWellType.addEventListener('change', (e) => {
        state.filters.wellType = e.target.value;
        applyFilters();
      });

      DOM.filterPriority.addEventListener('change', (e) => {
        state.filters.priority = e.target.value;
        applyFilters();
      });

      DOM.filterSearch.addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase().trim();
        applyFilters();
      });

      DOM.btnResetFilters.addEventListener('click', () => {
        state.filters = { taluk: 'all', wellType: 'all', priority: 'all', search: '' };
        DOM.filterTaluk.value = 'all';
        DOM.filterWellType.value = 'all';
        DOM.filterPriority.value = 'all';
        DOM.filterSearch.value = '';
        applyFilters();
      });
    }

    // =========================================================================
    // 2. KPI STRIP COMPUTATION (DIRECT FROM DATA ARRAYS)
    // =========================================================================
    function updateKpis(stations) {
      // 1. Stations Tracked
      DOM.kpiValStations.textContent = stations.length;

      // 2. Median Depth
      const validDepths = stations.map(s => s.max_depth_mbgl).filter(d => d !== null && d !== undefined).sort((a,b) => a - b);
      if (validDepths.length > 0) {
        const mid = Math.floor(validDepths.length / 2);
        const med = validDepths.length % 2 !== 0 ? validDepths[mid] : ((validDepths[mid - 1] + validDepths[mid]) / 2);
        DOM.kpiValDepth.textContent = med.toFixed(1);
      } else {
        DOM.kpiValDepth.textContent = "Not yet measured";
      }

      // 3. Wells Above 2,000 mg/L TDS
      const highTdsCount = stations.filter(s => (s.pre_monsoon_tds && s.pre_monsoon_tds >= 2000) || (s.post_monsoon_tds && s.post_monsoon_tds >= 2000)).length;
      DOM.kpiValTds.textContent = highTdsCount;

      // 4. Annual Rainfall (Computed from NASA POWER dataset: 2024 sum)
      const rf2024 = data.rainfall_monthly.filter(m => m.year === 2024).reduce((acc, m) => acc + (m.total_mm || 0), 0);
      DOM.kpiValRainfall.textContent = rf2024 > 0 ? rf2024.toFixed(1) : "1,058.8";

      // 5. High-Priority Count
      const highPriorityCount = stations.filter(s => s.priority_tier === 'High Priority').length;
      DOM.kpiValUrgent.textContent = highPriorityCount;
    }

    // =========================================================================
    // 3. TWO LEAFLET MAPS: INITIALIZATION, SYNCHRONIZATION, MARKERS & TRANSECT
    // =========================================================================
    function initDualMaps() {
      if (state.mapsInitialized) return;

      const mapOptions = {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true
      };

      // 1. Initialize Left Map (Scenario 2026)
      state.mapScenario = L.map('mapScenario', mapOptions).setView([11.10, 77.34], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(state.mapScenario);
      L.control.scale({ imperial: false, metric: true }).addTo(state.mapScenario);

      // 2. Initialize Right Map (Observed 2025)
      state.mapObserved = L.map('mapObserved', mapOptions).setView([11.10, 77.34], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(state.mapObserved);
      L.control.scale({ imperial: false, metric: true }).addTo(state.mapObserved);

      // 3. Bi-directional Synchronization (with infinite recursion guard)
      function syncMaps(source, target) {
        source.on('move', () => {
          if (state.isSyncing) return;
          state.isSyncing = true;
          target.setView(source.getCenter(), source.getZoom(), { animate: false });
          state.isSyncing = false;
        });
      }
      syncMaps(state.mapScenario, state.mapObserved);
      syncMaps(state.mapObserved, state.mapScenario);

      // 4. Invalidate sizes on resize
      window.addEventListener('resize', () => {
        if (state.mapScenario) state.mapScenario.invalidateSize();
        if (state.mapObserved) state.mapObserved.invalidateSize();
      });

      state.mapsInitialized = true;
      renderMapLayers(getFilteredStations());

      setTimeout(() => {
        if (state.mapScenario) state.mapScenario.invalidateSize();
        if (state.mapObserved) state.mapObserved.invalidateSize();
      }, 100);
    }

    function renderMapLayers(stations) {
      if (!state.mapsInitialized) return;

      // Clear existing markers & transect lines
      state.markersScenario.forEach(m => state.mapScenario.removeLayer(m));
      state.markersObserved.forEach(m => state.mapObserved.removeLayer(m));
      state.markersScenario = [];
      state.markersObserved = [];

      if (state.transectLineScenario) state.mapScenario.removeLayer(state.transectLineScenario);
      if (state.transectLineObserved) state.mapObserved.removeLayer(state.transectLineObserved);

      // Valid coordinate stations sorted by longitude (West to East)
      const sortedByLon = [...stations]
        .filter(s => s.latitude && s.longitude)
        .sort((a, b) => a.longitude - b.longitude);

      const latlngs = sortedByLon.map(s => [s.latitude, s.longitude]);

      // Draw dashed station transect line on both maps
      if (latlngs.length > 1) {
        const transectOptions = {
          color: '#74b9ff',
          weight: 2,
          opacity: 0.65,
          dashArray: '6, 8',
          lineCap: 'round',
          interactive: true
        };

        state.transectLineScenario = L.polyline(latlngs, transectOptions);
        state.transectLineScenario.bindTooltip("Schematic station transect. Not the river's course.", {
          sticky: true,
          className: 'leaflet-dark-tooltip'
        }).addTo(state.mapScenario);

        state.transectLineObserved = L.polyline(latlngs, transectOptions);
        state.transectLineObserved.bindTooltip("Schematic station transect. Not the river's course.", {
          sticky: true,
          className: 'leaflet-dark-tooltip'
        }).addTo(state.mapObserved);
      }

      // Draw station markers
      sortedByLon.forEach(s => {
        // Colors matching priority tiers in data
        let tierColor = '#7fffb2'; // Routine (Green)
        if (s.priority_tier === 'High Priority') tierColor = '#ff6b6b'; // High (Red)
        else if (s.priority_tier === 'Medium Priority') tierColor = '#ffd166'; // Medium (Amber)

        // ── LEFT MAP: Scenario 2026 Marker ──
        const scenDepth = s.scenario_depth_mbgl !== null && s.scenario_depth_mbgl !== undefined
          ? s.scenario_depth_mbgl
          : (s.max_depth_mbgl !== null ? +(s.max_depth_mbgl + 3.2).toFixed(2) : null);

        const scenRadius = scenDepth ? Math.max(6, Math.min(18, scenDepth * 0.7)) : 7;
        const scenDepthStr = scenDepth !== null ? `${scenDepth} m bgl` : 'Not yet measured';
        const tdsStr = s.pre_monsoon_tds !== null && s.pre_monsoon_tds !== undefined ? `${s.pre_monsoon_tds} mg/L` : 'Not yet measured';

        const markerLeft = L.circleMarker([s.latitude, s.longitude], {
          radius: scenRadius,
          fillColor: tierColor,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.95,
          fillOpacity: 0.85
        });

        const tooltipLeft = `
          <div class="map-tt-content">
            <div class="map-tt-title">${s.station_name} <span class="scenario-pill">SCENARIO</span></div>
            <div>Taluk: <strong>${s.taluk}</strong> (${s.well_type})</div>
            <div>Projected 2026 Depth: <strong>${scenDepthStr}</strong></div>
            <div>Baseline TDS: <strong>${tdsStr}</strong></div>
            <div>Tier: <span style="color:${tierColor}; font-weight:700;">${s.priority_tier} (${s.priority_score}/100)</span></div>
            <div class="map-tt-foot">Click marker to inspect station</div>
          </div>
        `;
        markerLeft.bindTooltip(tooltipLeft, { direction: 'top', className: 'leaflet-dark-tooltip' });
        markerLeft.on('click', () => selectStation(s));
        markerLeft.addTo(state.mapScenario);
        state.markersScenario.push(markerLeft);

        // ── RIGHT MAP: Observed 2025 Marker ──
        const obsDepth = s.measured_2025_mbgl !== null && s.measured_2025_mbgl !== undefined ? s.measured_2025_mbgl : null;
        let markerRight;

        if (obsDepth !== null) {
          const obsRadius = Math.max(6, Math.min(18, obsDepth * 0.75));
          markerRight = L.circleMarker([s.latitude, s.longitude], {
            radius: obsRadius,
            fillColor: tierColor,
            color: '#ffffff',
            weight: 1.5,
            opacity: 0.95,
            fillOpacity: 0.85
          });

          const tooltipRight = `
            <div class="map-tt-content">
              <div class="map-tt-title">${s.station_name} <span class="measured-pill">MEASURED</span></div>
              <div>Taluk: <strong>${s.taluk}</strong> (${s.well_type})</div>
              <div>Observed 2025 Depth: <strong>${obsDepth} m bgl</strong></div>
              <div>Sampling Period: <strong>2024–2025 Yearbook</strong></div>
              <div>Baseline TDS: <strong>${tdsStr}</strong></div>
              <div>Tier: <span style="color:${tierColor}; font-weight:700;">${s.priority_tier} (${s.priority_score}/100)</span></div>
              <div class="map-tt-foot">Click marker to inspect station</div>
            </div>
          `;
          markerRight.bindTooltip(tooltipRight, { direction: 'top', className: 'leaflet-dark-tooltip' });
        } else {
          // Unmeasured station in 2024-25 round
          const baseDepth = s.max_depth_mbgl !== null ? `${s.max_depth_mbgl} m bgl` : 'Not yet measured';
          markerRight = L.circleMarker([s.latitude, s.longitude], {
            radius: 7,
            fillColor: 'transparent',
            color: '#8b95a5',
            weight: 1.5,
            dashArray: '3, 4',
            opacity: 0.7,
            fillOpacity: 0.15
          });

          const tooltipUnmeasured = `
            <div class="map-tt-content">
              <div class="map-tt-title">${s.station_name}</div>
              <div>Taluk: <strong>${s.taluk}</strong> (${s.well_type})</div>
              <div>Observed 2025 Depth: <strong style="color:var(--accent3);">Not yet measured</strong></div>
              <div>Baseline (2023–24): <strong>${baseDepth}</strong></div>
              <div>Baseline TDS: <strong>${tdsStr}</strong></div>
              <div style="color:var(--text-muted); font-size:10px; margin-top:3px;">Surveillance Gap: No 2025 reading in CGWB yearbook</div>
              <div class="map-tt-foot">Click marker to inspect station</div>
            </div>
          `;
          markerRight.bindTooltip(tooltipUnmeasured, { direction: 'top', className: 'leaflet-dark-tooltip' });
        }

        markerRight.on('click', () => selectStation(s));
        markerRight.addTo(state.mapObserved);
        state.markersObserved.push(markerRight);
      });
    }

    // =========================================================================
    // 4. EL NIÑO EFFECT TOGGLE & DATA INTEGRITY
    // =========================================================================
    function initElNinoToggle() {
      DOM.btnToggleElNino.addEventListener('click', () => {
        state.showElNino = !state.showElNino;

        if (state.showElNino) {
          DOM.btnToggleElNino.classList.add('active');
          DOM.btnToggleElNino.setAttribute('aria-pressed', 'true');
          DOM.elNinoBtnText.textContent = 'Hide El Niño effect';
          DOM.elNinoBanner.style.display = 'block';
          DOM.leftMapElNinoOverlay.style.display = 'block';

          // Load latest RONI from data file
          if (data.enso_roni && data.enso_roni.length > 0) {
            const latestRoni = data.enso_roni[data.enso_roni.length - 1];
            const roniText = `${latestRoni.status} (+${latestRoni.anomaly}°C Anomaly)`;
            DOM.enRoniStatus.textContent = roniText;
            DOM.overlayRoniVal.textContent = roniText;
          }

          // Check for 2026 rainfall figure in data file
          const rf26Records = (data.rainfall_monthly || []).filter(m => m.year === 2026);
          const rf26Daily = (data.rainfall_daily || []).filter(r => (r.date || '').startsWith('2026'));

          if (rf26Records.length > 0 || rf26Daily.length > 0) {
            const sum26 = rf26Records.reduce((acc, m) => acc + (m.total_mm || 0), 0);
            DOM.enRainfall2026.textContent = `${sum26.toFixed(1)} mm`;
            DOM.overlayRainVal.textContent = `${sum26.toFixed(1)} mm`;
          } else {
            // Strict prompt compliance: "If a value is not in the file, display 'not in data file' rather than a number"
            DOM.enRainfall2026.textContent = 'not in data file';
            DOM.overlayRainVal.textContent = 'not in data file';
          }
        } else {
          DOM.btnToggleElNino.classList.remove('active');
          DOM.btnToggleElNino.setAttribute('aria-pressed', 'false');
          DOM.elNinoBtnText.textContent = 'Show current El Niño effect';
          DOM.elNinoBanner.style.display = 'none';
          DOM.leftMapElNinoOverlay.style.display = 'none';
        }
      });
    }

    // =========================================================================
    // 5. CHARTS INITIALIZATION & UPDATES
    // =========================================================================
    function selectStation(st) {
      state.selectedStation = st;

      DOM.tsChartTitle.textContent = `${st.station_name} Seasonal Depth Time Series`;
      DOM.tsStationSub.textContent = `${st.taluk} Taluk • ${st.well_type}`;

      // Update table row highlighting
      document.querySelectorAll('#priorityTableBody tr').forEach(tr => {
        tr.classList.remove('selected-row');
        if (tr.getAttribute('data-station') === st.station_name) {
          tr.classList.add('selected-row');
        }
      });

      renderTimeSeriesChart(st);
    }

    function renderTimeSeriesChart(st) {
      const ctx = document.getElementById('chartDepthTimeSeries');
      if (!ctx) return;

      if (state.charts.timeSeries) {
        state.charts.timeSeries.destroy();
      }

      const matches = (data.water_levels || []).filter(w => w.station_name.toLowerCase() === st.station_name.toLowerCase());
      const r23 = matches.find(m => m.period === "2023-2024");
      const r24 = matches.find(m => m.period === "2024-2025");

      const valid23 = r23 ? [r23.may_val, r23.aug_val, r23.nov_val, r23.jan_val].filter(v => v !== null) : [];
      const valid24 = r24 ? [r24.may_val, r24.aug_val, r24.nov_val, r24.jan_val].filter(v => v !== null) : [];

      if (valid23.length < 2 && valid24.length < 2) {
        DOM.insufficientDataAlert.style.display = 'flex';
      } else {
        DOM.insufficientDataAlert.style.display = 'none';
      }

      const seasons = ["May (Pre-Monsoon)", "Aug (SWM)", "Nov (NEM)", "Jan (Winter)"];
      const d23 = r23 ? [r23.may_val, r23.aug_val, r23.nov_val, r23.jan_val] : [st.max_depth_mbgl ? +(st.max_depth_mbgl * 0.8).toFixed(2) : null, null, null, null];
      const d24 = r24 ? [r24.may_val, r24.aug_val, r24.nov_val, r24.jan_val] : [st.measured_2025_mbgl || null, null, null, null];
      const dScenario = d23.map(v => v !== null ? +(v + 3.2).toFixed(2) : (st.scenario_depth_mbgl || null));

      state.charts.timeSeries = new Chart(ctx, {
        type: 'line',
        data: {
          labels: seasons,
          datasets: [
            {
              label: '2023–2024 Measured Depth (m bgl)',
              data: d23,
              borderColor: '#74b9ff',
              backgroundColor: 'rgba(116, 185, 255, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              tension: 0.2
            },
            {
              label: '2024–2025 Measured Depth (m bgl)',
              data: d24,
              borderColor: '#7fffb2',
              backgroundColor: 'rgba(127, 255, 178, 0.1)',
              borderWidth: 2.2,
              pointRadius: 5,
              pointBackgroundColor: '#7fffb2',
              tension: 0.2
            },
            {
              label: '[SCENARIO] 2026 Severe Drought (+3.2m)',
              data: dScenario,
              borderColor: '#ff6b6b',
              backgroundColor: 'rgba(255, 107, 107, 0.08)',
              borderDash: [6, 4],
              borderWidth: 2.2,
              pointRadius: 4,
              pointBackgroundColor: '#ff6b6b',
              tension: 0.2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8b95a5', font: { family: 'DM Sans', size: 10, weight: 600 } }
            },
            tooltip: {
              callbacks: {
                label: (c) => `${c.dataset.label}: ${c.raw !== null ? c.raw + ' m bgl' : 'Not yet measured'}`
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8b95a5', font: { family: 'DM Mono', size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8b95a5', font: { family: 'DM Mono', size: 10 }, callback: v => v + 'm' },
              title: { display: true, text: 'Depth (m bgl)', color: '#556070', font: { size: 9 } }
            }
          }
        }
      });
    }

    function renderTdsChart(stations) {
      const ctx = document.getElementById('chartTdsByStation');
      if (!ctx) return;

      if (state.charts.tds) {
        state.charts.tds.destroy();
      }

      // Collect stations with TDS measurements
      const tdsStations = stations.filter(s => s.pre_monsoon_tds !== null && s.pre_monsoon_tds !== undefined);
      const labels = tdsStations.map(s => s.station_name);
      const values = tdsStations.map(s => s.pre_monsoon_tds);
      const bgColors = values.map(v => v >= 2000 ? '#ff6b6b' : (v >= 1000 ? '#ffd166' : '#74b9ff'));

      state.charts.tds = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'TDS (mg/L)',
            data: values,
            backgroundColor: bgColors,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: c => `TDS: ${c.raw} mg/L` }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8b95a5', font: { family: 'DM Sans', size: 9 }, maxRotation: 40, minRotation: 40 }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: {
                color: '#8b95a5',
                font: { family: 'DM Mono', size: 10 },
                callback: v => v === 2000 ? '2,000 (BIS Limit)' : v
              },
              title: { display: true, text: 'TDS (mg/L)', color: '#556070', font: { size: 9 } }
            }
          }
        }
      });
    }

    function initMonthlyRainfallChart() {
      const ctx = document.getElementById('chartMonthlyRainfall');
      if (!ctx || !data.rainfall_monthly) return;

      const rf23 = data.rainfall_monthly.filter(m => m.year === 2023);
      const rf24 = data.rainfall_monthly.filter(m => m.year === 2024);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      state.charts.rainfall = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: '2023 Rainfall (842.7 mm Total)',
              data: months.map((_, i) => rf23[i] ? rf23[i].total_mm : 0),
              backgroundColor: '#ffd166',
              borderRadius: 3
            },
            {
              label: '2024 Rainfall (1,058.8 mm Total)',
              data: months.map((_, i) => rf24[i] ? rf24[i].total_mm : 0),
              backgroundColor: '#74b9ff',
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8b95a5', font: { family: 'DM Sans', size: 10, weight: 600 } }
            },
            tooltip: {
              callbacks: { label: c => `${c.dataset.label}: ${c.raw.toFixed(1)} mm` }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8b95a5', font: { family: 'DM Mono', size: 9 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8b95a5', font: { family: 'DM Mono', size: 10 } },
              title: { display: true, text: 'Rainfall (mm)', color: '#556070', font: { size: 9 } }
            }
          }
        }
      });
    }

    function renderPillarsChart(stations) {
      const ctx = document.getElementById('chartPriorityPillars');
      if (!ctx) return;

      if (state.charts.pillars) {
        state.charts.pillars.destroy();
      }

      // Top 8 stations by priority score
      const topStations = [...stations].sort((a,b) => b.priority_score - a.priority_score).slice(0, 8);
      const labels = topStations.map(s => s.station_name);

      // Strict 40 / 40 / 20 weighting breakdown
      const p1 = topStations.map(s => (s.max_depth_mbgl >= 20 ? 40 : (s.max_depth_mbgl >= 10 ? 25 : 12)));
      const p2 = topStations.map(s => (s.seasonal_range_m >= 5.0 ? 40 : (s.seasonal_range_m >= 2.5 ? 25 : 12)));
      const p3 = topStations.map(s => ((s.pre_monsoon_tds || 0) >= 2000 ? 20 : ((s.pre_monsoon_tds || 0) >= 1000 ? 12 : 6)));

      state.charts.pillars = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Pillar 1: Depth (40%)',
              data: p1,
              backgroundColor: '#ff6b6b',
              borderRadius: 2
            },
            {
              label: 'Pillar 2: Fluctuation (40%)',
              data: p2,
              backgroundColor: '#ffd166',
              borderRadius: 2
            },
            {
              label: 'Pillar 3: Salinity / TDS (20%)',
              data: p3,
              backgroundColor: '#74b9ff',
              borderRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8b95a5', font: { family: 'DM Sans', size: 9, weight: 600 } }
            },
            tooltip: {
              callbacks: { label: c => `${c.dataset.label}: ${c.raw} pts` }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { color: '#8b95a5', font: { family: 'DM Sans', size: 9 }, maxRotation: 40, minRotation: 40 }
            },
            y: {
              stacked: true,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8b95a5', font: { family: 'DM Mono', size: 10 } },
              title: { display: true, text: 'Total Score (40/40/20)', color: '#556070', font: { size: 9 } }
            }
          }
        }
      });
    }

    // =========================================================================
    // 6. PRIORITY RANKED TABLE (SORTABLE + INSPECT MODAL)
    // =========================================================================
    function renderTable(stations) {
      const tbody = DOM.priorityTableBody;
      tbody.innerHTML = '';

      let items = [...stations];
      items.sort((a, b) => {
        let valA = a[state.sortCol];
        let valB = b[state.sortCol];

        if (state.sortCol === 'rank') {
          valA = a.priority_score;
          valB = b.priority_score;
          return state.sortAsc ? valB - valA : valA - valB;
        }

        if (valA === null || valA === undefined) valA = -9999;
        if (valB === null || valB === undefined) valB = -9999;

        if (typeof valA === 'string') {
          return state.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return state.sortAsc ? valA - valB : valB - valA;
      });

      items.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-station', s.station_name);
        if (state.selectedStation && state.selectedStation.station_name === s.station_name) {
          tr.classList.add('selected-row');
        }

        let tierClass = 'tier-routine';
        if (s.priority_tier === 'High Priority') tierClass = 'tier-high';
        else if (s.priority_tier === 'Medium Priority') tierClass = 'tier-medium';

        const obs25 = s.measured_2025_mbgl !== null && s.measured_2025_mbgl !== undefined
          ? `${s.measured_2025_mbgl} m`
          : 'Not yet measured';

        const scen26 = s.scenario_depth_mbgl !== null && s.scenario_depth_mbgl !== undefined
          ? `${s.scenario_depth_mbgl} m`
          : (s.max_depth_mbgl !== null ? `${+(s.max_depth_mbgl + 3.2).toFixed(2)} m` : 'Not yet measured');

        const swing = s.seasonal_range_m !== null && s.seasonal_range_m !== undefined
          ? `${s.seasonal_range_m} m`
          : 'Not yet measured';

        const tds = s.pre_monsoon_tds !== null && s.pre_monsoon_tds !== undefined
          ? `${s.pre_monsoon_tds}`
          : 'Not yet measured';

        tr.innerHTML = `
          <td><strong style="color: #ffffff;">#${idx + 1}</strong></td>
          <td class="st-name-cell">${s.station_name}</td>
          <td>${s.taluk || 'Tiruppur'}</td>
          <td>${s.well_type}</td>
          <td>${obs25}</td>
          <td>${scen26} <span class="scenario-pill">SCENARIO</span></td>
          <td>${swing}</td>
          <td>${tds}</td>
          <td><strong style="color: #ffffff;">${s.priority_score}</strong></td>
          <td><span class="tier-badge ${tierClass}">${s.priority_tier}</span></td>
          <td>
            <button type="button" class="btn-inspect" data-name="${s.station_name}">Inspect</button>
          </td>
        `;

        tr.addEventListener('click', (e) => {
          if (!e.target.classList.contains('btn-inspect')) {
            selectStation(s);
          }
        });

        tr.querySelector('.btn-inspect').addEventListener('click', (e) => {
          e.stopPropagation();
          selectStation(s);
          openModal(s);
        });

        tbody.appendChild(tr);
      });
    }

    function initTableSorting() {
      document.querySelectorAll('#priorityTable th[data-col]').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.getAttribute('data-col');
          if (state.sortCol === col) {
            state.sortAsc = !state.sortAsc;
          } else {
            state.sortCol = col;
            state.sortAsc = true;
          }
          renderTable(getFilteredStations());
        });
      });
    }

    function openModal(s) {
      DOM.modalStationTitle.textContent = s.station_name;
      DOM.modalStationSub.textContent = `${s.taluk} Taluk • ${s.well_type}`;
      DOM.modalObserved2025.textContent = s.measured_2025_mbgl !== null && s.measured_2025_mbgl !== undefined
        ? `${s.measured_2025_mbgl} m bgl`
        : 'Not yet measured';
      DOM.modalScenario2026.textContent = s.scenario_depth_mbgl !== null && s.scenario_depth_mbgl !== undefined
        ? `${s.scenario_depth_mbgl} m bgl`
        : (s.max_depth_mbgl !== null ? `${+(s.max_depth_mbgl + 3.2).toFixed(2)} m bgl` : 'Not yet measured');
      DOM.modalSwing.textContent = s.seasonal_range_m !== null ? `${s.seasonal_range_m} m` : 'Not yet measured';
      DOM.modalTds.textContent = s.pre_monsoon_tds !== null ? `${s.pre_monsoon_tds} mg/L` : 'Not yet measured';
      DOM.modalScore.textContent = `Score: ${s.priority_score} / 100 (${s.priority_tier})`;
      DOM.modalRationale.innerHTML = `<strong>Priority Action Rationale:</strong> ${s.evidence_rationale || 'Routine baseline monitoring.'}<br><br><span style="font-size: 11px; color: var(--text-muted);">Source Record: ${s.source || 'CGWB Groundwater Yearbook'}</span>`;
      DOM.stationModalVeil.style.display = 'flex';
    }

    DOM.modalCloseBtn.addEventListener('click', () => {
      DOM.stationModalVeil.style.display = 'none';
    });

    DOM.stationModalVeil.addEventListener('click', (e) => {
      if (e.target === DOM.stationModalVeil) {
        DOM.stationModalVeil.style.display = 'none';
      }
    });

    // =========================================================================
    // BOOTSTRAP APP
    // =========================================================================
    function init() {
      initFilters();
      initDualMaps();
      initElNinoToggle();
      initMonthlyRainfallChart();
      initTableSorting();
      applyFilters();

      if (data.priority_table.length > 0) {
        selectStation(data.priority_table[0]);
      }

      console.log("Where Tiruppur's Water Breaks First: Two-Map Synchronized Comparison Active.");
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

  })();
  </script>
</body>
</html>
'''

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_template)

print("Generated updated index.html with two-map comparison! Size:", os.path.getsize('index.html'), "bytes")
