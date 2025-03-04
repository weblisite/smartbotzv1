/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    CLAUDE_API_URL: process.env.CLAUDE_API_URL,
  },
};

module.exports = nextConfig; 