import { cache } from 'react';
import { getSingletonHighlighter } from 'shiki';

const LIGHT_THEME = 'material-theme-lighter';
const DARK_THEME = 'material-theme-darker';

const highlighterPromise = getSingletonHighlighter({
  langs: ['bash', 'tsx'],
  themes: [LIGHT_THEME, DARK_THEME],
});

export type HighlightLanguage = 'bash' | 'tsx';

export const highlightCode = cache(async (code: string, lang: HighlightLanguage) => {
  const highlighter = await highlighterPromise;

  return highlighter.codeToHtml(code, {
    lang,
    themes: {
      light: LIGHT_THEME,
      dark: DARK_THEME,
    },
    defaultColor: 'light',
  });
});
