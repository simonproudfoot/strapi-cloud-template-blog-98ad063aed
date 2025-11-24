'use strict';

const bootstrap = require('./bootstrap');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Register custom migration route if migrate-recipes exists
    try {
      const migrateRecipes = require('./migrate-recipes');
      strapi.server.routes([
        {
          method: 'POST',
          path: '/api/migrate-recipes',
          handler: async (ctx) => {
            await migrateRecipes({ strapi, ctx });
          },
          config: {
            auth: false,
          },
        },
      ]);
    } catch (error) {
      // migrate-recipes not found, skip
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap,
};
