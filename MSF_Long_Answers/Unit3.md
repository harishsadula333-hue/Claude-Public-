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
