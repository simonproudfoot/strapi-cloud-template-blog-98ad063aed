"use strict";
const DEFAULT_BASE_URL = 'https://ai-recipe-interface-dfrtizm2b-simon-gproudfoots-projects.vercel.app';
const toSlug = (value) => {
    if (!value)
        return '';
    return value
        .toString()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase()
        .substring(0, 60);
};
const normalizeTag = (tag) => {
    if (!tag)
        return null;
    if (typeof tag === 'string')
        return { name: tag };
    if (typeof tag === 'object') {
        const name = tag.name || tag.title || tag.label || tag.id;
        if (name)
            return { name };
    }
    return null;
};
const normalizeIngredient = (ingredient) => {
    if (!ingredient)
        return null;
    if (typeof ingredient === 'string') {
        return {
            name: ingredient,
            quantity: '',
            is_pantry: false,
            supermarkets: [],
        };
    }
    return {
        name: ingredient.name || ingredient.title || '',
        quantity: ingredient.quantity || ingredient.amount || '',
        is_pantry: Boolean(ingredient.is_pantry ?? ingredient.isPantry ?? false),
        supermarkets: Array.isArray(ingredient.supermarkets) ? ingredient.supermarkets : [],
    };
};
const normalizeInstruction = (instruction) => {
    if (!instruction)
        return null;
    if (typeof instruction === 'string') {
        return { step: instruction, ingredients_used: [] };
    }
    return {
        step: instruction.step || instruction.text || '',
        ingredients_used: Array.isArray(instruction.ingredients_used)
            ? instruction.ingredients_used
            : Array.isArray(instruction.ingredients)
                ? instruction.ingredients
                : [],
    };
};
const normalizeSupermarketEntry = (entry) => {
    if (!entry)
        return null;
    return {
        supermarket: entry.supermarket || entry.name || '',
        price: entry.price ?? null,
        currency: entry.currency || 'GBP',
        url: entry.url || entry.link || null,
        image: entry.image || entry.imageUrl || null,
    };
};
const mapInstructionIngredients = (names, ingredientLookup) => {
    if (!Array.isArray(names))
        return [];
    return names
        .map((ingredient) => {
        if (typeof ingredient === 'object' && ingredient?.id) {
            return ingredient.id;
        }
        const name = typeof ingredient === 'string'
            ? ingredient
            : ingredient?.name || ingredient?.title;
        if (!name)
            return null;
        const key = name.trim().toLowerCase();
        return ingredientLookup.get(key) || null;
    })
        .filter(Boolean);
};
module.exports = ({ strapi }) => ({
    async generateFromChat(options) {
        const baseUrl = (process.env.NUXT_PROD_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
        const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
        if (!bypassSecret) {
            throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET is not configured');
        }
        const endpoint = `${baseUrl}/api/chat?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=${encodeURIComponent(bypassSecret)}`;
        const payload = {
            query: options.query,
            dietaryRequirements: options.dietaryRequirements,
            servingSize: options.servingSize,
        };
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Chat API error (${response.status}): ${text}`);
        }
        const data = await response.json();
        const recipe = data?.response?.recipe || data?.recipe;
        if (!recipe) {
            throw new Error('Chat API did not return a recipe payload');
        }
        return {
            success: true,
            recipe,
            raw: data,
        };
    },
    async createRecipe(recipePayload) {
        const normalizedName = recipePayload.name || recipePayload.title || 'New Recipe';
        const slugCandidate = recipePayload.recipeId || toSlug(normalizedName) || `recipe-${Date.now()}`;
        const baseRecipeData = {
            recipeId: slugCandidate,
            name: normalizedName,
            title: recipePayload.title || normalizedName,
            description: recipePayload.description || recipePayload.summary || '',
            servings: Number(recipePayload.servings) || 4,
            prepTime: recipePayload.prepTime || recipePayload.preparationTime || '',
            cookTime: recipePayload.cookTime || recipePayload.cookingTime || '',
            imageUrl: recipePayload.imageUrl || recipePayload.image || null,
            sourceUrl: recipePayload.sourceUrl || recipePayload.url || null,
            pricesEstimatedAt: recipePayload.pricesEstimatedAt || null,
            isCurated: true,
            tags: (recipePayload.tags || [])
                .map(normalizeTag)
                .filter((tag) => !!tag?.name),
            instructions: [],
            supermarkets: (recipePayload.supermarkets || [])
                .map(normalizeSupermarketEntry)
                .filter((entry) => !!entry?.supermarket),
        };
        const mappedIngredients = (recipePayload.ingredients || [])
            .map(normalizeIngredient)
            .filter((ingredient) => !!ingredient?.name);
        const mappedInstructions = (recipePayload.instructions || [])
            .map(normalizeInstruction)
            .filter((instruction) => !!instruction?.step);
        const recipe = await strapi.entityService.create('api::recipe.recipe', { 
            data: {
                ...baseRecipeData,
                publishedAt: new Date(), // Publish immediately
            }
        });
        const ingredientLookup = new Map();
        for (const ingredient of mappedIngredients) {
            const created = await strapi.entityService.create('api::recipe-ingredient.recipe-ingredient', {
                data: {
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    is_pantry: ingredient.is_pantry,
                    supermarkets: ingredient.supermarkets
                        .map(normalizeSupermarketEntry)
                        .filter((entry) => !!entry?.supermarket),
                    recipe: recipe.id,
                },
            });
            ingredientLookup.set(ingredient.name.trim().toLowerCase(), created.id);
        }
        if (mappedInstructions.length > 0) {
            const instructionComponents = mappedInstructions.map((instruction) => ({
                step: instruction.step,
                ingredients_used: mapInstructionIngredients(instruction.ingredients_used, ingredientLookup),
            }));
            await strapi.entityService.update('api::recipe.recipe', recipe.id, {
                data: {
                    instructions: instructionComponents,
                },
            });
        }
        const populated = await strapi.entityService.findOne('api::recipe.recipe', recipe.id, {
            populate: {
                tags: true,
                instructions: {
                    populate: {
                        ingredients_used: true,
                    },
                },
                ingredients: {
                    populate: ['supermarkets'],
                },
                supermarkets: true,
                collections: true,
            },
        });
        return populated;
    },
});



