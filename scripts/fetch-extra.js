import fs from 'fs';
import https from 'https';

const extraSources = [
  { id: 'TV_ORDER', docId: '1-uKP2AFJyVrwibGMZVN7qy9sgdIeKGM4z74SYd4GUXQ', gid: '1285786443', name: 'TV Order Processing' },
  { id: 'DMS_TV', docId: '16xUAPeFNOJf0rAbAp0PkrvBxzWn0-4vs_KQ7WlbZvSI', gid: '1038613336', name: 'DMS - TV' }
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
  for (const src of extraSources) {
    const url = `https://docs.google.com/spreadsheets/d/${src.docId}/export?format=csv&gid=${src.gid}`;
    console.log(`Fetching ${src.name}...`);
    const res = await fetchUrl(url);
    console.log(`  Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`  Lines: ${res.data.split('\n').length}`);
      fs.writeFileSync(`public/data/raw_${src.id}.csv`, res.data, 'utf-8');
    }
  }
}

main();
