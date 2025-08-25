import { PrismaClient } from '../generated/prisma';
import logger from '../logger';

// GitHub API interface for repo validation
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: {
    id: number;
    login: string;
    avatar_url: string;
  };
  private: boolean;
}

class GitHubApiClient {
  private readonly baseUrl = 'https://api.github.com';

  async searchRepoByPath(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Echo-Server',
        },
      });

      if (!response.ok) {
        return null;
      }

      const repository = await response.json();
      return repository;
    } catch (error) {
      console.error('Error searching GitHub repo by path:', error);
      return null;
    }
  }
}

const githubClient = new GitHubApiClient();

export interface RepoSlugResolutionResult {
  /** The resolved app UUID */
  appId: string;
  /** Whether this app was auto-created */
  wasCreated: boolean;
  /** GitHub repo information */
  repoInfo?: {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    owner: {
      id: number;
      login: string;
      avatar_url: string;
    };
    private: boolean;
  };
}

export interface RepoSlugMappingCache {
  appId: string;
  owner: string;
  repo: string;
  isCanonical: boolean;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Service for resolving GitHub owner/repo slugs to Echo app IDs
 * 
 * This service handles:
 * - Resolution of owner/repo slugs to existing app UUIDs
 * - Auto-creation of apps for public GitHub repos
 * - Caching of resolution results
 * - GitHub API validation
 */
export class RepoSlugService {
  private readonly db: PrismaClient;
  private readonly cache: Map<string, RepoSlugMappingCache> = new Map();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(db: PrismaClient) {
    this.db = db;
  }

  /**
   * Resolve a GitHub owner/repo slug to an Echo app ID
   * 
   * @param owner - GitHub username or organization name
   * @param repo - GitHub repository name
   * @returns Promise resolving to app ID and metadata, or null if invalid/private repo
   */
  async resolveSlugToAppId(
    owner: string,
    repo: string
  ): Promise<RepoSlugResolutionResult | null> {
    const slug = `${owner}/${repo}`;
    
    try {
      // Check cache first
      const cached = this.getCachedMapping(slug);
      if (cached) {
        logger.debug(`Using cached mapping for ${slug} -> ${cached.appId}`);
        return {
          appId: cached.appId,
          wasCreated: false
        };
      }

      // Check database for existing mapping
      const existingMapping = await this.findExistingMapping(owner, repo);
      if (existingMapping) {
        this.setCachedMapping(slug, {
          appId: existingMapping.appId,
          owner,
          repo,
          isCanonical: existingMapping.isCanonical,
          createdAt: existingMapping.createdAt,
          expiresAt: new Date(Date.now() + this.CACHE_TTL_MS)
        });
        
        logger.debug(`Found existing mapping for ${slug} -> ${existingMapping.appId}`);
        return {
          appId: existingMapping.appId,
          wasCreated: false
        };
      }

      // Validate repo exists and is public on GitHub
      const repoInfo = await this.validateGitHubRepo(owner, repo);
      if (!repoInfo) {
        logger.warn(`GitHub repo ${slug} not found or is private`);
        return null;
      }

      // Auto-create app for this repo
      const newApp = await this.createAppForRepo(owner, repo, repoInfo);
      
      // Cache the new mapping
      this.setCachedMapping(slug, {
        appId: newApp.appId,
        owner,
        repo,
        isCanonical: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_TTL_MS)
      });

      logger.info(`Auto-created app ${newApp.appId} for GitHub repo ${slug}`);
      
      return {
        appId: newApp.appId,
        wasCreated: true,
        repoInfo
      };

    } catch (error) {
      logger.error(`Error resolving slug ${slug}:`, error);
      return null;
    }
  }

  /**
   * Check if a repo slug has a canonical mapping to an app
   */
  async hasCanonicalMapping(owner: string, repo: string): Promise<boolean> {
    const mapping = await this.findExistingMapping(owner, repo);
    return mapping?.isCanonical ?? false;
  }

  /**
   * Get cached mapping if valid
   */
  private getCachedMapping(slug: string): RepoSlugMappingCache | null {
    const cached = this.cache.get(slug);
    if (cached && cached.expiresAt > new Date()) {
      return cached;
    }
    
    // Remove expired cache entry
    if (cached) {
      this.cache.delete(slug);
    }
    
    return null;
  }

  /**
   * Set cached mapping
   */
  private setCachedMapping(slug: string, mapping: RepoSlugMappingCache): void {
    this.cache.set(slug, mapping);
  }

  /**
   * Find existing repo slug mapping in database
   */
  private async findExistingMapping(owner: string, repo: string) {
    // First check the new repo_slug_mappings table
    const slugMapping = await this.db.repoSlugMapping.findFirst({
      where: {
        owner,
        repo,
        isArchived: false
      }
    });

    if (slugMapping) {
      return {
        appId: slugMapping.echoAppId,
        isCanonical: slugMapping.isCanonical,
        createdAt: slugMapping.createdAt
      };
    }

    // Fallback to GithubLink table for existing apps (migration compatibility)
    const githubLink = await this.db.githubLink.findFirst({
      where: {
        githubType: 'repo',
        githubUrl: `https://github.com/${owner}/${repo}`,
        isArchived: false
      },
      include: {
        echoApp: true
      }
    });

    if (githubLink) {
      // Create a mapping in the new table for future lookups
      await this.db.repoSlugMapping.create({
        data: {
          echoAppId: githubLink.echoAppId,
          owner,
          repo,
          isCanonical: true
        }
      });

      return {
        appId: githubLink.echoAppId,
        isCanonical: true,
        createdAt: githubLink.createdAt
      };
    }

    return null;
  }

  /**
   * Validate that a GitHub repo exists and is public
   */
  private async validateGitHubRepo(owner: string, repo: string) {
    try {
      const repoInfo = await githubClient.searchRepoByPath(owner, repo);
      
      if (!repoInfo) {
        return null;
      }

      // Only allow public repositories
      if (repoInfo.private) {
        logger.warn(`Repo ${owner}/${repo} is private, not auto-creating app`);
        return null;
      }

      return repoInfo;
    } catch (error) {
      logger.error(`Error validating GitHub repo ${owner}/${repo}:`, error);
      return null;
    }
  }

  /**
   * Create a new Echo app for a GitHub repository
   */
  private async createAppForRepo(
    owner: string, 
    repo: string, 
    repoInfo: any
  ): Promise<{ appId: string }> {
    const appName = `${owner}/${repo}`;
    const appDescription = repoInfo.description || `Auto-created app for GitHub repository ${owner}/${repo}`;

    // Create the app, GitHub link, and repo slug mapping in a transaction
    const result = await this.db.$transaction(async (tx) => {
      // Create the Echo app
      const echoApp = await tx.echoApp.create({
        data: {
          name: appName,
          description: appDescription,
          homepageUrl: repoInfo.html_url,
          isPublic: true // GitHub repos are public, so make the app public too
        }
      });

      // Create the GitHub link (for backward compatibility)
      await tx.githubLink.create({
        data: {
          githubId: repoInfo.id,
          githubType: 'repo',
          githubUrl: repoInfo.html_url,
          description: `Auto-created for repository ${owner}/${repo}`,
          echoAppId: echoApp.id
        }
      });

      // Create the repo slug mapping
      await tx.repoSlugMapping.create({
        data: {
          echoAppId: echoApp.id,
          owner,
          repo,
          isCanonical: true
        }
      });

      return { appId: echoApp.id };
    });

    return result;
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}