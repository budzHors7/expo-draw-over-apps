import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { assetPath } from '../lib/navigation';
import { DocsSearch } from './DocsSearch';
import { ThemeControl } from './ThemeControl';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Expo Draw Over Apps home">
          <Image src={assetPath('/images/overlay-logo.png')} alt="" width={48} height={48} priority />
          <span>Expo Draw Over Apps</span>
        </Link>
        <span className="sdk-badge">SDK 58</span>
        <nav aria-label="Primary navigation">
          <Link href="/docs">Docs</Link>
          <a href="https://github.com/budzHors7/expo-draw-over-apps">GitHub <ArrowUpRight size={15} aria-hidden="true" /></a>
        </nav>
        <DocsSearch />
        <ThemeControl />
      </div>
    </header>
  );
}
