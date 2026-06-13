# CarbonCompass AI Test Architecture Plan

CarbonCompass AI implements a robust, multi-layer testing matrix centered on the **Vitest** test framework, executing in both Node.js and simulated Browser (JSDOM) environments.

## Testing Core Objectives
The test suites are designed to assure 100% mathematical precision of footprint computations, bulletproof validation on inputs, secure API configurations, and accurate component layout rendering.

## 1. Test Categories Breakdown

We maintain **37 fully green, passing tests** categorized into distinct, focused testing suites:

### 1.1 Carbon Calculation Formulas & Calibration (Unit) - `/src/test/carbon.test.ts`
- **Commuting Metrics:** Correctly maps weekly car commuting miles and public transit to physical metric tons of CO2e.
- **Dietary Calibration:** Assures Hierarchical limits (e.g. Vegetarian/Vegan diets scale lower than heavy meat eaters).
- **Clean Energy Baselines:** Validates that 100% clean power eliminates home electricity carbon footings.
- **Waste & Recycling Scaling:** Confirms custom bag totals reduce dynamically with recyclability gains.
- **Index Risk Categories:** Calibrates risk boundaries to assign "Low", "Medium", and "High" levels.
- **Score Mapping Calibration:** Matches perfect zero ratings to excessive boundaries, and linear metrics on mid-ranges.

### 1.2 Interactive Simulation Engine (Integration) - `/src/test/carbon.test.ts`
- **Null Sliders Bounds:** Assures zero savings if no sliders are touched.
- **Commuter Commits:** Tests cost and emission savings during transit upgrade profiles.
- **Lifestyle Aggregates:** Confirms overall aggregates are cumulative and additive.
- **CRUD Checkpoint Snapshot:** Confirms creating, deleting, and clearing checkpoint lists is completely leak-free.
- **Streak Counters Decay:** Tests active streaks retention for same-day operations and decay conditions.

### 1.3 Server-Side Security & Web API Validation (Integration) - `/src/test/api.test.ts`
- **Dynamic CORS Origin assertions:** Simulates standard secure domains and rejects malicious ones.
- **Payload Strict validations:** Tests schemas, types, and finite ranges validation filters.
- **Boundary parameters rejection:** Fails inputs with numeric out-of-bounds metrics.

### 1.4 React Component Layout Rendering (JSDOM) - `/src/test/rendering.test.tsx`
- **Dashboard Displays:** Verifies `TwinDashboard` renders with custom parameters and structural charts.
- **What-If Interface:** Confirms active simulator panels render action lists properly.
- **Histories & Progress:** Verifies `ProgressTracker` renders historical data checkouts.

### 1.5 DOM Interactions & Backup Events (JSDOM) - `/src/test/dom.test.tsx`
- **Slider Change Triggers:** Confirms moving sliders updates analytics and streaks hook callbacks.
- **Action Submissions:** Confirms creating list checkpoints submits clean snapshot values correctly.
- **Profile backups:** Verifies profile export clicks trigger local JSON file generation.

## 2. Test Command Execution
Run the following terminal commands to execute the test matrix:
```bash
# Run all tests once
npx vitest run

# Run tests in hot reload watchlist mode
npx vitest
```
