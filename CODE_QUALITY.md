# CarbonCompass AI Code Quality Standards

CarbonCompass AI complies with the highest software engineering metrics by emphasizing strict type safety, modular structures, and absolute separation of concerns.

## 1. Architectural Highlights

### 1.1 Strict Typings (No `any` assertions)
Every object, callback, event handler, and enum in the codebase is fully, explicitly typed. There are **zero `any` type annotations** in the `/src` folder, eliminating silent runtime errors and reinforcing compile-time predictability.

### 1.2 Separation of Concerns
We decouple core features into dedicated, reusable layers:
- **`lib/carbonCompute.ts`:** Holds pure, math-oriented formulas, rendering calculations functional and highly testable.
- **`services/storageService.ts`:** Encapsulates local persistence, handling parsing safety.
- **`hooks/`:** Custom hooks manage state lifecycles:
  - `useCarbonAnalysis`: Handles form fields, twin scores computation, and AI coach prompt states.
  - `useStreakTracker`: Manages streaks, day limits, and action thresholds.
  - `useSnapshotHistory`: Manages checkpoints and progress history snapshots.

### 1.3 DRY (Don't Repeat Yourself)
Core calculations are unified in the computation services and mapped to custom Hooks. For example, the `useCarbonAnalysis` hook memoizes the computed twin representation with `useMemo`, ensuring calculations run only on actual assessment changes and eliminating redundant compute cycles.
`App.tsx` behaves as a high-level router/shell, avoiding complex nested logic.
