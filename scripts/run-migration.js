/**
 * Run this script directly in Strapi container to migrate recipes
 * Usage: docker-compose exec strapi node scripts/run-migration.js
 */

const strapi = require('@strapi/strapi')();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

(async () => {
  try {
    console.log('🚀 Loading Strapi...');
    const app = await strapi.load();
    
    console.log('🚀 Starting migration...');

    // Content directory is mounted at /content in Docker
    const collectionsDir = '/content/collections/active';
    const archivedDir = '/content/collections/archived';
    
    if (!fs.existsSync(collectionsDir)) {
      console.error(`❌ Could not find content directory at: ${collectionsDir}`);
      process.exit(1);
    }

    let activeFiles = [];
    let archivedFiles = [];
    
    try {
      activeFiles = fs.readdirSync(collectionsDir);
    } catch (e) {
      console.warn(`⚠️  Could not read ${collectionsDir}`);
    }
    
    try {
      archivedFiles = fs.readdirSync(archivedDir);
    } catch (e) {
      console.warn(`⚠️  Could not read ${archivedDir}`);
    }
    
    const allFiles = [...activeFiles, ...archivedFiles].filter(f => f.endsWith('.md'));

    console.log(`📁 Found ${allFiles.length} markdown files`);

    const recipeMap = new Map();
    const collections = [];

    // Parse each markdown file
    for (const file of allFiles) {
      try {
        const isActive = activeFiles.includes(file);
        const filePath = path.join(isActive ? collectionsDir : archivedDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
          console.warn(`⚠️  No frontmatter found in ${file}, skipping`);
          continue;
        }

        const frontmatter = yaml.load(frontmatterMatch[1]);
        const recipes = frontmatter.recipes || [];

        for (const recipe of recipes) {
          if (recipe.id && !recipeMap.has(recipe.id)) {
            recipeMap.set(recipe.id, recipe);
          }
        }

        const collection = {
          title: frontmatter.title || file.replace('.md', ''),
          displayTitle: frontmatter.displayTitle || '',
          description: frontmatter.description || '',
          order: frontmatter.order || 999,
          displayMode: frontmatter.displayMode || 'standard',
          bgColor: frontmatter.bgColor || '#FFF8F0',
          darkMode: frontmatter.darkMode || false,
          backgroundImage: frontmatter.backgroundImage || null,
          featured: frontmatter.featured !== false,
          publishedAt: frontmatter.publishedAt || new Date().toISOString(),
          recipes: recipes
        };

        collections.push(collection);
        console.log(`✅ Parsed ${file}: ${recipes.length} recipes`);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Collections: ${collections.length}`);
    console.log(`   - Unique recipes: ${recipeMap.size}`);

    // Delete existing empty recipes
    console.log(`\n🧹 Cleaning up empty recipes...`);
    try {
      const emptyRecipes = await app.entityService.findMany('api::recipe.recipe', {
        filters: {
          $or: [
            { name: { $null: true } },
            { name: '' },
          ]
        },
      });
      
      for (const recipe of emptyRecipes) {
        await app.entityService.delete('api::recipe.recipe', recipe.id);
      }
      console.log(`   ✅ Deleted ${emptyRecipes.length} empty recipes`);
    } catch (error) {
      console.warn(`   ⚠️  Could not clean up: ${error.message}`);
    }

    const normalizeName = (value = '') =>
      String(value || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');

    const buildIngredientKey = (name = '', quantity = '') =>
      `${normalizeName(name)}|${normalizeName(quantity)}`;

    async function syncIngredientsAndInstructions(recipeSource, recipeEntityId) {
      const ingredientInputs = Array.isArray(recipeSource.ingredients) ? recipeSource.ingredients : [];

      const existingIngredients = await app.entityService.findMany('api::recipe-ingredient.recipe-ingredient', {
        filters: { recipe: { id: recipeEntityId } },
        limit: 200,
      });

      const existingByKey = new Map();
      for (const ingredient of existingIngredients) {
        existingByKey.set(buildIngredientKey(ingredient.name, ingredient.quantity), ingredient);
      }

      const keptKeys = new Set();
      const keyToId = new Map();
      const nameToIds = new Map();

      const registerIngredient = (id, ing) => {
        const key = buildIngredientKey(ing.name, ing.quantity);
        keyToId.set(key, id);
        const nameKey = normalizeName(ing.name);
        if (!nameToIds.has(nameKey)) {
          nameToIds.set(nameKey, []);
        }
        nameToIds.get(nameKey).push(id);
      };

      for (const ing of ingredientInputs) {
        const supermarketEntries = Array.isArray(ing.supermarkets)
          ? ing.supermarkets.map(sm => ({
              supermarket: sm.supermarket || sm.name || 'Unknown',
              price: sm.price || null,
              currency: sm.currency || 'GBP',
              url: sm.url || null,
              image: sm.image || null,
            }))
          : [];

        const payload = {
          name: ing.name || ing,
          quantity: ing.quantity || null,
          is_pantry: ing.is_pantry || false,
          recipe: recipeEntityId,
          supermarkets: supermarketEntries,
        };

        if (!payload.name) {
          continue;
        }

        const key = buildIngredientKey(payload.name, payload.quantity);
        keptKeys.add(key);

        if (existingByKey.has(key)) {
          const existing = existingByKey.get(key);
          await app.entityService.update('api::recipe-ingredient.recipe-ingredient', existing.id, {
            data: payload,
          });
          registerIngredient(existing.id, payload);
        } else {
          const created = await app.entityService.create('api::recipe-ingredient.recipe-ingredient', {
            data: payload,
          });
          registerIngredient(created.id, payload);
        }
      }

      for (const [key, ingredient] of existingByKey.entries()) {
        if (!keptKeys.has(key)) {
          await app.entityService.delete('api::recipe-ingredient.recipe-ingredient', ingredient.id);
        }
      }

      const instructionsSource = Array.isArray(recipeSource.instructions) ? recipeSource.instructions : [];
      const instructionsData = instructionsSource.map((inst, idx) => {
        const usedIds = [];
        const usedArray = Array.isArray(inst.ingredients_used) ? inst.ingredients_used : [];

        for (const used of usedArray) {
          const usedName = typeof used === 'string' ? used : used?.name;
          if (!usedName) continue;

          const preciseKey = buildIngredientKey(usedName, typeof used === 'string' ? '' : used.quantity || '');
          let ingredientId = keyToId.get(preciseKey);

          if (!ingredientId) {
            const fallbackKey = normalizeName(usedName);
            const candidates = nameToIds.get(fallbackKey) || [];
            ingredientId = candidates[0];
          }

          if (ingredientId) {
            usedIds.push(ingredientId);
          }
        }

        return {
          step: inst.step || inst || `Step ${idx + 1}`,
          ingredients_used: usedIds,
        };
      });

      await app.entityService.update('api::recipe.recipe', recipeEntityId, {
        data: {
          instructions: instructionsData,
        },
      });
    }

    // Migrate recipes using Entity Service
    console.log(`\n🔄 Migrating recipes to Strapi...`);
    const recipeIdMap = new Map();
    const results = { created: 0, updated: 0, errors: [] };

    for (const [oldId, recipe] of recipeMap.entries()) {
      try {
        const recipeUid = recipe.id || recipe.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50);

        let publishedAt = new Date().toISOString();
        if (recipe.pricesEstimatedAt) {
          publishedAt = recipe.pricesEstimatedAt;
        }

        // Check if recipe already exists
        const existing = await app.entityService.findMany('api::recipe.recipe', {
          filters: { recipeId: recipeUid },
          limit: 1,
        });

          // Convert arrays to component format
          const tags = (recipe.tags || []).map(tag => 
            typeof tag === 'string' ? { name: tag } : { name: tag.name || tag }
          );
          
          const supermarkets = (recipe.supermarkets || []).map(sm => ({
            supermarket: sm.supermarket || sm.name || 'Unknown',
            price: sm.price || null,
            currency: sm.currency || 'GBP'
          }));

          const recipeData = {
            recipeId: recipeUid,
            name: recipe.name,
            title: recipe.title || null,
            description: recipe.description || null,
            servings: recipe.servings || 4,
            prepTime: recipe.prepTime || null,
            cookTime: recipe.cookTime || null,
            tags: tags,
            instructions: [],
            imageUrl: recipe.imageUrl || null,
            sourceUrl: recipe.sourceUrl || null,
            supermarkets: supermarkets.length > 0 ? supermarkets : [],
            pricesEstimatedAt: recipe.pricesEstimatedAt || null,
            isCurated: true,
            publishedAt: publishedAt,
          };

        let result;
        if (existing && existing.length > 0) {
          // Update existing
          result = await app.entityService.update('api::recipe.recipe', existing[0].id, {
            data: recipeData,
          });
          console.log(`   ✅ Updated recipe "${recipe.name}" (ID: ${result.id})`);
          results.updated++;
        } else {
          // Create new
          result = await app.entityService.create('api::recipe.recipe', {
            data: recipeData,
          });
          console.log(`   ✅ Created recipe "${recipe.name}" (ID: ${result.id})`);
          results.created++;
        }

        await syncIngredientsAndInstructions(recipe, result.id);

        recipeIdMap.set(oldId, result.id);
      } catch (error) {
        console.error(`   ❌ Error migrating recipe "${recipe.name}":`, error.message);
        results.errors.push({ recipe: recipe.name, error: error.message });
      }
    }

    // Migrate collections
    console.log(`\n🔄 Migrating collections to Strapi...`);

    for (const collection of collections) {
      try {
        const recipeIds = collection.recipes
          .map(r => {
            const recipeUid = r.id || r.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .substring(0, 50);
            return recipeIdMap.get(r.id || recipeUid);
          })
          .filter(id => id !== undefined);

        // Check if collection already exists
        const existing = await app.entityService.findMany('api::collection.collection', {
          filters: { title: collection.title },
          limit: 1,
        });

        const collectionData = {
          title: collection.title,
          displayTitle: collection.displayTitle || null,
          description: collection.description,
          order: collection.order,
          displayMode: collection.displayMode,
          bgColor: collection.bgColor,
          darkMode: collection.darkMode,
          featured: collection.featured,
          publishedAt: collection.publishedAt,
          recipes: recipeIds,
        };

        if (existing && existing.length > 0) {
          await app.entityService.update('api::collection.collection', existing[0].id, {
            data: collectionData,
          });
          console.log(`   ✅ Updated collection "${collection.title}"`);
        } else {
          await app.entityService.create('api::collection.collection', {
            data: collectionData,
          });
          console.log(`   ✅ Created collection "${collection.title}"`);
        }
      } catch (error) {
        console.error(`   ❌ Error migrating collection "${collection.title}":`, error.message);
        results.errors.push({ collection: collection.title, error: error.message });
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Created: ${results.created} recipes`);
    console.log(`   Updated: ${results.updated} recipes`);
    console.log(`   Errors: ${results.errors.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
})();

