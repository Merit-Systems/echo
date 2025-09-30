import { join } from 'path';
import { Index } from '@upstash/vector';
import dotenv from 'dotenv';
import type { DocumentChunk, SearchResult } from './types';
import { loadDocuments } from './chunker';

dotenv.config({ path: join(process.cwd(), '.env') });

class DocsVectorStore {
  private index: Index;
  private documents: DocumentChunk[] = [];
  private docsPath: string;

  constructor(docsPath: string = join(process.cwd(), 'docs')) {
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
    this.docsPath = docsPath;
  }

  /**
   * Load all documentation files into the vector store
   */
  async loadDocs(): Promise<void> {
    console.log('Clearing existing vectors from database...');
    await this.clearAllVectors();

    this.documents = await loadDocuments(this.docsPath);
    await this.upsertDocuments();
  }

  /**
   * Clear all vectors from the database
   */
  async clearAllVectors(): Promise<void> {
    try {
      await this.index.reset();
      console.log('All existing vectors cleared from database');
    } catch (error) {
      console.error('Error clearing vectors:', error);
      throw error;
    }
  }

  /**
   * Upsert all documents to Upstash Vector
   */
  async upsertDocuments(): Promise<void> {
    console.log(
      `Upserting ${this.documents.length} documents to Upstash Vector...`
    );

    const vectors = this.documents.map(doc => ({
      id: doc.id,
      data: doc.content,
      metadata: doc.metadata,
    }));

    // Batch upsert in chunks of 100 (Upstash Vector limit)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index.upsert(batch);
      console.log(
        `Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`
      );
    }

    console.log('All documents upserted successfully!');
  }

  /**
   * Search using Upstash Vector semantic search
   */
  async search(query: string, limit = 10): Promise<SearchResult[]> {
    const results = await this.index.query({
      data: query,
      topK: limit,
      includeMetadata: true,
      includeData: true,
    });

    return results.map(
      (result): SearchResult => ({
        id: result.id as string,
        score: result.score,
        metadata: result.metadata as SearchResult['metadata'],
        data: result.data!,
      })
    );
  }
}

// Create and export a singleton instance
export const docsVectorStore = new DocsVectorStore();
