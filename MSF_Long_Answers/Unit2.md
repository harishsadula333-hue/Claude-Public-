# UNIT – 2 : LONG QUESTIONS & ANSWERS

---

## Q1. Determine the discrete probability distribution, expectation, variance, and standard deviation of a discrete random variable X which denotes the minimum of the two numbers that appear when a pair of fair dice is thrown once.

**Answer:** Let X be the minimum of the two numbers. Total outcomes = 6 × 6 = 36.

The probability that the minimum equals x is:
**P(X = x) = [(7 − x)² − (6 − x)²] / 36**

**Probability distribution:**

| X = x | P(X = x) | x·P(X = x) | x²·P(X = x) |
|---|---|---|---|
| 1 | 11/36 | 11/36 | 11/36 |
| 2 | 9/36 | 18/36 | 36/36 |
| 3 | 7/36 | 21/36 | 63/36 |
| 4 | 5/36 | 20/36 | 80/36 |
| 5 | 3/36 | 15/36 | 75/36 |
| 6 | 1/36 | 6/36 | 36/36 |
| **Total** | **1** | **91/36** | **301/36** |

**Expectation (Mean):**
E(X) = Σ x·P(X = x) = **91/36 ≈ 2.5278**

**Variance:**
Var(X) = E(X²) − [E(X)]² = 301/36 − (91/36)²
= 8.3611 − 6.3896 = **1.9715**

**Standard deviation:**
σ = √Var(X) = √1.9715 = **1.4041**

---

## Q2. If X is a continuous random variable and k is a constant, then prove that: (i) Var(X + k) = Var(X) (ii) Var(kX) = k² Var(X).

**Proof:** We have
Mean = E(X) = ∫₋∞^∞ x f(x) dx,  E(X²) = ∫₋∞^∞ x² f(x) dx
Var(X) = E(X²) − [E(X)]² = ∫ x² f(x) dx − [∫ x f(x) dx]²

**(i) Var(X + k):**
Var(X + k) = ∫(x + k)² f(x) dx − [∫(x + k) f(x) dx]²
= ∫(x² + k² + 2kx) f(x) dx − [∫ x f(x) dx + ∫ k f(x) dx]²
= ∫ x² f(x) dx + ∫ k² f(x) dx + ∫ 2kx f(x) dx − [E(X) + k]²
= E(X²) + k²(1) + 2k E(X) − {[E(X)]² + k² + 2k E(X)}
= E(X²) + k² + 2kE(X) − [E(X)]² − k² − 2kE(X)
= E(X²) − [E(X)]²
= Var(X)

**∴ Var(X + k) = Var(X)**

**(ii) Var(kX):**
Var(kX) = ∫ k²x² f(x) dx − [∫ kx f(x) dx]²
= k² ∫ x² f(x) dx − k² [∫ x f(x) dx]²
= k² {E(X²) − [E(X)]²}

**∴ Var(kX) = k² Var(X)**

---

## Q3. a) A fair die is tossed. Let the random variable X denote twice the number appearing on the die. Find the mean and variance.

**Answer:** Let X denote twice the number appearing on the face when a die is thrown.

| X = xᵢ | 2 | 4 | 6 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|
| P(xᵢ) | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 | 1/6 |

**Mean:**
E(X) = Σ pᵢxᵢ = (1/6)(2 + 4 + 6 + 8 + 10 + 12) = 42/6 = **7**

E(X²) = Σ xᵢ² P(xᵢ) = (1/6)(4 + 16 + 36 + 64 + 100 + 144) = 364/6 = 60.67

**Variance:**
Var(X) = E(X²) − [E(X)]² = 60.67 − 7² = 60.67 − 49 = **11.67**

## Q3. b) A car firm has two cars which it hires out day by day. The number of demands for a car on each day is distributed as a Poisson variable with mean 1.5. Calculate the proportion of days on which some demand is refused.

**Answer:** λ = 1.5, P(r) = e^(−λ) λ^r / r!

Some demand is refused if the number of demands is more than two, i.e. r > 2.

P(demand refused) = P(r > 2) = 1 − [P(0) + P(1) + P(2)]
= 1 − [e^(−1.5) + e^(−1.5)(1.5)/1! + e^(−1.5)(1.5)²/2!]
= 1 − e^(−1.5) [1 + 1.5 + 1.125]
= 1 − e^(−1.5) (3.625)
= 1 − 0.8088
= **0.1913**

