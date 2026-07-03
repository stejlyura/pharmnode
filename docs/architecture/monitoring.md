# PharmNode Logging & Monitoring Guide

This document details the telemetry, error interception, and performance monitoring setup for the **PharmNode** B2B SaaS platform.

---

## 1. Structured Logging Schema

PharmNode utilizes structured JSON logging via the helper in [logger.ts](file:///Users/dev/projects/pharmnode/src/lib/logger.ts). This ensures logs generated in both Server Components, Server Actions, Route Handlers, and client-side error boundaries follow a uniform schema that can be easily parsed by logging agents (e.g., Datadog, AWS CloudWatch, Logtail, Vercel Log Streams).

### Log Payload Format
Every printed log outputs a single-line JSON string conforming to the following type:
```typescript
interface LogPayload {
  level: "info" | "warn" | "error"; // Log severity
  timestamp: string;                // ISO 8601 UTC timestamp
  message: string;                  // Human-readable message
  action?: string;                  // Module/context identifier (e.g., "webhook_lemon")
  context?: Record<string, any>;    // Custom metadata payload
  error?: {                         // Captured exception details (only for level = "error")
    name: string;
    message: string;
    stack?: string;
    digest?: string;
  };
}
```

---

## 2. Integrated Points

### 1. Lemon Squeezy Webhooks
In [route.ts](file:///Users/dev/projects/pharmnode/src/app/api/webhooks/lemon/route.ts), structured logging is instrumented across all stages:
- **`info`**: Incoming payloads, event ID mapping, database record modifications.
- **`warn`**: Missing signatures, HMAC SHA-256 validation failures, or missing database user mappings.
- **`error`**: Processing exceptions or SQL constraint violations are caught, formatted with stack traces, and logged.

### 2. Global React Boundary
In [error.tsx](file:///Users/dev/projects/pharmnode/src/app/error.tsx), unhandled React renderer thread crashes are captured in `useEffect` and dispatched to the logger:
```typescript
logger.error("Unhandled runtime error captured by root boundary", error, "react_error_boundary");
```

---

## 3. Sentry Production Integration

To link PharmNode to Sentry for automated anomaly alerts, performance tracing, and source map resolution, execute the following steps:

### 1. Run the Setup Wizard
Run the official Sentry initialization tool inside the project root:
```bash
npx @sentry/wizard -i nextjs
```
The wizard will automatically:
1. Install `@sentry/nextjs`.
2. Generate setup configuration files:
   - `sentry.client.config.ts` (Client-side tracing)
   - `sentry.server.config.ts` (Route handlers, Server actions)
   - `sentry.edge.config.ts` (Next.js middleware/proxy)
3. Modify `next.config.js` to automatically upload source maps to Sentry on production builds.
4. Add `.sentryclirc` containing Sentry authentication parameters.

### 2. Configure Environment Variables
Add the Sentry DSN key to your production environment (e.g. on Vercel):
```bash
SENTRY_DSN="https://your-public-key@o0.ingest.sentry.io/your-project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-public-key@o0.ingest.sentry.io/your-project-id"
```

### 3. Uncomment Sentry Hooks
Once `@sentry/nextjs` is installed, uncomment the Sentry capture hooks in [logger.ts](file:///Users/dev/projects/pharmnode/src/lib/logger.ts#L43-L54):
```typescript
if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const Sentry = require("@sentry/nextjs");
    Sentry.captureException(payload.error || new Error(payload.message), {
      tags: { action: payload.action },
      extra: payload.context,
    });
  } catch (e) {
    // Sentry load warning
  }
}
```

---

## 4. Production Log Collection

In cloud platforms like **Vercel** or **AWS Amplify**:
- Anything written via `console.log`, `console.warn`, or `console.error` is captured as stdout/stderr streams.
- Since our logs are stringified JSON payloads, logs in the dashboard will be readable as structured fields.
- You can create log-drain rules to route these JSON streams directly to external APMs (Datadog, Grafana, Logtail) for custom dashboard visualization.

---
⬅️ [Вернуться к индексу документации](../index.md)
