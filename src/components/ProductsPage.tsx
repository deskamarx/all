import { useState } from 'react';
import type { FC } from 'react';
import type { AppMeta } from '../types';
import { fmtCurrency, fmtNum } from '../data';
import { BrandPieChart, TopProductsBarChart } from './Charts';

interface Props {
  meta: AppMeta;
}

export const ProductsPage: FC<Props> = ({ meta }) => {
  const [filterBrand, setFilterBrand] = useState('ALL');

  const products = (meta.topProducts || []).filter(p => {
    if (filterBrand === 'ALL') return true;
    return p.brand === filterBrand;
  });

  return (
    <>
      <div className="grid-2 fade-up">
        <BrandPieChart meta={meta} />
        <TopProductsBarChart meta={meta} />
      </div>

      <div className="panel fade-up d-3 mt-18">
        <div className="panel-hd">
          <div className="panel-title">
            Product Catalog &amp; Performance <span>{products.length} models tracked</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'Xiaomi / Redmi', 'Honor', 'Realme', 'Internal Transfer'].map(b => (
              <button
                key={b}
                className={`panel-btn ${filterBrand === b ? 'active' : ''}`}
                onClick={() => setFilterBrand(b)}
              >
                {b === 'ALL' ? 'All Brands' : b}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Device Model</th>
                <th>Category / Brand</th>
                <th>Units Sold</th>
                <th>Order Count</th>
                <th>Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.name}>
                  <td className="num">{i + 1}</td>
                  <td className="highlight" style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span className="pill pill-cyan" style={{ fontSize: 10 }}>{p.brand}</span>
                  </td>
                  <td className="num">{fmtNum(p.qty)}</td>
                  <td className="num">{fmtNum(p.count)}</td>
                  <td className="highlight text-mono">{fmtCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
