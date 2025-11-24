"use strict";

module.exports = ({ strapi }) => ({
    async generate(ctx) {
        const { query, dietaryRequirements, servingSize } = ctx.request.body || {};
        if (!query || !query.trim()) {
            return ctx.badRequest('Query is required');
        }
        try {
            const result = await strapi
                .plugin('openai-recipe-generator')
                .service('recipe-generator')
                .generateFromChat({
                query: query.trim(),
                dietaryRequirements,
                servingSize,
            });
            ctx.send(result);
        }
        catch (error) {
            strapi.log.error('openai-recipe.generate error', error);
            ctx.internalServerError(error.message || 'Failed to generate recipe');
        }
    },
    async create(ctx) {
        const { recipe } = ctx.request.body || {};
        if (!recipe) {
            return ctx.badRequest('Recipe payload is required');
        }
        try {
            const created = await strapi
                .plugin('openai-recipe-generator')
                .service('recipe-generator')
                .createRecipe(recipe);
            ctx.send({ success: true, recipe: created });
        }
        catch (error) {
            strapi.log.error('openai-recipe.create error', error);
            ctx.internalServerError(error.message || 'Failed to create recipe');
        }
    },
});



