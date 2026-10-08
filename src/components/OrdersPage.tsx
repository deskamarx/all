import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { OrderRecord, AppMeta } from '../types';
import { fmtCurrency, fmtDate, fmtNum } from '../data';

interface Props {
  orders: OrderRecord[];
  meta: AppMeta;
}

export const OrdersPage: FC<Props> = ({ orders, meta }) => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const brands = useMemo(() => ['ALL', ...Object.keys(meta.brands || {})], [meta]);
  const paymentMethods = useMemo(() => ['ALL', ...Object.keys(meta.paymentMethods || {})], [meta]);

  const filtered = useMemo(() => {
    return orders.filter(ord => {
      if (selectedBrand !== 'ALL' && ord.brand !== selectedBrand) return false;
      if (selectedPayment !== 'ALL' && ord.paymentMethod !== selectedPayment) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        ord.product.toLowerCase().includes(q) ||
        ord.clientName.toLowerCase().includes(q) ||
        ord.rep.toLowerCase().includes(q) ||
        ord.id.toLowerCase().includes(q) ||
        ord.notes.toLowerCase().includes(q)
      );
    });
  }, [orders, search, selectedBrand, selectedPayment]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="panel fade-up">
        <div className="panel-hd">
          <div className="panel-title">
            Live Order Ledger <span>{fmtNum(filtered.length)} orders filtered</span>
          </div>
        </div>

        {/* Filters bar */}
        <div className="search-bar" style={{ gap: 10, flexWrap: 'wrap' }}>
          <input
            className="search-input"
            style={{ flex: 2, minWidth: 220 }}
            placeholder="Search product, store, rep, or ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />

          <select
            className="search-input"
            style={{ flex: 1, minWidth: 150, cursor: 'pointer' }}
            value={selectedBrand}
            onChange={e => { setSelectedBrand(e.target.value); setPage(1); }}
          >
            {brands.map(b => <option key={b} value={b}>{b === 'ALL' ? 'All Brands' : b}</option>)}
          </select>

          <select
            className="search-input"
            style={{ flex: 1, minWidth: 150, cursor: 'pointer' }}
            value={selectedPayment}
            onChange={e => { setSelectedPayment(e.target.value); setPage(1); }}
          >
            {paymentMethods.map(p => <option key={p} value={p}>{p === 'ALL' ? 'All Payment Types' : p}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="panel fade-up d-2 mt-18">
        <div className="panel-hd">
          <div className="panel-title">
            Order Records <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Client / Store</th>
                <th>Sales Rep</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(ord => (
                <tr key={ord.id}>
                  <td className="text-mono highlight">{ord.id}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtDate(ord.date)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{ord.product}</td>
                  <td>
                    <span className="pill pill-blue" style={{ fontSize: 10 }}>{ord.brand}</span>
                  </td>
                  <td>{ord.clientName}</td>
                  <td style={{ color: 'var(--text-2)' }}>{ord.rep}</td>
                  <td className="num">{ord.qty}</td>
                  <td className="text-mono">{ord.unitPrice > 0 ? fmtCurrency(ord.unitPrice) : '—'}</td>
                  <td className="highlight text-mono">{ord.lineTotal > 0 ? fmtCurrency(ord.lineTotal) : '—'}</td>
                  <td>
                    <span className={`badge ${ord.paymentMethod.toLowerCase().includes('cod') ? 'badge-green' : 'badge-cyan'}`}>
                      {ord.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-3)' }}>
                    No matching orders found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button
            className="btn-refresh"
            disabled={currentPage <= 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
          >
            ← Previous
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
            Showing {((currentPage - 1) * pageSize) + 1} – {Math.min(currentPage * pageSize, filtered.length)} of {fmtNum(filtered.length)}
          </span>
          <button
            className="btn-refresh"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
};
