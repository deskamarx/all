import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { parse as parseCsv } from 'csv-parse/sync';

export const APPS_SCRIPT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx18XXxHBXgoLNAdDCErE5hCP23lJWubXCu438YCSHkAf2GYv_HtQ4gAvvC5YuGyTgqMg/exec';

export const SHEET_SOURCES = [
  {
    id: 'sheet-deposits',
    name: 'Live Deposits & Store Ledger',
    url: 'https://docs.google.com/spreadsheets/d/1U1oAloFWrNMWpwe5KHcUDxGv8gTQyp8prAcMvyGq5yk/edit?resourcekey=&gid=257611599#gid=257611599',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1U1oAloFWrNMWpwe5KHcUDxGv8gTQyp8prAcMvyGq5yk/export?format=csv&gid=257611599',
    type: 'csv',
    gid: '257611599'
  },
  {
    id: 'sheet-devices',
    name: 'Live Device Inventory & Distribution',
    url: 'https://docs.google.com/spreadsheets/d/1Vy0LB_ROivQthO41x49ezzIi2xljesjdC59OlUSmG0E/edit?gid=1061898040#gid=1061898040',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1Vy0LB_ROivQthO41x49ezzIi2xljesjdC59OlUSmG0E/export?format=csv&gid=1061898040',
    type: 'csv',
    gid: '1061898040'
  },
  {
    id: 'sheet-master-3',
    name: 'Extended Operational Ledger A',
    url: 'https://docs.google.com/spreadsheets/d/1bqkVehJun-96yjFNrJRw9S89e3YSjt1pu8e6d0x07bk/edit?gid=0#gid=0',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1bqkVehJun-96yjFNrJRw9S89e3YSjt1pu8e6d0x07bk/export?format=csv&gid=0',
    type: 'csv',
    gid: '0'
  },
  {
    id: 'sheet-master-4',
    name: 'Extended Operational Ledger B',
    url: 'https://docs.google.com/spreadsheets/d/1mop7ZAi0wxPjLmz-Fxc8u0vBKA9gtglrvO234QTEXDo/edit?gid=1592258554#gid=1592258554',
    csvUrl: 'https://docs.google.com/spreadsheets/d/1mop7ZAi0wxPjLmz-Fxc8u0vBKA9gtglrvO234QTEXDo/export?format=csv&gid=1592258554',
    type: 'csv',
    gid: '1592258554'
  }
];

export function fetchUrl(targetUrl, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const isHttps = targetUrl.startsWith('https:');
    const client = isHttps ? https : http;

    client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json,text/csv'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
          const parsed = new URL(targetUrl);
          redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`;
        }
        return fetchUrl(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }

      if (res.statusCode >= 400) {
        let errData = '';
        res.on('data', d => errData += d);
        res.on('end', () => {
          const err = new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`);
          err.statusCode = res.statusCode;
          reject(err);
        });
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function detectBrand(product) {
  const p = (product || '').toUpperCase();
  if (p.includes('REDMI') || p.includes('XIAOMI') || p.includes('POCO')) return 'Xiaomi / Redmi';
  if (p.includes('HONOR')) return 'Honor';
  if (p.includes('REALME')) return 'Realme';
  if (p.includes('IPHONE') || p.includes('APPLE')) return 'Apple';
  if (p.includes('SAMSUNG')) return 'Samsung';
  if (p.includes('TRANSFER') || p.includes('BALANCE')) return 'Internal Transfer';
  if (p.includes('DEPOSIT') || p.includes('PAYMENT')) return 'Bank Deposit';
  return 'Other';
}

