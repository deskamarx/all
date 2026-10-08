import https from 'https';

const url = 'https://script.google.com/macros/s/AKfycbx18XXxHBXgoLNAdDCErE5hCP23lJWubXCu438YCSHkAf2GYv_HtQ4gAvvC5YuGyTgqMg/exec';

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      console.log(`Status: ${res.statusCode}`);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Redirecting to: ${res.headers.location.substring(0, 80)}...`);
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

fetchUrl(url).then(data => {
  console.log('Total Response Length:', data.length);
  console.log('Response Preview (first 1000 chars):');
  console.log(data.substring(0, 1000));
  try {
    const json = JSON.parse(data);
    console.log('\nParsed JSON Keys:', Object.keys(json));
    if (Array.isArray(json)) {
      console.log('Top array length:', json.length);
      console.log('First item:', json[0]);
    } else {
      for (const k of Object.keys(json)) {
        const val = json[k];
        if (Array.isArray(val)) {
          console.log(`Key '${k}' array length:`, val.length, 'First item:', val[0]);
        } else if (typeof val === 'object' && val !== null) {
          console.log(`Key '${k}' object keys:`, Object.keys(val));
        } else {
          console.log(`Key '${k}':`, val);
        }
      }
    }
  } catch (e) {
    console.log('Response is not JSON:', e.message);
  }
}).catch(err => {
  console.error('Fetch error:', err);
});
