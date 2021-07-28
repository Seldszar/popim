module.exports = {
  webpack(config) {
    config.resolve.fallback = {
      fs: false,
      module: false,
    };

    return config;
  },
};