Number of days in a year when some demand is refused = 365 × 0.1913 = 69.82 ≈ **70 days**

---

## Q4. a) Fit a Poisson distribution to the following data:

| x | 0 | 1 | 2 | 3 | 4 | 5 | Total |
|---|---|---|---|---|---|---|---|
| f | 142 | 156 | 69 | 27 | 5 | 1 | 400 |

**Answer:**
Mean = Σxᵢfᵢ / Σfᵢ = (0 + 156 + 138 + 81 + 20 + 5) / 400 = 400/400 = 1

∴ Mean of the Poisson distribution, λ = 1

P(X) = e^(−λ) λ^x / x!, x = 0, 1, 2, 3, 4, 5

Theoretical frequencies = 400 · e^(−1) 1^x / x!, x = 0, 1, …, 5
= 400e⁻¹, 400e⁻¹, 200e⁻¹, 66.67e⁻¹, 16.67e⁻¹, 3.33e⁻¹
= 147.15, 147.15, 73.58, 24.53, 6.13, 1.23

**Theoretical frequencies are:**

| x | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| f | 147 | 147 | 74 | 25 | 6 | 1 |

## Q4. b) Ten coins are thrown simultaneously. Find the probability of getting at least: (i) seven heads (ii) six heads (iii) one head.

**Answer:**
p = probability of getting a head = 1/2, q = probability of not getting a head = 1/2, n = 10
P(X) = ⁿCₓ pˣ qⁿ⁻ˣ

**(i)** P(X ≥ 7) = P(X = 7) + P(X = 8) + P(X = 9) + P(X = 10)
= ¹⁰C₇(1/2)⁷(1/2)³ + ¹⁰C₈(1/2)⁸(1/2)² + ¹⁰C₉(1/2)⁹(1/2)¹ + ¹⁰C₁₀(1/2)¹⁰(1/2)⁰
= (1/2¹⁰)[¹⁰C₇ + ¹⁰C₈ + ¹⁰C₉ + ¹⁰C₁₀]
= (1/2¹⁰)[120 + 45 + 10 + 1]
= 176/1024 = **0.171875**

**(ii)** P(X ≥ 6) = P(X = 6) + P(X ≥ 7)
= ¹⁰C₆(1/2)⁶(1/2)⁴ + 0.171875
= 210/2¹⁰ + 0.171875
= 0.205078 + 0.171875 = **0.376953**

**(iii)** P(X ≥ 1) = 1 − P(X = 0)
= 1 − ¹⁰C₀(1/2)⁰(1/2)¹⁰ = 1 − 1/2¹⁰ = **0.999023**

---

## Q5. a) Given that P(X = 2) = 9 P(X = 4) + 90 P(X = 6) for a Poisson variate X. Find P(X = 4).

**Answer:** P(X = x) = e^(−λ) λˣ / x!

Given P(X = 2) = 9 P(X = 4) + 90 P(X = 6):
e^(−λ)λ²/2! = 9e^(−λ)λ⁴/4! + 90e^(−λ)λ⁶/6!
1/2 = (1/2)[9λ²/12 + 90λ⁴/360]
1 = 3λ²/4 + λ⁴/4
λ⁴ + 3λ² = 4
λ⁴ + 3λ² − 4 = 0
λ⁴ + 4λ² − λ² − 4 = 0
λ²(λ² + 4) − 1(λ² + 4) = 0
(λ² + 4)(λ² − 1) = 0
λ² = 1 ⇒ **λ = 1**

P(X = 4) = e^(−1) 1⁴ / 4! = e⁻¹/24 = **0.01533**

## Q5. b) Eight coins are tossed. Find the probability of getting heads: (i) P(X = 3) (ii) P(X ≤ 4).

**Answer:** n = 8, p = 1/2, q = 1/2
P(X) = ⁿCₓ pˣ qⁿ⁻ˣ, x = 0, 1, …, n (X = number of heads)

**(i)** P(X = 3) = ⁸C₃ p³ q⁵ = ⁸C₃ (1/2)³(1/2)⁵ = [8!/(3!5!)](1/2)⁸ = 56/256
**P(X = 3) = 7/32 ≈ 0.2188**

**(ii)** P(X ≤ 4) = P(X = 0) + P(X = 1) + P(X = 2) + P(X = 3) + P(X = 4)
= (1/2)⁸ (⁸C₀ + ⁸C₁ + ⁸C₂ + ⁸C₃ + ⁸C₄)
= (1/256)[1 + 8 + 28 + 56 + 70]
= 163/256
**P(X ≤ 4) = 0.6367**

