// Key formulas added in front of answers where the solution sheet uses a formula without stating it.
// Same shape as answers.js: F[unit][q] = {a, b} or {full}; missing entries = formula already written in the answer.
const F = {
1: {
1: { a: `a = bq + r (0 ≤ r &lt; b) ⇒ gcd(a,b) = gcd(b,r); gcd(a,b,c) = gcd(gcd(a,b), c)`, b: `gcd(a,b) = ax + by (back-substitute from the last non-zero remainder)` },
2: { b: `a = bq + r; if d|a and d|b then d|(a − bq)` },
3: { a: `gcd(a,b) = ax + by (Euclidean algorithm + back-substitution)`, b: `Canonical form n = p₁^α₁ · p₂^α₂ · … · p_k^α_k, p₁ &lt; p₂ &lt; … &lt; p_k primes` },
4: { a: `gcd = Π pᵢ^min(αᵢ, βᵢ, γᵢ); LCM = Π pᵢ^max(αᵢ, βᵢ, γᵢ)`, b: `gcd(a,b) = m·a + n·b (Euclid + back-substitution)` },
5: { full: `a = bq + r, 0 ≤ r &lt; b (q = quotient, r = remainder)` },
6: { b: `a = bq + r ⇒ gcd(a,b) = gcd(b,r); last non-zero remainder = gcd` },
7: { a: `n is prime if no prime p ≤ √n divides n`, b: `a = bq + r ⇒ gcd(a,b) = gcd(b,r)` },
9: { full: `a = bq + r ⇒ gcd(a,b) = gcd(b,r); d = m·a + n·b` },
10: { full: `gcd = Π pᵢ^min(αᵢ, βᵢ); LCM = Π pᵢ^max(αᵢ, βᵢ); gcd(a,b) · lcm(a,b) = a · b` },
},
2: {
1: { full: `E(X) = Σ x·P(x); E(X²) = Σ x²·P(x); Var(X) = E(X²) − [E(X)]²; σ = √Var(X)` },
3: { a: `E(X) = Σ pᵢxᵢ; E(X²) = Σ xᵢ²pᵢ; Var(X) = E(X²) − [E(X)]²` },
4: { a: `λ = mean = Σfx / Σf; expected frequency = N · e^(−λ) λˣ / x!` },
6: { full: `P(X = x) = ᴰCₓ · ᴳCₙ₋ₓ / ᴺCₙ (D defective, G good, N total, n drawn); E(X) = Σ x·P(x)` },
7: { full: `Σ P(x) = 1; E(X) = Σ x·P(x); E(X²) = Σ x²·P(x); V(X) = E(X²) − [E(X)]²` },
9: { full: `f(x) = F′(x); ∫ f(x) dx = 1; μ = ∫ x f(x) dx; E(X²) = ∫ x² f(x) dx; Var = E(X²) − μ²` },
10: { full: `Mean = ∫ x f(x) dx; Mode: f′(x) = 0, f″(x) &lt; 0; Median M: ∫ₐ^M f(x) dx = ½; ∫ u v dx = u ∫ v dx − ∫ (u′ ∫ v dx) dx` },
},
3: {
2: { a: `s² = (1/n) Σ (xᵢ − x̄)²; no. of samples with replacement = Nⁿ; mean of s² = Σ f·s² / Σ f; σ² = Σ f (s² − mean)² / Σ f`, b: `No. of samples without replacement = ᴺCₙ; s² = (1/n) Σ (xᵢ − x̄)²` },
4: { full: `z = (X − μ)/σ ⇒ X = μ + zσ` },
5: { full: `μ = Σx/N; σ² = (1/N) Σ (x − μ)²; μx̄ = μ; σx̄ = (σ/√n)·√((N − n)/(N − 1)) [check: (6.83/√2)·√(4/5) = 4.32]` },
6: { full: `z = (X − μ)/σ` },
7: { full: `z = (X − μ)/σ; No. of cases = N × P` },
8: { full: `z = (X − μ)/σ; No. of students = N × P` },
9: { full: `z = (X − μ)/σ; No. of students = N × P` },
10: { full: `z = (X − μ)/σ ⇒ X = μ + zσ; No. of students = N × P` },
},
4: {
7: { full: `s² = Σ (x − x̄)²/(n − 1); S.E.(x̄₁ − x̄₂) = √(s₁²/n₁ + s₂²/n₂); F = larger s² / smaller s², d.f. = (n₁ − 1, n₂ − 1)` },
},
5: {
7: { a: `b_xy = r·σx/σy; b_yx = r·σy/σx; r² = b_xy · b_yx`, b: `r = ±√(b_xy · b_yx) (sign of the coefficients); regression lines pass through (x̄, ȳ)` },
8: { full: `r = ±√(b_xy · b_yx), with b_xy · b_yx ≤ 1; both regression lines pass through (x̄, ȳ)` },
},
};
module.exports = F;
