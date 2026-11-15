<div class="cover">
<h2 style="border:0;font-size:22pt">MSF – LONG QUESTIONS WITH ANSWERS</h2>
<p style="font-size:14pt">Units 1 – 5 (10 long questions per unit)</p>
<p>Answers taken from the provided Unit-wise solution sheets.<br>Boxes marked ⚠️ point out places where the solution sheet has a mistake, a missing answer, or different data from the question bank.</p>
</div>


# UNIT – 1 : LONG QUESTIONS & ANSWERS

---

## Q1. a) Compute GCD(858, 728, 325) by using Euclidean algorithm.

**Answer:** Applying the division algorithm repeatedly (a = 858, b = 728, c = 325):

**Step 1 – gcd(a, b):**
- 858 = 1 × 728 + 130
- 728 = 5 × 130 + 78
- 130 = 1 × 78 + 52
- 78 = 1 × 52 + 26
- 52 = 2 × 26 + 0

∴ gcd(858, 728) = 26 = d

**Step 2 – gcd(c, d):**
- 325 = 12 × 26 + 13
- 26 = 2 × 13 + 0

∴ gcd(26, 325) = 13

**∴ gcd(858, 728, 325) = 13**

## Q1. b) Find the integers x and y such that 256x + 116y = 4.

**Answer:** First compute gcd(256, 116) using the Euclidean algorithm:
- 256 = 116 × 2 + 24
- 116 = 24 × 4 + 20
- 24 = 20 × 1 + 4
- 20 = 4 × 5 + 0

∴ gcd(256, 116) = 4, so 256x + 116y = 4.

To find x and y, start with the last non-zero remainder:
- 4 = 24 − 20 × 1
- 4 = 24 − 1 × (116 − 4 × 24)
- 4 = 1 × 24 − 1 × 116 + 4 × 24
- 4 = 5 × 24 − 1 × 116
- 4 = 5 × (256 − 116 × 2) − 1 × 116
- 4 = 5 × 256 − 10 × 116 − 1 × 116
- 4 = 5 × 256 + 116 × (−11)

**∴ x = 5 and y = −11**

---

## Q2. a) Find the number of divisors and the sum of the divisors for: (i) 3625 (ii) 18375.

**Answer:**

**(i) 3625**
3625 = 5 × 725 = 5² × 145 = **5³ × 29¹**  (n = p₁^α₁ · p₂^α₂)

- Number of divisors = (1 + α₁)(1 + α₂) = (1 + 3)(1 + 1) = 4 × 2 = **8**
- Sum of divisors = [(p₁^(α₁+1) − 1)/(p₁ − 1)] · [(p₂^(α₂+1) − 1)/(p₂ − 1)]
  = [(5⁴ − 1)/4] · [(29² − 1)/28] = (624/4) · (840/28) = 156 × 30 = **4680**

**(ii) 18375**
18375 = 6125 × 3 = 3 × 5 × 1225 = 3 × 5² × 245 = 3 × 5³ × 49 = **3¹ × 5³ × 7²**

- Number of divisors = (1 + 1)(1 + 3)(1 + 2) = 2 × 4 × 3 = **24**
- Sum of divisors = [(3² − 1)/2] · [(5⁴ − 1)/4] · [(7³ − 1)/6]
  = (8/2) · (624/4) · (342/6) = 4 × 156 × 57 = 624 × 57 = **35,568**

## Q2. b) If a = bq + r where a, b ∈ Z and b ≠ 0, then prove that gcd(a, b) = gcd(b, r).

**Proof:** Let gcd(a, b) = d₁ and gcd(b, r) = d₂.

Now gcd(a, b) = d₁ ⇒ d₁ | a and d₁ | b
⇒ d₁ | (a − bq), where q ∈ Z
⇒ d₁ | r   [∵ a = bq + r ⇒ r = a − bq]

∴ d₁ | b and d₁ | r ⇒ d₁ is a common divisor of b and r.
Since gcd(b, r) = d₂, we have d₁ | d₂ (by definition of gcd) ……… (1)

Similarly, starting with gcd(b, r) = d₂ we can prove that d₂ | d₁ ……… (2)

From (1) and (2): d₁ = d₂ (∵ d₁ and d₂ are positive)

**Hence, gcd(a, b) = gcd(b, r).**

---

## Q3. a) Find the gcd of 45 and 126 and express it in the form 45x + 126y, where x and y are integers.

**Answer:** Compute gcd(45, 126) using the Euclidean algorithm:
- 126 = 45 × 2 + 36
- 45 = 36 × 1 + 9
- 36 = 9 × 4 + 0

∴ gcd(45, 126) = 9

Now find x, y such that 45x + 126y = 9, starting with the last non-zero remainder:
- 9 = 45 − 36 × 1
- = 45 − (126 − 45 × 2)
- = 45 − 126 + 45 × 2
- 9 = 3 × 45 − 1 × 126

**∴ x = 3 and y = −1**

## Q3. b) Find prime factorization (canonical form) of: (i) 2560 (ii) 4116 (iii) 29645.

**Answer:**

**(i) 2560**
2560 = 2 × 1280 = 2² × 640 = 2³ × 320 = 2⁴ × 160 = 2⁵ × 80 = 2⁶ × 40 = 2⁷ × 20 = 2⁸ × 10 = **2⁹ × 5¹**
Canonical form p₁^α₁ p₂^α₂ with p₁ = 2, p₂ = 5, α₁ = 9, α₂ = 1.

**(ii) 4116**
4116 = 2 × 2058 = 2² × 1029 = 2² × 3 × 343 = 2² × 3 × 7 × 49 = 2² × 3 × 7 × 7 × 7 = **2² × 3¹ × 7³**
Canonical form p₁^α₁ p₂^α₂ p₃^α₃ with p₁ = 2, p₂ = 3, p₃ = 7; α₁ = 2, α₂ = 1, α₃ = 3.

**(iii) 29645**
29645 = 5 × 5929 = 5 × 7 × 847 = 5 × 7² × 121 = 5 × 7² × 11 × 11 = **5¹ × 7² × 11²**
Canonical form with p₁ = 5, p₂ = 7, p₃ = 11; α₁ = 1, α₂ = 2, α₃ = 2.

---

## Q4. a) Use prime factorization to find gcd and lcm of: (i) 1274, 3087, 1085 (ii) 81, 100, 289.

**Answer:**

**(i) 1274, 3087, 1085**
- 1274 = 2 × 7² × 13 = 2¹ × 3⁰ × 5⁰ × 7² × 13¹ × 31⁰
- 3087 = 3 × 7³ = 2⁰ × 3¹ × 5⁰ × 7³ × 13⁰ × 31⁰
- 1085 = 5 × 7 × 31 = 2⁰ × 3⁰ × 5¹ × 7¹ × 13⁰ × 31¹

gcd = product of primes with minimum powers = 7^min(2,3,1) = 7¹
**∴ gcd = 7**

LCM = 2^max(1,0,0) × 3^max(0,1,0) × 5^max(0,0,1) × 7^max(2,3,1) × 13^max(1,0,0) × 31^max(0,0,1)
= 2 × 3 × 5 × 7³ × 13 × 31
**∴ LCM = 4,146,870**

**(ii) 81, 100, 289**
- 81 = 3⁴ = 2⁰ × 3⁴ × 5⁰ × 17⁰
- 100 = 2² × 5² = 2² × 3⁰ × 5² × 17⁰
- 289 = 17² = 2⁰ × 3⁰ × 5⁰ × 17²

No common factor ⇒ **gcd = 1**

LCM = 2^max(0,2,0) × 3^max(4,0,0) × 5^max(0,2,0) × 17^max(0,0,2) = 2² × 3⁴ × 5² × 17²
**∴ LCM = 2,340,900**

## Q4. b) Find m and n such that gcd(a, b) = m·a + n·b where: (i) a = 56, b = 72 (ii) a = 1819, b = 3587.

**Answer:**

**(i) a = 56, b = 72**
- 72 = 1 × 56 + 16
- 56 = 3 × 16 + 8
- 16 = 2 × 8 + 0

∴ gcd(56, 72) = 8. Find m, n such that m(56) + n(72) = 8:
- 8 = 56 − 3 × 16
- = 56 − 3(72 − 1 × 56)
- = 56 − 3 × 72 + 3 × 56
- 8 = 4 × 56 − 3 × 72

