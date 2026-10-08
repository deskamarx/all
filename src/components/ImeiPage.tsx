import { useState, useMemo, useCallback } from 'react';
import type { FC } from 'react';
import type { AssetsData, AppMeta } from '../types';
import { fmtNum } from '../data';

interface Props {
  assets: AssetsData;
  meta: AppMeta;
}

export const ImeiPage: FC<Props> = ({ assets, meta }) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const imeis = assets.imeis ?? [];

  const results = useMemo(() => {
    if (!query || query.length < 5) return [];
    const q = query.trim().replace(/\s/g, '');
    return imeis.filter(im => im.includes(q)).slice(0, 100);
  }, [query, imeis, searched]); // eslint-disable-line

  const doSearch = useCallback(() => setSearched(s => !s), []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  return (
    <>
      {/* Search panel */}
      <div className="panel fade-up">
        <div className="panel-hd">
          <div className="panel-title">
            IMEI Lookup <span>{fmtNum(meta.assets)} assets indexed</span>
          </div>
        </div>
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="Enter full or partial IMEI…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            maxLength={20}
            autoFocus
          />
          <button className="search-btn" onClick={doSearch}>Search</button>
        </div>

        {query.length >= 5 && (
          <div className={`search-result ${results.length > 0 ? 'found' : 'notfound'}`}>
            {results.length === 0 ? (
              <>
                <div style={{ color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>Not Found</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  IMEI <span className="text-mono" style={{ color: 'var(--text-1)' }}>{query}</span> is not in the asset register.
                </div>
              </>
            ) : results.length === 1 ? (
              <>
                <div className="imei-display">{results[0]}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  ✅ Found in asset register (1 match). Open the relevant spreadsheet to trace its full event history.
                </div>
              </>
            ) : (
              <>
                <div style={{ color: 'var(--amber)', fontWeight: 700, marginBottom: 8 }}>
                  {results.length} matches found
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {results.slice(0, 25).map(im => (
                    <div key={im} className="text-mono" style={{ fontSize: 13, color: 'var(--cyan)' }}>
                      {im}
                    </div>
                  ))}
                  {results.length > 25 && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      …and {results.length - 25} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {query.length > 0 && query.length < 5 && (
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Enter at least 5 digits to search.</div>
        )}
      </div>

      {/* Asset Register table */}
      <div className="panel fade-up d-2 mt-18">
        <div className="panel-hd">
          <div className="panel-title">
            Asset Register <span>first 500 of {fmtNum(meta.assets)}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Data version: <span className="text-mono" style={{ color: 'var(--cyan)' }}>{meta.dataVersion}</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>IMEI</th>
                <th>Prefix (TAC)</th>
                <th>Length</th>
              </tr>
            </thead>
            <tbody>
              {imeis.slice(0, 500).map((imei, i) => (
                <tr key={imei}>
                  <td className="num">{i + 1}</td>
                  <td className="imei-cell">{imei}</td>
                  <td className="text-mono" style={{ color: 'var(--text-3)' }}>{imei.slice(0, 8)}</td>
                  <td className="text-mono" style={{ color: 'var(--text-3)' }}>{imei.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)' }}>
          Showing first 500 of {fmtNum(meta.assets)} assets. Use Search above to find specific IMEIs.
        </div>
      </div>
    </>
  );
};
