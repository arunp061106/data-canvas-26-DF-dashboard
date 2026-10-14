import streamlit as st
import json
import os
import pandas as pd

# Page Configuration
st.set_page_config(
    page_title="A Catastrophe behind Colours — Tiruppur Groundwater Stress",
    page_icon="💧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.3rem;
        font-weight: 800;
        background: linear-gradient(135deg, #f43f5e 0%, #ec4899 30%, #8b5cf6 70%, #06b6d4 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #94a3b8;
        margin-bottom: 1.5rem;
    }
    .badge-sdg {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-right: 0.5rem;
    }
    .badge-sdg-6 { background-color: rgba(6, 182, 212, 0.15); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); }
    .badge-sdg-3 { background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .card-box {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 1.2rem;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Helper: Load Data
@st.cache_data
def load_all_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    
    with open(os.path.join(data_dir, "tiruppur_water_levels_gwyb.json"), "r", encoding="utf-8") as f:
        water_levels = json.load(f)
    with open(os.path.join(data_dir, "tiruppur_water_quality_2024.json"), "r", encoding="utf-8") as f:
        water_quality = json.load(f)
    with open(os.path.join(data_dir, "india_wris_nachipalayam_telemetry.json"), "r", encoding="utf-8") as f:
        nachipalayam_telemetry = json.load(f)
    with open(os.path.join(data_dir, "tiruppur_rainfall_daily.json"), "r", encoding="utf-8") as f:
        rainfall_daily = json.load(f)
    with open(os.path.join(data_dir, "tiruppur_rainfall_monthly.json"), "r", encoding="utf-8") as f:
        rainfall_monthly = json.load(f)
    with open(os.path.join(data_dir, "enso_roni_series.json"), "r", encoding="utf-8") as f:
        enso_roni = json.load(f)
    with open(os.path.join(data_dir, "tiruppur_priority_table.json"), "r", encoding="utf-8") as f:
        priority_table = json.load(f)
    with open(os.path.join(data_dir, "provenance_metadata.json"), "r", encoding="utf-8") as f:
        provenance = json.load(f)

    return {
        "water_levels": pd.DataFrame(water_levels),
        "water_quality": pd.DataFrame(water_quality),
        "nachipalayam_telemetry": pd.DataFrame(nachipalayam_telemetry),
        "rainfall_daily": pd.DataFrame(rainfall_daily),
        "rainfall_monthly": pd.DataFrame(rainfall_monthly),
        "enso_roni": pd.DataFrame(enso_roni),
        "priority_table": pd.DataFrame(priority_table),
        "provenance": provenance
    }

data = load_all_data()

# Header & Introduction
col_title, col_badges = st.columns([3, 1])
with col_title:
    st.markdown('<div class="main-title">A Catastrophe behind Colours</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Groundwater Stress, Salinity Dynamics, and Climate Teleconnections in Tiruppur and the Noyyal Basin</div>', unsafe_allow_html=True)
with col_badges:
    st.markdown('<div style="margin-top: 15px;"><span class="badge-sdg badge-sdg-6">SDG 6: Clean Water</span><span class="badge-sdg badge-sdg-3">SDG 3: Good Health</span></div>', unsafe_allow_html=True)

# Context Expander
with st.expander("📖 Read Project Introduction & Study-Area Context", expanded=False):
    st.markdown("""
    **The Industrial Context:** Tiruppur is recognized globally as the *Knitwear Capital of India*, contributing approximately 90% of the country's cotton knitwear exports. However, decades of intensive textile dyeing, bleaching, and chemical processing have burdened the fragile Noyyal River basin. Untreated and partially treated industrial effluents, carrying high concentrations of common salt (sodium chloride) and sodium sulphate, historically drained into the Noyyal riverbed and the Orathupalayam reservoir, infiltrating shallow aquifers.
    
    **The Underground Crisis:** Today, the borewells and open dug wells that local families, farmers, and peri-urban communities rely upon are experiencing chronic drawdowns and escalating salinity. This dashboard synthesizes verified groundwater monitoring records from the Central Ground Water Board (CGWB), high-frequency automated GPRS telemetry from India-WRIS, and gridded meteorological series from NASA POWER.
    
    **Measurement Clarification:** Groundwater levels in this application are strictly reported as **Depth to Water Level in meters below ground level (m bgl)**. A higher number denotes a deeper, more depleted water table.
    """)

# KPI Ribbon
kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
kpi1.metric("Monitored Stations", f"{len(data['water_levels'])} Records", "87 in 23-24, 9 Core in 24-25")
kpi2.metric("Deepest Water Table", "84.7 m bgl", "Pallapalayam Pz (Deep Aquifer)")
kpi3.metric("Max Salinity (TDS)", "2,789 mg/L", "Arugampalayam (Limit: 2,000 mg/L)")
kpi4.metric("2023 vs 2024 Rain", "582 vs 813 mm", "Deficit during 2023 El Niño")
kpi5.metric("Urgent Action Wells", "10 Stations", "Priority Score ≥ 60/100")

st.divider()

# Sidebar Filters
st.sidebar.header("🔍 Filter Observations")
taluk_list = ["All Taluks"] + sorted([t for t in data["priority_table"]["taluk"].dropna().unique() if t != "-"])
selected_taluk = st.sidebar.selectbox("Taluk / Basin Sector", taluk_list)

well_types = ["All Infrastructure Types", "Dug Well", "Bore Well", "Piezometer"]
selected_well_type = st.sidebar.selectbox("Well Infrastructure", well_types)

priority_tiers = ["All Priority Tiers", "High Priority", "Medium Priority", "Routine Monitoring"]
selected_priority = st.sidebar.selectbox("Follow-Up Priority Tier", priority_tiers)

search_query = st.sidebar.text_input("Search Station / Location", "").lower().strip()

# Filter priority table
filtered_priority = data["priority_table"].copy()
if selected_taluk != "All Taluks":
    filtered_priority = filtered_priority[filtered_priority["taluk"] == selected_taluk]
if selected_well_type != "All Infrastructure Types":
    filtered_priority = filtered_priority[filtered_priority["well_type"].str.contains(selected_well_type, case=False, na=False)]
if selected_priority != "All Priority Tiers":
    filtered_priority = filtered_priority[filtered_priority["priority_tier"] == selected_priority]
if search_query:
    filtered_priority = filtered_priority[
        filtered_priority["station_name"].str.lower().str.contains(search_query) |
        filtered_priority["taluk"].str.lower().str.contains(search_query)
    ]

# Navigation Tabs
tab_overview, tab_depletion, tab_quality, tab_climate, tab_priority, tab_provenance = st.tabs([
    "🗺️ Spatial GIS Map",
    "📉 Groundwater Depletion",
    "🧪 Salinity & Quality (2024)",
    "🌧️ Rainfall & ENSO Context",
    "🎯 Priority Testing Matrix",
    "📑 Provenance & Limitations"
])

# -------------------------------------------------------------
# TAB 1: Spatial GIS Map
# -------------------------------------------------------------
with tab_overview:
    st.subheader("Spatial Distribution of Monitored Wells & Priority Tiers")
    st.markdown("""
    Explore monitored borewells and dug wells across the Tiruppur municipal cluster and Noyyal sub-basin.
    Points are positioned by exact surveyed GPS coordinates from CGWB publications.
    """)
    
    map_df = filtered_priority[["latitude", "longitude", "station_name", "taluk", "priority_tier", "priority_score", "max_depth_mbgl"]].dropna(subset=["latitude", "longitude"]).copy()
    map_df.rename(columns={"latitude": "lat", "longitude": "lon"}, inplace=True)
    st.map(map_df, zoom=10, use_container_width=True)
    
    st.info("""
    **Note on Municipal Wards:** The official Tiruppur City Municipal Corporation budget document (2022-23) provides a static cartographic layout of the 60 municipal wards and 4 administrative zones. In strict adherence to scientific data integrity, well locations are mapped using verified GPS coordinates rather than artificial or unverified polygon boundary joins.
    """)

# -------------------------------------------------------------
# TAB 2: Groundwater Depletion & Telemetry
# -------------------------------------------------------------
with tab_depletion:
    st.subheader("Groundwater Levels, Depletion Depth & Continuous Telemetry")
    
    col_d1, col_d2 = st.columns(2)
    with col_d1:
        st.markdown("**Top 12 Deepest / Most Concerning Wells** (m bgl)")
        deepest = data["priority_table"].dropna(subset=["max_depth_mbgl"]).sort_values("max_depth_mbgl", ascending=False).head(12)
        chart_deep = deepest.set_index("station_name")["max_depth_mbgl"]
        st.bar_chart(chart_deep, color="#f43f5e")
        st.caption("Deep piezometers (Pallapalayam Pz, Govindhapuram) experience acute drawdown reaching 50 to 84.7 m bgl.")
        
    with col_d2:
        st.markdown("**Seasonal Dynamics: 2024-25 Core Urban Dug Wells** (m bgl)")
        core_24 = data["water_levels"][data["water_levels"]["period"] == "2024-2025"]
        if not core_24.empty:
            core_melt = core_24[["station_name", "may_val", "aug_val", "nov_val", "jan_val"]].set_index("station_name")
            core_melt.columns = ["May-24 (Pre)", "Aug-24 (SW)", "Nov-24 (Post)", "Jan-25 (Winter)"]
            st.bar_chart(core_melt)
            st.caption("Tiruppur Agraharam reached 11.14 m bgl in summer pre-monsoon before recovering to 5.45 m bgl post-monsoon.")

    st.markdown("---")
    st.markdown("### India-WRIS Automated Continuous GPRS Telemetry: Nachipalayam Piezometer (2025)")
    st.markdown("497 automated daily observations for station **Nachipalayam1_1 (Code: TIRU255)** demonstrating high-frequency aquifer behavior.")
    
    telemetry_df = data["nachipalayam_telemetry"].copy()
    if not telemetry_df.empty:
        telemetry_df["date"] = pd.to_datetime(telemetry_df["date"])
        chart_telemetry = telemetry_df.set_index("date")["depth_mbgl"]
        st.line_chart(chart_telemetry, color="#06b6d4")
        st.caption("Automated sensor logs capture dry-season drawdowns and rapid monsoon recharge spikes across the 108m piezometer.")

# -------------------------------------------------------------
# TAB 3: Salinity & Quality (2024)
# -------------------------------------------------------------
with tab_quality:
    st.subheader("2024 Chemical Water Quality Snapshot (EC & TDS Salinity)")
    st.markdown("""
    Extracted from *CGWB Ground Water Quality in Shallow Aquifers of India (2024)*. Total Dissolved Solids (TDS in mg/L) and Electrical Conductivity (EC in µS/cm) benchmarked against **BIS 10500:2012 Drinking Water Standards** (Desirable Limit: 500 mg/L; Permissible Limit in absence of alternate source: 2,000 mg/L).
    """)
    
    col_q1, col_q2 = st.columns(2)
    with col_q1:
        st.markdown("**Pre-Monsoon vs Post-Monsoon TDS Comparison (2024)**")
        q_df = data["water_quality"]
        pre_q = q_df[q_df["season"].str.contains("Pre-Monsoon")].set_index("station_name")["TDS_mg_L"]
        post_q = q_df[q_df["season"].str.contains("Post-Monsoon")].set_index("station_name")["TDS_mg_L"]
        tds_comp = pd.DataFrame({"Pre-Monsoon (May 2024)": pre_q, "Post-Monsoon (Nov 2024)": post_q}).dropna(how="all")
        st.bar_chart(tds_comp)
        st.caption("Arugampalayam (2,789 mg/L) critically exceeds the BIS permissible ceiling of 2,000 mg/L. Nachipalayam rose from 1,398 to 1,709 mg/L.")

    with col_q2:
        st.markdown("**Electrical Conductivity Profile (EC in µS/cm at 25°C)**")
        pre_ec = q_df[q_df["season"].str.contains("Pre-Monsoon")].set_index("station_name")["EC_uS_cm"]
        post_ec = q_df[q_df["season"].str.contains("Post-Monsoon")].set_index("station_name")["EC_uS_cm"]
        ec_comp = pd.DataFrame({"Pre-Monsoon EC": pre_ec, "Post-Monsoon EC": post_ec}).dropna(how="all")
        st.bar_chart(ec_comp)
        st.caption("Arugampalayam EC reaches 4,290 µS/cm; Nachipalayam climbed to 2,860 µS/cm, showing substantial dissolved ionic loading.")

    st.markdown("### Verified Chemical Parameter Sample Registry (13 Lab Samples)")
    st.dataframe(data["water_quality"][["station_name", "season", "pH", "EC_uS_cm", "TDS_mg_L", "Total_Hardness_mg_L", "Cl_mg_L", "SO4_mg_L", "NO3_mg_L", "F_mg_L", "source_page"]], use_container_width=True)

    st.warning("""
    **Scientific Evidence Boundary:** Claims of a multi-year 'rising TDS trend' require matching samples from identical wells across consecutive years. Because Tiruppur district stations were omitted in the published 2023 national quality publication, the 2024 data is rigorously documented as a **verified seasonal snapshot** rather than an unverified multi-year statistical trajectory.
    """)

# -------------------------------------------------------------
# TAB 4: Rainfall & ENSO Context
# -------------------------------------------------------------
with tab_climate:
    st.subheader("Rainfall Time Series & Global ENSO (RONI) Teleconnections")
    st.markdown("Precipitation series derived from NASA POWER (MERRA-2) satellite-reanalysis for Tiruppur centroid (11.1085°N, 77.3411°E).")

    col_c1, col_c2 = st.columns(2)
    with col_c1:
        st.markdown("**Monthly Rainfall Comparison: 2023 vs 2024**")
        m_rain = data["rainfall_monthly"].copy()
        m_rain["year"] = m_rain["month"].str.slice(0, 4)
        m_rain["mon"] = m_rain["month"].str.slice(5, 7)
        rain_piv = m_rain.pivot(index="mon", columns="year", values="total_mm").fillna(0)
        rain_piv.columns = ["2023 (Annual: 582 mm)", "2024 (Annual: 813 mm)"]
        st.bar_chart(rain_piv)
        st.caption("2023 saw subdued Southwest and Northeast monsoons, leading to reduced natural recharge.")

    with col_c2:
        st.markdown("**NOAA Relative Oceanic Niño Index (RONI) 2020–2026**")
        roni_df = data["enso_roni"].copy()
        roni_filt = roni_df[(roni_df["year"] >= 2021) & (roni_df["year"] <= 2025)]
        st.line_chart(roni_filt.set_index("label")["anomaly"], color="#8b5cf6")
        st.caption("2023 coincided with rapid Pacific warming (+1.8°C to +2.0°C anomaly), which dissipated toward neutral conditions in late 2024.")

    st.markdown("### 2-Year Daily Rainfall Hyetograph (731 Days: 2023–2024)")
    daily_df = data["rainfall_daily"].copy()
    daily_df["date"] = pd.to_datetime(daily_df["date"])
    st.bar_chart(daily_df.set_index("date")["precip_mm"], color="#06b6d4")
    st.caption("Extended dry intervals between January and April 2023 correlate with peak aquifer drawdown.")

# -------------------------------------------------------------
# TAB 5: Priority Testing Matrix
# -------------------------------------------------------------
with tab_priority:
    st.subheader("Transparent Priority Testing & Remediation Matrix")
    st.markdown("""
    Evidence-based prioritization ranking (0–100 points) combining:
    1. **Water Table Stress (40%)**: Depths > 20m bgl (40 pts) down to < 5m bgl (10 pts).
    2. **Salinity / TDS Stress (40%)**: TDS > 2,000 mg/L (40 pts), 1,200–2,000 mg/L (30 pts), or data gaps (10–12 pts).
    3. **Fluctuation Vulnerability (20%)**: Seasonal drawdowns > 5m (20 pts), 2–5m (12 pts).
    """)

    st.dataframe(
        filtered_priority[[
            "priority_score", "priority_tier", "station_name", "taluk", "well_type",
            "max_depth_mbgl", "seasonal_range_m", "post_monsoon_tds", "evidence_rationale"
        ]].rename(columns={
            "priority_score": "Score",
            "priority_tier": "Priority Tier",
            "station_name": "Station",
            "taluk": "Taluk",
            "well_type": "Well Type",
            "max_depth_mbgl": "Max Depth (m)",
            "seasonal_range_m": "Fluctuation (m)",
            "post_monsoon_tds": "Post TDS (mg/L)",
            "evidence_rationale": "Evidence & Rationale"
        }),
        use_container_width=True
    )

    csv_data = filtered_priority.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Priority Matrix (CSV)",
        data=csv_data,
        file_name="tiruppur_groundwater_priority_matrix.csv",
        mime="text/csv"
    )

# -------------------------------------------------------------
# TAB 6: Provenance & Limitations
# -------------------------------------------------------------
with tab_provenance:
    st.subheader("Data Provenance & Agency Documentation")
    prov_meta = data["provenance"]
    st.markdown(f"**Project Title:** {prov_meta.get('project_title')}")
    st.markdown(f"**Generated / Audited:** {prov_meta.get('generated_at')}")
    
    st.markdown("### Audited Source Files")
    sources_df = pd.DataFrame(prov_meta.get("sources", []))
    st.dataframe(sources_df[["filename", "agency", "period", "provenance_note"]], use_container_width=True)

    st.markdown("### Key Scientific Guardrails Adhered To")
    st.markdown("""
    - **No invented observations:** Data values are derived strictly from official CGWB Yearbooks, Quality Reports, and NWIC/NASA APIs.
    - **Distinction of Water Level vs Depth to Water:** Depth to water level is consistently presented in meters below ground level (m bgl).
    - **No invalid multi-year quality claims:** The 2024 chemical analysis is treated as a seasonal snapshot because Tiruppur was not published in the 2023 CGWB national quality sample tables.
    - **Gridded precipitation vs observed gauge:** NASA POWER MERRA-2 daily estimates are identified as single-coordinate gridded values.
    - **Global ENSO context vs causation:** NOAA RONI index provides macro-climatic context, not direct local drought proof.
    - **Static Ward Map integrity:** Official corporation budget static map informs sector analysis without unverified polygon vector joining.
    """)

st.caption("A Catastrophe behind Colours © 2026. Advancing UN Sustainable Development Goals 6 & 3.")
