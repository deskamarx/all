import type { FC } from 'react';
import type { AppMeta } from '../types';
import { fmtCurrency, fmtNum } from '../data';

interface Props {
  meta: AppMeta;
}

export const KpiGrid: FC<Props> = ({ meta }) => {
  const kpis = [
    { label: 'Total Sales Volume', value: fmtCurrency(meta.totalRevenue), sub: 'Gross order volume', color: '#10b981', icon: '💰', pct: 100 },
    { label: 'Total Orders', value: fmtNum(meta.totalOrders), sub: 'Processed orders', color: '#3b82f6', icon: '📦', pct: 100 },
    { label: 'Total Units Sold', value: fmtNum(meta.totalItems), sub: 'Units delivered/shipped', color: '#06b6d4', icon: '📱', pct: 100 },
    { label: 'Top Product Revenue', value: fmtCurrency(meta.topProducts[0]?.revenue || 0), sub: meta.topProducts[0]?.name.slice(0, 22) || 'Top Item', color: '#8b5cf6', icon: '🏆', pct: 85 },
    { label: 'Top Purchasing Store', value: meta.topClients[0]?.name || 'N/A', sub: fmtCurrency(meta.topClients[0]?.revenue || 0), color: '#f59e0b', icon: '🏪', pct: 90 },
    { label: 'Active Sales Reps', value: String(meta.topReps.length), sub: 'Tracked sales reps', color: '#ec4899', icon: '👤', pct: 100 },
  ];

  return (
    <div className="grid-kpi">
      {kpis.map((k, i) => (
        <div key={k.label} className={`kpi-card fade-up d-${Math.min(i + 1, 8)}`}>
          <div className="kpi-icon">{k.icon}</div>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value" style={{ color: k.color }}>{k.value}</div>
          <div className="kpi-sub">{k.sub}</div>
          <div className="kpi-accent-bar" style={{
            background: `linear-gradient(90deg, ${k.color}aa, ${k.color}44)`,
            width: `${Math.max(k.pct, 4)}%`,
            maxWidth: '100%',
          }} />
        </div>
      ))}
    </div>
  );
};
