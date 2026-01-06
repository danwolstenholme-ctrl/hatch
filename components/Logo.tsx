'use client';

import Link from 'next/link';

export const LogoMark = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative w-7 h-7 ${className}`}>
      {/* Simple geometric mark - stacked squares forming a "hatch" */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Base square */}
        <div className="absolute w-5 h-5 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-80" />
        {/* Lifted lid effect */}
        <div className="absolute w-5 h-1.5 -top-0.5 rounded-t-sm bg-gradient-to-r from-emerald-300 to-emerald-500" />
      </div>
    </div>
  );
};

export const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} className="block">
      <LogoMark />
    </Link>
  );
};
