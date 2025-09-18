import Link from 'next/link';
import React from 'react';

interface UserLinkProps {
  userId: string;
  name: string | null;
  email?: string;
  className?: string;
  showEmail?: boolean;
  title?: string;
}

export function UserLink({
  userId,
  name,
  email,
  className = 'font-medium text-blue-600 hover:text-blue-800 cursor-pointer',
  showEmail = true,
  title,
}: UserLinkProps) {
  const displayName = name || (
    <span className="text-gray-400 italic">No name</span>
  );

  if (showEmail && email) {
    return (
      <div className="flex flex-col">
        <Link
          href={`/admin/user/user-apps/${userId}`}
          className={className}
          title={
            title ||
            (typeof displayName === 'string' ? displayName : name || email)
          }
        >
          <span className="block w-xxs truncate">{displayName}</span>
        </Link>
        <span className="text-xs text-gray-500 truncate max-w-xs">{email}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/admin/user/user-apps/${userId}`}
      className={className}
      title={
        title ||
        (typeof displayName === 'string' ? displayName : name || userId)
      }
    >
      <span className="block w-[36px] truncate">{displayName}</span>
    </Link>
  );
}
