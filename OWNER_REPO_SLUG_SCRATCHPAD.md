# Owner/Repo Slug as App ID - Design Scratchpad

## Current Architecture

### App ID System
- **Current Format**: UUID (e.g., `12345678-1234-1234-1234-123456789012`)
- **Path Structure**: `/{app-id}/v1/chat/completions`
- **Extraction**: `PathDataService.extractAppIdFromPath()` looks for UUID pattern
- **Storage**: `EchoApp.id` (UUID string)
- **Relationships**: API keys, transactions, all scoped to `echoAppId`

### GitHub Integration
- **Current Model**: `GithubLink` has one-to-one relationship with `EchoApp`
- **Fields**: `githubId`, `githubType` (user/repo), `githubUrl`
- **API**: `githubApi.searchRepoByPath(owner, repo)` exists

## Proposed Solution: Dual App ID Support

### Goals
1. Support `owner/repo` format as app ID for public GitHub repos
2. Auto-create apps on first usage with owner/repo slug
3. Maintain backward compatibility with existing UUID app IDs
4. Handle edge cases elegantly
5. Minimize maintenance burden

### Design Approach

#### 1. Enhanced Path Extraction
**Current**: Only recognizes UUID patterns
**New**: Recognize both UUID and `owner/repo` patterns

```typescript
// Examples of supported paths:
// Legacy: /12345678-1234-1234-1234-123456789012/v1/chat/completions
// New: /facebook/react/v1/chat/completions
// New: /microsoft/typescript/v1/chat/completions
```

#### 2. App Resolution Strategy
When `owner/repo` format detected:

1. **Check existing apps**: Look for app with matching GitHub link
2. **Auto-create if not found**: Create new app for public GitHub repo
3. **Validate repo exists**: Use existing `githubApi.searchRepoByPath()`
4. **Return app context**: Standard app ID for downstream processing

#### 3. Database Strategy

**Option A: Virtual App IDs (Recommended)**
- Keep `EchoApp.id` as UUID
- Add resolver layer that maps `owner/repo` → app UUID
- Use existing `GithubLink` table for mapping
- Minimal schema changes

**Option B: Composite Primary Keys**
- More complex, affects all related tables
- Not recommended due to maintenance burden

#### 4. Implementation Strategy

**Phase 1: Path Recognition**
- Extend `PathDataService` to detect `owner/repo` format
- Add GitHub repo validation
- Return consistent app ID format internally

**Phase 2: App Resolution Service**
- Create service to resolve `owner/repo` → app UUID  
- Handle auto-creation of missing apps
- Cache for performance

**Phase 3: Edge Case Handling**
- Multiple apps per repo
- Ownership changes
- Private repos (reject)

## Edge Cases & Solutions

### 1. Multiple Apps Per Repo
**Problem**: What if a repo already has multiple Echo apps?
**Solution**: 
- First app created gets the "canonical" `owner/repo` slug
- Additional apps must use UUID format
- Store mapping in `repo_slug_mappings` table with `is_canonical` flag

### 2. Ownership Changes / Repo Renames  
**Problem**: GitHub repo renamed from `oldowner/oldrepo` to `newowner/newrepo`
**Solution**:
- Keep original app UUID unchanged
- Add redirect handling for old slug
- Optional: Allow admin to update canonical slug
- Store historical slugs in `repo_slug_mappings`

### 3. Repo Deletion / Goes Private
**Problem**: Public repo becomes private or deleted
**Solution**:
- Keep existing app operational (UUID still works)
- Disable new `owner/repo` access
- Return 404 for slug-based requests
- Preserve historical data

### 4. Collisions with UUID Format
**Problem**: What if someone creates repo named like UUID?
**Solution**: 
- UUID pattern takes precedence (more specific)
- Document this limitation
- Extremely unlikely collision in practice

### 5. Rate Limiting GitHub API
**Problem**: Each slug lookup hits GitHub API
**Solution**:
- Cache repo verification results (TTL: 1 hour)
- Use conditional requests (ETags)
- Implement exponential backoff

## Database Schema Changes

### New Table: `repo_slug_mappings`
```sql
CREATE TABLE repo_slug_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  echo_app_id UUID NOT NULL REFERENCES echo_apps(id),
  owner VARCHAR(255) NOT NULL,
  repo VARCHAR(255) NOT NULL, 
  is_canonical BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner, repo) WHERE is_canonical = true AND is_archived = false
);
```

### Index Strategy
```sql
CREATE INDEX idx_repo_slug_lookup ON repo_slug_mappings(owner, repo) WHERE is_archived = false;
CREATE INDEX idx_repo_slug_app ON repo_slug_mappings(echo_app_id);
```

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. Extend `PathDataService` for `owner/repo` detection
2. Add GitHub repo validation service
3. Create `RepoSlugService` for slug → app resolution
4. Basic auto-creation logic

### Phase 2: Production Ready (Week 2) 
1. Add `repo_slug_mappings` table and migrations
2. Handle edge cases (multiple apps, ownership changes)
3. Add caching and rate limiting
4. Comprehensive testing

### Phase 3: Advanced Features (Week 3)
1. Admin tools for managing slug mappings
2. Redirect handling for historical slugs
3. Analytics and monitoring
4. Documentation and examples

## Benefits of This Approach

### For Users
- **Zero friction**: Public repos work immediately without setup
- **Intuitive**: `owner/repo` format matches GitHub URLs
- **Backward compatible**: Existing UUID apps continue working

### For System
- **Minimal breaking changes**: UUID remains primary key
- **Scalable**: Efficient database queries and caching
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add more GitHub features later

## Risks & Mitigations

### Risk: GitHub API Rate Limits
**Mitigation**: Aggressive caching, conditional requests, graceful degradation

### Risk: Slug Conflicts
**Mitigation**: Clear precedence rules, good error messages

### Risk: Performance Impact
**Mitigation**: Database indexes, Redis caching, async processing

### Risk: Repo Ownership Changes
**Mitigation**: Historical slug tracking, redirect handling

## Success Metrics
- Zero configuration repos: Number of apps auto-created via slug
- API response time: < 200ms for slug resolution (95th percentile)
- GitHub API efficiency: < 1 API call per 10 slug requests (due to caching)
- User adoption: % of new apps using slug format vs UUID

## Conclusion
This design provides an elegant solution that:
- Maintains architectural integrity
- Supports the user experience goal
- Handles edge cases gracefully  
- Minimizes future maintenance burden
- Provides clear migration path

The virtual app ID approach keeps the core system simple while adding powerful new functionality.