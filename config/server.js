module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS', env('APP_KEYS') ? env('APP_KEYS').split(',') : ['toBeModified1', 'toBeModified2', 'toBeModified3', 'toBeModified4']),
  },
});

