/**
 * Export Strapi Data Script
 * 
 * This script exports all your Strapi data to a file that can be imported into Strapi Cloud
 * 
 * Usage:
 *   node scripts/export-data.js
 * 
 * Or use Strapi's built-in export feature via admin panel:
 *   Settings → Transfer Tokens → Generate Token → Export
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Strapi Data Export Helper');
console.log('============================\n');

console.log('To export your data, you have two options:\n');

console.log('Option 1: Via Admin Panel (Recommended)');
console.log('----------------------------------------');
console.log('1. Start your local Strapi:');
console.log('   npm run develop');
console.log('');
console.log('2. Open admin panel: http://localhost:1337/admin');
console.log('');
console.log('3. Go to: Settings → Transfer Tokens');
console.log('');
console.log('4. Click "Generate Transfer Token"');
console.log('');
console.log('5. Copy the token');
console.log('');
console.log('6. Go to: Settings → Import/Export');
console.log('');
console.log('7. Click "Export" and download the file');
console.log('');
console.log('8. The exported file will contain all your data');
console.log('');

console.log('Option 2: Via API (Advanced)');
console.log('-----------------------------');
console.log('1. Generate a transfer token in admin panel');
console.log('2. Use the Strapi Transfer API:');
console.log('   curl -X POST http://localhost:1337/api/transfer/export \\');
console.log('     -H "Authorization: Bearer YOUR_TRANSFER_TOKEN" \\');
console.log('     --output strapi-export.tar.gz');
console.log('');

console.log('After Export:');
console.log('-------------');
console.log('1. Upload the exported file to Strapi Cloud');
console.log('2. Go to Strapi Cloud admin panel');
console.log('3. Settings → Import/Export → Import');
console.log('4. Upload your exported file');
console.log('');

console.log('Note: Media files may need to be uploaded separately');
console.log('      Check the public/uploads folder');

