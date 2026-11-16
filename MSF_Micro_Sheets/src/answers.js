// FULL long answers, transcribed step-by-step from the uploaded solution PDFs (handwritten + textbook pages).
// A[unit][q] = {a, b} (two halves) or {full}. "NOTE" lines mark where the sheet has an error / differs from the bank.
const T = (rows) => '<table>' + rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>';
const N = (s) => `<span class="nt">NOTE: ${s}</span>`;

const A = {
// ============================ UNIT 1 ============================
1: {
1: { a: `Applying the division algorithm repeatedly we have: 858, 728, 325 (a, b, c)<br>
a,b ⇒ 858 = 1×728 + 130<br>728 = 5×130 + 78<br>130 = 1×78 + 52<br>78 = 1×52 + 26<br>52 = 2×26 + 0<br>
gcd(858, 728) = 26 = d<br>
c,d ⇒ 325 = 12×26 + 13<br>26 = 2×13 + 0<br>gcd(26, 325) = 13<br><b>∴ gcd(858, 728, 325) = 13</b>`,
     b: `We know that gcd(a,b) = gcd(256,116) = 4.<br>First, we compute gcd of 256, 116 by using Euclidean algorithm.<br>
256 = 116×2 + 24<br>116 = 24×4 + 20<br>24 = 20×1 + 4<br>20 = 4×5 + 0<br>∴ gcd(256,116) = 4 ∴ 256x + 116y = 4<br>
To find x and y, it is convenient to start with last non-zero remainder.<br>
4 = 24 − 20×1<br>4 = 24 − 1×(116 − 4×24)<br>4 = 1×24 − 1×116 + 4×24<br>4 = 5×24 − 1×116<br>4 = 5×(256 − 116×2) − 1×116<br>4 = 5×256 − 10×116 − 1×116<br>4 = 5×256 + 116×(−11)<br>4 = x·256 + 116·y<br><b>x = +5 &amp; y = −11</b>` },
2: { a: `<b>(i) 3625</b> = 5×725 = 5²×145 = 5³×29¹;  n = p₁^α₁ p₂^α₂<br>
No. of divisors = (1+α₁)(1+α₂) = (1+3)(1+1) = 4·2 = <b>8</b><br>
Sum of divisors = [(p₁^(α₁+1) − 1)/(p₁ − 1)] · [(p₂^(α₂+1) − 1)/(p₂ − 1)] = [(5⁴−1)/4]·[(29²−1)/28] = (624/4)·(840/28) = 156×30 = <b>4680</b><br>
<b>(ii) 18375</b> = 6125×3 = 3×5×1225 = 3×5²×245 = 3×5³×49 = 3×5³×7²;  n = p₁^α₁ p₂^α₂ p₃^α₃<br>
No. of divisors = (1+α₁)(1+α₂)(1+α₃) = (1+1)(1+3)(1+2) = 2×4×3 = <b>24</b><br>
Sum of divisors = [(p₁^(α₁+1)−1)/(p₁−1)]·[(p₂^(α₂+1)−1)/(p₂−1)]·[(p₃^(α₃+1)−1)/(p₃−1)] = [(3²−1)/2]·[(5⁴−1)/4]·[(7³−1)/6] = (8/2)·(624/4)·(342/6) = 624×57 = <b>35,568</b>`,
     b: `<b>Proof:</b> Let gcd(a,b) = d₁ &amp; gcd(b,r) = d₂.<br>Now gcd(a,b) = d₁ ⇒ d₁|a &amp; d₁|b<br>⇒ d₁|(a − bq), where q∈Z<br>⇒ d₁|r  [∵ a = bq + r ⇒ r = a − bq]<br>
∴ d₁|b &amp; d₁|r ⇒ d₁ is a common divisor of b &amp; r.<br>Since gcd(b,r) = d₂, we have d₁|d₂ (by def. of gcd) ——(1)<br>
Similarly, starting with gcd(b,r) = d₂ we can prove that d₂|d₁ ——(2)<br>From eqⁿ (1) &amp; (2), we have d₁ = d₂ (∵ d₁ &amp; d₂ are +ve)<br><b>Hence, gcd(a,b) = gcd(b,r)</b>` },
3: { a: `First we compute gcd of 45, 126 by using Euclidean algorithm.<br>gcd(45,126):<br>126 = 45×2 + 36<br>45 = 36×1 + 9<br>36 = 9×4 + 0<br>∴ <b>gcd(45,126) = 9</b><br>
Now, we have to find x &amp; y such that 45x + 126y = 9.<br>To find x &amp; y, it is convenient to start with the last non-zero remainder.<br>
9 = 45 − 36×1<br>= 45 − (126 − 45×2)<br>= 45 − 126 + 45×2<br>9 = 3×45 − 1×126<br><b>∴ x = 3 &amp; y = −1</b>`,
     b: `<b>(i) 2560</b> → 2×1280 → 2²×640 → 2³×320 → 2⁴×160 → 2⁵×80 → 2⁶×40 → 2⁷×20 → 2⁸×10 → <b>2⁹×5¹</b><br>∴ It is in the canonical form p₁^α₁ p₂^α₂ where p₁=2, p₂=5; α₁=9, α₂=1.<br>
<b>(ii) 4116</b> → 2×2058 → 2²×1029 → 2²×3×343 → 2²×3×7×49 → 2²×3×7×7×7 → <b>2²×3¹×7³</b><br>∴ It is in the canonical form p₁^α₁×p₂^α₂×p₃^α₃ where p₁=2, p₂=3, p₃=7; α₁=2, α₂=1, α₃=3.<br>
<b>(iii) 29645</b> → 5×5929 → 5×7×847 → 5×7²×121 → 5×7²×11×11 → <b>5¹×7²×11²</b><br>∴ It is in the canonical form p₁^α₁×p₂^α₂×p₃^α₃ where p₁=5, p₂=7, p₃=11; α₁=1, α₂=2, α₃=2.` },
4: { a: `<b>(i) Prime factorisation</b><br>1274 = 2×7²×13 = 2¹×3⁰×5⁰×7²×13¹×31⁰ = p₁^α₁ p₂^α₂ p₃^α₃ p₄^α₄ p₅^α₅ p₆^α₆<br>
3087 = 3×7³ = 2⁰×3¹×5⁰×7³×13⁰×31⁰ = p₁^β₁ p₂^β₂ p₃^β₃ p₄^β₄ p₅^β₅ p₆^β₆<br>
1085 = 5×31×7 = 2⁰×3⁰×5¹×7¹×13⁰×31¹ = p₁^γ₁ p₂^γ₂ p₃^γ₃ p₄^γ₄ p₅^γ₅ p₆^γ₆<br>
∴ gcd = p₄^min(α₄,β₄,γ₄) = 7^min(2,3,1) ⇒ <b>gcd = 7¹ = 7</b><br>
∴ LCM = p₁^max(α₁,β₁,γ₁) p₂^max(α₂,β₂,γ₂) p₃^max(α₃,β₃,γ₃) p₄^max(α₄,β₄,γ₄) p₅^max(α₅,β₅,γ₅) p₆^max(α₆,β₆,γ₆)<br>
= 2^max(1,0,0)×3^max(0,1,0)×5^max(0,0,1)×7^max(2,3,1)×13^max(1,0,0)×31^max(0,0,1)<br>LCM = 2×3×5×7³×13×31 ⇒ <b>LCM = 4146870</b><br>
<b>(ii) Prime factorisation</b><br>81 = 3⁴ = 2⁰×3⁴×5⁰×17⁰ = p₁^α₁ p₂^α₂ p₃^α₃ p₄^α₄<br>100 = 2²×5² = 2²×3⁰×5²×17⁰ = p₁^β₁ p₂^β₂ p₃^β₃ p₄^β₄<br>289 = 17² = 2⁰×3⁰×5⁰×17² = p₁^γ₁ p₂^γ₂ p₃^γ₃ p₄^γ₄<br>
∴ gcd = no common factor ⇒ <b>gcd = 1</b><br>∴ LCM = p₁^max(α₁,β₁,γ₁) p₂^max(α₂,β₂,γ₂) p₃^max(α₃,β₃,γ₃) p₄^max(α₄,β₄,γ₄)<br>
LCM = 2^max(0,2,0)×3^max(4,0,0)×5^max(0,2,0)×17^max(0,0,2) = 2²×3⁴×5²×17² ⇒ <b>LCM = 2340900</b>`,
     b: `<b>(i)</b> First we compute gcd of 56 &amp; 72 by using Euclidean algorithm. gcd(56,72):<br>72 = 1×56 + 16<br>56 = 3×16 + 8<br>16 = 2×8 + 0<br>∴ gcd(56,72) = 8<br>
Now, we have to find m &amp; n such that m(56) + n(72) = 8. To find m &amp; n, it is convenient to start with the last non-zero remainder.<br>
8 = 56 − 3×16 = 56 − 3(72 − 1×56) = 56 − 3×72 + 3×56<br>8 = 4×56 − 3×72 ⇒ <b>m = 4, n = −3</b><br>
<b>(ii) a = 1819 &amp; b = 3587</b>. First we compute gcd of 1819 &amp; 3587 by using Euclidean algorithm.<br>3587 = 1×1819 + 1768<br>1819 = 1×1768 + 51<br>1768 = 34×51 + 34<br>51 = 1×34 + 17<br>34 = 2×17 + 0<br>∴ gcd(1819,3587) = 17<br>
Now, we have to find m &amp; n such that m(1819) + n(3587) = 17. Start with the last non-zero remainder:<br>
17 = 51 − 1×34<br>= 51 − 1×(1768 − 34×51)<br>= 51 − 1×1768 + 34×51<br>= 35×51 − 1×1768<br>= 35×(1819 − 1×1768) − 1×1768<br>= 35×1819 − 35×1768 − 1×1768<br>= 35×1819 − 36×1768<br>= 35×1819 − 36×(3587 − 1×1819)<br>17 = 35×1819 − 36×3587 + 36×1819<br>= 71×1819 − 36×3587<br><b>∴ m = 71 &amp; n = −36</b>` },
5: { full: `<b>Division Algorithm:</b> If 'a' &amp; 'b' ∈ Z and a≠0 then there exist unique integers 'q' and 'r' such that b = aq + r, 0≤r&lt;a &amp; b&gt;0; then there exist unique integers q and r such that <b>a = bq + r, 0 ≤ r &lt; b</b>.<br>
<b>Proof:</b> Consider set of multiples of b: 0, ±b, ±2b, ±3b, …  Given that a = bq + r, 0≤r&lt;b.<br>
<b>Case (i):</b> 'a' is multiple of 'b': a = bq (r = 0) [perfect multiple &amp; remainder is zero]<br>
<b>Case (ii):</b> 'a' is not multiple of 'b', then 'a' lies b/w 2 consecutive nos. bq, b(q+1):<br>bq &lt; a &lt; b(q+1)<br>bq &lt; a &lt; bq + b<br>0 &lt; a − bq &lt; b<br>0 &lt; r &lt; b  (r = a − bq)<br>
<b>Case (iii) Uniqueness:</b> Consider another two integers 'q₁' &amp; 'r₁':<br>a = bq + r<br>a = bq₁ + r₁<br>bq + r = bq₁ + r₁<br>bq − bq₁ = (r₁ − r)<br>b(q − q₁) = (r₁ − r)<br>r₁ − r = b(q − q₁) ——(1)<br>
Since a = bq + r ⇒ b|a; we know that a = bq ⇒ b|a ⇒ b|(r₁ − r)<br>b&gt;0, 0≤r&lt;b ⇒ r₁ − r = 0 ⇒ <b>r₁ = r</b><br>
Sub r₁ − r = 0 in eqⁿ (1): 0 = b(q − q₁) ⇒ b(q − q₁) = 0<br>b≠0 (b&gt;0) ⇒ q − q₁ = 0 ⇒ <b>q = q₁</b>` },
6: { a: `<b>Prime &amp; Composite Numbers:</b> A positive integer (p&gt;1) is said to be prime if and only if the +ve integers that divide it are '1' &amp; 'p'. If it is not prime then it is said to be composite.<br>
→ n&gt;1 is composite then n = ab where 1&lt;a&lt;n, 1&lt;b&lt;n.<br><b>Ex:</b> 13 &amp; 17 are prime numbers. 8 &amp; 12 are composite numbers.`,
     b: `Applying the division algorithm repeatedly we have,<br>14039 = 9×1529 + 278<br>1529 = 5×278 + 139<br>278 = 2×139 + 0<br>The last non-zero remainder is 139.<br><b>∴ gcd(1529, 14039) = 139</b>` },
7: { a: `To test whether 47 is prime, check prime divisors not exceeding √47.<br>√47 ≈ 6.86<br>Since 6 &lt; √47 &lt; 7 &amp; 2, 3 and 5 are the primes less than or equal to 6.<br>
• 47 is not divisible by 2 bcoz it is odd.<br>• 47 is not divisible by 3 bcoz 4+7 = 11, which is not divisible by 3.<br>• 47 is not divisible by 5 bcoz its last digit is neither 0 nor 5.<br>
Therefore, 47 has no prime divisor other than itself among the possible divisors. <b>47 is prime.</b>`,
     b: `1479 = 5×272 + 119<br>272 = 2×119 + 34<br>119 = 3×34 + 17<br>34 = 2×17 + 0<br>Therefore, <b>gcd(272, 1479) = 17</b>` },
8: { full: `<b>Statement:</b> Every integer greater than 1 can be expressed as a product of prime numbers, and this factorisation is unique except for the order of the factors.<br>
<b>Proof:</b><br><b>Step 1: Existence</b><br>Let n&gt;1 be an integer.<br>If 'n' is prime, its prime factorisation is 'n' itself.<br>If 'n' is composite, then n = a×b, 1&lt;a&lt;n, 1&lt;b&lt;n.<br>
If 'a' &amp; 'b' are composite, factorize them further. Continuing this process eventually expresses 'n' as a product of primes.<br>Thus, every integer greater than 1 has a prime factorisation.<br>
<b>Step 2: Uniqueness</b><br>Suppose an integer has two prime factorisations: n = p₁p₂…p_k = q₁q₂…q_m<br>
By Euclid's lemma, if a prime divides a product, it must divide at least one of its factors. Therefore, p₁ must equal one of the primes q_j. Cancel this common prime factor from both sides.<br>
Repeating this process shows that both factorisations contain exactly the same prime factors with the same multiplicities, possibly in a different order.<br>
Hence, the prime factorisation is unique except for the order of the factors. <b>Hence, proved.</b>` },
9: { full: `First, we compute gcd of 826, 1890 by using Euclidean algorithm. gcd(826, 1890):<br>1890 = 2×826 + 238<br>826 = 3×238 + 112<br>238 = 112×2 + 14<br>112 = 14×8 + 0<br><b>∴ gcd(826, 1890) = 14</b><br>
Now, we have to write 14 as a linear combination of 826 and 1890.<br>14 = 238 − 112×2<br>14 = 238 − 2(826 − 3×238)<br>14 = 238 − 2×826 + 6×238<br>14 = 7×238 − 2×826<br>14 = 7(1890 − 2×826) − 2×826<br><b>14 = 7×1890 − 16×826</b><br><b>m = −16, n = 7</b>` },
10: { full: `<b>6540</b> → 2×3270 → 2²×1635 → 2²×3×545 → 2²×3×5×109 = 2²×3¹×5¹×67⁰×109¹ = p₁^α₁ p₂^α₂ p₃^α₃ p₄^α₄ p₅^α₅<br>
<b>1206</b> → 2×603 → 2×3×201 → 2×3²×67 = 2¹×3²×5⁰×67¹×109⁰ = p₁^β₁ p₂^β₂ p₃^β₃ p₄^β₄ p₅^β₅<br>
∴ gcd = p₁^min(α₁,β₁) p₂^min(α₂,β₂) = 2^min(2,1) 3^min(1,2) ⇒ <b>gcd = 2×3 = 6</b><br>
∴ LCM = p₁^max(2,1) p₂^max(1,2) p₃^max(1,0) p₄^max(0,1) p₅^max(1,0) = 2²×3²×5×67×109 ⇒ <b>LCM = 1314540</b><br>
<b>Verify:</b> gcd(6540,1206)·LCM(6540,1206) = 6540×1206<br>6×1314540 = 6540×1206<br>7887240 = 7887240<br>LHS = RHS. <b>Hence, proved!</b>` },
},

// ============================ UNIT 2 ============================
2: {
1: { full: `Let 'X' be the min. no. of favourable condition. Total outcome: 6×6 = 36.<br>The probability that the minimum equals 'x' is <b>P(X=x) = [(7−x)² − (6−x)²]/36</b><br>The probability distribution is:` +
T([['X=x','P(X=x)','xP(X=x)','x²P(X=x)'],['1','11/36','11/36','11/36'],['2','9/36','18/36','36/36'],['3','7/36','21/36','63/36'],['4','5/36','20/36','80/36'],['5','3/36','15/36','75/36'],['6','1/36','6/36','36/36'],['Total','1','91/36','301/36']]) +
`<b>Expectation (mean):</b> E(X) = Σx P(X=x) = <b>91/36</b><br>
<b>Variance:</b> Var(X) = E(X²) − [E(X)]² = 301/36 − (91/36)² = 301/36 − 6.3896 = 8.3611 − 6.3896 = <b>1.9715</b><br>
<b>Standard deviation:</b> σ = √Var(X) = √1.9715 ⇒ <b>σ = 1.4041</b>` },
2: { full: `Mean = E(X) = ∫₋∞^∞ x f(x) dx,  E(X²) = ∫₋∞^∞ x² f(x) dx<br>
<b>(i)</b> Var(X) = E(X²) − [E(X)]² = ∫₋∞^∞ x² f(x) dx − [∫₋∞^∞ x f(x) dx]²<br>
Var(X+k) = ∫₋∞^∞ (x+k)² f(x) dx − [∫₋∞^∞ (x+k) f(x) dx]²<br>
= ∫(x² + k² + 2kx) f(x) dx − [∫x f(x) dx + ∫k f(x) dx]²<br>
= ∫x² f(x) dx + ∫k² f(x) dx + ∫2kx f(x) dx − [E(X) + k]²<br>
= E(X²) + k²(1) + 2kE(X) − {[E(X)]² + k² + 2kE(X)}<br>
= E(X²) + k² + 2kE(X) − [E(X)]² − k² − 2kE(X)<br>
= E(X²) − [E(X)]²<br>⇒ V(X) = Var(X) ⇒ <b>Var(X+k) = Var(X)</b><br>
<b>(ii)</b> Var(kX) = ∫₋∞^∞ k²x² f(x) dx − [∫₋∞^∞ kx f(x) dx]²<br>
= k² ∫₋∞^∞ x² f(x) dx − k² [∫₋∞^∞ x f(x) dx]²<br>
= k² [E(X²) − {E(X)}²]<br>= <b>k² (Var(X))</b>` },
3: { a: `Let 'X' denote twice the no. appearing on the face when a die is thrown.` + T([['X=xᵢ','2','4','6','8','10','12'],['P(xᵢ)','1/6','1/6','1/6','1/6','1/6','1/6']]) +
`<b>Mean:</b> E(X) = Σpᵢxᵢ = 2×1/6 + 4×1/6 + 6×1/6 + 8×1/6 + 10×1/6 + 12×1/6 = 1/6 (2+4+6+8+10+12) = 42/6 = <b>7</b><br>
Now, E(X²) = Σxᵢ² P(xᵢ) = 2²×1/6 + 4²×1/6 + 6²×1/6 + 8²×1/6 + 10²×1/6 + 12²×1/6 = 1/6 (4+16+36+64+100+144) = 364/6 = 60.67<br>
<b>Variance:</b> E(X²) − [E(X)]² = 60.67 − (7)² = 60.67 − 49 = <b>11.67</b>`,
     b: `λ = 1.5;  P(r) = e^(−λ) λ^r / r!<br>Some demand is refused if the no. of demands is more than two, i.e. r&gt;2.<br>
P(demand refused) = P(r&gt;2) = 1 − [P(0) + P(1) + P(2)]<br>= 1 − [e^(−1.5) + e^(−1.5)(1.5)/1! + e^(−1.5)(1.5)²/2!]<br>= 1 − e^(−1.5) [1 + 1.5 + 1.125]<br>= 1 − e^(−1.5) (3.625)<br>= 1 − 0.8088<br>= <b>0.1913</b><br>
No. of days in a year when some demand is refused = 365 × 0.1913 = 69.82 = <b>70 days</b>` },
4: { a: `Mean = Σxᵢfᵢ / Σfᵢ = (0 + 156 + 138 + 81 + 20 + 5)/400 = 400/400 = 1<br>∴ Mean of Poisson distribution i.e. <b>λ = 1</b><br>
P(X) = e^(−λ) λˣ / x!, x = 0,1,2,3,4,5<br>i.e. 400 · e^(−1) 1ˣ / x!, x = 0,1,2,3,4,5<br>
400(e⁻¹), 400(e⁻¹), 200(e⁻¹), 66.67(e⁻¹), 16.67(e⁻¹), 3.33(e⁻¹)<br>⇒ 147.15, 147.15, 73.58, 24.53, 6.13, 1.23<br>Theoretical frequencies are:` + T([['X','0','1','2','3','4','5'],['f','147','147','74','25','6','1']]),
     b: `p = probability of getting a head = 1/2;  q = probability of not getting a head = 1/2;  n = 10<br>P(X) = ⁿCₓ pˣ qⁿ⁻ˣ<br>
<b>(i)</b> P(X≥7) = P(X=7) + P(X=8) + P(X=9) + P(X=10)<br>= ¹⁰C₇(½)⁷(½)³ + ¹⁰C₈(½)⁸(½)² + ¹⁰C₉(½)⁹(½)¹ + ¹⁰C₁₀(½)¹⁰(½)⁰<br>= (1/2¹⁰)[¹⁰C₇ + ¹⁰C₈ + ¹⁰C₉ + ¹⁰C₁₀]<br>
= (1/2¹⁰)[10×9×8×7!/(3×2×7!) + 10×9×8!/(2×8!) + 10×9!/9! + 10!/10!]<br>= (1/2¹⁰)[120 + 45 + 10 + 1] = 176/2¹⁰ = <b>0.171875</b><br>
<b>(ii)</b> P(X≥6) = P(X=6) + P(X≥7) = ¹⁰C₆(½)⁶(½)⁴ + 0.171875<br>= [10×9×8×7×6!/(4×3×2×6!)](½)¹⁰ + 0.171875 = 210/2¹⁰ + 0.171875<br>= 0.205078 + 0.171875 ⇒ <b>P(X≥6) = 0.376953</b><br>
<b>(iii)</b> P(X≥1) = 1 − P(X=0) = 1 − ¹⁰C₀(½)⁰(½)¹⁰ = 1 − 1/2¹⁰ = <b>0.999023</b>` },
5: { a: `P(X=x) = e^(−λ) λˣ / x!<br>Given that P(X=2) = 9P(X=4) + 90P(X=6)<br>
e^(−λ)λ²/2! = 9e^(−λ)λ⁴/4! + 90e^(−λ)λ⁶/6!<br>e^(−λ)λ²/2! = [e^(−λ)λ²/2] [9λ²/12 + 90λ⁴/360]<br>1 = 3λ²/4 + λ⁴/4<br>λ⁴ + 3λ² = 4<br>λ⁴ + 3λ² − 4 = 0<br>λ⁴ + 4λ² − λ² − 4 = 0<br>λ²(λ² + 4) − 1(λ² + 4) = 0<br>(λ² + 4)(λ² − 1) = 0<br>λ² = 1 ⇒ <b>λ = 1</b> ✓<br>
P(X=4) = e^(−λ)λˣ/x! = e⁻¹·1⁴/4! = e⁻¹/24 = <b>0.01533</b>`,
     b: `n = 8;  Probability of getting head = p = ½;  Probability of not getting head = q = ½<br>P(X) = ⁿCₓ pˣ qⁿ⁻ˣ, x = 0,1,…,n<br>
<b>(i) P(X=3):</b> 'X' be the no. of heads, X = 3<br>P(X=3) = ⁸C₃ p³ q⁵ = ⁸C₃ (½)³(½)⁵ = [8!/(3!5!)](½)⁸ = [8×7×6×5!/(3!×5!)](½)⁸ = (8×7/2⁸)… <b>P(X=3) = 7/32 = 0.2185</b><br>
<b>(ii) P(X≤4)</b> = P(X=0) + P(X=1) + P(X=2) + P(X=3) + P(X=4)<br>= ⁸C₀(½)⁰(½)⁸ + ⁸C₁(½)¹(½)⁷ + ⁸C₂(½)²(½)⁶ + ⁸C₃(½)³(½)⁵ + ⁸C₄(½)⁴(½)⁴<br>
= (½)⁸ (⁸C₀ + ⁸C₁ + ⁸C₂ + ⁸C₃ + ⁸C₄)<br>= (1/2⁸)[1 + 8 + 8!/(2!6!) + 8!/(3!5!) + 8!/(4!4!)]<br>= (1/256)[1 + 8 + 8×7/2 + 8×7×6/6 + 8×7×6×5/24]<br>
= (1/256)[1 + 8 + 28 + 56 + 70] = 163/256 = 0.6367<br><b>P(X≤4) = 0.6367</b>` },
6: { full: `Let 'X' denote the no. of defective items. Obviously 'X' can take the values 0, 1, 2, 3 or 4.<br>No. of good items = 7;  No. of defective items = 5<br>
P(X=0) = P(no defective) = ⁷C₄/¹²C₄ = 35/495 = 7/99<br>P(X=1) = P(one defective &amp; 3 good items) = ⁷C₃×⁵C₁/¹²C₄ = 35×5/495 = 35/99<br>
P(X=2) = P(2 defective and 2 good items) = ⁷C₂×⁵C₂/¹²C₄ = 210/495 = 42/99<br>P(X=3) = P(3 defective and 1 good item) = ⁷C₁×⁵C₃/¹²C₄ = 7×10/495 = 14/99<br>
P(X=4) = P(all are defective) = ⁵C₄/¹²C₄ = 5/495 = 1/99<br>Discrete probability distribution is:` +
T([['X=xᵢ','0','1','2','3','4'],['P(X=xᵢ)=f(xᵢ)','7/99','35/99','42/99','14/99','1/99']]) +
`Expected number of defective items = E(X) = Σxᵢ f(xᵢ) = 0·(7/99) + 1·(35/99) + 2·(42/99) + 3·(14/99) + 4·(1/99) = <b>165/99</b>` },
7: { full: `<b>i)</b> We know that ΣP(X) = 1<br>K + 2K + 2K + 3K + K² + 2K² + 7K² + K = 1<br>10K² + 9K − 1 = 0<br>10K² + 10K − K − 1 = 0<br>10K(K+1) − 1(K+1) = 0<br>(K+1)(10K−1) = 0 ⇒ K = 1/10 or −1 ⇒ <b>K = 1/10</b><br>
<b>ii)</b> P(X&lt;6) = Σ_(x=0)^5 P(X=x) = 8K + K² = 8/10 + 1/100 = 81/100 = <b>0.81</b><br>
P(X≥6) = P(X=6) + P(X=7) = 2K² + 7K² + K = 9K² + K = 9/100 + 1/10 = 19/100 = <b>0.19</b><br>
P(0&lt;X&lt;5) = P(X=1) + P(X=2) + P(X=3) + P(X=4) = K + 2K + 2K + 3K = 8K = <b>0.8</b><br>
P(0≤X≤4) = P(X=0) + P(X=1) + P(X=2) + P(X=3) + P(X=4) = 0 + K + 2K + 2K + 3K = 8K = <b>0.8</b><br>
<b>iii)</b> P(X≤K) &gt; ½, min. value of 'K' = ?<br>P(X≤1) = P(X=0) + P(X=1) = K = 1/10 = 0.1<br>P(X≤2) = P(X=0) + P(X=1) + P(X=2) = 3K = 0.3<br>P(X≤3) = P(X≤2) + P(X=3) = 5K = 0.5<br>P(X≤4) = Σ_(x=0)^4 P(X=x) = 8K = 0.8 &gt; 0.5 ⇒ <b>Min. value of K = 4</b><br>
<b>iv) Mean</b> E(X) = ΣX P(X) = K + 4K + 6K + 12K + 5K² + 12K² + 49K² + 7K = 66K² + 30K = 66(1/100) + 30(1/10) ⇒ <b>E(X) = 3.66</b><br>
<b>v) Variance:</b> V(X) = E(X²) − [E(X)]² = ΣX²P(X) − (3.66)²<br>= K + 8K + 18K + 48K + 25K² + 72K² + 343K² + 49K − (3.66)²<br>= 440K² + 124K − 13.3956 = 440/100 + 124/10 − 13.3956<br>= 4.4 + 12.4 − 13.3956 = 16.8 − 13.3956 ⇒ <b>V(X) = 3.4044</b>` },
8: { full: `P(X=x) = e^(−λ) λˣ / x!<br>P(X=1) = P(X=2)<br>e^(−λ)λ¹/1! = e^(−λ)λ²/2!<br>λ = λ²/2 ⇒ <b>λ = 2</b><br>
<b>i)</b> P(X=0) = e⁻²·2⁰/0! = e⁻² = <b>0.1353</b><br>
<b>ii)</b> P(X=3) = e⁻²·2³/3! = e⁻²·8/6 = e⁻²·4/3 = 0.1353×4/3 = 0.5413/3 = <b>0.1804</b><br>
<b>iii)</b> μ = mean = λ = <b>2</b><br>
<b>iv)</b> P(X≥1) = 1 − P(X=0) = 1 − e⁻² = 1 − 0.1353 = <b>0.8647</b>` },
9: { full: `<b>(i)</b> f(x) = d/dx [F(x)]<br>f(x) = 2k(x−1); if 1≤x≤3;  0; otherwise<br>
<b>(ii)</b> Total probability is unity: ∫₁³ f(x) dx = 1<br>2k ∫₁³ (x−1) dx = 1<br>2k [(x−1)²/2]₁³ = 1<br>4k = 1 ⇒ <b>k = 1/4</b><br>
<b>(iii) Mean:</b> μ = ∫₋∞^∞ x f(x) dx = ∫₋∞¹ x f(x) dx + ∫₁³ x f(x) dx + ∫₃^∞ x f(x) dx<br>= 0 + ∫₁³ x·½(x−1) dx + 0 = ½ ∫₁³ (x² − x) dx = ½ [x³/3 − x²/2]₁³<br>
= ½ {[9 − 4.5] − [⅓ − ½]} = ½ [4.5 − (−1/6)] = ½ [27/6 + 1/6] = ½ (28/6) ⇒ <b>μ = 7/3 = 2.33</b><br>
<b>(iv) Variance:</b> E(X²) = ∫₋∞^∞ x² f(x) dx = ∫₋∞¹ x² f(x) dx + ∫₁³ x² f(x) dx + ∫₃^∞ x² f(x) dx<br>= 0 + ∫₁³ x²·½(x−1) dx + 0 = ½ ∫₁³ (x³ − x²) dx = ½ [x⁴/4 − x³/3]₁³<br>
⇒ ½ {[81/4 − 27/3] − [¼ − ⅓]} = ½ [(20.25 − 9) − (−1/12)] = ½ [45/4 + 1/12] = ½ [(135+1)/12] = ½ (136/12) ⇒ E(X²) = 17/3<br>
Variance = E(X²) − [E(X)]² = 17/3 − (7/3)² = 17/3 − 49/9 = (51 − 49)/9 = 2/9 ⇒ <b>Variance = 2/9 = 0.22</b>` },
10: { full: `<b>Mean:</b> E(X) = ∫ x f(x) dx = ∫₀^π x·½ sinx dx = ½ ∫₀^π x sinx dx<br>= ½ [x ∫sinx dx − ∫1(∫sinx dx) dx]₀^π = ½ [−x cosx − ∫−cosx dx]₀^π = ½ [−x cosx + sinx]₀^π<br>
= −½ [π cosπ − 0·cos0] + ½ [sinπ − sin0] = −½ [π(−1)] + ½ (0) ⇒ <b>Mean = π/2</b><br>
<b>Mode:</b> f′(x) = 0, f″(x) &lt; 0. Let us assume that f′(x) = 0:<br>d/dx (½ sinx) = 0 ⇒ ½ cosx = 0 ⇒ cosx = 0 ⇒ cosx = cos(π/2) ⇒ x = π/2 ⇒ <b>∴ Mode = π/2</b><br>
<b>Median:</b> ∫_a^M f(x) dx = ∫_M^b f(x) dx = ½, i.e. ∫₀^M ½ sinx dx = ∫_M^π ½ sinx dx = ½<br>
∫₀^M ½ sinx dx = ½ ⇒ ½[−cosx]₀^M = ½ ⇒ −[cosx]₀^M = 1 ⇒ −[cosM − cos0] = 1 ⇒ −cosM + cos0 = 1 ⇒ −cosM = 0 ⇒ cosM = 0 ⇒ cosM = cos(π/2) ⇒ M = π/2 ⇒ <b>∴ Median = π/2</b><br>
<b>P(0&lt;X&lt;π/2)</b> = ∫₀^(π/2) f(x) dx = ∫₀^(π/2) ½ sinx dx = ½ [−cosx]₀^(π/2) = −½ [cos(π/2) − cos0] = −½ [−1] ⇒ <b>P(0&lt;X&lt;π/2) = ½</b>` },
},

// ============================ UNIT 3 ============================
3: {
1: { full: `Given: μ = 1, σ = 0.6;  z = (X − μ)/σ<br>
<b>(i) X&gt;0,</b> z = (X−μ)/σ = (X−1)/0.6<br>P(X&gt;0) = P[(X−μ)/σ &gt; −μ/σ] = P[(X−1)/0.6 &gt; −1/0.6] = P[(X−1)/0.6 &gt; −1.66] = P(Z &gt; −1.66)<br>
= 0.5 − P(0&lt;Z&lt;1.66) = 0.5 − 0.4515 = <b>0.0485</b> (sheet)<br>` + N(`P(Z&gt;−1.66) = 0.5 + P(0&lt;Z&lt;1.66) = 0.5 + 0.4515 = <b>0.9515</b> (0.0485 is P(X&lt;0)).`) + `<br>
<b>(ii)</b> P(−1.8 ≤ X ≤ 2.0) = P[(−1.8−μ)/σ ≤ (X−μ)/σ ≤ (2.0−μ)/σ] = P[(−1.8−1)/0.6 ≤ (X−1)/0.6 ≤ (2.0−1)/0.6]<br>
= P(−4.66 ≤ Z ≤ 1.66) = P(0 ≤ Z ≤ 4.66) + P(0 ≤ Z ≤ 1.66) = A(4.66) + 0.4515 = 0.5 + 0.4515 = <b>0.9515</b>` },
2: { a: `Population size N = 4, sample size n = 2. Population: 2, 3, 4, 5<br>
<b>(a) With replacement:</b> No. of samples of size 2 = Nⁿ = 4² = 16<br>(2,2) (2,3) (2,4) (2,5) (3,2) (3,3) (3,4) (3,5) (4,2) (4,3) (4,4) (4,5) (5,2) (5,3) (5,4) (5,5)<br>
<b>Variance of samples:</b><br>(2,2) 1st sample → ½[(2−2)² + (2−2)²] = 0<br>(2,3) 2nd sample → ½[(2−2.5)² + (3−2.5)²] = 0.25<br>(2,4) 3rd sample → ½[(2−3)² + (4−3)²] = 1<br>(2,5) 4th sample → ½[(2−3.5)² + (5−3.5)²] = 2.25<br>⋮<br>(5,5) 16th sample → ½[(5−5)² + (5−5)²] = 0<br>
Variance of 16 samples are:` + T([['0','0.25','1','2.25'],['0.25','0','0.25','1'],['1','0.25','0','0.25'],['2.25','1','0.25','0']]) + T([['s²','0','0.25','1','2.25'],['f','4','6','4','2']]) +
`Mean of variance of samples = 1/16 [0 + 0.25 + 1 + 2.25 + 0.25 + 0 + 0.25 + 1 + 1 + 0.25 + 0 + 0.25 + 2.25 + 1 + 0.25 + 0] = 10/16 = <b>0.625</b><br>
Variance of standard deviation of variance: σ² = 1/16 [4(0−0.625)² + 6(0.25−0.625)² + 4(1−0.625)² + 2(2.25−0.625)²]<br>σ² = 0.5156 ⇒ <b>σ = 0.7180 = 0.72 (approx)</b>`,
     b: `<b>(b) Without replacement:</b> No. of samples of size 2 = ᴺCₙ = ⁴C₂ = 6<br>Samples are (2,3) (2,4) (2,5) (3,4) (3,5) (4,5)<br>
<b>Variances of samples:</b><br>1st sample → ½[(2−2.5)² + (3−2.5)²] = 0.25<br>2nd sample → ½[(2−3)² + (4−3)²] = 1<br>3rd sample → ½[(2−3.5)² + (5−3.5)²] = 2.25<br>4th sample → ½[(3−3.5)² + (4−3.5)²] = 0.25<br>5th sample → ½[(3−4)² + (5−4)²] = 1<br>6th sample → ½[(4−4.5)² + (5−4.5)²] = 0.25<br>
Mean of variance of samples = (0.25 + 1 + 2.25 + 0.25 + 1 + 0.25)/6 = 5/6 = <b>0.83</b><br>
Variance of SD of variance = 1/6 [(0.25−0.83)² + (1−0.83)² + (2.25−0.83)² + (0.25−0.83)² + (1−0.83)² + (0.25−0.83)²] = 1/6 (3.0834) = 0.5139<br>
SD = √0.5139 = 0.7169 = <b>0.72</b>` },
3: { a: `<b>Definition:</b> Normal distribution is a continuous probability distribution that has a symmetrical bell-shaped curve.<br>
<b>Properties of Normal Distribution:</b><br>1) It is a continuous probability distribution.<br>2) It is symmetrical about the mean.<br>3) Mean, median &amp; mode are equal.<br>4) The total area under the curve is equal to 1.<br>5) The curve is bell-shaped.<br>6) The curve extends from −∞ to ∞.<br>
7) The two tails approach the horizontal axis but never touch it.<br>8) The distribution is completely determined by its mean and standard deviation.<br>9) Approximately 68.27% of observations lie within one standard deviation of the mean.<br>10) Approximately 95.45% lie within two standard deviations.<br>11) Approximately 99.73% lie within three standard deviations.<br>
<b>Applications of Normal Distribution:</b><br>1) Used in educational test scores.<br>2) Used in quality control.<br>3) Used in measurement errors.<br>4) Used in biological measurements.<br>5) Used in statistical hypothesis testing.<br>6) Used in sampling theory.<br>7) Used in industrial production analysis.`,
     b: `<b>(i)</b> A sampling distribution is the probability distribution of a statistic obtained from all possible samples of a fixed size drawn from a population.<br>
<b>Example:</b> Consider a population: 2, 4, 6. Take samples of size 2 with replacement. Possible samples include: (2,2), (2,4), (2,6), (4,2), (4,4), (4,6), (6,2), (6,4), (6,6). Their sample means are:` +
T([['Sample','(2,2)','(2,4)','(2,6)','(4,2)','(4,4)','(4,6)','(6,2)','(6,4)','(6,6)'],['Mean','2','3','4','3','4','5','4','5','6']]) +
`These sample means form the sampling distribution of the mean.<br>
<b>(ii)</b> Given μ = 30 &amp; σ = 5. Formula: z = (X − μ)/σ<br>Lower limit z₁ = (26 − 30)/5 = −0.8;  Upper limit z₂ = (40 − 30)/5 = 2<br>
⇒ P(26 ≤ X ≤ 40) = P(−0.8 ≤ Z ≤ 2) = P(Z ≤ 2) − P(Z ≤ −0.8) = 0.9772 − 0.2119 ⇒ <b>P = 0.7653</b>` },
4: { full: `P(X&lt;35) = 0.07;  P(X&lt;63) = 0.89 ⇒ P(X≥63) = 1 − 0.89 = 0.11<br>
→ X = 35: z = (X−μ)/σ ⇒ (35−μ)/σ = −z₁. From the figure, P(−z₁ ≤ Z ≤ 0) = 0.43 ⇒ (35−μ)/σ = −1.48 ⇒ 35 = −1.48σ + μ ——(1)<br>
→ X = 63: (63−μ)/σ = z₂. From the figure, P(0 ≤ Z ≤ z₂) = 0.39 ⇒ (63−μ)/σ = 1.23 ⇒ 63 = 1.23σ + μ ——(2)<br>
Sub (1) &amp; (2):  μ − 1.48σ = 35;  μ + 1.23σ = 63 ⇒ 2.71σ = 28<br>S.D. (σ) = 28/2.71 ⇒ σ = 10.332 ≈ <b>10</b><br>
From eqⁿ (1): 35 = −1.48(10) + μ ⇒ 35 = −14.8 + μ ⇒ μ = 49.8<br><b>μ = 50 ⇒ Mean;  σ² = 100 → Variance</b> (σ = 10)` },
5: { full: `<b>(i) The mean of the population:</b> μ = Σxᵢ/N = (4+8+12+16+20+24)/6 = 84/6 = <b>14</b><br>
<b>(ii) Variance:</b> σ² = (1/N) Σ(xᵢ − μ)² = 1/6 [(4−14)² + (8−14)² + (12−14)² + (16−14)² + (20−14)² + (24−14)²] = 1/6 [100+36+4+4+36+100] = 280/6<br>Variance σ² = 46.66;  <b>Standard deviation σ = 6.83</b><br>
<b>(iii)</b> No. of possible samples without replacement = ⁶C₂ = 15 samples.<br>Sample distribution: {(4,8), (4,12), (4,16), (4,20), (4,24), (8,12), (8,16), (8,20), (8,24), (12,16), (12,20), (12,24), (16,20), (16,24), (20,24)}<br>
Sample distribution of means: {6, 8, 10, 12, 14 / 10, 12, 14, 16 / 14, 16, 18 / 18, 20 / 22}<br>
The mean of the sampling distribution of means is μx̄ = 1/15 [6+8+10+12+14+10+12+14+16+14+16+18+18+20+22] = 210/15 = <b>14</b><br>
<b>(iv) Variance of sampling distribution of means:</b> (σx̄)² = (1/N) Σ(xᵢ − x̄)² = 1/15 [(6−14)² + (8−14)² + … + (22−14)²] = 280/15 = 18.66 (variance)<br>
σx̄ = √18.66 = <b>4.31</b>` },
6: { full: `Let 'μ' be the mean, 'σ' be the standard deviation of the normal distribution.<br>P(X&lt;30) = 0.4 &amp; P(X≥60) = 0.15<br>
When X = 30, z = (X−μ)/σ = (30−μ)/σ = −z₁ ——(1)<br>When X = 60, z = (X−μ)/σ = (60−μ)/σ = z₂ ——(2)<br>
∴ P(0&lt;Z&lt;z₂) = 0.5 − 0.15 = 0.35<br>P(0&lt;Z&lt;z₁) = P(−z₁&lt;Z&lt;0) = 0.5 − 0.4 = 0.1<br>
From normal tables, z₁ = 0.25 &amp; z₂ = 1.04<br>(30−μ)/σ = −0.25 or (μ−30)/σ = 0.25 ——(3)<br>(60−μ)/σ = 1.04 ——(4)<br>
eqⁿ (3) + (4): 30/σ = 1.29 ⇒ σ = 30/1.29 = <b>23.26</b><br>μ = 0.25σ + 30 = 0.25(23.26) + 30 = <b>35.81</b><br>Hence, mean = 35.81 &amp; standard deviation = 23.26` },
7: { full: `μ = 14, σ = 2.5<br><b>i)</b> Let the variable X denote the score in a test.<br>When X = 12, z = (X−μ)/σ = (12−14)/2.5 = −0.8 = z₁<br>When X = 15, z = (X−μ)/σ = (15−14)/2.5 = 0.4 = z₂<br>
P(12&lt;X&lt;15) = P(−0.8&lt;Z&lt;0.4) = A(0.4) + A(−0.8) = A(0.4) + A(0.8) = 0.1554 + 0.2881 = 0.4435<br>Hence, no. of students score b/w 12 &amp; 15 = 1000×0.4435 = <b>443 (approximately)</b><br>
<b>ii)</b> When X = 18, z = (X−μ)/σ = (18−14)/2.5 = 1.6<br>P(X&gt;18) = P(Z&gt;1.6) = 0.5 − A(1.6) = 0.5 − 0.4452 ⇒ P(X&gt;18) = 0.0548<br>No. of students score above 18 = 1000×0.0548 = 54.8 = <b>55 (approximately)</b><br>
<b>iii)</b> P(X&lt;18) = P(Z&lt;1.6) = 0.5 + A(1.6) = 0.5 + 0.4452 ⇒ P(X&lt;18) = 0.9452<br>No. of students score below 18 = 1000×0.9452 = <b>945</b>` },
8: { full: `Let 'μ' be the mean &amp; 'σ' be the standard deviation. μ = 68 kgs, σ = 3 kgs; X → denotes masses of students<br>
<b>(i)</b> When X = 72: z = (X−μ)/σ = (72−68)/3 = 1.33<br>P(X&gt;72) = P(Z&gt;1.33) = 0.5 − A(1.33) = 0.5 − 0.4082 ⇒ P(X&gt;72) = 0.0918<br>No. of students with more than 72 kgs = 300×0.0918 = <b>28 (approximately)</b><br>
<b>(ii)</b> When X = 64: z = (X−μ)/σ = (64−68)/3 = −1.33<br>∴ P(X≤64) = P(Z≤−1.33) = 0.5 − A(1.33) = 0.5 − 0.4082 ⇒ P(X≤64) = 0.0918<br>No. of students have masses less than or equal to 64 kg = 300×0.0918 = <b>28 (approximately)</b><br>
<b>(iii)</b> When X = 65, z = (X−μ)/σ = (65−68)/3 = −1 = z₁;  When X = 71, z = (71−68)/3 = 1 = z₂<br>
P(65≤X≤71) = P(−1≤Z≤1) = A(z₂) + A(z₁) = A(1) + A(−1) = A(1) + A(1) = 2·A(1) = 2(0.3413) = 0.6826<br>No. of students = 300×0.6826 = <b>205 (approximately)</b>` },
9: { full: `Here, μ = 35 &amp; σ = 5;  z = (X−μ)/σ = (X−35)/5<br>
<b>(i)</b> X₁ = 25 then z = (25−35)/5 = −10/5 = −2;  When X₂ = 40, then z = (40−35)/5 = 5/5 = 1<br>
∴ Probability of students whose marks lie b/w 25 &amp; 40 = P(25≤X≤40) = P(−2≤Z≤1) = P(−2≤Z≤0) + P(0≤Z≤1) = P(0≤Z≤2) + P(0≤Z≤1) = 0.4772 + 0.3413 = 0.8185<br>
No. of students whose marks lie b/w 25 &amp; 40 = 1000×0.8185 = <b>819 (approx)</b><br>
<b>(ii)</b> When X = 40, then z = (40−35)/5 = 5/5 = 1<br>P(X&gt;40) = P(Z&gt;1) = 0.5 − P(Z≤1) = 0.5 − 0.3413 = 0.1587<br>No. of students whose marks are greater than 40 = 1000×0.1587 = <b>159 students</b><br>
<b>(iii)</b> When X = 20, then z = (20−35)/5 = −15/5 = −3<br>P(X&lt;20) = P(Z&lt;−3) = 0.5 − P(−3≤Z≤0) = 0.5 − P(0≤Z≤3) = 0.5 − 0.499 = 0.001<br>No. of students whose marks are less than 20 = 1000×0.001 = <b>1 student</b><br>
<b>(iv)</b> When X = 50: z = (50−35)/5 = 15/5 = 3<br>P(X&gt;50) = P(Z&gt;3) = 0.5 − P(0≤Z≤3) = 0.5 − 0.499 = 0.001<br>No. of students whose marks are greater than 50 = 1000×0.001 = <b>1 student</b>` },
10: { full: `Given, mean (μ) = 0.78;  S.D. (σ) = 0.11<br>
<b>(i)</b> X = 0.9, z = (X−μ)/σ = (0.9−0.78)/0.11 = 0.12/0.11 = 1.09 = z₁<br>The no. of students with marks more than 90%: P(Z&gt;1.09) = 0.5 − 0.3621 [A(1.09)] = 0.1379<br>No. of students = N×P(X&gt;90) = 0.1379×1000 = 137.9 ≈ <b>138</b><br>
<b>(ii)</b> From figure: 0.4 = 0.5 − 0.1 = 0.5 − Area from 0 to z₁ ∴ z₁ = −1.28<br>Thus, −1.28 = (X−μ)/σ = (X−0.78)/0.11<br>X = 0.78 − 1.28(0.11) = 0.78 − 0.1408 = 0.6392<br>
Hence, the highest mark obtained by the lowest 10% of students = 0.6392×100 = <b>63.92% ≈ 64%</b><br>
<b>(iii)</b> Middle 90% corresponds to 0.9 area, leaving 0.05 area on both sides. Then the corresponding z's are ±1.64.<br>
∴ −1.64 = z₁ = (X₁−μ)/σ = (X₁−0.78)/0.11 ⇒ X₁ = 0.78 − 1.64(0.11) = 0.5996 or 59.96%<br>&amp; 1.64 = z₂ = (X₂−μ)/σ = (X₂−0.78)/0.11 ⇒ X₂ = 1.64(0.11) + 0.78 = 0.9604 or 96.04%<br>
<b>Thus, the middle 90% have marks in b/w 60 to 96.</b>` },
},

// ============================ UNIT 4 ============================
4: {
1: { full: `<b>Solution:</b> Given n = 400, x̄ = 40, μ = 38 and σ = 10<br>1. <b>Null Hypothesis</b> H₀: μ = 38<br>2. <b>Alternative Hypothesis</b> H₁: μ ≠ 38<br>3. <b>Level of significance:</b> α = 0.05<br>
4. <b>The test statistic is</b> Z = (x̄ − μ)/(σ/√n) = (40 − 38)/(10/√400) = <b>4</b><br>i.e., Z = 4 &gt; 1.96<br>∴ <b>We reject the null hypothesis H₀</b>, i.e., the sample is not from the population whose mean is 38.<br>
<b>95% confidence interval</b> is (x̄ − 1.96·σ/√n, x̄ + 1.96·σ/√n)<br>i.e., (40 − 1.96(10)/√400, 40 + 1.96(10)/√400)<br>or (40 − 19.6/20, 40 + 19.6/20) or (40 − 0.98, 40 + 0.98)<br>i.e., <b>(39.02, 40.98)</b>` },
2: { full: `<b>Solution:</b> Given n = 1000<br>p = Sample proportion of rice eaters = 540/1000 = 0.54<br>P = Population proportion of rice eaters = 1/2 = 0.5 ∴ Q = 0.5<br>
<b>Null Hypothesis H₀:</b> Both rice and wheat are equally popular in the state.<br><b>Alternative Hypothesis H₁:</b> P ≠ 0.5 (two-tailed alternative)<br>
<b>Test statistic</b> is z = (p − P)/√(PQ/n) = (0.54 − 0.5)/√(0.5×0.5/1000) = <b>2.532</b><br>
Calculated value of z = 2.532<br>Tabulated value of z at 1% level of significance for two-tailed test = 2.58<br>
Since calculated z &lt; tabulated z, <b>we accept the Null Hypothesis H₀</b> at 1% level of significance and conclude that both rice and wheat are equally popular in the state.` },
3: { full: `<b>Solution:</b> It is given that<br>Maximum error, E = 10 hours<br>σ = 48 hours<br>and z_α/2 = 1.645 (for 90%)<br>
We know that n = (z_α/2 · σ / E)²<br>∴ n = (z_α/2·σ/E)² = (1.645 × 48 / 10)² = 62.3 = 62<br><b>Hence sample size = 62</b>` },
4: { full: `<b>Solution:</b> Let the Null Hypothesis be H₀: The sample can be regarded as a truly random sample.<br>Then the Alternative Hypothesis is H₁: The sample cannot be regarded as a random sample.<br>
Here n = Sample size = 100<br>x̄ = Sample mean = 4.2<br>μ = Population mean = 4<br>σ = S.D. of population = 0.6<br>
Let us assume that H₀ is true. The test statistic is<br>t = (x̄ − μ)/(σ/√n) = (4.2 − 4)/(0.6/10) = 2/0.6 = 10/3 = <b>3.33</b><br>∴ t = 3.33 &gt; 3<br>
Hence <b>we reject the Null Hypothesis</b> and conclude that the given sample cannot be regarded as a truly random sample from the given population.<br>
<b>Note:</b> Since |z| &gt; 3 and level of significance is not given, we may reject H₀ at 5% or 1% level of significance. In the above problem, the Null Hypothesis is rejected without mentioning any level of significance.` },
5: { full: N(`This question is NOT solved in the uploaded Unit-4 answer file; below is the standard two-means (large sample) test.`) + `<br>
Given n₁ = 100, x̄₁ = 210, s₁ = 10;  n₂ = 150, x̄₂ = 220, s₂ = 12;  σ (city) = 11<br>
1. <b>Null Hypothesis</b> H₀: μ₁ = μ₂ (no significant difference between the average incomes)<br>2. <b>Alternative Hypothesis</b> H₁: μ₁ ≠ μ₂ (two-tailed)<br>3. <b>Level of significance:</b> α = 0.05 (z_α = 1.96)<br>
4. <b>Test statistic</b> (σ of population known): z = (x̄₁ − x̄₂) / [σ √(1/n₁ + 1/n₂)]<br>= (210 − 220) / [11 √(1/100 + 1/150)] = −10 / [11 √(0.01 + 0.00667)] = −10 / (11 × 0.1291) = −10/1.420<br>
<b>z = −7.04, |z| = 7.04</b><br>5. <b>Decision:</b> Since |z| = 7.04 &gt; 1.96, <b>we reject H₀</b> at 5% level (also |z| &gt; 3).<br><b>Conclusion:</b> There is a significant difference between the average incomes of the localities.` },
6: { a: `<b>TEST OF SIGNIFICANCE OF A SINGLE MEAN – LARGE SAMPLES</b><br>Let a random sample of size n (n&gt;30) has the sample mean x̄, and population mean μ has a specified value μ₀.<br><b>Working Rule:</b><br>
1. <b>The Null Hypothesis</b> is H₀: x̄ = μ, i.e., "there is no significant difference between the sample mean and population mean" or the sample has been drawn from the parent population.<br>
2. <b>The Alternative Hypothesis</b> is (i) H₁: x̄ ≠ μ (μ ≠ μ₀) or (ii) H₁: x̄ &gt; μ (μ &gt; μ₀) or (iii) H₁: x̄ &lt; μ (μ &lt; μ₀). Since n is large, the sampling distribution of x̄ is approximately normal.<br>
3. <b>Level of Significance.</b> Set the level of significance α.<br>4. <b>The Test Statistic:</b> We have the following two cases.<br>
<b>Case I:</b> When the standard deviation σ of population is known. In this case, standard error of mean, S.E.(x̄) = σ/√n, where n = sample size, σ = s.d. of population. ∴ The test statistic is z = (x̄ − μ)/S.E.(x̄) = (x̄ − μ)/(σ/√n).<br>
<b>Case II:</b> When the standard deviation σ of population is not known. In this case, we take s, the s.d. of sample, to compute the S.E. of mean: S.E.(x̄) = s/√n. Hence the test statistic is z = (x̄ − μ)/S.E.(x̄) = (x̄ − μ)/(s/√n).<br>
5. Find the critical value z_α of z at the level of significance α from the normal table.<br>6. <b>Decision:</b> (a) If |z| &lt; z_α, we accept the Null Hypothesis H₀. (b) If |z| &gt; z_α, we reject the Null Hypothesis H₀.<br>
The rejection rule for H₀: x̄ = μ (or μ = μ₀) is given below (Table: Critical values of z):` +
T([['Level of significance α','1%','5%','10%'],['Critical region for μ≠μ₀','|z|&gt;2.58','|z|&gt;1.96','|z|&gt;1.645'],['Critical region for μ&gt;μ₀','z&gt;2.33','z&gt;1.645','z&gt;1.28'],['Critical region for μ&lt;μ₀','z&lt;−2.33','z&lt;−1.645','z&lt;−1.28']]) +
`<b>Note:</b> 1. We reject Null Hypothesis H₀ when |z| &gt; 3 without mentioning any level of significance.`,
     b: `<b>Solution:</b> Given n = 4, μ = 73.2, x̄ = mean of the sample = 76.7 and σ = S.D. of population = 8.6<br>
1. <b>Null Hypothesis</b> H₀: μ = 73.2<br>2. <b>Alternative Hypothesis</b> H₁: μ &gt; 73.2 (Right-tailed test)<br>3. <b>Level of significance:</b> α = 99% (or probability is 0.01)<br>
4. <b>The test statistic is</b> z = (x̄ − μ)/(σ/√n) = (76.7 − 73.2)/(8.6/√4) = 3.5/4.3 = <b>0.814</b><br>
Tabulated value of z at 99% level of significance is 2.33. Hence calculated z &lt; tabulated z<br>∴ <b>The null hypothesis H₀ is accepted.</b> That is, x̄ and μ do not differ significantly.<br>` +
N(`the sheet uses n = 4 (textbook example). The question bank says n = 45: z = 3.5/(8.6/√45) = 3.5/1.282 = <b>2.73 &gt; 2.33 ⇒ H₀ rejected</b>.`) },
7: { full: `<b>Solution (sheet):</b> Calculations for means and s₁², s₂²` +
T([['x₁','x₁−x̄₁ =x₁−25','(x₁−x̄₁)²','x₂','x₂−x̄₂ =x₂−30','(x₂−x̄₂)²'],['24','−1','1','29','−1','1'],['27','2','4','30','0','0'],['26','1','1','30','0','0'],['23','−2','4','31','1','1'],['25','0','0','24','−6','36'],['','','','36','6','36'],['125=Σx₁','','10','180=Σx₂','','74']]) +
`x̄₁ = Σx₁/n₁ = 125/5 = 25,  x̄₂ = Σx₂/n₂ = 180/6 = 30<br>Hence variance, s₁² = Σ(x₁ − x̄₁)²/(n₁ − 1) = 10/4 = 2.5  and variance, s₂² = Σ(x₂ − x̄₂)²/(n₂ − 1) = 74/5 = 14.8<br>
∴ S.E. of (x̄₁ − x̄₂) = √(s₁²/n₁ + s₂²/n₂) = √(2.5/5 + 14.8/6) = 1.72<br>Hence the 95% confidence limits are (x̄₁ − x̄₂) ± 1.96 (S.E. of x̄₁ − x̄₂), i.e., (25 − 30) ± 1.96(1.72), i.e., −5 ± 3.37 or <b>(−8.37, −1.63)</b><br>` +
N(`sheet uses only 5 values in A and finds confidence limits. F-test with bank data (A has 28 too): x̄₁=25.5, Σ(x₁−x̄₁)²=17.5, s₁²=17.5/5=3.5; s₂²=74/5=14.8; <b>F = s₂²/s₁² = 14.8/3.5 = 4.23</b> &lt; F₀.₀₅(5,5) = 5.05 ⇒ <b>accept H₀</b>: both samples from the same normal population.`) },
8: { full: `<b>Solution:</b> The Null Hypothesis is H₀: μ = 800 hours.<br>The Alternative Hypothesis is H₁: μ ≠ 800 hours.<br>Since H₁ is two-tailed (i.e. two sided), we are to use two-tailed test. Let us assume that H₀ is true.<br>
The test statistic is z = (x̄ − μ)/(σ/√n)<br>Here x̄ = sample mean = 788 hours;  n = sample size = 30;  σ = standard deviation = 40<br>
∴ z = (788 − 800)/(40/√30) = <b>−1.643</b> and |z| = 1.643<br>
(i) Since |z| &lt; 2.81, we accept the Null Hypothesis H₀ at 0.5% level of significance.<br>(ii) Since |z| &lt; 2.58, we accept H₀ at 1% level of significance.<br>(iii) Since |z| &lt; 2.06, we accept H₀ at 4% level of significance.<br>
<b>(iv) Since |z| &lt; 1.96, we accept H₀ at 5% level of significance.</b><br>(v) Since |z| &lt; 1.645, we accept H₀ at 10% level of significance.<br>(vi) Since |z| &gt; 1.44, we reject H₀ at 15% level of significance.` },
9: { full: `<b>Solution:</b> We have x = 100, n = 500, p = x/n = 0.2 and P = 0.04, Q = 1 − P = 0.96<br>
1. <b>Null Hypothesis</b> H₀: P = 0.04<br>2. <b>Alternative Hypothesis</b> H₁: P &gt; 0.04 (Right tailed test)<br>3. <b>Level of significance:</b> α = 0.05<br>
4. <b>The test statistic is</b> z = (p − P)/√(PQ/n) = (0.2 − 0.04)/√((0.04)(0.96)/500) = −0.16/0.00876 = −18.26<br>
Since |z| = 18.26 &gt; 1.645 = z₀.₀₅, <b>we reject the null hypothesis H₀</b>.<br>` + N(`0.2 − 0.04 = +0.16, so z = +18.26 (same decision).`) },
10: { full: `<b>Solution:</b> Given sample sizes, n₁ = 400, n₂ = 600<br>Proportion of men, p₁ = 200/400 = 0.5<br>Proportion of women, p₂ = 325/600 = 0.5416<br>
1. <b>Null Hypothesis H₀:</b> Assume that there is no significant difference between the opinion of men and women as far as proposal of flyover is concerned, i.e., H₀: p₁ = p₂ = p<br>
2. <b>Alternative Hypothesis H₁:</b> p₁ ≠ p₂ (two tailed)<br>3. <b>The test statistic is</b> z = (p₁ − p₂)/√[pq(1/n₁ + 1/n₂)]  [Method of pooling]<br>
where p = (n₁p₁ + n₂p₂)/(n₁ + n₂) = (400 × 200/400 + 600 × 325/600)/(400 + 600) = 525/1000 = 0.525<br>and q = 1 − p = 1 − 0.525 = 0.475<br>
∴ z = (0.5 − 0.5416)/√[0.525 × 0.475 (1/400 + 1/600)] = −0.0416/0.032 = <b>−1.3</b><br>Thus |z| = 1.3<br>
Since |z| &lt; 1.96, <b>we accept the null hypothesis H₀</b> at 5% level of significance, i.e., there is no difference of opinion between men and women as far as proposal of flyover is concerned.` },
},

// ============================ UNIT 5 ============================
5: {
1: { full: `<b>Solution:</b> Calculation of coefficient of correlation` +
T([['x','y','X=x−x̄','Y=y−ȳ','X²','Y²','XY'],['50','11','−9','−3','81','9','27'],['50','13','−9','−1','81','1','9'],['55','14','−4','0','16','0','0'],['60','16','1','2','1','4','2'],['65','16','6','2','36','4','12'],['65','15','6','1','36','1','6'],['65','15','6','1','36','1','6'],['60','14','1','0','1','0','0'],['60','13','1','−1','1','1','−1'],['60','13','1','−1','1','1','−1'],['590','140','0','0','290','22','60']]) +
`x̄ = 590/10 = 59,  ȳ = 140/10 = 14<br>Correlation coefficient = r = [ΣXY − ΣXΣY/N] / {√[ΣX² − (ΣX)²/N] √[ΣY² − (ΣY)²/N]}<br>= (60 − 0)/(√(290 − 0) √(22 − 0)) = 60/79.87 = <b>0.7512</b>` },
2: { full: `<b>Solution:</b> Computation of Karl Pearson's coefficient of correlation` +
T([['Wages (x)','X=x−x̄ (x̄=99)','X²','Cost of living (y)','Y=y−ȳ (ȳ=95)','Y²','XY'],['100','+1','1','98','+3','9','+3'],['101','+2','4','99','+4','16','+8'],['102','+3','9','99','+4','16','+12'],['102','+3','9','97','+2','4','+6'],['100','+1','1','95','0','0','0'],['99','0','0','92','−3','9','0'],['97','−2','4','95','0','0','0'],['98','−1','1','94','−1','1','+1'],['96','−3','9','90','−5','25','+15'],['95','−4','16','91','−4','16','+16'],['Σx=990','ΣX=0','ΣX²=54','Σy=950','ΣY=0','ΣY²=96','ΣXY=61']]) +
`r = ΣXY / √(ΣX² × ΣY²) = 61/√(54 × 96) = 61/√5184 = 61/72 = 0.847<br><b>∴ r = +0.847</b>` },
3: { a: `<b>Solution:</b> Given n = 10;  σx = 5.4;  σy = 6.2<br>We have σx² = (1/n)Σ(x − x̄)² ⇒ (5.4)²·10 = Σ(x − x̄)² ……(1)<br>Also we have σy² = (1/n)Σ(y − ȳ)² ⇒ (6.2)²·10 = Σ(y − ȳ)² ……(2)<br>
Also given Σ(x − x̄)(y − ȳ) = 66 ……(3)<br>r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² Σ(y − ȳ)²] = 66/[(10)(5.4)(6.2)] = 66/334.8 = <b>0.1971</b>`,
     b: `<b>RANK CORRELATION COEFFICIENT:</b> A British Psychologist Charles Edward Spearman found out the method of finding the coefficient of correlation by ranks. This method is based on rank and is useful in dealing with qualitative characteristics such as morality, character, intelligence and beauty. It can not be measured quantitatively as in the case of Pearson's coefficient of correlation. It is based on the ranks given to the observations. Rank correlation is applicable only to the individual observations. The formula for Spearman's rank correlation is given by<br>
<b>ρ = 1 − 6ΣD² / [N(N² − 1)]</b><br>where ρ → Rank coefficient of correlation;  D² → Sum of the squares of the differences of two ranks;  N → Number of paired observations<br>
<b>PROPERTIES OF RANK CORRELATION COEFFICIENT</b><br>1. The value of ρ lies between +1 and −1.<br>2. If ρ = 1, there is complete agreement in the order of the ranks and the direction of the rank is same.<br>3. If ρ = −1 then there is complete disagreement in the order of the ranks and they are in opposite directions.` },
4: { full: `<b>Solution (sheet):</b> First we have to assign ranks to the variables.` +
T([['X','Rank(x)','Y','Rank(y)','D=x−y','D²'],['48','8','13','5.5','2.5','6.25'],['33','6','13','5.5','0.5','0.25'],['40','7','24','10','−3','9.00'],['9','1','6','2.5','−1.5','2.25'],['16','3','15','7','−4','16.00'],['16','3','4','1','2','4.00'],['65','10','20','9','1','1.00'],['24','5','9','4','1','1.00'],['16','3','6','2.5','0.5','0.25'],['57','9','19','8','1','1.00'],['','','','','','ΣD²=41']]) +
`16 is repeated 3 times in X items, hence m = 3. Since 13 and 6 are repeated twice in Y items, hence m = 2.<br>
∴ ρ = 1 − 6[ΣD² + (1/12)(m³−m) + (1/12)(m³−m) + (1/12)(m³−m)] / (N³ − N)<br>= 1 − 6[41 + (1/12)(3³−3) + (1/12)(2³−2) + (1/12)(2³−2)] / 990 = <b>+0.733</b><br>` +
N(`sheet's last Y = 19; in the question bank last Y = 13 (13 repeated thrice): ranks of Y become 6,6,10,2.5,8,1,9,4,2.5,6; ΣD² = 55.5; ρ = 1 − 6[55.5 + 2 + 0.5 + 2]/990 = <b>0.636</b>.`) },
5: { full: `<b>Solution:</b> Calculation of regression coefficients` +
T([['X','Y','x=X−X̄','x²','y=Y−Ȳ','y²','xy'],['1','15','−2','4','−20','400','40'],['2','25','−1','1','−10','100','10'],['3','35','0','0','0','0','0'],['4','45','1','1','10','100','10'],['5','55','2','4','20','400','40'],['15','175','','10','','1000','100']]) +
`X̄ = (1+2+3+4+5)/5 = 15/5 = 3;  Ȳ = 175/5 = 35<br>Now b_yx = Σxy/Σx² = 100/10 = 10<br>
∴ Regression equation of y on x is given by y − ȳ = b_yx(x − x̄) ⇒ y − 35 = 10(x − 3) ⇒ <b>y = 10x + 5</b><br>
b_xy = Σxy/Σy² = 100/1000 = 1/10<br>Regression equation of x on y is given by x − x̄ = b_xy(y − ȳ) ⇒ x − 3 = (1/10)(y − 35) ⇒ <b>x = 0.1y − 0.5</b>` },
6: { full: `<b>Solution:</b> Calculation of Regression Equation` +
T([['x','(x−13)=X','X²','y','(y−41)=Y','Y²','XY'],['10','−3','9','40','−1','1','3'],['12','−1','1','38','−3','9','3'],['13','0','0','43','2','4','0'],['12','−1','1','45','4','16','−4'],['16','3','9','37','−4','16','−12'],['15','2','4','43','2','4','4'],['ΣX=78','','ΣX²=24','Σy=246','','ΣY²=50','ΣXY=−6']]) +
`Regression equation of Y on X is Y − Ȳ = r(σy/σx)(X − X̄) ……(1)<br>Now r·σy/σx = ΣXY/ΣX² = −6/24 = −0.25<br>
(1) ⇒ Y − 41 = −0.25(X − 13) ⇒ <b>Y = −0.25X + 44.25</b><br>When X is 20; Y = 39.25. When the price is Rs. 20, the likely demand is 39.25.` },
7: { a: `<b>Solution: (a)</b> Given X = 2Y + 3 is the regression line of X on Y.<br>∴ r·σx/σy = 2<br>The regression line of Y on X is Y = kX + 6<br>∴ r·σy/σx = k<br>
Multiplying these two equations, we get r² = 2k<br>We have 0 ≤ r² ≤ 1 ⇒ 0 ≤ 2k ≤ 1 ⇒ <b>0 ≤ k ≤ 1/2</b>`,
     b: `<b>(b)</b> If k = 1/8 then y = (1/8)x + 6<br>r² = 2k = 2/8 = 1/4 ⇒ r = ½<br>Since both regression coefficients are positive, we take positive values for r: <b>∴ r = 1/2</b><br>
Since the regression lines pass through (x̄, ȳ) we have x̄ = 2ȳ + 3 ……(1) and ȳ = (1/8)x̄ + 6 ……(2)<br>
From (2), ȳ = (1/8)(2ȳ + 3) + 6, using (1) = (2ȳ + 3 + 48)/8<br>⇒ 8ȳ = 2ȳ + 51 ⇒ 6ȳ = 51<br>⇒ ȳ = 51/6 and x̄ = 2ȳ + 3 = 102/6 + 3 = 120/6 = 20<br><b>(x̄, ȳ) = (20, 8.5)</b>` },
8: { full: `<b>Solution:</b> Given equations are 7x − 16y + 9 = 0 ……(1);  5y − 4x − 3 = 0 ……(2)<br>
(1)×4 gives 28x − 64y + 36 = 0<br>(2)×7 gives −28x + 35y − 21 = 0<br>Adding, −29y + 15 = 0 ⇒ y = 15/29 = 0.5172<br>
(1) ⇒ 7x = 16y − 9 = 240/29 − 9 = (240 − 261)/29 = −21/29 ∴ x = −3/29 = −0.1034<br>
Since the regression line passes through (x̄, ȳ), we have <b>∴ x̄ = mean = −0.1034;  ȳ = mean = 0.5172</b><br>
From (1), x = (16/7)y − 9/7;  From (2), y = (4/5)x + 3/5<br>∴ r·σx/σy = 16/7 and r·σy/σx = 4/5<br>Multiplying these two equations, we get r² = (16/7)·(4/5) = 64/35 ⇒ r = 8/√35 (sheet)<br>` +
N(`r² = 64/35 &gt; 1 is impossible. Take (1) as y on x: b_yx = 7/16; (2) as x on y: x = (5/4)y − 3/4, b_xy = 5/4 ⇒ r² = (7/16)(5/4) = 35/64 ⇒ <b>r = √35/8 = 0.7395</b>.`) },
9: { full: `Let the straight line eqⁿ be y = a + bx.<br>The normal eqⁿs are Σyᵢ = na + bΣxᵢ ——(1);  Σxᵢyᵢ = aΣxᵢ + bΣxᵢ² ——(2);  n = 9` +
T([['xᵢ','yᵢ','xᵢyᵢ','xᵢ²'],['6','5','30','36'],['7','5','35','49'],['7','4','28','49'],['8','5','40','64'],['8','4','32','64'],['8','3','24','64'],['9','4','36','81'],['9','3','27','81'],['10','3','30','100'],['72','36','282','588']]) +
`36 = 9a + 72b ——(3)<br>282 = 72a + 588b ——(4)<br>(9a + 72b = 36)×8 ⇒ 72a + 576b = 288<br>72a + 588b = 282<br>Subtracting: −12b = 6 ⇒ <b>b = −½</b><br>
36 = 9a + 72(−½) ⇒ 36 = 9a + (−36) ⇒ 36 + 36 = 9a ⇒ 9a = 72 ⇒ <b>a = 8</b><br><b>∴ y = 8 − 0.5x</b>` },
10: { full: `<b>Second degree parabola:</b> Let the second degree parabola be y = a + bx + cx². The normal equations can be written as<br>
Σyᵢ = na + bΣxᵢ + cΣxᵢ²;  Σxᵢyᵢ = aΣxᵢ + bΣxᵢ² + cΣxᵢ³;  Σxᵢ²yᵢ = aΣxᵢ² + bΣxᵢ³ + cΣxᵢ⁴` +
T([['xᵢ','yᵢ','xᵢ²','xᵢ³','xᵢ⁴','xᵢyᵢ','xᵢ²yᵢ'],['10','14','100','1000','10000','140','1400'],['12','17','144','1728','20736','204','2448'],['15','23','225','3375','50625','345','5175'],['23','25','529','12167','279841','575','13225'],['20','21','400','8000','160000','420','8400'],['80','100','1398','26270','521202','1684','30648']]) +
`n = 5:  100 = 5a + b(80) + 1398c ——(1);  1684 = a(80) + 1398b + 26270c ——(2);  30648 = a(1398) + b(26270) + 521202c ——(3)<br>
eqⁿ(1)×16 ⇒ 1600 = 80a + 1280b + 22368c;  eqⁿ(2) ⇒ 1684 = 80a + 1398b + 26270c<br>−84 = −118b + (−3902)c ⇒ <b>84 = 118b + 3902c</b> ——(4)<br>
eqⁿ(3)×80 ⇒ 2451840 = 111840a + 2101600b + 41696160c;  eqⁿ(2)×1398 ⇒ 2354232 = 111840a + 1954404b + 36725460c<br><b>97608 = 147196b + 4970700c</b> ——(5)<br>
eqⁿ(4)×147196 ⇒ 12364464 = 17369128b + 574358792c;  118×eqⁿ(5) ⇒ 11517744 = 17369128b + 586542600c<br>846720 = −12183808c ⇒ c = −846720/12183808 ⇒ <b>c = −0.069495</b><br>
84 = 118b + 3902(−0.069495) ⇒ 118b = 84 + 271.16949 ⇒ b = 355.16949/118 ⇒ <b>b = 3.009910</b><br>
100 = 5a + 80(3.009910) + 1398(−0.069495) ⇒ 100 = 5a + 240.7928 − 97.15401 ⇒ 5a = 100 − 143.63879 ⇒ a = −43.63879/5 ⇒ <b>a = −8.727758</b><br>
<b>a = −8.727758, b = 3.009910, c = −0.069495 ⇒ y = −8.7278 + 3.0099x − 0.0695x²</b>` },
},
};
module.exports = A;
