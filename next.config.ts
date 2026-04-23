import type { NextConfig } from "next";

/**
 * Content-Security-Policy header string.
 * Allows Google Maps, YouTube, Google Fonts, Gemini, and Translation APIs.
 */
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://www.youtube.com https://s.ytimg.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://maps.gstatic.com https://maps.googleapis.com https://i.ytimg.com https://www.googletagmanager.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://generativelanguage.googleapis.com https://maps.googleapis.com https://translation.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://analytics.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src https://www.youtube.com;
    upgrade-insecure-requests;
`;

/**
 * Next.js configuration with strict OWASP security headers, CSP,
 * and build-time pragmas.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
    ],
  },
};

export default nextConfig;