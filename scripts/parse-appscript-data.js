import fs from 'fs';
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

async function main() {
  console.log('Fetching live data from Apps Script endpoint...');
  const rawText = await fetchUrl(ENDPOINT);
  console.log(`Received ${rawText.length} bytes.`);
  const payload = JSON.parse(rawText);
  
  if (payload.status !== 'success' || !Array.isArray(payload.data)) {
    console.error('Invalid payload format:', payload);
    return;
  }

  const rows = payload.data.slice(1); // skip header
  console.log(`Processing ${rows.length} total rows...`);

  const sourceCounts = {};
  const sampleParsedRows = [];
  const allImeis = new Set();
  const stateCounts = {};
  let totalEvents = rows.length;

  for (let i = 0; i < rows.length; i++) {
    const [sourceSheet, recordContentRaw, syncTs] = rows[i];
    sourceCounts[sourceSheet] = (sourceCounts[sourceSheet] || 0) + 1;

    let parsedContent = [];
    try {
      if (typeof recordContentRaw === 'string' && recordContentRaw.startsWith('[')) {
        parsedContent = JSON.parse(recordContentRaw);
      }
    } catch (e) {
      // ignore parse error
    }

    if (i < 5) {
      sampleParsedRows.push({ sourceSheet, syncTs, parsedContent });
    }

    // Search for 14-16 digit numbers or IMEI strings
    for (const val of parsedContent) {
      if (val !== null && val !== undefined) {
        const str = String(val).trim();
        // check for IMEI pattern (14 to 16 digits)
        const match = str.match(/\b\d{14,16}\b/g);
        if (match) {
          for (const imei of match) {
            allImeis.add(imei);
          }
        }
      }
    }
  }

  console.log('\n--- Source Sheet Breakdown ---');
  console.dir(sourceCounts);

  console.log(`\n--- Extracted IMEIs ---`);
  console.log(`Total Unique IMEIs Found: ${allImeis.size}`);

  console.log('\n--- Sample Parsed Rows ---');
  console.log(JSON.stringify(sampleParsedRows, null, 2));
}

main().catch(err => console.error(err));
