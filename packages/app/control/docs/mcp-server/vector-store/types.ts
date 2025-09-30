export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    filepath: string;
    title?: string;
    section?: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    filepath: string;
    title?: string;
    section?: string;
    chunkIndex: number;
    totalChunks: number;
  };
  data: string;
}