**∴ m = 4, n = −3**

**(ii) a = 1819, b = 3587**
- 3587 = 1 × 1819 + 1768
- 1819 = 1 × 1768 + 51
- 1768 = 34 × 51 + 34
- 51 = 1 × 34 + 17
- 34 = 2 × 17 + 0

∴ gcd(1819, 3587) = 17. Find m, n such that m(1819) + n(3587) = 17:
- 17 = 51 − 1 × 34
- = 51 − 1 × (1768 − 34 × 51)
- = 51 − 1 × 1768 + 34 × 51
- = 35 × 51 − 1 × 1768
- = 35 × (1819 − 1 × 1768) − 1 × 1768
- = 35 × 1819 − 35 × 1768 − 1 × 1768
- = 35 × 1819 − 36 × 1768
- = 35 × 1819 − 36 × (3587 − 1 × 1819)
- = 35 × 1819 − 36 × 3587 + 36 × 1819
- 17 = 71 × 1819 − 36 × 3587

**∴ m = 71, n = −36**

---

## Q5. State and prove the Division Algorithm.

**Statement (Division Algorithm):** If a, b ∈ Z and b > 0, then there exist unique integers q and r such that
**a = bq + r, 0 ≤ r < b**

**Proof:**
Consider the set of multiples of b: 0, ±b, ±2b, ±3b, …

**Case (i): a is a multiple of b.**
Then a = bq (r = 0) — a perfect multiple and the remainder is zero.

**Case (ii): a is not a multiple of b.**
Then a lies between two consecutive multiples bq and b(q + 1):
- bq < a < b(q + 1)
- bq < a < bq + b
- 0 < a − bq < b
- 0 < r < b  (where r = a − bq)

So a = bq + r with 0 ≤ r < b (existence).

**Case (iii): Uniqueness.**
Suppose there are two other integers q₁ and r₁ with
a = bq + r and a = bq₁ + r₁ (0 ≤ r₁ < b).
Then bq + r = bq₁ + r₁
⇒ bq − bq₁ = r₁ − r
⇒ b(q − q₁) = r₁ − r ……… (1)

⇒ b | (r₁ − r). But since 0 ≤ r, r₁ < b, we have |r₁ − r| < b, so
r₁ − r = 0 ⇒ **r₁ = r**

Substituting r₁ − r = 0 in (1): b(q − q₁) = 0, and since b ≠ 0 (b > 0), q − q₁ = 0 ⇒ **q = q₁**

Hence q and r are unique. **Hence proved.**

---

## Q6. a) Define prime and composite numbers and give examples.

**Answer:**
- **Prime number:** A positive integer p > 1 is said to be prime if and only if its only positive divisors are 1 and p.
- **Composite number:** An integer n > 1 that is not prime is said to be composite, i.e., n = a·b where 1 < a < n and 1 < b < n.

**Examples:** 13 and 17 are prime numbers; 8 and 12 are composite numbers.

## Q6. b) Use the Euclidean algorithm to find gcd(1529, 14039).

**Answer:** Applying the division algorithm repeatedly:
- 14039 = 9 × 1529 + 278
- 1529 = 5 × 278 + 139
- 278 = 2 × 139 + 0

The last non-zero remainder is 139.
**∴ gcd(1529, 14039) = 139**

---

## Q7. a) Show that 47 is a prime.

**Answer:** To test whether 47 is prime, check the prime divisors not exceeding √47.
√47 ≈ 6.86. Since 6 < √47 < 7, the primes ≤ 6 are 2, 3 and 5.
- 47 is not divisible by 2, because it is odd.
- 47 is not divisible by 3, because 4 + 7 = 11 is not divisible by 3.
- 47 is not divisible by 5, because its last digit is neither 0 nor 5.

Therefore, 47 has no prime divisor other than itself among the possible divisors.
**∴ 47 is prime.**

## Q7. b) Find gcd of 272 and 1479.

**Answer:**
- 1479 = 5 × 272 + 119
- 272 = 2 × 119 + 34
- 119 = 3 × 34 + 17
- 34 = 2 × 17 + 0

**∴ gcd(272, 1479) = 17**

---

## Q8. State and prove the Fundamental Theorem of Arithmetic.

**Statement:** Every integer greater than 1 can be expressed as a product of prime numbers, and this factorisation is unique except for the order of the factors.

**Proof:**

**Step 1: Existence**
Let n > 1 be an integer.
- If n is prime, its prime factorisation is n itself.
- If n is composite, then n = a × b, where 1 < a < n and 1 < b < n.
  If a and b are composite, factorise them further. Continuing this process eventually expresses n as a product of primes.

Thus, every integer greater than 1 has a prime factorisation.

**Step 2: Uniqueness**
Suppose an integer has two prime factorisations:
n = p₁p₂ … p_k = q₁q₂ … q_m

By Euclid's lemma, if a prime divides a product, it must divide at least one of its factors. Therefore p₁ must equal one of the primes q_j. Cancel this common prime factor from both sides.

Repeating this process shows that both factorisations contain exactly the same prime factors with the same multiplicities, possibly in a different order.

Hence, the prime factorisation is unique except for the order of the factors. **Hence proved.**

---

## Q9. If d = gcd(826, 1890), find d using Euclidean algorithm and express d as a linear combination of 826 and 1890.

**Answer:** Compute gcd(826, 1890) using the Euclidean algorithm:
- 1890 = 2 × 826 + 238
- 826 = 3 × 238 + 112
- 238 = 2 × 112 + 14
- 112 = 8 × 14 + 0

**∴ d = gcd(826, 1890) = 14**

Now write 14 as a linear combination of 826 and 1890:
- 14 = 238 − 2 × 112
- 14 = 238 − 2(826 − 3 × 238)
- 14 = 238 − 2 × 826 + 6 × 238
- 14 = 7 × 238 − 2 × 826
- 14 = 7(1890 − 2 × 826) − 2 × 826
- **14 = 7 × 1890 − 16 × 826**

∴ 14 = (−16) × 826 + 7 × 1890, i.e. **m = −16, n = 7**

---

## Q10. If a = 6540 and b = 1206, find gcd(a, b) and lcm(a, b) using prime factorisation. Also verify gcd(a, b) · lcm(a, b) = a · b.

**Answer:**
- 6540 = 2 × 3270 = 2² × 1635 = 2² × 3 × 545 = 2² × 3 × 5 × 109
  = 2² × 3¹ × 5¹ × 67⁰ × 109¹
- 1206 = 2 × 603 = 2 × 3 × 201 = 2 × 3² × 67
  = 2¹ × 3² × 5⁰ × 67¹ × 109⁰

gcd = 2^min(2,1) × 3^min(1,2) = 2 × 3
**∴ gcd = 6**

LCM = 2^max(2,1) × 3^max(1,2) × 5^max(1,0) × 67^max(0,1) × 109^max(1,0)
= 2² × 3² × 5 × 67 × 109
**∴ LCM = 1,314,540**

**Verification:** gcd(6540, 1206) · lcm(6540, 1206) = 6540 × 1206
- LHS = 6 × 1314540 = 7887240
- RHS = 6540 × 1206 = 7887240

LHS = RHS. **Hence proved.**



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



# UNIT – 3 : LONG QUESTIONS & ANSWERS

---

## Q1. If X is normally distributed with mean 1 and standard deviation 0.6, obtain P(X > 0) and P(−1.8 ≤ X ≤ 2.0).

**Answer:** Given μ = 1, σ = 0.6, Z = (X − μ)/σ

**(i) P(X > 0):** When X = 0, Z = (0 − 1)/0.6 = −1.66
P(X > 0) = P[(X − 1)/0.6 > −1/0.6] = P(Z > −1.66)
= 0.5 + P(0 < Z < 1.66)   (by symmetry)
= 0.5 + 0.4515
**P(X > 0) = 0.9515**

> ⚠️ Note: the handwritten solution wrote 0.5 − 0.4515 = 0.0485. That number is P(X < 0), not P(X > 0). P(Z > −1.66) covers everything to the right of −1.66, so the correct answer is 0.9515.

