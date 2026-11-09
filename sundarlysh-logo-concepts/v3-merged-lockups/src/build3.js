// Builds the merged (logo + text as one mark) lockups, light + dark.
const fs = require('fs');
fs.mkdirSync('out3', { recursive: true });
const set = [
  ['10-crowned-a-lockup', './m1_crownA', { dark: false }],
  ['10-crowned-a-lockup-dark', './m1_crownA', { dark: true }],
  ['11-jhumka-a-lockup', './m2_jhumkaA', { dark: true }],
  ['11-jhumka-a-lockup-light', './m2_jhumkaA', { dark: false }],
  ['12-heart-thread-lockup', './m3_threadHeart', { dark: false }],
  ['12-heart-thread-lockup-dark', './m3_threadHeart', { dark: true }],
];
for (const [name, mod, opt] of set) fs.writeFileSync(`out3/${name}.svg`, require(mod)(opt));
console.log('built', set.length);