export async function fetchAllSources() {
  const sourceStatuses = [];
  const orders = [];
  const productsMap = {};
  const clientsMap = {};
  const repsMap = {};
  const paymentMethodsMap = {};
  const brandsMap = {};

  let totalRevenue = 0;
  let totalItems = 0;

  console.log('--- 1. Fetching Primary Google Apps Script Endpoint ---');
  let appsScriptCount = 0;
  try {
    const rawText = await fetchUrl(APPS_SCRIPT_ENDPOINT);
    const payload = JSON.parse(rawText);

    if (payload.status === 'success' && Array.isArray(payload.data)) {
      const rawRows = payload.data.slice(1);
      appsScriptCount = rawRows.length;
      console.log(`[Apps Script] Ingested ${rawRows.length} records successfully.`);

      for (let i = 0; i < rawRows.length; i++) {
        const [sourceSheet, recordRaw, syncTs] = rawRows[i];
        let r = [];
        try {
          if (typeof recordRaw === 'string' && recordRaw.startsWith('[')) {
            r = JSON.parse(recordRaw);
          }
        } catch (e) {}

        const date = r[3] || r[0] || '2025-06-15T00:00:00.000Z';
        const email = r[4] || 'N/A';
        const rep = r[5] || (email !== 'N/A' ? email.split('@')[0] : 'General Rep');
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

        const brand = detectBrand(product);
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
          id: `ORD-${String(orders.length + 1).padStart(6, '0')}`,
          sourceSheet: sourceSheet || 'Apps Script Core',
          sourceType: 'Apps Script API',
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
          syncTs: syncTs || new Date().toISOString()
        });
      }

      sourceStatuses.push({
        id: 'apps-script-primary',
        name: 'Google Apps Script Executive API',
        url: APPS_SCRIPT_ENDPOINT,
        status: 'active',
        recordsCount: appsScriptCount,
        lastSynced: new Date().toISOString(),
        message: 'Direct live stream connected and active.'
      });
    }
  } catch (err) {
    console.error('[Apps Script API Error]', err.message);
    sourceStatuses.push({
      id: 'apps-script-primary',
      name: 'Google Apps Script Executive API',
      url: APPS_SCRIPT_ENDPOINT,
      status: 'error',
      recordsCount: 0,
      lastSynced: new Date().toISOString(),
      message: err.message
    });
  }

  console.log('--- 2. Fetching Additional Live Google Sheets ---');
  for (const sheet of SHEET_SOURCES) {
    console.log(`[Google Sheet] Fetching ${sheet.name}...`);
    try {
      const csvData = await fetchUrl(sheet.csvUrl);
      const rows = parseCsv(csvData, { skip_empty_lines: true, relax_column_count: true });

      if (rows && rows.length > 1) {
        const headers = rows[0].map(h => (h || '').trim());
        let sheetRecordCount = 0;

        if (sheet.id === 'sheet-deposits') {
          // Format: Date,Dealer ID,Timestamp,Email Address,Employee Name,Depositor Store Name,Deposit Amount,Payment,Payment Slip,Account,Note
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const date = row[0] || row[2] || new Date().toISOString();
            const rep = row[4] || 'Deposit Agent';
            const email = row[3] || 'N/A';
            const clientName = (row[5] || 'Direct Deposit Partner').trim();
            const amountStr = (row[6] || '0').toString().replace(/,/g, '');
            const amount = parseFloat(amountStr) || 0;
            const paymentMethod = (row[7] || 'Bank Transfer').trim() || 'Bank Transfer';
            const notes = `Account: ${row[9] || 'N/A'} ${row[10] ? '| ' + row[10] : ''}`.trim();
            const product = `Store Deposit (${paymentMethod})`;

            if (amount > 0 || clientName) {
              sheetRecordCount++;
              totalRevenue += amount;
              totalItems += 1;

              const brand = 'Bank Deposit';
              brandsMap[brand] = (brandsMap[brand] || 0) + amount;

              if (!clientsMap[clientName]) clientsMap[clientName] = { name: clientName, count: 0, revenue: 0, address: '', phone: '' };
              clientsMap[clientName].count++;
              clientsMap[clientName].revenue += amount;

              if (!repsMap[rep]) repsMap[rep] = { name: rep, count: 0, revenue: 0 };
              repsMap[rep].count++;
              repsMap[rep].revenue += amount;

              paymentMethodsMap[paymentMethod] = (paymentMethodsMap[paymentMethod] || 0) + 1;

              orders.push({
                id: `DEP-${String(orders.length + 1).padStart(6, '0')}`,
                sourceSheet: sheet.name,
                sourceType: 'Google Sheets CSV',
                date,
                rep,
                email,
                product,
                brand,
                unitPrice: amount,
                qty: 1,
                lineTotal: amount,
                clientName,
                address: '',
                phone: '',
                details: `Deposit slip: ${row[8] || 'N/A'}`,
                paymentMethod,
                notes,
                syncTs: new Date().toISOString()
              });
            }
          }
        } else if (sheet.id === 'sheet-devices') {
          // Device inventory format: Status,Wing,Party Name,200 | 256,,X7d,,400 | Lite...
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const clientName = (row[2] || 'Store Allocation').trim();
            const status = row[0] || 'Active';
            const rep = row[19] || 'Logistics';
            const notes = row[18] || '';

            if (clientName && clientName !== 'Party Name') {
              sheetRecordCount++;
              const product = 'Device Allocation / Transfer';
              const brand = 'Xiaomi / Redmi';

              orders.push({
                id: `DEV-${String(orders.length + 1).padStart(6, '0')}`,
                sourceSheet: sheet.name,
                sourceType: 'Google Sheets CSV',
                date: new Date().toISOString(),
                rep,
                email: 'logistics@amaya.internal',
                product,
                brand,
                unitPrice: 0,
                qty: 1,
                lineTotal: 0,
                clientName,
                address: '',
                phone: '',
                details: `Status: ${status} | Notes: ${notes}`,
                paymentMethod: 'Allocation',
                notes,
                syncTs: new Date().toISOString()
              });
            }
          }
        }

        sourceStatuses.push({
          id: sheet.id,
          name: sheet.name,
          url: sheet.url,
          status: 'active',
          recordsCount: sheetRecordCount,
          lastSynced: new Date().toISOString(),
          message: `Successfully ingested ${sheetRecordCount} live sheet entries.`
        });
        console.log(`[Google Sheet] Ingested ${sheetRecordCount} records from ${sheet.name}.`);
      }
    } catch (err) {
      const isAuth = err.statusCode === 401 || err.statusCode === 403 || err.message.includes('401') || err.message.includes('403');
      console.warn(`[Google Sheet] Inaccessible sheet: ${sheet.name} (${err.message})`);
      sourceStatuses.push({
        id: sheet.id,
        name: sheet.name,
        url: sheet.url,
        status: isAuth ? 'protected' : 'error',
        recordsCount: 0,
        lastSynced: new Date().toISOString(),
        message: isAuth
          ? 'Google Sheet requires OAuth / Domain Permissions. Handled gracefully.'
          : err.message
      });
    }
  }

  const topProducts = Object.values(productsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 40);

  const topClients = Object.values(clientsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 40);

  const topReps = Object.values(repsMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 30);

  const metaData = {
    endpoint: APPS_SCRIPT_ENDPOINT,
    totalOrders: orders.length,
    totalRevenue,
    totalItems,
    topProducts,
    topClients,
    topReps,
    paymentMethods: paymentMethodsMap,
    brands: brandsMap,
    sources: sourceStatuses,
    builtAt: new Date().toISOString()
  };

  const sourcesConfig = {
    endpoint: APPS_SCRIPT_ENDPOINT,
    accessEmail: 'bahalul1964@gmail.com',
    lastUpdated: new Date().toISOString(),
    mode: 'Multi-Source Full Stack Data Pipeline (Apps Script + Google Sheets Live CSV)',
    sourcesList: sourceStatuses
  };

  return {
    meta: metaData,
    orders,
    sources: sourcesConfig
  };
}

