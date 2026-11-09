const fs = require('fs');
const which = process.argv.slice(2);
const all = { c1_arch: 1, c2_monogram: 1, c3_neon: 1, c4_seal: 1, c5_signature: 1 };
fs.mkdirSync('out', { recursive: true });
for (const k of (which.length ? which : Object.keys(all))) {
  fs.writeFileSync(`out/${k}.svg`, require(`./${k}`)());
  console.log('wrote', k);
}
