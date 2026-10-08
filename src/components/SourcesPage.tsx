import type { FC } from 'react';
import type { DataSource, SourcesConfig } from '../types';

interface Props {
  config: SourcesConfig;
}

const CAT_COLOR: Record<string, string> = {
  Finance:    '#10b981',
  Logistics:  '#3b82f6',
  Operations: '#8b5cf6',
};

const SourceCard: FC<{ src: DataSource; idx: number }> = ({ src, idx }) => {
  const color = src.color ?? CAT_COLOR[src.category] ?? '#64748b';
  return (
    <div className={`source-card fade-up d-${Math.min(idx + 1, 8)}`}>
      <div className="source-dot" style={{ background: color }} />
      <div className="source-info">
        <div className="source-name">{src.name}</div>
        <div className="source-url">{src.url}</div>
        <div className="source-docid">
          Doc ID: <span className="text-mono">{src.docId}</span>
          &ensp;·&ensp;
          GID: <span className="text-mono">{src.gid}</span>
        </div>
      </div>
      <div className="source-actions">
        <span className={`pill pill-${src.category === 'Finance' ? 'green' : src.category === 'Logistics' ? 'blue' : 'purple'}`}>
          {src.category}
        </span>
        <span className="pill pill-cyan">{src.responsible}</span>
        {src.enabled
          ? <span className="pill pill-green">Enabled</span>
          : <span className="pill pill-red">Disabled</span>
        }
        <a className="source-link" href={src.url} target="_blank" rel="noopener noreferrer">
          Open Sheet ↗
        </a>
      </div>
    </div>
  );
};

export const SourcesPage: FC<Props> = ({ config }) => {
  const { sources, accessEmail } = config;

  return (
    <>
      {/* Connected sources */}
      <div className="panel fade-up">
        <div className="panel-hd">
          <div className="panel-title">
            Connected Sources <span>{sources.length} spreadsheets</span>
          </div>
          <span className="pill pill-cyan">
            {accessEmail}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sources.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, background: 'rgba(255,255,255,0.015)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
              ✨ No spreadsheets connected yet. Follow the instructions below to add your first Google Sheet.
            </div>
          ) : (
            sources.map((src, i) => <SourceCard key={src.id} src={src} idx={i} />)
          )}
        </div>
      </div>

      {/* Add new source guide */}
      <div className="panel fade-up d-2 mt-18">
        <div className="panel-hd">
          <div className="panel-title">Add a New Data Source</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 14 }}>
          To add a new Google Sheet, open{' '}
          <code style={{ fontFamily: 'var(--mono)', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>
            public/data/sources.json
          </code>{' '}
          and append a new entry. Make sure{' '}
          <strong style={{ color: 'var(--cyan)' }}>{accessEmail}</strong>{' '}
          has View access, then commit &amp; push to GitHub. The live site will pick it up automatically.
        </p>
        <div className="code-block">
          {'{'}<br />
          &nbsp;&nbsp;"id": "NEW_SOURCE",<br />
          &nbsp;&nbsp;"name": "Descriptive Name",<br />
          &nbsp;&nbsp;"url": "https://docs.google.com/spreadsheets/d/…",<br />
          &nbsp;&nbsp;"docId": "SPREADSHEET_ID",<br />
          &nbsp;&nbsp;"gid": "0",<br />
          &nbsp;&nbsp;"category": "Finance | Logistics | Operations",<br />
          &nbsp;&nbsp;"responsible": "Person Name",<br />
          &nbsp;&nbsp;"color": "#hex",<br />
          &nbsp;&nbsp;"enabled": true<br />
          {'}'}
        </div>
      </div>

      {/* Instructions for live sync */}
      <div className="panel fade-up d-3 mt-18">
        <div className="panel-hd">
          <div className="panel-title">Live Data Sync Instructions</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '1', title: 'Make sheets publicly readable', desc: 'In Google Sheets → Share → "Anyone with the link" → Viewer. This lets the GitHub Actions workflow fetch CSV exports without login.' },
            { step: '2', title: 'Run the fetch script', desc: 'Execute scripts/fetch-data.mjs locally or via GitHub Actions. It will download all enabled sources, clean the data, and write public/data/*.json.' },
            { step: '3', title: 'Commit & push', desc: 'git add public/data && git commit -m "data: refresh" && git push. GitHub Pages will auto-deploy in ~60 seconds.' },
            { step: '4', title: 'Automate with GitHub Actions', desc: 'The included .github/workflows/refresh-data.yml runs daily at midnight. Edit the cron schedule to suit your needs.' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--blue)',
              }}>{item.step}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
