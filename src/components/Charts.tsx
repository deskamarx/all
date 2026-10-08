import type { FC } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import type { AppMeta } from '../types';
import { fmtCurrency, fmtNum } from '../data';

const BRAND_COLORS: Record<string, string> = {
  'Xiaomi / Redmi': '#f97316',
  'Honor':          '#3b82f6',
  'Realme':         '#f59e0b',
  'Apple':          '#ec4899',
  'Samsung':        '#10b981',
  'Internal Transfer': '#8b5cf6',
  'Other':          '#64748b'
};

const TOOLTIP_STYLE = {
  backgroundColor: '#0c1120',
  border: '1px solid rgba(59,130,246,0.2)',
  borderRadius: 8,
  fontSize: 12,
  color: '#eef2ff',
};

export const BrandPieChart: FC<{ meta: AppMeta }> = ({ meta }) => {
  const brands = meta.brands || {};
  const data = Object.entries(brands)
    .map(([name, value]) => ({ name, value, color: BRAND_COLORS[name] || '#64748b' }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="panel fade-up d-4">
      <div className="panel-hd">
        <div className="panel-title">Brand Share <span>by revenue volume</span></div>
      </div>
      <div className="donut-wrap">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data} dataKey="value" cx="50%" cy="50%"
              innerRadius={45} outerRadius={75} paddingAngle={3}
            >
              {data.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: any) => [fmtCurrency(Number(v) || 0), 'Revenue']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-legend">
          {data.map(d => (
            <div key={d.name} className="legend-row">
              <div className="legend-dot" style={{ background: d.color }} />
              <div className="legend-label">{d.name}</div>
              <div className="legend-val">{fmtCurrency(d.value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TopProductsBarChart: FC<{ meta: AppMeta }> = ({ meta }) => {
  const data = (meta.topProducts || []).slice(0, 7).map(p => ({
    name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
    fullName: p.name,
    revenue: p.revenue,
    count: p.count
  }));

  return (
    <div className="panel fade-up d-5">
      <div className="panel-hd">
        <div className="panel-title">Top 7 Products <span>by gross revenue</span></div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 45 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }}
            angle={-35} textAnchor="end" interval={0}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={v => fmtCurrency(v as number)} />
          <Tooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v: any) => [fmtCurrency(Number(v) || 0), 'Gross Revenue']} />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${160 + i * 20}, 75%, ${50 - i * 2}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PaymentMethodsBar: FC<{ meta: AppMeta }> = ({ meta }) => {
  const pm = meta.paymentMethods || {};
  const data = Object.entries(pm).map(([name, count]) => ({ name: name || 'Standard', count }));

  return (
    <div className="panel fade-up d-3">
      <div className="panel-hd">
        <div className="panel-title">Payment Methods <span>order breakdown</span></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.slice(0, 5).map(item => (
          <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{item.name}</span>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)' }}>{fmtNum(item.count)} orders</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((item.count / meta.totalOrders) * 100 * 3, 100)}%`,
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                borderRadius: 3
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
