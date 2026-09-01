import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'streamtape.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tapecontent.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vz-c3b5c7e8-b89.b-cdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Adicionar suporte para produção
  productionBrowserSourceMaps: false,
  // Otimização de build
  swcMinify: true,
};

export default nextConfig;
