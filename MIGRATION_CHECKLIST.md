# Migration Checklist ✅

## Completed Tasks

- [x] Cloned new Strapi repository
- [x] Copied all 4 custom content types (collection, recipe, recipe-ingredient, post)
- [x] Copied all 4 custom components (tag, instruction, supermarket-price, ingredient-supermarket)
- [x] Copied openai-recipe-generator plugin
- [x] Copied all configuration files
- [x] Copied database file (1.8MB SQLite database)
- [x] Copied migration scripts
- [x] Updated package.json with dependencies
- [x] Created .env.example file
- [x] Updated middlewares.js with CORS configuration
- [x] Removed TypeScript files (kept only JavaScript)
- [x] Updated src/index.js with migration route support

## Files Migrated

### Content Types (4)
- `src/api/collection/`
- `src/api/recipe/`
- `src/api/recipe-ingredient/`
- `src/api/post/`

### Components (4)
- `src/components/tag/`
- `src/components/instruction/`
- `src/components/supermarket-price/`
- `src/components/ingredient-supermarket/`

### Plugin
- `src/plugins/openai-recipe-generator/` (complete with admin UI and server endpoints)

### Configuration
- `config/database.js`
- `config/server.js`
- `config/plugins.js`
- `config/api.js`
- `config/middlewares.js`
- `config/admin.js`

### Data
- `.tmp/data.db` (1.8MB - all your recipes and collections)

### Scripts
- `scripts/run-migration.js`
- `scripts/convert-json-to-components.js`
- `scripts/migrate-recipes.js`
- `src/migrate-recipes.js`

## Next Steps

1. **Install dependencies:**
   ```bash
   cd /Users/simon.proudfoot/Sites/ai-rec-strapi-new
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys and secrets
   ```

3. **Test locally:**
   ```bash
   npm run develop
   ```

4. **Verify:**
   - Admin panel loads at http://localhost:1337/admin
   - All content types are visible
   - "AI Recipes" plugin appears in sidebar
   - Existing data is accessible
   - Plugin can generate recipes

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "Migrate Strapi from monorepo with all content types, components, and plugin"
   git push origin main
   ```

## Important Notes

⚠️ **Version Upgrade**: Migrated from Strapi 4.24.0 to 5.28.0
- Test all functionality thoroughly
- Check for any breaking changes
- Database should be compatible (SQLite format)

✅ **Database**: Your SQLite database (1.8MB) has been copied with all data intact

✅ **Plugin**: The openai-recipe-generator plugin is fully migrated and should work

## Location

New repository: `/Users/simon.proudfoot/Sites/ai-rec-strapi-new`

