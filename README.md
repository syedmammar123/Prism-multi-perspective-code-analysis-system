# AI Code Review Agent

An automated PR reviewer for GitHub. When a pull request is opened or updated on a configured repo, this system fetches the diff, runs three specialized AI agents (code quality, security, performance) against it, with retrieval-augmented context from the repo's own coding guidelines, and posts a structured review comment directly on the PR, usually within about a minute.

---

## How it works

![System design diagram of the AI Code Review Agent](system-design.png)

Full architecture rationale, day-by-day build log, and design decisions live in this repo's local planning notes (not published, see [Project notes](#project-notes)).

---

## Setup

### Requirements
- Node.js + npm
- A Postgres database with the `pgvector` extension (this project uses [Neon](https://neon.tech))
- A Redis instance (this project uses [Upstash](https://upstash.com))
- A GitHub token with `Contents: Read`, `Pull requests: Read and write`, `Metadata: Read-only` on the target repo
- A Groq API key

### Install

```bash
npm install
cp .env.example .env   # fill in the values below
npx prisma migrate deploy
```

### Environment variables

```env
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=your_random_secret_string

# LLM
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Redis
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379

# LangSmith (optional, tracing)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_xxxxxxxxxxxx
LANGCHAIN_PROJECT=ai-code-reviewer
LANGSMITH_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# RAG (optional, has a code-level default)
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
```

### Run locally

```bash
npm run dev          # API server (Express, webhook endpoint)
npm run worker:dev    # BullMQ worker, separate process, picks up review jobs
```

Point a GitHub webhook (`pull_request` events) at `<public-url>/api/webhook`, using a tunnel (VS Code Dev Tunnels, ngrok, etc.) for local testing.

### Ingest team coding guidelines (RAG)

Drop Markdown files describing your team's conventions into `.codereview/` at the repo root, then:

```bash
npx tsx scripts/ingest-guidelines.ts
```

This chunks, embeds (locally, via `@xenova/transformers`, no API call), and stores them in Postgres/pgvector. Re-run any time the guideline docs change. Agents will cite the relevant guideline file by name when a finding matches one.

### Production

Both the API server and the worker run as one combined web service. `src/index.ts` starts the Express server and imports the worker as a side effect, so a single deployable process handles both.

```bash
npm run build   # tsc -> dist/
npm start        # node dist/index.js, runs API + embedded worker
```

---

## What a posted review looks like

```markdown
## Code Review Summary

**Verdict:** REJECTED
**Overall Score:** 2.7/10

### Code Quality (score: 4/10)
- **[medium]** `src/test.ts:12`: Function parameters are `any`-typed, losing type safety.
  _Suggestion: add explicit parameter types._

### Security (score: 1/10)
- **[critical]** `src/test.ts:3`: Hardcoded API key committed to source.
  _Suggestion: move to an environment variable, rotate the exposed key._
- **[high]** `src/test.ts:18`: User input concatenated directly into a SQL query string (SQL injection).
  _Suggestion: use parameterized queries._

### Performance (score: 3/10)
- **[medium]** `src/test.ts:25`: O(n²) duplicate-finding loop over a large array.
  _Suggestion: use a Set for O(n) lookup._

## Must Fix Before Merge
- **[critical]** Hardcoded API key committed to source (`src/test.ts:3`)
- **[high]** SQL injection via string concatenation (`src/test.ts:18`)
```

If a repo has `.codereview/` guidelines ingested, findings reference them directly, e.g. *"Per `error-handling.md`, throw one of the factory functions from `src/lib/errors.ts` instead of a raw `Error`."*

If one of the three agents fails outright (LLM outage, exhausted retries), the review still posts with the other two agents' results and an explicit note that the third was excluded: a partial review, never a silently wrong one.

---

## Known limitations

- **Single Markdown comment**, not inline per-line PR review comments (see future work below).

## Future work

### Inline PR comments
Post findings as inline per-line review comments via GitHub's PR review API instead of one comment block, so each finding sits next to the exact line it's about.

### Tool calling for agents
Let agents fetch file contents outside the diff when they need more context, since some findings (a missing null check upstream, a changed function signature) can't be judged from the diff alone.

### Codebase-level RAG
Extend retrieval beyond `.codereview/` guideline docs to the codebase itself, so agents can ground findings in how similar code is actually written elsewhere in the repo.

### CI/CD gating
Block merges below a configurable score threshold, turning the review from advisory into an enforced quality gate.

