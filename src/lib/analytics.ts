import posthog from 'posthog-js';

const IS_CLIENT = typeof window !== 'undefined';
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const HAS_VALID_KEY = !!KEY && KEY !== 'your-posthog-project-api-key-here';

export function initAnalytics() {
  if (!IS_CLIENT) return;

  // Block initialization if cookie consent is not granted
  const consent = localStorage.getItem("pharmnode_cookie_consent");
  if (consent !== "accepted") {
    if (process.env.NODE_ENV === 'development') {
      console.log('%c[Telemetry] PostHog initialization blocked: Cookie consent not granted.', 'color: #f43f5e; font-weight: bold;');
    }
    return;
  }

  if (HAS_VALID_KEY) {
    try {
      posthog.init(KEY!, {
        api_host: HOST,
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') {
            ph.debug(true);
          }
        },
        capture_pageview: false, // Let routers handle pageviews manually if needed
        persistence: 'localStorage',
      });
    } catch (e) {
      console.error('[Telemetry] Failed to initialize PostHog:', e);
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('%c[Telemetry] PostHog key not found or using placeholder. Telemetry active in log-only developer mode.', 'color: #8b8b93;');
    }
  }
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[Telemetry] Event: ${name}`, 'color: #05e69f; font-weight: bold;', properties);
  }
  
  if (IS_CLIENT) {
    const consent = localStorage.getItem("pharmnode_cookie_consent");
    if (consent !== "accepted") return;
  }

  if (IS_CLIENT && HAS_VALID_KEY) {
    try {
      posthog.capture(name, properties);
    } catch (e) {
      console.error('[Telemetry] Event tracking failed:', e);
    }
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`%c[Telemetry] Identify: ${userId}`, 'color: #38bdf8; font-weight: bold;', traits);
  }

  if (IS_CLIENT) {
    const consent = localStorage.getItem("pharmnode_cookie_consent");
    if (consent !== "accepted") return;
  }

  if (IS_CLIENT && HAS_VALID_KEY) {
    try {
      posthog.identify(userId, traits);
    } catch (e) {
      console.error('[Telemetry] User identification failed:', e);
    }
  }
}

export function resetAnalytics() {
  if (process.env.NODE_ENV === 'development') {
    console.log('%c[Telemetry] Reset Session', 'color: #f43f5e; font-weight: bold;');
  }

  if (IS_CLIENT) {
    const consent = localStorage.getItem("pharmnode_cookie_consent");
    if (consent !== "accepted") return;
  }

  if (IS_CLIENT && HAS_VALID_KEY) {
    try {
      posthog.reset();
    } catch (e) {
      console.error('[Telemetry] Reset session failed:', e);
    }
  }
}
