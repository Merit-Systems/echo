import Link from 'next/link';

export default function DefaultHeader() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex flex-col gap-1">
        <span className="font-extrabold text-2xl leading-none">Echo</span>
        <span className="text-xs font-extralight leading-none">
          by <span className="font-medium">Merit</span>Systems
        </span>
      </div>
    </Link>
  );
}
