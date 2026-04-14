"""Build comprehensive DOCX documentation for VIPPlay Agent Telemetry Platform."""
import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn

BASE = os.path.dirname(__file__)
SHOTS = os.path.join(BASE, "app_documentation", "screenshots")
OUT = os.path.join(BASE, "app_documentation")

def img(name):
    """Return path to a screenshot file, viewport version preferred for doc."""
    vp = os.path.join(SHOTS, f"{name}_viewport.png")
    full = os.path.join(SHOTS, f"{name}.png")
    return vp if os.path.exists(vp) else full

def add_screenshot(doc, name, caption="", width=Inches(6.2)):
    """Add a screenshot image with optional caption."""
    path = img(name)
    if not os.path.exists(path):
        p = doc.add_paragraph(f"[Screenshot not available: {name}]")
        p.style.font.color.rgb = RGBColor(180, 0, 0)
        return
    doc.add_picture(path, width=width)
    last_paragraph = doc.paragraphs[-1]
    last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if caption:
        cap = doc.add_paragraph(caption)
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.style.font.size = Pt(9)
        cap.style.font.italic = True

def set_cell_shading(cell, color):
    """Set cell background color."""
    shading_elm = cell._element.get_or_add_tcPr()
    shading = shading_elm.makeelement(qn('w:shd'), {
        qn('w:fill'): color,
        qn('w:val'): 'clear',
    })
    shading_elm.append(shading)

def add_styled_table(doc, headers, rows):
    """Add a styled table."""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Header row
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = h
        for p in cell.paragraphs:
            for r in p.runs:
                r.bold = True
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(255, 255, 255)
        set_cell_shading(cell, "0A1628")
    # Data rows
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            cell = table.rows[ri + 1].cells[ci]
            cell.text = str(val)
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.size = Pt(9)
            if ri % 2 == 0:
                set_cell_shading(cell, "F0F4FA")
    return table

