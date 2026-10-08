import type { FC } from 'react';
import type { AppMeta } from '../types';
import { fmtNum, fmtPct } from '../data';
import { TopTabsBar } from './Charts';

interface Props { meta: AppMeta; }

export const StockPage: FC<Props> = ({ meta }) => {
  const tabs = meta.topTabs ?? [];
  const total = meta.events;

  return (
    <>
      <div className="grid-2 fade-up">
        <TopTabsBar meta={meta} />
        <div className="panel fade-up d-2">
          <div className="panel-hd">
            <div className="panel-title">Stock Summary <span>derived metrics</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Assets Without Terminal State', value: fmtNum(meta.derived?.assetsWithoutTerminalState ?? 0), pct: fmtPct(meta.derived?.assetsWithoutTerminalState ?? 0, meta.assets), color: 'var(--amber)' },
              { label: 'Unresolved (Never Classified)', value: fmtNum(meta.derived?.unresolvedBecauseNeverClassified ?? 0), pct: fmtPct(meta.derived?.unresolvedBecauseNeverClassified ?? 0, meta.assets), color: 'var(--amber)' },
              { label: 'Unresolved Despite Terminal State', value: fmtNum(meta.derived?.unresolvedDespiteTerminalState ?? 0), pct: fmtPct(meta.derived?.unresolvedDespiteTerminalState ?? 0, meta.assets), color: 'var(--red)' },
              { label: 'Events Without Product ID', value: fmtNum(meta.derived?.eventsWithoutProduct ?? 0), pct: fmtPct(meta.derived?.eventsWithoutProduct ?? 0, meta.events), color: 'var(--red)' },
              { label: 'Undated Events', value: fmtNum(meta.derived?.undatedEvents ?? 0), pct: fmtPct(meta.derived?.undatedEvents ?? 0, meta.events), color: 'var(--amber)' },
              { label: 'Assets Without Citation', value: fmtNum(meta.derived?.assetsWithoutCitation ?? 0), pct: fmtPct(meta.derived?.assetsWithoutCitation ?? 0, meta.assets), color: 'var(--text-3)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-2)' }}>{item.label}</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: item.color }}>{item.value}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-3)' }}>{item.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full tab table */}
      <div className="panel fade-up d-3">
        <div className="panel-hd">
          <div className="panel-title">All Workbook Tabs <span>{tabs.length} tracked</span></div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tab Name</th>
                <th>Events</th>
                <th>Share of Total</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
              {tabs.map(([name, count], i) => {
                const barW = Math.max((count / (tabs[0]?.[1] ?? 1)) * 100, 1);
                return (
                  <tr key={name}>
                    <td className="num">{i + 1}</td>
                    <td className="text-mono highlight">{name}</td>
                    <td className="highlight">{count.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{fmtPct(count, total)}</td>
                    <td style={{ minWidth: 100 }}>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', width: 120 }}>
                        <div style={{ height: '100%', width: `${barW}%`, background: `hsl(${210 + i*8},80%,55%)`, borderRadius: 3 }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
