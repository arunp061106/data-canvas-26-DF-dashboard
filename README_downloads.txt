A CATASTROPHE BEHIND COLOURS — DOWNLOADED DATA
Retrieved 14 October 2026. Files in this folder are the downloaded source documents or a cleaned copy of NASA POWER's response.

CORE FILES

CGWB_TN_GWYB_2023-24.pdf
Tamil Nadu and Puducherry groundwater yearbook for 2023-24. Includes the prior monitoring period and district-level groundwater summaries; inspect the Tiruppur tables for the individual well/season rows used in the dashboard.
Source: https://cgwb.gov.in/cgwbpnm/public/download/1728

CGWB_TN_GWYB_2024-25.pdf
Tamil Nadu and Puducherry groundwater yearbook for 2024-25. It says the monitoring observations span May 2024, August 2024, November 2024 and January 2025. Includes district water-level tables and station records.
Source: https://cgwb.gov.in/cgwbpnm/public/download/2023

CGWB_Groundwater_Quality_2024.pdf
CGWB's 2024 water-quality sample tables. Includes EC and TDS fields and Tiruppur district sample rows with locations/coordinates; tables include pre-monsoon and post-monsoon records. This is the strongest downloaded source for 2024 salinity indicators.
Source: https://cgwb.gov.in/sites/default/files/inline-files/CGWB_GWQ_2024.pdf

CGWB_Groundwater_Quality_2023.pdf
CGWB's listed 2023 groundwater-quality report/dataset. It downloaded successfully, but an overlapping Tiruppur sample set was not confirmed. Treat it as a candidate baseline only after checking station names and sampling season against the 2024 records.
Source: https://cgwb.gov.in/sites/default/files/inline-files/final_nhs-wq_pre_2023_compressed.pdf

Tiruppur_Point_Rainfall_2023_2024.csv
731 daily rows (2023-01-01 through 2024-12-31), columns date and precipitation_mm_day. NASA POWER corrected precipitation (MERRA-2) for the Tiruppur city coordinate 11.1085 N, 77.3411 E. This is a gridded point estimate, not an IMD gauge or district-wide observed total; use as climate context and label it clearly.
Source/API request: https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR&community=RE&longitude=77.3411&latitude=11.1085&start=20230101&end=20241231&format=CSV

NASA_POWER_Tiruppur_Daily_Precip_2023_2024.csv
Unmodified NASA POWER response, including its metadata header; use the cleaned CSV above for dashboard import.

RONI.ascii.txt
NOAA Climate Prediction Center Relative Oceanic Niño Index, seasonal three-month anomaly series through 2026. It is global Pacific ENSO context, not local Tiruppur rainfall evidence.
Source: https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt

Tiruppur_Corporation_Ward_Map_Source.pdf
Official Tiruppur Corporation 2022-23 budget PDF; contains a static ward/zone map. It is not a ward-boundary GeoJSON/shapefile, so it cannot directly support spatially joining borewell points to wards. No usable official machine-readable ward polygon file was verified during this retrieval.
Source: https://www.tnurbantree.tn.gov.in/tiruppur/wp-content/uploads/sites/145/2022/04/Budget-2022-23.pdf

LIMITS
- The two files mentioned in the referenced chat were not present in the current workspace and the referenced conversation had no file attachments, so they could not be copied here.
- The downloaded official NWIC district rainfall CSV only contained recent Tiruppur rows from August–October 2026 when checked; it was excluded from this folder because it cannot support a 2023/2024 comparison.
- A “rising TDS” chart requires matching wells sampled in both years. Do not infer trends by comparing unrelated sites or seasons. The 2024 quality report has Tiruppur records; confirm matching 2023 records before claiming a trend.
- Global RONI/ENSO phase alone does not demonstrate that Tiruppur was dry; pair it with local rainfall observations or label it as background context.
