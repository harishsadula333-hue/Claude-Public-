// DBMS (SR25) – 10-mark long answers, Units I–V, Part-B Q1–Q5. <br> = new step (bold star).
const T = (rows) => '<table>' + rows.map((r, i) => '<tr>' + r.map(c => `<td>${i === 0 ? '<b>' + c + '</b>' : c}</td>`).join('') + '</tr>').join('') + '</table>';
let mk = 0;
function SVG(w, h, body) { const id = 'db' + (++mk); return `<svg class="jdw" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="${id}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#000"/></marker></defs>${body.replace(/MARK/g, id)}</svg>`; }
const B = (x, y, w, h, t, bold) => { const ls = t.split('|'); return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#000" stroke-width="1.1"/>` + ls.map((l, i) => `<text x="${x + w / 2}" y="${y + h / 2 + (i - (ls.length - 1) / 2) * 9 + 3}" font-size="8" text-anchor="middle"${bold ? ' font-weight="bold"' : ''}>${l}</text>`).join(''); };
const A = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="1" marker-end="url(#MARK)"/>`;
const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="1"/>`;
const Lb = (x, y, t, s = 7) => `<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle">${t}</text>`;
const E = (cx, cy, rx, ry, t, u) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="#000" stroke-width="1"/><text x="${cx}" y="${cy + 2.5}" font-size="7" text-anchor="middle"${u ? ' text-decoration="underline"' : ''}>${t}</text>`;
const Dm = (cx, cy, w, h, t) => `<polygon points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}" fill="#fff" stroke="#000" stroke-width="1.1"/><text x="${cx}" y="${cy + 2.5}" font-size="7" text-anchor="middle">${t}</text>`;

const D = {
  structure: SVG(220, 150,
    B(5, 2, 50, 14, 'Naive users') + B(58, 2, 50, 14, 'App programmers') + B(111, 2, 50, 14, 'Sophisticated') + B(164, 2, 51, 14, 'DBA') +
    A(30, 16, 30, 26) + A(83, 16, 83, 26) + A(136, 16, 136, 26) + A(189, 16, 189, 26) +
    B(5, 26, 210, 13, 'Application interfaces · App programs · Query tools · Admin tools') +
    B(5, 46, 210, 36, '', 0) + Lb(110, 54, 'QUERY PROCESSOR', 7.5) +
    B(12, 58, 60, 18, 'DDL interpreter') + B(80, 58, 60, 18, 'DML compiler|& optimizer') + B(148, 58, 60, 18, 'Query evaluation|engine') +
    A(110, 82, 110, 90) +
    B(5, 90, 210, 32, '', 0) + Lb(110, 98, 'STORAGE MANAGER', 7.5) +
    B(10, 102, 48, 16, 'Authorization|& integrity') + B(61, 102, 48, 16, 'Transaction|manager') + B(112, 102, 48, 16, 'File|manager') + B(163, 102, 48, 16, 'Buffer|manager') +
    A(110, 122, 110, 130) + B(5, 130, 210, 17, 'DISK: Data files · Data dictionary · Indices · Statistical data', 1)),
  erComp: SVG(220, 70,
    B(20, 28, 46, 16, 'STUDENT', 1) + Dm(110, 36, 50, 24, 'Enrolls') + B(154, 28, 46, 16, 'COURSE', 1) +
    L(66, 36, 85, 36) + L(135, 36, 154, 36) + Lb(75, 33, '1/M') + Lb(145, 33, 'N') +
    E(20, 9, 17, 7, 'Roll_no', 1) + E(62, 9, 16, 7, 'Name') + E(43, 62, 18, 7, 'Phone') + L(30, 15, 35, 28) + L(56, 16, 50, 28) + L(43, 55, 43, 44) +
    `<ellipse cx="43" cy="62" rx="20" ry="9" fill="none" stroke="#000" stroke-width="0.8"/>` +
    E(158, 9, 16, 7, 'C_id', 1) + E(200, 9, 16, 7, 'Title') + L(165, 15, 170, 28) + L(195, 16, 188, 28) + E(110, 62, 15, 7, 'Grade') + L(110, 55, 110, 48) +
    Lb(85, 66, '(multivalued)', 6)),
  levels: SVG(220, 92,
    B(5, 2, 62, 14, 'View 1') + B(79, 2, 62, 14, 'View 2') + B(153, 2, 62, 14, 'View n') + Lb(42, 30, 'EXTERNAL LEVEL', 6.5) +
    A(36, 16, 90, 34) + A(110, 16, 110, 34) + A(184, 16, 130, 34) + Lb(198, 30, 'logical DI', 6.5) +
    B(30, 34, 160, 16, 'CONCEPTUAL LEVEL (logical schema)', 1) + A(110, 50, 110, 62) + Lb(150, 59, 'physical DI', 6.5) +
    B(30, 62, 160, 16, 'INTERNAL LEVEL (physical schema)', 1) + A(110, 78, 110, 84) + Lb(110, 90, 'Stored database (disk)', 7)),
  relation: SVG(220, 64,
    Lb(110, 8, 'Relation STUDENT (schema: Sid, Name, Dept)', 7.5) +
    B(30, 12, 50, 12, 'Sid', 1) + B(80, 12, 60, 12, 'Name', 1) + B(140, 12, 50, 12, 'Dept', 1) +
    B(30, 24, 50, 11, '101') + B(80, 24, 60, 11, 'Ravi') + B(140, 24, 50, 11, 'CSE') +
    B(30, 35, 50, 11, '102') + B(80, 35, 60, 11, 'Sita') + B(140, 35, 50, 11, 'ECE') +
    A(205, 30, 192, 30) + Lb(210, 26, 'tuple', 6.5) + Lb(110, 56, '← attributes (columns = degree 3), rows = tuples (cardinality 2) →', 6.5)),
  normal: SVG(220, 26, B(2, 5, 34, 16, 'UNF') + A(36, 13, 42, 13) + B(42, 5, 34, 16, '1NF|atomic') + A(76, 13, 82, 13) + B(82, 5, 34, 16, '2NF|no partial') + A(116, 13, 122, 13) + B(122, 5, 34, 16, '3NF|no transitive') + A(156, 13, 162, 13) + B(162, 5, 26, 16, 'BCNF') + A(188, 13, 192, 13) + B(192, 5, 26, 16, '4NF/5NF')),
  states: SVG(220, 60,
    B(4, 22, 34, 16, 'Active') + A(38, 26, 58, 12) + A(38, 34, 58, 48) + B(58, 4, 56, 16, 'Partially|committed') + B(58, 40, 56, 16, 'Failed') +
    A(114, 12, 140, 12) + A(86, 20, 86, 40) + A(114, 48, 140, 48) + B(140, 4, 52, 16, 'Committed') + B(140, 40, 52, 16, 'Aborted')),
  precedence: SVG(220, 40, `<circle cx="60" cy="20" r="11" fill="#fff" stroke="#000" stroke-width="1.1"/>` + Lb(60, 23, 'T1', 8) + `<circle cx="160" cy="20" r="11" fill="#fff" stroke="#000" stroke-width="1.1"/>` + Lb(160, 23, 'T2', 8) +
    `<path d="M71,16 Q110,2 149,16" fill="none" stroke="#000" stroke-width="1" marker-end="url(#MARK)"/>` + Lb(110, 8, 'R1(A) before W2(A)', 6.5) + Lb(110, 36, 'no cycle ⇒ conflict serializable (T1 → T2)', 6.5)),
  granular: SVG(220, 78,
    B(85, 2, 50, 13, 'Database', 1) + L(110, 15, 50, 24) + L(110, 15, 170, 24) +
    B(25, 24, 50, 13, 'Area A1') + B(145, 24, 50, 13, 'Area A2') + L(50, 37, 25, 46) + L(50, 37, 75, 46) + L(170, 37, 170, 46) +
    B(5, 46, 40, 13, 'File Fa') + B(55, 46, 40, 13, 'File Fb') + B(150, 46, 40, 13, 'File Fc') +
    L(25, 59, 12, 66) + L(25, 59, 38, 66) + L(170, 59, 170, 66) + B(2, 66, 20, 11, 'r1') + B(28, 66, 20, 11, 'r2') + B(160, 66, 20, 11, 'rn') + Lb(105, 72, 'records (finest granule)', 6.5)),
  bplus: SVG(220, 70,
    Lb(110, 8, 'Insert 5,10,15,20,25 (order 3: max 2 keys/node)', 7) +
    B(95, 12, 30, 12, '15', 1) + L(105, 24, 60, 30) + L(115, 24, 160, 30) +
    B(45, 30, 30, 12, '10') + B(145, 30, 30, 12, '20') + L(52, 42, 30, 48) + L(68, 42, 85, 48) + L(152, 42, 135, 48) + L(168, 42, 185, 48) +
    B(15, 48, 30, 12, '5') + B(70, 48, 30, 12, '10') + B(120, 48, 30, 12, '15') + B(165, 48, 40, 12, '20 · 25') +
    A(45, 54, 70, 54) + A(100, 54, 120, 54) + A(150, 54, 165, 54) + Lb(110, 68, 'leaf split copies key up; internal split moves key up', 6.5)),
  isam: SVG(220, 74,
    B(70, 2, 80, 14, 'Index (root) block', 1) + L(90, 16, 40, 26) + L(130, 16, 180, 26) +
    B(5, 26, 70, 14, 'Index blocks') + B(145, 26, 70, 14, 'Index blocks') + L(40, 40, 40, 48) + L(180, 40, 180, 48) +
    B(5, 48, 210, 14, 'Primary (sorted) data pages – static, created at load time', 1) +
    A(40, 62, 40, 68) + A(180, 62, 180, 68) + Lb(110, 72, 'overflow pages (chained) for later inserts', 6.5)),
  disk: SVG(220, 40, B(2, 12, 40, 16, 'CPU / DBMS') + A(42, 20, 56, 20) + B(56, 12, 46, 16, 'Buffer pool|(RAM)') + A(102, 20, 116, 20) + B(116, 12, 50, 16, 'Disk space|manager') + A(166, 20, 178, 20) + B(178, 12, 40, 16, 'Disk|pages') + Lb(110, 38, 'pages fetched / written as blocks (I/O unit)', 6.5)),
};

