'use client';
import EchoBalance from '@/components/balance';
import { EchoTopUpButton } from '@/components/top-up-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/echo-button';
import { PopoverContent } from '@/components/ui/popover';
import { type EchoContextValue } from '@merit-systems/echo-react-sdk';
import { LogOut } from 'lucide-react';

export function EchoAccountButtonPopover({ echo }: { echo: EchoContextValue }) {
  const { user, signOut } = echo;
  return (
    <PopoverContent className="w-[380px] p-0" align="end">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto p-2 -ml-2 hover:bg-accent"
          onClick={() =>
            window.open('https://echo.merit.systems/dashboard', '_blank')
          }
        >
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? ''} />
              <AvatarFallback>
                {user?.name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-left">
            <h4 className="font-medium text-sm">
              {user?.name || user?.email || 'Account'}
            </h4>
            <p className="text-xs text-muted-foreground/80">{user?.id}</p>
          </div>
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Balance */}
      <div className="p-4 border-b">
        <EchoBalance echo={echo} />
      </div>

      {/* Add Credits Button */}
      <div className="p-4 border-b">
        <EchoTopUpButton echo={echo} />
      </div>
    </PopoverContent>
  );
}
