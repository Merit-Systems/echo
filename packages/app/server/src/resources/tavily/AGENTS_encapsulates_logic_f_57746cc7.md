# Tavily Resources (packages/app/server/src/resources/tavily)

## Purpose
Encapsulates logic for extracting and crawling Tavily data, enabling data ingestion workflows. It manages the separation between crawling (fetching data) and extraction (processing data), ensuring modularity and clarity in data pipeline stages.

## Boundaries
- **Belongs here:**  
  - Core crawling logic in `tavily.ts` (fetching, scheduling, retry policies).  
  - Data extraction routines in `tavily.ts` (parsing, transforming raw data).  
  - Configuration and constants specific to Tavily data sources.  
- **Does NOT belong here:**  
  - External API integrations outside Tavily scope (should be abstracted).  
  - Data storage or database interactions (handled elsewhere).  
  - UI or client-facing logic.  
  - Shared utilities unrelated to Tavily data processing.

## Invariants
- **Data Consistency:**  
  - Extracted data must conform to predefined schemas; invalid data should trigger errors or be logged for review.  
- **Sequential Processing:**  
  - Crawl and extract functions should follow a predictable sequence; extraction must only process data fetched by the corresponding crawl cycle.  
- **Resource Management:**  
  - Network requests must respect rate limits; retries should implement exponential backoff.  
- **Null Safety:**  
  - All optional fields must be checked before use; avoid null dereferences.  
- **Version Stability:**  
  - Frequent modifications in `tavily.ts` imply the need for rigorous testing to prevent regressions.

## Patterns
- **Naming:**  
  - Use clear, descriptive function and variable names reflecting their roles (`fetchTavilyData`, `parseTavilyResponse`).  
- **Error Handling:**  
  - Failures in crawling or extraction should be caught, logged, and optionally retried with exponential backoff.  
- **Modularity:**  
  - Separate concerns: crawling logic in `crawl/tavily.ts`, extraction in `extract/tavily.ts`.  
- **Configuration:**  
  - Use environment variables or config files for endpoints, timeouts, and retry policies.  
- **Logging:**  
  - Log start/end of each major step; include identifiers for traceability.

## Pitfalls
- **Churn Risks:**  
  - Frequent changes in `tavily.ts` suggest instability; agents must verify compatibility after each update.  
- **Coupling:**  
  - Tight coupling between crawl and extract modules can cause cascading failures; ensure loose interfaces.  
- **Null/Undefined Data:**  
  - Data fetched may be incomplete or malformed; validate before processing.  
- **Rate Limits & Retries:**  
  - Ignoring rate limits or retry policies can cause bans or inconsistent data.  
- **Version Mismatch:**  
  - Changes in external Tavily API may break extraction; monitor external API updates.

## Dependencies
- **External APIs:**  
  - Tavily data source endpoints (must be configured correctly).  
- **HTTP Client Libraries:**  
  - Use consistent, reliable libraries for network requests, with built-in retry support if possible.  
- **Logging Framework:**  
  - Ensure logs are structured and include context (e.g., request IDs).  
- **Configuration Management:**  
  - Use environment variables or config files for endpoint URLs, timeouts, and retry counts.  
- **Testing Framework:**  
  - Rigorously test both modules after each change, especially given high churn.

---

**Summary:**  
Agents working on the Tavily resource modules must understand the separation of concerns between crawling and extraction, the importance of data validation, and the need for robust error handling and retry logic. Frequent modifications necessitate vigilant testing and validation to prevent regressions. Proper configuration and logging are critical for maintainability and debugging.