const IS_CLIENT = typeof window !== 'undefined';

export function initAnalytics() {
  if (!IS_CLIENT) return;

  if (process.env.NODE_ENV === 'development') {
    console.log('%c[Telemetry] Telemetry active in log-only developer mode.', 'color: #8b8b93;');
  }
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[Telemetry] Event: ${name}`, 'color: #05e69f; font-weight: bold;', properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[Telemetry] Identify: ${userId}`, 'color: #38bdf8; font-weight: bold;', traits);
  }
}

export function resetAnalytics() {
  if (process.env.NODE_ENV === 'development') {
    console.log('%c[Telemetry] Reset Session', 'color: #f43f5e; font-weight: bold;');
  }
}
