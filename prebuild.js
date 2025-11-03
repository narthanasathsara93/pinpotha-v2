// prebuild.js
const fs = require('fs');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const env = dotenv.config();
dotenvExpand.expand(env);

const environmentFile = `
export const environment = {
  production: false,
  SUPABASE_URL: '${process.env.SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}',
  SUPABASE_STORAGE_URL: '${process.env.SUPABASE_STORAGE_URL}',
  SUPABASE_BUCKET_NAME: '${process.env.SUPABASE_BUCKET_NAME}',
  SUPABASE_MERITS_TABLE: '${process.env.SUPABASE_MERITS_TABLE}'
};
`;

const prodEnvironmentFile = `
export const environment = {
  production: true,
  SUPABASE_URL: '${process.env.SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}',
  SUPABASE_STORAGE_URL: '${process.env.SUPABASE_STORAGE_URL}',
  SUPABASE_BUCKET_NAME: '${process.env.SUPABASE_BUCKET_NAME}',
  SUPABASE_MERITS_TABLE: '${process.env.SUPABASE_MERITS_TABLE}'
};
`;

fs.writeFileSync('./src/environments/environment.ts', environmentFile);
fs.writeFileSync('./src/environments/environment.prod.ts', prodEnvironmentFile);

console.log('✅ Environment files generated successfully!');