**(ii) P(−1.8 ≤ X ≤ 2.0):**
P[(−1.8 − 1)/0.6 ≤ Z ≤ (2.0 − 1)/0.6] = P(−4.66 ≤ Z ≤ 1.66)
= P(0 ≤ Z ≤ 4.66) + P(0 ≤ Z ≤ 1.66)
= A(4.66) + 0.4515
= 0.5000 + 0.4515   (A(4.66) ≈ 0.5)
**P(−1.8 ≤ X ≤ 2.0) ≈ 0.9515**

---

## Q2. Find the mean and standard deviation of sampling distribution of variances for the population 2, 3, 4, 5 by drawing samples of size two: (a) with replacement, (b) without replacement.

**Answer:** Population: 2, 3, 4, 5. Population size N = 4, sample size n = 2.

**(a) With replacement**
Number of samples = Nⁿ = 4² = 16:
(2,2) (2,3) (2,4) (2,5) (3,2) (3,3) (3,4) (3,5) (4,2) (4,3) (4,4) (4,5) (5,2) (5,3) (5,4) (5,5)

Variance of each sample, s² = (1/2)Σ(xᵢ − x̄)²:
- (2,2): ½[(2−2)² + (2−2)²] = 0
- (2,3): ½[(2−2.5)² + (3−2.5)²] = 0.25
- (2,4): ½[(2−3)² + (4−3)²] = 1
- (2,5): ½[(2−3.5)² + (5−3.5)²] = 2.25
- … (5,5): ½[(5−5)² + (5−5)²] = 0

Variances of the 16 samples:

| | | | |
|---|---|---|---|
| 0 | 0.25 | 1 | 2.25 |
| 0.25 | 0 | 0.25 | 1 |
| 1 | 0.25 | 0 | 0.25 |
| 2.25 | 1 | 0.25 | 0 |

| s² | 0 | 0.25 | 1 | 2.25 |
|---|---|---|---|---|
| f | 4 | 6 | 4 | 2 |

Mean of variances = (1/16)[0 + 0.25 + 1 + 2.25 + 0.25 + 0 + 0.25 + 1 + 1 + 0.25 + 0 + 0.25 + 2.25 + 1 + 0.25 + 0] = 10/16 = **0.625**

Variance of the variances:
σ² = (1/16)[4(0 − 0.625)² + 6(0.25 − 0.625)² + 4(1 − 0.625)² + 2(2.25 − 0.625)²] = 0.5156
**Standard deviation σ = 0.7180 ≈ 0.72**

**(b) Without replacement**
Number of samples = ᴺCₙ = ⁴C₂ = 6: (2,3) (2,4) (2,5) (3,4) (3,5) (4,5)

Variances:
- 1st sample (2,3): ½[(2−2.5)² + (3−2.5)²] = 0.25
- 2nd sample (2,4): ½[(2−3)² + (4−3)²] = 1
- 3rd sample (2,5): ½[(2−3.5)² + (5−3.5)²] = 2.25
- 4th sample (3,4): ½[(3−3.5)² + (4−3.5)²] = 0.25
- 5th sample (3,5): ½[(3−4)² + (5−4)²] = 1
- 6th sample (4,5): ½[(4−4.5)² + (5−4.5)²] = 0.25

Mean of variances = (0.25 + 1 + 2.25 + 0.25 + 1 + 0.25)/6 = 5/6 = **0.83**

Variance of the variances:
= (1/6)[(0.25 − 0.83)² + (1 − 0.83)² + (2.25 − 0.83)² + (0.25 − 0.83)² + (1 − 0.83)² + (0.25 − 0.83)²]
= (1/6)(3.0834) = 0.5139
**SD = √0.5139 = 0.7169 ≈ 0.72**

---

## Q3. a) Write the properties and applications of Normal Distribution.

**Definition:** Normal distribution is a continuous probability distribution that has a symmetrical bell-shaped curve.
f(x) = [1/(σ√(2π))] e^(−(x − μ)²/(2σ²))

**Properties of Normal Distribution:**
1. It is a continuous probability distribution.
2. It is symmetrical about the mean.
3. Mean, median and mode are equal.
4. The total area under the curve is equal to 1.
5. The curve is bell-shaped.
6. The curve extends from −∞ to +∞.
7. The two tails approach the horizontal axis but never touch it.
8. The distribution is completely determined by its mean and standard deviation.
9. Approximately 68.27% of observations lie within one standard deviation of the mean.
10. Approximately 95.45% lie within two standard deviations.
11. Approximately 99.73% lie within three standard deviations.

**Applications of Normal Distribution:**
1. Used in educational test scores.
2. Used in quality control.
3. Used in measurement errors.
4. Used in biological measurements.
5. Used in statistical hypothesis testing.
6. Used in sampling theory.
7. Used in industrial production analysis.

## Q3. b) (i) Explain Sampling distribution with an example.

**Answer:** A sampling distribution is the probability distribution of a statistic obtained from all possible samples of a fixed size drawn from a population.

**Example:** Consider the population 2, 4, 6. Take samples of size 2 with replacement:
(2,2), (2,4), (2,6), (4,2), (4,4), (4,6), (6,2), (6,4), (6,6)

| Sample | (2,2) | (2,4) | (2,6) | (4,2) | (4,4) | (4,6) | (6,2) | (6,4) | (6,6) |
|---|---|---|---|---|---|---|---|---|---|
| Mean | 2 | 3 | 4 | 3 | 4 | 5 | 4 | 5 | 6 |

These sample means form the **sampling distribution of the mean**.

## Q3. b) (ii) If X is a normal variate with mean 30 and standard deviation 5, find P(26 ≤ X ≤ 40).

**Answer:** Given μ = 30, σ = 5, Z = (X − μ)/σ
- Lower limit: Z₁ = (26 − 30)/5 = −0.8
- Upper limit: Z₂ = (40 − 30)/5 = 2

P(26 ≤ X ≤ 40) = P(−0.8 ≤ Z ≤ 2) = P(Z ≤ 2) − P(Z ≤ −0.8)
= 0.9772 − 0.2119
**P = 0.7653**

---

## Q4. Find the mean and standard deviation of a normal distribution in which 7% of items are under 35 and 89% are under 63.

**Answer:**
P(X < 35) = 0.07, P(X < 63) = 0.89 ⇒ P(X ≥ 63) = 1 − 0.89 = 0.11

**When X = 35:** Z = (35 − μ)/σ = −Z₁
From the figure, P(−Z₁ ≤ Z ≤ 0) = 0.5 − 0.07 = 0.43 ⇒ Z₁ = 1.48
(35 − μ)/σ = −1.48 ⇒ 35 = −1.48σ + μ ……… (1)

**When X = 63:** (63 − μ)/σ = Z₂
From the figure, P(0 ≤ Z ≤ Z₂) = 0.89 − 0.5 = 0.39 ⇒ Z₂ = 1.23
(63 − μ)/σ = 1.23 ⇒ 63 = 1.23σ + μ ……… (2)

Solving (1) and (2):
μ − 1.48σ = 35
μ + 1.23σ = 63
Subtracting: 2.71σ = 28 ⇒ σ = 28/2.71 = 10.332 ≈ **10**

From (1): 35 = −1.48(10) + μ ⇒ μ = 35 + 14.8 = 49.8 ≈ **50**

**∴ Mean μ = 50, Standard deviation σ = 10 (variance σ² = 100)**

---

## Q5. A population consists of six numbers 4, 8, 12, 16, 20, 24. Consider all samples of size two which can be drawn without replacement from this population. Find: (i) The population mean (ii) The population standard deviation (iii) The mean of the sampling distribution of means (iv) The standard deviation of the sampling distribution of means.

**Answer:**

**(i) Population mean:**
μ = Σxᵢ/N = (4 + 8 + 12 + 16 + 20 + 24)/6 = 84/6 = **14**

**(ii) Population standard deviation:**
σ² = (1/N)Σ(xᵢ − μ)²
= (1/6)[(4−14)² + (8−14)² + (12−14)² + (16−14)² + (20−14)² + (24−14)²]
= (1/6)[100 + 36 + 4 + 4 + 36 + 100] = 280/6
Variance σ² = 46.66
**Standard deviation σ = 6.83**

**(iii) Mean of the sampling distribution of means:**
Number of possible samples without replacement = ⁶C₂ = 15 samples:
(4,8), (4,12), (4,16), (4,20), (4,24), (8,12), (8,16), (8,20), (8,24), (12,16), (12,20), (12,24), (16,20), (16,24), (20,24)

