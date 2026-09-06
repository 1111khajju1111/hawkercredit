# Changelog

## Hackathon hardening — September 5, 2026

- Replaced unweighted portfolio expected-return averages with requested-capital-weighted returns in QAOA and classical benchmark results.
- Kept the canonical business objective aligned with the QUBO objective: sum(expected_return - 2.5 × predicted_risk).
- Corrected the persisted `QuantumRun.algorithm` model comment to use the actual classical algorithms: exact brute force and greedy heuristic.
- Added the missing `frontend/.env.example` with the local API base URL expected by the README.
- Added the project changelog referenced by the README.
- Added a root `.gitignore` for Python caches, test caches, Node dependencies, Next.js build output, and local environment files.
- Removed generated caches and build artifacts from the release archive.
