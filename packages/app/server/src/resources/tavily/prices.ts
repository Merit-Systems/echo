export const CREDIT_PRICE = 0.008; // $0.008 per credit

// Tavily Search pricing
export const TAVILY_SEARCH_PRICING = {
  basic: 1, // 1 credit per request
  advanced: 2, // 2 credits per request
} as const;

// Tavily Extract pricing
export const TAVILY_EXTRACT_PRICING = {
  basic: {
    creditsPerUnit: 1,
    urlsPerCredit: 5, // Every 5 successful URL extractions cost 1 credit
  },
  advanced: {
    creditsPerUnit: 2,
    urlsPerCredit: 5, // Every 5 successful URL extractions cost 2 credits
  },
} as const;

// Tavily Map pricing
export const TAVILY_MAP_PRICING = {
  regular: {
    creditsPerUnit: 1,
    pagesPerCredit: 10, // Every 10 successful pages cost 1 credit
  },
  withInstructions: {
    creditsPerUnit: 2,
    pagesPerCredit: 10, // Every 10 successful pages with instructions cost 2 credits
  },
} as const;

// Calculate costs
export function calculateSearchCost(searchDepth: "basic" | "advanced" = "basic"): number {
  return TAVILY_SEARCH_PRICING[searchDepth] * CREDIT_PRICE;
}

export function calculateExtractCost(
  successfulUrls: number,
  extractionDepth: "basic" | "advanced" = "basic"
): number {
  const { creditsPerUnit, urlsPerCredit } = TAVILY_EXTRACT_PRICING[extractionDepth];
  const credits = Math.ceil(successfulUrls / urlsPerCredit) * creditsPerUnit;
  return credits * CREDIT_PRICE;
}

export function calculateMapCost(
  successfulPages: number,
  withInstructions: boolean = false
): number {
  const pricing = withInstructions
    ? TAVILY_MAP_PRICING.withInstructions
    : TAVILY_MAP_PRICING.regular;
  const credits = Math.ceil(successfulPages / pricing.pagesPerCredit) * pricing.creditsPerUnit;
  return credits * CREDIT_PRICE;
}

export function calculateCrawlCost(
  successfulPages: number,
  extractionDepth: "basic" | "advanced" = "basic"
): number {
  // Crawl cost = Mapping cost + Extraction cost
  const mappingCost = calculateMapCost(successfulPages, false);
  const extractionCost = calculateExtractCost(successfulPages, extractionDepth);
  return mappingCost + extractionCost;
}