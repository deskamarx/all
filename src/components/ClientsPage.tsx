import { useState } from 'react';
import type { FC } from 'react';
import type { AppMeta } from '../types';
import { fmtCurrency, fmtNum } from '../data';

interface Props {
  meta: AppMeta;
}

export const ClientsPage: FC<Props> = ({ meta }) => {
  const [search, setSearch] = useState('');

  const clients = (meta.topClients || []).filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="panel fade-up">
        <div className="panel-hd">
          <div className="panel-title">
            Client &amp; Store Directory <span>{clients.length} purchasing partners</span>
          </div>
        </div>

        <div className="search-bar">
          <input
            className="search-input"
            placeholder="Search store name, location, or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="panel fade-up d-2 mt-18">
        <div className="panel-hd">
          <div className="panel-title">Partner Ranking &amp; Volume</div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Store / Partner Name</th>
                <th>Orders</th>
                <th>Gross Revenue</th>
                <th>Location / Address</th>
                <th>Contact Phone</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c.name}>
                  <td className="num">{i + 1}</td>
                  <td className="highlight" style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="num">{fmtNum(c.count)}</td>
                  <td className="highlight text-mono">{fmtCurrency(c.revenue)}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-2)' }}>{c.address || '—'}</td>
                  <td className="text-mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>{c.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
