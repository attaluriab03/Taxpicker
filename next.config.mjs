/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Route admin subdomain requests to /admin path internally.
        // Handles: admin.yourdomain.com/:path* → /admin/:path*
        // Works for any domain (production, Vercel previews) without hardcoding.
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'admin\\.(?<domain>.+)' }],
          destination: '/admin/:path*',
        },
        // Handle the root of the admin subdomain with no path segment.
        // admin.yourdomain.com → /admin
        {
          source: '/',
          has: [{ type: 'host', value: 'admin\\.(?<domain>.+)' }],
          destination: '/admin',
        },
      ],
    }
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'dsdqhorcpkfjypezzlvv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.com',
      },
    ],
  },
}

export default nextConfig
