import { HighlightedCode } from './highlighted-code';
import type { HighlightLanguage } from '../lib/highlight-code';

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

type CodePanelProps = {
  title: string;
  label: string;
  lang: HighlightLanguage;
  code: string;
  caption: string;
  className?: string;
};

type ExternalLinkCardProps = {
  href: string;
  label: string;
  detail: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
      <h2 className="mt-4 [font-family:var(--font-display)] text-4xl font-medium leading-[0.98] tracking-[-0.04em] text-zinc-950 dark:text-zinc-50 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-zinc-700 dark:text-zinc-300 sm:text-lg">{description}</p>
    </div>
  );
}

export async function CodePanel({ title, label, lang, code, caption, className }: CodePanelProps) {
  return (
    <article
      className={[
        'overflow-hidden rounded-[1.75rem] border border-zinc-900/10 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-900/8 px-5 py-4 dark:border-white/10">
        <h3 className="[font-family:var(--font-display)] text-xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
          {title}
        </h3>
        <span className="rounded-full border border-zinc-900/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          {label}
        </span>
      </div>

      <HighlightedCode code={code} lang={lang} className="max-h-[34rem]" />

      <p className="px-5 py-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{caption}</p>
    </article>
  );
}

export function ExternalLinkCard({ href, label, detail }: ExternalLinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-[1.75rem] border border-zinc-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-zinc-900/20 hover:shadow-[0_18px_48px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="[font-family:var(--font-display)] text-2xl font-medium tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
          {label}
        </h3>
        <span className="rounded-full border border-zinc-900/10 bg-zinc-950 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-white transition group-hover:bg-zinc-800 dark:border-white/10 dark:bg-white dark:text-zinc-950 dark:group-hover:bg-zinc-100">
          Open
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{detail}</p>
    </a>
  );
}
