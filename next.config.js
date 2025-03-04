/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enable static export
  env: {
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    CLAUDE_API_URL: process.env.CLAUDE_API_URL,
  },
  images: {
    unoptimized: true // Required for static export
  },
  basePath: process.env.NODE_ENV === 'production' ? '/smartbotzv1' : '', // GitHub Pages base path
  assetPrefix: process.env.NODE_ENV === 'production' ? '/smartbotzv1/' : '', // Asset prefix for GitHub Pages
};

module.exports = nextConfig;