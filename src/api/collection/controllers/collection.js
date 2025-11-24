'use strict';

/**
 * collection controller
 */

const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreController('api::collection.collection', ({ strapi }) => ({
  async full(ctx) {
    try {
      const entries = await strapi.entityService.findMany('api::collection.collection', {
        sort: { order: 'asc' },
        populate: {
          recipes: {
            populate: {
              tags: true,
              ingredients: {
                populate: {
                  supermarkets: true,
                },
              },
              instructions: {
                populate: {
                  ingredients_used: true,
                },
              },
              supermarkets: true,
              collections: {
                fields: ['id', 'title', 'displayTitle', 'description'],
              },
            },
          },
        },
      });

      const formatRecipe = (recipe = {}) => ({
        id: recipe.id,
        attributes: recipe,
      });

      const formatted = entries.map((collection) => {
        const { id, recipes = [], ...attributes } = collection;
        return {
          id,
          attributes: {
            ...attributes,
            recipes: {
              data: recipes.map(formatRecipe),
            },
          },
        };
      });

      ctx.body = { data: formatted };
    } catch (error) {
      console.error('Failed to load full collections:', error);
      ctx.throw(500, 'Failed to load collections');
    }
  },
}));
