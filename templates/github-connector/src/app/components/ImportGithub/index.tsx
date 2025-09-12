'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Repository } from '@/types/github';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Connection {
  installation_id: number;
  account_login?: string | null;
  account_id?: number | null;
  repositories: Repository[];
}

export default function ImportGithub(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);

  const owner = searchParams.get('owner') ?? '';
  const repo = searchParams.get('repo') ?? '';
  const hasSelectedRepo = owner.length > 0 && repo.length > 0;

  const [open, setOpen] = useState<boolean>(!hasSelectedRepo);
  const [query, setQuery] = useState<string>('');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const panelRef = useRef<HTMLDivElement | null>(null);

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

  // Inline panel; no global outside-click handler needed

  const orgOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: Array<{ key: string; label: string }> = [];
    for (const c of connections) {
      const key = c.account_login ?? `installation-${c.installation_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({ key, label: c.account_login ?? 'Unknown org' });
    }
    return options;
  }, [connections]);

  const repos = useMemo(() => {
    const all = connections.flatMap(c =>
      c.repositories.map(r => ({
        ...r,
        installation_id: c.installation_id,
        account_login: c.account_login ?? `installation-${c.installation_id}`,
      }))
    );
    const filteredByOrg =
      orgFilter === 'all'
        ? all
        : all.filter(r => r.account_login === orgFilter);
    const q = query.trim().toLowerCase();
    return q.length === 0
      ? filteredByOrg
      : filteredByOrg.filter(
          r =>
            r.full_name.toLowerCase().includes(q) ||
            r.owner?.login?.toLowerCase().includes(q)
        );
  }, [connections, orgFilter, query]);

  if (loading) return <div>Loading repositories…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const hasConnections = connections.length > 0;

  return (
    <div className="w-full">
      <div className="w-full max-w-2xl space-y-3 mx-auto">
        {!open && hasSelectedRepo ? (
          <div className="w-full rounded-lg border bg-background p-3 flex items-center justify-between">
            <div className="truncate">
              <div className="text-sm text-muted-foreground">Repository</div>
              <div className="font-medium truncate">
                {owner}/{repo}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(true)}
            >
              Change
            </Button>
          </div>
        ) : (
          <>
            <div className="text-xl font-semibold text-center">
              Import Git Repository
            </div>

            <div
              ref={panelRef}
              className="w-full rounded-lg border bg-background p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="text-sm text-muted-foreground">
                  Organization
                </div>
                <Select
                  value={orgFilter}
                  onValueChange={value => {
                    if (value === '__add__') {
                      window.location.href = '/api/github/install';
                      return;
                    }
                    setOrgFilter(value);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Select org" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {orgOptions.map(o => (
                      <SelectItem key={o.key} value={o.key}>
                        {o.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add__">
                      + Add GitHub Account
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="w-full sm:ml-auto sm:flex-1 sm:max-w-sm">
                  <Input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search repositories..."
                  />
                </div>
              </div>

              <div className="mt-4 divide-y">
                {repos.slice(0, 5).map(repo => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {repo.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {repo.private ? 'private' : 'public'}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const [ownerName, name] = repo.full_name.split('/');
                        router.push(`/?owner=${ownerName}&repo=${name}`);
                        setOpen(false);
                      }}
                      variant="default"
                      className="ml-4"
                    >
                      Import
                    </Button>
                  </div>
                ))}

                {repos.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No repositories found.
                  </div>
                )}
              </div>

              {!hasConnections && (
                <div className="mt-4 flex items-center justify-between rounded-md border p-3">
                  <div className="text-sm">No GitHub connections yet.</div>
                  <Button
                    variant="default"
                    onClick={() =>
                      (window.location.href = '/api/github/install')
                    }
                  >
                    + Install GitHub App
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
