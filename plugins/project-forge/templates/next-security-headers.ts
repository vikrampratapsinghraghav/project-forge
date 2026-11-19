/**
 * Security headers for Next.js. Import in next.config.ts:
 *   import { securityHeaders } from './security-headers';
 *   export default { async headers() { return [{ source: '/(.*)', headers: securityHeaders }]; } };
 * Tighten the CSP to the exact origins the app uses (analytics, Supabase, images).
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // replace 'unsafe-inline' with nonces when the app is ready
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
