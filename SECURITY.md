# CarbonCompass AI Security Blueprint

CarbonCompass AI adopts an enterprise-level full-stack security model, strictly complying with OWASP best practices. The app guarantees safe data transmissions, input validation, rate limiting, and private key security.

## 1. Perimeter Protection & Request Hardening

Our Express server (`server.ts`) is fortified using standard defensive layers:

*   **Helmet Headers:** Integrated `helmet()` middleware which customizes security headers, defense against clickjacking and MIME-sniffing, and specifies strict **Content Security Policy (CSP)**.
*   **Strict CORS Policy:** Programmed dynamic host matching to strictly restrict API access, allowing only verified local hosting profiles and standard Google cloud platforms.
*   **Rate Limiting:** Protects the AI endpoint against DDoS attacks using a memory-sweeping, lightweight, clean rate-limiter that isolates abusive users while preventing memory leaks.
*   **Payload Size Restrictions:** Explicitly specifies `15kb` post body limits within `express.json()` to block oversized buffers.

## 2. Parameter Sanitization & Range Checks

To prevent schema exploits, SQL/noSQL injections, or shell command injections, we implement a robust type, categorical, and range checker inside our Express POST endpoints:

1.  **Type Guard Verification:** Asserts that every field exists and is finite.
2.  **Explicit Bounds Validation:** Checks that numeric metrics fall strictly within human thresholds (e.g. car miles per week cannot be less than 0 or greater than 5,000).
3.  **Strict Enums Sanitization:** Enforces categorical selectors to match lists of predefined options (e.g., rejecting arbitrary string inputs for diet types).

## 3. API Key Cryptographic Custody

*   **Server-Side Execution Only:** All prompts and interactions with the Gemini API are executed and completed purely behind our secure Node.js backend. No secret keys are ever exposed to client-side browsers.
*   **Local Env Segregation:** All sensitive variables are declared inside `.env.example` to document keys securely without committing them to git.
