import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import type { DocumentChunk } from './types';

class DocumentChunker {
  private docsPath: string;
  private documents: DocumentChunk[] = [];

  constructor(docsPath: string = join(process.cwd(), 'docs')) {
    this.docsPath = docsPath;
  }

  /**
   * Load all documentation files and return full documents
   */
  async loadDocs(): Promise<DocumentChunk[]> {
    console.log(`Loading documentation from: ${this.docsPath}`);
    const mdxFiles = this.findMdxFiles(this.docsPath);
    console.log(`Found ${mdxFiles.length} MDX files`);

    this.documents = [];
    for (const filepath of mdxFiles) {
      await this.loadDocument(filepath);
    }

    console.log(`Loaded ${this.documents.length} documents`);
    return this.documents;
  }

  /**
   * Recursively find all .mdx files in the docs directory
   */
  private findMdxFiles(dir: string): string[] {
    const files: string[] = [];

    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip mcp-server directory to avoid loading this file itself
        if (item === 'mcp-server') continue;
        files.push(...this.findMdxFiles(fullPath));
      } else if (extname(item) === '.mdx') {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Load a single document as a full document
   */
  private async loadDocument(filepath: string): Promise<void> {
    const content = readFileSync(filepath, 'utf-8');
    const relativePath = relative(this.docsPath, filepath);

    const documentChunk: DocumentChunk = {
      id: relativePath,
      content: content,
      metadata: {
        filepath: relativePath,
        title: relativePath,
        chunkIndex: 0,
        totalChunks: 1,
      },
    };

    this.documents.push(documentChunk);
  }
}

// Export a convenience function for easy use
export async function loadDocuments(
  docsPath?: string
): Promise<DocumentChunk[]> {
  const chunker = new DocumentChunker(docsPath);
  return chunker.loadDocs();
}
