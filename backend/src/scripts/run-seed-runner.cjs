process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'CommonJS',
  moduleResolution: 'Node',
  allowJs: true,
});

require('ts-node/register/transpile-only');
require('./run-seed.ts');
