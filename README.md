# HawkerCredit Quantum

AI + Quantum-Optimized Alternative Credit Intelligence for street vendors (hawkers), built for SIH.

## Structure

- `backend/` — FastAPI service: auth, vendor/lender/admin APIs, AI credit scoring, QAOA/QUBO quantum portfolio optimization.
- `frontend/` — Next.js (App Router) UI for vendors, lenders, and admins.
- `scripts/generate_demo_data.py` — seeds a demo database directly (bypasses the public API, so it can create ADMIN/LENDER accounts for demo purposes).

See `CHANGELOG.md` for the full list of fixes applied and why.

## Backend setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in JWT_SECRET and STAFF_BOOTSTRAP_SECRET at minimum
uvicorn app.main:app --reload
```

Run tests:

```bash
cd backend
pytest -q
```

### Creating your first ADMIN account

Public registration (`POST /api/v1/auth/register`) only ever creates VENDOR
accounts - this is intentional (see CHANGELOG). To create your first staff
account:

```bash
curl -X POST http://localhost:8000/api/v1/auth/staff/register \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Secret: $STAFF_BOOTSTRAP_SECRET" \
  -d '{"email": "admin@yourorg.com", "password": "...", "role": "ADMIN"}'
```

After that, further staff accounts can be created by an authenticated ADMIN
using their own bearer token instead of the bootstrap secret.

Alternatively, `scripts/generate_demo_data.py` seeds a full demo dataset
(vendors, a lender, an admin) directly into the database for local demos.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Build check:

```bash
npm run build
```

## Key environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list.
At minimum, set `JWT_SECRET` and `STAFF_BOOTSTRAP_SECRET` before any real
deployment - JWT_SECRET is randomly generated per-process (with a warning) if left unset
in development; STAFF_BOOTSTRAP_SECRET is optional in development but should
be set before using bootstrap staff registration. Neither should be left unset
for a real deployment.

## Known limitations

- The credit-scoring model is trained on **synthetic data** - this is
  disclosed throughout the API responses and UI (`training_dataset_type`,
  `production_ready: false`). It has not been validated against real
  hawker vendor repayment outcomes.
- QAOA runs on a simulator (Qiskit Aer) with a bounded qubit budget (see
  `qubo_builder.TOTAL_QUBIT_BUDGET`) to keep runs fast (~1-3s) on
  commodity hardware; this trades off constraint-discretization precision
  for speed, and is documented in the QUBO metadata returned by every run.
  QAOA is an approximate algorithm - its proposals are always re-checked
  by an exact classical validator before being used, and infeasible
  proposals are automatically replaced with the classical solver's exact
  result before reaching a human lender.
- In-memory rate limiting (`slowapi` default) does not share state across
  multiple worker processes/instances - for a real multi-instance
  deployment, back it with Redis via `storage_uri`.
