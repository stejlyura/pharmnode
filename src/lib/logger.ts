import * as Sentry from "@sentry/nextjs";

interface LogPayload {
  level: "info" | "warn" | "error";
  timestamp: string;
  message: string;
  action?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    digest?: string;
  };
}

/**
 * Structured Logging Service.
 * Formats logs into structured JSON payloads for simple production tracing.
 * Integrates with console output in development and stdout/stderr in production.
 * Automatically forwards warnings and errors to Sentry.
 */
class Logger {
  private formatLog(
    level: "info" | "warn" | "error",
    message: string,
    action?: string,
    context?: Record<string, unknown>,
    err?: unknown
  ): LogPayload {
    const errorObject = (err && typeof err === "object") ? (err as Record<string, unknown>) : null;
    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      action,
      context,
      error: errorObject
        ? {
            name: typeof errorObject.name === "string" ? errorObject.name : "Error",
            message: typeof errorObject.message === "string" ? errorObject.message : String(err),
            stack: typeof errorObject.stack === "string" ? errorObject.stack : undefined,
            digest: typeof errorObject.digest === "string" ? errorObject.digest : undefined,
          }
        : err
          ? {
              name: "Error",
              message: String(err),
            }
          : undefined,
    };
  }

  private print(payload: LogPayload) {
    const json = JSON.stringify(payload);
    if (payload.level === "error") {
      console.error(json);
    } else if (payload.level === "warn") {
      console.warn(json);
    } else {
      console.log(json);
    }
  }

  info(message: string, action?: string, context?: Record<string, unknown>) {
    this.print(this.formatLog("info", message, action, context));
  }

  warn(message: string, action?: string, context?: Record<string, unknown>) {
    this.print(this.formatLog("warn", message, action, context));
    Sentry.captureMessage(message, {
      level: "warning",
      extra: { action, context },
    });
  }

  error(message: string, err?: unknown, action?: string, context?: Record<string, unknown>) {
    const payload = this.formatLog("error", message, action, context, err);
    this.print(payload);
    
    if (err) {
      Sentry.captureException(err, {
        extra: { message, action, context },
      });
    } else {
      Sentry.captureMessage(message, {
        level: "error",
        extra: { action, context },
      });
    }
  }
}

export const logger = new Logger();