const Q = {
1: {
1: 'Define a database. Explain various applications of DBMS in detail.',
2: 'Compare file systems and DBMS with advantages and disadvantages.',
3: 'Describe the structure of a DBMS with a neat diagram.',
4: 'What is an ER diagram? Explain its components in detail.',
5: 'What is data independence? Explain its types with examples.',
},
2: {
1: 'Define a view. Explain how to create, modify and delete a view with SQL syntax and examples.',
2: 'What are the different types of integrity constraints? Explain with examples.',
3: 'Explain the relational model in detail with its concepts.',
4: 'Explain Tuple Relational Calculus (TRC) and Domain Relational Calculus (DRC) with examples.',
5: 'Explain relational algebra operations with suitable examples.',
},
3: {
1: 'Explain different types of SQL queries with syntax and examples.',
2: 'Explain nested queries in SQL. Write examples of correlated and non-correlated queries.',
3: 'What is normalization? Discuss different normal forms with suitable examples.',
4: 'Explain triggers in SQL. Write a trigger for an INSERT or UPDATE operation.',
5: 'Describe aggregate functions in SQL. Discuss different types of constraints in SQL with examples.',
},
4: {
1: 'Explain the concept of a transaction in DBMS. Discuss ACID properties in detail.',
2: 'What is serializability? Explain conflict and view serializability.',
3: 'Explain the implementation of isolation using a lock-based protocol in DBMS. Discuss shared locks, exclusive locks and the lock compatibility matrix.',
4: 'Explain the multiple-granularity locking protocol.',
5: 'Describe the implementation of atomicity and durability in DBMS.',
},
5: {
1: 'Explain different types of file organization in DBMS with their advantages and disadvantages.',
2: 'Explain insertion in a B+ tree with an example.',
3: 'Explain indexing in DBMS and its types with examples.',
4: 'Explain Indexed Sequential Access Method (ISAM) with its structure.',
5: 'Explain how data is stored on external storage devices in DBMS.',
},
};

