import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is required to allow requests from the Firebase Studio preview environment.
  allowedDevOrigins: ["*.cloudworkstations.dev"],
  experimental: {},
};

export default nextConfig;
