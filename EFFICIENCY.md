# CarbonCompass AI System Efficiency Design

CarbonCompass AI is engineered for high performance, utilizing smart caching, lazy computations, and minimal server footprint. We achieve sub-millisecond local responses and secure, low-latency AI interactions.

## 1. AI API Completion Proxy Caching

To reduce Gemini API costs, network latency, and protect against rate limit exhaustion, the backend server implements an in-memory caching layer:
- **Hashing Inputs:** The `/api/insights` endpoint hashes the submitted footprint assessment.
- **Cache Hits:** If the user requests advice for an identical or minorly changed assessment, the server immediately returns the cached insights markdown, completing the request instantly without a roundtrip to Gemini.
- **Cache Eviction:** To keep server memory footprint bounded, an automated sweeper prunes the oldest cached insights if the cache size exceeds 100 entries.

## 2. Computational Memoization in React

Every footprint update computes a fresh Carbon Compass profile. To maximize performance:
- We utilize **`useMemo`** inside our hooks to calculate the twin profile. Calculations are only triggered when the underlying assessment dimensions actually change.
- Component layouts utilize **`React.memo`** to prevent redundant sub-tree re-renders when parent states change.

## 3. Highly Optimized Vector Metrics
Instead of importing heavy chart frameworks, the performance tracker implements a custom, **lightweight SVG render engine**. It computes path curves and coordinates mathematically in-memory and renders them instantly as vector nodes, guaranteeing perfect frame rates under both mobile and desktop screens.
