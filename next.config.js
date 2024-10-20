/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'logic-solver': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
