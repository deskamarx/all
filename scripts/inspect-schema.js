import https from 'https';

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbx18XXxHBXgoLNAdDCErE5hCP23lJWubXCu438YCSHkAf2GYv_HtQ4gAvvC5YuGyTgqMg/exec';

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspect() {
  const rawText = await fetchUrl(ENDPOINT);
  const payload = JSON.parse(rawText);
  const rows = payload.data.slice(1);

  const sheetsMap = {};
  for (const row of rows) {
    const sheetName = row[0];
    if (!sheetsMap[sheetName]) sheetsMap[sheetName] = [];
    if (sheetsMap[sheetName].length < 10) {
      let parsed = row[1];
      try { parsed = JSON.parse(row[1]); } catch(e){}
      sheetsMap[sheetName].push(parsed);
    }
  }

  console.log('=== DATA FIELD STRUCTURE PER SOURCE SHEET ===');
  for (const [sheet, samples] of Object.entries(sheetsMap)) {
    console.log(`\n--- ${sheet} (${samples.length} samples) ---`);
    samples.slice(0, 3).forEach((s, idx) => console.log(`Sample ${idx+1}:`, JSON.stringify(s)));
  }
}

inspect();
