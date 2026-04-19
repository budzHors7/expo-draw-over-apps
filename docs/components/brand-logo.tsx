type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="14" width="28" height="34" rx="9" stroke="currentColor" strokeWidth="3.5" opacity="0.38" />
      <rect x="22" y="8" width="28" height="34" rx="9" stroke="currentColor" strokeWidth="3.5" />
      <path d="M30 17.5H42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30 24H42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="46" cy="46" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path d="M46 41V51" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M41 46H51" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 sm:gap-3 ${className}`}>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-current/10 bg-white/70 p-2 sm:h-11 sm:w-11 sm:p-2.5 text-zinc-950 dark:bg-white/8 dark:text-zinc-50">
        <BrandMark className="h-full w-full" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="hidden text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400 sm:block">
          Expo Android Module
        </span>
        <span className="truncate text-[13px] font-medium tracking-[0.04em] text-zinc-950 dark:text-zinc-50 sm:text-base">
          Expo Draw Over Apps
        </span>
      </span>
    </span>
  );
}
