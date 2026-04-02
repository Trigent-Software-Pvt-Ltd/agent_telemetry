# Agent Quality Platform — Test Cases (Gherkin)

> Manual browser test suite for April 7 demo verification.
> Run against `http://localhost:3000` with Chrome.

---

## TC-01: Login Page Renders

```gherkin
Feature: Login Page
  Scenario: Login page displays correctly
    Given I navigate to "/login"
    Then I should see the "r-Potential" logo
    And I should see an email input field
    And I should see a password input field
    And I should see a "Sign in" button

  Scenario: Sign in navigates to dashboard
    Given I am on the "/login" page
    When I click the "Sign in" button
    Then I should be redirected to "/dashboard"
```

---

## TC-02: App Shell & Navigation

```gherkin
Feature: App Shell
  Scenario: Sidebar renders with all sections
    Given I am on "/dashboard"
    Then I should see the sidebar with "r-Potential" branding
    And I should see "Powered by FuzeBox" subtitle
    And I should see the "OVERVIEW" section with "Dashboard" and "ROI Calculator"
    And I should see the "PROCESSES" section with "Sports Betting Analyst" and "Customer Service Rep"
    And I should see the "AGENTS" section with 3 agents
    And I should see the "GOVERNANCE" section with "Audit log"
    And I should see "SETTINGS" at the bottom

  Scenario: Agent status dots display correct colors
    Given I am on "/dashboard"
    Then the "Odds Analysis Agent" should have a green status dot
    And the "Line Comparison Agent" should have an amber status dot
    And the "Recommendation Writer" should have a red status dot

  Scenario: Sidebar active state highlights correctly
    Given I am on "/dashboard"
    Then the "Dashboard" nav item should be highlighted
    When I click "ROI Calculator" in the sidebar
    Then I should be on "/dashboard/roi"
    And the "ROI Calculator" nav item should be highlighted

  Scenario: TopBar shows breadcrumbs
    Given I am on "/process/sports-betting"
    Then the TopBar should show breadcrumb text containing "Sports Betting"

  Scenario: Language mode toggle is present
    Given I am on "/dashboard"
    Then I should see an "Operations" / "Quality" toggle in the TopBar
    And "Operations" should be the default selected mode
```

---

## TC-03: B1 — Executive Portfolio (`/dashboard`)

```gherkin
Feature: Executive Portfolio
  Scenario: Top metric cards display correct values
    Given I am on "/dashboard"
    Then I should see a metric card showing "2" for "Processes"
    And I should see a metric card showing "1" for "Healthy"
    And I should see a metric card with a dollar value for "Weekly Net ROI"
    And I should see a metric card showing "2" for agents needing attention

  Scenario: Process cards render for both processes
    Given I am on "/dashboard"
    Then I should see a process card for "Sports Betting Analyst" with O*NET code "13-2099.01"
    And it should show a GREEN status pill
    And it should display "43% automated"
    And it should show a weekly savings amount
    And I should see a process card for "Customer Service Representative"
    And it should show an AMBER status pill

  Scenario: Process card links to process detail
    Given I am on "/dashboard"
    When I click "View process details" on the Sports Betting card
    Then I should be on "/process/sports-betting"

  Scenario: Insight cards render
    Given I am on "/dashboard"
    Then I should see 3 insight cards at the bottom
    And one card should mention total weekly savings
    And one card should mention "Sports Betting Analyst" as best performing
    And one card should mention "Recommendation Writer" needing attention

  Scenario: Dashboard ignores language mode
    Given I am on "/dashboard"
    When I toggle language mode to "Quality"
    Then the dashboard content should NOT change (always plain English)
```

---

## TC-04: C1 — Symmetry Dashboard (`/process/sports-betting`)

```gherkin
Feature: Symmetry Dashboard
  Scenario: Three-column layout renders
    Given I am on "/process/sports-betting"
    Then I should see a left column titled with AI/agent coverage
    And I should see a center column with the symmetry equation
    And I should see a right column with human/team coverage

  Scenario: Agent column shows correct data
    Given I am on "/process/sports-betting"
    Then the agent column should show "43%" coverage
    And it should show a weekly cost value
    And it should list agent-owned tasks

  Scenario: Equation center shows NET ROI prominently
    Given I am on "/process/sports-betting"
    Then I should see "$1,426" (or "$1,426/week") as the NET ROI
    And it should be the largest/most prominent number on the page
    And I should see "after all costs" or similar sub-label

  Scenario: Human column shows correct data
    Given I am on "/process/sports-betting"
    Then the human column should show "37%" coverage
    And it should show hours freed per person
    And it should list human-retained tasks
    And it should show new skills needed

  Scenario: ROI waterfall renders below columns
    Given I am on "/process/sports-betting"
    Then I should see a waterfall showing: Gross → -oversight → -inference → -governance → Net
    And the numbers should be: $2,116, $483, $38, $169, $1,426

  Scenario: Language mode switches quality metric
    Given I am on "/process/sports-betting"
    And language mode is "Operations"
    Then the agent column should show a percentage-based quality metric
    When I toggle language mode to "Quality"
    Then the agent column should show a sigma-based quality metric (e.g. "4.2σ")
```

