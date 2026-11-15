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
