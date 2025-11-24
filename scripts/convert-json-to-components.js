/**
 * Run this script directly in Strapi container to convert JSON fields to components
 * Usage: docker-compose exec strapi node scripts/convert-json-to-components.js
 */

const strapi = require('@strapi/strapi')();

(async () => {
  try {
    console.log('🚀 Loading Strapi...');
    const app = await strapi.load();
    
    console.log('🔄 Starting JSON to Components conversion...\n');

    // Get all recipes
    const recipes = await app.entityService.findMany('api::recipe.recipe', {
      populate: ['tags', 'ingredients', 'instructions', 'supermarkets'],
    });

    console.log(`📊 Found ${recipes.length} recipes to convert\n`);

    let converted = 0;
    let errors = 0;

    for (const recipe of recipes) {
      try {
        const updates = {};
        let needsUpdate = false;

        // Convert tags from JSON to components
        if (recipe.tags && typeof recipe.tags === 'string') {
          try {
            const tagsData = JSON.parse(recipe.tags);
            if (Array.isArray(tagsData) && tagsData.length > 0) {
              updates.tags = tagsData.map(tag => ({
                name: typeof tag === 'string' ? tag : (tag.name || tag)
              }));
              needsUpdate = true;
            }
          } catch (e) {
            console.warn(`   ⚠️  Could not parse tags for recipe ${recipe.id}: ${e.message}`);
          }
        } else if (recipe.tags && Array.isArray(recipe.tags) && recipe.tags.length > 0) {
          // Already an array, check if it's in component format
          if (recipe.tags[0] && typeof recipe.tags[0] === 'string') {
            updates.tags = recipe.tags.map(tag => ({ name: tag }));
            needsUpdate = true;
          }
        }

        // Convert ingredients from JSON to components
        if (recipe.ingredients && typeof recipe.ingredients === 'string') {
          try {
            const ingredientsData = JSON.parse(recipe.ingredients);
            if (Array.isArray(ingredientsData) && ingredientsData.length > 0) {
              updates.ingredients = ingredientsData.map(ing => ({
                name: ing.name || ing,
                quantity: ing.quantity || null,
                is_pantry: ing.is_pantry || false
              }));
              needsUpdate = true;
            }
          } catch (e) {
            console.warn(`   ⚠️  Could not parse ingredients for recipe ${recipe.id}: ${e.message}`);
          }
        } else if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
          // Already an array, check if it needs conversion
          if (recipe.ingredients[0] && typeof recipe.ingredients[0] === 'string') {
            updates.ingredients = recipe.ingredients.map(ing => ({
              name: ing,
              quantity: null,
              is_pantry: false
            }));
            needsUpdate = true;
          } else if (recipe.ingredients[0] && !recipe.ingredients[0].name && !recipe.ingredients[0].quantity) {
            // Has structure but not component format
            updates.ingredients = recipe.ingredients.map(ing => ({
              name: ing.name || ing,
              quantity: ing.quantity || null,
              is_pantry: ing.is_pantry || false
            }));
            needsUpdate = true;
          }
        }

        // Convert instructions from JSON to components
        if (recipe.instructions && typeof recipe.instructions === 'string') {
          try {
            const instructionsData = JSON.parse(recipe.instructions);
            if (Array.isArray(instructionsData) && instructionsData.length > 0) {
              updates.instructions = instructionsData.map((inst, idx) => ({
                step: inst.step || inst || `Step ${idx + 1}`,
                ingredients_used: inst.ingredients_used || []
              }));
              needsUpdate = true;
            }
          } catch (e) {
            console.warn(`   ⚠️  Could not parse instructions for recipe ${recipe.id}: ${e.message}`);
          }
        } else if (recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
          // Already an array, check if it needs conversion
          if (recipe.instructions[0] && typeof recipe.instructions[0] === 'string') {
            updates.instructions = recipe.instructions.map((inst, idx) => ({
              step: inst,
              ingredients_used: []
            }));
            needsUpdate = true;
          } else if (recipe.instructions[0] && !recipe.instructions[0].step) {
            // Has structure but not component format
            updates.instructions = recipe.instructions.map((inst, idx) => ({
              step: inst.step || inst || `Step ${idx + 1}`,
              ingredients_used: inst.ingredients_used || []
            }));
            needsUpdate = true;
          }
        }

        // Convert supermarkets from JSON to components
        if (recipe.supermarkets && typeof recipe.supermarkets === 'string') {
          try {
            const supermarketsData = JSON.parse(recipe.supermarkets);
            if (Array.isArray(supermarketsData) && supermarketsData.length > 0) {
              updates.supermarkets = supermarketsData.map(sm => ({
                supermarket: sm.supermarket || sm.name || 'Unknown',
                price: sm.price || null,
                currency: sm.currency || 'GBP'
              }));
              needsUpdate = true;
            }
          } catch (e) {
            console.warn(`   ⚠️  Could not parse supermarkets for recipe ${recipe.id}: ${e.message}`);
          }
        } else if (recipe.supermarkets && Array.isArray(recipe.supermarkets) && recipe.supermarkets.length > 0) {
          // Already an array, check if it needs conversion
          if (recipe.supermarkets[0] && !recipe.supermarkets[0].supermarket && !recipe.supermarkets[0].name) {
            // Might be in wrong format
            updates.supermarkets = recipe.supermarkets.map(sm => ({
              supermarket: sm.supermarket || sm.name || 'Unknown',
              price: sm.price || null,
              currency: sm.currency || 'GBP'
            }));
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          await app.entityService.update('api::recipe.recipe', recipe.id, {
            data: updates,
          });
          console.log(`   ✅ Converted recipe "${recipe.name}" (ID: ${recipe.id})`);
          converted++;
        }
      } catch (error) {
        console.error(`   ❌ Error converting recipe "${recipe.name}" (ID: ${recipe.id}):`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Conversion complete!`);
    console.log(`   Converted: ${converted} recipes`);
    console.log(`   Errors: ${errors}`);
    
    await strapi.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})();
