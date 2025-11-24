/**
 * Server-side migration using Strapi Entity Service
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = async ({ strapi, ctx }) => {
  try {
    console.log('🚀 Starting server-side migration...');

    const collectionsDir = path.join(process.cwd(), '..', 'content', 'collections', 'active');
    const archivedDir = path.join(process.cwd(), '..', 'content', 'collections', 'archived');

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

    // Delete existing empty recipes first
    console.log(`\n🧹 Cleaning up empty recipes...`);
    try {
      const emptyRecipes = await strapi.entityService.findMany('api::recipe.recipe', {
        filters: {
          $or: [
            { name: { $null: true } },
            { name: '' },
          ]
        },
      });
      
      for (const recipe of emptyRecipes) {
        await strapi.entityService.delete('api::recipe.recipe', recipe.id);
      }
      console.log(`   ✅ Deleted ${emptyRecipes.length} empty recipes`);
    } catch (error) {
      console.warn(`   ⚠️  Could not clean up: ${error.message}`);
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
        const existing = await strapi.entityService.findMany('api::recipe.recipe', {
          filters: { recipeId: recipeUid },
          limit: 1,
        });

        const recipeData = {
          recipeId: recipeUid,
          name: recipe.name,
          title: recipe.title || null,
          description: recipe.description || null,
          servings: recipe.servings || 4,
          prepTime: recipe.prepTime || null,
          cookTime: recipe.cookTime || null,
          tags: recipe.tags || [],
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          imageUrl: recipe.imageUrl || null,
          sourceUrl: recipe.sourceUrl || null,
          supermarkets: recipe.supermarkets || null,
          pricesEstimatedAt: recipe.pricesEstimatedAt || null,
          isCurated: true,
          publishedAt: publishedAt,
        };

        let result;
        if (existing && existing.length > 0) {
          // Update existing
          result = await strapi.entityService.update('api::recipe.recipe', existing[0].id, {
            data: recipeData,
          });
          console.log(`   ✅ Updated recipe "${recipe.name}" (ID: ${result.id})`);
          results.updated++;
        } else {
          // Create new
          result = await strapi.entityService.create('api::recipe.recipe', {
            data: recipeData,
          });
          console.log(`   ✅ Created recipe "${recipe.name}" (ID: ${result.id})`);
          results.created++;
        }

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
        const existing = await strapi.entityService.findMany('api::collection.collection', {
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
          await strapi.entityService.update('api::collection.collection', existing[0].id, {
            data: collectionData,
          });
          console.log(`   ✅ Updated collection "${collection.title}"`);
        } else {
          await strapi.entityService.create('api::collection.collection', {
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
    
    ctx.send({
      success: true,
      message: 'Migration completed successfully',
      results: {
        recipes: { created: results.created, updated: results.updated },
        collections: collections.length,
        errors: results.errors.length,
        errorDetails: results.errors,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    ctx.internalServerError(error.message || 'Migration failed');
  }
};
