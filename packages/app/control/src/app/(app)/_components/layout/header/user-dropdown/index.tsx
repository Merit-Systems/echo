import React, { Suspense } from 'react';

import {
  DollarSign,
  FileText,
  LogOut,
  UserLock,
  Book,
  ExternalLink,
} from 'lucide-react';

import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { UserAvatar } from '@/components/utils/user-avatar';

import { ColorModeToggle } from './color-mode-toggle';

import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Route } from 'next';
import { Skeleton } from '@/components/ui/skeleton';

export const UserDropdown = async () => {
  return (
    <Suspense fallback={<Skeleton className="size-8 md:size-9" />}>
      <UserDropdownComponent />
    </Suspense>
  );
};

const UserDropdownComponent = async () => {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="p-0 overflow-hidden">
          <UserAvatar
            src={user.image}
            fallback={
              user.name?.charAt(0).toUpperCase() ||
              user.email?.charAt(0).toUpperCase()
            }
            className="size-full rounded-md cursor-pointer border-none bg-transparent"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <UserAvatar
              src={user.image}
              fallback={
                user.name?.charAt(0).toUpperCase() ||
                user.email?.charAt(0).toUpperCase()
              }
              className="size-9 rounded-lg"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name}</span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/earnings/creator`}>
            <DropdownMenuItem>
              <DollarSign className="size-4" />
              Creator Earnings
            </DropdownMenuItem>
          </Link>
          <Link href={`/earnings/referral`}>
            <DropdownMenuItem>
              <DollarSign className="size-4" />
              Referral Earnings
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={'/docs' as Route<'/docs'>}>
            <DropdownMenuItem>
              <Book className="size-4" />
              Docs
              <ExternalLink className="size-4" />
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="flex gap-2 items-center">
          <DropdownMenuLabel className="font-normal">Theme</DropdownMenuLabel>
          <ColorModeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a
              href="https://merit.systems/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <UserLock className="size-4" />
              Privacy Policy
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://merit.systems/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="size-4" />
              Terms of Service
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/' });
          }}
        >
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut className="size-4" />
              Sign Out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
