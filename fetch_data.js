import fs from 'fs';
import https from 'https';

const sources = [
  {
    id: 'NW',
    docId: '1mop7ZAi0wxPjLmz-Fxc8u0vBKA9gtglrvO234QTEXDo',
    gid: '929163505',
    name: 'Nazrul Wing'
  },
  {
    id: 'CASH',
    docId: '1HjbDxsXofIz_qmpK9RyEIDR60O0Pj8uuAfoTTZPDFCc',
    gid: '0',
    name: 'Cash Accounts'
  },
  {
    id: 'UNO',
    docId: '1bqkVehJun-96yjFNrJRw9S89e3YSjt1pu8e6d0x07bk',
    gid: '1618809603',
    name: 'UNO Yeasin Workstation'
  },
  {
    id: 'ALPANA',
    docId: '1gimiqrecqXwGxTaFjpcprgU6ZvMaMZKYN44599K62cY',
    gid: '0',
    name: 'Alpana Cash'
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
  for (const src of sources) {
    const url = `https://docs.google.com/spreadsheets/d/${src.docId}/export?format=csv&gid=${src.gid}`;
    console.log(`Fetching ${src.name}...`);
    try {
      const res = await fetchUrl(url);
      console.log(`Status: ${res.statusCode}`);
      const lines = res.data.split(/\r?\n/);
      console.log(`Lines: ${lines.length}`);
      console.log(`Header: ${lines[0] ? lines[0].substring(0, 100) : 'EMPTY'}`);
      fs.writeFileSync(`public/data/raw_${src.id}.csv`, res.data, 'utf-8');
    } catch (err) {
      console.error(`Error fetching ${src.name}:`, err);
    }
  }
}

main();
