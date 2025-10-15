// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'symbolstores.com',
        pathname: '/assets/images/**',
      },
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uandu.com.ng',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fouanistore.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'simsng.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jumia.com.ng',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ng.jumia.is',
        pathname: '/**',
      },
      // 👇 Add these two to fix your error
      {
        protocol: 'https',
        hostname: 'salva.ams3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ams3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