Sample means:
- 6, 8, 10, 12, 14
- 10, 12, 14, 16
- 14, 16, 18
- 18, 20
- 22

μ_x̄ = (1/15)[6 + 8 + 10 + 12 + 14 + 10 + 12 + 14 + 16 + 14 + 16 + 18 + 18 + 20 + 22] = 210/15 = **14**

**(iv) Standard deviation of the sampling distribution of means:**
σ²_x̄ = (1/15) Σ(x̄ᵢ − 14)² = (1/15)[(6 − 14)² + (8 − 14)² + … + (22 − 14)²] = 280/15 = 18.66 (variance)
**σ_x̄ = √18.66 = 4.31**

---

## Q6. The marks obtained in Statistics in a certain examination were found to be normally distributed. If 15% of the students scored ≥ 60 marks and 40% scored < 30 marks, find the mean and standard deviation.

**Answer:** Let μ be the mean and σ the standard deviation of the normal distribution.
P(X < 30) = 0.4 and P(X ≥ 60) = 0.15

- When X = 30: Z = (30 − μ)/σ = −Z₁ ……… (1)
- When X = 60: Z = (60 − μ)/σ = Z₂ ……… (2)

∴ P(0 < Z < Z₂) = 0.5 − 0.15 = 0.35
P(0 < Z < Z₁) = P(−Z₁ < Z < 0) = 0.5 − 0.4 = 0.1

From normal tables: Z₁ = 0.25 and Z₂ = 1.04

(30 − μ)/σ = −0.25, i.e. (μ − 30)/σ = 0.25 ……… (3)
(60 − μ)/σ = 1.04 ……… (4)

Adding (3) and (4): 30/σ = 1.29 ⇒ σ = 30/1.29 = **23.26**
μ = 0.25σ + 30 = 0.25(23.26) + 30 = **35.81**

**Hence, mean = 35.81 and standard deviation = 23.26**

---

## Q7. In a sample of 1000 cases, the mean of a certain test is 14 and standard deviation is 2.5. Assuming the distribution to be normal, find: how many students score between 12 and 15? How many score above 18? How many score below 18?

**Answer:** μ = 14, σ = 2.5. Let X denote the score in the test.

**(i) Between 12 and 15:**
- When X = 12: Z = (12 − 14)/2.5 = −0.8 = Z₁
- When X = 15: Z = (15 − 14)/2.5 = 0.4 = Z₂

P(12 < X < 15) = P(−0.8 < Z < 0.4) = A(0.4) + A(0.8) = 0.1554 + 0.2881 = 0.4435
Number of students scoring between 12 and 15 = 1000 × 0.4435 ≈ **443**

**(ii) Above 18:**
When X = 18: Z = (18 − 14)/2.5 = 1.6
P(X > 18) = P(Z > 1.6) = 0.5 − A(1.6) = 0.5 − 0.4452 = 0.0548
Number of students scoring above 18 = 1000 × 0.0548 = 54.8 ≈ **55**

**(iii) Below 18:**
P(X < 18) = P(Z < 1.6) = 0.5 + A(1.6) = 0.5 + 0.4452 = 0.9452
Number of students scoring below 18 = 1000 × 0.9452 ≈ **945**

---

## Q8. If the masses of 300 students are normally distributed with mean 68 kg and standard deviation 3 kg, how many students have masses: greater than 72 kg; less than or equal to 64 kg; between 65 and 71 kg inclusive?

**Answer:** μ = 68 kg, σ = 3 kg; X denotes masses of students.

**(i) Greater than 72 kg:**
When X = 72: Z = (72 − 68)/3 = 1.33
P(X > 72) = P(Z > 1.33) = 0.5 − A(1.33) = 0.5 − 0.4082 = 0.0918
Number of students = 300 × 0.0918 ≈ **28**

**(ii) Less than or equal to 64 kg:**
When X = 64: Z = (64 − 68)/3 = −1.33
P(X ≤ 64) = P(Z ≤ −1.33) = 0.5 − A(1.33) = 0.5 − 0.4082 = 0.0918
Number of students = 300 × 0.0918 ≈ **28**

**(iii) Between 65 and 71 kg inclusive:**
- When X = 65: Z = (65 − 68)/3 = −1 = Z₁
- When X = 71: Z = (71 − 68)/3 = 1 = Z₂

P(65 ≤ X ≤ 71) = P(−1 ≤ Z ≤ 1) = A(1) + A(1) = 2 × 0.3413 = 0.6826
Number of students = 300 × 0.6826 ≈ **205**

---

## Q9. 1000 students have written an examination; the mean of the test is 35 and standard deviation is 5. Assuming the distribution to be normal, find: how many students' marks lie between 25 and 40? How many get more than 40? How many get below 20? How many get more than 50?

**Answer:** μ = 35, σ = 5, Z = (X − 35)/5

**(i) Between 25 and 40:**
- X₁ = 25: Z = (25 − 35)/5 = −2
- X₂ = 40: Z = (40 − 35)/5 = 1

P(25 ≤ X ≤ 40) = P(−2 ≤ Z ≤ 1) = P(0 ≤ Z ≤ 2) + P(0 ≤ Z ≤ 1) = 0.4772 + 0.3413 = 0.8185
Number of students = 1000 × 0.8185 ≈ **819**

**(ii) More than 40:**
X = 40 ⇒ Z = 1
P(X > 40) = P(Z > 1) = 0.5 − 0.3413 = 0.1587
Number of students = 1000 × 0.1587 ≈ **159**

**(iii) Below 20:**
X = 20 ⇒ Z = (20 − 35)/5 = −3
P(X < 20) = P(Z < −3) = 0.5 − P(0 ≤ Z ≤ 3) = 0.5 − 0.4987 ≈ 0.001
Number of students = 1000 × 0.001 = **1 student**

**(iv) More than 50:**
X = 50 ⇒ Z = (50 − 35)/5 = 3
P(X > 50) = P(Z > 3) = 0.5 − P(0 ≤ Z ≤ 3) = 0.5 − 0.4987 ≈ 0.001
Number of students = 1000 × 0.001 = **1 student**

---

## Q10. The marks obtained in mathematics by 1000 students are normally distributed with mean 78% and standard deviation 11%. Determine: how many students got marks above 90%? What was the highest mark obtained by the lowest 10% of the students? Within what limits did the middle 90% of the students lie?

**Answer:** Given mean μ = 0.78, S.D. σ = 0.11

**(i) Marks above 90%:**
X = 0.9 ⇒ Z = (0.9 − 0.78)/0.11 = 0.12/0.11 = 1.09
P(Z > 1.09) = 0.5 − A(1.09) = 0.5 − 0.3621 = 0.1379
Number of students = N × P(X > 0.9) = 1000 × 0.1379 = 137.9 ≈ **138**

**(ii) Highest mark of the lowest 10%:**
Area to the left of Z₁ is 0.1, so area from Z₁ to 0 = 0.5 − 0.1 = 0.4 ⇒ Z₁ = −1.28
−1.28 = (X − 0.78)/0.11
X = 0.78 − 1.28(0.11) = 0.78 − 0.1408 = 0.6392
**Highest mark obtained by the lowest 10% of students = 63.92% ≈ 64%**

**(iii) Limits of the middle 90%:**
The middle 90% corresponds to an area of 0.9, leaving 0.05 on both sides. The corresponding Z values are ±1.64.
- −1.64 = (X₁ − 0.78)/0.11 ⇒ X₁ = 0.78 − 1.64(0.11) = 0.5996, i.e. 59.96%
- 1.64 = (X₂ − 0.78)/0.11 ⇒ X₂ = 0.78 + 1.64(0.11) = 0.9604, i.e. 96.04%

**Thus, the middle 90% of students have marks between about 60% and 96%.**



# UNIT – 4 : LONG QUESTIONS & ANSWERS

---

## Q1. A sample of 400 items is taken from a population whose standard deviation is 10. The mean of the sample is 40. Test whether the sample has come from a population with mean 38. Also calculate the 95% confidence interval for the population mean.