def build():
    doc = Document()

    # ── Page setup ──
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.left_margin = Cm(2)
    section.right_margin = Cm(2)

    # ── Styles ──
    style = doc.styles['Normal']
    style.font.name = 'Calibri'
    style.font.size = Pt(10)

    for level in range(1, 4):
        hs = doc.styles[f'Heading {level}']
        hs.font.color.rgb = RGBColor(10, 22, 40)  # navy

    # ================================================================
    # COVER PAGE
    # ================================================================
    for _ in range(6):
        doc.add_paragraph("")

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("VIPPlay Agent Telemetry Platform")
    run.font.size = Pt(28)
    run.font.color.rgb = RGBColor(10, 22, 40)
    run.bold = True

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run("Complete Application Documentation")
    run.font.size = Pt(18)
    run.font.color.rgb = RGBColor(212, 175, 55)  # gold

    doc.add_paragraph("")

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = meta.add_run("Product by r-Potential / FuzeBox AI\nApril 2026")
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_paragraph("")
    desc = doc.add_paragraph()
    desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = desc.add_run(
        "A comprehensive guide covering every screen, feature, and the 100 CEO questions\n"
        "this platform is designed to answer for agentic AI workforce management."
    )
    run.font.size = Pt(11)
    run.font.italic = True

    doc.add_page_break()

    # ================================================================
    # TABLE OF CONTENTS (manual)
    # ================================================================
    doc.add_heading("Table of Contents", level=1)
    toc_items = [
        "1. Executive Summary",
        "2. Platform Overview & Architecture",
        "3. Application Flow Walkthrough",
        "   3.1 Dashboard (Home)",
        "   3.2 Process Views (Symmetry Dashboard)",
        "   3.3 Agent Telemetry & Management",
        "   3.4 Governance & Compliance",
        "   3.5 Insights & Analytics",
        "   3.6 Planning & Workforce",
        "   3.7 Configuration & Settings",
        "   3.8 Live Monitoring",
        "4. The 100 CEO Questions - Complete Reference",
        "   4.1 Agent Lifecycle Management (Q1-Q6)",
        "   4.2 ROI & Financial (Q7-Q13)",
        "   4.3 Performance & Quality (Q14-Q21)",
        "   4.4 Reporting & Communication (Q22-Q26)",
        "   4.5 Team & Workforce (Q27-Q30)",
        "   4.6 Governance & Compliance (Q31-Q35)",
        "   4.7 Multi-Org & Scaling (Q36-Q40)",
        "   4.8 Extended Questions (Q41-Q100)",
        "5. Route Map & Screen Index",
    ]
    for item in toc_items:
        p = doc.add_paragraph(item)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.space_before = Pt(0)

    doc.add_page_break()

    # ================================================================
    # 1. EXECUTIVE SUMMARY
    # ================================================================
    doc.add_heading("1. Executive Summary", level=1)
    doc.add_paragraph(
        "The VIPPlay Agent Telemetry Platform is a comprehensive monitoring and management system "
        "for AI agent workforces. It provides real-time visibility into agent performance, financial "
        "impact, quality metrics, governance compliance, and workforce planning -- everything a CEO, "
        "VP, or operations lead needs to manage AI agents like they would manage a team of people."
    )
    doc.add_paragraph(
        "The platform answers 100 critical questions that executives ask when deploying AI agents, "
        "organized across seven categories: Agent Lifecycle, ROI & Financial, Performance & Quality, "
        "Reporting, Workforce, Governance, and Scaling. Every answer is backed by a specific screen "
        "or feature, documented in this guide with supporting screenshots."
    )
    doc.add_paragraph("")
    doc.add_heading("Key Capabilities at a Glance", level=2)

    capabilities = [
        ["Capability", "What It Shows", "Key Screen"],
        ["AI Workforce Dashboard", "Narrative overview: agents, savings, attention items", "Dashboard"],
        ["Process Symmetry", "Agent vs human split per job role, quality framework", "Process Detail"],
        ["Agent Telemetry", "Per-agent metrics, cost, version history, defects", "Agent Detail"],
        ["Sigma Quality Scoring", "Six Sigma quality scores with plain-English tooltips", "Sigma Scorecard"],
        ["Financial Impact", "ROI waterfall, cost trends, budget tracking", "Financial Impact"],
        ["Risk Analysis (FMEA)", "Failure modes ranked by severity x occurrence x detection", "Risk Analysis"],
        ["Governance & Audit", "Full audit trail, override trends, compliance rules", "Audit Trail"],
        ["Live Monitoring", "Real-time NOC view of all agents, events, alerts", "Live Monitor"],
        ["Workforce Planning", "12-month headcount projections under 3 scenarios", "Workforce Planning"],
        ["What-If Scenarios", "Interactive scenario modeling for scaling decisions", "Scenarios"],
        ["Industry Benchmarks", "Compare your metrics against industry averages", "Benchmarks"],
        ["Board Reports", "One-click export for board presentations", "Board Report"],
    ]
    add_styled_table(doc, capabilities[0], capabilities[1:])

    doc.add_page_break()

    # ================================================================
    # 2. PLATFORM OVERVIEW
    # ================================================================
    doc.add_heading("2. Platform Overview & Architecture", level=1)

    doc.add_heading("Technology Stack", level=2)
    doc.add_paragraph(
        "Next.js 16.2 (App Router) with React 19 and TypeScript. "
        "Tailwind CSS 4 for styling with a custom VIP/luxury design system. "
        "Recharts for all data visualizations. Lucide React for iconography."
    )

    doc.add_heading("Design Philosophy", level=2)
    doc.add_paragraph(
        "The platform follows a narrative-first design philosophy. Rather than presenting raw data tables, "
        "every screen leads with a plain-English answer to the question the user is asking. "
        "Technical details are available via progressive disclosure -- CEOs see the story, VPs see the "
        "breakdown, engineers see the raw data."
    )
    doc.add_paragraph(
        "The platform uses four 'languages' to present information: Quality (sigma scores, error rates), "
        "Workforce (automation %, roles affected), Finance (ROI, costs, savings), and Compliance "
        "(audit status, governance rules). Users can toggle between Operations and Quality vocabulary."
    )

    doc.add_heading("Navigation Structure", level=2)
    doc.add_paragraph(
        "The sidebar is organized around the CEO's mental model, not technical data structures:"
    )
    nav_items = [
        ["Section", "Contents"],
        ["HOME", "Dashboard, Live Monitor"],
        ["MY AI AGENTS", "Processes with nested agents (Sports Betting > Odds Scraper, etc.)"],
        ["INSIGHTS", "Financial Impact, Benchmarks, Correlations, What-If Scenarios, Model Comparison, AI Maturity, Build vs Buy"],
        ["GOVERNANCE", "Audit Trail, Risk Analysis, Unreviewed Decisions, Governance Rules"],
        ["PLANNING", "Board Report, Setup Wizard (Occupation Selector, Task Mapper)"],
        ["CONFIGURE", "Settings, Alerts, Budgets, Notifications, Integrations, Branding, Organisations"],
    ]
    add_styled_table(doc, nav_items[0], nav_items[1:])

    doc.add_paragraph("")
    add_screenshot(doc, "01_dashboard", "Figure 2.1 -- Dashboard showing the sidebar navigation structure")

    doc.add_page_break()

    # ================================================================
    # 3. APPLICATION FLOW WALKTHROUGH
    # ================================================================
    doc.add_heading("3. Application Flow Walkthrough", level=1)
    doc.add_paragraph(
        "This section walks through every major area of the platform with annotated screenshots "
        "showing exactly what each screen provides and where to find answers to key questions."
    )

    # 3.1 Dashboard
    doc.add_heading("3.1 Dashboard (Home)", level=2)
    doc.add_paragraph(
        "The Dashboard is the entry point. It opens with a narrative hero banner summarizing the entire "
        "AI workforce: how many agents, how many job roles, total weekly savings after all costs. "
        "Four pill metrics show Quality (average sigma), Workforce (% automated), Finance (net savings/week), "
        "and Compliance (audit status)."
    )
    add_screenshot(doc, "01_dashboard", "Figure 3.1 -- Executive Dashboard with hero banner and attention cards")
    doc.add_paragraph("")
    doc.add_paragraph(
        "Below the hero, the Attention Required section highlights agents that need action, showing "
        "sigma scores, decline trends, and projected cost impact if not addressed. Process health cards "
        "show each job role with its agents, verdict (GREEN/AMBER/RED), and savings breakdown."
    )
    add_screenshot(doc, "01_dashboard_scrolled", "Figure 3.2 -- Dashboard scrolled: Process health cards and quick actions")

    doc.add_page_break()

    # 3.1b Financial Impact
    doc.add_heading("3.1.1 Financial Impact (ROI & Costs)", level=3)
    doc.add_paragraph(
        "The Financial Impact page (accessible via Insights > Financial Impact) combines the ROI calculator "
        "and cost trend dashboard into a single view. It shows the ROI waterfall chart breaking down "
        "gross value, agent costs, oversight costs, and net ROI per process. Cost trends show monthly "
        "spend patterns across inference, overhead, and training."
    )
    add_screenshot(doc, "02_roi_calculator", "Figure 3.3 -- Financial Impact: ROI waterfall and cost analysis")
    doc.add_paragraph("")
    add_screenshot(doc, "18_cost_trend", "Figure 3.4 -- Cost Trend Dashboard showing monthly spend breakdown")

    doc.add_page_break()

    # 3.1c Benchmarks
    doc.add_heading("3.1.2 Benchmarks", level=3)
    doc.add_paragraph(
        "The Benchmarks page shows cross-process comparison within your organization and industry-level "
        "benchmarking against averages and top-10% performers. Metrics compared include sigma scores, "
        "automation rates, ROI per agent, and governance compliance."
    )
    add_screenshot(doc, "19_cross_process_benchmark", "Figure 3.5 -- Cross-process benchmark comparison")
    doc.add_paragraph("")
    add_screenshot(doc, "30_industry_benchmarks", "Figure 3.6 -- Industry benchmark comparison")

    doc.add_page_break()

    # 3.1d Correlations
    doc.add_heading("3.1.3 Correlations Engine", level=3)
    doc.add_paragraph(
        "The Correlations page uses scatter plots to reveal relationships between metrics. "
        "For example: does higher agent cost correlate with better quality? Does override frequency "
        "correlate with agent sigma score? These insights help identify where investment has the most impact."
    )
    add_screenshot(doc, "33_correlations", "Figure 3.7 -- Correlation engine with scatter plots")

    doc.add_page_break()

    # 3.2 Process Views
    doc.add_heading("3.2 Process Views (Symmetry Dashboard)", level=2)
    doc.add_paragraph(
        "Each process (job role) has a dedicated Symmetry Dashboard showing the agent/human work split. "
        "The left column shows agents handling their tasks, the right shows human tasks, and the center "
        "shows the combined quality equation (OEE or SERVQUAL framework, togglable). Sub-pages provide "
        "deeper views into labor, quality, coverage, roadmap, training, and workforce planning."
    )

    doc.add_heading("3.2.1 Symmetry Dashboard", level=3)
    add_screenshot(doc, "03_symmetry_dashboard_sports", "Figure 3.8 -- Symmetry Dashboard for Sports Betting Analyst")
    doc.add_paragraph("")
    add_screenshot(doc, "34_symmetry_customer_service", "Figure 3.9 -- Symmetry Dashboard for Customer Service Representative")

    doc.add_page_break()

    doc.add_heading("3.2.2 Task Ownership (Coverage Map)", level=3)
    doc.add_paragraph(
        "The Task Ownership page shows which O*NET tasks are handled by agents vs humans. "
        "Each task card shows the automation status, the assigned agent (if any), and quality metrics. "
        "This answers: 'What exactly are my agents doing?' and 'What should we automate next?'"
    )
    add_screenshot(doc, "13_coverage_map", "Figure 3.10 -- Task Ownership / Coverage Map")

    doc.add_heading("3.2.3 Labor Graph", level=3)
    doc.add_paragraph(
        "The Labor Graph shows the human effort distribution across tasks, helping identify "
        "where humans spend the most time and where automation could have the biggest impact."
    )
    add_screenshot(doc, "04_labor_graph_sports", "Figure 3.11 -- Labor Graph")

    doc.add_heading("3.2.4 Sigma Scorecard", level=3)
    doc.add_paragraph(
        "The Sigma Scorecard shows quality scores for each agent using the Six Sigma scale (1-6 sigma). "
        "Every sigma score has a tooltip translating it to plain English (e.g., '3.4 sigma = 99.97% "
        "accuracy, world-class'). The Improvement Tracker shows sigma trends over time with projections."
    )
    add_screenshot(doc, "05_sigma_scorecard_sports", "Figure 3.12 -- Sigma Scorecard with quality scores and trends")

    doc.add_page_break()

    doc.add_heading("3.2.5 Transformation Roadmap", level=3)
    doc.add_paragraph(
        "The Transformation Roadmap shows the journey from current state to target state, "
        "with stages, timelines, and ROI projections for each phase of automation."
    )
    add_screenshot(doc, "14_transformation_roadmap", "Figure 3.13 -- Transformation Roadmap with stage timeline")

    doc.add_heading("3.2.6 Training Plan", level=3)
    doc.add_paragraph(
        "The Training Plan identifies skills gaps created by automation and recommends training "
        "programs to help team members transition to oversight, exception-handling, and strategic roles."
    )
    add_screenshot(doc, "22_training_plan", "Figure 3.14 -- Skills Gap & Training Plan")

    doc.add_heading("3.2.7 Workforce Planning", level=3)
    doc.add_paragraph(
        "12-month workforce projections under three scenarios (conservative, moderate, aggressive automation). "
        "Shows headcount trajectory, role transitions, and cost impact over time."
    )
    add_screenshot(doc, "27_workforce_planning", "Figure 3.15 -- Workforce Planning: 12-month projections")

    doc.add_page_break()

    # 3.3 Agent Telemetry
    doc.add_heading("3.3 Agent Telemetry & Management", level=2)

    doc.add_heading("3.3.1 Agent Detail Page", level=3)
    doc.add_paragraph(
        "Each agent has a dedicated telemetry page showing: metrics bar (sigma, latency, cost, runs), "
        "run history, defect analysis, cost of inaction calculator, version timeline, and ROI breakdown. "
        "The Cost of Inaction shows projected financial impact if a declining agent is not addressed."
    )
    add_screenshot(doc, "06_agent_telemetry_odds_scraper", "Figure 3.16 -- Odds Scraper Agent: telemetry and metrics")
    doc.add_paragraph("")
    add_screenshot(doc, "06c_agent_telemetry_recommendation_writer", "Figure 3.17 -- Recommendation Writer Agent (declining, shows cost of inaction)")

    doc.add_page_break()

    doc.add_heading("3.3.2 Agent Lifecycle Management", level=3)
    doc.add_paragraph(
        "The Manage page provides controls to pause, decommission, or swap an agent. "
        "Each action shows an impact preview before confirmation. The decommission flow shows "
        "which tasks would lose automation and the estimated manual workload increase."
    )
    add_screenshot(doc, "16_agent_manage", "Figure 3.18 -- Agent Manage: lifecycle controls (pause, decommission, swap)")

    doc.add_heading("3.3.3 Agent A/B Comparison", level=3)
    doc.add_paragraph(
        "Side-by-side agent comparison with radar chart overlay showing quality, speed, cost, "
        "reliability, and coverage dimensions. Helps answer: 'Which agent should I keep?'"
    )
    add_screenshot(doc, "17_agent_compare", "Figure 3.19 -- Agent A/B Comparison with radar chart")

    doc.add_heading("3.3.4 Staging / Canary View", level=3)
    doc.add_paragraph(
        "Before promoting a new agent version to production, the staging view shows a traffic split "
        "(e.g., 80% production / 20% canary) with side-by-side metrics comparison. "
        "Promote or rollback with a single click."
    )
    add_screenshot(doc, "23_agent_staging", "Figure 3.20 -- Agent Staging: canary deployment with traffic split")

    doc.add_page_break()

    # 3.4 Governance
    doc.add_heading("3.4 Governance & Compliance", level=2)

    doc.add_heading("3.4.1 Audit Trail", level=3)
    doc.add_paragraph(
        "Complete audit log of every agent decision, human override, and system event. "
        "Filterable by agent, date, type, and reviewer. Includes override trend analysis "
        "showing weekly patterns and whether overrides are increasing or decreasing."
    )
    add_screenshot(doc, "07_audit_log", "Figure 3.21 -- Audit Trail with override trend analysis")

    doc.add_heading("3.4.2 Risk Analysis (FMEA)", level=3)
    doc.add_paragraph(
        "Failure Mode and Effects Analysis board ranking all identified risks by RPN "
        "(Risk Priority Number = Severity x Occurrence x Detection). The highest-RPN item "
        "is auto-selected for immediate attention. Each entry shows mitigation steps."
    )
    add_screenshot(doc, "15_fmea_risk_board", "Figure 3.22 -- Risk Analysis (FMEA) board")

    doc.add_heading("3.4.3 Unreviewed Decisions", level=3)
    doc.add_paragraph(
        "The Oversight Gap report shows decisions made by agents that had no human review. "
        "Critical for EU AI Act compliance and demonstrating human-in-the-loop governance."
    )
    add_screenshot(doc, "21_oversight_gap", "Figure 3.23 -- Unreviewed Decisions / Oversight Gap report")

    doc.add_heading("3.4.4 Governance Rules Engine", level=3)
    doc.add_paragraph(
        "Configurable rules engine with 10 governance rules, compliance gauge showing overall "
        "compliance percentage, and violation tracking. Rules cover mandatory review thresholds, "
        "escalation triggers, and automated safeguards."
    )
    add_screenshot(doc, "28_governance_rules", "Figure 3.24 -- Governance Rules Engine with compliance gauge")

    doc.add_page_break()

    # 3.5 Insights
    doc.add_heading("3.5 Insights & Analytics", level=2)

    doc.add_heading("3.5.1 What-If Scenarios", level=3)
    doc.add_paragraph(
        "Interactive scenario builder: 'What happens if I add one more agent?', "
        "'What if I hire 2 more analysts?', 'What if I scale to 200 runs/day?'. "
        "Sliders adjust variables and results update in real-time."
    )
    add_screenshot(doc, "36_what_if_scenarios", "Figure 3.25 -- What-If Scenario Builder")

    doc.add_heading("3.5.2 AI Maturity Score", level=3)
    doc.add_paragraph(
        "Assessment across 5 dimensions: Coverage, Quality, ROI, Governance, and Workforce Readiness. "
        "Radar chart visualization with actionable recommendations to reach the next maturity level."
    )
    add_screenshot(doc, "37_ai_maturity", "Figure 3.26 -- AI Maturity Score with radar chart")

    doc.add_page_break()

    # 3.6 Planning
    doc.add_heading("3.6 Planning & Setup", level=2)

    doc.add_heading("3.6.1 Board Report Export", level=3)
    doc.add_paragraph(
        "One-click board-ready report generation. Configurable sections, PDF export, "
        "scheduled delivery (weekly/monthly) to specified recipients."
    )
    add_screenshot(doc, "12_board_export", "Figure 3.27 -- Board Report export with scheduling")

    doc.add_heading("3.6.2 Setup Wizard: Occupation Selector", level=3)
    doc.add_paragraph(
        "O*NET occupation search to select the job role being automated. "
        "This anchors the entire analysis to a real occupation taxonomy."
    )
    add_screenshot(doc, "10_occupation_selector", "Figure 3.28 -- Occupation Selector (O*NET search)")

    doc.add_heading("3.6.3 Setup Wizard: Agent-to-Task Mapper", level=3)
    doc.add_paragraph(
        "Map AI agents to specific O*NET tasks within the selected occupation. "
        "This creates the foundation for coverage analysis and ROI calculation."
    )
    add_screenshot(doc, "11_agent_task_mapper", "Figure 3.29 -- Agent-to-Task Mapper")

    doc.add_page_break()

    # 3.7 Configuration
    doc.add_heading("3.7 Configuration & Settings", level=2)

    doc.add_heading("3.7.1 Settings", level=3)
    add_screenshot(doc, "08_settings", "Figure 3.30 -- Settings page with shared links")

    doc.add_heading("3.7.2 SLA & Alert Rules", level=3)
    doc.add_paragraph(
        "Configure per-agent SLA targets (sigma threshold, latency limit, cost cap) "
        "and alert rules that trigger notifications when thresholds are breached."
    )
    add_screenshot(doc, "20_sla_alerts", "Figure 3.31 -- SLA Configuration & Alert Rules Engine")

    doc.add_heading("3.7.3 Budget Caps", level=3)
    doc.add_paragraph(
        "Per-agent monthly budget caps with visual gauges showing utilization. "
        "Alerts fire when an agent approaches or exceeds its budget."
    )
    add_screenshot(doc, "25_budgets", "Figure 3.32 -- Per-agent Budget Caps & Utilization")

    doc.add_heading("3.7.4 Notification Channels", level=3)
    doc.add_paragraph(
        "Configure notification delivery: email, Slack, Microsoft Teams. "
        "Each channel can be enabled/disabled per alert category."
    )
    add_screenshot(doc, "26_notifications", "Figure 3.33 -- Notification Channel Configuration")

    doc.add_page_break()

    doc.add_heading("3.7.5 Integrations", level=3)
    doc.add_paragraph(
        "API keys management, webhook configuration, and BI tool connections (Tableau, Power BI, Looker). "
        "Enables the platform to feed data into existing enterprise toolchains."
    )
    add_screenshot(doc, "29_integrations", "Figure 3.34 -- Integrations: API Keys, Webhooks, BI Tools")

    doc.add_heading("3.7.6 White-Label Branding", level=3)
    doc.add_paragraph(
        "Customize the platform's appearance: logo, colors, product name. "
        "Live preview shows changes in real-time before saving."
    )
    add_screenshot(doc, "31_branding", "Figure 3.35 -- White-Label Branding Configuration")

    doc.add_heading("3.7.7 Multi-Tenant Organisations", level=3)
    doc.add_paragraph(
        "Manage multiple organisations with separate workspaces, users, and data isolation. "
        "Enterprise-grade multi-tenancy support."
    )
    add_screenshot(doc, "32_organisations", "Figure 3.36 -- Multi-Tenant Organisation Management")

    doc.add_page_break()

    # 3.8 Monitoring
    doc.add_heading("3.8 Live Monitoring", level=2)
    doc.add_paragraph(
        "The Live Monitor is a NOC-style dark-themed screen designed for always-on display. "
        "Shows real-time agent status grid, live event feed, active alerts, and system health. "
        "Designed for operations teams monitoring AI agent infrastructure."
    )
    add_screenshot(doc, "24_live_monitoring", "Figure 3.37 -- Live Monitoring (NOC screen, dark theme)")

    doc.add_page_break()

    # ================================================================
    # 4. THE 100 CEO QUESTIONS
    # ================================================================
    doc.add_heading("4. The 100 CEO Questions -- Complete Reference", level=1)
    doc.add_paragraph(
        "This section maps every question a CEO, CTO, or VP is likely to ask about their AI agent "
        "workforce to the exact screen and feature in the platform that answers it. Questions Q1-Q40 "
        "are fully implemented. Questions Q41-Q100 show current coverage and planned enhancements."
    )

    # ── Q1-Q6: Agent Lifecycle ──
    doc.add_heading("4.1 Agent Lifecycle Management (Q1-Q6)", level=2)
    doc.add_paragraph(
        "These questions cover the full agent lifecycle: adding, removing, replacing, testing, "
        "comparing, and tracking versions of AI agents."
    )

    questions_lifecycle = [
        ("Q1", "How do I add a new agent?",
         "Navigate to Planning > Setup Wizard. The Occupation Selector (step 1) lets you pick the job role "
         "from the O*NET taxonomy. The Agent-to-Task Mapper (step 2) assigns agents to specific tasks.",
         ["10_occupation_selector", "11_agent_task_mapper"]),
        ("Q2", "How do I remove/decommission a bad agent?",
         "Go to the agent's detail page > Manage tab. The Decommission action shows impact preview: "
         "which tasks lose automation, estimated manual workload increase. Requires confirmation.",
         ["16_agent_manage"]),
        ("Q3", "How do I replace one agent with another?",
         "On the Manage page, the Swap action lets you select a replacement agent. Shows side-by-side "
         "metrics comparison before confirming the swap.",
         ["16_agent_manage"]),
        ("Q4", "How do I test before promoting to production?",
         "The Staging/Canary view shows a traffic split (e.g., 80/20) between production and canary versions. "
         "Metrics are compared in real-time. Promote or rollback with one click.",
         ["23_agent_staging"]),
        ("Q5", "How do I compare two agents?",
         "Insights > Agent Comparison provides a side-by-side view with radar chart overlay across "
         "quality, speed, cost, reliability, and coverage dimensions.",
         ["17_agent_compare"]),
        ("Q6", "How do I see agent version history?",
         "Each agent's detail page includes a Version Timeline showing the last 3 versions with "
         "sigma score changes, deployment dates, and rollback options.",
         ["06_agent_telemetry_odds_scraper"]),
    ]

    for qid, question, answer, screenshots in questions_lifecycle:
        doc.add_heading(f"{qid}: {question}", level=3)
        doc.add_paragraph(answer)
        for ss in screenshots:
            add_screenshot(doc, ss, f"{qid} -- See highlighted area above")
        doc.add_paragraph("")

    doc.add_page_break()

    # ── Q7-Q13: ROI & Financial ──
    doc.add_heading("4.2 ROI & Financial (Q7-Q13)", level=2)

    questions_roi = [
        ("Q7", "What is the total ROI across all processes?",
         "The Dashboard hero banner shows total weekly savings after all costs (e.g., '$2,038/week'). "
         "The Finance pill shows net ROI. The Financial Impact page breaks this down by process in a waterfall chart.",
         ["01_dashboard", "02_roi_calculator"]),
        ("Q8", "What is the ROI per individual agent?",
         "Each agent's detail page includes an AgentRoiCard showing that agent's specific ROI contribution: "
         "gross value generated, inference costs, overhead costs, and net ROI.",
         ["06_agent_telemetry_odds_scraper"]),
        ("Q9", "What is the cost of NOT fixing a bad agent?",
         "The Cost of Inaction calculator on declining agents shows projected additional cost over 90 days "
         "if the agent continues on its current trajectory without intervention.",
         ["06c_agent_telemetry_recommendation_writer"]),
        ("Q10", "What is the monthly inference spend?",
         "The Cost Trend Dashboard (Insights > Financial Impact) shows monthly spend breakdown across "
         "inference, overhead, and training costs with trend lines.",
         ["18_cost_trend"]),
        ("Q11", "What is the ROI projection for next quarter?",
         "The Transformation Roadmap shows projected ROI for each phase of automation, "
         "including next-quarter projections based on the current roadmap.",
         ["14_transformation_roadmap"]),
        ("Q12", "Can I set a budget cap per agent?",
         "Configure > Budgets lets you set monthly budget caps per agent with visual utilization gauges. "
         "Alerts fire when approaching or exceeding the cap.",
         ["25_budgets"]),
        ("Q13", "How do we benchmark against industry?",
         "Insights > Benchmarks shows your metrics against industry averages and top-10% performers "
         "across sigma scores, automation rates, ROI, and governance.",
         ["30_industry_benchmarks"]),
    ]

    for qid, question, answer, screenshots in questions_roi:
        doc.add_heading(f"{qid}: {question}", level=3)
        doc.add_paragraph(answer)
        for ss in screenshots:
            add_screenshot(doc, ss, f"{qid} -- See highlighted area above")
        doc.add_paragraph("")

    doc.add_page_break()

    # ── Q14-Q21: Performance & Quality ──
    doc.add_heading("4.3 Performance & Quality (Q14-Q21)", level=2)

    questions_perf = [
        ("Q14", "Which is the best performing agent?",
         "The Sigma Scorecard ranks all agents by sigma score. The highest-sigma agent is clearly "
         "identified. Dashboard attention cards also highlight top and bottom performers.",
         ["05_sigma_scorecard_sports"]),
        ("Q15", "Which agent is underperforming?",
         "Dashboard Attention Required section shows agents with declining sigma scores in red-bordered "
         "cards with projected cost impact. The Sigma Scorecard provides the detailed breakdown.",
         ["01_dashboard"]),
        ("Q16", "What insights can improve an agent?",
         "Each agent's detail page includes a defect analysis section showing the most common failure "
         "types, their frequency, and recommended remediation steps.",
         ["06_agent_telemetry_odds_scraper"]),
        ("Q17", "What is the root cause of failures?",
         "The Risk Analysis (FMEA) board ranks all failure modes by RPN. Each entry identifies the "
         "root cause, current controls, and recommended mitigation actions.",
         ["15_fmea_risk_board"]),
        ("Q18", "Can I track improvement over time?",
         "The Sigma Scorecard includes an Improvement Tracker showing sigma history with trend lines "
         "and projections. See whether quality is improving, stable, or declining.",
         ["05_sigma_scorecard_sports"]),
        ("Q19", "Can I set SLA targets per agent?",
         "Configure > Alerts lets you define per-agent SLA rules: minimum sigma threshold, maximum "
         "latency, maximum cost per run. Violations trigger configured notifications.",
         ["20_sla_alerts"]),
        ("Q20", "Will I be alerted when quality drops?",
         "The Alert Rules Engine monitors all SLA thresholds continuously. When a rule is violated, "
         "notifications are sent via configured channels (email, Slack, Teams).",
         ["20_sla_alerts", "26_notifications"]),
        ("Q21", "Can I see real-time agent performance?",
         "The Live Monitor shows real-time status of all agents: active/idle/error state, "
         "current run metrics, and a live event feed of recent actions.",
         ["24_live_monitoring"]),
    ]

    for qid, question, answer, screenshots in questions_perf:
        doc.add_heading(f"{qid}: {question}", level=3)
        doc.add_paragraph(answer)
        for ss in screenshots:
            add_screenshot(doc, ss, f"{qid} -- See highlighted area above")
        doc.add_paragraph("")

    doc.add_page_break()

    # ── Q22-Q26: Reporting ──
    doc.add_heading("4.4 Reporting & Communication (Q22-Q26)", level=2)

    questions_report = [
        ("Q22", "Can I download a report?",
         "Planning > Board Report provides configurable report export. Select sections to include, "
         "preview the report, and download as PDF using the browser's print dialog.",
         ["12_board_export"]),
        ("Q23", "Can I schedule weekly reports?",
         "The Board Report page has a Schedule tab where you can set up recurring report delivery: "
         "daily, weekly, or monthly, sent to specified email recipients.",
         ["12_board_export"]),
        ("Q24", "Can I share a dashboard link?",
         "Key pages have a Share button that generates a shareable link. Shared links are managed "
         "from Settings > Shared Links, where you can revoke access.",
         ["08_settings"]),
        ("Q25", "Can I get Slack/Teams notifications?",
         "Configure > Notifications supports email, Slack, and Microsoft Teams. Each channel "
         "can be enabled per alert category (quality, cost, governance, system).",
         ["26_notifications"]),
        ("Q26", "Can I export to BI tools?",
         "Configure > Integrations has a BI Tools tab supporting Tableau, Power BI, and Looker "
         "with connection wizards and API endpoint documentation.",
         ["29_integrations"]),
    ]

    for qid, question, answer, screenshots in questions_report:
        doc.add_heading(f"{qid}: {question}", level=3)
        doc.add_paragraph(answer)
        for ss in screenshots:
            add_screenshot(doc, ss, f"{qid} -- See highlighted area above")
        doc.add_paragraph("")

    doc.add_page_break()

    # ── Q27-Q30: Workforce ──
    doc.add_heading("4.5 Team & Workforce (Q27-Q30)", level=2)

    questions_workforce = [
        ("Q27", "What skills does my team need now?",
         "The Labor Graph shows current human task distribution. The Training Plan identifies "
         "specific skills gaps and recommends training programs for each affected role.",
         ["04_labor_graph_sports", "22_training_plan"]),
        ("Q28", "How do I plan training for the team?",
         "The Training Plan page provides a structured skills gap analysis with recommended courses, "
         "timelines, and priority levels for each team member or role.",
         ["22_training_plan"]),
        ("Q29", "What is my team's role as agents improve?",
         "The Transformation Roadmap shows how roles evolve at each stage: from manual execution "
         "to oversight, exception handling, and strategic decision-making.",
         ["14_transformation_roadmap"]),
        ("Q30", "What is the headcount impact over 12 months?",
         "Workforce Planning shows 12-month projections under three scenarios (conservative, "
         "moderate, aggressive). Charts show headcount trajectory, role transitions, and cost curves.",
         ["27_workforce_planning"]),
    ]

    for qid, question, answer, screenshots in questions_workforce:
        doc.add_heading(f"{qid}: {question}", level=3)
        doc.add_paragraph(answer)
        for ss in screenshots:
            add_screenshot(doc, ss, f"{qid} -- See highlighted area above")
        doc.add_paragraph("")

    doc.add_page_break()

    # ── Q31-Q35: Governance ──
    doc.add_heading("4.6 Governance & Compliance (Q31-Q35)", level=2)

    questions_gov = [
        ("Q31", "Are we EU AI Act compliant?",
         "The Audit Trail provides the compliance evidence chain. The governance rules engine enforces "
         "mandatory human review for high-risk decisions, and the audit log captures every decision for regulatory export.",
         ["07_audit_log"]),
        ("Q32", "What is the override rate trend?",
         "The Audit Trail page includes override trend analysis charts showing weekly override frequency, "
         "whether overrides are increasing or decreasing, and correlation with agent quality scores.",
         ["07_audit_log"]),
        ("Q33", "Can I export data for auditors?",
         "The Board Report export supports audit-specific sections. The Audit Trail itself supports "
         "filtered export by date range, agent, and event type -- suitable for regulatory submission.",
         ["12_board_export", "07_audit_log"]),
        ("Q34", "Which decisions had no human oversight?",
         "Governance > Unreviewed Decisions shows a dedicated report of all agent decisions that "
         "proceeded without human review, categorized by risk level and agent.",
         ["21_oversight_gap"]),
        ("Q35", "Can I require human review for high-risk decisions?",
         "Governance > Rules Engine lets you configure mandatory human review rules. Set conditions "
         "(e.g., 'all decisions above $1000 risk') and the system enforces review before proceeding.",
         ["28_governance_rules"]),
    ]

    for qid, question, answer, screenshots in questions_gov:
        doc.add_heading(f"{qid}: {question}", level=3)
        doc.add_paragraph(answer)
        for ss in screenshots:
            add_screenshot(doc, ss, f"{qid} -- See highlighted area above")
        doc.add_paragraph("")

    doc.add_page_break()

    # ── Q36-Q40: Multi-Org ──
    doc.add_heading("4.7 Multi-Org & Scaling (Q36-Q40)", level=2)

    questions_scale = [
        ("Q36", "Can I manage multiple departments?",
         "The sidebar nests agents under their process (job role). Multiple processes represent "
         "different departments. The dashboard shows all processes side-by-side.",
         ["01_dashboard"]),
        ("Q37", "Can I set different quality targets per team?",
         "Configure > Alerts supports per-agent SLA configuration. Each agent (and by extension, "
         "each team/process) can have different quality thresholds.",
         ["20_sla_alerts"]),
        ("Q38", "Can I benchmark across departments?",
         "Insights > Benchmarks includes cross-process comparison, showing how each department's "
         "agents perform relative to each other on key metrics.",
         ["19_cross_process_benchmark"]),
        ("Q39", "Can I white-label this for clients?",
         "Configure > Branding provides full white-label customization: logo upload, color scheme, "
         "product name, and live preview of changes before saving.",
         ["31_branding"]),
        ("Q40", "Can I manage multiple organisations?",
         "Configure > Organisations provides multi-tenant workspace management with separate "
         "user directories, data isolation, and per-org configuration.",
         ["32_organisations"]),
    ]

    for qid, question, answer, screenshots in questions_scale:
        doc.add_heading(f"{qid}: {question}", level=3)
        doc.add_paragraph(answer)
        for ss in screenshots:
            add_screenshot(doc, ss, f"{qid} -- See highlighted area above")
        doc.add_paragraph("")

    doc.add_page_break()

    # ── Q41-Q100: Extended ──
    doc.add_heading("4.8 Extended Questions (Q41-Q100)", level=2)
    doc.add_paragraph(
        "Questions Q41-Q100 represent deeper analytical needs. The table below shows the current "
        "status of each question: which are already answered by existing features, which are partially "
        "covered, and which are planned for future phases."
    )

    extended_questions = [
        # Agent Performance Deeper
        ("Q41", "Which agent improved the most this month?", "Answered", "Sigma Scorecard Improvement Tracker", "05_sigma_scorecard_sports"),
        ("Q42", "Which agent costs the most per successful outcome?", "Answered", "Agent Detail page -- cost/success ratio", "06_agent_telemetry_odds_scraper"),
        ("Q43", "Failure rate trend over the last quarter?", "Partial", "30-day trend available; 90-day planned (Phase 7)", "05_sigma_scorecard_sports"),
        ("Q44", "Can I see what an agent does step-by-step?", "Planned", "Run Trace Viewer -- Phase 7", "06_agent_telemetry_odds_scraper"),
        ("Q45", "What happens when an agent fails?", "Partial", "Audit Trail shows escalations; full flow planned Phase 7", "07_audit_log"),
        ("Q46", "How fast are my agents responding?", "Answered", "Agent metrics bar shows P95 latency", "06_agent_telemetry_odds_scraper"),
        ("Q47", "Are agents getting faster or slower?", "Planned", "Latency trend chart -- Phase 7", "06_agent_telemetry_odds_scraper"),
        ("Q48", "Which tasks are agents worst at?", "Partial", "Per-defect-type available; per-task planned Phase 7", "13_coverage_map"),
        ("Q49", "Can I see a specific failed run?", "Planned", "Run Detail Panel -- Phase 7", "06_agent_telemetry_odds_scraper"),
        ("Q50", "What is agent uptime/availability?", "Planned", "Availability Card -- Phase 7", "24_live_monitoring"),
        # Financial Deeper
        ("Q51", "Total cost of AI ownership (TCO)?", "Partial", "Cost trends available; full TCO breakdown planned Phase 8", "18_cost_trend"),
        ("Q52", "ROI if I add one more agent?", "Planned", "What-If Scenario Builder -- Phase 8", "36_what_if_scenarios"),
        ("Q53", "Payback period per agent?", "Planned", "Payback Calculator -- Phase 8", "02_roi_calculator"),
        ("Q54", "Cost per department?", "Planned", "Department-level cost view -- Phase 8", "18_cost_trend"),
        ("Q55", "Cost trend by model (GPT vs Claude)?", "Partial", "Inference costs shown; model breakdown planned Phase 8", "18_cost_trend"),
        ("Q56", "Savings from switching models?", "Planned", "Model Comparison tool -- Phase 8", "17_agent_compare"),
        ("Q57", "Marginal cost of scaling?", "Planned", "Scenario Builder scaling slider -- Phase 8", "36_what_if_scenarios"),
        ("Q58", "Over-spending on oversight?", "Partial", "Oversight costs in ROI waterfall; efficiency analysis Phase 8", "02_roi_calculator"),
        ("Q59", "Inference cost per token?", "Planned", "Token-level TCO breakdown -- Phase 8", "18_cost_trend"),
        ("Q60", "% of AI spend wasted on failures?", "Partial", "Failure costs visible; waste ratio planned Phase 8", "18_cost_trend"),
        # Workforce Deeper
        ("Q61", "Which team members most affected?", "Planned", "Team Impact Cards -- Phase 9", "27_workforce_planning"),
        ("Q62", "New roles to create?", "Partial", "Roadmap shows role evolution; explicit role creation Phase 9", "14_transformation_roadmap"),
        ("Q63", "Humans overriding good decisions?", "Partial", "Override rate visible; quality analysis planned Phase 7", "07_audit_log"),
        ("Q64", "Time spent reviewing AI output?", "Partial", "Oversight hours in workforce plan; detailed view Phase 9", "27_workforce_planning"),
        ("Q65", "Employee satisfaction impact?", "Planned", "Survey integration -- Phase 9", "27_workforce_planning"),
        ("Q66", "What if we hire 2 more people?", "Planned", "Scenario Builder hiring slider -- Phase 8", "36_what_if_scenarios"),
        ("Q67", "What tasks should we automate next?", "Partial", "Coverage map shows gaps; recommendation engine Phase 7", "13_coverage_map"),
        ("Q68", "Human error vs agent error rate?", "Planned", "Human vs Agent Comparison -- Phase 9", "05_sigma_scorecard_sports"),
        # Governance Deeper
        ("Q69", "ISO 42001 compliant?", "Partial", "Audit trail + rules; compliance checklist planned Phase 9", "07_audit_log"),
        ("Q70", "Generate compliance certificate?", "Planned", "Compliance Dashboard -- Phase 9", "07_audit_log"),
        ("Q71", "Audit readiness score?", "Partial", "Governance rules compliance gauge; full score Phase 9", "28_governance_rules"),
        ("Q72", "Who approved most overrides?", "Partial", "Audit log filterable; per-reviewer breakdown Phase 7", "07_audit_log"),
        ("Q73", "Overrides correlated with time?", "Planned", "Temporal pattern chart -- Phase 7", "07_audit_log"),
        ("Q74", "Different rules per geography?", "Planned", "Geo-scoped rules -- Phase 9", "28_governance_rules"),
        ("Q75", "All March decisions for a regulator?", "Answered", "Audit Trail with date filter + export", "07_audit_log"),
        ("Q76", "Prove human-in-the-loop?", "Partial", "Override events in audit; evidence chain Phase 9", "07_audit_log"),
        ("Q77", "Mean time between violations?", "Planned", "MTBV metric -- Phase 9", "28_governance_rules"),
        ("Q78", "Alert when compliance drops?", "Answered", "Alert Rules Engine supports compliance thresholds", "20_sla_alerts"),
        # Operational Deeper
        ("Q79", "Pause all agents (kill switch)?", "Planned", "Emergency Pause -- Phase 9", "24_live_monitoring"),
        ("Q80", "Blast radius if agent goes rogue?", "Partial", "Manage page impact preview; full analysis Phase 9", "16_agent_manage"),
        ("Q81", "Roll back to previous version?", "Partial", "Version Timeline; full rollback Phase 9", "06_agent_telemetry_odds_scraper"),
        ("Q82", "Dependency map between agents?", "Planned", "Dependency Map -- Phase 9", "17_agent_compare"),
        ("Q83", "Which agents share data sources?", "Planned", "Data source mapping -- Phase 9", "17_agent_compare"),
        ("Q84", "Peak hour performance?", "Partial", "Monitoring shows current; heatmap planned Phase 7", "24_live_monitoring"),
        ("Q85", "Set maintenance windows?", "Planned", "Maintenance Scheduler -- Phase 9", "16_agent_manage"),
        ("Q86", "Recovery time on failure?", "Planned", "MTTR metric -- Phase 7", "24_live_monitoring"),
        # Strategic
        ("Q87", "Where on AI maturity curve?", "Partial", "AI Maturity Score available; full assessment Phase 8", "37_ai_maturity"),
        ("Q88", "Compare to competitors?", "Answered", "Industry Benchmarks page", "30_industry_benchmarks"),
        ("Q89", "AI strategy readiness?", "Planned", "Readiness assessment -- Phase 8", "37_ai_maturity"),
        ("Q90", "Board presentation in 5 minutes?", "Answered", "Board Report one-click export", "12_board_export"),
        ("Q91", "3-year projection?", "Planned", "Long-Range Projection -- Phase 8", "27_workforce_planning"),
        ("Q92", "Build or buy more agents?", "Planned", "Build vs Buy Analysis -- Phase 8", "17_agent_compare"),
        ("Q93", "AI risk exposure summary?", "Partial", "FMEA + governance; unified risk view Phase 9", "15_fmea_risk_board"),
        ("Q94", "See this on my phone?", "Planned", "Mobile responsive pass -- Phase 9", "01_dashboard"),
        ("Q95", "Show to investors?", "Partial", "Board Report + Branding; investor mode Phase 8", "12_board_export"),
        ("Q96", "Competitive moat from AI?", "Planned", "Strategic assessment -- Phase 8", "37_ai_maturity"),
        # Integration
        ("Q97", "Connect to HR system?", "Partial", "Integration stubs; HR connector planned Phase 9", "29_integrations"),
        ("Q98", "Agents trigger other system actions?", "Planned", "Outbound webhooks -- Phase 9", "29_integrations"),
        ("Q99", "Import from Langfuse/LangSmith?", "Planned", "Observability import connector -- Phase 9", "29_integrations"),
        ("Q100", "Set up SSO for my team?", "Planned", "SSO configuration -- Phase 9", "29_integrations"),
    ]

    # Table for Q41-Q100
    doc.add_paragraph("")
    for i in range(0, len(extended_questions), 10):
        batch = extended_questions[i:i+10]
        batch_start = batch[0][0]
        batch_end = batch[-1][0]

        # Section header for each batch
        if i == 0:
            doc.add_heading("Agent Performance -- Deeper (Q41-Q50)", level=3)
        elif i == 10:
            doc.add_heading("Financial -- Deeper (Q51-Q60)", level=3)
        elif i == 20:
            doc.add_heading("Workforce -- Deeper (Q61-Q68)", level=3)
        elif i == 28:
            doc.add_heading("Governance -- Deeper (Q69-Q78)", level=3)
        elif i == 38:
            doc.add_heading("Operational -- Deeper (Q79-Q86)", level=3)
        elif i == 46:
            doc.add_heading("Strategic C-Suite (Q87-Q96)", level=3)
        elif i == 56:
            doc.add_heading("Integration (Q97-Q100)", level=3)

        for qid, question, status, detail, screenshot in batch:
            status_prefix = ""
            if status == "Answered":
                status_prefix = "[ANSWERED] "
            elif status == "Partial":
                status_prefix = "[PARTIAL] "
            else:
                status_prefix = "[PLANNED] "

            p = doc.add_paragraph()
            run = p.add_run(f"{qid}: {question}")
            run.bold = True
            run.font.size = Pt(10)

            p2 = doc.add_paragraph(f"Status: {status_prefix}{detail}")
            p2.paragraph_format.left_indent = Cm(0.5)

            if status in ("Answered", "Partial"):
                add_screenshot(doc, screenshot, f"{qid} -- {status}: {question}")

            doc.add_paragraph("")

    doc.add_page_break()

    # ================================================================
    # 5. ROUTE MAP
    # ================================================================
    doc.add_heading("5. Route Map & Screen Index", level=1)
    doc.add_paragraph(
        "Complete index of all 35+ routes in the application with their purpose and phase."
    )

    routes = [
        ["Route", "Screen Name", "Phase", "Purpose"],
        ["/dashboard", "Executive Dashboard", "1", "AI workforce overview, attention items, process health"],
        ["/dashboard/roi", "Financial Impact", "1", "ROI waterfall, cost breakdown"],
        ["/dashboard/costs", "Cost Trends", "3", "Monthly spend analysis"],
        ["/dashboard/benchmark", "Cross-Process Benchmark", "3", "Compare processes within org"],
        ["/dashboard/benchmarks", "Industry Benchmarks", "5", "Compare against industry averages"],
        ["/dashboard/export", "Board Report", "2", "Configurable report export + scheduling"],
        ["/process/[id]", "Symmetry Dashboard", "1", "Agent/human split, quality equation"],
        ["/process/[id]/labor", "Labor Graph", "1", "Human effort distribution"],
        ["/process/[id]/sigma", "Sigma Scorecard", "1", "Quality scores + improvement tracker"],
        ["/process/[id]/coverage", "Task Ownership", "2", "Coverage map: which tasks are automated"],
        ["/process/[id]/roadmap", "Transformation Roadmap", "2", "Stage timeline + ROI projections"],
        ["/process/[id]/training", "Training Plan", "3", "Skills gap analysis + course recommendations"],
        ["/process/[id]/workforce", "Workforce Planning", "4", "12-month headcount projections"],
        ["/agents/[id]", "Agent Telemetry", "1", "Per-agent metrics, runs, defects, ROI"],
        ["/agents/[id]/manage", "Agent Manage", "3", "Pause, decommission, swap controls"],
        ["/agents/[id]/staging", "Agent Staging", "4", "Canary deployment + traffic split"],
        ["/agents/compare", "Agent Comparison", "3", "Side-by-side radar chart comparison"],
        ["/monitoring", "Live Monitor", "4", "NOC screen, real-time status + events"],
        ["/governance/audit", "Audit Trail", "1", "Complete decision log + override trends"],
        ["/governance/fmea", "Risk Analysis", "2", "FMEA board ranked by RPN"],
        ["/governance/oversight", "Unreviewed Decisions", "3", "Oversight gap report"],
        ["/governance/rules", "Rules Engine", "4", "Configurable governance rules"],
        ["/analytics/correlations", "Correlations", "5", "Metric correlation scatter plots"],
        ["/insights/scenarios", "What-If Scenarios", "7-8", "Interactive scenario modeler"],
        ["/insights/maturity", "AI Maturity", "7-8", "Maturity assessment radar chart"],
        ["/setup/occupation", "Occupation Selector", "2", "O*NET job role picker"],
        ["/setup/mapping", "Task Mapper", "2", "Assign agents to tasks"],
        ["/settings", "Settings", "1", "General config + shared links"],
        ["/settings/alerts", "SLA & Alerts", "3", "Per-agent SLA rules"],
        ["/settings/budgets", "Budgets", "4", "Per-agent budget caps"],
        ["/settings/notifications", "Notifications", "4", "Email, Slack, Teams channels"],
        ["/settings/integrations", "Integrations", "5", "API keys, webhooks, BI tools"],
        ["/settings/branding", "Branding", "5", "White-label customization"],
        ["/admin/organisations", "Organisations", "5", "Multi-tenant workspace management"],
        ["/login", "Login", "1", "Authentication page"],
    ]
    add_styled_table(doc, routes[0], routes[1:])

    doc.add_page_break()

    # ── Final page ──
    doc.add_heading("Document Information", level=1)
    doc.add_paragraph(
        "This document was generated from the live application running at localhost during development. "
        "All screenshots are captured directly from the application interface. "
        "All data shown is deterministic mock data for demonstration purposes -- no live backend is connected."
    )
    doc.add_paragraph("")
    info_rows = [
        ["Product", "VIPPlay Agent Telemetry Platform"],
        ["Version", "Phases 1-6 Complete (35 routes, 60+ components)"],
        ["Built by", "r-Potential / FuzeBox AI"],
        ["Tech Stack", "Next.js 16.2, React 19, TypeScript, Tailwind CSS 4, Recharts"],
        ["Date", "April 2026"],
    ]
    add_styled_table(doc, ["Field", "Value"], info_rows)

    # ── Save ──
    outpath = os.path.join(OUT, "VIPPlay_Agent_Telemetry_Platform_Documentation.docx")
    doc.save(outpath)
    print(f"Document saved to: {outpath}")

if __name__ == "__main__":
    build()
