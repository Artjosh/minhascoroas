/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    // Adicione endereços IP específicos que precisam de acesso
    'http://5.78.42.115',
    'http://localhost'
  ]
};

module.exports = nextConfig; 