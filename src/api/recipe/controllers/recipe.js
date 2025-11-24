'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * recipe controller
 */
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::recipe.recipe', ({ strapi }) => ({
    async generate(ctx) {
        try {
            const { query, context, dietaryRequirements, servingSize } = ctx.request.body;
            if (!query) {
                return ctx.badRequest('Query is required');
            }
            // Import and use the OpenAI service directly
            const openaiServiceModule = await Promise.resolve().then(() => __importStar(require('../../../services/openai-recipe')));
            const openaiService = openaiServiceModule.default({ strapi });
            const recipe = await openaiService.generateRecipe({
                query,
                context,
                dietaryRequirements,
                servingSize
            });
            return ctx.send({ success: true, recipe });
        }
        catch (error) {
            return ctx.internalServerError(error.message || 'Failed to generate recipe');
        }
    }
}));
