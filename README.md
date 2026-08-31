# EcoTrack

Multi-tenant SaaS for tracking business travel carbon emissions. Node.js/Express/PostgreSQL backend, Next.js/Tailwind frontend.

## Quick Start

Requires Node.js >= 20.9 and PostgreSQL.

```bash
git clone git@github.com:Zahert99/ecotrack.git
cd ecotrack

# Backend
cd backend
npm install
cp .env.example .env      # set DATABASE_URL / JWT_SECRET
npm run migrate:up
npm run dev                # http://localhost:3000

# Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                # http://localhost:3001
```
