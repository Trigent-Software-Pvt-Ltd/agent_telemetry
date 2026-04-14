"""Capture screenshots of all app routes for documentation."""
import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3099"
OUT_DIR = os.path.join(os.path.dirname(__file__), "app_documentation", "screenshots")
os.makedirs(OUT_DIR, exist_ok=True)

# All routes with descriptive filenames
ROUTES = [
    # Phase 1 — Core Demo
    ("/dashboard", "01_dashboard"),
    ("/dashboard/roi", "02_roi_calculator"),
    ("/process/proc-sports-betting", "03_symmetry_dashboard_sports"),
    ("/process/proc-sports-betting/labor", "04_labor_graph_sports"),
    ("/process/proc-sports-betting/sigma", "05_sigma_scorecard_sports"),
    ("/agents/agent-odds-scraper", "06_agent_telemetry_odds_scraper"),
    ("/agents/agent-line-comparison", "06b_agent_telemetry_line_comparison"),
    ("/agents/agent-recommendation-writer", "06c_agent_telemetry_recommendation_writer"),
    ("/governance/audit", "07_audit_log"),
    ("/settings", "08_settings"),
    ("/login", "09_login"),
    # Phase 2 — Complete Platform
    ("/setup/occupation", "10_occupation_selector"),
    ("/setup/mapping", "11_agent_task_mapper"),
    ("/dashboard/export", "12_board_export"),
    ("/process/proc-sports-betting/coverage", "13_coverage_map"),
    ("/process/proc-sports-betting/roadmap", "14_transformation_roadmap"),
    ("/governance/fmea", "15_fmea_risk_board"),
    # Phase 3 — Operational Maturity
    ("/agents/agent-odds-scraper/manage", "16_agent_manage"),
    ("/agents/compare", "17_agent_compare"),
    ("/dashboard/costs", "18_cost_trend"),
    ("/dashboard/benchmark", "19_cross_process_benchmark"),
    ("/settings/alerts", "20_sla_alerts"),
    ("/governance/oversight", "21_oversight_gap"),
    ("/process/proc-sports-betting/training", "22_training_plan"),
    # Phase 4 — Enterprise
    ("/agents/agent-odds-scraper/staging", "23_agent_staging"),
    ("/monitoring", "24_live_monitoring"),
    ("/settings/budgets", "25_budgets"),
    ("/settings/notifications", "26_notifications"),
    ("/process/proc-sports-betting/workforce", "27_workforce_planning"),
    ("/governance/rules", "28_governance_rules"),
    # Phase 5 — Platform & Integration
    ("/settings/integrations", "29_integrations"),
    ("/dashboard/benchmarks", "30_industry_benchmarks"),
    ("/settings/branding", "31_branding"),
    ("/admin/organisations", "32_organisations"),
    ("/analytics/correlations", "33_correlations"),
    # Phase 2 extra — Customer Service process
    ("/process/proc-customer-service", "34_symmetry_customer_service"),
    ("/agents/agent-customer-response", "35_agent_customer_response"),
    # Insights pages (Phase 7-8)
    ("/insights/scenarios", "36_what_if_scenarios"),
    ("/insights/maturity", "37_ai_maturity"),
]

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,  # Retina quality
        )
        page = context.new_page()

        captured = []
        for route, filename in ROUTES:
            url = f"{BASE_URL}{route}"
            print(f"Capturing {route} -> {filename}.png")
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
                page.wait_for_timeout(1500)  # Let animations settle

                # Full page screenshot
                filepath = os.path.join(OUT_DIR, f"{filename}.png")
                page.screenshot(path=filepath, full_page=True)
                captured.append((route, filename))
                print(f"  OK: {filepath}")

                # Also capture viewport-only version for the doc
                viewport_path = os.path.join(OUT_DIR, f"{filename}_viewport.png")
                page.screenshot(path=viewport_path, full_page=False)
            except Exception as e:
                print(f"  ERR: {e}")

        # Scroll-captures for long pages (dashboard, monitoring)
        for route, filename in [("/dashboard", "01_dashboard"), ("/monitoring", "24_live_monitoring")]:
            url = f"{BASE_URL}{route}"
            print(f"Capturing scrolled view: {route}")
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
                page.wait_for_timeout(1500)
                # Scroll down and capture
                page.evaluate("window.scrollTo(0, 600)")
                page.wait_for_timeout(500)
                filepath = os.path.join(OUT_DIR, f"{filename}_scrolled.png")
                page.screenshot(path=filepath, full_page=False)
                print(f"  OK: scrolled view")
            except Exception as e:
                print(f"  ERR: {e}")

        browser.close()
        print(f"\nDone! Captured {len(captured)} screenshots.")

if __name__ == "__main__":
    main()
