import json

with open("data/tiruppur_water_levels_gwyb.json", "r", encoding="utf-8") as f:
    water_levels = json.load(f)

with open("data/tiruppur_water_quality_2024.json", "r", encoding="utf-8") as f:
    water_quality = json.load(f)

with open("data/india_wris_nachipalayam_telemetry.json", "r", encoding="utf-8") as f:
    nachipalayam_telemetry = json.load(f)

with open("data/tiruppur_rainfall_daily.json", "r", encoding="utf-8") as f:
    rainfall_daily = json.load(f)

with open("data/tiruppur_rainfall_monthly.json", "r", encoding="utf-8") as f:
    rainfall_monthly = json.load(f)

with open("data/enso_roni_series.json", "r", encoding="utf-8") as f:
    enso_roni = json.load(f)

with open("data/tiruppur_priority_table.json", "r", encoding="utf-8") as f:
    priority_table = json.load(f)

with open("data/provenance_metadata.json", "r", encoding="utf-8") as f:
    provenance = json.load(f)

bundle = {
    "water_levels": water_levels,
    "water_quality": water_quality,
    "nachipalayam_telemetry": nachipalayam_telemetry,
    "rainfall_daily": rainfall_daily,
    "rainfall_monthly": rainfall_monthly,
    "enso_roni": enso_roni,
    "priority_table": priority_table,
    "provenance": provenance
}

js_content = "window.DASHBOARD_DATA = " + json.dumps(bundle, indent=2) + ";\n"

with open("data/app_data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Generated data/app_data.js successfully ({len(js_content)} bytes).")
