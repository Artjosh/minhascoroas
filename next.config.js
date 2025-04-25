/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    'http://localhost',
    'http://10.88.0.3'
  ]
};

module.exports = nextConfig;