// Builds the letter-linked concept set (light + dark variants).
const fs = require('fs');
fs.mkdirSync('out2', { recursive: true });
const set = [
  ['06-crown-of-a', './n1_crown', { dark: false }],
  ['06-crown-of-a-dark', './n1_crown', { dark: true }],
  ['07-jhumka-a', './n2_jhumka', { dark: true }],
  ['07-jhumka-a-light', './n2_jhumka', { dark: false }],
  ['08-sa-monogram', './n3_sa', { dark: false }],
  ['08-sa-monogram-dark', './n3_sa', { dark: true }],
  ['09-heart-of-two-s', './n4_sheart', { dark: false }],
  ['09-heart-of-two-s-dark', './n4_sheart', { dark: true }],
];
for (const [name, mod, opt] of set) {
  fs.writeFileSync(`out2/${name}.svg`, require(mod)(opt));
  console.log(name);
}
