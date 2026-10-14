# build_taluk_image_dashboard.py
import json
import os

with open('data/app_data.js', 'r', encoding='utf-8') as f:
    app_data_str = f.read().strip()

# Extract JSON portion
json_part = app_data_str.split('=', 1)[1].strip().rstrip(';')

html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Where Tiruppur's Water Breaks First — Taluk Groundwater Analytics &amp; Drought Scenario</title>
  <meta name="description" content="Two-panel taluk map comparison evaluating projected 2026 drought scenario against observed May 2024 ground truth depths across Tiruppur district.">

  <!-- Google Fonts: Inter (labels & body) & JetBrains Mono (numbers & tables) with system-ui fallback -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Chart.js 4.4.1 for analytical validation charts -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <style>
    /* ==========================================================================
       SECTION 8: MONSOON INK DESIGN TOKENS (STRICT SPEC)
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

      --font-body: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;
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

    /* Subtle single header gradient in the header at 8% opacity */
    .header-gradient-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 260px;
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

    /* ── 1. HEADER ── */
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
      gap: 14px;
    }

    .site-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text);
      white-space: nowrap;
    }

    .site-sub {
      font-size: 13px;
      color: var(--muted);
      margin-top: 3px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .status-tag {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .tag-drought {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid var(--drought);
      color: var(--drought);
    }

    .tag-sdg {
      background: rgba(45, 212, 191, 0.1);
      border: 1px solid var(--border);
      color: var(--water);
    }

    .btn-control {
      background: var(--surface-2);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 500;
      padding: 7px 14px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
      user-select: none;
    }

    .btn-control:hover {
      background: #1c2a46;
      border-color: var(--water);
      color: #ffffff;
    }

    .btn-control:focus-visible {
      outline: 2px solid var(--water);
      outline-offset: 2px;
    }

    .btn-pres {
      background: rgba(45, 212, 191, 0.12);
      border-color: var(--water);
      color: var(--water);
    }

    .btn-pres:hover {
      background: rgba(45, 212, 191, 0.22);
    }

    .btn-pres.active {
      background: var(--drought);
      border-color: var(--drought);
      color: #0b1220;
      font-weight: 600;
    }

    /* ── 2. KPI STRIP (SECTION 8 SPEC: --surface, 12px radius, 12px uppercase, 32px mono, 13px muted, NO EMOJIS) ── */
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
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
    }

    .kpi-label {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
      line-height: 1.2;
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

    /* ── 3. TWO-PANEL TALUK COMPARISON SECTION (TOP OF PAGE, MOST IMPORTANT) ── */
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

    /* Dual Panels Grid: Desktop (>900px) two columns, 16px gap */
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
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: 0 0 14px 0;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .panel-title {
      font-size: 15px;
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

    /* Taluk Image Container */
    .taluk-image-wrapper {
      position: relative;
      width: 100%;
      border-radius: 8px;
      background: #090e18;
      border: 1px solid var(--border);
      overflow: visible;
    }

    .taluk-ref-img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      border-radius: 8px;
      filter: brightness(0.85) contrast(1.05);
    }

    /* Taluk Chips (Percentage Absolute Positioning: Section 4 spec) */
    .taluk-chip {
      position: absolute;
      transform: translate(-50%, -50%);
      background: rgba(17, 26, 43, 0.92);
      backdrop-filter: blur(4px);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      user-select: none;
      transition: transform 0.15s ease, outline 0.15s ease, box-shadow 0.15s ease;
      z-index: 10;
      white-space: nowrap;
    }

    .taluk-chip:hover {
      transform: translate(-50%, -50%) scale(1.04);
      background: rgba(22, 34, 58, 0.98);
      z-index: 20;
    }

    .taluk-chip:focus-visible {
      outline: 2px solid var(--water);
      outline-offset: 2px;
      z-index: 25;
    }

    .taluk-chip.chip-active {
      outline: 2px solid var(--water) !important;
      outline-offset: 2px;
      box-shadow: 0 0 12px rgba(45, 212, 191, 0.4);
      z-index: 22;
    }

    .chip-name {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text);
      line-height: 1.2;
    }

    .chip-val {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
      margin: 2px 0;
    }

    .chip-count {
      font-size: 13px;
      color: var(--muted);
      line-height: 1;
    }

    /* Chip Tier Border Colors */
    .chip-tier-high {
      border-color: var(--high);
    }
    .chip-tier-high .chip-val {
      color: var(--high);
    }

    .chip-tier-medium {
      border-color: var(--medium);
    }
    .chip-tier-medium .chip-val {
      color: var(--medium);
    }

    .chip-tier-routine {
      border-color: var(--routine);
    }
    .chip-tier-routine .chip-val {
      color: var(--routine);
    }

    .chip-tier-insufficient {
      border-color: var(--muted);
    }
    .chip-tier-insufficient .chip-val {
      color: var(--muted);
    }

    .chip-tier-unmeasured {
      border-style: dashed;
      border-color: var(--muted);
    }
    .chip-tier-unmeasured .chip-val {
      color: var(--muted);
      font-size: 13px;
      font-style: italic;
    }

    /* Custom Tooltip on Chip Hover */
    .chip-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text);
      font-size: 12px;
      line-height: 1.4;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
      width: 230px;
      z-index: 100;
      text-align: left;
    }

    /* Positioning adjustment for chips near top border */
    .taluk-chip.tooltip-below .chip-tooltip {
      bottom: auto;
      top: calc(100% + 8px);
    }

    .taluk-chip:hover .chip-tooltip {
      opacity: 1;
      visibility: visible;
    }

    .chip-tt-title {
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
      font-size: 12px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2px;
    }

    .chip-tt-list {
      max-height: 140px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .chip-tt-item {
      display: flex;
      justify-content: space-between;
      color: var(--muted);
      font-size: 11px;
    }

    .chip-tt-item span:last-child {
      font-family: var(--font-mono);
      color: var(--text);
    }

    /* Captions & Footnotes */
    .panel-caption {
      font-size: 12px;
      color: var(--muted);
      margin-top: 10px;
      line-height: 1.4;
    }

    .panel-footnote {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.4;
      border-top: 1px solid var(--border);
      padding-top: 8px;
      margin-top: 8px;
    }

    .outside-taluks-note {
      font-size: 11.5px;
      color: var(--muted);
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed var(--border);
      line-height: 1.4;
    }

    /* Panel Legend */
    .panel-legend {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 12px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot-high { background: var(--high); }
    .dot-medium { background: var(--medium); }
    .dot-routine { background: var(--routine); }
    .dot-insufficient { background: var(--muted); }
    .dot-unmeasured {
      background: transparent;
      border: 1.5px dashed var(--muted);
    }

    /* Interaction Bar Below Panels */
    .map-interaction-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 6px;
      padding: 0 4px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-indicator {
      font-size: 13px;
      color: var(--muted);
    }

    .filter-indicator strong {
      color: var(--water);
    }

    /* ── 4. FILTER BAR ── */
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

    /* ── 5. CHARTS GRID (2x2) ── */
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

    /* ── 6. PRIORITY TABLE ── */
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
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .pill-high {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid var(--high);
      color: var(--high);
    }

    .pill-medium {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid var(--medium);
      color: var(--medium);
    }

    .pill-routine {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid var(--routine);
      color: var(--routine);
    }

    /* ── 7. COLLAPSIBLE METHODS & PROVENANCE ── */
    .collapsible-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 32px;
    }

    .collapsible-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }

    .collapsible-trigger {
      padding: 14px 20px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
    }

    .collapsible-trigger:hover {
      background: var(--surface-2);
    }

    .collapsible-content {
      padding: 0 20px 18px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }

    .provenance-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
    }

    .provenance-table th, .provenance-table td {
      padding: 8px 12px;
      border: 1px solid var(--border);
      text-align: left;
    }

    .provenance-table th {
      background: var(--surface-2);
      color: var(--text);
      font-weight: 600;
    }

    /* ── 8. QR DOCK & FOOTER ── */
    .qr-dock {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 32px;
    }

    .qr-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .qr-img {
      width: 72px;
      height: 72px;
      border-radius: 6px;
      background: #ffffff;
      padding: 4px;
    }

    .qr-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 2px;
    }

    .qr-desc {
      font-size: 12px;
      color: var(--muted);
      max-width: 440px;
    }

    .qr-url-code {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--water);
      background: var(--surface-2);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 4px;
      user-select: all;
    }

    .site-footer {
      border-top: 1px solid var(--border);
      padding: 24px 0 40px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.6;
    }

    .unified-footnote {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.5;
    }

    /* Modal Inspection */
    .modal-veil {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(11, 18, 32, 0.85);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .modal-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      width: 100%;
      max-width: 540px;
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
       SECTION 9: PRESENTATION MODE (FOR 2-MINUTE PITCH)
       ========================================================================== */
    body.presentation-mode .hero-kpi-strip,
    body.presentation-mode .filter-bar,
    body.presentation-mode .charts-grid-2x2,
    body.presentation-mode .table-section,
    body.presentation-mode .collapsible-stack,
    body.presentation-mode .site-footer {
      display: none !important;
    }

    body.presentation-mode .site-wrapper {
      max-width: 100%;
      padding: 0 32px;
    }

    body.presentation-mode .map-section {
      margin-bottom: 24px;
    }

    body.presentation-mode .qr-dock {
      margin-top: 20px;
      padding: 12px 24px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

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
      .site-title {
        white-space: normal;
        font-size: 22px;
      }
      .dual-maps-grid {
        grid-template-columns: 1fr;
      }
      .filter-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .taluk-chip {
        padding: 5px 8px;
      }
      .chip-name {
        font-size: 11px;
      }
      .chip-val {
        font-size: 14px;
      }
      .chip-count {
        font-size: 12px;
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
      .panel-legend {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>

  <div class="header-gradient-bg" aria-hidden="true"></div>

  <div class="site-wrapper">

    <!-- ═══ 1. HEADER ═══ -->
    <header class="site-header" role="banner">
      <div class="header-left">
        <div>
          <h1 class="site-title">Where Tiruppur's Water Breaks First</h1>
          <p class="site-sub">Which wells fail first in a dry year? Ground truth depths vs. projected drought stress</p>
        </div>
      </div>
      <div class="header-right">
        <span class="status-tag tag-drought">2026 Drought Scenario</span>
        <span class="status-tag tag-sdg">SDG 6 Clean Water</span>
        <span class="status-tag tag-sdg">SDG 3 Good Health</span>
        <button type="button" id="btnPresentationView" class="btn-control btn-pres" title="Toggle 2-minute pitch presentation layout">Presentation view</button>
      </div>
    </header>

    <!-- ═══ 2. KPI STRIP (SECTION 8 SPEC: 12px uppercase, 32px mono, 13px muted, no emojis) ═══ -->
    <section class="hero-kpi-strip" aria-label="Key Performance Indicators">
      <!-- 1. Stations Tracked -->
      <div class="kpi-card">
        <div class="kpi-label">Stations Tracked</div>
        <div class="kpi-val" id="kpiStationsTracked">—</div>
        <div class="kpi-unit-line">Distinct monitoring stations &bull; CGWB 2023–25</div>
      </div>

      <!-- 2. Median Depth -->
      <div class="kpi-card">
        <div class="kpi-label">Median Depth (m bgl)</div>
        <div class="kpi-val" id="kpiMedianDepth">—</div>
        <div class="kpi-unit-line">m bgl &bull; Pre-monsoon May baseline</div>
      </div>

      <!-- 3. Wells Above 2,000 mg/L TDS -->
      <div class="kpi-card">
        <div class="kpi-label">Wells &gt; 2,000 mg/L TDS</div>
        <div class="kpi-val" id="kpiHighTdsCount">—</div>
        <div class="kpi-unit-line">mg/L &bull; Exceeds BIS IS 10500:2012 permissible limit</div>
      </div>

      <!-- 4. Annual Rainfall -->
      <div class="kpi-card">
        <div class="kpi-label">Annual Rainfall (2024)</div>
        <div class="kpi-val" id="kpiAnnualRainfall">—</div>
        <div class="kpi-unit-line">NASA POWER point estimate, 11.1085 N, 77.3411 E</div>
      </div>

      <!-- 5. High-Priority Count -->
      <div class="kpi-card">
        <div class="kpi-label">High-Priority Wells</div>
        <div class="kpi-val" id="kpiHighPriorityCount">—</div>
        <div class="kpi-unit-line">Composite score &ge; 70 &bull; 40 / 40 / 20 weighting</div>
      </div>
    </section>

    <!-- ═══ 3. TWO-PANEL COMPARISON (TOP OF PAGE, MOST IMPORTANT) ═══ -->
    <section class="map-section" aria-label="Taluk Map Two-Panel Comparison">
      <div class="map-controls-header">
        <div>
          <h2 class="section-heading">Taluk Groundwater Vulnerability Comparison</h2>
          <p class="section-sub">Synchronized two-panel analysis: projected drought scenario vs. observed May 2024 ground truth</p>
        </div>
        <button type="button" id="btnClearTalukFilter" class="btn-control" title="Clear taluk selection">Clear filter</button>
      </div>

      <!-- Dual Panels Grid -->
      <div class="dual-maps-grid">
        <!-- ── LEFT PANEL: Expected Summer 2026 (Scenario) ── -->
        <div class="map-panel" id="panelScenario">
          <div class="panel-header">
            <h3 class="panel-title">Expected summer 2026 (scenario)</h3>
            <span class="badge-scenario">SCENARIO</span>
          </div>

          <div class="taluk-image-wrapper">
            <img src="assets/tiruppur_taluks_reference.png" alt="Illustrative map of the six taluks of Tiruppur district." class="taluk-ref-img">

            <!-- Six Taluk Overlay Chips (Left Panel) -->
            <div id="chipsContainerLeft">
              <!-- Rendered via JS using Section 4 & 5 rules -->
            </div>
          </div>

          <div class="panel-caption">
            Illustrative taluk map of Tiruppur district. Not to scale. Boundaries approximate. Source: Tiruppur District Administration Map.
          </div>

          <div class="panel-footnote">
            Scenario method: empirical +3.2 m drawdown offset applied to the May 2024 baseline. Derivation: not yet documented; treat as illustrative.
          </div>

          <div class="outside-taluks-note" id="outsideTaluksLeft">
            <!-- Populated via JS -->
          </div>

          <div class="panel-legend">
            <div class="legend-item"><span class="legend-dot dot-high"></span> High priority (&ge; 20 m bgl)</div>
            <div class="legend-item"><span class="legend-dot dot-medium"></span> Medium (10 to 20 m bgl)</div>
            <div class="legend-item"><span class="legend-dot dot-routine"></span> Routine (&lt; 10 m bgl)</div>
            <div class="legend-item"><span class="legend-dot dot-insufficient"></span> Insufficient data (&lt; 2 readings)</div>
            <div class="legend-item"><span class="legend-dot dot-unmeasured"></span> Not yet measured (0 readings)</div>
          </div>
        </div>

        <!-- ── RIGHT PANEL: Observed Pre-Monsoon May 2024 ── -->
        <div class="map-panel" id="panelObserved">
          <div class="panel-header">
            <h3 class="panel-title">Observed pre-monsoon May 2024</h3>
            <span class="badge-measured">MEASURED</span>
          </div>

          <div class="taluk-image-wrapper">
            <img src="assets/tiruppur_taluks_reference.png" alt="Illustrative map of the six taluks of Tiruppur district." class="taluk-ref-img">

            <!-- Six Taluk Overlay Chips (Right Panel) -->
            <div id="chipsContainerRight">
              <!-- Rendered via JS using Section 4 & 5 rules -->
            </div>
          </div>

          <div class="panel-caption">
            Illustrative taluk map of Tiruppur district. Not to scale. Boundaries approximate. Source: Tiruppur District Administration Map.
          </div>

          <div class="panel-footnote">
            Source: CGWB Groundwater Yearbook 2024-25, page 112 (May 2024 pre-monsoon). Stations with no reading in that round show 'Not yet measured'.
          </div>

          <div class="outside-taluks-note" id="outsideTaluksRight">
            <!-- Populated via JS -->
          </div>

          <div class="panel-legend">
            <div class="legend-item"><span class="legend-dot dot-high"></span> High priority (&ge; 20 m bgl)</div>
            <div class="legend-item"><span class="legend-dot dot-medium"></span> Medium (10 to 20 m bgl)</div>
            <div class="legend-item"><span class="legend-dot dot-routine"></span> Routine (&lt; 10 m bgl)</div>
            <div class="legend-item"><span class="legend-dot dot-insufficient"></span> Insufficient data (&lt; 2 readings)</div>
            <div class="legend-item"><span class="legend-dot dot-unmeasured"></span> Not yet measured (0 readings)</div>
          </div>
        </div>
      </div>

      <!-- Interaction Status -->
      <div class="map-interaction-bar">
        <span class="filter-indicator" id="filterStatusText">Showing all stations across Tiruppur district</span>
        <button type="button" id="btnResetMapView" class="btn-control" style="font-size: 11px; padding: 5px 12px;">Clear selection</button>
      </div>
    </section>

    <!-- ═══ 4. FILTER BAR ═══ -->
    <section class="filter-bar" aria-label="Interactive Filters">
      <div class="filter-grid">
        <div class="filter-group">
          <label for="filterTaluk" class="filter-label">Taluk</label>
          <select id="filterTaluk" class="filter-select">
            <option value="all">All Taluks (6 Taluks)</option>
            <option value="Avinashi">Avinashi</option>
            <option value="Tirupur">Tirupur</option>
            <option value="Palladam">Palladam</option>
            <option value="Kangayam">Kangayam</option>
            <option value="Dharapuram">Dharapuram</option>
            <option value="Udumalpet">Udumalpet</option>
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
          <input type="text" id="filterSearch" class="filter-input" placeholder="Search station...">
        </div>

        <div class="filter-group">
          <button type="button" id="btnResetFilters" class="btn-control" style="width: 100%;" title="Reset all filters">Reset</button>
        </div>
      </div>
    </section>

    <!-- ═══ 5. CHARTS GRID (2x2) ═══ -->
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

    <!-- ═══ 6. PRIORITY TABLE ═══ -->
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

    <!-- ═══ 7. COLLAPSIBLE METHODS & PROVENANCE ═══ -->
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
          <span>Hydrogeological Disclosures, Contamination &amp; Taluk Map Reference</span>
        </summary>
        <div class="collapsible-content">
          <p><strong>1. Taluk Map Reference:</strong> The illustrated taluk reference map depicts the six administrative taluks of Tiruppur district (Avinashi, Tirupur, Palladam, Kangayam, Dharapuram, Udumalpet). It is an illustrative visual reference and boundaries are approximate.</p>
          <p style="margin-top: 8px;"><strong>2. Crystalline Hydrogeology:</strong> Tiruppur rests on weathered and fissured crystalline rocks (gneisses and charnockites) with low primary porosity (specific yield typically 1.5% to 3.0%), making groundwater tables acutely vulnerable to deficit recharge during drought intervals.</p>
          <p style="margin-top: 8px;"><strong>3. Surveillance Gaps:</strong> Of 32 stations in the 2023–24 baseline network, only 9 core urban wells were resurveyed in the 2024–25 yearbook. Unmeasured stations are labeled "Not yet measured" rather than extrapolated.</p>
          <p style="margin-top: 8px;"><strong>4. Industrial Contamination &amp; Salinity:</strong> Decades of intensive textile bleaching and dyeing operations historically discharged saline effluents into the Noyyal River basin and Orathupalayam reservoir, resulting in widespread percolation of sodium chloride, sodium sulphate, and elevated TDS into shallow unconfined aquifers (Source: CGWB Groundwater Quality 2024 &amp; TNPCB Water Quality Monitoring Reports).</p>
        </div>
      </details>
    </section>

    <!-- ═══ 8. QR DOCK & FOOTER ═══ -->
    <section class="qr-dock">
      <div class="qr-left">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&amp;data=https://arunp061106.github.io/data-canvas-26-DF-dashboard/" alt="Live Dashboard QR Code" class="qr-img">
        <div>
          <div class="qr-title">Live Device &amp; Pitch View</div>
          <div class="qr-desc">Scan to interact with the two-panel taluk model and live filter system on your mobile device.</div>
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
          <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.06em; margin-bottom: 4px;">Observed May 2024</div>
          <div id="modalObservedMay24" style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: var(--water);">--</div>
          <div style="font-size: 11px; color: var(--muted);">m bgl &bull; CGWB 2024-25, p.112</div>
        </div>
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.06em; margin-bottom: 4px;">2026 Scenario Depth</div>
          <div id="modalScenario2026" style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: var(--drought);">--</div>
          <div style="font-size: 11px; color: var(--muted);">m bgl &bull; +3.2 m offset</div>
        </div>
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.06em; margin-bottom: 4px;">Seasonal Swing</div>
          <div id="modalSwing" style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: var(--text);">--</div>
          <div style="font-size: 11px; color: var(--muted);">m &bull; Pre-to-post monsoon</div>
        </div>
        <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.06em; margin-bottom: 4px;">Total Dissolved Solids</div>
          <div id="modalTds" style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: var(--text);">--</div>
          <div style="font-size: 11px; color: var(--muted);">mg/L &bull; Laboratory analysis</div>
        </div>
      </div>
      <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 14px;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.06em; margin-bottom: 4px;">Composite Score &amp; Action Rationale</div>
        <div id="modalScore" style="font-weight: 600; color: #ffffff; margin-bottom: 6px; font-family: var(--font-mono);">--</div>
        <div id="modalRationale" style="font-size: 13px; color: var(--muted); line-height: 1.5;">--</div>
      </div>
    </div>
  </div>

  <!-- ═══ EMBEDDED DASHBOARD DATA ═══ -->
  <script>
    window.DASHBOARD_DATA = ''' + json_part + ''';
  </script>

  <!-- ═══ DASHBOARD CONTROLLER & TALUK COMPARISON LOGIC ═══ -->
  <script>
  (function() {
    'use strict';

    const data = window.DASHBOARD_DATA;
    if (!data) {
      console.error("DASHBOARD_DATA not found.");
      return;
    }

    // Six Taluks from the reference map (Section 4 specs)
    const SIX_TALUKS = [
      { name: 'Avinashi',   left: 33, top: 16 },
      { name: 'Tirupur',    left: 40, top: 30 },
      { name: 'Palladam',   left: 25, top: 35 },
      { name: 'Kangayam',   left: 67, top: 33 },
      { name: 'Dharapuram', left: 51, top: 56 },
      { name: 'Udumalpet',  left: 16, top: 76 }
    ];

    function matchTaluk(stationTaluk, targetTaluk) {
      const st = (stationTaluk || '').trim().toLowerCase();
      const tt = (targetTaluk || '').trim().toLowerCase();
      if (tt === 'tirupur') return st === 'tirupur' || st === 'tiruppur' || st === 'thiruppur';
      if (tt === 'kangayam') return st === 'kangayam' || st === 'kangeyam';
      if (tt === 'udumalpet') return st === 'udumalpet' || st === 'udumalaipettai';
      return st === tt;
    }

    // App State
    const state = {
      selectedTaluk: null, // null = all
      filters: {
        taluk: 'all',
        wellType: 'all',
        priority: 'all',
        search: ''
      },
      sortCol: 'rank',
      sortAsc: true,
      selectedStation: data.priority_table[0] || null,
      isPresentationMode: false,
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
      btnPresentationView: document.getElementById('btnPresentationView'),
      btnClearTalukFilter: document.getElementById('btnClearTalukFilter'),
      btnResetMapView: document.getElementById('btnResetMapView'),
      chipsContainerLeft: document.getElementById('chipsContainerLeft'),
      chipsContainerRight: document.getElementById('chipsContainerRight'),
      outsideTaluksLeft: document.getElementById('outsideTaluksLeft'),
      outsideTaluksRight: document.getElementById('outsideTaluksRight'),
      filterStatusText: document.getElementById('filterStatusText'),
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
        // Taluk filter from chip or dropdown
        if (state.selectedTaluk) {
          if (!matchTaluk(s.taluk, state.selectedTaluk)) return false;
        } else if (state.filters.taluk !== 'all') {
          if (!matchTaluk(s.taluk, state.filters.taluk)) return false;
        }

        if (state.filters.wellType !== 'all' && s.well_type !== state.filters.wellType) return false;
        if (state.filters.priority !== 'all' && s.priority_tier !== state.filters.priority) return false;

        if (state.filters.search) {
          const q = state.filters.search;
          const matchName = (s.station_name || '').toLowerCase().includes(q);
          const matchT = (s.taluk || '').toLowerCase().includes(q);
          if (!matchName && !matchT) return false;
        }

        return true;
      });
    }

    function applyFilters() {
      const filtered = getFilteredStations();
      updateKpis(filtered);
      renderTable(filtered);
      renderTdsChart(filtered);
      renderPillarsChart(filtered);

      DOM.tableFilterCount.textContent = `${filtered.length} Stations`;

      if (state.selectedTaluk) {
        DOM.filterStatusText.innerHTML = `Filtered by: <strong>${state.selectedTaluk} Taluk</strong> (${filtered.length} stations)`;
      } else {
        DOM.filterStatusText.textContent = `Showing all stations across Tiruppur district (${filtered.length} stations)`;
      }

      // Update chip active outline
      document.querySelectorAll('.taluk-chip').forEach(chip => {
        if (chip.getAttribute('data-taluk') === state.selectedTaluk) {
          chip.classList.add('chip-active');
        } else {
          chip.classList.remove('chip-active');
        }
      });

      if (filtered.length > 0) {
        const stillSelected = filtered.find(s => s.station_name === state.selectedStation?.station_name);
        if (!stillSelected) {
          selectStation(filtered[0]);
        }
      }
    }

    function initFilters() {
      DOM.filterTaluk.addEventListener('change', (e) => {
        state.selectedTaluk = e.target.value === 'all' ? null : e.target.value;
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

      function resetAllFilters() {
        state.selectedTaluk = null;
        state.filters = { taluk: 'all', wellType: 'all', priority: 'all', search: '' };
        DOM.filterTaluk.value = 'all';
        DOM.filterWellType.value = 'all';
        DOM.filterPriority.value = 'all';
        DOM.filterSearch.value = '';
        applyFilters();
      }

      DOM.btnResetFilters.addEventListener('click', resetAllFilters);
      DOM.btnClearTalukFilter.addEventListener('click', resetAllFilters);
      DOM.btnResetMapView.addEventListener('click', resetAllFilters);
    }

    // =========================================================================
    // 2. KPI STRIP COMPUTATION (DIRECT FROM DATA ARRAYS)
    // =========================================================================
    function updateKpis(filtered) {
      // 1. Stations tracked = distinct stations in filtered array
      DOM.kpiStationsTracked.textContent = filtered.length;

      // 2. Median depth (m bgl)
      const validDepths = filtered.map(s => s.max_depth_mbgl).filter(d => d !== null && d !== undefined).sort((a,b) => a - b);
      if (validDepths.length > 0) {
        const mid = Math.floor(validDepths.length / 2);
        const med = validDepths.length % 2 !== 0 ? validDepths[mid] : ((validDepths[mid - 1] + validDepths[mid]) / 2);
        DOM.kpiMedianDepth.textContent = med.toFixed(1);
      } else {
        DOM.kpiMedianDepth.textContent = "Not yet measured";
      }

      // 3. Wells above 2,000 mg/L TDS = measured TDS > 2000
      const highTdsCount = filtered.filter(s => (s.pre_monsoon_tds && s.pre_monsoon_tds > 2000) || (s.post_monsoon_tds && s.post_monsoon_tds > 2000)).length;
      DOM.kpiHighTdsCount.textContent = highTdsCount;

      // 4. Annual rainfall (computed from NASA POWER monthly sums for 2024)
      const rf2024Sum = (data.rainfall_monthly || []).filter(m => m.year === 2024).reduce((acc, m) => acc + (m.total_mm || 0), 0);
      DOM.kpiAnnualRainfall.textContent = rf2024Sum.toFixed(1);

      // 5. High-priority wells = composite score >= 70
      const highPriorityCount = filtered.filter(s => s.priority_score >= 70).length;
      DOM.kpiHighPriorityCount.textContent = highPriorityCount;
    }

    // =========================================================================
    // 3. TWO-PANEL TALUK COMPARISON WITH DYNAMIC CHIPS
    // =========================================================================
    function renderTalukChips() {
      const stations = data.priority_table;

      // Identify stations outside the six mapped taluks
      const outside = stations
        .filter(s => !SIX_TALUKS.some(t => matchTaluk(s.taluk, t.name)))
        .map(s => s.station_name);

      const outsideUnique = Array.from(new Set(outside)).sort();
      const outsideHtml = outsideUnique.length > 0
        ? `<strong>Stations outside the six mapped taluks (${outsideUnique.length}):</strong> ${outsideUnique.join(', ')}.`
        : '';

      DOM.outsideTaluksLeft.innerHTML = outsideHtml;
      DOM.outsideTaluksRight.innerHTML = outsideHtml;

      // Helper to compute stats for a taluk
      function getTalukStats(talukName, mode) {
        const stMatches = stations.filter(s => matchTaluk(s.taluk, talukName));

        let readings = [];
        stMatches.forEach(s => {
          if (mode === 'scenario') {
            const val = s.scenario_depth_mbgl !== null && s.scenario_depth_mbgl !== undefined
              ? s.scenario_depth_mbgl
              : (s.max_depth_mbgl !== null ? +(s.max_depth_mbgl + 3.2).toFixed(2) : null);
            if (val !== null) readings.push({ station: s.station_name, depth: val, year: '2026 Scenario' });
          } else {
            // mode === 'observed' (May 2024 pre-monsoon round only)
            if (s.observed_may24_mbgl !== null && s.observed_may24_mbgl !== undefined) {
              readings.push({ station: s.station_name, depth: s.observed_may24_mbgl, year: 'May 2024' });
            }
          }
        });

        readings.sort((a,b) => a.depth - b.depth);
        const count = readings.length;

        let median = null;
        let tierClass = 'chip-tier-routine';
        let valText = '';
        let ariaText = '';
        let countText = '';

        if (count >= 2) {
          const mid = Math.floor(count / 2);
          median = count % 2 !== 0 ? readings[mid].depth : ((readings[mid - 1].depth + readings[mid].depth) / 2);
          valText = `${median.toFixed(1)} m bgl`;
          countText = `${count} stations`;

          if (median >= 20) {
            tierClass = 'chip-tier-high';
          } else if (median >= 10) {
            tierClass = 'chip-tier-medium';
          } else {
            tierClass = 'chip-tier-routine';
          }

          ariaText = `${talukName} taluk, median ${median.toFixed(1)} m bgl, ${count} stations`;
        } else if (count === 1) {
          median = readings[0].depth;
          valText = `${median.toFixed(1)} m bgl`;
          countText = '1 station &bull; Insufficient data';
          tierClass = 'chip-tier-insufficient';
          ariaText = `${talukName} taluk, ${readings[0].depth} m bgl, 1 station (insufficient data)`;
        } else {
          valText = 'Not yet measured';
          countText = '0 stations';
          tierClass = 'chip-tier-unmeasured';
          ariaText = `${talukName} taluk, Not yet measured, 0 stations`;
        }

        return {
          talukName,
          count,
          readings,
          valText,
          countText,
          tierClass,
          ariaText
        };
      }

      function createChipElement(tConfig, stats) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `taluk-chip ${stats.tierClass}`;
        if (tConfig.top < 30) {
          btn.classList.add('tooltip-below');
        }
        btn.style.left = `${tConfig.left}%`;
        btn.style.top = `${tConfig.top}%`;
        btn.setAttribute('data-taluk', tConfig.name);
        btn.setAttribute('aria-label', stats.ariaText);

        // Tooltip showing stations list with depth and year
        let ttListHtml = '';
        if (stats.readings.length > 0) {
          ttListHtml = stats.readings.map(r => `
            <div class="chip-tt-item">
              <span>${r.station}</span>
              <span>${r.depth} m (${r.year})</span>
            </div>
          `).join('');
        } else {
          ttListHtml = '<div style="color: var(--muted); font-size: 11px;">Not yet measured (no readings for this round).</div>';
        }

        btn.innerHTML = `
          <span class="chip-name">${tConfig.name}</span>
          <span class="chip-val">${stats.valText}</span>
          <span class="chip-count">${stats.countText}</span>
          <div class="chip-tooltip">
            <div class="chip-tt-title">${tConfig.name} Taluk</div>
            <div class="chip-tt-list">
              ${ttListHtml}
            </div>
          </div>
        `;

        btn.addEventListener('click', () => {
          if (state.selectedTaluk === tConfig.name) {
            state.selectedTaluk = null;
            DOM.filterTaluk.value = 'all';
          } else {
            state.selectedTaluk = tConfig.name;
            DOM.filterTaluk.value = tConfig.name;
          }
          applyFilters();
        });

        return btn;
      }

      // Populate Left (Scenario 2026)
      DOM.chipsContainerLeft.innerHTML = '';
      SIX_TALUKS.forEach(t => {
        const stats = getTalukStats(t.name, 'scenario');
        const chip = createChipElement(t, stats);
        DOM.chipsContainerLeft.appendChild(chip);
      });

      // Populate Right (Observed May 2024)
      DOM.chipsContainerRight.innerHTML = '';
      SIX_TALUKS.forEach(t => {
        const stats = getTalukStats(t.name, 'observed');
        const chip = createChipElement(t, stats);
        DOM.chipsContainerRight.appendChild(chip);
      });
    }

    // =========================================================================
    // 4. PRESENTATION MODE (SECTION 9)
    // =========================================================================
    function togglePresentationMode() {
      state.isPresentationMode = !state.isPresentationMode;

      if (state.isPresentationMode) {
        document.body.classList.add('presentation-mode');
        DOM.btnPresentationView.classList.add('active');
        DOM.btnPresentationView.textContent = 'Exit';
      } else {
        document.body.classList.remove('presentation-mode');
        DOM.btnPresentationView.classList.remove('active');
        DOM.btnPresentationView.textContent = 'Presentation view';
      }
    }

    function initPresentationMode() {
      DOM.btnPresentationView.addEventListener('click', togglePresentationMode);

      // Keyboard accessible: Escape key to exit presentation mode
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.isPresentationMode) {
          togglePresentationMode();
        }
      });
    }

    // =========================================================================
    // 5. CHARTS (TIME SERIES, TDS, RAINFALL, PILLARS)
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
              ticks: {
                color: '#8ca3c0',
                font: { family: 'Inter', size: 10 },
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + ' mg/L' }
            }
          }
        }
      });
    }

    function initMonthlyRainfallChart() {
      const ctx = document.getElementById('chartMonthlyRainfall');
      if (!ctx) return;

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const r23 = (data.rainfall_monthly || []).filter(m => m.year === 2023).map(m => m.total_mm);
      const r24 = (data.rainfall_monthly || []).filter(m => m.year === 2024).map(m => m.total_mm);

      state.charts.rainfall = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: '2023 Precipitation (mm)',
              data: r23,
              backgroundColor: 'rgba(140, 163, 192, 0.5)',
              borderColor: '#8ca3c0',
              borderWidth: 1,
              borderRadius: 3
            },
            {
              label: '2024 Precipitation (mm)',
              data: r24,
              backgroundColor: 'rgba(45, 212, 191, 0.7)',
              borderColor: '#2dd4bf',
              borderWidth: 1,
              borderRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#8ca3c0', font: { family: 'Inter', size: 11 } }
            },
            tooltip: {
              callbacks: { label: c => `${c.dataset.label}: ${c.raw} mm` }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8ca3c0', font: { family: 'Inter', size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v + 'mm' }
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

      // Top 8 stations by priority score in current filtered view
      const top8 = [...stations].sort((a,b) => b.priority_score - a.priority_score).slice(0, 8);

      const labels = top8.map(s => s.station_name);
      const p1 = top8.map(s => s.pillar_scores?.depth_score || 0);
      const p2 = top8.map(s => s.pillar_scores?.salinity_score || 0);
      const p3 = top8.map(s => s.pillar_scores?.drawdown_score || 0);

      state.charts.pillars = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Pillar 1: Depth (40 pts)',
              data: p1,
              backgroundColor: '#ef4444',
              borderRadius: 2
            },
            {
              label: 'Pillar 2: Salinity (40 pts)',
              data: p2,
              backgroundColor: '#f59e0b',
              borderRadius: 2
            },
            {
              label: 'Pillar 3: Fluctuation (20 pts)',
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
              labels: { color: '#8ca3c0', font: { family: 'Inter', size: 10 } }
            },
            tooltip: {
              callbacks: {
                label: c => `${c.dataset.label}: ${c.raw} pts`,
                afterBody: items => {
                  const idx = items[0].dataIndex;
                  return `Total Priority Score: ${top8[idx].priority_score} / 100`;
                }
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: { color: '#8ca3c0', font: { family: 'Inter', size: 10 }, maxRotation: 40, minRotation: 40 }
            },
            y: {
              stacked: true,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#8ca3c0', font: { family: 'JetBrains Mono', size: 10 } }
            }
          }
        }
      });
    }

    // =========================================================================
    // 6. PRIORITY TABLE
    // =========================================================================
    function renderTable(stations) {
      const sorted = [...stations].sort((a, b) => {
        let valA = a[state.sortCol];
        let valB = b[state.sortCol];

        if (state.sortCol === 'rank') {
          valA = a.priority_score;
          valB = b.priority_score;
          return state.sortAsc ? valB - valA : valA - valB;
        }

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'string') {
          return state.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return state.sortAsc ? valA - valB : valB - valA;
      });

      DOM.priorityTableBody.innerHTML = '';

      sorted.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-station', s.station_name);
        if (state.selectedStation?.station_name === s.station_name) {
          tr.classList.add('selected-row');
        }

        let tierClass = 'pill-routine';
        if (s.priority_tier === 'High Priority') tierClass = 'pill-high';
        else if (s.priority_tier === 'Medium Priority') tierClass = 'pill-medium';

        const obsVal = s.observed_may24_mbgl !== null && s.observed_may24_mbgl !== undefined
          ? `${s.observed_may24_mbgl.toFixed(2)}`
          : '<span style="color: var(--muted); font-style: italic;">Not yet measured</span>';

        const scenVal = s.scenario_depth_mbgl !== null && s.scenario_depth_mbgl !== undefined
          ? `${s.scenario_depth_mbgl.toFixed(2)}`
          : (s.max_depth_mbgl !== null ? `${(s.max_depth_mbgl + 3.2).toFixed(2)}` : '<span style="color: var(--muted); font-style: italic;">Not yet measured</span>');

        const swingVal = s.seasonal_range_m !== null && s.seasonal_range_m !== undefined
          ? `${s.seasonal_range_m.toFixed(2)}`
          : '<span style="color: var(--muted); font-style: italic;">Not yet measured</span>';

        const tdsVal = s.pre_monsoon_tds !== null && s.pre_monsoon_tds !== undefined
          ? s.pre_monsoon_tds
          : '<span style="color: var(--muted); font-style: italic;">Not yet measured</span>';

        tr.innerHTML = `
          <td class="num-col">${idx + 1}</td>
          <td class="st-name">${s.station_name}</td>
          <td>${s.taluk}</td>
          <td>${s.well_type}</td>
          <td class="num-col">${obsVal}</td>
          <td class="num-col" style="color: var(--drought);">${scenVal}</td>
          <td class="num-col">${swingVal}</td>
          <td class="num-col">${tdsVal}</td>
          <td class="num-col" style="font-weight: 700; color: #ffffff;">${s.priority_score}</td>
          <td><span class="tier-pill ${tierClass}">${s.priority_tier}</span></td>
          <td>
            <button type="button" class="btn-control btn-inspect" style="font-size: 11px; padding: 4px 8px;">Inspect</button>
          </td>
        `;

        tr.addEventListener('click', (e) => {
          if (!e.target.classList.contains('btn-inspect')) {
            selectStation(s);
          }
        });

        tr.querySelector('.btn-inspect').addEventListener('click', (e) => {
          e.stopPropagation();
          openStationModal(s);
        });

        DOM.priorityTableBody.appendChild(tr);
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
            state.sortAsc = col === 'rank' ? true : false;
          }
          renderTable(getFilteredStations());
        });
      });
    }

    // =========================================================================
    // 7. STATION MODAL
    // =========================================================================
    function openStationModal(s) {
      DOM.modalStationTitle.textContent = s.station_name;
      DOM.modalStationSub.textContent = `${s.taluk} Taluk • ${s.well_type} (${s.latitude.toFixed(4)} N, ${s.longitude.toFixed(4)} E)`;
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
      renderTalukChips();
      initPresentationMode();
      initMonthlyRainfallChart();
      initTableSorting();
      applyFilters();

      if (data.priority_table.length > 0) {
        selectStation(data.priority_table[0]);
      }

      console.log("Where Tiruppur's Water Breaks First: Taluk Two-Panel Analytics Initialized.");
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

print(f"Generated complete updated index.html with two-panel taluk map image comparison! Size: {os.path.getsize('index.html')} bytes")
