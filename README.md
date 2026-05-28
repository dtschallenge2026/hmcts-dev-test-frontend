# HMCTS Task Manager - Frontend

A task management web app for HMCTS caseworkers, built with Node.js, Express and Nunjucks on top of the GOV.UK Design System. It talks to the [HMCTS Task Manager backend API](https://github.com/dtschallenge2026/hmcts-dev-test-backend) over REST.

> This is the frontend for the [HMCTS DTS Developer challenge](https://github.com/hmcts/dts-developer-challenge), built on the official HMCTS `expressjs-template`.

## Stack

The challenge allows any framework, but I've deliberately used the HMCTS DTS team's own frontend stack rather than my day-to-day stack (React). Working in their ecosystem felt like the right call for a submission that'll be reviewed by that team.

| Concern | Choice |
|---|---|
| Runtime | Node.js 18+ |
| Language | TypeScript |
| Web framework | Express 4 |
| Templating | Nunjucks |
| UI | GOV.UK Frontend (Design System) |
| HTTP client | Axios |
| Build | Webpack |
| Package manager | Yarn (Berry / 3.x) |
| Containers | Docker + Docker Compose |

## Architecture

Server-rendered Express app - no client-side SPA framework. Routes call the backend API and render Nunjucks views using GOV.UK components.

Notable behaviours:

- Full CRUD - list, view, create, edit (status), and delete tasks against the API
- `GET /tasks/:id` renders a task detail page; shows a 404 view if the task doesn't exist or has been deleted
- `/` redirects to `/tasks`
- The create form uses the `govukDateInput` pattern with separate day/month/year and hour/minute fields, assembled and validated server-side. Validation covers non-numeric input, out-of-range values, and impossible dates (e.g. 31 June), with an error summary and field-value retention on failure
- A custom `formatDate` Nunjucks filter renders dates as e.g. "5 June 2026 at 09:00"

## Prerequisites

- Docker (Docker Desktop or Engine + Compose) for the one-command run, or
- Node.js 18+ and Yarn for local development
- A running instance of the backend API (see the backend repository)

## Running with Docker (recommended)

Start the backend first (see the backend repo's `docker compose up`), then from this repo's root:

```bash
docker compose up --build
```

App is available at http://localhost:3100.

The frontend reaches the backend via `host.docker.internal`, set in `docker-compose.yml`:

```yaml
environment:
  BACKEND_URL: http://host.docker.internal:4000
```

```bash
docker compose down
```

## Running locally

```bash
yarn install
yarn build
yarn start:dev
```

App is available at http://localhost:3100.

### Configuration

| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `http://localhost:4000` | Base URL of the backend API |

```bash
BACKEND_URL=http://localhost:4000 yarn start:dev
```

## Tests

### Unit and route tests (Jest)

```bash
yarn test:unit      # unit tests
yarn test:routes    # route tests - all task endpoints, with the backend HTTP mocked
```

Route tests cover the full task flow (list, create with validation, edit, delete) without needing a live backend.

### Functional tests (Playwright via CodeceptJS)

These drive a real browser against the live app, so both the frontend and backend need to be running first.

Install the browser binary (one-time):

```bash
yarn playwright install chromium
```

```bash
yarn test:functional
```

Scenarios covered:

- Viewing the task list
- Creating a task successfully
- Validation errors for invalid (non-numeric) date input
- Validation error when a day doesn't exist in the given month (e.g. 31 June)

### Linting

```bash
yarn lint        # stylelint + eslint + prettier checks
yarn lint:fix    # auto-fix
```

## Security

- Date and text fields are validated server-side before being sent to the API, with GOV.UK error summaries for invalid input
- Nunjucks auto-escapes template output, mitigating reflected XSS
- The backend location is environment-driven (`BACKEND_URL`) - no secrets in source
- The Docker image is multi-stage and runs as a non-root user

## What I'd add with more time

- AuthN/AuthZ - OAuth2/OIDC sign-in (HMCTS IDAM) so tasks are per-user and protected
- Helmet for additional HTTP security headers (CSP, HSTS)
- CI/CD - a Jenkins pipeline running lint, unit, route and functional tests
- Filtering and sorting by status/due date, and pagination for large task lists
- Application Insights / Dynatrace for real-user and error telemetry
