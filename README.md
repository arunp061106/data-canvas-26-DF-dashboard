# A Catastrophe behind Colours
### Groundwater Stress, Salinity Dynamics, and Climate Teleconnections in Tiruppur and the Noyyal River Basin

![Primary SDG: Clean Water and Sanitation](https://img.shields.io/badge/SDG%206-Clean%20Water%20%26%20Sanitation-06B6D4?style=for-the-badge)
![Secondary SDG: Good Health and Well-Being](https://img.shields.io/badge/SDG%203-Good%20Health%20%26%20Well--Being-10B981?style=for-the-badge)
![Data Source: CGWB & India-WRIS](https://img.shields.io/badge/Ground%20Truth-CGWB%20%7C%20NWIC%20%7C%20NASA-6366F1?style=for-the-badge)
![Deployment: GitHub Pages & Streamlit](https://img.shields.io/badge/Deployment-GitHub%20Pages%20%7C%20Streamlit-F43F5E?style=for-the-badge)

---

## 1. Project Background & Study Area Context

Tiruppur, situated along the Noyyal River in western Tamil Nadu, is globally celebrated as the **"Knitwear Capital of India"** and the engine of a multi-billion-dollar textile export economy. 

However, behind these vibrant fabrics lies an underground catastrophe:
- **Decades of Industrial Leaching:** Decades of intensive bleaching, dyeing, and chemical finishing operations historically discharged high volumes of saline effluent rich in sodium chloride, sodium sulphate, and dyes into the Noyyal riverbed and the Orathupalayam dam, infiltrating the shallow unconfined aquifers.
- **Aquifer Drawdown & Salinization:** Agricultural and peri-urban borewells relied upon by local families are experiencing continuous drawdown into deep fissured crystalline rock while becoming increasingly mineralized and brackish.
- **Climate Teleconnections:** The onset of the strong 2023–2024 El Niño episode coincided with suppressed monsoon precipitation, exacerbating seasonal water scarcity.

This project delivers a **transparent, evidence-based analytics platform** designed to separate seasonal fluctuations from chronic systemic stress, pinpointing the exact borewells and locations that require immediate follow-up testing and remediation before aquifer damage becomes irreversible.

---

## 2. Choosing a Deployment Approach

In compliance with the project guidelines, two deployment options are fully implemented in this repository:

| Feature / Criteria | **Option A: Static Web Application (GitHub Pages)** *(Recommended)* | **Option B: Streamlit Python Application** |
| :--- | :--- | :--- |
| **Hosting Platform** | **GitHub Pages** (or any static hosting: Vercel, Netlify, Cloudflare Pages) | **Streamlit Community Cloud** or local Python server |
| **Runtime Dependencies** | **Zero backend server required.** Pure HTML5, CSS3, Vanilla JS, Leaflet GIS, Chart.js. | Requires Python 3.10+, `streamlit`, `pandas`, `altair`, and server resources. |
| **Performance & Cold-Start** | **Instantaneous loading** (< 100ms); no server sleep, cold-starts, or container spin-up delays. | Subject to cloud container spin-up and memory limits. |
| **Data Delivery** | Pre-bundled, audited JSON datasets (`data/app_data.js`) allowing **offline and CORS-free operation**. | Data loaded via Pandas into server memory. |
| **Design Flexibility** | Full glassmorphism, responsive container queries, dynamic theme toggling, and accessible modal dialogs. | Standard Streamlit widgets and layout containers. |

> **Recommendation:** **GitHub Pages (Option A)** is recommended for production public dissemination because all PDF extraction and data cleaning are completed in advance. The web app operates with 100% reliability, zero hosting cost, and no runtime server failure points. For users who prefer a Python runtime, **Streamlit (Option B)** is concurrently provided via `streamlit_app.py`.

---

## 3. Repository Structure

```text
├── index.html                           # Main web dashboard interface (GitHub Pages ready)
├── style.css                            # Modern glassmorphic stylesheet (Dark/Light themes)
├── app.js                               # Interactive dashboard controller, Leaflet GIS & Chart.js logic
├── streamlit_app.py                     # Companion Python Streamlit application
├── requirements.txt                     # Python dependencies for data pipeline and Streamlit
├── build_clean_data.py                  # Python extraction & harmonization pipeline from raw sources
├── build_data_bundle.py                 # Bundles clean datasets into data/app_data.js
├── README.md                            # Comprehensive project documentation
│
├── data/                                # Clean, standardized datasets (JSON & CSV)
│   ├── app_data.js                      # Preloaded JavaScript bundle (CORS-free offline execution)
│   ├── tiruppur_water_levels_gwyb.json  # 96 seasonal depth-to-water records (GWYB 2023-25)
│   ├── tiruppur_water_levels_gwyb.csv   # Tabular CSV export of water levels
│   ├── tiruppur_water_quality_2024.json # 13 chemical quality sample records (Pre & Post-Monsoon 2024)
│   ├── tiruppur_water_quality_2024.csv  # Tabular CSV export of chemical quality
│   ├── india_wris_nachipalayam_telemetry.json # 497 daily automated GPRS telemetry readings (2025)
│   ├── tiruppur_rainfall_daily.json     # 731 daily precipitation records (NASA POWER 2023-2024)
│   ├── tiruppur_rainfall_monthly.json   # 24 monthly aggregations with monsoon seasonal tagging
│   ├── enso_roni_series.json            # NOAA CPC Relative Oceanic Niño Index (RONI) 2020-2026
│   ├── tiruppur_priority_table.json     # 32 prioritized stations ranked by 3-pillar composite formula
│   ├── tiruppur_priority_table.csv      # Downloadable priority matrix
│   └── provenance_metadata.json         # Complete machine-readable data dictionary & citations
│
└── [Raw Downloaded Source Files Kept Unchanged]
    ├── CGWB_TN_GWYB_2023-24.pdf
    ├── CGWB_TN_GWYB_2024-25.pdf
    ├── CGWB_Groundwater_Quality_2024.pdf
    ├── CGWB_Groundwater_Quality_2023.pdf
    ├── Station Ground Water Level Information.xlsx
    ├── ground water swagger ui json.txt
    ├── Tiruppur_Point_Rainfall_2023_2024.csv
    ├── NASA_POWER_Tiruppur_Daily_Precip_2023_2024.csv
    ├── RONI.ascii.txt
    ├── Tiruppur_Corporation_Ward_Map_Source.pdf
    └── README_downloads.txt
```

---

## 4. Setup & Running Instructions

### Option A: Running the Web Application (Recommended / GitHub Pages)

#### 1. Instant Offline Run:
Simply double-click `index.html` to open it in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari). No internet connection or server required!

#### 2. Running via a Local HTTP Server:
Using Python:
```bash
python -m http.server 8080
```
Or using Node.js:
```bash
npx serve . -p 8080
```
Then open: **`http://localhost:8080`**

#### 3. Deploying to GitHub Pages:
1. Push this repository to GitHub.
2. In your repository settings, navigate to **Settings** > **Pages**.
3. Under **Build and deployment**, select **Source: Deploy from a branch**.
4. Set the branch to `main` (or `master`) and folder to `/ (root)`.
5. Click **Save**. Your dashboard will be live at `https://<username>.github.io/<repo-name>/` in under 60 seconds!

---

### Option B: Running the Streamlit Application

#### 1. Install dependencies:
```bash
pip install -r requirements.txt
```

#### 2. Launch Streamlit:
```bash
streamlit run streamlit_app.py
```
The application will open automatically in your browser at `http://localhost:8501`.

---

## 5. Re-running the Data Extraction Pipeline

To re-extract or re-verify all data from raw PDFs and API text files:
```bash
# Extract and harmonize all raw sources into clean data/ files
python build_clean_data.py

# Package clean data into app_data.js for CORS-free client execution
python build_data_bundle.py
```

---

## 6. Official Data Provenance & Source Registry

| File Name | Agency / Custodian | Title / Dataset | Period Covered | Extracted Data & Provenance |
| :--- | :--- | :--- | :--- | :--- |
| **`CGWB_TN_GWYB_2024-25.pdf`** | Central Ground Water Board (CGWB SECR, Chennai) | *Groundwater Yearbook of Tamil Nadu & UT of Puducherry (2024-25)* | May 2024, Aug 2024, Nov 2024, Jan 2025 | Page 112: 9 core dug well monitoring stations across Tiruppur urban agglomeration with 4 seasonal water depth records. |
| **`CGWB_TN_GWYB_2023-24.pdf`** | Central Ground Water Board (CGWB SECR, Chennai) | *Groundwater Yearbook of Tamil Nadu & UT of Puducherry (2023-24)* | May 2023, Aug 2023, Nov 2023, Jan 2024 | Pages 122–124: 87 monitoring wells spanning all 14 taluks of Tiruppur district with seasonal water levels. |
| **`CGWB_Groundwater_Quality_2024.pdf`** | Central Ground Water Board (CGWB, Ministry of Jal Shakti) | *Ground Water Quality in Shallow Aquifers of India (2024)* | Pre-Monsoon (May 2024) & Post-Monsoon (Nov 2024) | Pages 57, 59, 142, 145: 13 samples measuring pH, EC (&mu;S/cm), TDS (mg/L), Hardness, and major ions (Cl, SO4, NO3, F, Na, K, Ca, Mg). |
| **`CGWB_Groundwater_Quality_2023.pdf`** | Central Ground Water Board (CGWB) | *Ground Water Quality in Shallow Aquifers of India (2023)* | 2023 Pre-Monsoon | Audited & verified: Tiruppur district stations were omitted from published 2023 national quality tables (only neighbouring Erode was sampled). |
| **`ground water swagger ui json.txt`** | India-WRIS / National Water Informatics Centre (NWIC) | *Automated Groundwater Telemetry API* | 2025 automated readings | 500 records: 497 daily automated GPRS telemetry observations for Nachipalayam1_1 piezometer (TIRU255) and manual stations. |
| **`Tiruppur_Point_Rainfall_2023_2024.csv`** | NASA POWER Project (MERRA-2) | *Daily Corrected Precipitation (PRECTOTCORR)* | 2023-01-01 to 2024-12-31 | 731 daily point estimates for the Tiruppur city centroid (11.1085&deg;N, 77.3411&deg;E). |
| **`RONI.ascii.txt`** | NOAA Climate Prediction Center (CPC) | *Relative Oceanic Niño Index (RONI)* | 1950 to 2026 | Quarterly 3-month running SST anomalies for the equatorial Pacific Niño 3.4 region. |
| **`Tiruppur_Corporation_Ward_Map_Source.pdf`** | Tiruppur City Municipal Corporation | *Corporation Budget 2022-23* | 2022–2023 | Static raster layout of the 60 wards and 4 zones; utilized as descriptive geographic reference without unverified polygon vector joining. |

---

## 7. Key Findings & Analytical Insights

1. **Severe Drawdown Hotspots:**
   - Deep crystalline aquifer piezometers exhibit extreme water table depletion: **Pallapalayam Pz** in Udumalaipettai reached **84.7 m bgl**, followed by **Govindhapuram Pz** and **Ponnapuram Pz** at **> 50 m bgl**, and **Ganapathipalayam** at **23.2 m bgl**.
   - Within the urban agglomeration, **Tiruppur Agraharam** dug well experiences substantial summer drawdowns down to **11.14 m bgl**, rebounding after the Northeast Monsoon to 5.45 m bgl.
2. **Acute Salinization in Downstream Textile Corridors:**
   - **Arugampalayam (Uthukuli Taluk):** Recorded a critical TDS of **2,789 mg/L** and EC of **4,290 &mu;S/cm**, significantly exceeding the BIS 10500 permissible drinking limit of 2,000 mg/L, accompanied by high chloride concentrations (923 mg/L).
   - **Nachipalayam:** Showed an alarming post-monsoon ionic concentration increase, with TDS rising from **1,398 mg/L** in pre-monsoon to **1,709 mg/L** in post-monsoon (EC climbing from 2,150 to 2,860 &mu;S/cm), indicating post-rain flushing and leaching of accumulated surface salts into shallow aquifers.
3. **Climate Context & Teleconnections:**
   - 2023 experienced an annual rainfall total of only **582.4 mm** at Tiruppur, corresponding with the onset of the strong 2023–24 El Niño episode (+1.8&deg;C to +2.0&deg;C RONI anomaly). In contrast, 2024 received **812.6 mm**, replenishing shallow dug wells while deep piezometers remained severely drawn down.
4. **Follow-Up Prioritization:**
   - 10 monitoring stations are categorized as **High Priority (Score &ge; 60/100)** for immediate follow-up sampling, toxicological screening (dyes, heavy metals), and community drinking water interventions.

---

## 8. Strict Adherence to Scientific Evidence Guardrails

- **No Data Fabrication or Imputation:** No missing values were artificially filled or interpolated. Stations with missing seasonal readings are explicitly identified as surveillance gaps.
- **Strict Distinction of Measurement Conventions:** Groundwater levels are consistently documented as **Depth to Water Level** in meters below ground level (**m bgl**). They are not conflated with water table elevation above mean sea level (**m amsl**).
- **No Invalid Multi-Year Trend Claims:** Because the 2023 CGWB national quality publication omitted Tiruppur district, no claims of a multi-year "rising TDS trend" between 2023 and 2024 are made. The 2024 chemical analysis is presented as a **verified seasonal snapshot** (Pre vs Post-Monsoon).
- **Gridded Modelled Precipitation vs Station Gauges:** NASA POWER precipitation is explicitly labelled as a single-coordinate gridded estimate (11.1085&deg;N, 77.3411&deg;E), not an official district-wide rain gauge network total.
- **Macro Climate Context vs Causality:** NOAA RONI index provides equatorial ocean-atmospheric context and is not cited as standalone mechanical proof of localized well decline.
- **Spatial Boundary Integrity:** Monitored wells are plotted using verified GPS survey coordinates. Because the municipal budget PDF is a static document without authoritative polygon boundaries, points are not artificially attributed to municipal wards.

---

## 9. Alignment with UN Sustainable Development Goals

- **SDG 6 (Clean Water and Sanitation):** Directly addresses Target 6.1 (safe and affordable drinking water) and Target 6.3 (reducing pollution, eliminating dumping, and minimizing release of hazardous chemicals into water bodies).
- **SDG 3 (Good Health and Well-Being):** Directly addresses Target 3.9 (reducing deaths and illnesses from hazardous chemicals and air, water, and soil pollution and contamination) by identifying communities exposed to hypersaline groundwater.

---

*Authored for the Data Canvas '26 DF Event. Ground Truth Open Data Initiative.*