**Solution:** Given n = 400, x̄ = 40, μ = 38 and σ = 10
1. **Null Hypothesis** H₀: μ = 38
2. **Alternative Hypothesis** H₁: μ ≠ 38
3. **Level of significance:** α = 0.05
4. **Test statistic:**
   Z = (x̄ − μ)/(σ/√n) = (40 − 38)/(10/√400) = 2/0.5 = **4**

Z = 4 > 1.96
∴ **We reject the null hypothesis H₀**, i.e. the sample is not from the population whose mean is 38.

**95% confidence interval:**
(x̄ − 1.96·σ/√n, x̄ + 1.96·σ/√n)
= (40 − 1.96(10)/√400, 40 + 1.96(10)/√400)
= (40 − 19.6/20, 40 + 19.6/20) = (40 − 0.98, 40 + 0.98)
**= (39.02, 40.98)**

---

## Q2. In a sample of 1000 people in Karnataka, 540 are rice eaters and the rest are wheat eaters. Can we assume that both rice and wheat are equally popular in this state at 1% level of significance?

**Solution:** Given n = 1000
p = sample proportion of rice eaters = 540/1000 = 0.54
P = population proportion of rice eaters = 1/2 = 0.5 ∴ Q = 0.5

1. **Null Hypothesis** H₀: Both rice and wheat are equally popular in the state (P = 0.5)
2. **Alternative Hypothesis** H₁: P ≠ 0.5 (two-tailed alternative)
3. **Level of significance:** α = 0.01
4. **Test statistic:**
   z = (p − P)/√(PQ/n) = (0.54 − 0.5)/√(0.5 × 0.5/1000) = **2.532**

Calculated value of z = 2.532
Tabulated value of z at 1% level of significance for a two-tailed test = 2.58

Since calculated z < tabulated z, **we accept the Null Hypothesis H₀** at 1% level of significance and conclude that both rice and wheat are equally popular in the state.

---

## Q3. It is desired to estimate the mean number of hours of continuous use until a certain computer will first require repairs. It can be assumed that σ = 48 hours. How large a sample would be needed so that one will be able to assert with 90% confidence that the sample mean is off by at most 10 hours?

**Solution:** Given:
Maximum error E = 10 hours, σ = 48 hours, z_α/2 = 1.645 (for 90%)

n = (z_α/2 · σ / E)² = (1.645 × 48 / 10)² = (7.896)² = 62.3

**Hence sample size n ≈ 62**

> Note: the solution sheet rounds 62.3 down to 62. The usual rule for sample size is to round **up**, which gives n = 63. Check which one your faculty expects.

---

## Q4. A sample of 100 iron bars is said to be drawn from a large number of bars whose lengths are normally distributed with mean 4 feet and standard deviation 0.6 feet. If the sample mean is 4.2 feet, can the sample be regarded as a truly random sample?

**Solution:**
- **Null Hypothesis** H₀: The sample can be regarded as a truly random sample.
- **Alternative Hypothesis** H₁: The sample cannot be regarded as a random sample.

Here n = sample size = 100, x̄ = sample mean = 4.2, μ = population mean = 4, σ = S.D. of population = 0.6

Assuming H₀ is true, the test statistic is
z = (x̄ − μ)/(σ/√n) = (4.2 − 4)/(0.6/10) = 0.2/0.06 = 10/3 = **3.33**

∴ z = 3.33 > 3

Hence **we reject the Null Hypothesis** and conclude that the given sample cannot be regarded as a truly random sample from the given population.

**Note:** Since |z| > 3 and the level of significance is not given, we may reject H₀ at 5% or 1% level. Here H₀ is rejected without mentioning any level of significance.

---

## Q5. The average income of persons was Rs 210 with a standard deviation of Rs 10 in a sample of 100 people of a city. For another sample of 150 people, the average income was Rs 220 with a standard deviation of Rs 12. The standard deviation of people of the city was Rs 11. Test whether there is any significant difference between the average incomes of the localities.

> ⚠️ **This question has no solution in the uploaded Unit 4 answer file.** The answer below was worked out separately, using the standard method for a test of significance for the difference of two means (large samples).

**Solution:** Given n₁ = 100, x̄₁ = 210; n₂ = 150, x̄₂ = 220; population S.D. of the city σ = 11.

1. **Null Hypothesis** H₀: μ₁ = μ₂ (no significant difference between the average incomes)
2. **Alternative Hypothesis** H₁: μ₁ ≠ μ₂ (two-tailed)
3. **Level of significance:** α = 0.05 (z_α = 1.96)
4. **Test statistic** (the population S.D. σ is known, so we use it):

z = (x̄₁ − x̄₂) / [σ √(1/n₁ + 1/n₂)]
= (210 − 220) / [11 √(1/100 + 1/150)]
= −10 / [11 √(0.01 + 0.00667)]
= −10 / (11 × 0.1291)
= −10 / 1.420
**z = −7.04, |z| = 7.04**

**Decision:** Since |z| = 7.04 > 1.96, **we reject H₀** at 5% level of significance. (|z| > 3 as well, so H₀ is rejected at any usual level.)

**Conclusion:** There is a significant difference between the average incomes of the two localities.

---

## Q6. a) Explain the method for the test of significance for a single mean for large samples.

**Answer – Test of Significance of a Single Mean (Large Samples):**
Let a random sample of size n (n > 30) have the sample mean x̄, and let the population mean μ have a specified value μ₀.

**Working Rule:**
1. **Null Hypothesis:** H₀: x̄ = μ, i.e. "there is no significant difference between the sample mean and population mean", or the sample has been drawn from the parent population.
2. **Alternative Hypothesis:** (i) H₁: x̄ ≠ μ (μ ≠ μ₀), or (ii) H₁: x̄ > μ (μ > μ₀), or (iii) H₁: x̄ < μ (μ < μ₀).
   Since n is large, the sampling distribution of x̄ is approximately normal.
3. **Level of Significance:** Set the level of significance α.
4. **The Test Statistic:**
   - **Case I – σ of the population is known:** Standard error of mean S.E.(x̄) = σ/√n, where n = sample size and σ = S.D. of population.
     z = (x̄ − μ)/S.E.(x̄) = (x̄ − μ)/(σ/√n)
   - **Case II – σ of the population is not known:** Take s, the S.D. of the sample, to compute the S.E. of the mean: S.E.(x̄) = s/√n.
     z = (x̄ − μ)/(s/√n)
5. Find the critical value z_α of z at the level of significance α from the normal table.
6. **Decision:**
   (a) If |z| < z_α, we accept the Null Hypothesis H₀.
   (b) If |z| > z_α, we reject the Null Hypothesis H₀.

**Critical values of z:**

| Level of significance α | 1% | 5% | 10% |
|---|---|---|---|
| Critical region for μ ≠ μ₀ | \|z\| > 2.58 | \|z\| > 1.96 | \|z\| > 1.645 |
| Critical region for μ > μ₀ | z > 2.33 | z > 1.645 | z > 1.28 |
| Critical region for μ < μ₀ | z < −2.33 | z < −1.645 | z < −1.28 |

**Note:** We reject the Null Hypothesis H₀ when |z| > 3 without mentioning any level of significance.

## Q6. b) According to the norms established for a mechanical aptitude test, persons who are 18 years old should average 73.2 with a standard deviation of 8.6. If 45 randomly selected persons of that age averaged 76.7, test the null hypothesis μ = 73.2 against the alternative hypothesis μ > 73.2 at the 0.01 level of significance.

**Solution:** Given n = 45, μ = 73.2, x̄ = mean of the sample = 76.7, σ = S.D. of population = 8.6

1. **Null Hypothesis** H₀: μ = 73.2
2. **Alternative Hypothesis** H₁: μ > 73.2 (right-tailed test)
3. **Level of significance:** α = 0.01
4. **Test statistic:**
   z = (x̄ − μ)/(σ/√n) = (76.7 − 73.2)/(8.6/√45) = 3.5/1.282 = **2.73**

Tabulated value of z at 1% level (right-tailed) = 2.33.
Calculated z (2.73) > tabulated z (2.33).
∴ **The null hypothesis H₀ is rejected**: the mean is significantly greater than 73.2.

> ⚠️ Note: the answer file copies a textbook example where **n = 4**, which gives z = (76.7 − 73.2)/(8.6/√4) = 3.5/4.3 = 0.814 < 2.33, so H₀ is **accepted** there. Your question bank says **n = 45**, which gives z = 2.73 and **rejects** H₀ (worked above). Use whichever n is in your exam paper.