---

## TC-05: C2 — Labor Graph (`/process/sports-betting/labor`)

```gherkin
Feature: Labor Graph
  Scenario: Header shows process metadata
    Given I am on "/process/sports-betting/labor"
    Then I should see "Sports Betting Analyst" as the process name
    And I should see O*NET code "13-2099.01"
    And I should see headcount "12", wage "$42/hr"

  Scenario: Coverage bar renders three sections
    Given I am on "/process/sports-betting/labor"
    Then I should see a horizontal bar with 3 colored sections
    And the agent section should show "43%"
    And the collaborative section should show "20%"
    And the human section should show "37%"

  Scenario: Task board shows all 10 tasks
    Given I am on "/process/sports-betting/labor"
    Then the "Agent Owned" column should show 3 tasks
    And the "Collaborative" column should show 2 tasks
    And the "Human Retained" column should show 5 tasks
    And each task should display its time weight percentage

  Scenario: Skills panel shows before/after
    Given I am on "/process/sports-betting/labor"
    Then I should see a "before" skills column
    And I should see an "after" skills column with new skills like "AI output review"
```

---

## TC-06: C4 — Sigma Scorecard (`/process/sports-betting/sigma`)

```gherkin
Feature: Sigma Scorecard
  Scenario: Three agent cards render
    Given I am on "/process/sports-betting/sigma"
    Then I should see 3 agent sigma cards
    And "Odds Analysis Agent" card should have a green accent
    And "Line Comparison Agent" card should have an amber accent
    And "Recommendation Writer" card should have a red accent

  Scenario: Agent cards show OEE bars
    Given I am on "/process/sports-betting/sigma"
    Then each agent card should show an OEE progress bar with percentage
    And Odds Analysis should show approximately "83%"
    And Recommendation Writer should show approximately "58%"

  Scenario: Defect breakdown displays
    Given I am on "/process/sports-betting/sigma"
    Then each agent card should show defect counts for failures, latency, cost overruns
    And the highest defect category should have a bullet marker

  Scenario: Sigma legend is present (NON-NEGOTIABLE)
    Given I am on "/process/sports-betting/sigma"
    Then I should see a sigma translation legend
    And it should show levels from "1σ" to "6σ"
    And it should show DPMO values at each level
    And it should show plain English labels ("Unreliable", "High risk", etc.)
    And it should show the 4.0σ target line
    And it should show markers for where each agent sits

  Scenario: DPMO trend chart renders
    Given I am on "/process/sports-betting/sigma"
    Then I should see a line chart with 3 lines
    And there should be a horizontal reference line at DPMO 6,210
    And the Recommendation Writer line should trend upward (worse)
    And the Odds Analysis line should trend downward (better)

  Scenario: Language mode switches card content
    Given I am on "/process/sports-betting/sigma"
    And language mode is "Operations"
    Then agent cards should show "Performing well" / "Needs attention" / "Requires action"
    When I toggle language mode to "Quality"
    Then agent cards should show sigma values ("4.2σ", "3.4σ", "2.9σ")
```

---

## TC-07: D1 — Agent Telemetry (`/agents/odds-analysis`)

```gherkin
Feature: Agent Telemetry
  Scenario: Agent header renders with correct status
    Given I am on "/agents/odds-analysis"
    Then I should see "Odds Analysis Agent" as the agent name
    And I should see a GREEN status indicator
    And I should see "gpt-4o" and "CrewAI" labels

  Scenario: Key metrics bar shows correct values
    Given I am on "/agents/odds-analysis"
    Then I should see "50" for Total Runs
    And I should see approximately "88%" for Success Rate
    And I should see a cost value for Avg Cost
    And I should see a latency value for P95 Latency

  Scenario: Run history displays with expandable rows
    Given I am on "/agents/odds-analysis"
    Then I should see a list of recent runs with run IDs
    And each run should show timestamp, duration, and status icon
    When I click on a run row
    Then it should expand to show span tree details
    And I should see span names like "OddsScraperAgent"

  Scenario: Defect analysis section renders
    Given I am on "/agents/odds-analysis"
    Then I should see a defect breakdown section
    And it should show failure count, latency breaches, and cost overruns

  Scenario: Different agents load different data
    Given I am on "/agents/odds-analysis"
    Then the status should be GREEN
    When I navigate to "/agents/recommendation-writer"
    Then the status should be RED
    And the sigma score should show approximately "2.9"
```

---

## TC-08: D2 — Governance Audit Log (`/governance/audit`)

