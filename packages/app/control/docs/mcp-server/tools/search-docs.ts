import { z } from 'zod';
import { docsVectorStore } from '../vector-store/docs-vector-store';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// Schema for search docs tool input
export const SearchDocsArgsSchema = z.object({
  query: z.string().describe('Search query to find relevant documentation'),
  limit: z
    .number()
    .describe('Maximum number of results to return (default: 5)')
    .optional(),
});

type SearchDocsArgs = z.infer<typeof SearchDocsArgsSchema>;

export async function handleSearchDocs(
  args: SearchDocsArgs
): Promise<CallToolResult> {
  const parsed = SearchDocsArgsSchema.safeParse(args);
  if (!parsed.success) {
    return {
      content: [
        {
          type: 'text',
          text: `Invalid arguments for search-docs: ${JSON.stringify(parsed.error.issues)}`,
        },
      ],
      isError: true,
    };
  }

  const { query, limit = 5 } = parsed.data;
  const searchResults = await docsVectorStore.search(query, limit);

  if (searchResults.length === 0) {
    return {
      content: [
        { type: 'text', text: `No documentation found for query: "${query}"` },
      ],
    };
  }
  // Build full content string - concatenate all docs in order
  const fullContent = searchResults
    .map(result => result.data || '')
    .join('\n\n');

  return {
    content: [{ type: 'text', text: fullContent }],
  };
}
