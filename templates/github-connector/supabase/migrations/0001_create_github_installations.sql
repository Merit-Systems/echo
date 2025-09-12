-- 0001: Create table for GitHub installations keyed by Echo user
create table if not exists public.github_installations (
    echo_user_id text not null,
    installation_id bigint not null,
    account_login text,
    account_id bigint,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (echo_user_id, installation_id)
);

create index if not exists idx_gi_user on public.github_installations(echo_user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_gi_updated_at on public.github_installations;
create trigger trg_gi_updated_at
before update on public.github_installations
for each row execute function public.set_updated_at();