---

## Q7. The nicotine content in milligrams of two samples of tobacco were found to be as follows at 0.05 level:
Sample A: 24, 27, 26, 23, 25, 28
Sample B: 29, 30, 30, 31, 24, 36
Can it be said that the two samples have come from the same normal population? (Apply F-Test).

> ⚠️ Note: the answer file solves a **different version** of this problem (Sample A with only 5 values, 24, 27, 26, 23, 25), and it finds the S.E. and confidence limits for the difference of means instead of doing an F-test. Its work is shown first. The F-test the question asks for, using the question-bank data, follows it.

**(a) Working from the answer file (Sample A = 24, 27, 26, 23, 25):**

| x₁ | x₁ − x̄₁ | (x₁ − x̄₁)² | x₂ | x₂ − x̄₂ | (x₂ − x̄₂)² |
|---|---|---|---|---|---|
| 24 | −1 | 1 | 29 | −1 | 1 |
| 27 | 2 | 4 | 30 | 0 | 0 |
| 26 | 1 | 1 | 30 | 0 | 0 |
| 23 | −2 | 4 | 31 | 1 | 1 |
| 25 | 0 | 0 | 24 | −6 | 36 |
| | | | 36 | 6 | 36 |
| Σx₁ = 125 | | 10 | Σx₂ = 180 | | 74 |

x̄₁ = 125/5 = 25, x̄₂ = 180/6 = 30
s₁² = Σ(x₁ − x̄₁)²/(n₁ − 1) = 10/4 = 2.5
s₂² = Σ(x₂ − x̄₂)²/(n₂ − 1) = 74/5 = 14.8
S.E. of (x̄₁ − x̄₂) = √(s₁²/n₁ + s₂²/n₂) = √(2.5/5 + 14.8/6) = 1.72
95% confidence limits = (x̄₁ − x̄₂) ± 1.96 (S.E.) = (25 − 30) ± 1.96(1.72) = −5 ± 3.37, i.e. **(−8.37, −1.63)**

**(b) F-test using the question-bank data (Sample A = 24, 27, 26, 23, 25, 28):**

1. **H₀:** σ₁² = σ₂² (the two samples come from the same normal population)
2. **H₁:** σ₁² ≠ σ₂²
3. **α = 0.05**

| x₁ | x₁ − 25.5 | (x₁ − x̄₁)² | x₂ | x₂ − 30 | (x₂ − x̄₂)² |
|---|---|---|---|---|---|
| 24 | −1.5 | 2.25 | 29 | −1 | 1 |
| 27 | 1.5 | 2.25 | 30 | 0 | 0 |
| 26 | 0.5 | 0.25 | 30 | 0 | 0 |
| 23 | −2.5 | 6.25 | 31 | 1 | 1 |
| 25 | −0.5 | 0.25 | 24 | −6 | 36 |
| 28 | 2.5 | 6.25 | 36 | 6 | 36 |
| Σ = 153 | | 17.5 | Σ = 180 | | 74 |

x̄₁ = 153/6 = 25.5, x̄₂ = 180/6 = 30
s₁² = 17.5/5 = 3.5, s₂² = 74/5 = 14.8

**Test statistic:** F = larger variance / smaller variance = s₂²/s₁² = 14.8/3.5 = **4.23**
Degrees of freedom: (n₂ − 1, n₁ − 1) = (5, 5). Tabulated F₀.₀₅(5, 5) = 5.05.

Since calculated F (4.23) < tabulated F (5.05), **we accept H₀**: the variances do not differ significantly, so the two samples can be regarded as coming from the same normal population.

---

## Q8. The length of life X of certain computers is approximately normally distributed with mean 800 hours and standard deviation 40 hours. If a random sample of 30 computers has an average life of 788 hours, test the null hypothesis that μ = 800 hours against the alternative that μ ≠ 800 hours at 5% level of significance.

**Solution:**
- **Null Hypothesis** H₀: μ = 800 hours
- **Alternative Hypothesis** H₁: μ ≠ 800 hours

Since H₁ is two-tailed, we use a two-tailed test. Assuming H₀ is true, the test statistic is
z = (x̄ − μ)/(σ/√n)

Here x̄ = sample mean = 788 hours, n = sample size = 30, σ = standard deviation = 40

z = (788 − 800)/(40/√30) = **−1.643**, and |z| = 1.643

Since |z| = 1.643 < 1.96, **we accept the Null Hypothesis H₀ at 5% level of significance**: the mean life of the computers can be taken as 800 hours.

(The answer file also lists other levels: at 0.5% (|z| < 2.81), 1% (|z| < 2.58), 4% (|z| < 2.06) and 10% (|z| < 1.645) H₀ is accepted; at 15% (|z| > 1.44) H₀ is rejected.)

---

## Q9. A manufacturer claims that only 4% of his products are defective. A random sample of 500 was taken among which 100 were defective. Test the hypothesis at 0.05 level.

**Solution:** We have x = 100, n = 500, p = x/n = 0.2 and P = 0.04, Q = 1 − P = 0.96

1. **Null Hypothesis** H₀: P = 0.04
2. **Alternative Hypothesis** H₁: P > 0.04 (right-tailed test)
3. **Level of significance:** α = 0.05
4. **Test statistic:**
   z = (p − P)/√(PQ/n) = (0.2 − 0.04)/√((0.04)(0.96)/500) = 0.16/0.00876 = **18.26**

Since |z| = 18.26 > 1.645 = z₀.₀₅, **we reject the null hypothesis H₀**: the manufacturer's claim is not valid.

(The answer file prints the numerator as −0.16 and z as −18.26. Since 0.2 − 0.04 = +0.16, the correct value is z = +18.26. The decision is the same.)

---

## Q10. A random sample of 400 men and 600 women were asked whether they would like to have a flyover near their residence. 200 men and 325 women were in favour of the proposal. Test the hypothesis that proportions of men and women in favour of the proposal are the same, at 5% level.

**Solution:** Given sample sizes n₁ = 400, n₂ = 600
Proportion of men, p₁ = 200/400 = 0.5
Proportion of women, p₂ = 325/600 = 0.5416

1. **Null Hypothesis** H₀: There is no significant difference between the opinion of men and women as far as the flyover proposal is concerned, i.e. H₀: p₁ = p₂ = p
2. **Alternative Hypothesis** H₁: p₁ ≠ p₂ (two-tailed)
3. **Test statistic** (method of pooling):
   z = (p₁ − p₂) / √[pq(1/n₁ + 1/n₂)]

where p = (n₁p₁ + n₂p₂)/(n₁ + n₂) = (400 × 200/400 + 600 × 325/600)/(400 + 600) = 525/1000 = 0.525
and q = 1 − p = 1 − 0.525 = 0.475

∴ z = (0.5 − 0.5416) / √[0.525 × 0.475 (1/400 + 1/600)] = −0.0416/0.032 = **−1.3**

Thus |z| = 1.3. Since |z| < 1.96, **we accept the null hypothesis H₀ at 5% level of significance**, i.e. there is no difference of opinion between men and women as far as the flyover proposal is concerned.



# UNIT – 5 : LONG QUESTIONS & ANSWERS

---

## Q1. Find the coefficient of correlation between the two variables.

| X | 50 | 50 | 55 | 60 | 65 | 65 | 65 | 60 | 60 | 60 |
|---|---|---|---|---|---|---|---|---|---|---|
| y | 11 | 13 | 14 | 16 | 16 | 15 | 15 | 14 | 13 | 13 |

**Solution:** x̄ = 590/10 = 59, ȳ = 140/10 = 14

| x | y | X = x − x̄ | Y = y − ȳ | X² | Y² | XY |
|---|---|---|---|---|---|---|
| 50 | 11 | −9 | −3 | 81 | 9 | 27 |
| 50 | 13 | −9 | −1 | 81 | 1 | 9 |
| 55 | 14 | −4 | 0 | 16 | 0 | 0 |
| 60 | 16 | 1 | 2 | 1 | 4 | 2 |
| 65 | 16 | 6 | 2 | 36 | 4 | 12 |
| 65 | 15 | 6 | 1 | 36 | 1 | 6 |
| 65 | 15 | 6 | 1 | 36 | 1 | 6 |
| 60 | 14 | 1 | 0 | 1 | 0 | 0 |
| 60 | 13 | 1 | −1 | 1 | 1 | −1 |
| 60 | 13 | 1 | −1 | 1 | 1 | −1 |
| **590** | **140** | **0** | **0** | **290** | **22** | **60** |

