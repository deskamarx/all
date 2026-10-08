import type { AppData } from './types';

export const APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx18XXxHBXgoLNAdDCErE5hCP23lJWubXCu438YCSHkAf2GYv_HtQ4gAvvC5YuGyTgqMg/exec';

export async function loadAppData(): Promise<AppData> {
  const base = import.meta.env.BASE_URL;

  const [meta, orders, sources] = await Promise.all([
    fetch(`${base}data/meta.json`).then(r => { if (!r.ok) throw new Error('meta.json failed'); return r.json(); }),
    fetch(`${base}data/events.json`).then(r => { if (!r.ok) throw new Error('events.json failed'); return r.json(); }),
    fetch(`${base}data/sources.json`).then(r => { if (!r.ok) throw new Error('sources.json failed'); return r.json(); }),
  ]);

  return { meta, orders, sources };
}

// Format currency
export function fmtCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return '৳' + (amount / 1_000_000_000).toFixed(2) + 'B';
  if (amount >= 1_000_000) return '৳' + (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000) return '৳' + (amount / 1_000).toFixed(1) + 'K';
  return '৳' + amount.toLocaleString();
}

// Format numbers
export function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return (n || 0).toLocaleString();
}

// Format percentage
export function fmtPct(a: number, b: number): string {
  if (!b) return '0%';
  return ((a / b) * 100).toFixed(1) + '%';
}

// Format date
export function fmtDate(iso: string): string {
  if (!iso || iso === 'N/A') return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch {
    return iso;
  }
}
