'use client';

import { useState, useEffect, useRef } from 'react';

interface UserDropdownProps {
  firstName?: string | null;
  email?: string | null;
  id?: string | null;
  name?: string | null;
}

export default function UserDropdown({
  firstName,
  email,
  id,
  name,
}: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const label =
    firstName ||
    (name && name.split(' ')[0]) ||
    (email ? email.split('@')[0] : 'Account');

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="truncate max-w-[10rem]">{label}</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.08 1.04l-4.24 4.52a.75.75 0 01-1.08 0l-4.24-4.52a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-3 z-50"
        >
          <div className="text-sm text-gray-900 font-medium mb-2">Account</div>
          <div className="space-y-1 text-sm">
            {email && (
              <div className="flex items-start justify-between">
                <span className="text-gray-500">Email</span>
                <span
                  className="ml-4 truncate max-w-[12rem] text-gray-900"
                  title={email}
                >
                  {email}
                </span>
              </div>
            )}
            {id && (
              <div className="flex items-start justify-between">
                <span className="text-gray-500">ID</span>
                <span
                  className="ml-4 truncate max-w-[12rem] text-gray-900"
                  title={id}
                >
                  {id}
                </span>
              </div>
            )}
            {name && (
              <div className="flex items-start justify-between">
                <span className="text-gray-500">Name</span>
                <span
                  className="ml-4 truncate max-w-[12rem] text-gray-900"
                  title={name}
                >
                  {name}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
