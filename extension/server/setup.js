/**
 * Setup script for Cookie Extractor Server
 * This script creates a default .env file if one doesn't exist
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
  console.log('📝 .env file already exists. Skipping creation.');
  process.exit(0);
}

// Generate a random JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Default .env content
const envContent = `# Server configuration
PORT=3001
JWT_SECRET=${jwtSecret}

# Supabase configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-api-key

# This is a development environment file
# Replace the Supabase values with your actual project details
`;

// Write .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ Created default .env file');
console.log('⚠️  Please update the Supabase configuration in the .env file with your actual project details.');
console.log('📚 For more information, see the SUPABASE_SETUP.md file.'); 