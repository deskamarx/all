import type { AppData } from './types';

export async function loadAppData(): Promise<AppData> {
  const base = import.meta.env.BASE_URL;

  const [meta, assets, events, sources] = await Promise.all([
    fetch(`${base}data/meta.json`).then(r => { if (!r.ok) throw new Error('meta.json failed'); return r.json(); }),
    fetch(`${base}data/assets.json`).then(r => { if (!r.ok) throw new Error('assets.json failed'); return r.json(); }),
    fetch(`${base}data/events.json`).then(r => { if (!r.ok) throw new Error('events.json failed'); return r.json(); }),
    fetch(`${base}data/sources.json`).then(r => { if (!r.ok) throw new Error('sources.json failed'); return r.json(); }),
  ]);

  return { meta, assets, events, sources };
}

// Clean and deduplicate IMEIs
export function cleanImeis(imeis: string[]): string[] {
  const seen = new Set<string>();
  return imeis.filter(imei => {
    const clean = imei.trim().replace(/\D/g, '');
    if (!clean || clean.length < 14 || clean.length > 16) return false;
    if (seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

// Format large numbers
export function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// Percentage string
export function fmtPct(a: number, b: number): string {
  if (!b) return '—';
  return ((a / b) * 100).toFixed(1) + '%';
}

// Format date
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
