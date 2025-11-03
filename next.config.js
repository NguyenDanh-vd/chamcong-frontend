require('ts-node').register({
  transpileOnly: true
});

const nextConfig = require('./next.config.ts').default;

module.exports = nextConfig;
