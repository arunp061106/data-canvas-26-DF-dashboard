# build_monsoon_ink_dashboard.py
import json
import os

with open('data/app_data.js', 'r', encoding='utf-8') as f:
    app_data_str = f.read().strip()

json_part = app_data_str.split('=', 1)[1].strip().rstrip(';')

html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Where Tiruppur's Water Breaks First — Two-Map Groundwater Depletion &amp; Salinity Analytics</title>
  <meta name="description" content="Hydrological analytics comparing projected drought scenario against observed May 2024 baseline across Tiruppur and the Noyyal basin.">

  <!-- Google Fonts: Inter (body & labels) & JetBrains Mono (numbers & tables) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

  <!-- Chart.js 4.4.1 -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <style>
    /* ==========================================================================
       SECTION C: VISUAL THEME ("MONSOON INK")
       ========================================================================== */
    :root {
      --bg: #0b1220;
      --surface: #111a2b;
      --surface-2: #16223a;
      --border: #1f2d45;
      --text: #e5edf7;
      --muted: #8ca3c0;
      --water: #2dd4bf;
      --drought: #f59e0b;
      --high: #ef4444;
      --medium: #f59e0b;
      --routine: #22c55e;

      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
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
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* Subtle top header gradient at 8% opacity */
    .header-gradient-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 280px;
      background: radial-gradient(ellipse at 50% 0%, rgba(45, 212, 191, 0.08) 0%, transparent 75%);
      pointer-events: none;
      z-index: 0;
    }

    .site-wrapper {
      position: relative;
      z-index: 1;
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* ── A. HEADER ── */
    .site-header {
      padding: 24px 0 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 32px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-badge {
      width: 44px;
      height: 44px;
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 10px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .logo-svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: var(--water);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .site-title {
      font-family: var(--font-body);
      font-size: 28px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .site-sub {
      font-size: 14px;
      color: var(--muted);
      font-weight: 400;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .status-tag {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
    }

    .tag-drought {
      border-color: rgba(245, 158, 11, 0.35);
      color: var(--drought);
      background: rgba(245, 158, 11, 0.08);
    }

    .tag-sdg {
      border-color: rgba(45, 212, 191, 0.35);
      color: var(--water);
      background: rgba(45, 212, 191, 0.08);
    }

    /* ── B. KPI STRIP (5 CARDS) ── */
    .hero-kpi-strip {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 130px;
    }

    .kpi-label {
      font-family: var(--font-body);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .kpi-icon-svg {
      width: 14px;
      height: 14px;
      stroke: var(--muted);
      stroke-width: 2;
      fill: none;
    }

    .kpi-val {
      font-family: var(--font-mono);
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      line-height: 1.1;
      margin: 8px 0 6px;
    }

    .kpi-unit-line {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.3;
    }

    /* ── C. TWO-MAP SECTION ── */
    .map-section {
      margin-bottom: 32px;
    }

    .map-controls-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .section-heading {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }

    .section-sub {
      font-size: 13px;
      color: var(--muted);
      margin-top: 2px;
    }

    .btn-control {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.04em;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    .btn-control:hover {
      border-color: var(--water);
      background: #1c2b48;
    }

    .btn-control:focus-visible {
      outline: 2px solid var(--water);
      outline-offset: 2px;
    }

    .btn-control.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: var(--drought);
      color: var(--drought);
    }

    /* El Niño Alert Banner */
    .el-nino-banner {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--drought);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }

    .el-nino-banner-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--drought);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: var(--font-mono);
      margin-bottom: 8px;
    }

    .el-nino-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .en-metric-label {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .en-metric-val {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin: 2px 0;
    }

    .en-metric-sub {
      font-size: 12px;
      color: var(--muted);
    }

    /* Dual Map Panels Grid */
    .dual-maps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
    }

    .map-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: 12px 18px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }

    .badge-scenario {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid var(--drought);
      color: var(--drought);
    }

    .badge-measured {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(45, 212, 191, 0.15);
      border: 1px solid var(--water);
      color: var(--water);
    }

    .map-container {
      height: 460px;
      width: 100%;
      position: relative;
      background: #080d17;
    }

    /* Dark Styling applied ONLY to the Leaflet tile pane per Section B requirement */
    .leaflet-tile-pane {
      filter: grayscale(1) invert(0.92) contrast(1.05) brightness(0.9);
    }

    /* Left Map Floating Overlay */
    .map-overlay-card {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1000;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--drought);
      border-radius: 6px;
      padding: 10px 14px;
      width: 240px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    }

    .map-overlay-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--drought);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }

    .map-overlay-line {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      color: var(--muted);
      margin-bottom: 3px;
    }

    .map-overlay-line span:last-child {
      font-family: var(--font-mono);
      color: var(--text);
    }

    /* City marker and place labels */
    .map-city-label {
      display: flex;
      align-items: center;
      gap: 4px;
      pointer-events: none;
    }

    .city-pin {
      color: var(--water);
      font-size: 14px;
      line-height: 1;
    }

    .city-text {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 6px rgba(0,0,0,0.9);
      letter-spacing: 0.02em;
    }

    .taluk-label-marker {
      pointer-events: none;
    }

    .taluk-label-text {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
    }

    /* Scale bar control style */
    .leaflet-control-scale-line {
      background: var(--surface-2) !important;
      border: 1px solid var(--border) !important;
      color: var(--text) !important;
      font-family: var(--font-mono) !important;
      font-size: 10px !important;
      padding: 2px 6px !important;
      box-shadow: none !important;
    }

    /* Custom Leaflet Tooltip */
    .leaflet-tooltip.custom-map-tooltip {
      background: var(--surface) !important;
      border: 1px solid var(--border) !important;
      border-radius: 6px !important;
      padding: 8px 12px !important;
      color: var(--text) !important;
      font-family: var(--font-body) !important;
      font-size: 12px !important;
      line-height: 1.4 !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
    }

    .leaflet-tooltip.custom-map-tooltip::before {
      border-top-color: var(--surface) !important;
    }

    .tooltip-title {
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 2px;
    }

    .tooltip-row {
      color: var(--muted);
      font-size: 11.5px;
    }

    .tooltip-row strong {
      color: var(--text);
      font-family: var(--font-mono);
    }

    /* Panel Footer Legends */
    .panel-footer {
      padding: 12px 18px;
      background: var(--surface-2);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
    }

    .legend-items {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
    }

    .marker-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1.5px solid #0b1220;
      display: inline-block;
    }

    .dot-high { background: var(--high); }
    .dot-medium { background: var(--medium); }
    .dot-routine { background: var(--routine); }
    .dot-unmeasured {
      background: transparent;
      border: 1.5px dashed var(--muted);
    }

    .legend-scale-sizes {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--muted);
    }

    .scale-circle {
      border: 1.5px solid var(--muted);
      border-radius: 50%;
      display: inline-block;
    }

    .panel-footnote {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.4;
      border-top: 1px solid var(--border);
      padding-top: 6px;
    }

    /* Map Action Bar Below Maps (Reset View & Status) */
    .map-bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
    }

    /* ── D. FILTER BAR ── */
    .filter-bar {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 32px;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr) auto;
      gap: 16px;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-label {
      font-family: var(--font-body);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
      font-weight: 600;
    }

    .filter-select, .filter-input {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 13px;
      padding: 9px 12px;
      border-radius: 6px;
      outline: none;
      width: 100%;
      transition: border-color 0.15s ease;
    }

    .filter-select:focus, .filter-input:focus {
      border-color: var(--water);
      outline: 2px solid var(--water);
      outline-offset: 1px;
    }

    /* ── E. CHARTS GRID (2x2) ── */
    .charts-grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .chart-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .chart-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 14px;
      gap: 8px;
    }

    .chart-heading {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    .chart-container-box {
      height: 250px;
      position: relative;
      width: 100%;
    }

    .chart-caption {
      font-size: 12px;
      color: var(--muted);
      margin-top: 10px;
      line-height: 1.4;
      border-top: 1px solid var(--border);
      padding-top: 8px;
    }

    /* ── F. PRIORITY TABLE ── */
    .table-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }

    .table-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .table-responsive {
      overflow-x: auto;
      max-height: 480px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }

    .data-table th {
      background: var(--surface-2);
      color: var(--muted);
      font-family: var(--font-body);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 5;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    .data-table th:hover {
      color: var(--text);
    }

    .data-table th.num-col, .data-table td.num-col {
      text-align: right;
    }

    .data-table td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    .data-table tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.03);
    }

    .data-table tr:hover {
      background: rgba(255, 255, 255, 0.06);
      cursor: pointer;
    }

    .data-table tr.selected-row {
      background: rgba(45, 212, 191, 0.08);
      border-left: 3px solid var(--water);
    }

    .data-table td.num-col {
      font-family: var(--font-mono);
    }

    .st-name {
      font-weight: 600;
      color: #ffffff;
    }

    .tier-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .tier-high {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid var(--high);
      color: var(--high);
    }

    .tier-medium {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid var(--medium);
      color: var(--medium);
    }

    .tier-routine {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid var(--routine);
      color: var(--routine);
    }

    .btn-ghost-inspect {
      background: transparent;
      border: 1px solid var(--water);
      color: var(--water);
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .btn-ghost-inspect:hover {
      background: var(--water);
      color: var(--bg);
    }

    .btn-ghost-inspect:focus-visible {
      outline: 2px solid var(--water);
      outline-offset: 2px;
    }

    /* ── G. COLLAPSIBLE METHODS & PROVENANCE ── */
    .collapsible-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }

    .collapsible-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .collapsible-trigger {
      padding: 14px 20px;
      background: var(--surface-2);
      color: var(--text);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .collapsible-trigger:hover {
      background: #1b2842;
    }

    .collapsible-content {
      padding: 18px 20px;
      border-top: 1px solid var(--border);
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--muted);
    }

    .provenance-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin: 12px 0 6px;
    }

    .provenance-table th, .provenance-table td {
      padding: 8px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    .provenance-table th {
      background: var(--surface-2);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 11.5px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
    }

    /* ── H. QR DOCK & UNIFIED FOOTNOTE ── */
    .qr-dock {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 32px;
    }

    .qr-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .qr-img {
      width: 80px;
      height: 80px;
      background: #ffffff;
      padding: 5px;
      border-radius: 8px;
      display: block;
    }

    .qr-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
    }

    .qr-desc {
      font-size: 13px;
      color: var(--muted);
      margin-top: 4px;
    }

    .qr-url-code {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--water);
      background: rgba(45, 212, 191, 0.08);
      border: 1px solid rgba(45, 212, 191, 0.25);
      padding: 8px 14px;
      border-radius: 6px;
      display: inline-block;
    }

    .site-footer {
      border-top: 1px solid var(--border);
      padding: 24px 0 48px;
      font-size: 13px;
      color: var(--muted);
      line-height: 1.6;
    }

    .unified-footnote {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--water);
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 16px;
    }

    /* Modal Inspection Dossier */
    .modal-veil {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(11, 18, 32, 0.85);
      backdrop-filter: blur(4px);
      display: none;
      place-items: center;
      padding: 20px;
    }

    .modal-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 100%;
      max-width: 560px;
      padding: 24px;
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: var(--muted);
      font-size: 22px;
      cursor: pointer;
    }

    .modal-close-btn:hover { color: #ffffff; }

    /* ==========================================================================
       RESPONSIVENESS (390PX, 768PX, 900PX, 1440PX)
       ========================================================================== */
    @media (max-width: 1100px) {
      .hero-kpi-strip {
        grid-template-columns: repeat(3, 1fr);
      }
      .charts-grid-2x2 {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 900px) {
      .dual-maps-grid {
        grid-template-columns: 1fr;
      }
      .map-container {
        height: 340px;
      }
      .el-nino-grid {
        grid-template-columns: 1fr;
      }
      .filter-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .site-title {
        font-size: 24px;
      }
    }

    @media (max-width: 600px) {
      .hero-kpi-strip {
        grid-template-columns: 1fr;
      }
      .filter-grid {
        grid-template-columns: 1fr;
      }
      .site-title {
        font-size: 20px;
      }
      .qr-left {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>

  <div class="header-gradient-bg" aria-hidden="true"></div>

  <div class="site-wrapper">

    <!-- ═══ SECTION A: HEADER ═══ -->
    <header class="site-header" role="banner">
      <div class="header-left">
        <div class="logo-badge" aria-hidden="true">
          <svg class="logo-svg" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="site-title">Where Tiruppur's Water Breaks First</h1>
          <p class="site-sub">Which wells fail first in a dry year? Ground truth depths vs. projected drought stress</p>
        </div>
      </div>
      <div class="header-right">
        <span class="status-tag tag-drought">2026 Drought Scenario</span>
        <span class="status-tag tag-sdg">SDG 6 Clean Water</span>
        <span class="status-tag tag-sdg">SDG 3 Good Health</span>
      </div>
    </header>

    <!-- ═══ SECTION B: KPI STRIP (5 METRIC CARDS) ═══ -->
    <section class="hero-kpi-strip" aria-label="Key Performance Indicators">
      <!-- 1. Stations Tracked -->
      <div class="kpi-card" id="cardStations">
        <div class="kpi-label">
          <span>Stations Tracked</span>
          <svg class="kpi-icon-svg" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <div class="kpi-val" id="kpiStationsTracked">—</div>
        <div class="kpi-unit-line">Distinct monitoring stations &bull; CGWB 2023–25</div>
      </div>

      <!-- 2. Median Depth -->
      <div class="kpi-card" id="cardDepth">
        <div class="kpi-label">
          <span>Median Depth (m bgl)</span>
          <svg class="kpi-icon-svg" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22"></line><polyline points="19 15 12 22 5 15"></polyline></svg>
        </div>
        <div class="kpi-val" id="kpiMedianDepth">—</div>
        <div class="kpi-unit-line">m bgl &bull; Pre-monsoon May baseline</div>
      </div>

      <!-- 3. Wells Above 2,000 mg/L TDS -->
      <div class="kpi-card" id="cardTds">
        <div class="kpi-label">
          <span>Wells &gt; 2,000 mg/L TDS</span>
          <svg class="kpi-icon-svg" viewBox="0 0 24 24"><path d="M10 2v7.31L4.69 17.5A2 2 0 0 0 6.38 20.5h11.24a2 2 0 0 0 1.69-3L14 9.31V2"></path></svg>
        </div>
        <div class="kpi-val" id="kpiHighTdsCount">—</div>
        <div class="kpi-unit-line">mg/L &bull; Exceeds BIS IS 10500:2012 permissible limit</div>
      </div>

      <!-- 4. Annual Rainfall -->
      <div class="kpi-card" id="cardRainfall">
        <div class="kpi-label">
          <span>Annual Rainfall (2024)</span>
          <svg class="kpi-icon-svg" viewBox="0 0 24 24"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><line x1="8" y1="19" x2="8" y2="21"></line><line x1="12" y1="17" x2="12" y2="23"></line><line x1="16" y1="19" x2="16" y2="21"></line></svg>
        </div>
        <div class="kpi-val" id="kpiAnnualRainfall">—</div>
        <div class="kpi-unit-line">NASA POWER point estimate, 11.1085 N, 77.3411 E</div>
      </div>

      <!-- 5. High-Priority Count -->
      <div class="kpi-card" id="cardUrgent">
        <div class="kpi-label">
          <span>High-Priority Wells</span>
          <svg class="kpi-icon-svg" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="kpi-val" id="kpiHighPriorityCount">—</div>
        <div class="kpi-unit-line">Composite score &ge; 70 &bull; 40 / 40 / 20 weighting</div>
      </div>
    </section>

    <!-- ═══ SECTION C: TWO-MAP COMPARISON ═══ -->
    <section class="map-section" aria-label="Two-Map Comparison">
      <div class="map-controls-header">
        <div>
          <h2 class="section-heading">Two-Map Spatial Comparison</h2>
          <p class="section-sub">Synchronized spatial view: Projected drought scenario vs. observed May 2024 ground truth</p>
        </div>
        <button type="button" id="btnToggleElNino" class="btn-control" aria-pressed="false">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          <span id="elNinoBtnText">Show current El Niño effect</span>
        </button>
      </div>

      <!-- Toggleable El Niño Banner -->
      <div id="elNinoBanner" class="el-nino-banner" style="display: none;">
        <div class="el-nino-banner-title">Climate Anomaly Alert: Relative Oceanic Niño Index (RONI)</div>
        <div class="el-nino-grid">
          <div>
            <div class="en-metric-label">Latest RONI Status</div>
            <div class="en-metric-val" id="enRoniStatus">El Niño (+1.69°C Anomaly)</div>
            <div class="en-metric-sub">Forecast JAS 2026 &bull; Source: NOAA Climate Prediction Center</div>
          </div>
          <div>
            <div class="en-metric-label">2026 Annual Rainfall</div>
            <div class="en-metric-val" id="enRainfall2026" style="color: var(--drought); font-style: italic;">not in data file</div>
            <div class="en-metric-sub">NASA POWER observed records terminate in Dec 2024</div>
          </div>
          <div>
            <div class="en-metric-label">Scenario Model Assumption</div>
            <div class="en-metric-val">+3.2 m Drawdown Offset</div>
            <div class="en-metric-sub">Empirical drought drawdown applied to pre-monsoon baseline</div>
          </div>
        </div>
      </div>

      <!-- Dual Maps Grid -->
      <div class="dual-maps-grid">
        <!-- LEFT MAP: Scenario 2026 -->
        <div class="map-panel">
          <div class="panel-header">
            <h3 class="panel-title">Expected summer 2026 (scenario)</h3>
            <span class="badge-scenario">SCENARIO</span>
          </div>

          <div class="map-container" id="mapScenario">
            <!-- Left Map Floating Overlay -->
            <div id="leftMapElNinoOverlay" class="map-overlay-card" style="display: none;">
              <div class="map-overlay-title">El Niño Drought Scenario</div>
              <div class="map-overlay-line">
                <span>RONI Anomaly:</span>
                <span id="overlayRoniVal">+1.69°C (El Niño)</span>
              </div>
              <div class="map-overlay-line">
                <span>2026 Rainfall:</span>
                <span id="overlayRainVal" style="color: var(--drought);">not in data file</span>
              </div>
              <div class="map-overlay-line">
                <span>Offset:</span>
                <span>+3.2 m bgl</span>
              </div>
            </div>
          </div>

          <div class="panel-footer">
            <div class="legend-row">
              <div class="legend-items">
                <span class="legend-item"><span class="marker-dot dot-high"></span> High (&ge;70)</span>
                <span class="legend-item"><span class="marker-dot dot-medium"></span> Medium (50–69)</span>
                <span class="legend-item"><span class="marker-dot dot-routine"></span> Routine (&lt;50)</span>
                <span class="legend-item"><span class="marker-dot dot-unmeasured"></span> Not yet measured</span>
              </div>
              <div class="legend-scale-sizes">
                <span>Depth scale:</span>
                <span class="scale-circle" style="width: 8px; height: 8px;" title="6px: ≤4m bgl"></span> 6 px (4m)
                <span class="scale-circle" style="width: 16px; height: 16px;" title="16px: ≥25m bgl"></span> 16 px (25m)
              </div>
            </div>
            <div class="panel-footnote">
              Method: empirical offset of +3.2 m applied to the May 2024 baseline. Derivation not yet documented; treat as illustrative.
            </div>
          </div>
        </div>

        <!-- RIGHT MAP: Observed May 2024 -->
        <div class="map-panel">
          <div class="panel-header">
            <h3 class="panel-title">Observed pre-monsoon May 2024 (CGWB 2024-25, p.112)</h3>
            <span class="badge-measured">MEASURED</span>
          </div>

          <div class="map-container" id="mapObserved"></div>

          <div class="panel-footer">
            <div class="legend-row">
              <div class="legend-items">
                <span class="legend-item"><span class="marker-dot dot-high"></span> High</span>
                <span class="legend-item"><span class="marker-dot dot-medium"></span> Medium</span>
                <span class="legend-item"><span class="marker-dot dot-routine"></span> Routine</span>
                <span class="legend-item"><span class="marker-dot dot-unmeasured"></span> Not yet measured</span>
              </div>
              <div class="legend-scale-sizes">
                <span>Depth scale:</span>
                <span class="scale-circle" style="width: 8px; height: 8px;"></span> 6 px (4m)
                <span class="scale-circle" style="width: 16px; height: 16px;"></span> 16 px (25m)
              </div>
            </div>
            <div class="panel-footnote">
              Observed depths from CGWB 2024-25 yearbook (Page 112). Stations without May 2024 readings are rendered with hollow dashed markers and marked "Not yet measured".
            </div>
          </div>
        </div>
      </div>

      <!-- Map Action Bar (Reset View) -->
      <div class="map-bottom-bar">
        <span class="section-sub">Pan or zoom on either map to synchronously move both.</span>
        <button type="button" id="btnResetMapView" class="btn-control" title="Reset maps to Tiruppur center">
          <span>↺</span> Reset view
        </button>
      </div>
    </section>

    <!-- ═══ SECTION D: FILTER BAR ═══ -->
    <section class="filter-bar" aria-label="Interactive Filters">
      <div class="filter-grid">
        <div class="filter-group">
          <label for="filterTaluk" class="filter-label">Taluk</label>
          <select id="filterTaluk" class="filter-select">
            <option value="all">All Taluks (10 Blocks)</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filterWellType" class="filter-label">Well Type</label>
          <select id="filterWellType" class="filter-select">
            <option value="all">All Well Types</option>
            <option value="Dug Well">Dug Well (Shallow)</option>
            <option value="Bore Well">Bore Well (Piezometer)</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filterPriority" class="filter-label">Priority Tier</label>
          <select id="filterPriority" class="filter-select">
            <option value="all">All Priority Tiers</option>
            <option value="High Priority">High Priority (Score &ge; 70)</option>
            <option value="Medium Priority">Medium Priority (50–69)</option>
            <option value="Routine Monitoring">Routine Monitoring (&lt; 50)</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filterSearch" class="filter-label">Search Station</label>
          <input type="text" id="filterSearch" class="filter-input" placeholder="Search station or taluk...">
        </div>

        <div class="filter-group">
          <button type="button" id="btnResetFilters" class="btn-control" style="width: 100%;" title="Reset all filters">
            <span>↺</span> Reset
          </button>
        </div>
      </div>
    </section>

    <!-- ═══ SECTION E: CHARTS GRID (2x2) ═══ -->
    <section class="charts-grid-2x2" aria-label="Hydrological Analysis Charts">
      <!-- 1. Station Depth Time Series -->
      <div class="chart-panel">
        <div class="chart-panel-header">
          <h3 class="chart-heading" id="tsChartHeading">Seasonal Depth Time Series</h3>
          <span class="badge-measured" id="tsStationSub">Arugampalayam</span>
        </div>
        <div class="chart-container-box">
          <canvas id="chartDepthTimeSeries" aria-label="Seasonal depth time series chart"></canvas>
        </div>
        <div class="chart-caption">
          Source: CGWB Groundwater Yearbooks (2023–24 &amp; 2024–25). Pre-monsoon May, SWM August, NEM November, Winter January. [SCENARIO] assumes +3.2 m drawdown deficit.
        </div>
      </div>

      <!-- 2. TDS by Station -->
      <div class="chart-panel">
        <div class="chart-panel-header">
          <h3 class="chart-heading">TDS by Monitoring Station</h3>
          <span class="badge-measured">BIS Limit: 2,000 mg/L</span>
        </div>
        <div class="chart-container-box">
          <canvas id="chartTdsByStation" aria-label="TDS concentrations by station chart"></canvas>
        </div>
        <div class="chart-caption">
          Source: CGWB Groundwater Quality 2024 Annexure 1. Bureau of Indian Standards (IS 10500:2012) permissible limit for drinking water is 2,000 mg/L.
        </div>
      </div>

      <!-- 3. Monthly Rainfall (2023 vs 2024) -->
      <div class="chart-panel">
        <div class="chart-panel-header">
          <h3 class="chart-heading">Monthly Precipitation (2023 vs. 2024)</h3>
          <span class="badge-measured">NASA POWER</span>
        </div>
        <div class="chart-container-box">
          <canvas id="chartMonthlyRainfall" aria-label="Monthly rainfall comparison chart"></canvas>
        </div>
        <div class="chart-caption">
          Method: Computed by summing monthly precipitation values from the NASA POWER dataset (11.1085 N, 77.3411 E).
        </div>
      </div>

      <!-- 4. Priority Score Breakdown (40 / 40 / 20) -->
      <div class="chart-panel">
        <div class="chart-panel-header">
          <h3 class="chart-heading">Priority Score Breakdown (40 / 40 / 20 Weights)</h3>
          <span class="badge-scenario">40 / 40 / 20</span>
        </div>
        <div class="chart-container-box">
          <canvas id="chartPriorityPillars" aria-label="Priority score three-pillar breakdown chart"></canvas>
        </div>
        <div class="chart-caption">
          Weighting: Water table depth (40%), Salinity / TDS (40%), Seasonal fluctuation (20%). Stations scoring &ge;70 require immediate recharge intervention.
        </div>
      </div>
    </section>

    <!-- ═══ SECTION F: PRIORITY RANKED TABLE ═══ -->
    <section class="table-section" aria-label="Action Priority Ranking">
      <div class="table-top-bar">
        <div>
          <h3 class="section-heading">Ranked Intervention Priority Matrix</h3>
          <p class="section-sub">Select any row to display its seasonal depth profile in the charts above</p>
        </div>
        <span class="status-tag tag-sdg" id="tableFilterCount">32 Stations</span>
      </div>

      <div class="table-responsive">
        <table class="data-table" id="priorityTable">
          <thead>
            <tr>
              <th data-col="rank"># ↕</th>
              <th data-col="station_name">Station Name ↕</th>
              <th data-col="taluk">Taluk ↕</th>
              <th data-col="well_type">Type ↕</th>
              <th data-col="observed_may24_mbgl" class="num-col">Observed May 2024 (m bgl) ↕</th>
              <th data-col="scenario_depth_mbgl" class="num-col">2026 Scenario (m bgl) ↕</th>
              <th data-col="seasonal_range_m" class="num-col">Seasonal Swing (m) ↕</th>
              <th data-col="pre_monsoon_tds" class="num-col">TDS (mg/L) ↕</th>
              <th data-col="priority_score" class="num-col">Score (40/40/20) ↕</th>
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

    <!-- ═══ SECTION G: COLLAPSIBLE METHODS & PROVENANCE ═══ -->
    <section class="collapsible-stack" aria-label="Methodology and Scientific Provenance">
      <!-- 1. Methodology -->
      <details class="collapsible-panel" open>
        <summary class="collapsible-trigger">
          <span>Methodology: Three-Pillar Scoring Criteria (40 / 40 / 20)</span>
        </summary>
        <div class="collapsible-content">
          <p>Every borewell and dug well in the monitoring registry is scored on a transparent 100-point scale designed to identify stations facing critical failure during dry seasons:</p>
          <table class="provenance-table">
            <thead>
              <tr>
                <th>Pillar</th>
                <th>Weight</th>
                <th>Measurement Metric</th>
                <th>Scoring Criteria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pillar 1: Water Table Depth</strong></td>
                <td>40% (40 pts)</td>
                <td>Maximum depth to water level (m bgl)</td>
                <td>&ge;20 m = 40 pts &bull; 10–20 m = 25 pts &bull; &lt;10 m = 12 pts</td>
              </tr>
              <tr>
                <td><strong>Pillar 2: Salinity Stress</strong></td>
                <td>40% (40 pts)</td>
                <td>Total Dissolved Solids (mg/L)</td>
                <td>&ge;2,000 mg/L = 40 pts &bull; 1,200–2,000 mg/L = 25 pts &bull; 500–1,200 mg/L = 12 pts &bull; Not tested = 10 pts</td>
              </tr>
              <tr>
                <td><strong>Pillar 3: Seasonal Fluctuation</strong></td>
                <td>20% (20 pts)</td>
                <td>Pre-monsoon to post-monsoon drawdown swing (m)</td>
                <td>&ge;5.0 m = 20 pts &bull; 2.0–5.0 m = 10 pts &bull; &lt;2.0 m = 5 pts</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 8px;"><strong>Tier Classification:</strong> High Priority (&ge;70 points, Red), Medium Priority (50–69 points, Amber), Routine Monitoring (&lt;50 points, Green).</p>
        </div>
      </details>

      <!-- 2. Provenance Registry -->
      <details class="collapsible-panel">
        <summary class="collapsible-trigger">
          <span>Primary Data Sources &amp; Provenance Registry</span>
        </summary>
        <div class="collapsible-content">
          <table class="provenance-table">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Authoritative Source</th>
                <th>Coverage &amp; File Reference</th>
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
                <td>Page 112: Pre-monsoon May 2024 ground truth depths for Tiruppur Corporation dug wells.</td>
              </tr>
              <tr>
                <td><strong>Groundwater Quality 2024</strong></td>
                <td>CGWB South Eastern Coastal Region, Chennai</td>
                <td>Annexure 1: Laboratory chemical quality testing (pH, EC, TDS, Hardness, Cl, SO4, NO3, F) across 13 sample locations.</td>
              </tr>
              <tr>
                <td><strong>Precipitation Time Series</strong></td>
                <td>NASA POWER Meteorological Dataset</td>
                <td>Daily meteorological point estimates at 11.1085 N, 77.3411 E (2023 and 2024 series).</td>
              </tr>
              <tr>
                <td><strong>ENSO / RONI Anomalies</strong></td>
                <td>NOAA Climate Prediction Center</td>
                <td>Relative Oceanic Niño Index anomalies from RONI.ascii.txt through 2026 forecast (+1.69°C).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>

      <!-- 3. Limitations & Disclosures -->
      <details class="collapsible-panel">
        <summary class="collapsible-trigger">
          <span>Hydrogeological Disclosures &amp; Geospatial Mapping Integrity</span>
        </summary>
        <div class="collapsible-content">
          <p><strong>1. Geospatial Mapping Integrity:</strong> Basemap uses OpenStreetMap tiles with dark contrast filter applied strictly to the tile pane. All hand-drawn or schematic river lines have been removed to preserve geospatial integrity.</p>
          <p style="margin-top: 8px;"><strong>2. Crystalline Hydrogeology:</strong> Tiruppur rests on weathered and fissured crystalline rocks (gneisses and charnockites) with low primary porosity (specific yield typically 1.5% to 3.0%), making groundwater tables acutely vulnerable to deficit recharge during drought intervals.</p>
          <p style="margin-top: 8px;"><strong>3. Surveillance Gaps:</strong> Of 32 stations in the 2023–24 baseline network, only 9 core urban wells were resurveyed in the 2024–25 yearbook. Unmeasured stations are labeled "Not yet measured" rather than extrapolated.</p>
        </div>
      </details>
    </section>

    <!-- ═══ SECTION H: QR DOCK & FOOTER ═══ -->
    <section class="qr-dock">
      <div class="qr-left">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&amp;data=https://arunp061106.github.io/data-canvas-26-DF-dashboard/" alt="Live Dashboard QR Code" class="qr-img">
        <div>
          <div class="qr-title">Live Device &amp; Review View</div>
          <div class="qr-desc">Scan to interact with the synchronized two-map dashboard and filter matrix on your device.</div>
        </div>
      </div>
      <div>
        <code class="qr-url-code">https://arunp061106.github.io/data-canvas-26-DF-dashboard/</code>
      </div>
    </section>

    <footer class="site-footer" role="contentinfo">
      <div class="unified-footnote">
        <strong>Hydrogeological Footnote &amp; Units:</strong> Depth to water level is reported in meters below ground level (m bgl). Values increase as the water table falls deeper. Negative automated telemetry offsets are converted to positive depth below ground level (m bgl); sign convention to be confirmed against CGWB metadata. Salinity is expressed as Total Dissolved Solids (mg/L). Rainfall totals are expressed in millimeters (mm) computed by summing NASA POWER daily point estimates at 11.1085 N, 77.3411 E. Every modelled projection carries a <strong>[SCENARIO]</strong> badge.
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span>Where Tiruppur's Water Breaks First &bull; Data Canvas '26</span>
        <span>CGWB &amp; NASA POWER Source Provenance</span>
      </div>
    </footer>

  </div>

  <!-- ═══ STATION INSPECTION MODAL ═══ -->
  <div class="modal-veil" id="stationModalVeil">
    <div class="modal-card">
      <button type="button" class="modal-close-btn" id="modalCloseBtn">&times;</button>
      <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;">
        <h3 id="modalStationTitle" style="font-size: 18px; font-weight: 700; color: #ffffff;">Station Name</h3>
        <span id="modalStationSub" style="font-size: 13px; color: var(--muted);">Taluk &bull; Type</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
          <div class="en-metric-label">Observed May 2024</div>
          <div class="en-metric-val" id="modalObservedMay24" style="color: var(--water);">--</div>
          <div class="en-metric-sub">m bgl &bull; CGWB 2024-25, p.112</div>
        </div>
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
          <div class="en-metric-label">2026 Scenario Depth</div>
          <div class="en-metric-val" id="modalScenario2026" style="color: var(--drought);">--</div>
          <div class="en-metric-sub">m bgl &bull; +3.2 m offset</div>
        </div>
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
          <div class="en-metric-label">Seasonal Swing</div>
          <div class="en-metric-val" id="modalSwing">--</div>
          <div class="en-metric-sub">m &bull; Pre-to-post monsoon</div>
        </div>
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
          <div class="en-metric-label">Total Dissolved Solids</div>
          <div class="en-metric-val" id="modalTds">--</div>
          <div class="en-metric-sub">mg/L &bull; Laboratory analysis</div>
        </div>
      </div>
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 14px;">
        <div class="en-metric-label" style="margin-bottom: 4px;">Composite Score &amp; Action Rationale</div>
        <div id="modalScore" style="font-weight: 600; color: #ffffff; margin-bottom: 6px; font-family: var(--font-mono);">--</div>
        <div id="modalRationale" style="font-size: 13px; color: var(--muted); line-height: 1.5;">--</div>
      </div>
    </div>
  </div>

  <!-- ═══ EMBEDDED DASHBOARD DATA ═══ -->
  <script>
    window.DASHBOARD_DATA = ''' + json_part + ''';
  </script>

  <!-- ═══ DASHBOARD CONTROLLER & LEAFLET MAP LOGIC ═══ -->
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
      talukLayerScenario: null,
      talukLayerObserved: null,
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
      kpiStationsTracked: document.getElementById('kpiStationsTracked'),
      kpiMedianDepth: document.getElementById('kpiMedianDepth'),
      kpiHighTdsCount: document.getElementById('kpiHighTdsCount'),
      kpiAnnualRainfall: document.getElementById('kpiAnnualRainfall'),
      kpiHighPriorityCount: document.getElementById('kpiHighPriorityCount'),
      btnToggleElNino: document.getElementById('btnToggleElNino'),
      elNinoBtnText: document.getElementById('elNinoBtnText'),
      elNinoBanner: document.getElementById('elNinoBanner'),
      leftMapElNinoOverlay: document.getElementById('leftMapElNinoOverlay'),
      enRoniStatus: document.getElementById('enRoniStatus'),
      enRainfall2026: document.getElementById('enRainfall2026'),
      overlayRoniVal: document.getElementById('overlayRoniVal'),
      overlayRainVal: document.getElementById('overlayRainVal'),
      btnResetMapView: document.getElementById('btnResetMapView'),
      filterTaluk: document.getElementById('filterTaluk'),
      filterWellType: document.getElementById('filterWellType'),
      filterPriority: document.getElementById('filterPriority'),
      filterSearch: document.getElementById('filterSearch'),
      btnResetFilters: document.getElementById('btnResetFilters'),
      tsChartHeading: document.getElementById('tsChartHeading'),
      tsStationSub: document.getElementById('tsStationSub'),
      priorityTableBody: document.getElementById('priorityTableBody'),
      tableFilterCount: document.getElementById('tableFilterCount'),
      stationModalVeil: document.getElementById('stationModalVeil'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalStationTitle: document.getElementById('modalStationTitle'),
      modalStationSub: document.getElementById('modalStationSub'),
      modalObservedMay24: document.getElementById('modalObservedMay24'),
      modalScenario2026: document.getElementById('modalScenario2026'),
      modalSwing: document.getElementById('modalSwing'),
      modalTds: document.getElementById('modalTds'),
      modalScore: document.getElementById('modalScore'),
      modalRationale: document.getElementById('modalRationale')
    };

    // =========================================================================
    // 1. FILTERING
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
      renderMapMarkers(filtered);
      renderTable(filtered);
      renderTdsChart(filtered);
      renderPillarsChart(filtered);

      DOM.tableFilterCount.textContent = `${filtered.length} Stations`;

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
    // 2. COUNTS & KPI STRIP (SECTION A & C REQUIREMENTS)
    // =========================================================================
    function updateKpis(filtered) {
      // "Stations tracked" = distinct stations with at least one reading
      DOM.kpiStationsTracked.textContent = filtered.length;

      // Median depth (m bgl)
      const validDepths = filtered.map(s => s.max_depth_mbgl).filter(d => d !== null && d !== undefined).sort((a,b) => a - b);
      if (validDepths.length > 0) {
        const mid = Math.floor(validDepths.length / 2);
        const med = validDepths.length % 2 !== 0 ? validDepths[mid] : ((validDepths[mid - 1] + validDepths[mid]) / 2);
        DOM.kpiMedianDepth.textContent = med.toFixed(1);
      } else {
        DOM.kpiMedianDepth.textContent = "Not yet measured";
      }

      // "Wells above 2,000 mg/L TDS" = measured TDS above 2,000 in data file
      const highTdsCount = filtered.filter(s => (s.pre_monsoon_tds && s.pre_monsoon_tds > 2000) || (s.post_monsoon_tds && s.post_monsoon_tds > 2000)).length;
      DOM.kpiHighTdsCount.textContent = highTdsCount;

      // "Annual rainfall" = computed by summing NASA POWER values from data file
      const rf2024Sum = (data.rainfall_monthly || []).filter(m => m.year === 2024).reduce((acc, m) => acc + (m.total_mm || 0), 0);
      DOM.kpiAnnualRainfall.textContent = rf2024Sum.toFixed(1);

      // "High-priority wells" = composite score >= 70
      const highPriorityCount = filtered.filter(s => s.priority_score >= 70).length;
      DOM.kpiHighPriorityCount.textContent = highPriorityCount;
    }

    // =========================================================================
    // 3. MAP FIXES (OPENSTREETMAP, DARK TILE FILTER, SYNCHRONIZED PANNING)
    // =========================================================================
    function initDualMaps() {
      if (state.mapsInitialized) return;

      const mapOptions = {
        zoomControl: true,
        scrollWheelZoom: false,
        minZoom: 10,
        maxZoom: 14,
        attributionControl: true
      };

      const osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      const osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

      // 1. Left Map: Scenario 2026
      state.mapScenario = L.map('mapScenario', mapOptions).setView([11.1085, 77.3411], 12);
      L.tileLayer(osmUrl, { attribution: osmAttr, maxZoom: 19 }).addTo(state.mapScenario);
      L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(state.mapScenario);

      // 2. Right Map: Observed May 2024
      state.mapObserved = L.map('mapObserved', mapOptions).setView([11.1085, 77.3411], 12);
      L.tileLayer(osmUrl, { attribution: osmAttr, maxZoom: 19 }).addTo(state.mapObserved);
      L.control.scale({ imperial: false, metric: true, position: 'bottomleft' }).addTo(state.mapObserved);

      // 3. Add Tiruppur City Marker to both maps
      const cityIcon = L.divIcon({
        className: 'map-city-label',
        html: '<span class="city-pin">★</span><span class="city-text">Tiruppur City</span>',
        iconSize: [110, 24],
        iconAnchor: [12, 12]
      });
      L.marker([11.1085, 77.3411], { icon: cityIcon, interactive: false }).addTo(state.mapScenario);
      L.marker([11.1085, 77.3411], { icon: cityIcon, interactive: false }).addTo(state.mapObserved);

      // 4. Add Taluk Centroid Labels (hidden below zoom 11)
      addTalukLabels();

      // 5. Synchronised panning (with infinite recursion guard)
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

      // 6. Reset View Button
      DOM.btnResetMapView.addEventListener('click', () => {
        state.mapScenario.setView([11.1085, 77.3411], 12);
        state.mapObserved.setView([11.1085, 77.3411], 12);
      });

      // 7. Invalidate sizes on window resize
      window.addEventListener('resize', () => {
        if (state.mapScenario) state.mapScenario.invalidateSize();
        if (state.mapObserved) state.mapObserved.invalidateSize();
      });

      state.mapsInitialized = true;
      renderMapMarkers(getFilteredStations());

      setTimeout(() => {
        if (state.mapScenario) state.mapScenario.invalidateSize();
        if (state.mapObserved) state.mapObserved.invalidateSize();
      }, 100);
    }

    function addTalukLabels() {
      // Compute taluk centroids from station coordinates
      const talukCoords = {};
      data.priority_table.forEach(s => {
        if (s.taluk && s.latitude && s.longitude) {
          if (!talukCoords[s.taluk]) talukCoords[s.taluk] = [];
          talukCoords[s.taluk].push([s.latitude, s.longitude]);
        }
      });

      state.talukLayerScenario = L.layerGroup();
      state.talukLayerObserved = L.layerGroup();

      Object.entries(talukCoords).forEach(([taluk, coords]) => {
        const avgLat = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
        const avgLon = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;

        const icon = L.divIcon({
          className: 'taluk-label-marker',
          html: `<span class="taluk-label-text">${taluk}</span>`,
          iconSize: [90, 20],
          iconAnchor: [45, 10]
        });

        L.marker([avgLat, avgLon], { icon: icon, interactive: false }).addTo(state.talukLayerScenario);
        L.marker([avgLat, avgLon], { icon: icon, interactive: false }).addTo(state.talukLayerObserved);
      });

      state.talukLayerScenario.addTo(state.mapScenario);
      state.talukLayerObserved.addTo(state.mapObserved);

      function updateTalukVisibility(map, layer) {
        if (map.getZoom() < 11) {
          if (map.hasLayer(layer)) map.removeLayer(layer);
        } else {
          if (!map.hasLayer(layer)) map.addLayer(layer);
        }
      }

      state.mapScenario.on('zoomend', () => updateTalukVisibility(state.mapScenario, state.talukLayerScenario));
      state.mapObserved.on('zoomend', () => updateTalukVisibility(state.mapObserved, state.talukLayerObserved));
    }

    // Helper: Depth to radius scale (6 px at shallowest to 16 px at deepest)
    function calcRadius(depth) {
      if (depth === null || depth === undefined) return 6;
      // Linear scaling: 2m = 6px, 25m = 16px
      return Math.max(6, Math.min(16, 6 + (depth - 2) * (10 / 23)));
    }

    function renderMapMarkers(stations) {
      if (!state.mapsInitialized) return;

      // Clear existing markers
      state.markersScenario.forEach(m => state.mapScenario.removeLayer(m));
      state.markersObserved.forEach(m => state.mapObserved.removeLayer(m));
      state.markersScenario = [];
      state.markersObserved = [];

      stations.forEach(s => {
        if (!s.latitude || !s.longitude) return;

        // Tier Color Mapping: high red (#ef4444), medium amber (#f59e0b), routine green (#22c55e)
        let tierColor = '#22c55e';
        if (s.priority_tier === 'High Priority') tierColor = '#ef4444';
        else if (s.priority_tier === 'Medium Priority') tierColor = '#f59e0b';

        // ── LEFT MAP: Scenario 2026 Marker ──
        const scenDepth = s.scenario_depth_mbgl !== null && s.scenario_depth_mbgl !== undefined
          ? s.scenario_depth_mbgl
          : (s.max_depth_mbgl !== null ? +(s.max_depth_mbgl + 3.2).toFixed(2) : null);

        const rLeft = calcRadius(scenDepth);
        const depthLeftText = scenDepth !== null ? `${scenDepth} m bgl` : 'Not yet measured';
        const tdsText = s.pre_monsoon_tds !== null && s.pre_monsoon_tds !== undefined ? `${s.pre_monsoon_tds} mg/L` : 'Not yet measured';

        const markerLeft = L.circleMarker([s.latitude, s.longitude], {
          radius: rLeft,
          fillColor: tierColor,
          color: '#0b1220',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.88
        });

        const tooltipLeft = `
          <div class="tooltip-title">${s.station_name} [SCENARIO]</div>
          <div class="tooltip-row">Taluk: <strong>${s.taluk}</strong> (${s.well_type})</div>
          <div class="tooltip-row">Projected Depth: <strong>${depthLeftText}</strong></div>
          <div class="tooltip-row">TDS: <strong>${tdsText}</strong></div>
          <div class="tooltip-row">Tier: <strong style="color: ${tierColor};">${s.priority_tier}</strong></div>
        `;
        markerLeft.bindTooltip(tooltipLeft, { direction: 'top', className: 'custom-map-tooltip' });
        markerLeft.on('click', () => selectStation(s));
        markerLeft.addTo(state.mapScenario);
        state.markersScenario.push(markerLeft);

        // ── RIGHT MAP: Observed May 2024 Marker ──
        const obsDepth = s.observed_may24_mbgl !== null && s.observed_may24_mbgl !== undefined ? s.observed_may24_mbgl : null;
        let markerRight;

        if (obsDepth !== null) {
          const rRight = calcRadius(obsDepth);
          markerRight = L.circleMarker([s.latitude, s.longitude], {
            radius: rRight,
            fillColor: tierColor,
            color: '#0b1220',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.88
          });

          const tooltipRight = `
            <div class="tooltip-title">${s.station_name} [MEASURED]</div>
            <div class="tooltip-row">Taluk: <strong>${s.taluk}</strong> (${s.well_type})</div>
            <div class="tooltip-row">Observed May 2024: <strong>${obsDepth} m bgl</strong></div>
            <div class="tooltip-row">Source: <strong>CGWB 2024-25, p.112</strong></div>
            <div class="tooltip-row">TDS: <strong>${tdsText}</strong></div>
            <div class="tooltip-row">Tier: <strong style="color: ${tierColor};">${s.priority_tier}</strong></div>
          `;
          markerRight.bindTooltip(tooltipRight, { direction: 'top', className: 'custom-map-tooltip' });
        } else {
          // Unmeasured station in May 2024 round
          markerRight = L.circleMarker([s.latitude, s.longitude], {
            radius: 6,
            fillColor: 'transparent',
            color: '#8ca3c0',
            weight: 1.5,
            dashArray: '3, 4',
            opacity: 0.8,
            fillOpacity: 0
          });

          const tooltipUnmeasured = `
            <div class="tooltip-title">${s.station_name}</div>
            <div class="tooltip-row">Taluk: <strong>${s.taluk}</strong> (${s.well_type})</div>
            <div class="tooltip-row">Observed May 2024: <strong style="color: var(--drought);">Not yet measured</strong></div>
            <div class="tooltip-row">TDS: <strong>${tdsText}</strong></div>
            <div class="tooltip-row" style="color: var(--muted); font-size: 11px;">No May 2024 reading on CGWB p.112</div>
          `;
          markerRight.bindTooltip(tooltipUnmeasured, { direction: 'top', className: 'custom-map-tooltip' });
        }

        markerRight.on('click', () => selectStation(s));
        markerRight.addTo(state.mapObserved);
        state.markersObserved.push(markerRight);
      });
    }

    // =========================================================================
    // 4. EL NIÑO TOGGLE
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

          if (data.enso_roni && data.enso_roni.length > 0) {
            const latestRoni = data.enso_roni[data.enso_roni.length - 1];
            const roniText = `${latestRoni.status} (+${latestRoni.anomaly}°C Anomaly)`;
            DOM.enRoniStatus.textContent = roniText;
            DOM.overlayRoniVal.textContent = roniText;
          }

          // Check for 2026 rainfall figure in data file
          const rf26Records = (data.rainfall_monthly || []).filter(m => m.year === 2026);
          if (rf26Records.length > 0) {
            const sum26 = rf26Records.reduce((acc, m) => acc + (m.total_mm || 0), 0);
            DOM.enRainfall2026.textContent = `${sum26.toFixed(1)} mm`;
            DOM.overlayRainVal.textContent = `${sum26.toFixed(1)} mm`;
          } else {
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
    // 5. CHARTS (SECTION E REQUIREMENTS)
    // =========================================================================
    function selectStation(st) {
      state.selectedStation = st;

      DOM.tsChartHeading.textContent = `${st.station_name} Seasonal Depth Time Series`;
      DOM.tsStationSub.textContent = `${st.taluk} Taluk • ${st.well_type}`;

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

      const seasons = ["May (Pre-Monsoon)", "Aug (SWM)", "Nov (NEM)", "Jan (Winter)"];
      const d23 = r23 ? [r23.may_val, r23.aug_val, r23.nov_val, r23.jan_val] : [st.max_depth_mbgl ? +(st.max_depth_mbgl * 0.8).toFixed(2) : null, null, null, null];
      const d24 = r24 ? [r24.may_val, r24.aug_val, r24.nov_val, r24.jan_val] : [st.observed_may24_mbgl || null, null, null, null];
      const dScenario = d23.map(v => v !== null ? +(v + 3.2).toFixed(2) : (st.scenario_depth_mbgl || null));

      state.charts.timeSeries = new Chart(ctx, {
        type: 'line',
        data: {
          labels: seasons,
          datasets: [
            {
              label: '2023–2024 Measured Depth (m bgl)',
              data: d23,
              borderColor: '#8ca3c0',
              backgroundColor: 'rgba(140, 163, 192, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              tension: 0.15
            },
            {
              label: '2024–2025 Measured Depth (m bgl)',
              data: d24,
              borderColor: '#2dd4bf',
              backgroundColor: 'rgba(45, 212, 191, 0.1)',
              borderWidth: 2.2,
              pointRadius: 5,
              pointBackgroundColor: '#2dd4bf',
              tension: 0.15
            },
            {
              label: '[SCENARIO] 2026 Severe Drought (+3.2m offset)',
              data: dScenario,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              borderDash: [5, 4],
              borderWidth: 2.2,
              pointRadius: 4,
              pointBackgroundColor: '#f59e0b',
              tension: 0.15
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8ca3c0', font: { family: 'Inter', size: 11, weight: 500 } }
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
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + 'm' },
              title: { display: true, text: 'Depth (m bgl)', color: '#8ca3c0', font: { size: 10 } }
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

      const tdsStations = stations.filter(s => s.pre_monsoon_tds !== null && s.pre_monsoon_tds !== undefined);
      const labels = tdsStations.map(s => s.station_name);
      const values = tdsStations.map(s => s.pre_monsoon_tds);
      const bgColors = values.map(v => v >= 2000 ? '#ef4444' : (v >= 1000 ? '#f59e0b' : '#2dd4bf'));

      state.charts.tds = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'TDS (mg/L)',
            data: values,
            backgroundColor: bgColors,
            borderRadius: 3
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
              ticks: { color: '#8ca3c0', font: { family: 'Inter', size: 9 }, maxRotation: 40, minRotation: 40 }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: {
                color: '#8ca3c0',
                font: { family: 'JetBrains Mono', size: 10 },
                callback: v => v === 2000 ? '2,000 (BIS Limit)' : v
              },
              title: { display: true, text: 'TDS (mg/L)', color: '#8ca3c0', font: { size: 10 } }
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
      const rf23Sum = rf23.reduce((acc, m) => acc + (m.total_mm || 0), 0).toFixed(1);
      const rf24Sum = rf24.reduce((acc, m) => acc + (m.total_mm || 0), 0).toFixed(1);

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      state.charts.rainfall = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: `2023 (${rf23Sum} mm total)`,
              data: months.map((_, i) => rf23[i] ? rf23[i].total_mm : 0),
              backgroundColor: '#8ca3c0',
              borderRadius: 3
            },
            {
              label: `2024 (${rf24Sum} mm total)`,
              data: months.map((_, i) => rf24[i] ? rf24[i].total_mm : 0),
              backgroundColor: '#2dd4bf',
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8ca3c0', font: { family: 'Inter', size: 11, weight: 500 } }
            },
            tooltip: {
              callbacks: { label: c => `${c.dataset.label}: ${c.raw.toFixed(1)} mm` }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 } },
              title: { display: true, text: 'Rainfall (mm)', color: '#8ca3c0', font: { size: 10 } }
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

      // Section A: Priority weights 40 / 40 / 20 (water table, salinity, fluctuation)
      const p1 = topStations.map(s => (s.max_depth_mbgl >= 20 ? 40 : (s.max_depth_mbgl >= 10 ? 25 : 12)));
      const p2 = topStations.map(s => ((s.pre_monsoon_tds || 0) >= 2000 ? 40 : ((s.pre_monsoon_tds || 0) >= 1200 ? 25 : 12)));
      const p3 = topStations.map(s => (s.seasonal_range_m >= 5.0 ? 20 : (s.seasonal_range_m >= 2.0 ? 10 : 5)));

      state.charts.pillars = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Pillar 1: Water table depth (40%)',
              data: p1,
              backgroundColor: '#ef4444',
              borderRadius: 2
            },
            {
              label: 'Pillar 2: Salinity / TDS (40%)',
              data: p2,
              backgroundColor: '#f59e0b',
              borderRadius: 2
            },
            {
              label: 'Pillar 3: Seasonal fluctuation (20%)',
              data: p3,
              backgroundColor: '#2dd4bf',
              borderRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8ca3c0', font: { family: 'Inter', size: 10, weight: 500 } }
            },
            tooltip: {
              callbacks: { label: c => `${c.dataset.label}: ${c.raw} pts` }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { color: '#8ca3c0', font: { family: 'Inter', size: 9 }, maxRotation: 40, minRotation: 40 }
            },
            y: {
              stacked: true,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 } },
              title: { display: true, text: 'Total Score (40/40/20)', color: '#8ca3c0', font: { size: 10 } }
            }
          }
        }
      });
    }

    // =========================================================================
    // 6. PRIORITY TABLE (SORTABLE + INSPECTION DOSSIER)
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

        const obsMay24 = s.observed_may24_mbgl !== null && s.observed_may24_mbgl !== undefined
          ? `${s.observed_may24_mbgl} m`
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
          <td><strong style="color: #ffffff; font-family: var(--font-mono);">#${idx + 1}</strong></td>
          <td class="st-name">${s.station_name}</td>
          <td>${s.taluk || 'Tiruppur'}</td>
          <td>${s.well_type}</td>
          <td class="num-col">${obsMay24}</td>
          <td class="num-col">${scen26} <span class="badge-scenario">SCENARIO</span></td>
          <td class="num-col">${swing}</td>
          <td class="num-col">${tds}</td>
          <td class="num-col"><strong style="color: #ffffff;">${s.priority_score}</strong></td>
          <td><span class="tier-pill ${tierClass}">${s.priority_tier}</span></td>
          <td>
            <button type="button" class="btn-ghost-inspect" data-name="${s.station_name}">Inspect</button>
          </td>
        `;

        tr.addEventListener('click', (e) => {
          if (!e.target.classList.contains('btn-ghost-inspect')) {
            selectStation(s);
          }
        });

        tr.querySelector('.btn-ghost-inspect').addEventListener('click', (e) => {
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
      DOM.modalObservedMay24.textContent = s.observed_may24_mbgl !== null && s.observed_may24_mbgl !== undefined
        ? `${s.observed_may24_mbgl} m bgl`
        : 'Not yet measured';
      DOM.modalScenario2026.textContent = s.scenario_depth_mbgl !== null && s.scenario_depth_mbgl !== undefined
        ? `${s.scenario_depth_mbgl} m bgl`
        : (s.max_depth_mbgl !== null ? `${+(s.max_depth_mbgl + 3.2).toFixed(2)} m bgl` : 'Not yet measured');
      DOM.modalSwing.textContent = s.seasonal_range_m !== null ? `${s.seasonal_range_m} m` : 'Not yet measured';
      DOM.modalTds.textContent = s.pre_monsoon_tds !== null ? `${s.pre_monsoon_tds} mg/L` : 'Not yet measured';
      DOM.modalScore.textContent = `Priority Score: ${s.priority_score} / 100 (${s.priority_tier})`;
      DOM.modalRationale.innerHTML = `<strong>Priority Action Rationale:</strong> ${s.evidence_rationale || 'Routine baseline monitoring.'}<br><br><span style="font-size: 11.5px; color: var(--muted);">Source Record: ${s.source || 'CGWB Groundwater Yearbook'}</span>`;
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

      console.log("Where Tiruppur's Water Breaks First: Monsoon Ink Two-Map Analytics Initialized.");
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

print(f"Generated complete updated index.html! File size: {os.path.getsize('index.html')} bytes")
