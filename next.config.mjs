
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */

  // ============================================================================
  // Security Headers
  // ============================================================================
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline for development
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join('; ')
          },
          {
            // Prevent page from being displayed in iframes (clickjacking protection)
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // Control referrer information
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            // Disable browser features and APIs
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            // Enable browser XSS protection (legacy, but doesn't hurt)
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            // Strict Transport Security (HTTPS only) - only in production
            ...(process.env.NODE_ENV === 'production' && {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains'
            })
          }
        ].filter(Boolean) // Remove undefined entries
      }
    ];
  }
};

export default nextConfig;

