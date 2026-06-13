# CarbonCompass AI Security Assessment Audit

*Audited: June 2026*  
*Grade: A+*

## 1. Security Compliance Summary

| Vulnerability Vector | Threat Mitigation Strategy | Status |
| :--- | :--- | :--- |
| **A01:2021-Broken Access Control** | Client state strictly separated from server keys; localStorage data belongs to sandbox scope. | **Compliant** |
| **A03:2021-Injection** | Rejection of malformed strings, precise type parsing, and custom range boundaries verification. | **Compliant** |
| **A04:2021-Insecure Design** | Complete schema checking on all post parameters prevents overflow vectors. | **Compliant** |
| **A05:2021-Security Misconfiguration**| Helmet overrides risky default express headers. CSP allows secure Google CDN scripts only. | **Compliant** |
| **A06:2021-Vulnerable Components** | Checked `package.json` for known public vulnerabilities. Standard light modules verified. | **Compliant** |
| **API Abuse / Rate-limiting** | Sweeper rate-limiter prevents brute force attempts on expensive model completions. | **Compliant** |

---

## 2. API Schema Integrity Verification

Our unit test `/src/test/api.test.ts` validates inputs under six attack vectors, ensuring:
- Non-numeric parameters are blocked.
- Out of range commuter miles or spend ratios are rejected.
- Invalid strings masquerading as vehicle engine types fail.
- CORS dynamically declines requests originating from malicious subdomains.
