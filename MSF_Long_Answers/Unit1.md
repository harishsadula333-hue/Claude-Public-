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
