import { AnimatedThemeToggler } from '@/components/magicui/animated-theme-toggler';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { SiGithub, SiDiscord } from '@icons-pack/react-simple-icons';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="border-b border-dashed sticky top-0 left-0 right-0 z-50 p-2 md:p-4 bg-card">
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-8" />
          <div className="flex flex-col gap-1">
            <span className="font-extrabold text-xl leading-none">Echo</span>
            <span className="text-[10px] font-extralight leading-none">
              by <span className="font-medium">Merit</span>Systems
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-1 md:space-x-3">
          <Link href="/login">
            <Button variant="turbo" className="h-8 md:h-9">
              <span>Sign In</span>
            </Button>
          </Link>
          <Link href="https://discord.com/invite/JuKt7tPnNc" target="_blank">
            <Button variant="outline" className="h-8 md:h-9" size="icon">
              <SiDiscord className="size-4" />
            </Button>
          </Link>
          <Link href="https://github.com/Merit-Systems/echo" target="_blank">
            <Button variant="outline" className="h-8 md:h-9" size="icon">
              <SiGithub className="size-4" />
            </Button>
          </Link>
          <AnimatedThemeToggler />
        </div>
      </div>
    </header>
  );
};
