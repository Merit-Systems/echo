'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Repository } from '@/types/github';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Connection = {
  installation_id: number;
  account_login?: string | null;
  account_id?: number | null;
  repositories: Repository[];
};

export default function RepoSelector() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');

  // Flatten all repositories across connections
  const allRepos = connections.flatMap(c => c.repositories);

  useEffect(() => {
    let mounted = true;
    fetch('/api/github/connections')
      .then(async r => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(data => {
        if (!mounted) return;
        setConnections(data.connections ?? []);
      })
      .catch(e => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load connections');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading repositories…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const hasConnections = connections.length > 0;

  return (
    <div className="w-full space-y-4">
      <div className="text-xl font-semibold">
        Select Repository to Summarize
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Choose a repository:</label>
        <Select
          value={selectedRepo}
          onValueChange={value => {
            if (value === '__install__') {
              window.location.href = '/api/github/install';
              return;
            }
            setSelectedRepo(value);
            const [owner, repo] = value.split('/');
            if (owner && repo) {
              router.push(`/?owner=${owner}&repo=${repo}`);
            }
          }}
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Choose a repository..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Import from installed orgs</SelectLabel>
              {hasConnections &&
                allRepos.map(repo => (
                  <SelectItem key={repo.id} value={repo.full_name}>
                    <div className="flex items-center gap-2">
                      <span>{repo.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {repo.private ? 'private' : 'public'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectGroup>

            <SelectSeparator />
            <SelectItem value="__install__">+ Install GitHub App</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