---

## Q6. A sample of 4 items is selected at random from a box containing 12 items of which 5 are defective. Find the expected number E of defective items.

**Answer:** Let X denote the number of defective items. X can take the values 0, 1, 2, 3 or 4.
Number of good items = 7, number of defective items = 5, ¹²C₄ = 495.

- P(X = 0) = P(no defective) = ⁷C₄ / ¹²C₄ = 35/495 = 7/99
- P(X = 1) = P(1 defective & 3 good) = ⁷C₃ × ⁵C₁ / ¹²C₄ = (35 × 5)/495 = 35/99
- P(X = 2) = P(2 defective & 2 good) = ⁷C₂ × ⁵C₂ / ¹²C₄ = 210/495 = 42/99
- P(X = 3) = P(3 defective & 1 good) = ⁷C₁ × ⁵C₃ / ¹²C₄ = (7 × 10)/495 = 14/99
- P(X = 4) = P(all defective) = ⁵C₄ / ¹²C₄ = 5/495 = 1/99

**Discrete probability distribution:**

| X = xᵢ | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| f(xᵢ) | 7/99 | 35/99 | 42/99 | 14/99 | 1/99 |

Expected number of defective items:
E(X) = Σ xᵢ f(xᵢ) = 0(7/99) + 1(35/99) + 2(42/99) + 3(14/99) + 4(1/99)
= **165/99 = 5/3 ≈ 1.67**

---

## Q7. A random variable X has the following probability function:

| X | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| p(x) | 0 | K | 2K | 2K | 3K | K² | 2K² | 7K² + K |

Evaluate: (i) K (ii) P(X < 6), P(X ≥ 6), P(0 < X < 5), P(0 ≤ X ≤ 4) (iii) If P(X ≤ K) > 1/2, find the minimum value of K (iv) Mean (v) Variance.

**Answer:**

**(i) Determine K:** ΣP(X) = 1
K + 2K + 2K + 3K + K² + 2K² + 7K² + K = 1
10K² + 9K − 1 = 0
10K² + 10K − K − 1 = 0
10K(K + 1) − 1(K + 1) = 0
(K + 1)(10K − 1) = 0 ⇒ K = 1/10 or −1
Since probability cannot be negative, **K = 1/10**

**(ii)**
- P(X < 6) = Σ(x=0 to 5) P(X = x) = 8K + K² = 8/10 + 1/100 = 81/100 = **0.81**
- P(X ≥ 6) = P(X = 6) + P(X = 7) = 2K² + 7K² + K = 9K² + K = 9/100 + 1/10 = 19/100 = **0.19**
- P(0 < X < 5) = P(X = 1) + P(X = 2) + P(X = 3) + P(X = 4) = K + 2K + 2K + 3K = 8K = **0.8**
- P(0 ≤ X ≤ 4) = P(X = 0) + P(X = 1) + P(X = 2) + P(X = 3) + P(X = 4) = 0 + K + 2K + 2K + 3K = 8K = **0.8**

**(iii) P(X ≤ K) > 1/2, minimum value of K:**
- P(X ≤ 1) = P(X = 0) + P(X = 1) = K = 0.1
- P(X ≤ 2) = 3K = 0.3
- P(X ≤ 3) = 5K = 0.5
- P(X ≤ 4) = 8K = 0.8 > 0.5

**∴ Minimum value of K = 4**

**(iv) Mean:**
E(X) = Σ x P(x) = K + 4K + 6K + 12K + 5K² + 12K² + 49K² + 7K
= 66K² + 30K = 66(1/100) + 30(1/10)
**E(X) = 3.66**

**(v) Variance:**
V(X) = E(X²) − [E(X)]² = Σ x² P(x) − (3.66)²
= K + 8K + 18K + 48K + 25K² + 72K² + 343K² + 49K − (3.66)²
= 440K² + 124K − 13.3956
= 440/100 + 124/10 − 13.3956
= 4.4 + 12.4 − 13.3956 = 16.8 − 13.3956
**V(X) = 3.4044**

---

## Q8. The probabilities of a Poisson variate taking the values 1 and 2 are equal. Calculate: (i) P(X = 0) (ii) P(X = 3) (iii) μ (iv) P(X ≥ 1).

**Answer:** P(X = x) = e^(−λ) λˣ / x!

Given P(X = 1) = P(X = 2):
e^(−λ)λ¹/1! = e^(−λ)λ²/2! ⇒ λ = λ²/2 ⇒ **λ = 2**

