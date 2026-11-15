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
