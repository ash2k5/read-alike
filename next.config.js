/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY,
  },
  webpack: (config) => {
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'process.env': JSON.stringify(process.env),
      })
    );
    return config;
  },
};

module.exports = nextConfig; 