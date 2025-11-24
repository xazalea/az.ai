/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude pollinations directory from compilation
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /pollinations/,
    });
    return config;
  },
  // Exclude pollinations from page generation
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Don't scan pollinations directory
  experimental: {
    // This helps exclude directories
  },
};

module.exports = nextConfig;

