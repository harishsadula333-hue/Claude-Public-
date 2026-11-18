// Turn caret powers into real superscripts: e^(−λ), p^min(a,b), p₁^α₁, n^(α+1)
module.exports = (h) => h
  .replace(/\^([a-z]+\([^()]*\))/g, '<sup>$1</sup>')
  .replace(/\^\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, '<sup>($1)</sup>')
  .replace(/\^([A-Za-z0-9α-ωₐ-ₜ₀-₉_−+]+)/g, '<sup>$1</sup>')
  .replace(/([A-Za-zα-ω])_\(([^()]*)\)/g, '$1<sub>$2</sub>')
  .replace(/([A-Za-zα-ω])_([A-Za-zα-ω0-9]+(?:\/2)?)/g, '$1<sub>$2</sub>');
