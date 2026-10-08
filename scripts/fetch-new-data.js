import fs from 'fs';
import https from 'https';

const sources = [
  {
    id: 'SHEET1',
    docId: '1CcArUO1Ezisacnf_pR-1GtZbrhScCaGM',
    gid: '1002876108',
    name: 'Sheet 1',
    url: 'https://docs.google.com/spreadsheets/d/1CcArUO1Ezisacnf_pR-1GtZbrhScCaGM/edit?gid=1002876108#gid=1002876108'
  },
  {
    id: 'SHEET2',
    docId: '1_HuqeQMIaWOiATeHddFm5tUpsrj0x7EmatN1W_IJLRY',
    gid: '1105115712',
    name: 'Sheet 2',
    url: 'https://docs.google.com/spreadsheets/d/1_HuqeQMIaWOiATeHddFm5tUpsrj0x7EmatN1W_IJLRY/edit?gid=1105115712#gid=1105115712'
  },
  {
    id: 'SHEET3',
    docId: '1W56YQwx-2AVy-bOOOtplCFPUF27uC0YZShobStkBB_Y',
    gid: '165729331',
    name: 'Sheet 3',
    url: 'https://docs.google.com/spreadsheets/d/1W56YQwx-2AVy-bOOOtplCFPUF27uC0YZShobStkBB_Y/edit?gid=165729331#gid=165729331'
  }
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('--- Fetching New Data Sources ---');
  for (const src of sources) {
    const url = `https://docs.google.com/spreadsheets/d/${src.docId}/export?format=csv&gid=${src.gid}`;
    console.log(`Fetching ${src.name} (${src.id})...`);
    try {
      const res = await fetchUrl(url);
      console.log(`  Status: ${res.statusCode}, length: ${res.data.length} bytes`);
      const lines = res.data.split(/\r?\n/);
      console.log(`  Lines: ${lines.length}`);
      console.log(`  Header preview: ${lines[0] ? lines[0].substring(0, 120) : 'EMPTY'}`);
      if (res.statusCode === 200 && lines.length > 1) {
        fs.writeFileSync(`public/data/raw_${src.id}.csv`, res.data, 'utf-8');
      }
    } catch (err) {
      console.error(`  Error:`, err.message);
    }
  }
}

main();