**(i)** P(X = 0) = e⁻² · 2⁰ / 0! = e⁻² = **0.1353**

**(ii)** P(X = 3) = e⁻² · 2³ / 3! = e⁻² · 8/6 = (0.1353 × 4)/3 = 0.5413/3 = **0.1804**

**(iii)** μ = mean = λ = **2**

**(iv)** P(X ≥ 1) = 1 − P(X = 0) = 1 − e⁻² = 1 − 0.1353 = **0.8647**

---

## Q9. A continuous random variable X has the distribution function:
F(x) = 0, if x ≤ 1;  k(x − 1)², if 1 ≤ x ≤ 3;  1, if x > 3.
Find: (i) f(x) (ii) k (iii) mean (iv) variance.

**Answer:**

**(i)** f(x) = d/dx [F(x)]
f(x) = 2k(x − 1), if 1 ≤ x ≤ 3;  0, otherwise

**(ii)** Total probability is unity:
∫₁³ f(x) dx = 1
2k ∫₁³ (x − 1) dx = 1
2k [(x − 1)²/2]₁³ = 1
k(4 − 0) = 1 ⇒ 4k = 1 ⇒ **k = 1/4**

(So f(x) = (1/2)(x − 1) for 1 ≤ x ≤ 3.)

**(iii) Mean:**
μ = ∫₋∞^∞ x f(x) dx = ∫₋∞¹ x f(x) dx + ∫₁³ x f(x) dx + ∫₃^∞ x f(x) dx
= 0 + ∫₁³ x · (1/2)(x − 1) dx + 0
= (1/2) ∫₁³ (x² − x) dx = (1/2)[x³/3 − x²/2]₁³
= (1/2){[9 − 4.5] − [1/3 − 1/2]}
= (1/2)[4.5 + 1/6] = (1/2)[27/6 + 1/6] = (1/2)(28/6)
**μ = 7/3 = 2.33**

**(iv) Variance:**
E(X²) = ∫₁³ x² · (1/2)(x − 1) dx = (1/2) ∫₁³ (x³ − x²) dx = (1/2)[x⁴/4 − x³/3]₁³
= (1/2){[81/4 − 27/3] − [1/4 − 1/3]}
= (1/2)[(20.25 − 9) + 1/12] = (1/2)[45/4 + 1/12] = (1/2)(136/12)
E(X²) = 17/3

Variance = E(X²) − [E(X)]² = 17/3 − (7/3)² = 17/3 − 49/9 = (51 − 49)/9
**Variance = 2/9 = 0.22**

---

## Q10. Probability density function of a random variable X is f(x) = (1/2) sin x for 0 ≤ x ≤ π, and 0 elsewhere. Find the mean, mode, and median of the distribution and also find the probability between 0 and π/2.

**Answer:**

**Mean:**
E(X) = ∫ x f(x) dx = ∫₀^π x · (1/2) sin x dx = (1/2) ∫₀^π x sin x dx
= (1/2)[x ∫sin x dx − ∫(1 · ∫sin x dx) dx]₀^π
= (1/2)[−x cos x − ∫(−cos x) dx]₀^π
= (1/2)[−x cos x + sin x]₀^π
= −(1/2)[π cos π − 0 · cos 0] + (1/2)[sin π − sin 0]
= −(1/2)[π(−1)] + (1/2)(0)
**Mean = π/2**

**Mode:** Mode is where f′(x) = 0 and f″(x) < 0.
f′(x) = d/dx[(1/2) sin x] = (1/2) cos x = 0
cos x = 0 = cos(π/2) ⇒ x = π/2
(f″(x) = −(1/2) sin x < 0 at x = π/2)
**∴ Mode = π/2**

**Median:** If M is the median, ∫₀^M f(x) dx = ∫_M^π f(x) dx = 1/2
∫₀^M (1/2) sin x dx = 1/2
(1/2)[−cos x]₀^M = 1/2
−[cos M − cos 0] = 1
−cos M + 1 = 1 ⇒ cos M = 0 = cos(π/2)
M = π/2
**∴ Median = π/2**

**Probability between 0 and π/2:**
P(0 < X < π/2) = ∫₀^(π/2) (1/2) sin x dx = (1/2)[−cos x]₀^(π/2)
= −(1/2)[cos(π/2) − cos 0] = −(1/2)[−1]
**P(0 < X < π/2) = 1/2**
