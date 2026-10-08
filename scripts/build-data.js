import { fetchAllSources, saveToDisk } from '../server/data-engine.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main() {
  console.log('======================================================');
  console.log('  AMAYA Multi-Source Live Data Build Pipeline');
  console.log('======================================================');

  try {
    const data = await fetchAllSources();
    saveToDisk(data, projectRoot);

    console.log('\n--- Build Data Summary ---');
    console.log(`Total Unified Records: ${data.orders.length}`);
    console.log(`Total Revenue: ৳${data.meta.totalRevenue.toLocaleString()}`);
    console.log(`Active Sources: ${data.meta.sources.filter(s => s.status === 'active').length} of ${data.meta.sources.length}`);
    console.log(`Top Products Indexed: ${data.meta.topProducts.length}`);
    console.log(`Top Clients Indexed: ${data.meta.topClients.length}`);
    console.log(`Top Sales Reps: ${data.meta.topReps.length}`);
    console.log('Successfully wrote public/data and dist/data artifacts.\n');
  } catch (err) {
    console.error('Fatal Build Error:', err);
    process.exit(1);
  }
}

main();