```gherkin
Feature: Governance Audit Log
  Scenario: Header shows compliance context
    Given I am on "/governance/audit"
    Then I should see "Human Oversight Audit Log" heading
    And I should see "ISO/IEC 42001" and "EU AI Act Article 14" references
    And I should see a compliance percentage (93%)
    And I should see an "Export for audit" button

  Scenario: Summary cards display correct metrics
    Given I am on "/governance/audit"
    Then I should see "15" for total decisions
    And I should see "27%" for override rate
    And I should see "4.2 min" for avg review time
    And I should see "93%" for compliance

  Scenario: Override alert is visible
    Given I am on "/governance/audit"
    Then I should see an amber alert about high override rate
    And it should mention "Recommendation Writer" or the recommendation task
    And it should mention "2.9σ" quality score

  Scenario: Audit table shows all 15 entries
    Given I am on "/governance/audit"
    Then I should see a table with 15 rows
    And each row should have: date, process, task, agent rec, human decision, reviewer, decision type, duration
    And APPROVED entries should have a green pill
    And OVERRIDDEN entries should have an amber pill
    And ESCALATED entries should have a red pill
    And reviewer names should include "Marcus Webb", "Priya Sharma", "James Okello"

  Scenario: Export button shows toast
    Given I am on "/governance/audit"
    When I click the "Export for audit" button
    Then I should see a toast notification
```

---

## TC-09: B2 — ROI Calculator (`/dashboard/roi`)

```gherkin
Feature: ROI Calculator
  Scenario: Slider renders with default value
    Given I am on "/dashboard/roi"
    Then I should see a cost slider labeled "Manual cost per task"
    And the default value should be "$50"

  Scenario: Summary cards update with slider
    Given I am on "/dashboard/roi"
    When I move the slider to "$100"
    Then the summary cards should show updated (higher) gross savings
    And the net ROI should increase accordingly

  Scenario: Waterfall chart renders
    Given I am on "/dashboard/roi"
    Then I should see a waterfall bar chart
    And it should show bars for gross saving, oversight, inference, governance, and net ROI
    And teal/green bars for savings, red/coral for costs, blue for net

  Scenario: Process comparison table renders
    Given I am on "/dashboard/roi"
    Then I should see a comparison table with both processes
    And it should show columns for agent cost, gross saving, net ROI, and multiple

  Scenario: Honest ROI note is visible
    Given I am on "/dashboard/roi"
    Then I should see a callout note about honest/real net savings
    And it should mention oversight, governance, and inference costs
```

---

## TC-10: A1 — Settings (`/settings`)

```gherkin
Feature: Settings
  Scenario: Organisation settings display
    Given I am on "/settings"
    Then I should see "FuzeBox AI" as the organisation name
    And I should see "Gaming / Sports Betting" as industry
    And I should see "OEE" as quality framework
    And I should see a sigma target slider at "4.0"

  Scenario: Connection statuses show green
    Given I am on "/settings"
    Then Langfuse should show "Connected" with a green indicator
    And O*NET should show "Registered" with a green indicator

  Scenario: Save button shows toast
    Given I am on "/settings"
    When I click the "Save" button
    Then I should see a toast notification saying "Settings saved" or similar
```

---

## TC-11: Cross-Screen Consistency

```gherkin
Feature: Cross-Screen Data Consistency
  Scenario: Dashboard ROI matches Symmetry ROI
    Given the dashboard shows "$1,426/week" for Sports Betting
    When I navigate to "/process/sports-betting"
    Then the symmetry equation should also show "$1,426" as NET ROI

  Scenario: Dashboard agent attention count matches sigma cards
    Given the dashboard shows "2" agents needing attention
    When I navigate to "/process/sports-betting/sigma"
    Then Line Comparison (3.4σ) and Recommendation Writer (2.9σ) should be below 3.5σ target

  Scenario: Sigma scores consistent across screens
    Given "/process/sports-betting/sigma" shows Odds Analysis at 4.2σ
    When I navigate to "/agents/odds-analysis"
    Then the sigma context should also show approximately 4.2σ

  Scenario: Audit log override rate matches data
    Given the audit log shows 15 total decisions
    And 4 are OVERRIDDEN
    Then the override rate should show approximately "27%" (4/15 = 26.7%)
```

---

## TC-12: Navigation Flow (Demo Walkthrough)

```gherkin
Feature: Demo Navigation Flow
  Scenario: Full demo walkthrough path
    Given I start at "/login"
    When I sign in
    Then I land on "/dashboard"

    When I click the Sports Betting process card
    Then I see the Symmetry Dashboard at "/process/sports-betting"

    When I click "Sigma scorecard" in the sidebar
    Then I see the Sigma Scorecard at "/process/sports-betting/sigma"

    When I click "Labor graph" in the sidebar
    Then I see the Labor Graph at "/process/sports-betting/labor"

    When I click "Odds Analysis Agent" in the sidebar
    Then I see Agent Telemetry at "/agents/odds-analysis"

    When I click "Audit log" in the sidebar
    Then I see the Audit Log at "/governance/audit"

    When I click "ROI Calculator" in the sidebar
    Then I see the ROI Calculator at "/dashboard/roi"

    When I click "Settings" in the sidebar
    Then I see the Settings page at "/settings"
```
