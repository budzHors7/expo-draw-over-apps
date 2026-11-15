'use client';

import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import searchIndex from '../generated/search-index.json';

export function DocsSearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const normalizedQuery = query.toLowerCase().trim();
  const score = (entry: typeof searchIndex[number]) =>
    (entry.title.toLowerCase() === normalizedQuery ? 100 : 0) +
    tokens.reduce((total, token) => total + (entry.title.toLowerCase().includes(token) ? 20 : 0) + (entry.page.toLowerCase().includes(token) ? 5 : 0), 0);
  const results = searchIndex.filter((entry) => tokens.every((token) => `${entry.title} ${entry.page} ${entry.text}`.toLowerCase().includes(token)))
    .sort((left, right) => score(right) - score(left)).slice(0, 10);

  function open() { dialog.current?.showModal(); input.current?.focus(); }
  function close() { dialog.current?.close(); }
  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close(); else open();
      }
    }
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);
  useEffect(() => {
    if (dialog.current?.open) {
      dialog.current.querySelector(`[data-result="${selected}"]`)?.scrollIntoView({ block: 'nearest' });
    }
  }, [selected, query]);

  return (
    <>
      <button className="search-trigger" type="button" onClick={open} aria-label="Search documentation">
        <Search size={17} aria-hidden="true" /><span>Search docs…</span><kbd>⌘ K</kbd>
      </button>
      <dialog className="search-dialog" ref={dialog} aria-label="Search documentation" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="search-dialog-input">
          <Search size={20} aria-hidden="true" />
          <input ref={input} placeholder="Search documentation…" aria-label="Search query" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="docs-search-options" aria-activedescendant={results[selected] ? `docs-search-option-${selected}` : undefined} value={query}
            onChange={(event) => { setQuery(event.target.value); setSelected(0); }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') { event.preventDefault(); setSelected((value) => Math.min(value + 1, Math.max(0, results.length - 1))); }
              if (event.key === 'ArrowUp') { event.preventDefault(); setSelected((value) => Math.max(value - 1, 0)); }
              if (event.key === 'Enter') { event.preventDefault(); dialog.current?.querySelector<HTMLAnchorElement>(`[data-result="${selected}"]`)?.click(); }
            }} />
          <button className="icon-button" type="button" aria-label="Close search" onClick={close}><X size={19} /></button>
        </div>
        <div className="search-results" aria-live="polite">
          <div role="listbox" id="docs-search-options" aria-label="Matching documentation">
          {results.map((entry, index) => (
            <Link key={entry.href} href={entry.href} role="option" id={`docs-search-option-${index}`} aria-selected={selected === index} tabIndex={-1} data-result={index} className={selected === index ? 'selected' : undefined} onClick={close}>
              <span><strong>{entry.title}</strong><small>{entry.page}</small></span><ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
          </div>
          {!results.length ? <p role="status">No results for “{query}”. Try a window type, permission, or an API name.</p> : null}
        </div>
        <div className="search-help">↑ ↓ to navigate <span>Enter to open · Esc to close</span></div>
      </dialog>
    </>
  );
}
