# Presight Frontend Exercise

## Getting Started

### Prerequisites

- Node.js 22+ (better-sqlite3 needs Node 20–26)
- npm 9+ (workspaces support)

### Local setup

```bash
npm install        # installs root, client, and server workspace dependencies
npm run seed       # creates server/data/app.db and seeds 10,000 users (skips if already seeded)
npm run dev        # starts the API on :3001 and the Vite client on :5173
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the Express server, so no extra configuration is needed.

To re-seed from scratch, delete `server/data/` and run `npm run seed` again. Seeding uses a fixed faker seed (42), so the dataset is deterministic.

### Tests

```bash
npm test           # server API tests (vitest + supertest against an in-memory SQLite DB)
```

The tests cover filter semantics (hobbies AND / nationalities OR), LIKE-wildcard escaping, deterministic sort with the id tie-breaker, pagination without duplicates or gaps, top-20 facet counts under active filters, and parameter validation.

### Running with Docker Compose

```bash
docker compose up --build
```

Open http://localhost:3000. A single container builds both workspaces, serves the client statics from Express, and seeds the SQLite database into a named volume on first start (restarts reuse the existing data). `docker compose down -v` removes the volume for a fresh seed.

### Architecture notes

- **Stack**: React 19 + TanStack Query/Virtual + Tailwind 4 (client); Express 5 + better-sqlite3 (server); npm workspaces monorepo.
- **Data model**: normalized SQLite schema (`users`, `hobbies`, `user_hobbies`) so the hobbies-AND filter and facet counts are plain indexed `GROUP BY` queries.
- **API**: `GET /api/users` (search, `nationality`/`hobby` repeated params, whitelisted sort + `id` tie-breaker, offset pagination with `total`/`hasMore`), `GET /api/hobbies/top`, `GET /api/nationalities/top` — the facet endpoints share the exact WHERE builder with the list endpoint, so top-20 counts always reflect the active filter state.
- **Facet semantics**: per the spec, top-20 counts apply _all_ active filters, including the facet's own selections — for hobbies (AND) each count is a drill-down preview of "results if you add this hobby". Selected values are always rendered in the sidebar even when they drop out of the top 20, so they stay removable.
- **URL state**: the query string (`search`, `hobby`, `nationality`, `sortBy`, `sortDir`) is the single source of truth; reloading or sharing a URL restores the view.

---

## Original Brief

Build a small full-stack user directory application. The goal is to evaluate how you design a searchable, filterable, paginated UI backed by persisted data and clear API boundaries.

The application should include:

- A React client.
- A Node.js API server.
- A SQLite database used as the source of truth for user data.
- Docker configuration for running the application locally.

## Scenario

Users need to browse a large directory of people, search by name, and narrow results by nationality and hobbies. The filter sidebar should help users discover useful filters based on the result set they are currently viewing.

## Requirements

### Data Model

Seed a SQLite database with enough records to make pagination, infinite scroll, search, and filter counts meaningful.

Each user should have:

- `avatar`
- `first_name`
- `last_name`
- `age`
- `nationality`
- `hobbies`, from 0 to 10 hobbies per user

Choose a data model that supports the required behavior.

SQLite must be the persisted source of user data.

### API

Expose an API that supports:

- Paginated user results.
- Text filtering from user input across `first_name` and `last_name`.
- Filtering by one or more nationalities.
- Filtering by one or more hobbies.
- Sorting by `first_name`, `last_name`, `age`, and `nationality`.
- Pagination metadata so the client can determine whether more results are available.
- Top 20 hobbies for the active text filter and filter state, including `{ value, count }`.
- Top 20 nationalities for the active text filter and filter state, including `{ value, count }`.

The top 20 values and counts must reflect the currently applied text filter and selected filters, not the global dataset.

Filter semantics:

- Multiple selected hobbies should match users who have all selected hobbies.
- Multiple selected nationalities should match users from any selected nationality.
- Text, hobby, and nationality filters should apply together.

Sorting semantics:

- Sorted results must be deterministic. Use `id` as a final tie-breaker when values are equal.
- Pagination must respect the active sort without duplicate or missing users.

### Client

Build a React interface that includes:

- A text filter input for `first_name` and `last_name`.
- A virtualized, infinitely scrolling list of user cards.
- A sidebar containing the top 20 hobbies and top 20 nationalities for the current result set, including counts.
- Controls for applying and removing hobby and nationality filters.
- Controls for choosing sort field and sort direction.
- Loading, empty, and error states.
- A responsive layout that remains usable on desktop and mobile.

User cards should follow this structure:

```text
|----------------------------------|
| avatar      first_name+last_name |
|             nationality      age |
|                                  |
|             (2 hobbies) (+n)     |
|----------------------------------|
```

Show up to 2 hobbies on the card. If the user has more hobbies, display the remaining count as `+n`.

Use a virtual scroll implementation for the list.

When the text filter or selected filters change, the client must refresh both:

- The paginated user list.
- The top 20 hobbies and nationalities in the sidebar.

The text filter value, selected hobbies, selected nationalities, sort field, and sort direction must be reflected in the URL query string. Reloading or sharing the URL should restore the same view state.

## Implementation Notes

- Keep the database setup easy to run locally.
- Include seed logic or a documented command that creates the SQLite database.
- Include a `Dockerfile` and `docker-compose.yml` that can run the application locally.

## Evaluation Focus

We will pay particular attention to:

- Correct data persistence and API behavior.
- Correct filtering, sorting, pagination, and top 20 counts.
- Smooth infinite scrolling with virtualization.
- URL-synced state.
- Clear loading, empty, and error states.
- Easy local and Docker-based setup.

## Deliverables

Please provide:

- Source code for the React client and Node.js server.
- A `Dockerfile` and `docker-compose.yml`.
- Instructions for setup, database seeding, and running locally.
- Instructions for running with Docker Compose.
