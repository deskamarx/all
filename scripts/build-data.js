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
  console.log('--- Fetching Live Google Apps Script Dataset ---');
  const rawText = await fetchUrl(ENDPOINT);
  const payload = JSON.parse(rawText);

  if (payload.status !== 'success' || !Array.isArray(payload.data)) {
    throw new Error('Invalid Apps Script response structure');
  }

  const rawRows = payload.data.slice(1); // skip header
  console.log(`Processing ${rawRows.length} total orders/records...`);

  const orders = [];
  const productsMap = {};
  const clientsMap = {};
  const repsMap = {};
  const paymentMethodsMap = {};
  const brandsMap = {};

  let totalRevenue = 0;
  let totalItems = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const [sourceSheet, recordRaw, syncTs] = rawRows[i];

    let r = [];
    try {
      if (typeof recordRaw === 'string' && recordRaw.startsWith('[')) {
        r = JSON.parse(recordRaw);
      }
    } catch (e) {}

    // Extract fields
    const date = r[3] || r[0] || '2025-06-15T00:00:00.000Z';
    const email = r[4] || 'N/A';
    const rep = r[5] || email.split('@')[0] || 'General Rep';
    const product = (r[6] || r[5] || 'Unspecified Item').toString().trim();
    const unitPrice = typeof r[8] === 'number' ? r[8] : parseFloat(r[8]) || 0;
    const qty = typeof r[9] === 'number' ? r[9] : parseInt(r[9], 10) || 1;
    const clientName = (r[10] || 'Direct Retail').toString().trim();
    const address = r[11] || '';
    const phone = r[12] || '';
    const details = r[13] || '';
    const paymentMethod = (r[14] || 'COD').toString().trim() || 'COD';
    const notes = r[16] || r[17] || '';

    const lineTotal = unitPrice * qty;
    totalRevenue += lineTotal;
    totalItems += qty;

    // Brand detection
    const upperP = product.toUpperCase();
    let brand = 'Other';
    if (upperP.includes('REDMI') || upperP.includes('XIAOMI') || upperP.includes('POCO')) brand = 'Xiaomi / Redmi';
    else if (upperP.includes('HONOR')) brand = 'Honor';
    else if (upperP.includes('REALME')) brand = 'Realme';
    else if (upperP.includes('IPHONE') || upperP.includes('APPLE')) brand = 'Apple';
    else if (upperP.includes('SAMSUNG')) brand = 'Samsung';
    else if (upperP.includes('TRANSFER') || upperP.includes('BALANCE')) brand = 'Internal Transfer';

    brandsMap[brand] = (brandsMap[brand] || 0) + lineTotal;

    if (product && product.length > 2) {
      if (!productsMap[product]) productsMap[product] = { name: product, count: 0, revenue: 0, qty: 0, brand };
      productsMap[product].count++;
      productsMap[product].revenue += lineTotal;
      productsMap[product].qty += qty;
    }

    if (clientName && clientName.length > 1) {
      if (!clientsMap[clientName]) clientsMap[clientName] = { name: clientName, count: 0, revenue: 0, address, phone };
      clientsMap[clientName].count++;
      clientsMap[clientName].revenue += lineTotal;
    }

    if (rep && rep.length > 1) {
      if (!repsMap[rep]) repsMap[rep] = { name: rep, count: 0, revenue: 0 };
      repsMap[rep].count++;
      repsMap[rep].revenue += lineTotal;
    }

    paymentMethodsMap[paymentMethod] = (paymentMethodsMap[paymentMethod] || 0) + 1;

    orders.push({
      id: `ORD-${String(i + 1).padStart(5, '0')}`,
      sourceSheet,
      date,
      rep,
      email,
      product,
      brand,
      unitPrice,
      qty,
      lineTotal,
      clientName,
      address,
      phone,
      details,
      paymentMethod,
      notes,
      syncTs
    });
  }

  const topProducts = Object.values(productsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 30);

  const topClients = Object.values(clientsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 30);

  const topReps = Object.values(repsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20);

  const sourcesConfig = {
    endpoint: ENDPOINT,
    accessEmail: 'bahalul1964@gmail.com',
    lastUpdated: new Date().toISOString(),
    mode: 'Google Apps Script Direct Stream'
  };

  const metaData = {
    endpoint: ENDPOINT,
    totalOrders: orders.length,
    totalRevenue,
    totalItems,
    topProducts,
    topClients,
    topReps,
    paymentMethods: paymentMethodsMap,
    brands: brandsMap,
    builtAt: new Date().toISOString()
  };

  fs.writeFileSync('public/data/sources.json', JSON.stringify(sourcesConfig, null, 2), 'utf-8');
  fs.writeFileSync('public/data/meta.json', JSON.stringify(metaData, null, 2), 'utf-8');
  fs.writeFileSync('public/data/events.json', JSON.stringify(orders.slice(0, 3000), null, 2), 'utf-8');
  fs.writeFileSync('public/data/assets.json', JSON.stringify({ ordersCount: orders.length, totalRevenue }), 'utf-8');

  console.log(`Successfully processed ${orders.length} orders!`);
  console.log(`Total Revenue: $${totalRevenue.toLocaleString()}`);
  console.log(`Top Products Found: ${topProducts.length}`);
  console.log(`Top Clients Found: ${topClients.length}`);
}

main().catch(err => console.error(err));
