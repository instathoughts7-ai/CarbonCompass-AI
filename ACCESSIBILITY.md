# CarbonCompass AI Accessibility Compliance Report

CarbonCompass AI is built for maximum inclusion, following the **WCAG 2.2 Level AA guidelines** to ensure that our application is highly accessible to all users.

## 1. Multi-Modal Accommodations

### 1.1 Screen Reader Summaries (WCAG SC 1.1.1)
While the SVG emissions trend chart provides intuitive visual feedback for sighted users, we implement an alternative textual list styled with **`sr-only` (screen-reader only)** Tailwind classes. Visually impaired users using screen readers hear a natural, chronological description of their footprint checkpoint names, dates, carbon score indices, and absolute emissions.

### 1.2 Contrast & Text Resizing Sizing (WCAG SC 1.4.3)
We utilize high-contrast slate colors (`text-slate-800`, `text-slate-900`) and deep emerald labels on off-white backgrounds. We avoid thin gray text lines to guarantee comfortable readability across different screens and brightness levels. Text containers adapt dynamically to layout resizing.

### 1.3 ARIA Roles & Landmark Landmarks (WCAG SC 1.3.1)
- **Document Landmarks:** Main screen blocks are enclosed in native HTML structural layouts like `<main>`, `<aside>`, `<header>`, and `<footer>` with explicit `aria-label="Tab panels"` parameters.
- **Form Controls:** All textual inputs and range selectors have corresponding `<label for="...">` parameters, ensuring screen readers can announce form purposes accurately.
- **Icons Accessibility:** Informational icons are styled with `aria-hidden="true"`, ensuring screen readers do not read decorative vector paths.

## 2. Keyboard Interactivity & Navigation (WCAG SC 2.1.1)
*   **Logical Focus Order:** Users can navigate between assessment forms, slider inputs, and action buttons using standard tab actions.
*   **Active Hover Feedback:** Hover states feature distinct outline accents to clearly indicate currently active interactable fields.
