import Link from 'next/link';
import React from 'react';

interface AppLinkProps {
  appId: string;
  name: string;
  description?: string | null;
  className?: string;
  showDescription?: boolean;
  title?: string;
  maxWidth?: string;
}

export function AppLink({
  appId,
  name,
  description,
  className = 'font-medium text-blue-600 hover:text-blue-800 hover:underline',
  showDescription = true,
  title,
  maxWidth = 'max-w-[160px]',
}: AppLinkProps) {
  if (showDescription && description) {
    return (
      <div className="flex flex-col">
        <Link
          href={`/admin/app/app-users/${appId}`}
          className={`${className} block truncate ${maxWidth}`}
          title={title || name}
        >
          {name}
        </Link>
        <span
          className="text-xs text-gray-500 truncate max-w-xs"
          title={description}
        >
          {description}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/admin/app/app-users/${appId}`}
      className={`${className} block truncate ${maxWidth}`}
      title={title || name}
    >
      {name}
    </Link>
  );
}
