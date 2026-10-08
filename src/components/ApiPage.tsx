import type { FC } from 'react';
import type { AppMeta, SourcesConfig } from '../types';
import { fmtDate, fmtNum } from '../data';

interface Props {
  meta: AppMeta;
  sources: SourcesConfig;
  onRefresh: () => void;
}

export const ApiPage: FC<Props> = ({ meta, sources, onRefresh }) => {
  const sourceList = meta.sources || [];

  return (
    <>
      <div className="panel fade-up">
        <div className="panel-hd">
          <div className="panel-title">
            Multi-Stream Data Pipeline <span>Live Data Connectors & Google Sheets</span>
          </div>
          <button className="btn-refresh" onClick={onRefresh}>
            ⟳ Re-sync All Feeds
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sourceList.map((src) => {
            const isActive = src.status === 'active';
            const isProtected = src.status === 'protected';
            const dotColor = isActive ? '#10b981' : isProtected ? '#f59e0b' : '#ef4444';
            const badgeClass = isActive ? 'pill-green' : isProtected ? 'pill-purple' : 'pill-red';
            const badgeLabel = isActive
              ? `Active (${fmtNum(src.recordsCount)} records)`
              : isProtected
              ? 'OAuth / Private'
              : 'Error';

            return (
              <div key={src.id} className="source-card" style={{ padding: 18, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div className="source-dot" style={{ background: dotColor, width: 10, height: 10, borderRadius: '50%', flexShrink: 0 }} />
                <div className="source-info" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div className="source-name" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{src.name}</div>
                    <span className={`pill ${badgeClass}`} style={{ fontSize: 10, padding: '2px 8px' }}>{badgeLabel}</span>
                  </div>
                  <div className="source-url" style={{ fontSize: 11, color: 'var(--text-3)', wordBreak: 'break-all', marginTop: 4 }}>
                    {src.url}
                  </div>
                  <div style={{ fontSize: 11, color: isActive ? 'var(--cyan)' : 'var(--text-2)', marginTop: 4 }}>
                    {src.message}
                  </div>
                </div>
                <div className="source-actions">
                  <a className="source-link" href={src.url} target="_blank" rel="noopener noreferrer" style={{ whiteSpace: 'nowrap' }}>
                    Inspect Stream ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync stats */}
      <div className="panel fade-up d-2 mt-18">
        <div className="panel-hd">
          <div className="panel-title">Data Ingestion Architecture</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { label: 'Total Aggregated Records', value: fmtNum(meta.totalOrders), color: 'var(--blue)' },
            { label: 'Active Live Connectors', value: `${sourceList.filter(s => s.status === 'active').length} / ${sourceList.length}`, color: 'var(--green)' },
            { label: 'Pipeline Mode', value: sources.mode || 'Multi-Stream Stream Pipeline', color: 'var(--purple)' },
            { label: 'Last Pipeline Sync', value: fmtDate(meta.builtAt), color: 'var(--cyan)' },
          ].map(item => (
            <div key={item.label} style={{
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)'
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color, marginTop: 6 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
