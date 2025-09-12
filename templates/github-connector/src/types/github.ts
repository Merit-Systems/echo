// Simple GitHub types for our use case
export type Repository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  owner: { login: string; id: number; html_url: string };
};

export type PullRequest = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  user: { login: string; html_url: string };
  created_at: string;
  merged_at?: string;
  body?: string;
};

// For our connections API response
export type GitHubConnection = {
  installation_id: number;
  account_login?: string | null;
  account_id?: number | null;
  repositories: Repository[];
};
