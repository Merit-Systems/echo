#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { join } from 'path';
import { docsVectorStore } from './docs-vector-store.js';

// Load environment variables from .env file in project root
dotenv.config({ path: join(process.cwd(), '.env') });

async function main() {
  console.log('Starting documentation upsert to Upstash Vector...');

  // Check environment variables
  if (
    !process.env.UPSTASH_VECTOR_REST_URL ||
    !process.env.UPSTASH_VECTOR_REST_TOKEN
  ) {
    console.error(
      'Error: UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN environment variables are required'
    );
    process.exit(1);
  }

  console.log('Environment variables found');

  // Load and upsert documents
  await docsVectorStore.loadDocs();

  console.log('Documentation upsert completed successfully!');
}

main().catch(error => {
  console.error('Error upserting documents:', error);
  process.exit(1);
});
