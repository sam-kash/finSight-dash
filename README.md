# Finsight-dash

> A financial data processing and access control backend. -> Fintech of its own

---

## What This Is

Finsight-dash is a production-minded REST API backend for a multi-role finance dashboard system. It handles financial record management, role-based access control, aggregated dashboard analytics, and a complete audit trail — the kind of infrastructure you'd expect in a real financial product, not a toy CRUD app.

The goal was not just to meet the assignment checklist, but to think about what a backend for a finance system actually needs to be trustworthy, observable, and extensible.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js + TypeScript | Type safety across the entire codebase, strong fintech ecosystem |
| Framework | Express.js | Lightweight, explicit, no magic |
| ORM | Prisma | Type-safe DB queries, clean schema-first modeling |
| Database | PostgreSQL 15 | ACID compliance, production-grade for financial data |
| Validation | Zod | Schema-first validation with automatic TypeScript type inference |
| Auth | JWT (jsonwebtoken) | Stateless, scalable authentication |
| Infrastructure | Docker + Docker Compose | Reproducible local environment, volume-mounted persistence |

---

## Architecture

```
src/
├── config/
│   └── env.ts               # Zod-validated environment variables
├── db/
│   └── prisma.ts            # Prisma client singleton
├── middlewares/
│   ├── authenticate.ts      # JWT verification → attaches user to request
│   ├── authorize.ts         # Permission matrix enforcement
│   └── errorHandler.ts      # Global error handler (Zod + ApiError + unknown)
├── modules/
│   ├── auth/                # Register, login, JWT issuance
│   ├── users/               # User management, role + status updates
│   ├── records/             # Financial records CRUD with filtering + pagination
│   ├── dashboard/           # Aggregated analytics and financial intelligence
│   └── audit/               # Immutable audit log for all record mutations
├── types/
│   └── express.d.ts         # Extended Express Request with typed user context
└── utils/
    └── ApiError.ts          # Typed error class for consistent error responses
```

Each module owns its router, service, and schema. Routers handle HTTP — they validate input and delegate to services. Services handle business logic — they know nothing about HTTP. This separation means business rules are testable in isolation and routes stay thin.

---

## Data Model

```prisma
User         → has a Role (VIEWER | ANALYST | ADMIN), isActive flag
Record       → financial entry with soft delete, linked to creator
AuditLog     → immutable log of every CREATE / UPDATE / DELETE on a Record
```

### Why soft deletes

Financial records should never be hard-deleted. In any real finance system, deleting data creates compliance and reconciliation problems. Soft delete (`isDeleted: true`) keeps the record in the database, invisible to normal queries, but fully traceable in the audit log. This is standard practice in fintech.

### Why an audit log

Every mutation to a financial record — who did it, when, and what changed — is logged as a separate `AuditLog` entry. For UPDATE operations, both the `before` and `after` state are stored as JSON. This gives you a complete, immutable history of any record. You can answer "what did this record look like 3 weeks ago and who changed it" with a single query.

---

## Role-Based Access Control

Permissions are defined as a matrix in a single file (`middlewares/authorize.ts`), not scattered across route handlers.

| Permission | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| `record:read` | ✅ | ✅ | ✅ |
| `dashboard:read` | ❌ | ✅ | ✅ |
| `record:write` | ❌ | ❌ | ✅ |
| `record:delete` | ❌ | ❌ | ✅ |
| `user:manage` | ❌ | ❌ | ✅ |
| `audit:read` | ❌ | ❌ | ✅ |

Routes declare their required permissions explicitly:

```ts
router.post('/', authorize('record:write'), handler)
router.get('/summary', authorize('dashboard:read'), handler)
```

Adding a new role or permission means editing one object. Nothing else changes.

---

## API Reference

### Auth
```
POST   /api/auth/register     Register a new user
POST   /api/auth/login        Login and receive a JWT
```

### Users
```
GET    /api/users/me          Get current authenticated user
GET    /api/users             List all users [admin]
PATCH  /api/users/:id/role    Update a user's role [admin]
PATCH  /api/users/:id/status  Activate or deactivate a user [admin]
```

### Records
```
POST   /api/records           Create a financial record [admin]
GET    /api/records           List records with filters + pagination
GET    /api/records/:id       Get a single record
PATCH  /api/records/:id       Update a record [admin]
DELETE /api/records/:id       Soft delete a record [admin]
```

**Supported query parameters for `GET /api/records`:**

| Param | Type | Example |
|---|---|---|
| `type` | `INCOME` \| `EXPENSE` | `?type=EXPENSE` |
| `category` | string | `?category=salary` |
| `from` | ISO datetime | `?from=2026-01-01T00:00:00.000Z` |
| `to` | ISO datetime | `?to=2026-03-31T23:59:59.999Z` |
| `page` | number | `?page=2` |
| `limit` | number | `?limit=20` |

### Dashboard
```
GET    /api/dashboard/summary       Overall financial health
GET    /api/dashboard/comparison    This month vs last month with % change
GET    /api/dashboard/by-category   Income and expense breakdown by category
GET    /api/dashboard/trends        Monthly income/expense/net for last 6 months
GET    /api/dashboard/burn-rate     Daily spend rate and projected remaining spend
GET    /api/dashboard/recent        Last 10 transactions with running balance
```

