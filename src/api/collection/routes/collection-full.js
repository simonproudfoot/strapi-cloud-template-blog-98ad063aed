'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/collections/full',
      handler: 'collection.full',
      config: {
        auth: false,
      },
    },
  ],
};


