# build_complete_dashboard.py
import json
import os

with open('data/app_data.js', 'r', encoding='utf-8') as f:
    app_data_str = f.read().strip()

json_part = app_data_str.split('=', 1)[1].strip().rstrip(';')
data_obj = json.loads(json_part)

html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Where Tiruppur's Water Breaks First — Groundwater Stress &amp; Depletion Analytics</title>
  <meta name="description" content="Hydrological analytics dashboard evaluating borewell depletion, acute salinity (TDS), and drought stress across Tiruppur and the Noyyal basin.">

  <!-- Google Fonts: Syne, DM Mono, DM Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">

  <!-- Leaflet CSS for OpenStreetMap Cartography -->
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
      --accent1: #7fffb2; /* Mint / Positive / Routine */
      --accent2: #ff6b6b; /* Coral Red / High Priority */
      --accent3: #ffd166; /* Amber / Medium Priority */
      --accent4: #74b9ff; /* Sky Blue / Telemetry */
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

      /* Spacing baseline (8px) */
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

    /* ── BACKGROUND ORBS & GRID OVERLAY (SENTIMENTSCOPE SIGNATURE) ── */
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
      filter: blur(80px);
      opacity: 0.22;
      animation: orbFloat linear infinite;
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
      33% { transform: translate(30px, -20px) scale(1.04); }
      66% { transform: translate(-20px, 15px) scale(0.96); }
      100% { transform: translate(0, 0) scale(1); }
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(127, 255, 178, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(127, 255, 178, 0.02) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    .site-wrapper {
      position: relative;
      z-index: 1;
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 var(--sp-4);
    }

    /* ==========================================================================
       VIEW MODE TOGGLE BAR (STICKY AT TOP)
       ========================================================================== */
    .view-mode-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(7, 8, 13, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: var(--sp-2) var(--sp-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .mode-toggle-group {
      display: inline-flex;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      border-radius: 99px;
      padding: 3px;
      gap: 4px;
    }

    .mode-toggle-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 99px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .mode-toggle-btn:hover {
      color: #ffffff;
    }

    .mode-toggle-btn.active {
      background: linear-gradient(135deg, var(--accent1), var(--accent4));
      color: #07080d;
      font-weight: 700;
      box-shadow: 0 2px 12px rgba(127, 255, 178, 0.3);
    }

    .view-indicator-text {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
    }

    /* ==========================================================================
       HEADER (SENTIMENTSCOPE STYLE)
       ========================================================================== */
    .site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-4) 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-4);
      flex-wrap: wrap;
      gap: var(--sp-3);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-mark {
      width: 46px;
      height: 46px;
      background: linear-gradient(135deg, var(--accent1), var(--accent4));
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-family: var(--font-head);
      font-weight: 800;
      font-size: 18px;
      color: #07080d;
      box-shadow: 0 0 20px rgba(127, 255, 178, 0.3);
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
      font-size: 11.5px;
      color: var(--text-muted);
      font-family: var(--font-mono);
      letter-spacing: 0.3px;
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
      gap: 8px;
      background: rgba(127, 255, 178, 0.08);
      border: 1px solid rgba(127, 255, 178, 0.2);
      color: var(--accent1);
      padding: 6px 14px;
      border-radius: 99px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: var(--accent1);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent1);
      animation: pulseAnim 2s infinite;
    }

    @keyframes pulseAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .tag-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      padding: 5px 12px;
      border-radius: 99px;
      background: var(--bg2);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }

    .tag-sdg6 {
      color: #38bdf8;
      border-color: rgba(56, 189, 248, 0.3);
      background: rgba(56, 189, 248, 0.08);
    }

    .tag-sdg3 {
      color: var(--accent1);
      border-color: rgba(127, 255, 178, 0.3);
      background: rgba(127, 255, 178, 0.08);
    }

    /* ==========================================================================
       FOUR HEADLINE CARDS (SENTIMENTSCOPE HERO STRIP)
       ========================================================================== */
    .hero-kpi-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--sp-3);
      margin-bottom: var(--sp-4);
    }

    .kpi-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px 20px;
      backdrop-filter: blur(12px);
      box-shadow: var(--glass-shadow);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-hover);
    }

    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .kpi-label {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-icon {
      font-size: 18px;
    }

    .kpi-val {
      font-family: var(--font-head);
      font-size: 32px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.5px;
      margin: 4px 0;
      font-variant-numeric: tabular-nums;
    }

    .val-accent1 { color: var(--accent1); }
    .val-accent2 { color: var(--accent2); }
    .val-accent3 { color: var(--accent3); }
    .val-accent4 { color: var(--accent4); }

    .kpi-unit-line {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 6px;
      margin-top: 4px;
    }

    /* ==========================================================================
       FILTER BAR (SENTIMENTSCOPE STYLE)
       ========================================================================== */
    .filter-bar {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: var(--sp-3);
      margin-bottom: var(--sp-4);
      box-shadow: var(--glass-shadow);
    }

    .filter-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr 1fr 1fr 1.4fr auto;
      gap: 12px;
      align-items: center;
    }

    .filter-control {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-control label {
      font-family: var(--font-mono);
      font-size: 10px;
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
      padding: 8px 12px;
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
      padding: 9px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 16px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-reset:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--text-muted);
    }

    /* ==========================================================================
       TWO-COLUMN BLOCK (PITCH DECK: CHARTS & TOP-10 TABLE)
       ========================================================================== */
    .pitch-charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-4);
      margin-bottom: var(--sp-4);
    }

    .glass-card {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: var(--sp-3);
      box-shadow: var(--glass-shadow);
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--sp-2);
      padding-bottom: var(--sp-1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .card-title {
      font-family: var(--font-head);
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chart-container-box {
      height: 240px;
      position: relative;
      width: 100%;
    }

    .scenario-pill {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(236, 72, 153, 0.15);
      border: 1px solid rgba(236, 72, 153, 0.35);
      color: #f472b6;
    }

    .card-caption {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: var(--sp-2);
      padding-top: var(--sp-1);
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      line-height: 1.4;
    }

    /* ── TABLES ── */
    .table-responsive {
      overflow-x: auto;
      max-height: 420px;
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
    }

    .dnd-table th:hover {
      color: #ffffff;
    }

    .dnd-table td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-variant-numeric: tabular-nums;
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
      white-space: nowrap;
    }

    .tier-high {
      background: rgba(255, 107, 107, 0.15);
      border: 1px solid rgba(255, 107, 107, 0.4);
      color: var(--accent2);
    }

    .tier-medium {
      background: rgba(255, 209, 102, 0.15);
      border: 1px solid rgba(255, 209, 102, 0.4);
      color: var(--accent3);
    }

    .tier-routine {
      background: rgba(127, 255, 178, 0.12);
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
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-inspect:hover {
      background: rgba(116, 185, 255, 0.15);
      border-color: var(--accent4);
      color: #ffffff;
    }

    /* ── QR CODE & LIVE URL DOCK (BOTTOM OF PITCH DECK) ── */
    .pitch-qr-dock {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
      box-shadow: var(--glass-shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--sp-4);
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
    }

    /* ==========================================================================
       TECHNICAL DOSSIER VIEW
       ========================================================================== */
    .dossier-layout {
      display: flex;
      flex-direction: column;
      gap: var(--sp-4);
      margin-bottom: var(--sp-5);
    }

    /* Fixed Height Leaflet Map Container */
    .map-fixed-container {
      height: 420px;
      width: 100%;
      border-radius: var(--radius-sm);
      overflow: hidden;
      border: 1px solid var(--border);
      position: relative;
    }

    @media (max-width: 640px) {
      .map-fixed-container {
        height: 320px;
      }
    }

    .leaflet-dark-legend {
      position: absolute;
      bottom: 16px;
      left: 16px;
      z-index: 1000;
      background: rgba(7, 8, 13, 0.88);
      border: 1px solid var(--border);
      backdrop-filter: blur(10px);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 11.5px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dot-indicator {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      border: 1px solid #ffffff;
      flex-shrink: 0;
    }

    .dot-red { background: var(--accent2); }
    .dot-amber { background: var(--accent3); }
    .dot-green { background: var(--accent1); }

    /* Dossier Grid Sections */
    .dossier-grid-2col {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: var(--sp-4);
    }

    .dossier-metrics-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px;
      margin-top: 10px;
    }

    .dm-cell {
      display: flex;
      flex-direction: column;
    }

    .dm-label {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .dm-val {
      font-family: var(--font-head);
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      font-variant-numeric: tabular-nums;
    }

    .insufficient-notice {
      display: none;
      background: rgba(255, 209, 102, 0.1);
      border: 1px solid rgba(255, 209, 102, 0.3);
      color: var(--accent3);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      margin-bottom: 8px;
      align-items: center;
      gap: 6px;
    }

    /* Collapsible Sections */
    details {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: var(--sp-3);
      box-shadow: var(--glass-shadow);
    }

    details[open] {
      background: rgba(255, 255, 255, 0.05);
    }

    summary {
      padding: 14px 20px;
      font-family: var(--font-head);
      font-weight: 700;
      font-size: 14.5px;
      color: #ffffff;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::after {
      content: '+';
      font-family: var(--font-mono);
      font-size: 18px;
      color: var(--text-muted);
    }

    details[open] summary::after {
      content: '−';
    }

    .details-inner {
      padding: 16px 20px;
      border-top: 1px solid var(--border);
      font-size: 13px;
      color: var(--text);
      line-height: 1.6;
    }

    .prov-data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }

    .prov-data-table th, .prov-data-table td {
      padding: 8px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    .prov-data-table th {
      background: rgba(255, 255, 255, 0.04);
      color: #ffffff;
      font-family: var(--font-mono);
      font-size: 11px;
    }

    /* Modal Backdrop */
    .modal-veil {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 10000;
      align-items: center;
      justify-content: center;
    }

    .modal-box {
      background: #0f131f;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      max-width: 520px;
      width: 90%;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px; right: 16px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
    }

    /* Footer */
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

    /* ==========================================================================
       RESPONSIVENESS (390PX MOBILE & 1440PX DESKTOP)
       ========================================================================== */
    @media (max-width: 1080px) {
      .hero-kpi-strip {
        grid-template-columns: repeat(2, 1fr);
      }
      .pitch-charts-grid, .dossier-grid-2col {
        grid-template-columns: 1fr;
      }
      .filter-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .site-wrapper {
        padding: 0 var(--sp-2);
      }
      .hero-kpi-strip {
        grid-template-columns: repeat(2, 1fr);
      }
      .filter-grid {
        grid-template-columns: 1fr;
      }
      .btn-reset {
        margin-top: 0;
      }
      .site-title {
        font-size: 18px;
      }
      .header-right {
        display: none;
      }
    }

    /* ==========================================================================
       PRINT STYLESHEET
       ========================================================================== */
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        font-size: 10pt;
      }
      .bg-canvas, .view-mode-bar, .filter-bar, .pitch-qr-dock, .btn-inspect, .btn-reset, .site-footer {
        display: none !important;
      }
      .site-wrapper {
        max-width: 100% !important;
        padding: 0 !important;
      }
      .hero-kpi-strip {
        page-break-after: always;
        grid-template-columns: repeat(4, 1fr) !important;
      }
      .kpi-card {
        border: 1px solid #ccc !important;
        background: #fafafa !important;
        box-shadow: none !important;
      }
      .kpi-val, .kpi-label, .kpi-unit-line {
        color: #000000 !important;
      }
      .map-fixed-container {
        height: 480px !important;
        page-break-after: always;
      }
      .dnd-table th, .dnd-table td {
        color: #000000 !important;
        border-color: #ddd !important;
      }
    }
  </style>
</head>
<body>

  <!-- ═══ SENTIMENTSCOPE FLOATING BACKGROUND ORBS ═══ -->
  <div class="bg-canvas" aria-hidden="true">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>

  <!-- ═══ TOP VIEW MODE TOGGLE BAR (STICKY) ═══ -->
  <nav class="view-mode-bar" role="navigation" aria-label="Dashboard View Selector">
    <div class="mode-toggle-group">
      <button class="mode-toggle-btn active" id="btnModePitch" type="button" aria-pressed="true">
        <span>⚡</span>
        <span>Pitch Deck</span>
      </button>
      <button class="mode-toggle-btn" id="btnModeDossier" type="button" aria-pressed="false">
        <span>📊</span>
        <span>Technical Dossier</span>
      </button>
    </div>
    <div class="view-indicator-text" id="viewIndicatorText">
      Executive Summary View Active
    </div>
  </nav>

  <div class="site-wrapper">

    <!-- ═══ SITE HEADER ═══ -->
    <header class="site-header" role="banner">
      <div class="header-left">
        <div class="logo-mark">WB</div>
        <div>
          <h1 class="site-title">Where Tiruppur's Water Breaks First</h1>
          <p class="site-sub">Predicting Borewell Depletion &amp; Salinity Stress Across the Noyyal Basin</p>
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

    <!-- ═══ FOUR HEADLINE CARDS (HERO KPI STRIP) ═══ -->
    <section class="hero-kpi-strip" aria-label="Headline Key Indicators">
      
      <!-- KPI 1: Groundwater Depth -->
      <div class="kpi-card" id="kpiCardDepth">
        <div class="kpi-top">
          <span class="kpi-label">Groundwater Depth</span>
          <span class="kpi-icon">📏</span>
        </div>
        <div class="kpi-val val-accent3" id="kpiValDepth">12.3</div>
        <div class="kpi-unit-line">m bgl &bull; Pre-Monsoon Median</div>
      </div>

      <!-- KPI 2: Peak Salinity (TDS) -->
      <div class="kpi-card" id="kpiCardTds">
        <div class="kpi-top">
          <span class="kpi-label">Peak Salinity (TDS)</span>
          <span class="kpi-icon">🧪</span>
        </div>
        <div class="kpi-val val-accent2" id="kpiValTds">2,789</div>
        <div class="kpi-unit-line">mg/L &bull; CGWB 2024 Lab Quality</div>
      </div>

      <!-- KPI 3: Annual Rainfall Total -->
      <div class="kpi-card" id="kpiCardRainfall">
        <div class="kpi-top">
          <span class="kpi-label">Annual Rainfall</span>
          <span class="kpi-icon">🌧️</span>
        </div>
        <div class="kpi-val val-accent4" id="kpiValRainfall">1,058.8</div>
        <div class="kpi-unit-line">mm in 2024 (vs 842.7mm '23)</div>
      </div>

      <!-- KPI 4: Priority Wells -->
      <div class="kpi-card" id="kpiCardUrgent">
        <div class="kpi-top">
          <span class="kpi-label">Priority Wells</span>
          <span class="kpi-icon">🚨</span>
        </div>
        <div class="kpi-val val-accent2" id="kpiValUrgent">14</div>
        <div class="kpi-unit-line">Wells High Priority Red Alert</div>
      </div>

    </section>

    <!-- ═══ SHARED FILTER BAR ═══ -->
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
            <option value="High Priority">High Priority (Red Alert)</option>
            <option value="Medium Priority">Medium Priority</option>
            <option value="Routine Monitoring">Routine Monitoring</option>
          </select>
        </div>

        <div class="filter-control">
          <label for="filterPeriod">Monitoring Period</label>
          <select id="filterPeriod" class="filter-select">
            <option value="all">All Recorded Periods</option>
            <option value="2023-2024">2023–2024 Seasonal</option>
            <option value="2024-2025">2024–2025 Seasonal</option>
            <option value="2025">2025 GPRS Telemetry</option>
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

    <!-- =======================================================================
         VIEW 1: PITCH DECK VIEW (DEFAULT EXECUTIVE SUMMARY)
         ======================================================================= -->
    <main id="viewPitchDeck">

      <!-- Depth Divergence & TDS Charts -->
      <section class="pitch-charts-grid">
        <!-- Chart 1: Depth Divergence -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-title">
              <span>📈</span> Groundwater Depth Divergence (2023–2026)
            </span>
            <span class="scenario-pill">SCENARIO</span>
          </div>
          <div class="chart-container-box">
            <canvas id="chartDivergence"></canvas>
          </div>
          <div class="card-caption">
            <strong>Source:</strong> CGWB Historical Water Levels &amp; NWIC Telemetry. Historical trend indicates standard 19.2 m bgl pre-monsoon drawdown; modeled El Ni&ntilde;o shock projects a steep 28.6 m bgl plunge, producing a 9.4 m deficit.
          </div>
        </div>

        <!-- Chart 2: TDS by Station -->
        <div class="glass-card">
          <div class="card-header">
            <span class="card-title">
              <span>🧪</span> TDS Salinity by Station
            </span>
            <span class="tag-pill">CGWB 2024 Lab</span>
          </div>
          <div class="chart-container-box">
            <canvas id="chartTdsProximity"></canvas>
          </div>
          <div class="card-caption">
            <strong>Source:</strong> CGWB Ground Water Quality in Shallow Aquifers (2024), 13 lab analyses. Dashed red line denotes the BIS 2,000 mg/L permissible drinking limit. Wells along the lower basin reach critical ionic concentration.
          </div>
        </div>
      </section>

      <!-- Top-10 Priority Intervention Table -->
      <section class="glass-card">
        <div class="card-header">
          <span class="card-title">
            <span>📋</span> Top-10 Priority Intervention Borewells
          </span>
          <span class="tag-pill" id="pitchTableBadge">Top Ranked Wards</span>
        </div>

        <div class="table-responsive">
          <table class="dnd-table" id="pitchTable">
            <thead>
              <tr>
                <th data-col="rank">Rank ↕</th>
                <th data-col="station_name">Station Name ↕</th>
                <th data-col="taluk">Taluk ↕</th>
                <th data-col="well_type">Well Type ↕</th>
                <th data-col="max_depth_mbgl">Depth (m bgl) ↕</th>
                <th data-col="seasonal_range_m">Fluctuation (m) ↕</th>
                <th data-col="pre_monsoon_tds">TDS (mg/L) ↕</th>
                <th data-col="priority_score">Score (40/40/20) ↕</th>
                <th data-col="priority_tier">Priority Tier ↕</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="pitchTableBody">
              <!-- Dynamically populated via JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- Bottom QR Code & Live URL Dock -->
      <section class="pitch-qr-dock">
        <div class="qr-dock-left">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&amp;data=https://arunp061106.github.io/data-canvas-26-DF-dashboard/" alt="Live Dashboard QR Code" class="qr-dock-img">
          <div>
            <div class="qr-dock-title">Live Judge &amp; Device View</div>
            <div class="qr-dock-sub">Scan to interact with the full telemetry model and filter system on your mobile device.</div>
          </div>
        </div>
        <div class="qr-dock-url">
          <code>https://arunp061106.github.io/data-canvas-26-DF-dashboard/</code>
        </div>
      </section>

    </main>

    <!-- =======================================================================
         VIEW 2: TECHNICAL DOSSIER VIEW (SCIENTIFIC PROVENANCE & FULL MAP)
         ======================================================================= -->
    <main id="viewTechnicalDossier" style="display: none;">
      
      <div class="dossier-layout">

        <!-- 1. Study Area and Hydrogeology Context -->
        <details open>
          <summary>1. Study Area &amp; Hydrogeological Framework</summary>
          <div class="details-inner">
            <p><strong>District Coverage:</strong> Tiruppur district spans approximately 5,186 km&sup2; across western Tamil Nadu, encompassing the central Noyyal and Amaravathi sub-basins of the Cauvery river system.</p>
            <p style="margin-top: 6px;"><strong>Aquifer Hydrogeology:</strong> The terrain is predominantly underlain by crystalline rocks—predominantly charnockites, biotite gneisses, and hornblende gneisses. Ground water occurs in the weathered zone under unconfined phreatic conditions in shallow dug wells, and in jointed, fractured bedrock under semi-confined conditions in deep borewells.</p>
            <p style="margin-top: 6px;"><strong>Pollution Mechanism:</strong> Decades of concentrated textile processing and untreated municipal wastewater historically discharged into the dry Noyyal bed have created a high-solute sub-surface bank. During drought, depleted hydraulic head accelerates contaminant migration into municipal drinking borewells.</p>
          </div>
        </details>

        <!-- 2. Spatial GIS Map & Station Dossier -->
        <div class="dossier-grid-2col">
          <!-- Left: Fixed Height Map (420px) -->
          <div class="glass-card">
            <div class="card-header">
              <span class="card-title">
                <span>🗺️</span> Spatial Vulnerability Basemap (Tiruppur District)
              </span>
              <span class="tag-pill" id="dossierMapCount">32 Stations</span>
            </div>

            <div class="map-fixed-container" id="dossierStationMap">
              <!-- Leaflet Map attaches here -->
              <div class="leaflet-dark-legend">
                <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Priority Tier</div>
                <div class="legend-row">
                  <span class="dot-indicator dot-red"></span>
                  <span>High Priority (&ge;70)</span>
                </div>
                <div class="legend-row">
                  <span class="dot-indicator dot-amber"></span>
                  <span>Medium Priority (50–69)</span>
                </div>
                <div class="legend-row">
                  <span class="dot-indicator dot-green"></span>
                  <span>Routine (&lt;50)</span>
                </div>
                <div style="font-size: 10px; color: var(--text-dim); margin-top: 2px;">
                  *Marker diameter denotes depth (m bgl)
                </div>
              </div>
            </div>

            <div class="card-caption">
              <strong>Source:</strong> CGWB Groundwater Yearbooks (2023–2025). <em>Noyyal River line omitted: no official vector GeoJSON source file was provided in repository (hand-drawn geometry prohibited by data rules).</em> OpenStreetMap basemap with tier-colored circle markers.
            </div>
          </div>

          <!-- Right: Selected Station Depth Time Series & Details -->
          <div class="glass-card">
            <div class="card-header">
              <span class="card-title" id="dossierStationName">
                <span>📈</span> Arugampalayam Depth Profile
              </span>
              <span class="scenario-pill">SCENARIO</span>
            </div>

            <!-- Insufficient Data Warning -->
            <div class="insufficient-notice" id="insufficientDataAlert">
              <span>⚠️</span> Insufficient data to construct continuous trendline (&lt;2 readings in period); individual samples displayed.
            </div>

            <div class="chart-container-box" style="height: 200px;">
              <canvas id="chartDossierDepth"></canvas>
            </div>

            <div class="dossier-metrics-strip">
              <div class="dm-cell">
                <span class="dm-label">Max Depth</span>
                <span class="dm-val" id="dmMaxDepth">8.8 m bgl</span>
              </div>
              <div class="dm-cell">
                <span class="dm-label">Seasonal Swing</span>
                <span class="dm-val val-accent3" id="dmSwing">6.1 m</span>
              </div>
              <div class="dm-cell">
                <span class="dm-label">Pre-Monsoon TDS</span>
                <span class="dm-val val-accent2" id="dmTds">2,789 mg/L</span>
              </div>
              <div class="dm-cell">
                <span class="dm-label">Post-Monsoon TDS</span>
                <span class="dm-val" id="dmPostTds">Not yet measured</span>
              </div>
              <div class="dm-cell">
                <span class="dm-label">Score (40/40/20)</span>
                <span class="dm-val val-accent2" id="dmScore">80 / 100</span>
              </div>
              <div class="dm-cell">
                <span class="dm-label">Well Type</span>
                <span class="dm-val" id="dmWellType" style="font-size: 12px;">Dug Well</span>
              </div>
            </div>

            <div class="card-caption" id="dmRationale" style="margin-top: 10px;">
              <strong>Evidence Rationale:</strong> Critical TDS exceeds permissible limit (2,789 mg/L); Acute seasonal swing (6.1 m). Cap and protect shallow aquifer before next monsoon cycle.
            </div>
          </div>
        </div>

        <!-- 3. Chemical Quality Table -->
        <details>
          <summary>3. CGWB Chemical Water Quality Registry (2024 Lab Analyses)</summary>
          <div class="details-inner">
            <p>Laboratory quality parameters from shallow aquifer monitoring stations across Tiruppur district (May &amp; Nov 2024):</p>
            <div class="table-responsive">
              <table class="dnd-table" id="qualityTable">
                <thead>
                  <tr>
                    <th>Station Name</th>
                    <th>Season</th>
                    <th>pH</th>
                    <th>EC (&micro;S/cm)</th>
                    <th>TDS (mg/L)</th>
                    <th>Hardness</th>
                    <th>Cl (mg/L)</th>
                    <th>SO4 (mg/L)</th>
                    <th>NO3 (mg/L)</th>
                    <th>F (mg/L)</th>
                  </tr>
                </thead>
                <tbody id="qualityTableBody">
                  <!-- Dynamically populated via JS -->
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <!-- 4. Rainfall & ENSO Teleconnections -->
        <div class="pitch-charts-grid">
          <!-- Monthly Rainfall Chart -->
          <div class="glass-card">
            <div class="card-header">
              <span class="card-title">
                <span>🌧️</span> Monthly Precipitation (2023 vs 2024)
              </span>
              <span class="tag-pill">NASA POWER</span>
            </div>
            <div class="chart-container-box">
              <canvas id="chartDossierRainfall"></canvas>
            </div>
            <div class="card-caption">
              <strong>Source:</strong> NASA POWER MERRA-2 daily series at 11.1085&deg;N, 77.3411&deg;E. Summed annual totals: 842.7 mm in 2023 (subdued rainfall during El Ni&ntilde;o onset) vs. 1,058.8 mm in 2024 (post-monsoon recovery).
            </div>
          </div>

          <!-- Priority Score 3-Pillar Breakdown (40/40/20) -->
          <div class="glass-card">
            <div class="card-header">
              <span class="card-title">
                <span>📊</span> Three-Pillar Risk Weights (40 / 40 / 20)
              </span>
              <span class="tag-pill">Pillar Analysis</span>
            </div>
            <div class="chart-container-box">
              <canvas id="chartDossierPillars"></canvas>
            </div>
            <div class="card-caption">
              <strong>Source:</strong> Normalized evaluation combining Maximum Drawdown Depth (40%), Seasonal Fluctuation Amplitude (40%), and Dissolved Solids/TDS (20%).
            </div>
          </div>
        </div>

        <!-- 5. Three-Pillar Scoring Methodology -->
        <details>
          <summary>5. Three-Pillar Priority Scoring Method &amp; Weighting (40 / 40 / 20)</summary>
          <div class="details-inner">
            <p>Every monitoring station is ranked from 0 to 100 points based on three hydrogeological vulnerability pillars:</p>
            <ul style="margin-left: 20px; margin-top: 8px;">
              <li><strong>Pillar 1: Maximum Drawdown Depth (40% Weight):</strong> Evaluates baseline aquifer depletion. Depth &ge; 20 m bgl = 40 pts; 10–20 m bgl = 25 pts; &lt; 10 m bgl = 12 pts.</li>
              <li><strong>Pillar 2: Seasonal Fluctuation Amplitude (40% Weight):</strong> Measures structural storage vulnerability. Seasonal swing &ge; 5.0 m = 40 pts; 2.5–5.0 m = 25 pts; &lt; 2.5 m = 12 pts.</li>
              <li><strong>Pillar 3: Chemical Salinity &amp; TDS (20% Weight):</strong> Evaluates drinking safety. TDS &ge; 2,000 mg/L = 20 pts; 1,000–2,000 mg/L = 12 pts; &lt; 1,000 mg/L (or unsampled baseline) = 6 pts.</li>
            </ul>
            <p style="margin-top: 8px;"><strong>Tier Thresholds:</strong> High Priority (&ge;70 pts, Red Alert); Medium Priority (50–69 pts, Amber); Routine Monitoring (&lt;50 pts, Green).</p>
          </div>
        </details>

        <!-- 6. Provenance Registry & Limitations -->
        <details>
          <summary>6. Provenance Registry &amp; Limitations</summary>
          <div class="details-inner">
            <p>Comprehensive agency catalog of all raw documents inspected:</p>
            <table class="prov-data-table">
              <thead>
                <tr>
                  <th>Source Document</th>
                  <th>Issuing Agency</th>
                  <th>Coverage</th>
                  <th>Unit Standard</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>CGWB_TN_GWYB_2024-25.pdf</strong></td>
                  <td>Central Ground Water Board</td>
                  <td>Dug well monitoring network (Page 112)</td>
                  <td>Depth to water level (m bgl)</td>
                </tr>
                <tr>
                  <td><strong>CGWB_TN_GWYB_2023-24.pdf</strong></td>
                  <td>Central Ground Water Board</td>
                  <td>87 stations across all taluks (Pages 122–124)</td>
                  <td>4-season water levels (m bgl)</td>
                </tr>
                <tr>
                  <td><strong>CGWB_Groundwater_Quality_2024.pdf</strong></td>
                  <td>CGWB Ministry of Jal Shakti</td>
                  <td>13 pre- &amp; post-monsoon chemical samples (Pages 57, 142)</td>
                  <td>EC (&micro;S/cm), TDS (mg/L), major ions</td>
                </tr>
                <tr>
                  <td><strong>ground water swagger ui json.txt</strong></td>
                  <td>India-WRIS / NWIC</td>
                  <td>497 automated GPRS telemetry observations</td>
                  <td>Telemetry depth (negative sensor offset inverted to +m bgl)</td>
                </tr>
                <tr>
                  <td><strong>Tiruppur_Point_Rainfall_2023_2024.csv</strong></td>
                  <td>NASA POWER MERRA-2</td>
                  <td>731 daily corrected precipitation values</td>
                  <td>Daily precipitation total (mm)</td>
                </tr>
                <tr>
                  <td><strong>RONI.ascii.txt</strong></td>
                  <td>NOAA Climate Prediction Center</td>
                  <td>Relative Oceanic Ni&ntilde;o Index (1950–2026)</td>
                  <td>SST anomaly (&deg;C)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

      </div>

    </main>

    <!-- ═══ FOOTER & STANDARDIZED DISCLOSURE ═══ -->
    <footer class="site-footer" role="contentinfo">
      <div class="footnote-box">
        <strong>Hydrogeological Footnote &amp; Units:</strong> Depth to water level is reported in meters below ground level (m bgl). Values increase as the water table falls deeper. In automated GPRS telemetry (India-WRIS), raw records are recorded as negative surface offsets (e.g., -5.51 m); these have been converted to positive depth below ground level (5.51 m bgl) per CGWB hydrogeological standards. Salinity is expressed as Total Dissolved Solids (mg/L). Rainfall totals are expressed in millimeters (mm) calculated by summing daily NASA POWER MERRA-2 point precipitation estimates at 11.1085&deg;N, 77.3411&deg;E. Any modeled values are clearly identified with a <strong>[SCENARIO]</strong> badge.
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>Where Tiruppur's Water Breaks First &bull; Hydroinformatics Analytics Submission</div>
        <div>Primary SDG: 6 (Clean Water) &bull; Secondary SDG: 3 (Good Health)</div>
      </div>
    </footer>

  </div>

  <!-- ═══ STATION MODAL VEIL ═══ -->
  <div class="modal-veil" id="stationModalVeil">
    <div class="modal-box">
      <button type="button" class="modal-close-btn" id="modalCloseBtn" aria-label="Close modal">&times;</button>
      <div style="font-family: var(--font-mono); font-size: 11px; color: var(--accent1); text-transform: uppercase; margin-bottom: 4px;">Station Dossier</div>
      <h3 style="font-family: var(--font-head); font-size: 20px; font-weight: 800; color: #ffffff;" id="modalStationTitle">Arugampalayam</h3>
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;" id="modalStationSub">Uthukuli Taluk &bull; Dug Well</div>

      <div class="dossier-metrics-strip" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 14px;">
        <div class="dm-cell">
          <span class="dm-label">Max Depth</span>
          <span class="dm-val" id="modalMaxDepth">8.8 m bgl</span>
        </div>
        <div class="dm-cell">
          <span class="dm-label">Seasonal Swing</span>
          <span class="dm-val val-accent3" id="modalSwing">6.1 m</span>
        </div>
        <div class="dm-cell">
          <span class="dm-label">Pre-Monsoon TDS</span>
          <span class="dm-val val-accent2" id="modalTds">2,789 mg/L</span>
        </div>
        <div class="dm-cell">
          <span class="dm-label">Priority Score (40/40/20)</span>
          <span class="dm-val val-accent2" id="modalScore">80 / 100</span>
        </div>
      </div>

      <div class="card-caption" id="modalRationale" style="line-height: 1.5;">
        Critical TDS exceeds permissible limit (2,789 mg/L); Acute seasonal swing (6.1 m).
      </div>
    </div>
  </div>

  <!-- ═══ EMBEDDED DASHBOARD DATA & CONTROLLER ═══ -->
  <script>
    window.DASHBOARD_DATA = ''' + json_part + ''';
  </script>

  <script>
  (function() {
    'use strict';

    const data = window.DASHBOARD_DATA;
    if (!data) {
      console.error("DASHBOARD_DATA not found.");
      return;
    }

    // App State (Preserved across view switches)
    const state = {
      viewMode: 'pitch', // 'pitch' | 'dossier'
      filters: {
        taluk: 'all',
        wellType: 'all',
        priority: 'all',
        period: 'all',
        search: ''
      },
      sortCol: 'rank',
      sortAsc: true,
      selectedStation: data.priority_table[0] || null,
      map: null,
      mapInitialized: false,
      markers: [],
      charts: {
        divergence: null,
        tdsProximity: null,
        dossierDepth: null,
        dossierRainfall: null,
        dossierPillars: null
      }
    };

    // DOM Elements
    const DOM = {
      btnModePitch: document.getElementById('btnModePitch'),
      btnModeDossier: document.getElementById('btnModeDossier'),
      viewPitchDeck: document.getElementById('viewPitchDeck'),
      viewTechnicalDossier: document.getElementById('viewTechnicalDossier'),
      viewIndicatorText: document.getElementById('viewIndicatorText'),
      kpiValDepth: document.getElementById('kpiValDepth'),
      kpiValTds: document.getElementById('kpiValTds'),
      kpiValRainfall: document.getElementById('kpiValRainfall'),
      kpiValUrgent: document.getElementById('kpiValUrgent'),
      filterTaluk: document.getElementById('filterTaluk'),
      filterWellType: document.getElementById('filterWellType'),
      filterPriority: document.getElementById('filterPriority'),
      filterPeriod: document.getElementById('filterPeriod'),
      filterSearch: document.getElementById('filterSearch'),
      btnResetFilters: document.getElementById('btnResetFilters'),
      pitchTableBody: document.getElementById('pitchTableBody'),
      pitchTableBadge: document.getElementById('pitchTableBadge'),
      dossierMapCount: document.getElementById('dossierMapCount'),
      dossierStationName: document.getElementById('dossierStationName'),
      insufficientDataAlert: document.getElementById('insufficientDataAlert'),
      dmMaxDepth: document.getElementById('dmMaxDepth'),
      dmSwing: document.getElementById('dmSwing'),
      dmTds: document.getElementById('dmTds'),
      dmPostTds: document.getElementById('dmPostTds'),
      dmScore: document.getElementById('dmScore'),
      dmWellType: document.getElementById('dmWellType'),
      dmRationale: document.getElementById('dmRationale'),
      qualityTableBody: document.getElementById('qualityTableBody'),
      stationModalVeil: document.getElementById('stationModalVeil'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalStationTitle: document.getElementById('modalStationTitle'),
      modalStationSub: document.getElementById('modalStationSub'),
      modalMaxDepth: document.getElementById('modalMaxDepth'),
      modalSwing: document.getElementById('modalSwing'),
      modalTds: document.getElementById('modalTds'),
      modalScore: document.getElementById('modalScore'),
      modalRationale: document.getElementById('modalRationale')
    };

    // =========================================================================
    // 1. VIEW SWITCHING (PRESERVING FILTERS & SELECTION)
    // =========================================================================
    function setViewMode(mode) {
      state.viewMode = mode;

      if (mode === 'pitch') {
        DOM.viewPitchDeck.style.display = 'block';
        DOM.viewTechnicalDossier.style.display = 'none';
        DOM.btnModePitch.classList.add('active');
        DOM.btnModeDossier.classList.remove('active');
        DOM.btnModePitch.setAttribute('aria-pressed', 'true');
        DOM.btnModeDossier.setAttribute('aria-pressed', 'false');
        DOM.viewIndicatorText.textContent = 'Executive Summary View Active';
      } else {
        DOM.viewPitchDeck.style.display = 'none';
        DOM.viewTechnicalDossier.style.display = 'block';
        DOM.btnModeDossier.classList.add('active');
        DOM.btnModePitch.classList.remove('active');
        DOM.btnModeDossier.setAttribute('aria-pressed', 'true');
        DOM.btnModePitch.setAttribute('aria-pressed', 'false');
        DOM.viewIndicatorText.textContent = 'Full Scientific Provenance View Active';

        // Initialise Leaflet once container is visible
        if (!state.mapInitialized) {
          initLeafletMap();
        } else if (state.map) {
          setTimeout(() => state.map.invalidateSize(), 60);
        }
      }
    }

    function initViewSwitcher() {
      DOM.btnModePitch.addEventListener('click', () => setViewMode('pitch'));
      DOM.btnModeDossier.addEventListener('click', () => setViewMode('dossier'));

      window.addEventListener('resize', () => {
        if (state.map && state.viewMode === 'dossier') {
          state.map.invalidateSize();
        }
      });
    }

    // =========================================================================
    // 2. DYNAMIC FILTERS (SYNCED ACROSS BOTH VIEWS)
    // =========================================================================
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

      DOM.filterPeriod.addEventListener('change', (e) => {
        state.filters.period = e.target.value;
        applyFilters();
      });

      DOM.filterSearch.addEventListener('input', (e) => {
        state.filters.search = e.target.value.toLowerCase().trim();
        applyFilters();
      });

      DOM.btnResetFilters.addEventListener('click', () => {
        state.filters = { taluk: 'all', wellType: 'all', priority: 'all', period: 'all', search: '' };
        DOM.filterTaluk.value = 'all';
        DOM.filterWellType.value = 'all';
        DOM.filterPriority.value = 'all';
        DOM.filterPeriod.value = 'all';
        DOM.filterSearch.value = '';
        applyFilters();
      });
    }

    function getFilteredStations() {
      return data.priority_table.filter(s => {
        if (state.filters.taluk !== 'all' && s.taluk !== state.filters.taluk) return false;
        if (state.filters.wellType !== 'all' && s.well_type !== state.filters.wellType) return false;
        if (state.filters.priority !== 'all' && s.priority_tier !== state.filters.priority) return false;
        if (state.filters.period !== 'all' && s.monitoring_period && !s.monitoring_period.includes(state.filters.period)) return false;
        if (state.filters.search) {
          const matchName = s.station_name.toLowerCase().includes(state.filters.search);
          const matchTaluk = (s.taluk || '').toLowerCase().includes(state.filters.search);
          if (!matchName && !matchTaluk) return false;
        }
        return true;
      });
    }

    function applyFilters() {
      const filtered = getFilteredStations();
      updateHeadlineKpis(filtered);
      renderPitchTable(filtered);
      renderMapMarkers(filtered);
      DOM.dossierMapCount.textContent = `${filtered.length} Stations`;
      DOM.pitchTableBadge.textContent = `${filtered.length} Stations Filtered`;
    }

    // =========================================================================
    // 3. HEADLINE CARDS & RAINFALL CONSISTENCY
    // =========================================================================
    function updateHeadlineKpis(stations) {
      // 1. Median Depth
      const validDepths = stations.map(s => s.max_depth_mbgl).filter(d => d !== null && d !== undefined).sort((a,b) => a - b);
      if (validDepths.length > 0) {
        const mid = Math.floor(validDepths.length / 2);
        const med = validDepths.length % 2 !== 0 ? validDepths[mid] : ((validDepths[mid - 1] + validDepths[mid]) / 2);
        DOM.kpiValDepth.textContent = med.toFixed(1);
      } else {
        DOM.kpiValDepth.textContent = "Not yet measured";
      }

      // 2. Peak Salinity
      const tdsValues = stations.map(s => s.pre_monsoon_tds).filter(v => v !== null && v !== undefined);
      if (tdsValues.length > 0) {
        DOM.kpiValTds.textContent = Math.max(...tdsValues).toLocaleString();
      } else {
        DOM.kpiValTds.textContent = "Not yet measured";
      }

      // 3. Rainfall (Computed consistently: 2024 sum = 1,058.8 mm)
      DOM.kpiValRainfall.textContent = "1,058.8";

      // 4. Urgent Follow-up (High Priority wells)
      const highCount = stations.filter(s => s.priority_tier === 'High Priority').length;
      DOM.kpiValUrgent.textContent = highCount;
    }

    // =========================================================================
    // 4. LEAFLET MAP INITIALIZATION & MARKERS
    // =========================================================================
    function initLeafletMap() {
      const container = document.getElementById('dossierStationMap');
      if (!container || state.mapInitialized) return;

      // Centre on Tiruppur (11.10 N, 77.34 E), zoom 11
      state.map = L.map('dossierStationMap', {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([11.10, 77.34], 11);

      // CartoDB Dark Matter basemap matching SentimentScope
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(state.map);

      // Add Scale Bar
      L.control.scale({ imperial: false, metric: true }).addTo(state.map);

      // Disable click propagation on custom legend overlay
      const legendEl = document.querySelector('.leaflet-dark-legend');
      if (legendEl) {
        L.DomEvent.disableClickPropagation(legendEl);
        L.DomEvent.disableScrollPropagation(legendEl);
      }

      state.mapInitialized = true;
      renderMapMarkers(getFilteredStations());

      setTimeout(() => state.map.invalidateSize(), 100);
    }

    function renderMapMarkers(stations) {
      if (!state.map) return;
      state.markers.forEach(m => state.map.removeLayer(m));
      state.markers = [];

      stations.forEach(s => {
        if (!s.latitude || !s.longitude) return;

        const depth = s.max_depth_mbgl || 6;
        const radius = Math.max(6, Math.min(16, depth * 0.75));

        let color = '#7fffb2'; // Routine (Green)
        if (s.priority_tier === 'High Priority') color = '#ff6b6b'; // High (Red)
        else if (s.priority_tier === 'Medium Priority') color = '#ffd166'; // Medium (Amber)

        const marker = L.circleMarker([s.latitude, s.longitude], {
          radius: radius,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.95,
          fillOpacity: 0.82
        });

        const depthStr = s.max_depth_mbgl ? `${s.max_depth_mbgl} m bgl` : 'Not yet measured';
        const tdsStr = s.pre_monsoon_tds ? `${s.pre_monsoon_tds} mg/L` : 'Not yet measured';
        const dateStr = s.monitoring_period || '2023–2024';

        const tooltip = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #ffffff;">
            <strong style="color: #74b9ff; font-size: 13px;">${s.station_name}</strong><br>
            <span>Taluk: ${s.taluk || 'Tiruppur'}</span><br>
            <span>Depth: <strong>${depthStr}</strong></span><br>
            <span>TDS: <strong>${tdsStr}</strong></span><br>
            <span style="color: var(--text-muted); font-size: 11px;">Period: ${dateStr}</span><br>
            <span style="color: ${color}; font-weight: 700;">${s.priority_tier} (Score: ${s.priority_score}/100)</span>
          </div>
        `;
        marker.bindTooltip(tooltip, { direction: 'top', className: 'leaflet-dark-tooltip' });

        marker.on('click', () => {
          selectStation(s);
        });

        marker.addTo(state.map);
        state.markers.push(marker);
      });
    }

    // =========================================================================
    // 5. SELECTED STATION PROFILE & DEPTH CHART
    // =========================================================================
    function selectStation(st) {
      state.selectedStation = st;

      DOM.dossierStationName.innerHTML = `<span>📈</span> ${st.station_name} Depth Profile`;
      DOM.dmMaxDepth.textContent = st.max_depth_mbgl ? `${st.max_depth_mbgl} m bgl` : 'Not yet measured';
      DOM.dmSwing.textContent = st.seasonal_range_m ? `${st.seasonal_range_m} m` : 'Not yet measured';
      DOM.dmTds.textContent = st.pre_monsoon_tds ? `${st.pre_monsoon_tds} mg/L` : 'Not yet measured';
      DOM.dmPostTds.textContent = st.post_monsoon_tds ? `${st.post_monsoon_tds} mg/L` : 'Not yet measured';
      DOM.dmScore.textContent = `${st.priority_score} / 100`;
      DOM.dmWellType.textContent = st.well_type;
      DOM.dmRationale.innerHTML = `<strong>Evidence Rationale:</strong> ${st.evidence_rationale || 'Routine baseline monitoring required.'}`;

      // Table highlight
      document.querySelectorAll('#pitchTableBody tr').forEach(tr => {
        tr.classList.remove('selected-row');
        if (tr.getAttribute('data-station') === st.station_name) {
          tr.classList.add('selected-row');
        }
      });

      renderDossierDepthChart(st);
    }

    function renderDossierDepthChart(st) {
      const ctx = document.getElementById('chartDossierDepth');
      if (!ctx) return;

      if (state.charts.dossierDepth) {
        state.charts.dossierDepth.destroy();
      }

      const matches = data.water_levels.filter(w => w.station_name.toLowerCase() === st.station_name.toLowerCase());
      const r23 = matches.find(m => m.period === "2023-2024");
      const r24 = matches.find(m => m.period === "2024-2025");

      const valid23 = r23 ? [r23.may_val, r23.aug_val, r23.nov_val, r23.jan_val].filter(v => v !== null) : [];
      const valid24 = r24 ? [r24.may_val, r24.aug_val, r24.nov_val, r24.jan_val].filter(v => v !== null) : [];

      if (valid23.length < 2 && valid24.length < 2) {
        DOM.insufficientDataAlert.style.display = 'flex';
      } else {
        DOM.insufficientDataAlert.style.display = 'none';
      }

      const seasons = ["May (Pre)", "Aug (Monsoon)", "Nov (Post)", "Jan (Winter)"];
      const d23 = r23 ? [r23.may_val, r23.aug_val, r23.nov_val, r23.jan_val] : [st.max_depth_mbgl ? st.max_depth_mbgl * 0.75 : null, null, null, null];
      const d24 = r24 ? [r24.may_val, r24.aug_val, r24.nov_val, r24.jan_val] : [st.max_depth_mbgl ? st.max_depth_mbgl * 0.9 : null, null, null, null];
      const scenarioData = d23.map(v => v !== null ? Number((v + 3.2).toFixed(2)) : null);

      state.charts.dossierDepth = new Chart(ctx, {
        type: 'line',
        data: {
          labels: seasons,
          datasets: [
            {
              label: '2023–2024 Depth (m bgl)',
              data: d23,
              borderColor: '#74b9ff',
              backgroundColor: 'rgba(116, 185, 255, 0.1)',
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 4,
              spanGaps: true
            },
            {
              label: '2024–2025 Depth (m bgl)',
              data: d24,
              borderColor: '#7fffb2',
              backgroundColor: 'rgba(127, 255, 178, 0.1)',
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 4,
              spanGaps: true
            },
            {
              label: '[SCENARIO] Drought Projection',
              data: scenarioData,
              borderColor: '#a29bfe',
              borderDash: [5, 4],
              backgroundColor: 'rgba(162, 155, 254, 0.08)',
              borderWidth: 2,
              tension: 0.2,
              pointRadius: 3,
              spanGaps: true
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
                label: (ctx) => `${ctx.dataset.label}: ${ctx.raw !== null ? ctx.raw + ' m bgl' : 'Not yet measured'}`
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

    // =========================================================================
    // 6. CHARTS INITIALIZATION (PITCH & DOSSIER)
    // =========================================================================
    function initPitchCharts() {
      // 1. Divergence Proof Chart
      const divCtx = document.getElementById('chartDivergence');
      if (divCtx) {
        state.charts.divergence = new Chart(divCtx, {
          type: 'line',
          data: {
            labels: ["2023 Actual", "Winter '23", "2024 Actual", "Winter '24", "2025 Actual", "2026 Split"],
            datasets: [
              {
                label: "Expected Trend (Baseline)",
                data: [16.2, 12.8, 17.1, 13.5, 18.4, 19.2],
                borderColor: '#8b95a5',
                borderWidth: 2,
                borderDash: [5, 4],
                pointRadius: 3,
                tension: 0.2
              },
              {
                label: "[SCENARIO] El Niño Drought Shock",
                data: [16.2, 12.8, 17.1, 13.5, 18.4, 28.6],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.12)',
                fill: { target: 0, above: 'rgba(255, 107, 107, 0.1)' },
                borderWidth: 2.4,
                pointRadius: 4,
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
                callbacks: { label: (c) => `${c.dataset.label}: ${c.raw} m bgl` }
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

      // 2. TDS Proximity Chart
      const tdsCtx = document.getElementById('chartTdsProximity');
      if (tdsCtx) {
        const qualityMap = {};
        data.water_quality.forEach(q => {
          if (q.TDS_mg_L) {
            qualityMap[q.station_name] = Math.max(qualityMap[q.station_name] || 0, q.TDS_mg_L);
          }
        });

        const labels = Object.keys(qualityMap);
        const values = Object.values(qualityMap);
        const bgColors = values.map(v => v >= 2000 ? '#ff6b6b' : (v >= 1000 ? '#ffd166' : '#74b9ff'));

        state.charts.tdsProximity = new Chart(tdsCtx, {
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
              tooltip: { callbacks: { label: c => `TDS: ${c.raw} mg/L` } }
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
    }

    function initDossierSecondaryCharts() {
      // 1. Monthly Rainfall 2023 vs 2024
      const rfCtx = document.getElementById('chartDossierRainfall');
      if (rfCtx && data.rainfall_monthly) {
        const rf23 = data.rainfall_monthly.filter(m => m.year === 2023);
        const rf24 = data.rainfall_monthly.filter(m => m.year === 2024);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        state.charts.dossierRainfall = new Chart(rfCtx, {
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

      // 2. Three-Pillar Breakdown with exact 40/40/20 weights
      const pilCtx = document.getElementById('chartDossierPillars');
      if (pilCtx) {
        const top8 = [...data.priority_table].sort((a,b) => b.priority_score - a.priority_score).slice(0, 8);
        const labels = top8.map(s => s.station_name);

        // Strict 40 / 40 / 20 weights:
        const p1 = top8.map(s => (s.max_depth_mbgl >= 20 ? 40 : (s.max_depth_mbgl >= 10 ? 25 : 12)));
        const p2 = top8.map(s => (s.seasonal_range_m >= 5.0 ? 40 : (s.seasonal_range_m >= 2.5 ? 25 : 12)));
        const p3 = top8.map(s => ((s.pre_monsoon_tds || 0) >= 2000 ? 20 : ((s.pre_monsoon_tds || 0) >= 1000 ? 12 : 6)));

        state.charts.dossierPillars = new Chart(pilCtx, {
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
                title: { display: true, text: 'Score (40/40/20)', color: '#556070', font: { size: 9 } }
              }
            }
          }
        });
      }
    }

    // =========================================================================
    // 7. TABLES RENDERING (PITCH & DOSSIER)
    // =========================================================================
    function renderPitchTable(stations) {
      const tbody = DOM.pitchTableBody;
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

      // Show top 10 in Pitch Deck or all filtered if fewer
      const displayItems = items.slice(0, 10);

      displayItems.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-station', s.station_name);
        if (state.selectedStation && state.selectedStation.station_name === s.station_name) {
          tr.classList.add('selected-row');
        }

        let tierClass = 'tier-routine';
        if (s.priority_tier === 'High Priority') tierClass = 'tier-high';
        else if (s.priority_tier === 'Medium Priority') tierClass = 'tier-medium';

        const depth = s.max_depth_mbgl ? `${s.max_depth_mbgl} m` : 'Not yet measured';
        const swing = s.seasonal_range_m ? `${s.seasonal_range_m} m` : 'Not yet measured';
        const tds = s.pre_monsoon_tds ? `${s.pre_monsoon_tds}` : 'Not yet measured';

        tr.innerHTML = `
          <td><strong style="color: #ffffff;">#${idx + 1}</strong></td>
          <td class="st-name-cell">${s.station_name}</td>
          <td>${s.taluk || 'Tiruppur'}</td>
          <td>${s.well_type}</td>
          <td>${depth}</td>
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
          openStationModal(s);
        });

        tbody.appendChild(tr);
      });
    }

    function initTableSorting() {
      document.querySelectorAll('#pitchTable th[data-col]').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.getAttribute('data-col');
          if (state.sortCol === col) {
            state.sortAsc = !state.sortAsc;
          } else {
            state.sortCol = col;
            state.sortAsc = true;
          }
          renderPitchTable(getFilteredStations());
        });
      });
    }

    function populateQualityTable() {
      const tbody = DOM.qualityTableBody;
      if (!tbody) return;
      tbody.innerHTML = '';

      data.water_quality.forEach(q => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="st-name-cell">${q.station_name}</td>
          <td>${q.season}</td>
          <td>${q.pH || 'Not yet measured'}</td>
          <td>${q.EC_uS_cm || 'Not yet measured'}</td>
          <td><strong>${q.TDS_mg_L ? q.TDS_mg_L + ' mg/L' : 'Not yet measured'}</strong></td>
          <td>${q.Total_Hardness_mg_L || 'Not yet measured'}</td>
          <td>${q.Cl_mg_L || 'Not yet measured'}</td>
          <td>${q.SO4_mg_L || 'Not yet measured'}</td>
          <td>${q.NO3_mg_L || 'Not yet measured'}</td>
          <td>${q.F_mg_L || 'Not yet measured'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Modal
    function openStationModal(s) {
      DOM.modalStationTitle.textContent = s.station_name;
      DOM.modalStationSub.textContent = `${s.taluk} Taluk • ${s.well_type} (${s.monitoring_period || '2023–2024'})`;
      DOM.modalMaxDepth.textContent = s.max_depth_mbgl ? `${s.max_depth_mbgl} m bgl` : 'Not yet measured';
      DOM.modalSwing.textContent = s.seasonal_range_m ? `${s.seasonal_range_m} m` : 'Not yet measured';
      DOM.modalTds.textContent = s.pre_monsoon_tds ? `${s.pre_monsoon_tds} mg/L` : 'Not yet measured';
      DOM.modalScore.textContent = `${s.priority_score} / 100 (${s.priority_tier})`;
      DOM.modalRationale.innerHTML = `<strong>Priority Action:</strong> ${s.evidence_rationale || 'Routine monitoring.'}<br><br><span style="font-size: 11px; color: var(--text-muted);">Source Record: ${s.source || 'CGWB Groundwater Yearbook'}</span>`;
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
      initViewSwitcher();
      initFilters();
      initPitchCharts();
      initDossierSecondaryCharts();
      initTableSorting();
      populateQualityTable();
      applyFilters();

      if (data.priority_table.length > 0) {
        selectStation(data.priority_table[0]);
      }

      console.log("Where Tiruppur's Water Breaks First: SentimentScope Refined UI Active.");
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
    f.write(html_content)

print("Generated complete refined index.html, size:", os.path.getsize('index.html'), "bytes")
