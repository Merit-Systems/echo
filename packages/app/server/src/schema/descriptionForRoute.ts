export function getDescriptionForRoute(path: string): string | undefined {
  if (path.endsWith('/videos')) {
    return "Generates videos using OpenAI's video generation models. Accepts various parameters to customize video output including prompts and configuration options.";
  }
  if (path.endsWith('/images/generations')) {
    return "Creates images using OpenAI's image generation models. Supports text-to-image generation with customizable size, quality, and style parameters.";
  }
  if (path.endsWith(':generateContent')) {
    return "Generates images using Gemini's image generation models. Processes multimodal input including text and images to produce AI-generated visual content.";
  }
  if (path.endsWith('/chat/completions')) {
    return 'Generates conversational AI responses using various language models. Supports streaming, function calling, and multi-turn conversations with customizable parameters.';
  }
  if (path.endsWith('/tavily/search')) {
    return "Performs web searches using Tavily's search API. Returns relevant search results with content snippets and metadata for research and information retrieval.";
  }
  if (path.endsWith('/tavily/extract')) {
    return 'Extracts structured content from web pages using Tavily. Cleans and processes raw HTML into readable, structured text data.';
  }
  if (path.endsWith('/tavily/crawl')) {
    return "Crawls websites and extracts content using Tavily's web crawler. Retrieves and processes multiple pages from a domain with configurable depth and filters.";
  }
  if (path.endsWith('/e2b/execute')) {
    return 'Executes code in secure sandboxed environments using E2B. Supports multiple programming languages with isolated execution and real-time output capture.';
  }

  return undefined;
}
