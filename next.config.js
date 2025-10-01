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
        hostname: 'ng.jumia.is',   // 👈 add this
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
