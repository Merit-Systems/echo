'use client';

import React, { memo, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '@/lib/utils';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { githubApi, type GitHubUser } from '@/lib/github-api';

export const MinimalGithubAvatar = memo(function MinimalGithubAvatar({
  login,
  className,
  style,
}: {
  login: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Avatar
      className={cn('size-10 rounded-full overflow-hidden', className)}
      style={style}
    >
      <AvatarImage
        src={`https://github.com/${login}.png`}
        alt={login}
        className="object-cover"
      />
      <AvatarFallback className="bg-muted dark:bg-muted p-2 rounded-none flex items-center justify-center">
        <SiGithub className="size-full opacity-60" />
      </AvatarFallback>
    </Avatar>
  );
});

export const GithubAvatar = memo(function GithubAvatar({
  pageUrl,
  className,
  style,
  showName = false,
  linkToProfile = true,
}: {
  pageUrl?: string;
  className?: string;
  style?: React.CSSProperties;
  showName?: boolean;
  linkToProfile?: boolean;
}) {
  const [user, setUser] = useState<GitHubUser | null>(null);

  const owner = React.useMemo(() => {
    if (!pageUrl) return '';
    try {
      const url = pageUrl.startsWith('http')
        ? new URL(pageUrl)
        : new URL(`https://github.com/${pageUrl.replace(/^\/+/, '')}`);
      const [firstSegment] = url.pathname.split('/').filter(Boolean);
      return firstSegment ?? '';
    } catch {
      return '';
    }
  }, [pageUrl]);

  useEffect(() => {
    if (!owner) {
      setUser(null);
      return;
    }
    let isCurrent = true;
    githubApi
      .searchUserByUsername(owner)
      .then(fetched => {
        if (!isCurrent) return;
        setUser(fetched);
      })
      .catch(() => {
        if (!isCurrent) return;
        setUser(null);
      });
    return () => {
      isCurrent = false;
    };
  }, [owner]);

  const avatar = (
    <Avatar className="size-10 rounded-full overflow-hidden border border-border/50 shadow-sm">
      {owner ? (
        <AvatarImage
          src={
            (user?.avatar_url) ??
            `https://github.com/${owner}.png`
          }
          alt={user?.name ?? owner}
          className="object-cover transition-opacity duration-200"
        />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-2 flex items-center justify-center">
        <SiGithub className="size-full text-slate-600 dark:text-slate-400" />
      </AvatarFallback>
    </Avatar>
  );

  const feedbackMessage =
    'You must link this app to a github user or repo to collect profits';

  const leftGithubIcon = (
    <Avatar className="size-8 rounded-full overflow-hidden border border-border/50">
      <AvatarFallback className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-1.5 flex items-center justify-center">
        <SiGithub className="size-full text-slate-700 dark:text-slate-300" />
      </AvatarFallback>
    </Avatar>
  );

  const connector = (
    <div
      className="h-0.5 w-4 bg-gradient-to-r from-border to-border/50 rounded-full"
      aria-hidden="true"
    />
  );

  const badge = (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 transition-opacity duration-200',
        !pageUrl && 'opacity-60'
      )}
    >
      {leftGithubIcon}
      {connector}
      <div className="relative">
        {avatar}
        {!pageUrl && (
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/40 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );

  if (!showName) {
    if (linkToProfile && pageUrl) {
      return (
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-block transition-transform duration-200 hover:scale-105',
            className
          )}
          style={style}
        >
          {badge}
        </a>
      );
    }
    return (
      <div
        className={cn('cursor-not-allowed', className)}
        style={style}
        title={feedbackMessage}
        aria-label={feedbackMessage}
      >
        {badge}
      </div>
    );
  }

  const displayName = user?.name || owner;
  const profileUrl = pageUrl;

  return (
    <div
      className={cn('inline-flex items-center gap-3', className)}
      style={style}
    >
      {linkToProfile && profileUrl ? (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-200 hover:scale-105"
        >
          {badge}
        </a>
      ) : (
        <div
          title={!profileUrl ? feedbackMessage : undefined}
          aria-label={!profileUrl ? feedbackMessage : undefined}
          className={!profileUrl ? 'cursor-not-allowed' : undefined}
        >
          {badge}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate text-foreground/90">
          {displayName}
        </div>
        <div className="text-xs text-muted-foreground/80 truncate">
          @{owner}
        </div>
      </div>
    </div>
  );
});