All dashboard endpoints require `dashboard:read` permission (ANALYST or ADMIN).

### Audit
```
GET    /api/audit                   Full audit log [admin]
GET    /api/audit/record/:id        Complete mutation history for one record [admin]
```

---

## Dashboard Intelligence — What Each Endpoint Actually Does

### `/summary`
Returns total income, total expenses, net balance, savings rate (%), total record count, and a `balanceStatus` of `SURPLUS` or `DEFICIT`. The savings rate is `(netBalance / totalIncome) * 100` — a standard personal finance metric.

### `/comparison`
Computes this month vs last month totals for income, expenses, and net — then calculates the percentage change for each. Useful for trend awareness at a glance. Handles edge cases like zero-activity months without crashing.

### `/by-category`
Uses Prisma's `groupBy` to aggregate at the database level (not in application memory). Returns categorized income and expense totals with transaction counts, plus an `insight` block surfacing the top expense category automatically.

### `/trends`
Returns 6 months of `{ label, income, expenses, net }` data suitable for direct rendering in a chart library. Uses a single database query for the full 6-month window and distributes records into month buckets in application code — 1 query instead of 6.

### `/burn-rate`
Rolling 30-day expense window (not a calendar month). Computes daily burn rate, projected monthly spend, and projected remaining spend for the rest of the current month. This is a forward-looking metric — it tells you where you're headed, not just where you've been.

### `/recent`
Last 10 transactions ordered by date descending, each annotated with a `runningBalance` field — exactly like a bank statement. The balance is computed incrementally as records are iterated, so no additional queries are needed.

---

## Setup and Running Locally

### Prerequisites
- Node.js 18+
- Docker and Docker Compose

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/finsight-dash.git
cd finsight-dash

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env if needed — defaults work out of the box with Docker

# 4. Start PostgreSQL
docker compose up -d

# 5. Run database migrations
npx prisma migrate dev

# 6. Start the development server
npm run dev
```

Server runs at `http://localhost:3000`.

### Environment Variables

```env
DATABASE_URL="postgresql://finance_user:finance_pass@localhost:5432/finance_db"
JWT_SECRET="your-secret-key-min-10-chars"
JWT_EXPIRES_IN="7d"
PORT=3000
```

Environment variables are validated on startup using Zod. The server will exit immediately with a clear error message if any required variable is missing or malformed — no silent misconfigurations.

---

## Error Handling

All errors flow through a single global error handler. Three categories are handled distinctly:

**Zod validation errors** → `400` with field-level detail:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "amount", "message": "Amount must be positive" }
  ]
}
```

**Known API errors** → appropriate status code with a clear message:
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

**Unknown errors** → `500` with no internal detail leaked to the client, logged server-side.

---

## Security Considerations

- Passwords are hashed with `bcrypt` at cost factor 12 before storage. The raw password never touches the database.
- `passwordHash` is excluded from every Prisma `select` block. It is never returned in any API response under any circumstance.
- JWT payloads contain only `id`, `email`, and `role` — the minimum needed to authenticate and authorize a request.
- Permission checks happen in middleware before any business logic runs. A VIEWER cannot trigger record creation code at all — they never reach the service layer.
- Soft deletes mean financial data is never permanently destroyed, which is both a data integrity and a compliance consideration.

---

## Assumptions Made

- **Role assignment on registration is open for development purposes.** In a real system, the `role` field on registration would be removed and all new users would default to `VIEWER`. An admin would promote them. This is documented rather than silently restricted so the assignment is easier to test.
- **Single-tenant system.** Records are not scoped to an organization. Adding multi-tenancy would require a `Workspace` or `Organization` model and filtering all queries by `workspaceId`.
- **Audit logs are append-only by design.** There is no endpoint to delete or modify audit logs. This is intentional.
- **Decimal precision is set to (12, 2).** This supports amounts up to 999,999,999,999.99 — sufficient for most individual and small business use cases.

---

## Tradeoffs

| Decision | Tradeoff |
|---|---|
| SQLite was replaced with PostgreSQL | More setup required, but ACID compliance and `Decimal` type support are non-negotiable for financial data |
| Trends use one query + in-app bucketing | Slightly more application code, but 6x fewer database round trips vs querying per month |
| Audit log stores full JSON snapshots | Higher storage usage over time, but complete reconstructability of any record's history |
| Soft delete over hard delete | Records are never reclaimed, but financial data integrity is preserved |
| Permission matrix in one file | Less "magical" than decorators, easier to audit and reason about |

---

## What I Would Add With More Time

- **Pagination on audit logs** — currently capped at 100 entries
- **Rate limiting** — `express-rate-limit` per user per route
- **Integration tests** — full request/response cycle tests using `supertest`
- **Refresh tokens** — currently JWTs are long-lived (7d); a refresh token pattern would be more secure
- **Multi-currency support** — a `currency` field on records with an `exchangeRate` snapshot at time of entry
- **Webhooks** — notify external systems when records cross a threshold or when burn rate exceeds a configured limit

---

## Author
Sankalpa Kashyap