import type { FC } from 'react';
import type { AppMeta, SourcesConfig } from '../types';
import { fmtDate, fmtNum } from '../data';

interface Props {
  meta: AppMeta;
  sources: SourcesConfig;
  onRefresh: () => void;
}

export const ApiPage: FC<Props> = ({ meta, sources, onRefresh }) => {
  return (
    <>
      <div className="panel fade-up">
        <div className="panel-hd">
          <div className="panel-title">
            Google Apps Script API Engine <span>Live Data Connection</span>
          </div>
          <button className="btn-refresh" onClick={onRefresh}>
            ⟳ Re-sync Endpoint
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="source-card" style={{ padding: 16 }}>
            <div className="source-dot" style={{ background: '#10b981' }} />
            <div className="source-info">
              <div className="source-name" style={{ fontSize: 14 }}>Google Apps Script Web App API</div>
              <div className="source-url" style={{ fontSize: 12 }}>{meta.endpoint}</div>
            </div>
            <div className="source-actions">
              <span className="pill pill-green">Status 200 OK</span>
              <span className="pill pill-cyan">JSON API</span>
              <a className="source-link" href={meta.endpoint} target="_blank" rel="noopener noreferrer">
                Inspect Raw JSON ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sync stats */}
      <div className="panel fade-up d-2 mt-18">
        <div className="panel-hd">
          <div className="panel-title">Sync Details</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { label: 'Total Records Synced', value: fmtNum(meta.totalOrders), color: 'var(--blue)' },
            { label: 'Last Sync Timestamp', value: fmtDate(meta.builtAt), color: 'var(--cyan)' },
            { label: 'Source Authentication', value: sources.accessEmail, color: 'var(--green)' },
            { label: 'Integration Mode', value: 'Google Apps Script Direct API', color: 'var(--purple)' },
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