export function saveToDisk(data, baseDir = '.') {
  const dataDir = path.join(baseDir, 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'sources.json'), JSON.stringify(data.sources, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'meta.json'), JSON.stringify(data.meta, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'events.json'), JSON.stringify(data.orders.slice(0, 5000), null, 2), 'utf-8');
  fs.writeFileSync(path.join(dataDir, 'assets.json'), JSON.stringify({ ordersCount: data.orders.length, totalRevenue: data.meta.totalRevenue }, null, 2), 'utf-8');

  // Also write to dist/data if dist exists
  const distDataDir = path.join(baseDir, 'dist', 'data');
  if (fs.existsSync(path.join(baseDir, 'dist'))) {
    if (!fs.existsSync(distDataDir)) fs.mkdirSync(distDataDir, { recursive: true });
    fs.writeFileSync(path.join(distDataDir, 'sources.json'), JSON.stringify(data.sources, null, 2), 'utf-8');
    fs.writeFileSync(path.join(distDataDir, 'meta.json'), JSON.stringify(data.meta, null, 2), 'utf-8');
    fs.writeFileSync(path.join(distDataDir, 'events.json'), JSON.stringify(data.orders.slice(0, 5000), null, 2), 'utf-8');
    fs.writeFileSync(path.join(distDataDir, 'assets.json'), JSON.stringify({ ordersCount: data.orders.length, totalRevenue: data.meta.totalRevenue }, null, 2), 'utf-8');
  }
}
