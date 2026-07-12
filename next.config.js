/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

module.exports = nextConfig;
