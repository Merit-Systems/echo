import Link from 'next/link';

import { Book } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

import { BalanceButton } from './_components/layout/header/balance';
import { UserDropdown } from './_components/layout/header/user-dropdown';
import { LogoContainer } from './_components/layout/logo';

import type { Route } from 'next';
import TermsAgreement from '@/app/(app)/_components/terms';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
  breadcrumbs,
}: LayoutProps<'/'>) {
  return (
    <>
      <TermsAgreement />
      <div className="min-h-screen flex flex-col relative">
        <LogoContainer>
          <Link href="/dashboard">
            <Logo className="size-auto h-full aspect-square" />
          </Link>
        </LogoContainer>
        <header className="w-full flex flex-col pt-4 justify-center">
          <div className="flex items-center justify-between w-full px-2 md:px-6 pb-0 md:pb-0 h-10">
            <div className="pl-10 md:pl-12 flex items-center gap-2 md:gap-3">
              {breadcrumbs}
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <BalanceButton />
              <Link href={'/docs' as Route<'/docs'>}>
                <Button variant="outline" size="navbar">
                  <Book className="size-4" />
                  <span className="hidden md:block">Docs</span>
                </Button>
              </Link>
              <UserDropdown />
            </div>
          </div>
        </header>
        <div className="bg-background flex-1 flex flex-col">{children}</div>
      </div>
    </>
  );
}
