# CloudCost Sentinel — Phase 2: Backend Setup

This covers Express + TypeScript + Prisma + PostgreSQL + Redis + Docker.
No business logic yet (no login, no budgets) — that starts in Phase 3.
The goal of Phase 2 is purely: **a server that boots, connects to its
database and cache, and proves it with one real endpoint.**

## What's in here, and why

```
cloudcost-sentinel/
├── docker-compose.yml         Starts postgres + redis + api together
└── apps/api/
    ├── prisma/schema.prisma   The full database schema (all entities from Phase 1)
    ├── src/
    │   ├── config/
    │   │   ├── env.ts          Loads & validates environment variables — every
    │   │   │                   other file asks THIS file for config, never
    │   │   │                   process.env directly.
    │   │   ├── prisma.ts        One shared Prisma client (singleton). Creating
    │   │   │                   `new PrismaClient()` in multiple files opens
    │   │   │                   multiple connection pools — a classic mistake.
    │   │   ├── redis.ts         One shared Redis client (same reasoning).
    │   │   └── jwt.ts           Sign/verify helpers for Phase 3. Not wired into
    │   │                       any route yet — just the plumbing.
    │   ├── middlewares/
    │   │   ├── errorHandler.ts  Every error in the app ends up here. One place
    │   │   │                   to decide what the client sees.
    │   │   └── notFound.ts      Catches requests to routes that don't exist.
    │   ├── routes/
    │   │   ├── health.routes.ts The one real endpoint: GET /api/v1/health.
    │   │   │                   Round-trips to Postgres AND Redis and reports both.
    │   │   └── index.ts         Combines all route modules. app.ts only ever
    │   │                       imports this — never individual route files.
    │   ├── utils/
    │   │   ├── logger.ts         Thin wrapper around console — one place to
    │   │   │                    swap in a real logging library later.
    │   │   ├── AppError.ts       Custom error class carrying an HTTP status code.
    │   │   └── asyncHandler.ts   Wraps async controllers so thrown errors reach
    │   │                        errorHandler.ts instead of hanging the request.
    │   ├── app.ts                Assembles the Express app (middleware order
    │   │                        matters — see comments in the file).
    │   └── server.ts             The ONLY file that calls app.listen(). Also
    │                            handles graceful shutdown on Ctrl+C.
    ├── tests/health.test.ts      Proves the whole chain (app → Postgres,
    │                            app → Redis) actually works.
    ├── Dockerfile
    └── .env.example              Copy to .env and fill in real values.

controllers/, services/, repositories/, validators/, types/, dtos/ exist as
empty folders — they stay empty until Phase 3, when there's actual business
logic to put in them. An empty folder structure with nothing to put in it
yet is just noise; we add files when we have a real reason to.
```

## How to run it

```bash
cd cloudcost-sentinel/apps/api
cp .env.example .env
# edit .env if you want different secrets (optional for local dev)

cd ../..                     # back to the cloudcost-sentinel root
docker-compose up --build
```

Then in another terminal:
```bash
curl http://localhost:4000/api/v1/health
```
You should get back:
```json
{"success":true,"checks":{"database":"ok","redis":"ok"},"timestamp":"..."}
```

If `database` or `redis` come back `"down"`, the API container started
before Postgres/Redis finished booting, or your `.env` values don't match
docker-compose.yml's service names. The compose file's `depends_on` with
`condition: service_healthy` should prevent this, but it's the first thing
to check.

### Running without Docker (closer to how you've been working on OneCampus)

```bash
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init     # creates all the tables from schema.prisma
npm run dev
```
This needs Postgres and Redis running somewhere reachable at the URLs in
your `.env` — you can still get those two from Docker alone:
```bash
docker-compose up -d postgres redis
```

## How to test it

```bash
cd apps/api
docker-compose up -d postgres redis   # tests hit real services, not mocks
npm test
```

Two tests run: one proves `/health` returns `200` with both checks `"ok"`,
one proves an unknown route returns a clean `404` JSON shape instead of
Express's default HTML error page.

## Common mistakes at this stage

- **Forgetting `npx prisma generate` after editing schema.prisma.** Prisma
  generates a typed client from your schema — if you change a model and
  don't regenerate, TypeScript will be checking against the OLD shape and
  you'll get confusing type errors that have nothing to do with your actual
  bug.
- **Creating a new PrismaClient or Redis client in a random file** instead
  of importing the ones from `config/`. It'll work, but you've now got two
  separate connection pools doing the same job — wasteful and confusing to
  debug later.
- **Putting business logic in `app.ts`.** This file should only ever wire
  middleware and routers together. If you find yourself writing an `if`
  statement about budgets in here, it belongs in a controller/service in
  Phase 3 instead.
- **Committing `.env`.** It's gitignored already, but double check before
  your first commit — this is the #1 way student projects leak secrets on
  GitHub.

## Next: Phase 3 — Authentication

Register, login, refresh tokens, password reset, email verification, and
the RBAC middleware that reads the `role` field from `User` and gates
routes by it. The JWT helpers in `config/jwt.ts` get used for the first
time there.
