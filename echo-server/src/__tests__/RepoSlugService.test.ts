import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RepoSlugService } from '../services/RepoSlugService';
import { PrismaClient } from '../generated/prisma';

// Mock PrismaClient
vi.mock('../generated/prisma', () => ({
  PrismaClient: vi.fn(),
}));

// Mock fetch for GitHub API calls
global.fetch = vi.fn();

describe('RepoSlugService', () => {
  let repoSlugService: RepoSlugService;
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Prisma client methods
    mockDb = {
      repoSlugMapping: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      githubLink: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      echoApp: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    // @ts-ignore
    PrismaClient.mockImplementation(() => mockDb);
    repoSlugService = new RepoSlugService(mockDb);
  });

  describe('resolveSlugToAppId', () => {
    it('should return cached result if available', async () => {
      // Setup cache
      const owner = 'facebook';
      const repo = 'react';
      const expectedAppId = 'test-app-id';

      // Pre-populate cache
      repoSlugService['cache'].set(`${owner}/${repo}`, {
        appId: expectedAppId,
        owner,
        repo,
        isCanonical: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      });

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result).toEqual({
        appId: expectedAppId,
        wasCreated: false,
      });
      
      // Should not hit the database
      expect(mockDb.repoSlugMapping.findFirst).not.toHaveBeenCalled();
    });

    it('should return existing mapping from database', async () => {
      const owner = 'facebook';
      const repo = 'react';
      const expectedAppId = 'existing-app-id';

      // Mock database response
      mockDb.repoSlugMapping.findFirst.mockResolvedValue({
        echoAppId: expectedAppId,
        isCanonical: true,
        createdAt: new Date(),
      });

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result).toEqual({
        appId: expectedAppId,
        wasCreated: false,
      });

      expect(mockDb.repoSlugMapping.findFirst).toHaveBeenCalledWith({
        where: {
          owner,
          repo,
          isArchived: false,
        },
      });
    });

    it('should fall back to GithubLink table for legacy compatibility', async () => {
      const owner = 'facebook';
      const repo = 'react';
      const expectedAppId = 'legacy-app-id';

      // Mock no result from new table
      mockDb.repoSlugMapping.findFirst.mockResolvedValue(null);

      // Mock result from legacy table
      mockDb.githubLink.findFirst.mockResolvedValue({
        echoAppId: expectedAppId,
        createdAt: new Date(),
      });

      // Mock creating new mapping
      mockDb.repoSlugMapping.create.mockResolvedValue({});

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result).toEqual({
        appId: expectedAppId,
        wasCreated: false,
      });

      // Should check legacy table
      expect(mockDb.githubLink.findFirst).toHaveBeenCalledWith({
        where: {
          githubType: 'repo',
          githubUrl: `https://github.com/${owner}/${repo}`,
          isArchived: false,
        },
        include: {
          echoApp: true,
        },
      });

      // Should create new mapping for future lookups
      expect(mockDb.repoSlugMapping.create).toHaveBeenCalledWith({
        data: {
          echoAppId: expectedAppId,
          owner,
          repo,
          isCanonical: true,
        },
      });
    });

    it('should auto-create app for new public repository', async () => {
      const owner = 'facebook';
      const repo = 'react';
      const newAppId = 'new-app-id';
      
      const mockRepoInfo = {
        id: 123456,
        name: repo,
        full_name: `${owner}/${repo}`,
        description: 'A JavaScript library for building user interfaces',
        html_url: `https://github.com/${owner}/${repo}`,
        owner: {
          id: 69631,
          login: owner,
          avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
        },
        private: false,
      };

      // Mock no existing mappings
      mockDb.repoSlugMapping.findFirst.mockResolvedValue(null);
      mockDb.githubLink.findFirst.mockResolvedValue(null);

      // Mock GitHub API response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepoInfo),
      } as Response);

      // Mock database transaction
      mockDb.$transaction.mockImplementation(async (callback: any) => {
        const mockTx = {
          echoApp: {
            create: vi.fn().mockResolvedValue({ id: newAppId }),
          },
          githubLink: {
            create: vi.fn(),
          },
          repoSlugMapping: {
            create: vi.fn(),
          },
        };
        
        return await callback(mockTx);
      });

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result).toEqual({
        appId: newAppId,
        wasCreated: true,
        repoInfo: mockRepoInfo,
      });

      // Should have called GitHub API
      expect(fetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Echo-Server',
          }),
        })
      );

      // Should have created transaction
      expect(mockDb.$transaction).toHaveBeenCalled();
    });

    it('should return null for private repository', async () => {
      const owner = 'private-owner';
      const repo = 'private-repo';
      
      const mockRepoInfo = {
        id: 123456,
        name: repo,
        full_name: `${owner}/${repo}`,
        description: 'Private repository',
        html_url: `https://github.com/${owner}/${repo}`,
        owner: {
          id: 69631,
          login: owner,
          avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
        },
        private: true, // Private repo
      };

      // Mock no existing mappings
      mockDb.repoSlugMapping.findFirst.mockResolvedValue(null);
      mockDb.githubLink.findFirst.mockResolvedValue(null);

      // Mock GitHub API response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepoInfo),
      } as Response);

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result).toBeNull();
    });

    it('should return null for non-existent repository', async () => {
      const owner = 'nonexistent';
      const repo = 'repo';

      // Mock no existing mappings
      mockDb.repoSlugMapping.findFirst.mockResolvedValue(null);
      mockDb.githubLink.findFirst.mockResolvedValue(null);

      // Mock GitHub API 404 response
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result).toBeNull();
    });

    it('should handle GitHub API errors gracefully', async () => {
      const owner = 'facebook';
      const repo = 'react';

      // Mock no existing mappings
      mockDb.repoSlugMapping.findFirst.mockResolvedValue(null);
      mockDb.githubLink.findFirst.mockResolvedValue(null);

      // Mock fetch error
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result).toBeNull();
    });
  });

  describe('hasCanonicalMapping', () => {
    it('should return true for canonical mapping', async () => {
      const owner = 'facebook';
      const repo = 'react';

      mockDb.repoSlugMapping.findFirst.mockResolvedValue({
        isCanonical: true,
      });

      const result = await repoSlugService.hasCanonicalMapping(owner, repo);

      expect(result).toBe(true);
    });

    it('should return false for non-canonical mapping', async () => {
      const owner = 'facebook';
      const repo = 'react';

      mockDb.repoSlugMapping.findFirst.mockResolvedValue({
        isCanonical: false,
      });

      const result = await repoSlugService.hasCanonicalMapping(owner, repo);

      expect(result).toBe(false);
    });

    it('should return false when no mapping exists', async () => {
      const owner = 'facebook';
      const repo = 'react';

      mockDb.repoSlugMapping.findFirst.mockResolvedValue(null);

      const result = await repoSlugService.hasCanonicalMapping(owner, repo);

      expect(result).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      // Add something to cache
      repoSlugService['cache'].set('test/repo', {
        appId: 'test',
        owner: 'test',
        repo: 'repo',
        isCanonical: true,
        createdAt: new Date(),
        expiresAt: new Date(),
      });

      expect(repoSlugService['cache'].size).toBe(1);

      repoSlugService.clearCache();

      expect(repoSlugService['cache'].size).toBe(0);
    });

    it('should remove expired cache entries', async () => {
      const owner = 'facebook';
      const repo = 'react';

      // Add expired cache entry
      repoSlugService['cache'].set(`${owner}/${repo}`, {
        appId: 'expired',
        owner,
        repo,
        isCanonical: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      });

      // Mock database response
      mockDb.repoSlugMapping.findFirst.mockResolvedValue({
        echoAppId: 'fresh-app-id',
        isCanonical: true,
        createdAt: new Date(),
      });

      const result = await repoSlugService.resolveSlugToAppId(owner, repo);

      expect(result?.appId).toBe('fresh-app-id');
      
      // Cache should be cleared of expired entry
      expect(repoSlugService['cache'].has(`${owner}/${repo}`)).toBe(true);
      expect(repoSlugService['cache'].get(`${owner}/${repo}`)?.appId).toBe('fresh-app-id');
    });
  });
});