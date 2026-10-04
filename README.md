# CRMind — TTP CRM

An AI-assisted sales CRM for small teams. CRMind keeps leads, contacts, the deal pipeline, notes and follow-ups in one place, then layers Google Gemini on top to summarise leads, draft outreach emails and surface pipeline insights.

> Built with React + Vite on the front end and Express + MongoDB on the back end.

---

## The idea

Most small sales teams live in spreadsheets and inboxes. Full CRMs are heavy, expensive and slow to set up. CRMind aims for the middle ground:

- **Everything a rep touches daily, on one screen** — pipeline value, new leads, win rate, upcoming follow-ups.
- **A visual pipeline** — drag deals between stages (New → Qualified → Proposal → Won / Lost).
- **AI as a co-pilot, not a gimmick** — one click to summarise a lead, draft a follow-up email, or get a health check on the whole pipeline.
- **A formal, calm interface** — almond canvas, evergreen primary, lime and pigeon-grey accents, IBM Plex type.

## Features

| Area | What you get |
|------|--------------|
| **Dashboard** | KPI strip (pipeline value, revenue won, total leads, win rate), monthly/annual lead-acquisition chart, closed-revenue trend, recent activity, pipeline by stage, leads by source, top open deals, top contacts |
| **Leads** | Searchable, filterable, sortable table; bulk actions; detail drawer; create/edit dialogs |
| **Pipeline** | Kanban board with drag-and-drop between stages and manual ordering |
| **Contacts** | Contact directory with tags, favourites and company info |
| **Notes** | Notes linked to leads/contacts, with pinning |
| **Follow-ups** | Tasks with due dates, priority, status and overdue tracking |
| **AI (Gemini)** | Lead summaries, email drafting, pipeline sales insights (with model fallback) |
| **Auth** | JWT-based register / login, profile settings; every record is scoped to its owner |

## Tech stack

**Frontend** — React 19, Vite, Tailwind CSS v4, React Router, Recharts, dnd-kit, react-hook-form, axios, sonner, lucide-react

**Backend** — Node.js, Express, MongoDB + Mongoose, JWT + bcrypt, `@google/genai`

## Project structure

```
CRMind/
├── Backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handlers (auth, leads, contacts, notes, tasks, ai, analytics)
│   ├── middleware/      # Auth guard, error handler
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers mounted under /api
│   ├── utils/           # ApiError, token helper, shared CRUD factory
│   ├── seed.js          # Demo account + sample data
│   └── server.js        # App entry point
└── Frontend/
    └── AICRMDashboard/
        └── src/
            ├── components/  # UI primitives, layout (sidebar, top bar), feature components
            ├── context/     # Auth context
            ├── lib/         # API client, services, constants, formatters
            └── pages/       # Dashboard, Leads, Pipeline, Contacts, Notes, Tasks, Settings, auth
```

## Getting started

### Prerequisites

- Node.js 20+ (developed on Node 24)
- A MongoDB database (local, or MongoDB Atlas — make sure your IP is on the Atlas allow-list)
- A Google Gemini API key (optional — only needed for the AI features)

### 1. Clone

```bash
git clone <your-repo-url> CRMind
cd CRMind
```

### 2. Backend

```bash
cd Backend
npm install
cp .env.example .env      # then fill in the values
npm run seed              # optional: create the demo account + sample data
npm run dev               # http://localhost:8000
```

**`Backend/.env`**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URL` | yes | — | MongoDB connection string |
| `JWT_SECRET` | yes | — | Secret used to sign auth tokens |
| `JWT_EXPIRES_IN` | no | `7d` | Token lifetime |
| `PORT` | no | `8000` | API port |
| `CLIENT_URL` | no | `http://localhost:5173` | Allowed CORS origin (required in production) |
| `NODE_ENV` | no | — | Set to `production` in production |
| `GEMINI_API_KEY` | for AI | — | Google Gemini API key |
| `GEMINI_MODEL` | no | `gemini-3.8-flash` | Primary Gemini model |
| `GEMINI_FALLBACK_MODEL` | no | `gemini-flash-lite-latest` | Used if the primary model fails |

### 3. Frontend

```bash
cd Frontend/AICRMDashboard
npm install
npm run dev               # http://localhost:5173
```

The frontend calls `http://localhost:8000/api` by default. To point it elsewhere, create `Frontend/AICRMDashboard/.env`:

```env
VITE_API_URL=https://your-api.example.com/api
```

### Demo account

After `npm run seed`, sign in with:

- **Email:** `alex@timetoprogram.com`
- **Password:** `Test@1234`

Re-running the seed resets only the demo user's data.

## Scripts

| Location | Command | What it does |
|----------|---------|--------------|
| `Backend` | `npm run dev` | Start the API with nodemon (auto-reload) |
| `Backend` | `npm start` | Start the API with node |
| `Backend` | `npm run seed` | Reset and seed the demo account |
| `Frontend/AICRMDashboard` | `npm run dev` | Start the Vite dev server |
| `Frontend/AICRMDashboard` | `npm run build` | Production build into `dist/` |
| `Frontend/AICRMDashboard` | `npm run preview` | Serve the production build locally |
| `Frontend/AICRMDashboard` | `npm run lint` | Run ESLint |

## API overview

All routes are prefixed with `/api`. Everything except register/login requires an `Authorization: Bearer <token>` header.

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile` |
| Leads | `GET/POST /leads`, `GET/PUT/DELETE /leads/:id`, `PATCH /leads/reorder` |
| Contacts | `GET/POST /contacts`, `GET/PUT/DELETE /contacts/:id` |
| Notes | `GET/POST /notes`, `GET/PUT/DELETE /notes/:id` |
| Tasks | `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:id` |
| Analytics | `GET /analytics/overview` |
| AI | `GET /ai/status`, `POST /ai/lead-summary`, `POST /ai/generate-email`, `POST /ai/sales-insights` |

## Roadmap

Done:

- [x] Auth, owner-scoped CRUD for leads, contacts, notes and tasks
- [x] Kanban pipeline with drag-and-drop
- [x] Analytics dashboard
- [x] Gemini lead summaries, email drafts and sales insights
- [x] Formal CRM redesign (sidebar shell, almond/evergreen theme)

Planned:

- [ ] Team workspaces with roles (admin / rep) and shared pipelines
- [ ] Email and calendar integration (send drafts, sync follow-ups)
- [ ] CSV import / export for leads and contacts
- [ ] Activity timeline per lead
- [ ] Server-side aggregation for analytics at larger data volumes
- [ ] Automated tests and CI
- [ ] Deployment guide (e.g. Render/Railway for the API, Vercel/Netlify for the UI)

## License

Released under the [MIT License](LICENSE).
