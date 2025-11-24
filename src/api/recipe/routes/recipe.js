'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * recipe router
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreRouter('api::recipe.recipe', {
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
