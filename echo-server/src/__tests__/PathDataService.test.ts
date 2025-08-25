import { describe, it, expect } from 'vitest';
import {
  extractAppIdFromPath,
  hasAppId,
  isUuidAppId,
  isRepoSlugAppId,
} from '../services/PathDataService';

describe('PathDataService', () => {
  describe('extractAppIdFromPath', () => {
    describe('UUID app IDs', () => {
      it('should extract valid UUID app ID from path', () => {
        const path = '/12345678-1234-1234-1234-123456789012/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe('12345678-1234-1234-1234-123456789012');
        expect(result.remainingPath).toBe('/v1/chat/completions');
        expect(result.appIdType).toBe('uuid');
      });

      it('should handle UUID in different cases', () => {
        const path = '/ABCDEF12-1234-5678-9012-123456789ABC/v1/models';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe('ABCDEF12-1234-5678-9012-123456789ABC');
        expect(result.appIdType).toBe('uuid');
      });

      it('should return null for invalid UUID format', () => {
        const path = '/invalid-uuid-format/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBeNull();
        expect(result.remainingPath).toBe(path);
        expect(result.appIdType).toBeNull();
      });
    });

    describe('owner/repo app IDs', () => {
      it('should extract valid owner/repo slug from path', () => {
        const path = '/facebook/react/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe('facebook/react');
        expect(result.remainingPath).toBe('/v1/chat/completions');
        expect(result.appIdType).toBe('repo-slug');
      });

      it('should handle organization/repo format', () => {
        const path = '/microsoft/typescript/v1/models';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe('microsoft/typescript');
        expect(result.remainingPath).toBe('/v1/models');
        expect(result.appIdType).toBe('repo-slug');
      });

      it('should handle repo names with hyphens and underscores', () => {
        const path = '/user_name/repo-name_test/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe('user_name/repo-name_test');
        expect(result.appIdType).toBe('repo-slug');
      });

      it('should handle single character owner/repo names', () => {
        const path = '/a/b/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe('a/b');
        expect(result.appIdType).toBe('repo-slug');
      });
    });

    describe('invalid formats', () => {
      it('should reject owner names that are too long', () => {
        const longOwner = 'a'.repeat(40); // GitHub username max is 39
        const path = `/${longOwner}/repo/v1/chat/completions`;
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBeNull();
        expect(result.appIdType).toBeNull();
      });

      it('should reject repo names that are too long', () => {
        const longRepo = 'a'.repeat(101); // GitHub repo name max is 100
        const path = `/owner/${longRepo}/v1/chat/completions`;
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBeNull();
        expect(result.appIdType).toBeNull();
      });

      it('should reject names starting with hyphens', () => {
        const path = '/-invalid/repo/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBeNull();
        expect(result.appIdType).toBeNull();
      });

      it('should reject names ending with hyphens', () => {
        const path = '/owner/invalid-/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBeNull();
        expect(result.appIdType).toBeNull();
      });

      it('should handle single segment paths', () => {
        const path = '/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBeNull();
        expect(result.remainingPath).toBe(path);
        expect(result.appIdType).toBeNull();
      });
    });

    describe('precedence rules', () => {
      it('should prefer UUID over repo slug format for collision', () => {
        // This is an edge case where someone creates a repo with a UUID-like name
        const uuid = '12345678-1234-1234-1234-123456789012';
        const path = `/${uuid}/repo/v1/chat/completions`;
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe(uuid);
        expect(result.appIdType).toBe('uuid');
        expect(result.remainingPath).toBe('/repo/v1/chat/completions');
      });
    });

    describe('edge cases', () => {
      it('should handle empty path', () => {
        const result = extractAppIdFromPath('');

        expect(result.appId).toBeNull();
        expect(result.remainingPath).toBe('');
        expect(result.appIdType).toBeNull();
      });

      it('should handle root path', () => {
        const result = extractAppIdFromPath('/');

        expect(result.appId).toBeNull();
        expect(result.remainingPath).toBe('/');
        expect(result.appIdType).toBeNull();
      });

      it('should handle path without leading slash', () => {
        const path = 'facebook/react/v1/chat/completions';
        const result = extractAppIdFromPath(path);

        expect(result.appId).toBe('facebook/react');
        expect(result.appIdType).toBe('repo-slug');
      });
    });
  });

  describe('type guard functions', () => {
    describe('hasAppId', () => {
      it('should return true for UUID app ID', () => {
        const result = {
          appId: '12345678-1234-1234-1234-123456789012',
          remainingPath: '/v1/chat',
          appIdType: 'uuid' as const,
        };

        expect(hasAppId(result)).toBe(true);
      });

      it('should return true for repo slug app ID', () => {
        const result = {
          appId: 'facebook/react',
          remainingPath: '/v1/chat',
          appIdType: 'repo-slug' as const,
        };

        expect(hasAppId(result)).toBe(true);
      });

      it('should return false for null app ID', () => {
        const result = {
          appId: null,
          remainingPath: '/v1/chat',
          appIdType: null,
        };

        expect(hasAppId(result)).toBe(false);
      });
    });

    describe('isUuidAppId', () => {
      it('should return true for UUID app ID', () => {
        const result = {
          appId: '12345678-1234-1234-1234-123456789012',
          remainingPath: '/v1/chat',
          appIdType: 'uuid' as const,
        };

        expect(isUuidAppId(result)).toBe(true);
      });

      it('should return false for repo slug app ID', () => {
        const result = {
          appId: 'facebook/react',
          remainingPath: '/v1/chat',
          appIdType: 'repo-slug' as const,
        };

        expect(isUuidAppId(result)).toBe(false);
      });
    });

    describe('isRepoSlugAppId', () => {
      it('should return true for repo slug app ID', () => {
        const result = {
          appId: 'facebook/react',
          remainingPath: '/v1/chat',
          appIdType: 'repo-slug' as const,
        };

        expect(isRepoSlugAppId(result)).toBe(true);
      });

      it('should return false for UUID app ID', () => {
        const result = {
          appId: '12345678-1234-1234-1234-123456789012',
          remainingPath: '/v1/chat',
          appIdType: 'uuid' as const,
        };

        expect(isRepoSlugAppId(result)).toBe(false);
      });
    });
  });
});