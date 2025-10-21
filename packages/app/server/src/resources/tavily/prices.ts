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
