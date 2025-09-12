export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization';
}

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

interface GitHubSearchResult {
  type: 'user' | 'repo';
  data: GitHubUser | GitHubRepo;
}

class GitHubApiService {
  private readonly baseUrl = 'https://api.github.com';

  /**
   * Verify a GitHub user by ID
   */
  async verifyUserById(userId: string | number): Promise<GitHubUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Echo-App-Creator',
        },
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Error verifying GitHub user by ID:', error);
      return null;
    }
  }

  /**
   * Verify a GitHub repository by ID
   */
  async verifyRepoById(repoId: string | number): Promise<GitHubRepo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repositories/${repoId}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Echo-App-Creator',
        },
      });

      if (!response.ok) {
        return null;
      }

      const repo = await response.json();
      return repo;
    } catch (error) {
      console.error('Error verifying GitHub repo by ID:', error);
      return null;
    }
  }

  /**
   * Search for a GitHub user by username
   */
  async searchUserByUsername(username: string): Promise<GitHubUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${username}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Echo-App-Creator',
        },
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Error searching GitHub user by username:', error);
      return null;
    }
  }

  /**
   * Search for a GitHub repository by owner/repo path
   */
  async searchRepoByPath(
    owner: string,
    repo: string
  ): Promise<GitHubRepo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Echo-App-Creator',
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

  /**
   * Search for users and repositories by query
   */
  async searchAll(query: string): Promise<GitHubSearchResult[]> {
    const results: GitHubSearchResult[] = [];

    try {
      // Search for users
      const userResponse = await fetch(
        `${this.baseUrl}/search/users?q=${encodeURIComponent(query)}&per_page=5`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Echo-App-Creator',
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        userData.items?.forEach((user: GitHubUser) => {
          results.push({ type: 'user', data: user });
        });
      }

      // Search for repositories
      const repoResponse = await fetch(
        `${this.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&per_page=5`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Echo-App-Creator',
          },
        }
      );

      if (repoResponse.ok) {
        const repoData = await repoResponse.json();
        repoData.items?.forEach((repo: GitHubRepo) => {
          results.push({ type: 'repo', data: repo });
        });
      }
    } catch (error) {
      console.error('Error searching GitHub:', error);
    }

    return results;
  }

  /**
   * Parse a repository path (owner/repo) from various input formats
   */
  parseRepoPath(input: string): { owner: string; repo: string } | null {
    // Remove GitHub URL prefixes if present
    const cleanInput = input
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\.git$/, '')
      .trim();

    // Split by slash and validate
    const parts = cleanInput.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1],
      };
    }

    return null;
  }
}

export const githubApi = new GitHubApiService();
