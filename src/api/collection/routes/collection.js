'use strict';

/**
 * collection router
 */

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::collection.collection', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
    create: {
      auth: false,
    },
    update: {
      auth: false,
    },
    delete: {
      auth: false,
    },
  },
});
