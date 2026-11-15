import { createHighlighter } from 'shiki';
import { CopyButton } from './CopyButton';

// One highlighter per build worker; grammars never ship to the browser.
const highlighter = createHighlighter({
  langs: ['tsx', 'typescript', 'javascript', 'bash', 'json'],
  themes: ['github-light', 'github-dark'],
});

export async function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const engine = await highlighter;
  const aliases: Record<string, string> = { ts: 'typescript', js: 'javascript', sh: 'bash', shell: 'bash' };
  const requested = aliases[language] ?? language;
  const lang = engine.getLoadedLanguages().includes(requested) ? requested : 'text';
  const source = code.replace(/\n$/, '');
  const html = engine.codeToHtml(source, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
  });
  return (
    <div className="code-block">
      <CopyButton code={source} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
