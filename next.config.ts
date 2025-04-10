import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
module.exports = {
  webpack: (config) => {
      config.resolve.alias['sequelize'] = require.resolve('sequelize');
      return config;
  },
};