const ANS = {
1: {
1: `<b>Database:</b> an organised, logically related collection of persistent data that describes an enterprise, stored with minimum redundancy and shared by many users and applications. <b>DBMS</b> = database + set of programs to define, create, query, update and control access to it (e.g. Oracle, MySQL, SQL Server, PostgreSQL).
<br><b>Features:</b> self-describing (catalog/metadata), data abstraction, multiple views, concurrent sharing, integrity, security, backup & recovery.
<br><b>Applications:</b> <b>1. Banking</b> – customer accounts, deposits, loans, ATM/online transactions with ACID guarantees. <b>2. Airlines/Railways</b> – reservations, schedules, seat availability (first users of distributed DBs). <b>3. Universities</b> – student info, registration, attendance, grades, fees. <b>4. Sales/E-commerce</b> – customers, products, orders, payments, recommendations. <b>5. Manufacturing</b> – production, inventory, supply chain, orders. <b>6. HR</b> – employees, salaries, payroll, tax deduction. <b>7. Telecom</b> – call records, monthly bills, prepaid balances. <b>8. Finance/Stock market</b> – share prices, trades, credit-card transactions. <b>9. Healthcare</b> – patient records, prescriptions, billing. <b>10. Government & social media</b> – Aadhaar, tax, census; posts, friends, likes.
<br><b>Conclusion:</b> DBMS is used wherever large volumes of shared data must be stored reliably and retrieved quickly.`,
2: `<b>File system:</b> data kept in separate OS files, each accessed by its own application program. <b>DBMS:</b> data integrated in one database managed centrally by DBMS software.
<br>${T([['Basis', 'File system', 'DBMS'], ['Redundancy', 'High (duplicate files)', 'Controlled'], ['Consistency', 'Inconsistency likely', 'Maintained'], ['Access', 'New program per query', 'SQL queries'], ['Isolation', 'Scattered formats', 'Integrated'], ['Integrity', 'Coded in programs', 'Constraints'], ['Atomicity', 'Not ensured', 'Transactions'], ['Concurrency', 'Anomalies', 'Locking'], ['Security', 'File level only', 'User/role level'], ['Recovery', 'Manual backup', 'Automatic logs']])}
<br><b>Advantages of DBMS:</b> reduced redundancy, consistency, data sharing, standards, security, integrity, backup & recovery, data independence, fast query processing.
<br><b>Disadvantages of DBMS:</b> high cost of software/hardware, complexity, needs trained DBA, larger size, performance overhead for small apps, single point of failure.
<br><b>Advantages of file system:</b> simple, cheap, fast for small single-user apps. <b>Disadvantages:</b> redundancy, inconsistency, difficult access, integrity & atomicity problems, poor concurrency and security.`,
3: `DBMS is divided into modules; the two main components are the <b>query processor</b> and the <b>storage manager</b>.
<br>{{structure}}
<br><b>1. Users:</b> naive users (forms), application programmers, sophisticated users (query tools), DBA (schema, access, tuning).
<br><b>2. Query processor:</b> <b>DDL interpreter</b> – processes DDL and records definitions in the data dictionary. <b>DML compiler</b> – translates DML into an evaluation plan of low-level instructions; <b>query optimizer</b> picks the lowest-cost plan. <b>Query evaluation engine</b> – executes the plan.
<br><b>3. Storage manager:</b> interface between stored data and queries. <b>Authorization & integrity manager</b> – checks constraints and user rights. <b>Transaction manager</b> – consistency, concurrency control, recovery. <b>File manager</b> – space allocation on disk. <b>Buffer manager</b> – fetches pages into memory.
<br><b>4. Disk storage:</b> data files, data dictionary (metadata), indices for fast access, statistical data for optimizer.
<br><b>Working:</b> query → parse & translate → optimize → evaluate → storage manager reads blocks → result.`,
4: `<b>ER diagram:</b> graphical representation of the Entity–Relationship model (P. Chen, 1976) showing entities, attributes and relationships; used for conceptual design before tables are made.
<br>{{erComp}}
<br><b>1. Entity</b> – real-world object (STUDENT); rectangle. <b>Entity set</b> – collection of similar entities. <b>Weak entity</b> – no own key, depends on owner (DEPENDENT of EMPLOYEE); double rectangle, identifying relationship = double diamond, partial key dashed underline.
<br><b>2. Attributes</b> (ellipse): <b>key</b> – underlined (Roll_no); <b>simple/composite</b> (Name → First, Last); <b>single/multivalued</b> – double ellipse (Phone); <b>derived</b> – dashed ellipse (Age from DOB); <b>stored</b>.
<br><b>3. Relationship</b> – association among entities; diamond (Enrolls). <b>Degree:</b> unary, binary, ternary.
<br><b>4. Mapping cardinality:</b> 1:1, 1:N, M:1, M:N.
<br><b>5. Participation:</b> total (double line – every entity participates) or partial (single line).
<br><b>6. Lines</b> link attributes to entities and entities to relationships.
<br><b>Uses:</b> clear communication with users, easy conversion to relational tables.`,
5: `<b>Data independence:</b> the capacity to change the schema at one level of the database without changing the schema at the next higher level. Achieved by the <b>three-schema architecture</b> and mappings between levels.
<br>{{levels}}
<br><b>1. Logical data independence:</b> change the conceptual schema without changing external schemas or application programs. <i>Examples:</i> adding a column Email to STUDENT, adding a new table, splitting EMP into EMP_PERSONAL + EMP_PAY – old views still work through the external/conceptual mapping. Harder to achieve because programs depend heavily on logical structure.
<br><b>2. Physical data independence:</b> change the internal schema without changing the conceptual schema. <i>Examples:</i> creating a B+ tree index on Roll_no, moving files to a new disk/SSD, changing heap file to hashed file, compression, changing block size – queries are unchanged; only conceptual/internal mapping changes. Easier to achieve.
<br>${T([['Logical DI', 'Physical DI'], ['Conceptual level change', 'Internal level change'], ['Protects views/apps', 'Protects logical schema'], ['Difficult', 'Easy']])}
<br><b>Benefits:</b> lower maintenance cost, flexibility, easy tuning and growth.`,
},
2: {
1: `<b>View:</b> a virtual table defined by a stored query over one or more base tables; it stores no data itself – rows are computed when the view is used.
<br><b>Create:</b> <code>CREATE VIEW view_name AS SELECT cols FROM table WHERE cond;</code> <i>Ex:</i> <code>CREATE VIEW cse_stu AS SELECT sid, name FROM student WHERE dept='CSE';</code> Query it like a table: <code>SELECT * FROM cse_stu;</code>
<br><b>Modify:</b> <code>CREATE OR REPLACE VIEW cse_stu AS SELECT sid, name, cgpa FROM student WHERE dept='CSE';</code> (some DBMS: <code>ALTER VIEW</code>).
<br><b>Update through view:</b> <code>UPDATE cse_stu SET name='Ravi' WHERE sid=101;</code> – allowed only for simple views (one table, no GROUP BY, DISTINCT, aggregates, joins). <code>WITH CHECK OPTION</code> stops updates that would make rows leave the view.
<br><b>Delete:</b> <code>DROP VIEW cse_stu;</code> – removes definition; base table data stays.
<br><b>Join view:</b> <code>CREATE VIEW emp_dept AS SELECT e.name, d.dname FROM emp e JOIN dept d ON e.did=d.did;</code>
<br><b>Advantages:</b> security (hide columns like salary), simplicity (hide complex joins), logical data independence, customised data for different users, consistent results. <b>Materialized view</b> stores the result physically for speed.`,
2: `<b>Integrity constraints:</b> rules on data that keep the database correct and consistent; checked by DBMS on every insert/update/delete.
<br><b>1. Domain constraint:</b> each value must be atomic and from the attribute's domain/data type. <code>age INT CHECK (age BETWEEN 17 AND 30)</code>.
<br><b>2. Key / entity integrity:</b> primary key must be unique and NOT NULL. <code>sid INT PRIMARY KEY</code> – two students cannot share sid 101, sid cannot be NULL.
<br><b>3. Referential integrity:</b> foreign key value must match an existing primary-key value in the referenced table or be NULL. <code>did INT REFERENCES dept(did) ON DELETE CASCADE</code>. Violations: inserting emp with did 9 when dept 9 is absent; deleting a referenced dept. Actions: RESTRICT, CASCADE, SET NULL, SET DEFAULT.
<br><b>4. NOT NULL:</b> <code>name VARCHAR(20) NOT NULL</code>. <b>5. UNIQUE:</b> <code>email UNIQUE</code> (allows one NULL). <b>6. CHECK:</b> <code>CHECK (salary &gt; 0)</code>. <b>7. DEFAULT:</b> <code>city DEFAULT 'Hyd'</code>.
<br><b>8. General / semantic constraints:</b> assertions & triggers – <code>CREATE ASSERTION</code> e.g. total loans ≤ total deposits.
<br><b>Example table:</b> <code>CREATE TABLE emp(eid INT PRIMARY KEY, name VARCHAR(20) NOT NULL, sal INT CHECK(sal&gt;0), did INT REFERENCES dept(did));</code>`,
3: `<b>Relational model</b> (E.F. Codd, 1970): data is represented as a collection of relations (tables); simple, mathematical (set theory) and the base of SQL databases.
<br>{{relation}}
<br><b>Concepts:</b> <b>Relation</b> – table of rows and columns. <b>Tuple</b> – a row (one record). <b>Attribute</b> – a column (named property). <b>Domain</b> – set of allowed atomic values of an attribute. <b>Degree</b> – number of attributes. <b>Cardinality</b> – number of tuples. <b>Relation schema</b> – R(A1,…,An), e.g. STUDENT(Sid, Name, Dept). <b>Relation instance</b> – set of tuples at a given time. <b>NULL</b> – unknown/not applicable value.
<br><b>Keys:</b> super key, candidate key (minimal super key), primary key, alternate key, foreign key, composite key.
<br><b>Properties of relations:</b> no duplicate tuples, order of tuples and attributes irrelevant, values atomic, each attribute name unique.
<br><b>Integrity constraints:</b> domain, key, entity integrity, referential integrity.
<br><b>Operations:</b> relational algebra / calculus, SQL (insert, delete, update, select).
<br><b>Advantages:</b> simplicity, structural independence, powerful query language, easy design via normalization.`,
4: `<b>Relational calculus:</b> non-procedural query language – states <i>what</i> to retrieve, not how. Based on predicate logic.
<br><b>1. Tuple Relational Calculus (TRC):</b> variables range over tuples. Form: <b>{ t | P(t) }</b> – set of tuples t for which predicate P is true. Uses ∧, ∨, ¬, ⇒, ∃ (there exists), ∀ (for all).
<br><i>Ex 1:</i> employees with salary &gt; 50000: { t | t ∈ EMP ∧ t.sal &gt; 50000 }. <i>Ex 2:</i> names only: { t.name | t ∈ EMP ∧ t.sal &gt; 50000 }. <i>Ex 3:</i> students enrolled in course C1: { s.name | s ∈ STUDENT ∧ ∃e (e ∈ ENROLL ∧ e.sid = s.sid ∧ e.cid = 'C1') }.
<br><b>2. Domain Relational Calculus (DRC):</b> variables range over attribute domain values. Form: <b>{ &lt;x1, x2, …, xn&gt; | P(x1,…,xn) }</b>.
<br><i>Ex 1:</i> { &lt;i, n, s&gt; | &lt;i, n, s&gt; ∈ EMP ∧ s &gt; 50000 }. <i>Ex 2:</i> names: { &lt;n&gt; | ∃i ∃s (&lt;i, n, s&gt; ∈ EMP ∧ s &gt; 50000) }.
<br><b>Safety:</b> expressions must give finite results (e.g. { t | ¬(t ∈ EMP) } is unsafe).
<br>${T([['TRC', 'DRC'], ['Tuple variables', 'Domain variables'], ['{t | P(t)}', '{&lt;x1..xn&gt; | P}'], ['Basis of SQL', 'Basis of QBE']])}
<br>Safe TRC, safe DRC and relational algebra are equal in expressive power (relationally complete).`,
5: `<b>Relational algebra:</b> procedural query language; operations take relations as input and give a relation as output.
<br><b>Unary:</b> <b>1. Select σ</b> – rows meeting a condition: σ<sub>dept='CSE'</sub>(STUDENT). <b>2. Project π</b> – chosen columns, duplicates removed: π<sub>name, dept</sub>(STUDENT). <b>3. Rename ρ</b> – ρ<sub>S</sub>(STUDENT).
<br><b>Set operations</b> (union-compatible relations): <b>4. Union ∪</b> – π<sub>sid</sub>(CSE) ∪ π<sub>sid</sub>(ECE). <b>5. Intersection ∩</b> – common tuples. <b>6. Difference −</b> – in R not in S: π<sub>sid</sub>(STUDENT) − π<sub>sid</sub>(ENROLL).
<br><b>7. Cartesian product ×</b> – every tuple of R with every tuple of S; degree m+n, cardinality r·s.
<br><b>Joins:</b> <b>8. Theta join</b> R ⋈<sub>θ</sub> S = σ<sub>θ</sub>(R × S). <b>Equi join</b> – θ uses =. <b>Natural join ⋈</b> – equality on common attributes, one copy kept: EMP ⋈ DEPT. <b>Outer joins</b> (left ⟕, right ⟖, full ⟗) keep unmatched tuples with NULLs.
<br><b>9. Division ÷</b> – students enrolled in <i>all</i> courses: ENROLL(sid,cid) ÷ π<sub>cid</sub>(COURSE).
<br><b>10. Assignment ←</b> – temp ← σ<sub>sal&gt;5000</sub>(EMP).
<br><i>Example query:</i> names of CSE students: π<sub>name</sub>(σ<sub>dept='CSE'</sub>(STUDENT)).
<br>Fundamental ops: σ, π, ∪, −, ×, ρ; others are derived.`,
},
3: {
1: `<b>SQL</b> (Structured Query Language) – standard language for relational databases. Commands grouped into:
<br><b>1. DDL (Data Definition):</b> <code>CREATE TABLE student(sid INT PRIMARY KEY, name VARCHAR(20), dept CHAR(5));</code> <code>ALTER TABLE student ADD email VARCHAR(30);</code> <code>DROP TABLE student;</code> <code>TRUNCATE TABLE student;</code> <code>RENAME</code>.
<br><b>2. DML (Data Manipulation):</b> <code>INSERT INTO student VALUES(101,'Ravi','CSE');</code> <code>UPDATE student SET dept='IT' WHERE sid=101;</code> <code>DELETE FROM student WHERE sid=101;</code>
<br><b>3. DQL (Query):</b> <code>SELECT [DISTINCT] cols FROM tables WHERE cond GROUP BY cols HAVING cond ORDER BY col [ASC|DESC];</code> Ex: <code>SELECT dept, COUNT(*) FROM student GROUP BY dept HAVING COUNT(*)&gt;10 ORDER BY dept;</code> Operators: BETWEEN, IN, LIKE 'R%', IS NULL, AND/OR/NOT.
<br><b>4. DCL (Control):</b> <code>GRANT SELECT, INSERT ON student TO user1;</code> <code>REVOKE INSERT ON student FROM user1;</code>
<br><b>5. TCL (Transaction):</b> <code>COMMIT;</code> <code>ROLLBACK;</code> <code>SAVEPOINT s1;</code> <code>ROLLBACK TO s1;</code>
<br><b>Other queries:</b> joins – <code>SELECT e.name, d.dname FROM emp e INNER JOIN dept d ON e.did=d.did;</code> set ops – UNION, INTERSECT, EXCEPT; nested queries; views.`,
2: `<b>Nested query (subquery):</b> a SELECT written inside another SQL statement (in WHERE, FROM, HAVING or SELECT). Inner query result is used by the outer query. Operators: IN, NOT IN, =, &gt;, ANY, ALL, EXISTS, NOT EXISTS.
<br><b>1. Non-correlated subquery:</b> inner query is independent; executed once, result passed to outer query.
<br><i>Ex 1:</i> employees earning more than average: <code>SELECT name FROM emp WHERE sal &gt; (SELECT AVG(sal) FROM emp);</code>
<br><i>Ex 2:</i> employees in Hyderabad depts: <code>SELECT name FROM emp WHERE did IN (SELECT did FROM dept WHERE loc='Hyd');</code>
<br><i>Ex 3:</i> <code>SELECT name FROM emp WHERE sal &gt; ALL (SELECT sal FROM emp WHERE did=10);</code>
<br><b>2. Correlated subquery:</b> inner query refers to a column of the outer query; executed once for <i>each</i> outer row (slower).
<br><i>Ex 1:</i> employees earning more than their own dept average: <code>SELECT e.name FROM emp e WHERE e.sal &gt; (SELECT AVG(sal) FROM emp WHERE did = e.did);</code>
<br><i>Ex 2:</i> depts having at least one employee: <code>SELECT dname FROM dept d WHERE EXISTS (SELECT * FROM emp e WHERE e.did = d.did);</code>
<br>${T([['Non-correlated', 'Correlated'], ['Independent inner', 'Uses outer column'], ['Runs once', 'Runs per outer row'], ['Faster', 'Slower']])}
<br>Subqueries in FROM are called derived tables / inline views.`,
3: `<b>Normalization:</b> process of decomposing relations to remove redundancy and insert/update/delete anomalies, using functional dependencies (FDs), while keeping lossless join and dependency preservation.
<br>{{normal}}
<br><b>1NF:</b> all values atomic, no repeating groups. STUDENT(sid, name, phones='p1,p2') → one phone per row.
<br><b>2NF:</b> 1NF + no partial dependency (non-key attribute depends on whole candidate key). R(sid, cid, sname, grade): sid→sname is partial → split STUDENT(sid, sname), ENROLL(sid, cid, grade).
<br><b>3NF:</b> 2NF + no transitive dependency of non-key on key. EMP(eid, did, dname): eid→did→dname → EMP(eid, did), DEPT(did, dname). Rule: for X→A, X is super key or A is prime.
<br><b>BCNF:</b> for every FD X→Y, X is a super key. R(student, course, teacher), teacher→course violates → (teacher, course), (student, teacher).
<br><b>4NF:</b> BCNF + no multivalued dependency (sid →→ hobby, sid →→ course split into two tables).
<br><b>5NF (PJNF):</b> no join dependency; table cannot be decomposed further losslessly.
<br><b>Advantages:</b> less redundancy, consistency, smaller tables, easier maintenance. <b>Drawback:</b> more joins.`,
4: `<b>Trigger:</b> a stored PL/SQL block that runs automatically when a specified event (INSERT, UPDATE, DELETE) occurs on a table. Follows the <b>ECA model</b> – Event, Condition, Action.
<br><b>Syntax:</b> <code>CREATE [OR REPLACE] TRIGGER trg_name {BEFORE | AFTER} {INSERT | UPDATE | DELETE} ON table [FOR EACH ROW] [WHEN (cond)] BEGIN statements; END;</code>
<br><b>Types:</b> BEFORE / AFTER / INSTEAD OF (views); row-level (FOR EACH ROW, uses :NEW and :OLD) / statement-level (once per statement).
<br><b>INSERT trigger</b> – stop negative salary: <code>CREATE TRIGGER chk_sal BEFORE INSERT ON emp FOR EACH ROW BEGIN IF :NEW.sal &lt; 0 THEN RAISE_APPLICATION_ERROR(-20001,'Salary cannot be negative'); END IF; END;</code>
<br><b>UPDATE trigger</b> – audit salary change: <code>CREATE TRIGGER sal_audit AFTER UPDATE OF sal ON emp FOR EACH ROW BEGIN INSERT INTO emp_log VALUES(:OLD.eid, :OLD.sal, :NEW.sal, SYSDATE); END;</code>
<br><b>Testing:</b> <code>UPDATE emp SET sal=60000 WHERE eid=1;</code> → a row is added to emp_log automatically. <b>Drop:</b> <code>DROP TRIGGER sal_audit;</code>
<br><b>Uses:</b> enforce complex integrity rules, auditing/logging, derived column values, automatic stock updates, security checks. <b>Cautions:</b> hidden logic, cascading triggers, performance overhead.`,
5: `<b>Aggregate functions:</b> compute a single value from a set of rows; usually with GROUP BY; NULLs ignored (except COUNT(*)).
<br><b>COUNT</b> – <code>SELECT COUNT(*) FROM emp;</code> <b>SUM</b> – <code>SELECT SUM(sal) FROM emp;</code> <b>AVG</b> – <code>SELECT AVG(sal) FROM emp;</code> <b>MAX / MIN</b> – <code>SELECT MAX(sal), MIN(sal) FROM emp;</code>
<br><b>With GROUP BY / HAVING:</b> <code>SELECT did, AVG(sal) FROM emp GROUP BY did HAVING AVG(sal) &gt; 40000;</code> – WHERE filters rows before grouping, HAVING filters groups. COUNT(DISTINCT did) counts unique values.
<br><b>Constraints in SQL:</b> <b>1. NOT NULL</b> – <code>name VARCHAR(20) NOT NULL</code>. <b>2. UNIQUE</b> – <code>email VARCHAR(30) UNIQUE</code>. <b>3. PRIMARY KEY</b> – unique + not null: <code>eid INT PRIMARY KEY</code>. <b>4. FOREIGN KEY</b> – <code>did INT REFERENCES dept(did) ON DELETE CASCADE</code>. <b>5. CHECK</b> – <code>CHECK (age &gt;= 18)</code>. <b>6. DEFAULT</b> – <code>city VARCHAR(10) DEFAULT 'Hyd'</code>.
<br><b>Table-level:</b> <code>CREATE TABLE enroll(sid INT, cid INT, PRIMARY KEY(sid,cid), FOREIGN KEY(sid) REFERENCES student(sid));</code>
<br><b>Add/remove later:</b> <code>ALTER TABLE emp ADD CONSTRAINT c1 CHECK(sal&gt;0);</code> <code>ALTER TABLE emp DROP CONSTRAINT c1;</code>
<br>Constraints keep data valid; aggregates summarise data for reports.`,
},
4: {
1: `<b>Transaction:</b> a logical unit of work – a sequence of read/write operations that must execute completely or not at all. <i>Ex:</i> transfer ₹500 from A to B: read(A); A=A−500; write(A); read(B); B=B+500; write(B); commit.
<br>{{states}}
<br><b>States:</b> active → partially committed (last statement done) → committed; on error → failed → aborted (rolled back, then restart or kill).
<br><b>ACID properties:</b> <b>A – Atomicity:</b> all operations or none; if failure after write(A), A's change is undone. Ensured by <i>recovery manager</i> (logs, undo).
<br><b>C – Consistency:</b> a transaction takes the DB from one consistent state to another; A+B stays the same before and after. Responsibility of programmer + integrity constraints.
<br><b>I – Isolation:</b> concurrent transactions don't see each other's intermediate results; result equals some serial order. Ensured by <i>concurrency-control manager</i> (locks, timestamps).
<br><b>D – Durability:</b> once committed, changes survive crashes. Ensured by <i>recovery manager</i> (write-ahead log, redo, stable storage).
<br><b>Operations:</b> read(X), write(X), commit, rollback. Problems without ACID: lost update, dirty read, unrepeatable read, inconsistent data.`,
2: `<b>Schedule:</b> order of execution of operations of concurrent transactions. <b>Serial schedule</b> – one transaction after another (always correct). <b>Serializability:</b> a non-serial schedule is serializable if its effect equals some serial schedule – ensures consistency with concurrency.
<br><b>1. Conflict serializability:</b> two operations <b>conflict</b> if they belong to different transactions, access the same item and at least one is a write (R-W, W-R, W-W). A schedule is conflict serializable if it can be turned into a serial schedule by swapping non-conflicting adjacent operations (conflict equivalent).
<br><b>Test – precedence graph:</b> node per transaction; edge Ti → Tj if an operation of Ti conflicts with and precedes one of Tj. <b>Acyclic ⇒ conflict serializable</b>; topological order gives the serial order.
<br>{{precedence}}
<br><b>2. View serializability:</b> S is view equivalent to serial S' if (i) same initial reads, (ii) same read-from (Ti reads value written by Tj in both), (iii) same final writes. Every conflict-serializable schedule is view serializable, not vice-versa – schedules with <b>blind writes</b> (write without read) may be view but not conflict serializable. Testing view serializability is NP-complete.
<br>${T([['Conflict', 'View'], ['Precedence graph', 'NP-complete test'], ['Stricter', 'Broader'], ['Used in practice', 'Theoretical']])}`,
3: `<b>Isolation</b> is implemented by a <b>lock-based protocol</b>: a transaction must get a lock on a data item before accessing it; the <b>lock manager</b> grants or makes it wait.
<br><b>Lock modes:</b> <b>Shared (S)</b> – lock-S(Q): transaction can only read Q; many transactions can hold S together. <b>Exclusive (X)</b> – lock-X(Q): can read and write Q; no other lock allowed. unlock(Q) releases.
<br><b>Lock compatibility matrix:</b> ${T([['Held \\ Req', 'S', 'X'], ['S', 'Yes', 'No'], ['X', 'No', 'No']])}
<br><i>Example:</i> T1: lock-X(A); read(A); A=A−50; write(A); unlock(A); lock-X(B); … T2: lock-S(A); read(A); unlock(A); — T2 waits until T1 releases A.
<br><b>Two-Phase Locking (2PL):</b> <b>growing phase</b> – obtain locks, no release; <b>shrinking phase</b> – release, no new locks. Guarantees conflict serializability (lock point order). <b>Strict 2PL</b> – hold X locks till commit (cascadeless). <b>Rigorous 2PL</b> – hold all locks till commit.
<br><b>Lock conversion:</b> upgrade S→X (growing), downgrade X→S (shrinking).
<br><b>Problems:</b> deadlock (T1 waits for T2 and T2 for T1) – handled by wait-die, wound-wait, timeout, wait-for graph detection; starvation – fair lock granting.`,
4: `<b>Multiple granularity:</b> allows data items of various sizes (granules) to be locked, organised as a tree: Database → Area → File → Record. Locking a node implicitly locks all its descendants. Coarse granules – less overhead, low concurrency; fine granules – high concurrency, more locks.
<br>{{granular}}
<br><b>Intention lock modes:</b> <b>IS</b> – intends to set S locks lower in tree. <b>IX</b> – intends to set X/S locks lower. <b>SIX</b> – S on the node + IX (read whole subtree, update some). Plus <b>S</b> and <b>X</b>.
<br><b>Compatibility matrix:</b> ${T([['', 'IS', 'IX', 'S', 'SIX', 'X'], ['IS', '✓', '✓', '✓', '✓', '✗'], ['IX', '✓', '✓', '✗', '✗', '✗'], ['S', '✓', '✗', '✓', '✗', '✗'], ['SIX', '✓', '✗', '✗', '✗', '✗'], ['X', '✗', '✗', '✗', '✗', '✗']])}
<br><b>Protocol rules (Ti):</b> 1. Observe the compatibility matrix. 2. Lock the root first, in any mode. 3. Node Q locked in S or IS only if parent is held in IX or IS. 4. Q locked in X, SIX or IX only if parent is held in IX or SIX. 5. Follow two-phase locking. 6. Unlock Q only if none of its children are locked. Locks acquired <b>top-down</b>, released <b>bottom-up</b>.
<br><i>Example:</i> T1 updates record r1 → IX(DB), IX(A1), IX(Fa), X(r1); T2 reads file Fc → IS(DB), IS(A2), S(Fc) – both run together.
<br>Deadlock is still possible.`,
5: `<b>Recovery system</b> implements atomicity (undo incomplete transactions) and durability (redo committed ones) after failures – transaction errors, system crash, disk failure.
<br><b>Storage types:</b> volatile (RAM), non-volatile (disk), <b>stable storage</b> (replicated copies – never lost; holds the log).
<br><b>1. Shadow copy / shadow paging:</b> transaction updates a new copy of the database (or pages); a db-pointer points to the current copy. On commit, pages are flushed and pointer switched atomically; on abort, the new copy is discarded. Simple but costly for large DBs, causes fragmentation.
<br><b>2. Log-based recovery:</b> log records on stable storage: &lt;Ti start&gt;, &lt;Ti, X, old, new&gt;, &lt;Ti commit&gt;, &lt;Ti abort&gt;. <b>Write-Ahead Logging (WAL):</b> log record written to stable storage before the data page.
<br><b>Deferred update:</b> writes applied only after commit → only <b>redo</b> needed. <b>Immediate update:</b> writes applied before commit → <b>undo</b> (using old values) for transactions without commit, <b>redo</b> (new values) for committed ones.
<br><b>3. Checkpoints:</b> periodically flush log and dirty pages and write &lt;checkpoint L&gt;; recovery scans only from the last checkpoint – faster.
<br><b>Recovery steps:</b> redo phase (forward scan, repeat history) → undo phase (backward scan, roll back incomplete, write &lt;Ti abort&gt;).
<br>Algorithm example: ARIES. Disk failure handled by archival backup + log.`,
},
5: {
1: `<b>File organization:</b> the way records are placed in blocks of a file on disk; decides speed of insert, search, delete.
<br><b>1. Heap (pile) file:</b> records inserted at the end wherever space exists. <i>Adv:</i> fast insert, good for bulk load. <i>Disadv:</i> linear search O(n), wasted space after deletes.
<br><b>2. Sequential (sorted) file:</b> records stored in order of a search key. <i>Adv:</i> fast range & ordered access, binary search. <i>Disadv:</i> insertion/deletion costly (re-sorting, overflow blocks).
<br><b>3. Hash file:</b> hash function h(key) gives bucket address. <i>Adv:</i> very fast equality search O(1). <i>Disadv:</i> poor for range queries, collisions/overflow, bucket skew. Static and dynamic (extendible, linear) hashing.
<br><b>4. Indexed sequential (ISAM):</b> sorted file + index. <i>Adv:</i> both random and sequential access. <i>Disadv:</i> overflow chains, extra space.
<br><b>5. B+ tree file:</b> records in leaves of a balanced tree. <i>Adv:</i> dynamic, balanced, good for equality and range. <i>Disadv:</i> complex, overhead.
<br><b>6. Clustered file:</b> related records of several tables stored together (emp with dept). <i>Adv:</i> fast joins. <i>Disadv:</i> slow for single-table scans.
<br>${T([['Org.', 'Search', 'Insert', 'Range'], ['Heap', 'Slow', 'Fast', 'Slow'], ['Sorted', 'Fast', 'Slow', 'Fast'], ['Hash', 'Fastest', 'Fast', 'Poor'], ['B+ tree', 'Fast', 'Fast', 'Fast']])}`,
2: `<b>B+ tree:</b> balanced multi-level index; all keys in leaf nodes, internal nodes only guide search; leaves linked for range queries. Order n: each node holds ≤ n−1 keys and ≤ n pointers; nodes (except root) at least half full.
<br><b>Insertion algorithm:</b> 1. Search down from root to the correct leaf. 2. If leaf has space, insert key in sorted order. 3. If leaf is full, <b>split</b>: keep first ⌈n/2⌉ keys, move rest to a new leaf, <b>copy</b> the first key of the new leaf up to the parent; link leaves. 4. If parent overflows, split the internal node and <b>move</b> (push) the middle key up. 5. If root splits, a new root is created – tree height grows by one (grows at root, stays balanced).
<br><b>Example</b> (order 3, max 2 keys): insert 5, 10 → leaf [5|10]. Insert 15 → [5|10|15] overflows → split [5] and [10|15], copy 10 up → root [10]. Insert 20 → [10|15|20] splits → [10], [15|20], copy 15 → root [10|15]. Insert 25 → [15|20|25] splits → [15], [20|25], copy 20 → root [10|15|20] overflows → internal split, 15 moves up: new root [15], children [10] and [20]; leaves [5] [10] [15] [20|25].
<br>{{bplus}}
<br><b>Properties:</b> search/insert O(log n), all leaves at same level, efficient range search through linked leaves. Used in almost every DBMS index.`,
3: `<b>Index:</b> an auxiliary data structure (search key, pointer) that speeds up retrieval of records without scanning the whole file – like a book's index. Evaluated by access time, insertion/deletion time and space overhead.
<br><b>1. Primary index:</b> on the ordering key field of a sorted file; one entry per block (anchor record). <b>2. Clustering index:</b> on an ordering non-key field (dept) – one entry per distinct value. <b>3. Secondary index:</b> on a non-ordering field; always dense; file not sorted on it (e.g. index on email).
<br><b>4. Dense index:</b> entry for every search-key value. Fast lookup, more space. <b>Sparse index:</b> entries for only some values (one per block); find the largest key ≤ search key then scan. Less space, needs sorted file.
<br>${T([['Index', 'Keys', 'Data'], ['10 →', '10', 'Ravi'], ['30 →', '20', 'Sita'], ['', '30', 'Ram']])} <i>(sparse: 10, 30 point to block starts)</i>
<br><b>5. Multilevel index:</b> index on index when the index is too large (ISAM, B+ tree). <b>6. Tree-based:</b> B tree, B+ tree. <b>7. Hash-based index:</b> buckets by h(key) – fast equality. <b>8. Bitmap index:</b> bit vector per value (gender, grade) – good for low cardinality.
<br><b>SQL:</b> <code>CREATE INDEX idx_name ON student(name);</code> <code>DROP INDEX idx_name;</code>
<br><b>Pros:</b> fast search, sort, join. <b>Cons:</b> extra space, slower insert/update/delete.`,
4: `<b>ISAM (Indexed Sequential Access Method):</b> static, tree-structured index developed by IBM; data file kept sorted on key with a multilevel index above it – supports both sequential and direct (random) access.
<br>{{isam}}
<br><b>Structure:</b> <b>1. Primary data pages (leaf level)</b> – records sorted by key, allocated sequentially when the file is created. <b>2. Index pages</b> – non-leaf levels holding (key, pointer) entries that direct the search; built once and <b>never change</b>. <b>3. Overflow pages</b> – inserts that don't fit in the proper primary page go to chained overflow pages.
<br><b>Search:</b> start at root, compare keys, follow pointers down to the leaf page, then scan it and its overflow chain. Cost ≈ log<sub>F</sub>N + overflow length (F = fan-out, N = no. of leaf pages).
<br><b>Insert:</b> find the leaf; if space, insert; else add to overflow page. <b>Delete:</b> remove from page; empty overflow page is freed, but primary pages stay (index not changed).
<br><b>Advantages:</b> simple, fast search when few updates, good sequential processing, no locking of index pages (static) → high concurrency.
<br><b>Disadvantages:</b> long overflow chains after many inserts → slow search, unsorted overflow, wasted space; periodic reorganisation needed. Hence replaced by dynamic <b>B+ trees</b>.`,
5: `DBMS stores data on <b>external (secondary) storage</b> – mainly magnetic disks/SSDs, tapes for archive – because it is non-volatile, cheap and large. Data must be brought into main memory to be processed.
<br><b>Storage hierarchy:</b> cache → main memory → flash/SSD → magnetic disk → optical disk → tape (speed ↓, capacity ↑, cost/byte ↓).
<br><b>Magnetic disk:</b> platters with tracks, divided into sectors; cylinder = same track on all surfaces; read/write heads on an arm. <b>Access time = seek time + rotational latency + transfer time</b>. Data read/written in <b>blocks (pages)</b> – unit of I/O; DBMS minimises I/Os.
<br>{{disk}}
<br><b>Components:</b> <b>Disk space manager</b> – allocates/deallocates pages, tracks free space. <b>Buffer manager</b> – keeps pages in a buffer pool in RAM; on request, returns the page or reads it from disk; uses pin count and dirty bit; replacement policies LRU, MRU, clock.
<br><b>Records in pages:</b> fixed-length or variable-length records; slotted page with slot directory; record id (RID) = (page id, slot no).
<br><b>Files of records:</b> heap, sorted, hashed files built from pages; indexes for access.
<br><b>RAID:</b> striping + mirroring/parity for speed and reliability (RAID 0, 1, 5). Tapes give sequential-access backup.`,
},
};

// expand diagram tokens and one-line formatting for the sheet builder
for (const u in ANS) for (const k in ANS[u]) ANS[u][k] = ANS[u][k].replace(/\{\{(\w+)\}\}/g, (m, n) => D[n]).replace(/\n<br>/g, '<br>').replace(/\n/g, ' ').replace(/_/g, '&#95;');
module.exports = { Q, A: ANS };
