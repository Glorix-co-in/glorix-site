import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';

const source = resolve(process.argv[2] || 'C:/Users/A5IN/Coding/projects/glorix-main');
const target = resolve(import.meta.dirname, '..');
const names = ['artists', 'teams', 'gallery', 'carousel', 'testimonials', 'collaborations', 'campaigns', 'marquee', 'events'];
const assets = new Set(['assets/cropped_logo.avif', 'assets/glorix music.mp3']);
function collect(value) {
  if (typeof value === 'string' && value.startsWith('assets/')) assets.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
await mkdir(join(target, 'src/data'), { recursive: true });
for (const name of names) {
  const data = await readFile(join(source, 'data', name + '.json'), 'utf8');
  collect(JSON.parse(data));
  const destination = name === 'events' ? 'src/bookings/events.json' : `src/data/${name}.json`;
  await writeFile(join(target, destination), data);
}
const details = await readFile(join(source, 'details.html'), 'utf8');
const terms = details.match(/<ol class="terms-list">([\s\S]*?)<\/ol>/)?.[1] || '';
await writeFile(join(target, 'src/data/terms.json'), JSON.stringify(
  [...terms.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => match[1].replace(/\s+/g, ' ').trim()), null, 2));
const missing = [];
for (const asset of assets) {
  const destination = join(target, 'public', asset);
  try { await stat(join(source, asset)); }
  catch { missing.push(asset); continue; }
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(source, asset), destination);
}
if (missing.length) { console.error('Missing referenced assets:', missing); process.exitCode = 1; }
console.log(`Imported ${names.length} data files and ${assets.size - missing.length} assets.`);