Correlation coefficient:
r = [ΣXY − (ΣX ΣY)/N] / {√[ΣX² − (ΣX)²/N] · √[ΣY² − (ΣY)²/N]}
= (60 − 0) / (√(290 − 0) · √(22 − 0)) = 60/79.87

**r = 0.7512**

---

## Q2. Find Karl Pearson's coefficient of correlation from the following data.

| Wages | 100 | 101 | 102 | 102 | 100 | 99 | 97 | 98 | 96 | 95 |
|---|---|---|---|---|---|---|---|---|---|---|
| Cost of living | 98 | 99 | 99 | 97 | 95 | 92 | 95 | 94 | 90 | 91 |

**Solution:** x̄ = 990/10 = 99, ȳ = 950/10 = 95

| Wages (x) | X = x − 99 | X² | Cost of living (y) | Y = y − 95 | Y² | XY |
|---|---|---|---|---|---|---|
| 100 | +1 | 1 | 98 | +3 | 9 | +3 |
| 101 | +2 | 4 | 99 | +4 | 16 | +8 |
| 102 | +3 | 9 | 99 | +4 | 16 | +12 |
| 102 | +3 | 9 | 97 | +2 | 4 | +6 |
| 100 | +1 | 1 | 95 | 0 | 0 | 0 |
| 99 | 0 | 0 | 92 | −3 | 9 | 0 |
| 97 | −2 | 4 | 95 | 0 | 0 | 0 |
| 98 | −1 | 1 | 94 | −1 | 1 | +1 |
| 96 | −3 | 9 | 90 | −5 | 25 | +15 |
| 95 | −4 | 16 | 91 | −4 | 16 | +16 |
| Σx = 990 | ΣX = 0 | ΣX² = 54 | Σy = 950 | ΣY = 0 | ΣY² = 96 | ΣXY = 61 |

r = ΣXY / √(ΣX² × ΣY²) = 61/√(54 × 96) = 61/√5184 = 61/72

**∴ r = +0.847**

---

## Q3. a) Given n = 10, σx = 5.4, σy = 6.2 and sum of the product of deviations from the mean of X and Y is 66, find the correlation coefficient.

**Solution:** Given n = 10, σx = 5.4, σy = 6.2

We have σx² = (1/n)Σ(x − x̄)² ⇒ (5.4)² × 10 = Σ(x − x̄)² ……… (1)
Also σy² = (1/n)Σ(y − ȳ)² ⇒ (6.2)² × 10 = Σ(y − ȳ)² ……… (2)
Also given Σ(x − x̄)(y − ȳ) = 66 ……… (3)

r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² Σ(y − ȳ)²]
= 66 / √[(5.4)²·10 × (6.2)²·10] = 66 / [10 × (5.4)(6.2)]
= 66/334.8

**r = 0.1971**

## Q3. b) Define Rank Correlation Coefficient and its properties.

**Rank Correlation Coefficient:** The British psychologist Charles Edward Spearman found the method of finding the coefficient of correlation by ranks. This method is based on rank and is useful in dealing with qualitative characteristics such as morality, character, intelligence and beauty, which cannot be measured quantitatively as in the case of Pearson's coefficient of correlation. It is based on the ranks given to the observations. Rank correlation is applicable only to individual observations.

Spearman's rank correlation formula:
**ρ = 1 − [6ΣD²] / [N(N² − 1)]**

where ρ → rank coefficient of correlation, ΣD² → sum of the squares of the differences of two ranks, N → number of paired observations.

**Properties of Rank Correlation Coefficient:**
1. The value of ρ lies between +1 and −1.
2. If ρ = 1, there is complete agreement in the order of the ranks and the direction of the ranks is the same.
3. If ρ = −1, there is complete disagreement in the order of the ranks and they are in opposite directions.

---

## Q4. From the following data calculate the rank correlation coefficient after making adjustment for tied ranks.

| X | 48 | 33 | 40 | 9 | 16 | 16 | 65 | 24 | 16 | 57 |
|---|---|---|---|---|---|---|---|---|---|---|
| Y | 13 | 13 | 24 | 6 | 15 | 4 | 20 | 9 | 6 | 13 |

**Formula for repeated (tied) ranks:**
ρ = 1 − 6[ΣD² + (1/12)(m³ − m) + (1/12)(m³ − m) + …] / (N³ − N)
where m = number of items whose ranks are common.

**Solution (question-bank data):** First assign ranks to the variables (smallest value gets rank 1).

| X | Rank (x) | Y | Rank (y) | D = x − y | D² |
|---|---|---|---|---|---|
| 48 | 8 | 13 | 6 | 2 | 4.00 |
| 33 | 6 | 13 | 6 | 0 | 0.00 |
| 40 | 7 | 24 | 10 | −3 | 9.00 |
| 9 | 1 | 6 | 2.5 | −1.5 | 2.25 |
| 16 | 3 | 15 | 8 | −5 | 25.00 |
| 16 | 3 | 4 | 1 | 2 | 4.00 |
| 65 | 10 | 20 | 9 | 1 | 1.00 |
| 24 | 5 | 9 | 4 | 1 | 1.00 |
| 16 | 3 | 6 | 2.5 | 0.5 | 0.25 |
| 57 | 9 | 13 | 6 | 3 | 9.00 |
| | | | | | **ΣD² = 55.5** |

- In X, 16 is repeated 3 times ⇒ m = 3 → (1/12)(3³ − 3) = 2
- In Y, 6 is repeated 2 times ⇒ m = 2 → (1/12)(2³ − 2) = 0.5
- In Y, 13 is repeated 3 times ⇒ m = 3 → (1/12)(3³ − 3) = 2

N = 10, N³ − N = 990

ρ = 1 − 6[55.5 + 2 + 0.5 + 2] / 990 = 1 − 6(60)/990 = 1 − 360/990

**ρ = 0.636**

> ⚠️ Note: the answer file solves the textbook version, where the **last Y value is 19**, not 13. In that version 13 is tied only twice, ΣD² = 41, and
> ρ = 1 − 6[41 + (1/12)(3³ − 3) + (1/12)(2³ − 2) + (1/12)(2³ − 2)] / 990 = **+0.733**.
> Your question bank has 13 as the last Y value, which gives ρ = 0.636 (worked above). Use whichever data is in your exam paper.

---

## Q5. For the following data, find equations of the two regression lines.

| X | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Y | 15 | 25 | 35 | 45 | 55 |

**Solution:** X̄ = (1 + 2 + 3 + 4 + 5)/5 = 15/5 = 3, Ȳ = 175/5 = 35

| X | Y | x = X − X̄ | x² | y = Y − Ȳ | y² | xy |
|---|---|---|---|---|---|---|
| 1 | 15 | −2 | 4 | −20 | 400 | 40 |
| 2 | 25 | −1 | 1 | −10 | 100 | 10 |
| 3 | 35 | 0 | 0 | 0 | 0 | 0 |
| 4 | 45 | 1 | 1 | 10 | 100 | 10 |
| 5 | 55 | 2 | 4 | 20 | 400 | 40 |
| **15** | **175** | | **10** | | **1000** | **100** |

b_yx = Σxy/Σx² = 100/10 = 10
b_xy = Σxy/Σy² = 100/1000 = 1/10

**Regression equation of y on x:** y − ȳ = b_yx(x − x̄)
y − 35 = 10(x − 3) ⇒ **y = 10x + 5**

**Regression equation of x on y:** x − x̄ = b_xy(y − ȳ)
x − 3 = (1/10)(y − 35) ⇒ **x = 0.1y − 0.5**

---

## Q6. Calculate the regression equation of Y on X from the data given below, taking deviations from actual means of X and Y.

| Price (Rs.) | 10 | 12 | 13 | 12 | 16 | 15 |
|---|---|---|---|---|---|---|
| Amount Demanded | 40 | 38 | 43 | 45 | 37 | 43 |

**Solution:** X̄ = 78/6 = 13, Ȳ = 246/6 = 41

