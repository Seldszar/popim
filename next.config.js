const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = withSentryConfig({
  sentry: {
    hideSourceMaps: true,
  },
});

module.exports = nextConfig;
