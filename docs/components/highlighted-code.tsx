import { highlightCode, type HighlightLanguage } from '../lib/highlight-code';

type HighlightedCodeProps = {
  code: string;
  lang: HighlightLanguage;
  className?: string;
  variant?: 'flush' | 'framed';
};

export async function HighlightedCode({
  code,
  lang,
  className,
  variant = 'flush',
}: HighlightedCodeProps) {
  const html = await highlightCode(code, lang);
  const classes = ['code-block', variant === 'framed' ? 'code-block--framed' : 'code-block--flush', className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
}
