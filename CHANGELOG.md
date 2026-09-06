# Unreleased – Demo UX & Lender Intelligence

- Fixed lender dashboard vendor-pool summary and persisted 100-vendor synthetic demo visibility.
- Added enriched vendor discovery fields: score, risk, repayment probability, data quality and requested loan.
- Fixed lender access to explainable vendor profiles; discovery links now pass the selected vendor ID.
- Added a first-class human underwriting queue with approve/reject actions and audit persistence.
- Reused persisted QAOA/classical benchmark results to avoid duplicate quantum simulations and long benchmark waits.
- Added SHAP contribution visualization and model-governance language to explainable credit profiles.

# Changelog

## Hackathon hardening — September 5, 2026

- Replaced unweighted portfolio expected-return averages with requested-capital-weighted returns in QAOA and classical benchmark results.
- Kept the canonical business objective aligned with the QUBO objective: sum(expected_return - 2.5 × predicted_risk).
- Corrected the persisted `QuantumRun.algorithm` model comment to use the actual classical algorithms: exact brute force and greedy heuristic.
- Added the missing `frontend/.env.example` with the local API base URL expected by the README.
- Added the project changelog referenced by the README.
- Added a root `.gitignore` for Python caches, test caches, Node dependencies, Next.js build output, and local environment files.
- Removed generated caches and build artifacts from the release archive.


## Model monitoring + demo population fix
- Added idempotent persisted-model registration at API startup.
- Admin `/api/v1/admin/metrics` now reports the ACTIVE persisted model metrics.
- Added 10 demo lender accounts.
- Kept the demo dataset at exactly 100 vendor profiles.
- Persisted the complete 2,000-row synthetic model dataset size in model metadata.