| x | X = x − 13 | X² | y | Y = y − 41 | Y² | XY |
|---|---|---|---|---|---|---|
| 10 | −3 | 9 | 40 | −1 | 1 | 3 |
| 12 | −1 | 1 | 38 | −3 | 9 | 3 |
| 13 | 0 | 0 | 43 | 2 | 4 | 0 |
| 12 | −1 | 1 | 45 | 4 | 16 | −4 |
| 16 | 3 | 9 | 37 | −4 | 16 | −12 |
| 15 | 2 | 4 | 43 | 2 | 4 | 4 |
| | | **ΣX² = 24** | | | **ΣY² = 50** | **ΣXY = −6** |

Regression equation of Y on X: Y − Ȳ = r(σy/σx)(X − X̄) ……… (1)

Now r(σy/σx) = ΣXY/ΣX² = −6/24 = −0.25

(1) ⇒ Y − 41 = −0.25(X − 13)
**⇒ Y = −0.25X + 44.25**

(Extra from the answer file: when the price is Rs. 20, Y = −0.25(20) + 44.25 = 39.25, so the likely demand is 39.25.)

---

## Q7. If X = 2Y + 3 and Y = kX + 6 are the regression lines of X on Y and Y on X respectively: a) Show that 0 ≤ k ≤ 1/2  b) If k = 1/8, find r and (x̄, ȳ).

**Solution:**

**(a)** Given X = 2Y + 3 is the regression line of X on Y:
∴ r(σx/σy) = 2 = b_xy

The regression line of Y on X is Y = kX + 6:
∴ r(σy/σx) = k = b_yx

Multiplying these two equations, we get r² = 2k.
Since 0 ≤ r² ≤ 1 ⇒ 0 ≤ 2k ≤ 1
**⇒ 0 ≤ k ≤ 1/2**

**(b)** If k = 1/8, then y = (1/8)x + 6
r² = 2k = 2/8 = 1/4 ⇒ r = ±1/2
Since both regression coefficients are positive, we take the positive value:
**∴ r = 1/2**

Since the regression lines pass through (x̄, ȳ), we have
x̄ = 2ȳ + 3 ……… (1) and ȳ = (1/8)x̄ + 6 ……… (2)

From (2), using (1):
ȳ = (1/8)(2ȳ + 3) + 6 = (2ȳ + 3 + 48)/8
⇒ 8ȳ = 2ȳ + 51 ⇒ 6ȳ = 51
⇒ ȳ = 51/6 = 8.5 and x̄ = 2ȳ + 3 = 102/6 + 3 = 120/6 = 20

**∴ (x̄, ȳ) = (20, 8.5)**

---

## Q8. The equations of two regression lines are 7x − 16y + 9 = 0 and 5y − 4x − 3 = 0. Find the coefficient of correlation and the means of x and y.

**Solution:** Given equations:
7x − 16y + 9 = 0 ……… (1)
5y − 4x − 3 = 0 ……… (2)

**Means:**
(1) × 4 gives 28x − 64y + 36 = 0
(2) × 7 gives −28x + 35y − 21 = 0
Adding: −29y + 15 = 0 ⇒ y = 15/29 = 0.5172

(1) ⇒ 7x = 16y − 9 = 240/29 − 9 = (240 − 261)/29 = −21/29
∴ x = −3/29 = −0.1034

Since the regression lines pass through (x̄, ȳ):
**x̄ = −0.1034 (= −3/29), ȳ = 0.5172 (= 15/29)**

**Coefficient of correlation:**
Take (1) as the regression line of y on x: y = (7/16)x + 9/16 ⇒ b_yx = r(σy/σx) = 7/16
Take (2) as the regression line of x on y: x = (5/4)y − 3/4 ⇒ b_xy = r(σx/σy) = 5/4

Multiplying: r² = (7/16)(5/4) = 35/64 ≤ 1 ✓
r = √35/8 = **0.7395** (positive, since both regression coefficients are positive)

> ⚠️ Note: the answer file takes (1) as x on y and (2) as y on x. That gives r² = (16/7)(4/5) = 64/35 > 1 and r = 8/√35 ≈ 1.35, which is impossible, because r must lie between −1 and +1. Swapping which line is which gives r² = 35/64 and **r = √35/8 ≈ 0.74**. The means in the answer file are correct.

---

## Q9. By the method of least squares, find the straight line that best fits the following data.

| X | 6 | 7 | 7 | 8 | 8 | 8 | 9 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| y | 5 | 5 | 4 | 5 | 4 | 3 | 4 | 3 | 3 |

**Solution:** Let the straight line equation be y = a + bx.
The normal equations are:
Σy = na + bΣx ……… (1)
Σxy = aΣx + bΣx² ……… (2)
n = 9

| xᵢ | yᵢ | xᵢyᵢ | xᵢ² |
|---|---|---|---|
| 6 | 5 | 30 | 36 |
| 7 | 5 | 35 | 49 |
| 7 | 4 | 28 | 49 |
| 8 | 5 | 40 | 64 |
| 8 | 4 | 32 | 64 |
| 8 | 3 | 24 | 64 |
| 9 | 4 | 36 | 81 |
| 9 | 3 | 27 | 81 |
| 10 | 3 | 30 | 100 |
| **72** | **36** | **282** | **588** |

Substituting:
36 = 9a + 72b ……… (3)
282 = 72a + 588b ……… (4)

(3) × 8: 72a + 576b = 288
(4): 72a + 588b = 282
Subtracting: 12b = −6 ⇒ **b = −1/2**

From (3): 36 = 9a + 72(−1/2) ⇒ 36 = 9a − 36 ⇒ 9a = 72 ⇒ **a = 8**

**∴ The best-fit straight line is y = 8 − 0.5x**

---

## Q10. Fit a second degree polynomial to the following data by the method of least squares.

| X | 10 | 12 | 15 | 23 | 20 |
|---|---|---|---|---|---|
| y | 14 | 17 | 23 | 25 | 21 |

**Solution:** Let the second degree parabola be y = a + bx + cx².
The normal equations are:
Σy = na + bΣx + cΣx²
Σxy = aΣx + bΣx² + cΣx³
Σx²y = aΣx² + bΣx³ + cΣx⁴

| xᵢ | yᵢ | xᵢ² | xᵢ³ | xᵢ⁴ | xᵢyᵢ | xᵢ²yᵢ |
|---|---|---|---|---|---|---|
| 10 | 14 | 100 | 1000 | 10000 | 140 | 1400 |
| 12 | 17 | 144 | 1728 | 20736 | 204 | 2448 |
| 15 | 23 | 225 | 3375 | 50625 | 345 | 5175 |
| 23 | 25 | 529 | 12167 | 279841 | 575 | 13225 |
| 20 | 21 | 400 | 8000 | 160000 | 420 | 8400 |
| **80** | **100** | **1398** | **26270** | **521202** | **1684** | **30648** |

n = 5. Substituting:
100 = 5a + 80b + 1398c ……… (1)
1684 = 80a + 1398b + 26270c ……… (2)
30648 = 1398a + 26270b + 521202c ……… (3)

**Eliminate a from (1) and (2):**
(1) × 16: 1600 = 80a + 1280b + 22368c
(2): 1684 = 80a + 1398b + 26270c
Subtracting: −84 = −118b − 3902c ⇒ **84 = 118b + 3902c** ……… (4)

**Eliminate a from (2) and (3):**
(3) × 80: 2451840 = 111840a + 2101600b + 41696160c
(2) × 1398: 2354232 = 111840a + 1954404b + 36725460c
Subtracting: **97608 = 147196b + 4970700c** ……… (5)

**Eliminate b from (4) and (5):**
(4) × 147196: 12364464 = 17369128b + 574358792c
(5) × 118: 11517744 = 17369128b + 586542600c
Subtracting: 846720 = −12183808c
**c = −846720/12183808 = −0.069495**

From (4): 84 = 118b + 3902(−0.069495)
118b = 84 + 271.16949 = 355.16949
**b = 3.009910**

From (1): 100 = 5a + 80(3.009910) + 1398(−0.069495)
100 = 5a + 240.7928 − 97.15401
5a = 100 − 143.63879 = −43.63879
**a = −8.727758**

**∴ The required second degree polynomial is**
**y = −8.7278 + 3.0099x − 0.0695x²**

