'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function CopyButton({ code }: { code: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setStatus('idle'), 2200);
  }

  return (
    <button className="copy-button" type="button" onClick={copy} aria-label={status === 'copied' ? 'Code copied' : 'Copy code'}>
      {status === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'failed' ? 'Select to copy' : 'Copy'}</span>
    </button>
  );
}
