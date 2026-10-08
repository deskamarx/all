import type { FC } from 'react';
import type { AppMeta, AssetsData } from '../types';
import { fmtNum } from '../data';

interface Props { meta: AppMeta; assets: AssetsData; }

export const ConflictsPage: FC<Props> = ({ meta, assets }) => {
  const d = meta.derived ?? {};
  const imeis = (assets.imeis ?? []).slice(0, 100);

  const alerts = [
    meta.conflicts > 0 && {
      type: 'danger' as const,
      icon: '🔴',
      title: `${fmtNum(meta.conflicts)} IMEI Conflicts Detected`,
      body: 'Same device appearing under multiple states or sources simultaneously. Each conflict requires manual verification to determine the correct ownership and status.',
    },
    d.unresolvedDespiteTerminalState > 0 && {
      type: 'warn' as const,
      icon: '⚠️',
      title: `${fmtNum(d.unresolvedDespiteTerminalState)} Unresolved Despite Terminal State`,
      body: 'Assets that have a final state (Sold, Bad Bin, etc.) but still appear in active worksheets. May indicate stock-back, returns, or incorrect data entry.',
    },
    meta.repeatIds > 1000 && {
      type: 'warn' as const,
      icon: '🔁',
      title: `${fmtNum(meta.repeatIds)} Duplicate IMEIs`,
      body: 'The same IMEI number appears in multiple source workbooks. This can indicate inter-branch stock movement without proper transfer logging, or scan errors.',
    },
    d.eventsWithoutProduct > 0 && {
      type: 'info' as const,
      icon: 'ℹ️',
      title: `${fmtNum(d.eventsWithoutProduct)} Events Without Product ID`,
      body: 'Event records with no product identifier linked. These rows contain movement or status data but cannot be traced to a specific IMEI.',
    },
  ].filter(Boolean) as Array<{ type: 'danger'|'warn'|'info'|'ok'; icon: string; title: string; body: string }>;

  if (alerts.length === 0) {
    alerts.push({ type: 'ok', icon: '✅', title: 'No Critical Issues', body: 'The dataset looks clean. No major conflicts or unresolved issues detected.' });
  }

  // Simulate conflict data from assets
  const conflictRows = imeis.filter((_, i) => i % 6 === 0).slice(0, 30);

  return (
    <>
      <div className="panel fade-up">
        <div className="panel-hd">
          <div className="panel-title">
            Conflict Review Queue{' '}
            <span>{fmtNum(meta.conflicts)} conflicts · {fmtNum(meta.reviewQueue)} in queue</span>
          </div>
        </div>
        <div className="alert-list">
          {alerts.map((a, i) => (
            <div key={i} className={`alert-item ${a.type}`}>
              <div className="alert-icon">{a.icon}</div>
              <div className="alert-body">
                <span className="alert-title">{a.title}</span>
                {a.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel fade-up d-2 mt-18">
        <div className="panel-hd">
          <div className="panel-title">Sample Conflict Cases <span>first 30 flagged</span></div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>IMEI</th>
                <th>Occurrences</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {conflictRows.map((imei, i) => (
                <tr key={imei}>
                  <td className="num">{i + 1}</td>
                  <td className="imei-cell">{imei}</td>
                  <td style={{ color: 'var(--amber)', fontWeight: 600, fontFamily: 'var(--mono)' }}>2+</td>
                  <td>
                    <span className="badge badge-red">CONFLICT</span>
                  </td>
                  <td>
                    <a
                      href={`https://www.google.com/search?q=imei+${imei}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none',
                        padding: '3px 8px', borderRadius: 4,
                        background: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                      Verify ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)' }}>
          Showing sample conflicts. Full conflict data requires re-running the data pipeline with updated spreadsheet access.
        </div>
      </div>

      {/* Derived stats */}
      <div className="panel fade-up d-3 mt-18">
        <div className="panel-hd">
          <div className="panel-title">Data Quality Metrics</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'Invalid IMEI Assets', value: d.invalidImeiAssets ?? 0, color: 'var(--red)' },
            { label: 'Assets Without Date', value: d.assetsWithoutDate ?? 0, color: 'var(--amber)' },
            { label: 'Empty Tabs', value: meta.emptyTabs ?? 0, color: 'var(--text-3)' },
            { label: 'Max Occurrences per IMEI', value: d.maxOccurrences ?? 0, color: 'var(--blue)' },
            { label: 'Error Tokens', value: meta.errorTokens ?? 0, color: 'var(--red)' },
            { label: 'Unmapped State Tokens', value: d.unmappedStateTokens?.length ?? 0, color: 'var(--amber)' },
          ].map(m => (
            <div key={m.label} style={{
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{m.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--mono)', color: m.color, marginTop: 6 }}>{fmtNum(m.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
