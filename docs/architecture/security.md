# PharmNode Security Architecture Guide

This guide details the security configurations, algorithms, and infrastructure protections deployed in **PharmNode** to protect the B2B SaaS platform from brute-force authentication attempts, automated content scraping, and Distributed Denial of Service (DDoS) attacks.

---

## 1. Rate Limiting Strategy

To prevent brute-force attacks and resource consumption on critical endpoints, PharmNode applies sliding-window rate limiting.

### Code-Level Implementation

PharmNode uses a localized in-memory rate limiter at `src/lib/rateLimit.ts` that tracks request counts using client IPs extracted via `x-forwarded-for` and `x-real-ip` headers:

- **Password Reset Request Action**: Restricted to **5 requests per 15 minutes** per IP address.
- **Credentials Authorization Action**: Restricted to **10 authorization attempts per 15 minutes** per IP address.

### Upgrading to Redis / Upstash (Clustered Environments)

When deploying multiple serverless containers (e.g., on Vercel or Kubernetes nodes), in-memory counters should be replaced by a centralized database like **Redis** (e.g., Upstash Redis) to maintain global consistency.

To upgrade, update `src/lib/rateLimit.ts` to utilize the Upstash `@upstash/redis` SDK:

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function rateLimit(actionKey: string, options: RateLimitOptions) {
  const ip = await getClientIp();
  const key = `ratelimit:${ip}:${actionKey}`;
  
  const currentCount = await redis.incr(key);
  if (currentCount === 1) {
    await redis.expire(key, options.windowMs / 1000);
  }
  
  const success = currentCount <= options.limit;
  return {
    success,
    limit: options.limit,
    remaining: Math.max(0, options.limit - currentCount),
    reset: Date.now() + (await redis.ttl(key)) * 1000,
  };
}
```

---

## 2. Bot & Spam Protection (CAPTCHA)

To completely mitigate automated profile registrations and password reset spam, we recommend integrating **Cloudflare Turnstile** or **Google reCAPTCHA v3**.

### Turnstile Integration Steps

1. **Obtain API Keys**: Register the domain in the Cloudflare Dashboard to get a **Sitekey** and a **Secret Key**.
2. **Add Environment Variables**:
   ```bash
   NEXT_PUBLIC_TURNSTILE_SITEKEY="your-site-key-here"
   TURNSTILE_SECRET_KEY="your-secret-key-here"
   ```
3. **Install Client Library**:
   ```bash
   npm install @marsidev/react-turnstile
   ```
4. **Embed Widget in Client Component**:
   ```tsx
   import { Turnstile } from '@marsidev/react-turnstile';
   
   // In login/password reset form
   <Turnstile 
     siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY} 
     onSuccess={(token) => setCaptchaToken(token)} 
   />
   ```
5. **Verify Token in Server Action**:
   ```typescript
   const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
     method: "POST",
     headers: { "Content-Type": "application/x-www-form-urlencoded" },
     body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captchaToken}`,
   });
   const outcome = await response.json();
   if (!outcome.success) {
     return { success: false, error: "CAPTCHA validation failed." };
   }
   ```

---

## 3. Infrastructure-Level DDoS & Scraping Protection (Cloudflare WAF)

For high-availability and WAF (Web Application Firewall) compliance, PharmNode should be placed behind a Cloudflare proxy.

### Cloudflare Setup Checklist

1. **DNS & Proxying**:
   - Point your domain's NS records to Cloudflare.
   - Ensure the proxy status is **Orange Cloud (Proxied)** for all core web routes.
2. **WAF Custom Rules**:
   - **Rate Limiting Rules**: Set up a Cloudflare WAF rate limiting rule on paths matching `/api/*` and `/login` (e.g., block requests exceeding 60 requests per minute from a single IP).
   - **Bot Management**: Enable **Bot Fight Mode** to block automated scrapers trying to index the pharmaceutical knowledge base.
   - **Scrape Shield**: Enable Cloudflare Scrape Shield to obfuscate emails and prevent search spiders from harvesting ingredients databases.
3. **DDoS Resiliency**:
   - Configure **HTTP DDoS Protection Rules** to automatically challenge (JS challenge or CAPTCHA) suspicious spikes in traffic.
   - Keep **Under Attack Mode** disabled by default, and activate it manually via API or dashboard during an active, high-volume layer 7 flood.
