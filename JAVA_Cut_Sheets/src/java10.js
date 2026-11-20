// JAVA PROGRAMMING – 10-mark long answers (questions from the 2026 question bank).
// <br> = new step (printed as a bold star). Diagrams are small black-and-white inline SVGs.
const T = (rows) => '<table>' + rows.map((r, i) => '<tr>' + r.map(c => `<td>${i === 0 ? '<b>' + c + '</b>' : c}</td>`).join('') + '</tr>').join('') + '</table>';
const C = (s) => `<code class="jc">${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/_/g, '&#95;').replace(/\n/g, '<span class="nl"></span>')}</code>`;

// ---- tiny SVG diagram kit ----
let mk = 0;
function SVG(w, h, body, cls = 'jdw') {
  const id = 'ah' + (++mk);
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="${id}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#000"/></marker></defs>${body.replace(/MARK/g, id)}</svg>`;
}
const B = (x, y, w, h, t, bold) => {
  const ls = t.split('|');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#000" stroke-width="1.1"/>` +
    ls.map((l, i) => `<text x="${x + w / 2}" y="${y + h / 2 + (i - (ls.length - 1) / 2) * 9 + 3}" font-size="8" text-anchor="middle"${bold ? ' font-weight="bold"' : ''}>${l}</text>`).join('');
};
const A = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="1" marker-end="url(#MARK)"/>`;
const Lb = (x, y, t) => `<text x="${x}" y="${y}" font-size="7" text-anchor="middle">${t}</text>`;

const D = {
  jvm: SVG(250, 46, B(2, 12, 46, 22, 'Hello.java') + A(48, 23, 70, 23) + Lb(59, 19, 'javac') + B(70, 12, 50, 22, 'Hello.class|(bytecode)') + A(120, 23, 140, 18) + A(120, 23, 140, 28) + B(140, 1, 52, 20, 'JVM Windows') + B(140, 25, 52, 20, 'JVM Linux') + B(196, 12, 52, 22, 'Same output|everywhere') + A(192, 11, 196, 18) + A(192, 35, 196, 28)),
  inh: SVG(250, 70,
    Lb(20, 8, 'Single') + B(5, 11, 30, 14, 'A') + A(20, 25, 20, 37) + B(5, 37, 30, 14, 'B') +
    Lb(70, 8, 'Multilevel') + B(55, 11, 30, 13, 'A') + A(70, 24, 70, 31) + B(55, 31, 30, 13, 'B') + A(70, 44, 70, 51) + B(55, 51, 30, 13, 'C') +
    Lb(130, 8, 'Hierarchical') + B(115, 11, 30, 14, 'A') + A(125, 25, 110, 37) + A(135, 25, 150, 37) + B(97, 37, 26, 14, 'B') + B(137, 37, 26, 14, 'C') +
    Lb(212, 8, 'Multiple (interfaces)') + B(180, 11, 30, 14, 'I1') + B(214, 11, 30, 14, 'I2') + A(195, 25, 208, 37) + A(229, 25, 216, 37) + B(197, 37, 30, 14, 'C') + Lb(212, 62, 'class C implements I1, I2')),
  exc: SVG(250, 84,
    B(100, 2, 50, 15, 'Throwable', 1) + A(115, 17, 60, 27) + A(135, 17, 190, 27) +
    B(30, 27, 60, 15, 'Exception', 1) + B(160, 27, 60, 15, 'Error', 1) +
    A(45, 42, 25, 52) + A(75, 42, 95, 52) + B(2, 52, 50, 14, 'IOException') + B(70, 52, 62, 14, 'RuntimeException') + Lb(28, 74, 'checked') +
    A(101, 66, 101, 70) + Lb(101, 78, 'Arithmetic, NullPointer,') + Lb(101, 84, 'ArrayIndexOutOfBounds (unchecked)') +
    A(175, 42, 175, 52) + A(205, 42, 222, 52) + B(146, 52, 55, 14, 'OutOfMemory') + B(203, 52, 45, 14, 'StackOverflow')),
  life: SVG(250, 60,
    B(2, 20, 34, 16, 'New') + A(36, 28, 52, 28) + Lb(44, 24, 'start()') + B(52, 20, 42, 16, 'Runnable') + A(94, 25, 116, 25) + A(116, 31, 94, 31) + Lb(105, 20, 'scheduler') +
    B(116, 20, 40, 16, 'Running') + A(156, 28, 204, 28) + Lb(180, 24, 'run() ends') + B(204, 20, 44, 16, 'Terminated') +
    A(136, 36, 136, 46) + B(100, 46, 78, 13, 'Blocked / Waiting') + A(100, 52, 73, 36) + Lb(72, 56, 'notify/sleep over') + Lb(160, 44, 'sleep, wait, I/O')),
  deleg: SVG(250, 48,
    B(2, 14, 56, 22, 'Event Source|(JButton)') + A(58, 25, 98, 25) + Lb(78, 20, 'generates') + B(98, 14, 56, 22, 'Event object|(ActionEvent)') + A(154, 25, 192, 25) + Lb(173, 20, 'sent to') + B(192, 14, 56, 22, 'Listener|actionPerformed()') +
    `<path d="M220,36 Q220,46 130,46 Q30,46 30,36" fill="none" stroke="#000" stroke-width="0.9" stroke-dasharray="2,1.5" marker-end="url(#MARK)"/>` + Lb(130, 44, 'registered by addActionListener()')),
  layout: SVG(250, 56,
    Lb(30, 7, 'BorderLayout') + B(2, 10, 56, 9, 'NORTH') + B(2, 19, 14, 22, 'W') + B(16, 19, 28, 22, 'CENTER') + B(44, 19, 14, 22, 'E') + B(2, 41, 56, 9, 'SOUTH') +
    Lb(95, 7, 'FlowLayout') + B(68, 22, 17, 11, 'B1') + B(87, 22, 17, 11, 'B2') + B(106, 22, 17, 11, 'B3') + Lb(95, 44, 'left→right, wraps') +
    Lb(155, 7, 'GridLayout(2,3)') + B(130, 14, 16, 15, '1') + B(146, 14, 16, 15, '2') + B(162, 14, 16, 15, '3') + B(130, 29, 16, 15, '4') + B(146, 29, 16, 15, '5') + B(162, 29, 16, 15, '6') +
    Lb(220, 7, 'CardLayout') + B(200, 20, 34, 22, 'Card 1') + B(204, 16, 34, 22, 'Card 2') + B(208, 12, 34, 22, 'Card 3') + Lb(222, 50, 'one card visible')),
  mvc: SVG(250, 56,
    B(95, 2, 60, 17, 'Controller', 1) + B(10, 36, 60, 17, 'Model', 1) + B(180, 36, 60, 17, 'View', 1) +
    A(100, 19, 60, 36) + Lb(62, 25, 'updates data') + A(70, 46, 180, 46) + Lb(125, 42, 'notifies change') + A(190, 36, 150, 19) + Lb(195, 25, 'user input') +
    Lb(40, 62, '') ),
  swing: SVG(250, 54,
    B(2, 18, 40, 16, 'JFrame', 1) + A(42, 26, 56, 26) + B(56, 18, 44, 16, 'JRootPane') + A(100, 26, 114, 26) + B(114, 18, 50, 16, 'ContentPane') + A(164, 26, 178, 26) + B(178, 18, 34, 16, 'JPanel') +
    A(212, 22, 222, 8) + A(212, 26, 222, 26) + A(212, 30, 222, 44) + B(222, 1, 27, 13, 'JButton') + B(222, 20, 27, 13, 'JLabel') + B(222, 38, 27, 13, 'JList') +
    Lb(22, 46, 'top-level') + Lb(146, 46, 'intermediate') + Lb(236, 54, 'components')),
  streams: SVG(250, 50,
    B(2, 2, 70, 14, 'InputStream (byte)', 1) + B(2, 30, 70, 14, 'OutputStream (byte)', 1) + B(128, 2, 60, 14, 'Reader (char)', 1) + B(128, 30, 60, 14, 'Writer (char)', 1) +
    A(72, 9, 82, 9) + Lb(102, 12, 'FileInputStream') + A(72, 37, 82, 37) + Lb(104, 40, 'FileOutputStream') +
    A(188, 9, 198, 9) + Lb(222, 12, 'FileReader') + A(188, 37, 198, 37) + Lb(222, 40, 'FileWriter') + Lb(125, 25, 'Buffered…, Data…, Print… wrap these')),
};

const Q = {
1: {
1: 'Explain the need for the Object-Oriented Programming (OOP) paradigm. Discuss the fundamental concepts of OOP with suitable examples.',
2: 'Explain the Java buzzwords. Discuss why Java is platform-independent.',
3: 'Describe variables, scope and lifetime of variables with suitable examples.',
4: 'Explain Java operators and expressions. Discuss different types of operators with suitable Java programs.',
5: 'Explain control statements in Java with an example program.',
6: 'A) Explain the concepts of classes and objects in Java. B) Discuss constructors, methods and access control mechanisms with suitable programs.',
7: 'What is method overloading and constructor overloading? Explain their differences with suitable Java programs.',
8: 'Explain the uses of the this and super keywords with an example program.',
9: 'Explain types of inner classes in Java with suitable examples.',
10: 'Explain the String class in Java. Discuss various String methods, String immutability and commonly used String operations with suitable programs.',
},
2: {
1: 'Define inheritance. Explain different forms of inheritance in Java with suitable diagrams and programs.',
2: 'Explain superclass, subclass, subtype and substitutability. Discuss benefits and limitations of inheritance.',
3: 'Discuss different forms of inheritance: specialization, specification, construction, extension, limitation and combination with suitable examples.',
4: 'Write a Java program to demonstrate polymorphism using constructors and methods.',
5: 'Explain the role of the final keyword in inheritance. Discuss final variables, final methods and final classes with examples.',
6: 'What is polymorphism? Explain method overriding and dynamic method dispatch with suitable Java programs.',
7: 'Explain abstract classes in Java. Discuss their features, advantages and differences between abstract and concrete classes.',
8: 'Explain the Object class in Java. Discuss its important methods with suitable examples.',
9: 'What is a package in Java? Explain the steps involved in defining, creating, accessing and importing packages. Also explain the role of CLASSPATH.',
10: 'What is an interface in Java? Explain how to define and implement interfaces. Discuss differences between classes and interfaces, interface variables and extending interfaces with suitable programs.',
},
3: {
1: 'Define exception handling. Explain its concepts, advantages and importance in Java with suitable examples.',
2: 'Explain termination and resumptive models of exception handling. Discuss the Java exception hierarchy with a suitable diagram.',
3: 'Explain the purpose and working of try, catch, throw, throws and finally keywords with suitable Java programs.',
4: 'Explain different built-in exceptions in Java. Discuss checked and unchecked exceptions with suitable examples.',
5: 'What is a user-defined exception? Explain the procedure for creating and handling custom exception subclasses with a suitable Java program.',
6: 'Define multithreading. Explain differences between multithreading and multitasking. Discuss advantages of multithreading in Java.',
7: 'Explain different stages of the thread life cycle with a neat diagram. Discuss various methods used in thread management.',
8: 'Explain different ways of creating threads in Java. Write suitable programs to demonstrate thread creation by extending Thread class and implementing Runnable interface.',
9: 'What is thread synchronization? Explain the need for synchronization and inter-thread communication with suitable Java programs.',
10: 'Explain thread priorities, thread groups and daemon threads in Java. Discuss their purpose and applications with suitable examples.',
},
4: {
1: 'a) Explain the String class in Java. Discuss various String handling methods with suitable examples. b) Also explain important methods of the Object class.',
2: 'Explain the Java Utility (java.util) package. Discuss important utility classes and interfaces with suitable examples.',
3: 'Explain the Java I/O (java.io) package. Discuss byte streams and character streams with suitable examples.',
4: 'What is event handling in Java? Explain events, event sources, event classes and event listeners with suitable examples.',
5: 'Explain the Delegation Event Model in Java. Discuss its architecture, components and working procedure with a suitable diagram.',
6: 'Explain mouse event handling in Java. Discuss different mouse events and their corresponding listener interfaces with a suitable program.',
7: 'Explain keyboard event handling in Java. Discuss KeyListener interface methods and demonstrate keyboard event handling with a suitable Java program.',
8: 'What are adapter classes in Java? Explain their need and role in handling mouse and keyboard events with suitable examples.',
9: 'Explain graphics programming in Java. Discuss the Graphics class and its important methods used for drawing lines, rectangles, circles, arcs and other graphical objects.',
10: 'Explain different layout managers in Java. Discuss BorderLayout, GridLayout, FlowLayout, CardLayout and GridBagLayout with suitable examples and diagrams.',
},
5: {
1: 'Discuss the introduction to Swing, its features, advantages and limitations of AWT.',
2: 'Describe the Model, View and Controller (MVC) architecture with a neat diagram.',
3: 'Explain JFrame and JComponent in Swing with syntax and suitable examples.',
4: 'Explain JLabel, ImageIcon, JTextField, JButton, JCheckBox and JRadioButton with their constructors, methods and examples.',
5: 'Explain different list and combo box components in Java Swing.',
6: 'Explain Tabbed Panes and Scroll Panes in Java Swing with suitable examples.',
7: 'Explain JTree and JTable components in Swing with suitable examples.',
8: 'Explain Menu Basics in Java Swing. Discuss JMenuBar, JMenu, JMenuItem, JCheckBoxMenuItem, JRadioButtonMenuItem and JSeparator with constructors, methods and examples.',
9: 'Explain how to create and implement a Popup Menu in Java Swing. Write a Java program to demonstrate a popup menu with different menu items.',
10: 'Discuss top-level containers, intermediate containers and commonly used Swing components with suitable examples and diagrams.',
},
};

const ANS = {
1: {
1: `<b>Need for OOP:</b> procedural programs grow large and hard to maintain — global data can be changed by any function, code is hard to reuse and does not model real-world entities. OOP organises a program around <b>objects</b> (data + methods) giving modularity, reuse, security and easy maintenance.<br><b>Object:</b> real-world entity with state (fields) and behaviour (methods), e.g. a Car object. <b>Class:</b> blueprint of objects.<br><b>Encapsulation:</b> wrapping data and methods in one unit and hiding data with <i>private</i> (access via getters/setters).<br><b>Abstraction:</b> showing only essential features, hiding details (abstract class, interface — e.g. driving a car without knowing the engine).<br><b>Inheritance:</b> a class acquires properties of another (<i>extends</i>), code reuse — Dog extends Animal.<br><b>Polymorphism:</b> one name, many forms — overloading (compile time) and overriding (run time).<br><b>Message passing:</b> objects communicate by calling methods.` + C(`class Animal { void sound(){ System.out.println("sound"); } }
class Dog extends Animal { void sound(){ System.out.println("Bark"); } }
class Test { public static void main(String a[]){
  Animal x = new Dog(); x.sound(); } }   // Output: Bark`) + `<b>Conclusion:</b> OOP gives reusable, secure, maintainable and real-world-like programs.`,
2: `{{jvm}}<b>Java buzzwords (features):</b><br><b>Simple</b> — C/C++-like syntax, no pointers, automatic garbage collection ★ <b>Object-oriented</b> — everything inside classes ★ <b>Platform-independent & Portable</b> — "write once, run anywhere" ★ <b>Secure</b> — no pointers, bytecode verifier, security manager ★ <b>Robust</b> — strong typing, exception handling, memory management ★ <b>Architecture-neutral</b> — bytecode not tied to a CPU ★ <b>Interpreted & high performance</b> — bytecode interpreted, JIT compiler speeds it up ★ <b>Multithreaded</b> — many threads in one program ★ <b>Distributed</b> — networking (RMI, sockets) ★ <b>Dynamic</b> — classes loaded at run time.<br><b>Why platform-independent:</b> javac compiles source (.java) into <b>bytecode</b> (.class), not machine code. Bytecode is executed by the <b>JVM</b>; every OS has its own JVM that converts the same bytecode into native instructions. So one .class file runs on Windows, Linux or Mac without recompiling — the JVM is platform-dependent, the bytecode is not.`,
3: `<b>Variable:</b> named memory location holding a value; syntax <i>type name = value;</i> e.g. <i>int age = 20;</i><br><b>Types:</b> <b>Local</b> — declared inside a method/block, no default value, must be initialised ★ <b>Instance</b> — declared in class outside methods, one copy per object, default values (0, null, false) ★ <b>Static (class)</b> — declared with <i>static</i>, one copy shared by all objects.<br><b>Scope</b> (where visible): local → only inside its block { } ★ instance → all non-static methods of the class (via object) ★ static → whole class, also ClassName.var.<br><b>Lifetime</b> (how long it exists): local → from declaration till block ends ★ instance → while the object exists (till garbage collected) ★ static → from class loading till program ends.` + C(`class Demo {
  static int count = 0;      // static: whole program
  int id;                    // instance: per object
  void show(){
    int x = 10;              // local: only in show()
    for(int i=0;i<2;i++){ }  // i exists only in loop
    System.out.println(id+" "+x+" "+count);
  }
}`) + `<b>Note:</b> an inner block cannot redeclare a variable of the enclosing method block (compile error).`,
4: `<b>Operator:</b> symbol that performs an operation on operands; <b>expression:</b> combination of operands and operators giving a value, e.g. <i>a + b * c</i>.` + T([['Type', 'Operators', 'Example (a=10, b=3)'], ['Arithmetic', '+ − * / %', 'a/b=3, a%b=1'], ['Relational', '== != &gt; &lt; &gt;= &lt;=', 'a&gt;b → true'], ['Logical', '&amp;&amp; || !', '(a&gt;5 &amp;&amp; b&lt;5) → true'], ['Bitwise', '&amp; | ~ &lt;&lt; &gt;&gt; &gt;&gt;&gt;', 'a&amp;b=2, a&lt;&lt;1=20'], ['Assignment', '= += −= *= /=', 'a+=5 → 15'], ['Unary', '++ −− + −', 'a++ (post), ++a (pre)'], ['Ternary', '?:', 'max = a&gt;b ? a : b'], ['instanceof', 'instanceof', 's instanceof String']]) +
`<b>Precedence:</b> ( ) → unary → * / % → + − → shift → relational → equality → &amp; → | → &amp;&amp; → || → ?: → assignment.` + C(`class Ops { public static void main(String s[]){
  int a=10, b=3;
  System.out.println(a+b+" "+a%b);      // 13 1
  System.out.println(a>b && b>0);       // true
  System.out.println(a<<1);             // 20
  int m = (a>b)? a : b;                 // 10
  System.out.println(m + " " + (a++) + " " + (++a)); } }  // 10 10 12`),
5: `<b>Control statements</b> decide the order of execution.<br><b>1. Selection:</b> <i>if</i>, <i>if-else</i>, <i>else-if ladder</i>, nested if, <i>switch</i> (case, break, default).<br><b>2. Iteration (loops):</b> <i>while</i> (entry-controlled), <i>do-while</i> (exit-controlled, runs at least once), <i>for</i>, enhanced <i>for-each</i> (arrays/collections).<br><b>3. Jump:</b> <i>break</i> (exit loop/switch), <i>continue</i> (skip to next iteration), <i>return</i> (exit method).` + C(`class Control { public static void main(String a[]){
  int n = 7;
  if(n%2==0) System.out.println("Even"); else System.out.println("Odd");
  switch(n){ case 1: System.out.println("One"); break;
             default: System.out.println("Other"); }
  for(int i=1;i<=5;i++){ if(i==3) continue; System.out.print(i+" "); }  // 1 2 4 5
  int i=1; while(i<=3){ System.out.print(i); i++; }                   // 123
  do { i--; } while(i>0);
  int arr[]={10,20}; for(int x: arr) System.out.print(" "+x); } }`) + `<b>Output:</b> Odd ★ Other ★ 1 2 4 5 123 10 20.`,
6: `<b>A) Class:</b> user-defined blueprint containing fields and methods; <b>object:</b> instance of a class created with <i>new</i>, has state, behaviour and identity. Syntax: <i>class Student { … }</i>, <i>Student s = new Student();</i><br><b>B) Constructor:</b> special method with class name, no return type, called automatically by <i>new</i> to initialise the object; types: default and parameterised.<br><b>Method:</b> block of code performing a task: <i>returnType name(parameters) { body }</i>.<br><b>Access control:</b>` + T([['Modifier', 'Class', 'Package', 'Subclass', 'World'], ['private', 'Y', 'N', 'N', 'N'], ['default', 'Y', 'Y', 'N', 'N'], ['protected', 'Y', 'Y', 'Y', 'N'], ['public', 'Y', 'Y', 'Y', 'Y']]) + C(`class Student {
  private int roll; private String name;          // hidden data
  Student(int r, String n){ roll=r; name=n; }       // constructor
  public void display(){ System.out.println(roll+" "+name); }
}
class Main { public static void main(String a[]){
  Student s1 = new Student(1,"Ravi");  s1.display(); } }  // 1 Ravi`),
7: `<b>Method overloading:</b> same method name, different parameter list (number, type or order) in the same class; return type alone is not enough; compile-time polymorphism.<br><b>Constructor overloading:</b> a class with more than one constructor with different parameters, to create objects in different ways.` + C(`class Calc {
  int add(int a,int b){ return a+b; }
  double add(double a,double b){ return a+b; }
  int add(int a,int b,int c){ return a+b+c; }
}
class Box {
  int l,w;
  Box(){ l=w=1; }                 // default
  Box(int s){ l=w=s; }            // one arg
  Box(int l,int w){ this.l=l; this.w=w; }
  int area(){ return l*w; }
}
class Test { public static void main(String a[]){
  Calc c=new Calc(); System.out.println(c.add(2,3)+" "+c.add(2.5,1.5)+" "+c.add(1,2,3));
  System.out.println(new Box().area()+" "+new Box(4).area()+" "+new Box(2,5).area()); } }`) + `<b>Output:</b> 5 4.0 6 ★ 1 16 10.` + T([['Method overloading', 'Constructor overloading'], ['many methods, same name', 'many constructors'], ['has return type', 'no return type'], ['called explicitly by name', 'called by new'], ['performs different operations', 'initialises objects differently']]),
8: `<b>this keyword</b> (refers to the current object): (1) distinguish instance variables from parameters — <i>this.x = x</i> ★ (2) call another constructor of the same class — <i>this(…)</i> (first statement) ★ (3) call current-class method — <i>this.show()</i> ★ (4) pass/return the current object.<br><b>super keyword</b> (refers to the immediate parent): (1) access parent variable hidden by child — <i>super.x</i> ★ (2) call parent method that is overridden — <i>super.show()</i> ★ (3) call parent constructor — <i>super(…)</i> (first statement in child constructor).` + C(`class Parent {
  int x = 10;
  Parent(){ System.out.println("Parent constructor"); }
  void show(){ System.out.println("Parent show"); }
}
class Child extends Parent {
  int x = 20;
  Child(){ super(); System.out.println("Child constructor"); }
  void show(){ super.show(); System.out.println("Child show"); }
  void print(int x){
    System.out.println(x+" "+this.x+" "+super.x); }   // 30 20 10
  public static void main(String a[]){
    Child c = new Child(); c.show(); c.print(30); } }`),
9: `<b>Inner (nested) class:</b> class defined inside another class; used for logical grouping, encapsulation and readable event handling; inner class can access outer members (even private).<br><b>1. Member (non-static) inner class:</b> inside class, outside methods; object: <i>Outer.Inner in = out.new Inner();</i><br><b>2. Static nested class:</b> declared static; accesses only static members of outer; <i>Outer.Nested n = new Outer.Nested();</i><br><b>3. Local inner class:</b> defined inside a method; visible only there.<br><b>4. Anonymous inner class:</b> class without a name, declared and instantiated at once — used for event listeners and interfaces.` + C(`class Outer {
  private int x = 5; static int y = 7;
  class Inner { void show(){ System.out.println("Member "+x); } }
  static class Nested { void show(){ System.out.println("Static "+y); } }
  void method(){
    class Local { void show(){ System.out.println("Local "+x); } }
    new Local().show(); }
  public static void main(String a[]){
    Outer o = new Outer();
    o.new Inner().show(); new Nested().show(); o.method();
    Runnable r = new Runnable(){ public void run(){ System.out.println("Anonymous"); } };
    r.run(); } }`),
10: `<b>String:</b> class in java.lang representing a sequence of characters; created as literal (<i>String s="Java";</i> stored in String constant pool) or with <i>new String("Java")</i> (heap).<br><b>Immutability:</b> a String object cannot be changed; operations like concat create a new object. Reasons: security, thread safety, string pool sharing, hashcode caching. For changeable strings use <b>StringBuffer</b> (synchronized) / <b>StringBuilder</b>.<br><b>Methods:</b> length(), charAt(i), substring(b,e), indexOf(), toUpperCase(), toLowerCase(), trim(), replace(a,b), equals(), equalsIgnoreCase(), compareTo(), concat(), split(), contains(), startsWith().` + C(`class Str { public static void main(String a[]){
  String s = "Hello Java";
  System.out.println(s.length());           // 10
  System.out.println(s.charAt(1));          // e
  System.out.println(s.substring(6));       // Java
  System.out.println(s.toUpperCase());      // HELLO JAVA
  System.out.println(s.indexOf("J"));       // 6
  System.out.println(s.replace('a','o'));   // Hello Jovo
  System.out.println("abc".compareTo("abd"));  // -1
  String t = s.concat("!");  System.out.println(s+" | "+t);  // s unchanged
  StringBuffer sb = new StringBuffer("Hi"); sb.append(" All"); System.out.println(sb); } }`) + `<b>== vs equals():</b> == compares references, equals() compares content.`,
},
2: {
1: `{{inh}}<b>Inheritance:</b> mechanism by which one class (subclass) acquires the fields and methods of another (superclass) using <i>extends</i>; gives code reuse and IS-A relationship.<br><b>Forms:</b> <b>Single</b> — B extends A ★ <b>Multilevel</b> — C extends B, B extends A ★ <b>Hierarchical</b> — B and C extend A ★ <b>Multiple</b> — not supported with classes (diamond problem), achieved with interfaces ★ <b>Hybrid</b> — combination, through interfaces.` + C(`class A { void a(){ System.out.println("A"); } }
class B extends A { void b(){ System.out.println("B"); } }      // single
class C extends B { void c(){ System.out.println("C"); } }      // multilevel
class D extends A { void d(){ System.out.println("D"); } }      // hierarchical
interface I1 { void x(); }  interface I2 { void y(); }
class E implements I1, I2 { public void x(){} public void y(){} } // multiple
class Main { public static void main(String s[]){
  C obj = new C(); obj.a(); obj.b(); obj.c(); new D().a(); } }`) + `<b>Output:</b> A B C A.`,
2: `<b>Superclass:</b> the class whose members are inherited (parent/base). <b>Subclass:</b> class that inherits using <i>extends</i> and may add or override members (child/derived).<br><b>Subtype:</b> a type B is a subtype of A if B can be used wherever A is expected (subclass that keeps parent's behaviour).<br><b>Substitutability (Liskov principle):</b> a superclass reference can hold a subclass object and the program still works: <i>Animal a = new Dog();</i>` + C(`class Shape { double area(){ return 0; } }
class Circle extends Shape { double r=2; double area(){ return 3.14*r*r; } }
class Test { static void print(Shape s){ System.out.println(s.area()); }
  public static void main(String a[]){ print(new Shape()); print(new Circle()); } }  // 0.0 12.56`) +
`<b>Benefits:</b> software reusability ★ code sharing ★ consistency of interface ★ rapid prototyping ★ polymorphism and frameworks ★ information hiding.<br><b>Limitations (costs):</b> execution speed (dynamic dispatch) ★ larger program size ★ message-passing overhead ★ program complexity (deep hierarchies hard to understand) ★ tight coupling — change in superclass affects all subclasses ★ no multiple inheritance of classes.`,
3: `<b>1. Specialization:</b> subclass is a special case of parent, keeps all behaviour and overrides some — <i>class Car extends Vehicle</i> (most common, true subtype).<br><b>2. Specification:</b> parent only specifies behaviour, subclass implements it — abstract class / interface: <i>abstract class Shape { abstract double area(); }</i>, <i>class Square extends Shape</i>.<br><b>3. Construction:</b> subclass reuses parent's code without being a subtype — <i>class Stack extends Vector</i> (Stack is not really a Vector).<br><b>4. Extension:</b> subclass adds new features without changing inherited ones — <i>class ColoredWindow extends Window { setColor() }</i>.<br><b>5. Limitation:</b> subclass restricts parent behaviour, e.g. overriding a method to disallow it — <i>class ReadOnlyList extends ArrayList { public boolean add(Object o){ throw new UnsupportedOperationException(); } }</i>.<br><b>6. Combination:</b> features from more than one parent — <i>class TeachingAssistant extends Student implements Teacher</i>.` + C(`abstract class Shape { abstract double area(); }        // specification
class Square extends Shape { double s=3; double area(){ return s*s; } }
class Vehicle { void move(){ System.out.println("moving"); } }
class Car extends Vehicle { void move(){ System.out.println("car moving"); } } // specialization
class SportsCar extends Car { void turbo(){ System.out.println("turbo"); } }  // extension`) + `<b>Note:</b> specialization and specification give good subtypes; construction and limitation break substitutability.`,
4: `<b>Polymorphism</b> = one name, many forms. Here: <b>constructor overloading</b> (compile time), <b>method overloading</b> (compile time) and <b>method overriding</b> with dynamic dispatch (run time).` + C(`class Shape {
  String name;
  Shape(){ name = "Shape"; }                 // constructor polymorphism
  Shape(String n){ name = n; }
  double area(){ return 0; }
  void info(){ System.out.println(name); }
  void info(String msg){ System.out.println(name+": "+msg); }  // overloading
}
class Rect extends Shape {
  double l, b;
  Rect(double l, double b){ super("Rectangle"); this.l=l; this.b=b; }
  double area(){ return l*b; }               // overriding
}
class Circle extends Shape {
  double r;
  Circle(double r){ super("Circle"); this.r=r; }
  double area(){ return 3.14*r*r; }
}
class PolyDemo { public static void main(String a[]){
  Shape s[] = { new Shape(), new Rect(4,5), new Circle(1) };
  for(Shape x : s){ x.info(); System.out.println("Area = "+x.area()); }
  s[1].info("overloaded method"); } }`) + `<b>Output:</b> Shape Area = 0.0 ★ Rectangle Area = 20.0 ★ Circle Area = 3.14 ★ Rectangle: overloaded method.<br><b>Explanation:</b> different constructors build objects differently; the same call x.area() runs the method of the actual object type (dynamic method dispatch).`,
5: `<b>final</b> keyword means "cannot be changed".<br><b>1. final variable:</b> value assigned once — constant: <i>final double PI = 3.14;</i> (blank final must be set in constructor; static final = class constant).<br><b>2. final method:</b> cannot be <b>overridden</b> by subclasses — protects behaviour, allows early (static) binding.<br><b>3. final class:</b> cannot be <b>inherited</b> (extended), e.g. String, Integer, Math.` + C(`final class Constants { static final int MAX = 100; }
// class X extends Constants {}        // error: cannot inherit final class
class Bank {
  final double RATE = 7.5;             // final variable
  final void show(){ System.out.println("Rate "+RATE); }  // final method
}
class SBI extends Bank {
  // void show(){}                     // error: cannot override final method
  void test(){ /* RATE = 8; error: cannot assign final variable */ show(); }
  public static void main(String a[]){ new SBI().test(); System.out.println(Constants.MAX); } }`) + `<b>Output:</b> Rate 7.5 ★ 100.<br><b>Role in inheritance:</b> final prevents overriding (methods) and inheritance (classes), giving security and efficiency.`,
6: `<b>Polymorphism:</b> ability of one entity to take many forms. <b>Compile-time</b> — method/constructor overloading. <b>Run-time</b> — method overriding.<br><b>Method overriding:</b> subclass gives its own implementation of a parent method with same name, parameters and return type (covariant allowed); cannot reduce access; static, final and private methods cannot be overridden; <i>@Override</i> annotation.<br><b>Dynamic method dispatch:</b> the call to an overridden method is resolved at <b>run time</b> based on the actual object, not the reference type — a superclass reference can refer to subclass objects.` + C(`class Bank { double rate(){ return 0; } }
class SBI extends Bank { @Override double rate(){ return 7.5; } }
class HDFC extends Bank { @Override double rate(){ return 8.0; } }
class Dispatch { public static void main(String a[]){
  Bank b;                    // superclass reference
  b = new SBI();  System.out.println("SBI  "+b.rate());
  b = new HDFC(); System.out.println("HDFC "+b.rate()); } }`) + `<b>Output:</b> SBI 7.5 ★ HDFC 8.0.` + T([['Overloading', 'Overriding'], ['same class', 'parent and child'], ['different parameters', 'same signature'], ['compile time', 'run time'], ['return type may differ', 'same / covariant']]),
7: `<b>Abstract class:</b> class declared with <i>abstract</i>; cannot be instantiated; may contain abstract methods (no body) and concrete methods; subclasses must implement all abstract methods or be abstract.<br><b>Features:</b> can have constructors, fields, static and final methods ★ abstract method: <i>abstract void draw();</i> ★ reference variable allowed: <i>Shape s = new Circle();</i><br><b>Advantages:</b> abstraction (hides details) ★ common base code reused ★ forces subclasses to follow a template ★ supports run-time polymorphism.` + C(`abstract class Shape {
  String color = "Red";
  abstract double area();                  // abstract method
  void show(){ System.out.println(color+" area = "+area()); }
}
class Circle extends Shape { double r=2; double area(){ return 3.14*r*r; } }
class Square extends Shape { double s=3; double area(){ return s*s; } }
class Main { public static void main(String a[]){
  Shape s1 = new Circle(), s2 = new Square(); s1.show(); s2.show(); } }`) + `<b>Output:</b> Red area = 12.56 ★ Red area = 9.0.` + T([['Abstract class', 'Concrete class'], ['declared abstract', 'no abstract keyword'], ['cannot create objects', 'objects can be created'], ['may have abstract methods', 'all methods have body'], ['incomplete, used as base', 'complete implementation']]),
8: `<b>Object class</b> (java.lang.Object) is the root superclass of every Java class; every class implicitly extends Object, so its methods are available in all objects.` + T([['Method', 'Purpose'], ['toString()', 'string form of object (ClassName@hash by default)'], ['equals(Object)', 'compare objects (default ==)'], ['hashCode()', 'integer hash code; equal objects → equal hash'], ['getClass()', 'runtime class of object'], ['clone()', 'copy of object (Cloneable)'], ['finalize()', 'called by GC before destruction (deprecated)'], ['wait(), notify(), notifyAll()', 'inter-thread communication']]) + C(`class Student {
  int id; String name;
  Student(int i, String n){ id=i; name=n; }
  public String toString(){ return id+" "+name; }
  public boolean equals(Object o){ return (o instanceof Student) && ((Student)o).id==id; }
  public int hashCode(){ return id; }
}
class Test { public static void main(String a[]){
  Student s1=new Student(1,"Ravi"), s2=new Student(1,"Ravi");
  System.out.println(s1);                         // 1 Ravi
  System.out.println(s1.equals(s2)+" "+(s1==s2)); // true false
  System.out.println(s1.getClass().getName());    // Student
  System.out.println(s1.hashCode()); } }          // 1`),
9: `<b>Package:</b> group of related classes and interfaces (a folder); avoids name conflicts, gives access protection and easy maintenance. Built-in (java.lang, java.util, java.io) and user-defined.<br><b>1. Defining:</b> first statement of the file: <i>package mypack;</i><br><b>2. Creating:</b> save in folder mypack; compile with <i>javac -d . Calc.java</i> (-d creates the folder).<br><b>3. Accessing/Importing:</b> <i>import mypack.Calc;</i> (one class) or <i>import mypack.*;</i> (all) or fully qualified <i>mypack.Calc c = new mypack.Calc();</i> — class and members must be public.` + C(`// File: mypack/Calc.java
package mypack;
public class Calc { public int add(int a,int b){ return a+b; } }

// File: Test.java
import mypack.Calc;
class Test { public static void main(String a[]){
  Calc c = new Calc(); System.out.println(c.add(5,3)); } }   // 8`) + `<b>Run:</b> javac -d . Calc.java ★ javac Test.java ★ java Test.<br><b>CLASSPATH:</b> environment variable telling the JVM and compiler where to find classes and packages (directories / JAR files). Set: <i>set CLASSPATH=.;C:\\myclasses</i> (Windows) or <i>export CLASSPATH=.:/home/myclasses</i>, or use <i>java -cp</i>. "." = current folder.`,
10: `<b>Interface:</b> reference type containing abstract methods and constants (Java 8+: default and static methods); defines a contract; supports multiple inheritance and full abstraction.<br><b>Define:</b> <i>interface Shape { double PI = 3.14; double area(); }</i> ★ <b>Implement:</b> <i>class Circle implements Shape { public double area(){…} }</i> — methods must be public; class must implement all methods or be abstract.<br><b>Interface variables:</b> implicitly <i>public static final</i> (constants), must be initialised.<br><b>Extending interfaces:</b> an interface can extend one or more interfaces: <i>interface B extends A, C</i>.` + C(`interface Printable { void print(); }
interface Showable extends Printable { int MAX = 10; void show(); }   // extending
class Doc implements Showable {
  public void print(){ System.out.println("Print"); }
  public void show(){ System.out.println("Show "+MAX); }
}
class Test { public static void main(String a[]){
  Showable d = new Doc(); d.print(); d.show(); } }   // Print  Show 10`) + T([['Class', 'Interface'], ['class keyword', 'interface keyword'], ['can be instantiated', 'cannot be instantiated'], ['concrete methods', 'abstract (+default/static)'], ['any variables', 'public static final only'], ['extends one class', 'implements many interfaces'], ['has constructors', 'no constructors']]),
},
3: {
1: `<b>Exception:</b> abnormal event at run time that disrupts normal flow (divide by zero, file not found). <b>Exception handling:</b> mechanism to catch and handle run-time errors so the program continues normally.<br><b>Concepts:</b> when an error occurs the JVM creates an exception object and <b>throws</b> it ★ the runtime searches the call stack for a matching handler (<i>catch</i>) ★ if none, the default handler prints the stack trace and terminates. Keywords: try, catch, throw, throws, finally.<br><b>Advantages:</b> separates error-handling code from normal code ★ program does not terminate abruptly ★ propagates errors up the call stack ★ groups error types by class hierarchy ★ meaningful messages, reliable (robust) software.` + C(`class Demo { public static void main(String a[]){
  try {
    int x = 10 / 0;                      // throws ArithmeticException
    System.out.println(x);
  } catch(ArithmeticException e){
    System.out.println("Error: " + e.getMessage());
  } finally { System.out.println("Finally runs"); }
  System.out.println("Program continues"); } }`) + `<b>Output:</b> Error: / by zero ★ Finally runs ★ Program continues.<br><b>Importance:</b> without handling, the program would stop at 10/0; with handling it recovers and keeps running.`,
2: `{{exc}}<b>Termination model:</b> after an exception, control goes to the handler and does <b>not return</b> to the point where the error occurred; the block is abandoned and execution continues after the handler — <b>Java (and C++) use this model</b>.<br><b>Resumptive model:</b> the handler fixes the problem and control <b>resumes</b> at the point of error (re-executes the failing statement); costly and complex, rarely used (can be simulated in Java with a loop around try).` + C(`boolean done = false;
while(!done){                     // simulating resumption
  try { int r = 10 / d; done = true; }
  catch(ArithmeticException e){ d = 1; }   // fix and retry
}`) + `<b>Exception hierarchy:</b> <b>Throwable</b> (root) → <b>Exception</b> (recoverable: IOException, SQLException, ClassNotFoundException — checked; <b>RuntimeException</b>: ArithmeticException, NullPointerException, ArrayIndexOutOfBoundsException, NumberFormatException — unchecked) and <b>Error</b> (serious, not handled by programs: OutOfMemoryError, StackOverflowError, VirtualMachineError).`,
3: `<b>try:</b> encloses code that may throw an exception; must be followed by catch or finally.<br><b>catch:</b> handles a specific exception type; multiple catch blocks allowed (sub-class before super-class); Java 7 multi-catch <i>catch(A | B e)</i>.<br><b>throw:</b> explicitly throws one exception object: <i>throw new ArithmeticException("msg");</i><br><b>throws:</b> in method signature, declares exceptions the method may pass to the caller: <i>void read() throws IOException</i>.<br><b>finally:</b> always executes (exception or not) — closing files, releasing resources.` + C(`class KeyDemo {
  static void check(int age) throws Exception {          // throws
    if(age < 18) throw new Exception("Not eligible");     // throw
    System.out.println("Eligible");
  }
  public static void main(String a[]){
    try {                                                  // try
      int arr[] = new int[3]; arr[5] = 10;
    } catch(ArrayIndexOutOfBoundsException e){            // catch
      System.out.println("Index error");
    } finally { System.out.println("finally 1"); }         // finally
    try { check(15); }
    catch(Exception e){ System.out.println(e.getMessage()); }
    finally { System.out.println("finally 2"); } } }`) + `<b>Output:</b> Index error ★ finally 1 ★ Not eligible ★ finally 2.` + T([['throw', 'throws'], ['inside method body', 'in method signature'], ['throws one object', 'declares many classes'], ['followed by instance', 'followed by class names']]),
4: `<b>Built-in exceptions:</b> predefined classes in java.lang/java.io etc.` + T([['Exception', 'Cause'], ['ArithmeticException', 'divide by zero'], ['ArrayIndexOutOfBoundsException', 'invalid array index'], ['NullPointerException', 'using a null reference'], ['NumberFormatException', 'Integer.parseInt("abc")'], ['ClassCastException', 'invalid type cast'], ['StringIndexOutOfBounds', 'bad string index'], ['IOException', 'input/output failure'], ['FileNotFoundException', 'file missing'], ['ClassNotFoundException', 'class not found at runtime'], ['InterruptedException', 'thread interrupted']]) +
`<b>Checked exceptions:</b> checked at <b>compile time</b>; must be handled with try-catch or declared with throws; subclasses of Exception except RuntimeException — IOException, SQLException, ClassNotFoundException.<br><b>Unchecked exceptions:</b> not checked by compiler, occur at run time due to programming errors; RuntimeException and its subclasses (and Errors) — ArithmeticException, NullPointerException.` + C(`import java.io.*;
class CheckDemo { public static void main(String a[]){
  try { FileReader f = new FileReader("x.txt"); }      // checked: must handle
  catch(FileNotFoundException e){ System.out.println("File not found"); }
  try { String s = null; s.length(); }                 // unchecked
  catch(NullPointerException e){ System.out.println("Null pointer"); } } }`),
5: `<b>User-defined (custom) exception:</b> exception class created by the programmer for application-specific errors (e.g. InsufficientBalance, InvalidAge).<br><b>Procedure:</b> (1) create a class that <b>extends Exception</b> (checked) or RuntimeException (unchecked) ★ (2) write a constructor that passes the message to <i>super(msg)</i> ★ (3) <b>throw</b> the object with <i>throw new MyException("msg")</i> when the condition occurs ★ (4) declare with <i>throws</i> and <b>handle</b> in try-catch.` + C(`class InsufficientBalanceException extends Exception {
  InsufficientBalanceException(String msg){ super(msg); }
}
class Account {
  double balance = 5000;
  void withdraw(double amt) throws InsufficientBalanceException {
    if(amt > balance)
      throw new InsufficientBalanceException("Insufficient balance: "+balance);
    balance -= amt;
    System.out.println("Withdrawn "+amt+", balance "+balance);
  }
}
class Bank { public static void main(String a[]){
  Account ac = new Account();
  try { ac.withdraw(2000); ac.withdraw(4000); }
  catch(InsufficientBalanceException e){ System.out.println("Error: "+e.getMessage()); } } }`) + `<b>Output:</b> Withdrawn 2000.0, balance 3000.0 ★ Error: Insufficient balance: 3000.0.<br><b>Advantages:</b> meaningful, business-specific error messages and clean handling.`,
6: `<b>Multithreading:</b> executing two or more threads (lightweight sub-processes) concurrently within a single program, sharing the same memory; each thread is a separate path of execution. Java supports it with Thread class and Runnable interface.<br><b>Multitasking:</b> executing multiple tasks at the same time — process-based (several programs: browser + music) or thread-based (multithreading).` + T([['Multithreading', 'Multitasking (process-based)'], ['many threads in one program', 'many programs/processes'], ['threads share memory', 'separate memory per process'], ['lightweight, cheap switching', 'heavyweight, costly switching'], ['inter-thread communication easy', 'inter-process communication costly'], ['e.g. editor: typing + spell check', 'e.g. browser + media player']]) +
`<b>Advantages:</b> better CPU utilisation (no idle time) ★ responsive applications (GUI not frozen) ★ resource sharing, less memory ★ faster execution on multi-core processors ★ simpler modelling of concurrent tasks (servers, games, animations) ★ independent threads — an exception in one does not stop others.` + C(`class T extends Thread { public void run(){ for(int i=1;i<=3;i++) System.out.println(getName()+" "+i); } }
class Demo { public static void main(String a[]){ new T().start(); new T().start(); } }`),
7: `{{life}}<b>Thread life cycle states:</b><br><b>1. New:</b> thread object created (<i>new Thread()</i>), not started ★ <b>2. Runnable:</b> after <i>start()</i>, ready and waiting for CPU ★ <b>3. Running:</b> scheduler picks it, <i>run()</i> executes ★ <b>4. Blocked / Waiting / Timed waiting:</b> paused by <i>sleep()</i>, <i>wait()</i>, <i>join()</i>, I/O or lock; returns to Runnable after notify/time-out ★ <b>5. Terminated (Dead):</b> run() completes or exception.<br><b>Thread methods:</b>` + T([['Method', 'Use'], ['start()', 'starts thread, calls run()'], ['run()', 'code executed by thread'], ['sleep(ms)', 'pauses for given time'], ['join()', 'waits for thread to die'], ['yield()', 'gives chance to other threads'], ['isAlive()', 'checks if running'], ['setPriority()/getPriority()', 'priority 1–10'], ['setName()/getName()', 'thread name'], ['wait()/notify()', 'communication'], ['interrupt()', 'interrupts thread']]) + C(`class T extends Thread { public void run(){
  try { for(int i=1;i<=3;i++){ System.out.println(i); Thread.sleep(500); } }
  catch(InterruptedException e){} } }
class Life { public static void main(String a[]) throws Exception {
  T t = new T();  System.out.println(t.isAlive());   // New: false
  t.start(); t.join(); System.out.println(t.isAlive()); } }  // Terminated: false`),
8: `<b>Two ways to create a thread:</b><br><b>1. Extending Thread class:</b> create a class that extends Thread, override <i>run()</i>, create object and call <i>start()</i>.<br><b>2. Implementing Runnable interface:</b> implement <i>run()</i> of Runnable, pass object to a Thread constructor <i>new Thread(r)</i>, call start(). Preferred because the class can still extend another class.` + C(`// Method 1: extending Thread
class MyThread extends Thread {
  public void run(){
    for(int i=1;i<=3;i++) System.out.println("Thread A: "+i); }
}
// Method 2: implementing Runnable
class MyRunnable implements Runnable {
  public void run(){
    for(int i=1;i<=3;i++) System.out.println("Thread B: "+i); }
}
class CreateDemo { public static void main(String a[]){
  MyThread t1 = new MyThread();
  Thread t2 = new Thread(new MyRunnable());
  t1.start(); t2.start();
  System.out.println("Main thread"); } }`) + `<b>Output:</b> lines of Thread A and Thread B interleaved (order depends on scheduler) and "Main thread".` + T([['Extending Thread', 'Implementing Runnable'], ['cannot extend other class', 'can extend another class'], ['each thread a separate object', 'one object shared by threads'], ['less flexible', 'more flexible, preferred']]) + `<b>Note:</b> calling run() directly does not create a new thread; start() does.`,
9: `<b>Synchronization:</b> controlling access of multiple threads to a shared resource so that only <b>one thread at a time</b> uses it.<br><b>Need:</b> without it threads interleave and corrupt shared data (race condition) — e.g. two threads updating one bank balance. Achieved with a <b>monitor/lock</b>: <i>synchronized</i> method or <i>synchronized(obj){…}</i> block.` + C(`class Counter {
  int count = 0;
  synchronized void inc(){ count++; }      // one thread at a time
}`) + `<b>Inter-thread communication:</b> threads cooperate using Object methods inside synchronized code: <b>wait()</b> — release lock and wait ★ <b>notify()</b> — wake one waiting thread ★ <b>notifyAll()</b> — wake all. Used in producer–consumer problem.` + C(`class Q {
  int n; boolean set = false;
  synchronized void put(int v) throws InterruptedException {
    while(set) wait();  n = v; set = true;
    System.out.println("Put: "+v); notify(); }
  synchronized void get() throws InterruptedException {
    while(!set) wait();
    System.out.println("Got: "+n); set = false; notify(); }
}
class PC { public static void main(String a[]){
  Q q = new Q();
  new Thread(() -> { try{ for(int i=1;i<=3;i++) q.put(i);}catch(Exception e){} }).start();
  new Thread(() -> { try{ for(int i=1;i<=3;i++) q.get();}catch(Exception e){} }).start(); } }`) + `<b>Output:</b> Put: 1 Got: 1 Put: 2 Got: 2 Put: 3 Got: 3.`,
10: `<b>Thread priorities:</b> integer 1–10 used by the scheduler to decide which thread runs first; constants <i>MIN_PRIORITY = 1</i>, <i>NORM_PRIORITY = 5</i> (default), <i>MAX_PRIORITY = 10</i>; methods <i>setPriority(int)</i>, <i>getPriority()</i>. Higher priority gets preference (platform dependent). Use: urgent tasks (UI) high, background tasks low.<br><b>Thread groups:</b> <i>ThreadGroup</i> collects threads into one unit so they can be managed together (interrupt, set max priority, list); <i>new Thread(group, runnable, "name")</i>. Use: server managing many client threads.<br><b>Daemon threads:</b> low-priority background service threads that serve user threads; JVM exits when only daemon threads remain; <i>setDaemon(true)</i> before start(), <i>isDaemon()</i>. Example: garbage collector. Use: auto-save, monitoring.` + C(`class Task extends Thread {
  Task(ThreadGroup g, String n){ super(g, n); }
  public void run(){ System.out.println(getName()+" priority "+getPriority()
      +" daemon "+isDaemon()+" group "+getThreadGroup().getName()); }
}
class PDemo { public static void main(String a[]){
  ThreadGroup g = new ThreadGroup("Workers");
  Task t1 = new Task(g, "T1"), t2 = new Task(g, "T2");
  t1.setPriority(Thread.MAX_PRIORITY); t2.setPriority(Thread.MIN_PRIORITY);
  t2.setDaemon(true);
  t1.start(); t2.start();
  System.out.println("Active in group: "+g.activeCount()); } }`) + `<b>Output (sample):</b> T1 priority 10 daemon false group Workers ★ T2 priority 1 daemon true group Workers.`,
},
4: {
1: `<b>a) String class:</b> java.lang.String represents an <b>immutable</b> sequence of characters; created by literal (string pool) or <i>new</i>. Mutable alternatives: StringBuffer, StringBuilder.<br><b>String handling methods:</b>` + T([['Method', 'Example ("Java Lab")', 'Result'], ['length()', 's.length()', '8'], ['charAt(i)', 's.charAt(2)', 'v'], ['substring(b,e)', 's.substring(0,4)', 'Java'], ['indexOf()', 's.indexOf("L")', '5'], ['toUpperCase()', 's.toUpperCase()', 'JAVA LAB'], ['equals()/equalsIgnoreCase()', '"a".equals("A")', 'false'], ['compareTo()', '"b".compareTo("a")', '1'], ['concat()/+', 's.concat("!")', 'Java Lab!'], ['replace()', 's.replace("a","o")', 'Jovo Lob'], ['trim()', '" hi ".trim()', 'hi'], ['split()', 's.split(" ")', '[Java, Lab]']]) +
`<b>b) Object class methods</b> (root of all classes): <b>toString()</b> — string form ★ <b>equals()</b> — content comparison (override) ★ <b>hashCode()</b> — hash value ★ <b>getClass()</b> — runtime class ★ <b>clone()</b> — copy object ★ <b>finalize()</b> — before GC ★ <b>wait(), notify(), notifyAll()</b> — thread communication.` + C(`class P { int x=5; public String toString(){ return "P"+x; } }
class T { public static void main(String a[]){
  P p = new P(); System.out.println(p + " " + p.getClass().getName() + " " + p.equals(p)); } }  // P5 P true`),
2: `<b>java.util</b> package provides utility classes: the <b>Collections Framework</b>, date/time, random numbers, scanning input, etc.<br><b>Interfaces:</b> <b>Collection</b> (root) ★ <b>List</b> (ordered, duplicates — ArrayList, LinkedList, Vector, Stack) ★ <b>Set</b> (no duplicates — HashSet, LinkedHashSet, TreeSet sorted) ★ <b>Queue</b> (PriorityQueue, ArrayDeque) ★ <b>Map</b> (key–value — HashMap, TreeMap, Hashtable) ★ <b>Iterator</b>, Comparable, Comparator.<br><b>Utility classes:</b> <b>Scanner</b> (input) ★ <b>Random</b> ★ <b>Date, Calendar</b> ★ <b>Arrays</b> (sort, search) ★ <b>Collections</b> (sort, reverse, max) ★ <b>StringTokenizer</b>.` + C(`import java.util.*;
class UtilDemo { public static void main(String a[]){
  ArrayList<String> list = new ArrayList<>();
  list.add("C"); list.add("Java"); list.add("Python");
  Collections.sort(list); System.out.println(list);          // [C, Java, Python]
  HashSet<Integer> set = new HashSet<>(Arrays.asList(1,2,2,3));
  System.out.println(set);                                   // [1, 2, 3]
  HashMap<Integer,String> map = new HashMap<>();
  map.put(1,"Ravi"); map.put(2,"Sita"); System.out.println(map.get(2));  // Sita
  Iterator<String> it = list.iterator(); while(it.hasNext()) System.out.print(it.next()+" ");
  Random r = new Random(); System.out.println(r.nextInt(10));
  Scanner sc = new Scanner(System.in);   // int n = sc.nextInt();
  System.out.println(new Date()); } }`),
3: `{{streams}}<b>java.io</b> package provides classes for input and output through <b>streams</b> (sequence of data flowing from source to destination): files, console, network, memory.<br><b>Byte streams</b> (8-bit, binary data — images, audio): abstract classes <b>InputStream</b> (read()) and <b>OutputStream</b> (write()); FileInputStream, FileOutputStream, BufferedInputStream, BufferedOutputStream, DataInputStream, DataOutputStream, ObjectInputStream, PrintStream (System.out).<br><b>Character streams</b> (16-bit Unicode text): abstract classes <b>Reader</b> and <b>Writer</b>; FileReader, FileWriter, BufferedReader (readLine()), BufferedWriter, InputStreamReader, PrintWriter.` + C(`import java.io.*;
class IODemo { public static void main(String a[]) throws IOException {
  // byte stream: copy a file
  FileInputStream in = new FileInputStream("a.txt");
  FileOutputStream out = new FileOutputStream("b.txt");
  int c; while((c = in.read()) != -1) out.write(c);
  in.close(); out.close();
  // character stream: write and read text
  FileWriter fw = new FileWriter("c.txt"); fw.write("Hello Java"); fw.close();
  BufferedReader br = new BufferedReader(new FileReader("c.txt"));
  System.out.println(br.readLine()); br.close(); } }      // Hello Java`) + T([['Byte stream', 'Character stream'], ['8-bit bytes', '16-bit Unicode chars'], ['InputStream / OutputStream', 'Reader / Writer'], ['binary files', 'text files']]),
4: `<b>Event handling:</b> mechanism that controls what happens when an event occurs (button click, key press, mouse move); Java uses the delegation event model (java.awt.event package).<br><b>Event:</b> object describing a change of state in a source, e.g. ActionEvent when a button is clicked.<br><b>Event source:</b> object that generates the event (Button, TextField, Frame); registers listeners using <i>addTypeListener()</i>, e.g. addActionListener().<br><b>Event classes:</b> ActionEvent (button, menu), MouseEvent, KeyEvent, ItemEvent (checkbox, list), TextEvent, WindowEvent, AdjustmentEvent (scrollbar), FocusEvent — all subclass EventObject/AWTEvent.<br><b>Event listeners:</b> interfaces whose methods are called when an event occurs: ActionListener (actionPerformed), MouseListener, MouseMotionListener, KeyListener, ItemListener (itemStateChanged), WindowListener, FocusListener.` + C(`import java.awt.*; import java.awt.event.*;
class BtnDemo extends Frame implements ActionListener {
  TextField tf = new TextField(); Button b = new Button("Click");
  BtnDemo(){ setLayout(new FlowLayout()); add(tf); add(b);
    b.addActionListener(this);            // register listener
    setSize(300,200); setVisible(true); }
  public void actionPerformed(ActionEvent e){ tf.setText("Button clicked"); }
  public static void main(String a[]){ new BtnDemo(); } }`),
5: `{{deleg}}<b>Delegation Event Model:</b> modern Java event handling in which a <b>source</b> generates an event and <b>delegates</b> it to one or more registered <b>listeners</b> that process it; logic is separated from the UI.<br><b>Components:</b> <b>(1) Event source</b> — component that generates events (Button, TextField) and provides addXListener()/removeXListener() ★ <b>(2) Event object</b> — encapsulates information about the event (ActionEvent, MouseEvent; getSource()) ★ <b>(3) Event listener</b> — object implementing a listener interface, notified when the event occurs.<br><b>Working:</b> (1) listener registers with the source: <i>b.addActionListener(listener)</i> ★ (2) user acts (clicks) ★ (3) source creates an event object ★ (4) source calls the listener method (actionPerformed(e)) ★ (5) listener handles the event.<br><b>Advantages:</b> only registered listeners receive events (efficient) ★ separation of UI and logic ★ one source many listeners.` + C(`import java.awt.*; import java.awt.event.*;
class Deleg extends Frame {
  Label l = new Label("Waiting..."); Button b = new Button("OK");
  Deleg(){ setLayout(new FlowLayout()); add(b); add(l);
    b.addActionListener(new ActionListener(){
      public void actionPerformed(ActionEvent e){ l.setText("OK pressed"); } });
    setSize(250,150); setVisible(true); }
  public static void main(String a[]){ new Deleg(); } }`),
6: `<b>Mouse events</b> are generated by mouse actions and handled with <b>MouseEvent</b> class and two listeners.<br><b>MouseListener</b> methods: mouseClicked(MouseEvent e) ★ mousePressed(e) ★ mouseReleased(e) ★ mouseEntered(e) ★ mouseExited(e).<br><b>MouseMotionListener</b> methods: mouseMoved(e) ★ mouseDragged(e).<br><b>MouseWheelListener:</b> mouseWheelMoved(MouseWheelEvent e).<br><b>MouseEvent methods:</b> getX(), getY(), getPoint(), getClickCount(), getButton().` + C(`import java.awt.*; import java.awt.event.*;
class MouseDemo extends Frame implements MouseListener, MouseMotionListener {
  String msg = ""; int x, y;
  MouseDemo(){ addMouseListener(this); addMouseMotionListener(this);
    setSize(350,250); setVisible(true); }
  public void mouseClicked(MouseEvent e){ msg="Clicked"; x=e.getX(); y=e.getY(); repaint(); }
  public void mousePressed(MouseEvent e){ msg="Pressed"; repaint(); }
  public void mouseReleased(MouseEvent e){ msg="Released"; repaint(); }
  public void mouseEntered(MouseEvent e){ msg="Entered"; repaint(); }
  public void mouseExited(MouseEvent e){ msg="Exited"; repaint(); }
  public void mouseDragged(MouseEvent e){ msg="Dragging"; x=e.getX(); y=e.getY(); repaint(); }
  public void mouseMoved(MouseEvent e){ msg="Moving at "+e.getX()+","+e.getY(); repaint(); }
  public void paint(Graphics g){ g.drawString(msg, 50, 100); }
  public static void main(String a[]){ new MouseDemo(); } }`) + `<b>Output:</b> the window shows "Clicked", "Moving at x,y", "Dragging", etc. as the mouse acts.`,
7: `<b>Keyboard events</b> are generated when keys are pressed or released on a focused component; handled with <b>KeyEvent</b> class and <b>KeyListener</b> interface.<br><b>KeyListener methods:</b> <b>keyPressed(KeyEvent e)</b> — key goes down ★ <b>keyReleased(KeyEvent e)</b> — key goes up ★ <b>keyTyped(KeyEvent e)</b> — a character key is typed (pressed + released).<br><b>KeyEvent methods:</b> getKeyChar() (character), getKeyCode() (virtual key code), constants VK_ENTER, VK_A, VK_UP, getKeyText(code).<br><b>Steps:</b> implement KeyListener ★ register with <i>addKeyListener(this)</i> ★ give focus ★ write the three methods.` + C(`import java.awt.*; import java.awt.event.*;
class KeyDemo extends Frame implements KeyListener {
  String msg = ""; Label l = new Label("Type something");
  KeyDemo(){ setLayout(new FlowLayout()); add(l);
    addKeyListener(this); setSize(300,200); setVisible(true); }
  public void keyPressed(KeyEvent e){
    if(e.getKeyCode() == KeyEvent.VK_ENTER) l.setText("Enter pressed");
    else l.setText("Pressed: " + KeyEvent.getKeyText(e.getKeyCode())); }
  public void keyReleased(KeyEvent e){ setTitle("Released"); }
  public void keyTyped(KeyEvent e){ msg += e.getKeyChar(); repaint(); }
  public void paint(Graphics g){ g.drawString(msg, 40, 120); }
  public static void main(String a[]){ new KeyDemo(); } }`) + `<b>Output:</b> typed characters appear in the window; label shows the pressed key.`,
8: `<b>Adapter class:</b> abstract class in java.awt.event that provides <b>empty implementations</b> of all methods of a listener interface.<br><b>Need:</b> a listener interface forces us to write all its methods (MouseListener has 5) even if only one is needed; extending the adapter lets us override only the required method — less code, cleaner programs.` + T([['Adapter class', 'Listener interface'], ['MouseAdapter', 'MouseListener'], ['MouseMotionAdapter', 'MouseMotionListener'], ['KeyAdapter', 'KeyListener'], ['WindowAdapter', 'WindowListener'], ['FocusAdapter', 'FocusListener'], ['ComponentAdapter', 'ComponentListener']]) + C(`import java.awt.*; import java.awt.event.*;
class AdapterDemo extends Frame {
  Label l = new Label("Click or type");
  AdapterDemo(){ setLayout(new FlowLayout()); add(l);
    addMouseListener(new MouseAdapter(){                 // only mouseClicked
      public void mouseClicked(MouseEvent e){ l.setText("Clicked at "+e.getX()+","+e.getY()); } });
    addKeyListener(new KeyAdapter(){                     // only keyTyped
      public void keyTyped(KeyEvent e){ l.setText("Typed: "+e.getKeyChar()); } });
    addWindowListener(new WindowAdapter(){               // close window
      public void windowClosing(WindowEvent e){ System.exit(0); } });
    setSize(300,200); setVisible(true); }
  public static void main(String a[]){ new AdapterDemo(); } }`) + `<b>Note:</b> adapters are classes, so a class extending one cannot extend another — use anonymous inner classes as above.`,
9: `<b>Graphics programming:</b> drawing shapes, text and images on components (Frame, Applet, Panel) using the abstract class <b>java.awt.Graphics</b>; drawing is done in <i>paint(Graphics g)</i>, called automatically; <i>repaint()</i> redraws. Coordinates start at (0,0) top-left, in pixels.` + T([['Method', 'Draws'], ['drawLine(x1,y1,x2,y2)', 'line'], ['drawRect(x,y,w,h) / fillRect', 'rectangle'], ['drawRoundRect(x,y,w,h,aw,ah)', 'rounded rectangle'], ['drawOval(x,y,w,h) / fillOval', 'ellipse; circle if w = h'], ['drawArc(x,y,w,h,start,sweep)', 'arc (angles in degrees)'], ['fillArc(...)', 'filled pie'], ['drawPolygon(xs,ys,n)', 'polygon'], ['drawString(s,x,y)', 'text'], ['setColor(Color.RED)', 'drawing colour'], ['setFont(new Font(...))', 'font'], ['drawImage(img,x,y,obs)', 'image']]) + C(`import java.awt.*;
class Shapes extends Frame {
  Shapes(){ setSize(400,350); setVisible(true); }
  public void paint(Graphics g){
    g.drawLine(30,50,200,50);
    g.drawRect(30,70,100,60);   g.fillRect(150,70,60,60);
    g.drawOval(30,150,80,80);   // circle
    g.setColor(Color.BLUE); g.fillOval(130,150,100,60);
    g.drawArc(250,70,100,100,0,180);
    int xs[]={260,320,290}, ys[]={250,250,200}; g.drawPolygon(xs,ys,3);
    g.setFont(new Font("Arial",Font.BOLD,16)); g.drawString("Graphics Demo",120,300); }
  public static void main(String a[]){ new Shapes(); } }`),
10: `{{layout}}<b>Layout manager:</b> object that automatically arranges components in a container; set with <i>setLayout(manager)</i>.<br><b>FlowLayout</b> (default for Panel/Applet): components in a row left to right, wraps to next line; alignment LEFT/CENTER/RIGHT — <i>new FlowLayout(FlowLayout.LEFT)</i>.<br><b>BorderLayout</b> (default for Frame): 5 regions NORTH, SOUTH, EAST, WEST, CENTER — <i>add(b, BorderLayout.NORTH)</i>.<br><b>GridLayout:</b> rows × columns grid of equal cells — <i>new GridLayout(2,3)</i>.<br><b>CardLayout:</b> stack of cards, one visible at a time; next(), previous(), first(), show() — used for wizards/tabs.<br><b>GridBagLayout:</b> most flexible grid; components can span rows/columns with different sizes, controlled by <i>GridBagConstraints</i> (gridx, gridy, gridwidth, weightx, fill).` + C(`import java.awt.*;
class LayoutDemo extends Frame {
  LayoutDemo(){
    setLayout(new BorderLayout());
    add(new Button("North"), BorderLayout.NORTH); add(new Button("South"), BorderLayout.SOUTH);
    Panel p = new Panel(new GridLayout(2,2));
    for(int i=1;i<=4;i++) p.add(new Button("G"+i));
    add(p, BorderLayout.CENTER);
    Panel f = new Panel(new FlowLayout()); f.add(new Button("F1")); f.add(new Button("F2"));
    add(f, BorderLayout.EAST);
    setSize(400,300); setVisible(true); }
  public static void main(String a[]){ new LayoutDemo(); } }`),
},
5: {
1: `<b>Swing:</b> part of Java Foundation Classes (JFC), package <b>javax.swing</b>, used to build rich GUIs; built on top of AWT; components start with J (JFrame, JButton, JLabel).<br><b>Features:</b> <b>lightweight</b> — written in pure Java, not tied to OS peers ★ <b>platform-independent</b> look ★ <b>pluggable look and feel</b> (Metal, Nimbus, Windows) ★ rich components (JTable, JTree, JTabbedPane, JSlider) ★ <b>MVC</b> architecture ★ tooltips, icons, borders, double buffering ★ keyboard shortcuts and accessibility.<br><b>Advantages of Swing:</b> consistent appearance on all systems ★ more and more powerful components ★ customisable ★ better performance for complex GUIs.<br><b>Limitations of AWT:</b> AWT components are <b>heavyweight</b> (use native OS peers) ★ look differs on each platform ★ limited set of components (no tables, trees, tabbed panes) ★ no pluggable look and feel ★ less flexible, fewer features (no icons on buttons, tooltips).` + T([['AWT', 'Swing'], ['java.awt', 'javax.swing'], ['heavyweight', 'lightweight'], ['platform-dependent look', 'pluggable look and feel'], ['fewer components', 'rich components'], ['no MVC', 'follows MVC']]) + C(`import javax.swing.*;
class Hello { public static void main(String a[]){
  JFrame f = new JFrame("Swing"); f.add(new JLabel("Hello Swing"));
  f.setSize(250,150); f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); f.setVisible(true); } }`),
2: `{{mvc}}<b>MVC (Model–View–Controller)</b> is a design architecture that separates an application into three parts:<br><b>Model:</b> holds the <b>data and state</b> of the component and business logic; independent of the display; notifies views when data changes (e.g. ButtonModel holds pressed/selected state, TableModel holds table data).<br><b>View:</b> <b>visual representation</b> — how the data is displayed on screen; reads data from the model.<br><b>Controller:</b> handles <b>user input</b> (mouse, keyboard) and updates the model accordingly.<br><b>Working:</b> user acts on the view ★ controller interprets input and changes the model ★ model notifies the view ★ view refreshes to show new state.<br><b>In Swing:</b> view and controller are combined into a <b>UI delegate</b> (modified MVC / separable model architecture); e.g. JButton uses ButtonModel + ButtonUI; JTable uses TableModel; JList uses ListModel.<br><b>Advantages:</b> separation of concerns ★ same model can have many views ★ pluggable look and feel (change view without changing model) ★ easier maintenance and testing.` + C(`DefaultListModel<String> model = new DefaultListModel<>();   // Model
JList<String> view = new JList<>(model);                     // View
model.addElement("Java");   // change model -> view updates automatically`),
3: `<b>JFrame:</b> top-level window with title bar, borders, minimize/maximize/close buttons; extends java.awt.Frame; components are added to its content pane.<br><b>Constructors:</b> JFrame(), JFrame(String title). <b>Methods:</b> setTitle(), setSize(w,h), setVisible(true), setLayout(), add(comp), setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE), setLocation(), getContentPane(), setResizable().<br><b>JComponent:</b> abstract base class of all lightweight Swing components (JButton, JLabel, JTextField, JPanel…) except top-level containers; extends java.awt.Container.<br><b>JComponent features/methods:</b> setToolTipText() ★ setBorder() ★ setOpaque() ★ setFont(), setForeground(), setBackground() ★ setEnabled() ★ paintComponent(Graphics g) for custom drawing ★ double buffering, key bindings.` + C(`import javax.swing.*; import java.awt.*;
class MyPanel extends JComponent {               // custom JComponent
  protected void paintComponent(Graphics g){ g.drawOval(20,20,80,80); g.drawString("JComponent",30,130); }
}
class FrameDemo { public static void main(String a[]){
  JFrame f = new JFrame("JFrame Demo");          // JFrame
  JButton b = new JButton("OK"); b.setToolTipText("Click me");
  f.setLayout(new BorderLayout());
  f.add(b, BorderLayout.SOUTH); f.add(new MyPanel(), BorderLayout.CENTER);
  f.setSize(300,250); f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); f.setVisible(true); } }`) + T([['JFrame', 'JComponent'], ['top-level container', 'base class of components'], ['heavyweight window', 'lightweight'], ['has title bar', 'placed inside containers']]),
4: T([['Component', 'Constructors', 'Methods'], ['JLabel', 'JLabel(String), JLabel(Icon), JLabel(String, Icon, align)', 'setText(), getText(), setIcon()'], ['ImageIcon', 'ImageIcon(String file), ImageIcon(URL)', 'getIconWidth(), getImage()'], ['JTextField', 'JTextField(int cols), JTextField(String)', 'getText(), setText(), setEditable()'], ['JButton', 'JButton(String), JButton(Icon)', 'addActionListener(), setText()'], ['JCheckBox', 'JCheckBox(String), JCheckBox(String, boolean)', 'isSelected(), setSelected(), addItemListener()'], ['JRadioButton', 'JRadioButton(String)', 'isSelected(); grouped in ButtonGroup']]) +
`<b>JLabel</b> displays non-editable text/image ★ <b>ImageIcon</b> paints an image used as icon ★ <b>JTextField</b> single-line text input ★ <b>JButton</b> push button generating ActionEvent ★ <b>JCheckBox</b> on/off choice, many can be selected ★ <b>JRadioButton</b> only one selected in a ButtonGroup.` + C(`import javax.swing.*; import java.awt.*; import java.awt.event.*;
class Comps extends JFrame implements ActionListener {
  JTextField tf = new JTextField(12); JLabel out = new JLabel("Result");
  JCheckBox c1 = new JCheckBox("Java"), c2 = new JCheckBox("Python");
  JRadioButton m = new JRadioButton("Male"), f = new JRadioButton("Female");
  Comps(){ setLayout(new FlowLayout());
    add(new JLabel("Name:", new ImageIcon("user.png"), JLabel.LEFT)); add(tf);
    add(c1); add(c2); ButtonGroup g = new ButtonGroup(); g.add(m); g.add(f); add(m); add(f);
    JButton b = new JButton("Submit"); b.addActionListener(this); add(b); add(out);
    setSize(320,200); setDefaultCloseOperation(EXIT_ON_CLOSE); setVisible(true); }
  public void actionPerformed(ActionEvent e){
    out.setText(tf.getText()+" "+(c1.isSelected()?"Java ":"")+(c2.isSelected()?"Python ":"")
      +(m.isSelected()?"Male":f.isSelected()?"Female":"")); }
  public static void main(String a[]){ new Comps(); } }`),
5: `<b>JList:</b> displays a list of items from which the user selects one or more; generates <b>ListSelectionEvent</b> (ListSelectionListener — valueChanged()).<br>Constructors: JList(), JList(E[] items), JList(ListModel m). Methods: getSelectedValue(), getSelectedValuesList(), getSelectedIndex(), setSelectionMode(ListSelectionModel.SINGLE_SELECTION / SINGLE_INTERVAL_SELECTION / MULTIPLE_INTERVAL_SELECTION), setVisibleRowCount(); usually placed in a JScrollPane; dynamic items via DefaultListModel (addElement, removeElement).<br><b>JComboBox:</b> combination of text field and drop-down list; shows one item, user picks one (editable optional); generates ActionEvent / ItemEvent.<br>Constructors: JComboBox(), JComboBox(E[] items). Methods: addItem(), removeItem(), getSelectedItem(), getSelectedIndex(), setEditable(true), getItemCount().` + C(`import javax.swing.*; import java.awt.*;
class ListCombo extends JFrame {
  JLabel l = new JLabel("Select");
  ListCombo(){ setLayout(new FlowLayout());
    String langs[] = {"C","C++","Java","Python","JavaScript"};
    JList<String> list = new JList<>(langs);
    list.setSelectionMode(ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
    list.addListSelectionListener(e -> l.setText("List: "+list.getSelectedValuesList()));
    add(new JScrollPane(list));
    JComboBox<String> cb = new JComboBox<>(new String[]{"CSE","ECE","EEE","MECH"});
    cb.addActionListener(e -> l.setText("Branch: "+cb.getSelectedItem()));
    add(cb); add(l);
    setSize(350,220); setDefaultCloseOperation(EXIT_ON_CLOSE); setVisible(true); }
  public static void main(String a[]){ new ListCombo(); } }`) + T([['JList', 'JComboBox'], ['shows many items', 'shows one item (drop-down)'], ['multiple selection', 'single selection'], ['needs scroll pane', 'built-in popup'], ['not editable', 'can be editable']]),
6: `<b>JTabbedPane:</b> container that holds several panels, each shown as a <b>tab</b> with a title; only one tab's content visible at a time; saves space (settings dialogs, browsers).<br>Constructors: JTabbedPane(), JTabbedPane(int placement) — TOP, BOTTOM, LEFT, RIGHT. Methods: <b>addTab(String title, Component c)</b>, addTab(title, icon, comp, tip), insertTab(), removeTabAt(), setSelectedIndex(), getSelectedIndex(), getTabCount(); ChangeListener reports tab change.<br><b>JScrollPane:</b> lightweight container that adds horizontal and vertical <b>scroll bars</b> to a component larger than the visible area (text area, list, table, image).<br>Constructors: JScrollPane(Component c), JScrollPane(c, vsbPolicy, hsbPolicy). Policies: VERTICAL_SCROLLBAR_AS_NEEDED / ALWAYS / NEVER, HORIZONTAL_SCROLLBAR_AS_NEEDED… Methods: setViewportView(), setVerticalScrollBarPolicy().` + C(`import javax.swing.*; import java.awt.*;
class TabScroll extends JFrame {
  TabScroll(){
    JTabbedPane tp = new JTabbedPane();
    JPanel p1 = new JPanel(); p1.add(new JLabel("Name:")); p1.add(new JTextField(10));
    JPanel p2 = new JPanel(); p2.add(new JCheckBox("Java")); p2.add(new JCheckBox("Python"));
    JTextArea ta = new JTextArea(20, 30);
    for(int i=1;i<=50;i++) ta.append("Line "+i+"\\n");
    JScrollPane sp = new JScrollPane(ta,
        ScrollPaneConstants.VERTICAL_SCROLLBAR_ALWAYS,
        ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    tp.addTab("Personal", p1); tp.addTab("Skills", p2); tp.addTab("Notes", sp);
    add(tp); setSize(380,260); setDefaultCloseOperation(EXIT_ON_CLOSE); setVisible(true); }
  public static void main(String a[]){ new TabScroll(); } }`) + `<b>Output:</b> window with three tabs; the Notes tab shows a scrollable text area.`,
7: `<b>JTree:</b> displays <b>hierarchical data</b> as an expandable tree of nodes (file explorer, organisation chart). Nodes are <i>DefaultMutableTreeNode</i> objects; root node holds children added with add(). Constructors: JTree(TreeNode root), JTree(TreeModel m). Methods: getSelectionPath(), getLastSelectedPathComponent(), expandRow(), setRootVisible(); events: <b>TreeSelectionListener</b> (valueChanged), TreeExpansionListener.<br><b>JTable:</b> displays data in a <b>two-dimensional grid of rows and columns</b> (student records, reports); cells can be edited. Constructors: JTable(Object[][] data, Object[] columnNames), JTable(int rows, int cols), JTable(TableModel m) (DefaultTableModel — addRow(), removeRow()). Methods: getValueAt(r,c), setValueAt(), getSelectedRow(), getRowCount(); place in JScrollPane to show headers.` + C(`import javax.swing.*; import javax.swing.tree.*; import java.awt.*;
class TreeTable extends JFrame {
  TreeTable(){ setLayout(new GridLayout(1,2));
    DefaultMutableTreeNode root = new DefaultMutableTreeNode("College");
    DefaultMutableTreeNode cse = new DefaultMutableTreeNode("CSE");
    cse.add(new DefaultMutableTreeNode("Java")); cse.add(new DefaultMutableTreeNode("DBMS"));
    root.add(cse); root.add(new DefaultMutableTreeNode("ECE"));
    JTree tree = new JTree(root);
    tree.addTreeSelectionListener(e -> setTitle("Selected: "+tree.getLastSelectedPathComponent()));
    String cols[] = {"Roll","Name","Marks"};
    Object data[][] = {{1,"Ravi",85},{2,"Sita",92},{3,"Ram",78}};
    JTable table = new JTable(data, cols);
    add(new JScrollPane(tree)); add(new JScrollPane(table));
    setSize(500,220); setDefaultCloseOperation(EXIT_ON_CLOSE); setVisible(true); }
  public static void main(String a[]){ new TreeTable(); } }`) + T([['JTree', 'JTable'], ['hierarchical data', 'tabular data'], ['nodes and branches', 'rows and columns'], ['TreeModel', 'TableModel']]),
8: `<b>Menu basics:</b> menus give a list of commands at the top of a window. Hierarchy: <b>JMenuBar</b> → <b>JMenu</b> → <b>JMenuItem</b> (and sub-menus).` + T([['Class', 'Constructors', 'Key methods'], ['JMenuBar', 'JMenuBar()', 'add(JMenu); frame.setJMenuBar(mb)'], ['JMenu', 'JMenu(String)', 'add(item), addSeparator(), setMnemonic()'], ['JMenuItem', 'JMenuItem(String), JMenuItem(String, Icon)', 'addActionListener(), setAccelerator(), setEnabled()'], ['JCheckBoxMenuItem', 'JCheckBoxMenuItem(String, boolean)', 'getState(), setState(), isSelected()'], ['JRadioButtonMenuItem', 'JRadioButtonMenuItem(String)', 'isSelected(); grouped in ButtonGroup'], ['JSeparator', 'JSeparator(), JSeparator(int orientation)', 'divides items (menu.addSeparator())']]) + C(`import javax.swing.*; import java.awt.event.*;
class MenuDemo extends JFrame implements ActionListener {
  JLabel l = new JLabel("Choose a menu item", JLabel.CENTER);
  MenuDemo(){
    JMenuBar mb = new JMenuBar();
    JMenu file = new JMenu("File"), view = new JMenu("View");
    JMenuItem open = new JMenuItem("Open"), exit = new JMenuItem("Exit");
    open.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_O, InputEvent.CTRL_DOWN_MASK));
    open.addActionListener(this); exit.addActionListener(e -> System.exit(0));
    file.add(open); file.add(new JSeparator()); file.add(exit);
    JCheckBoxMenuItem bar = new JCheckBoxMenuItem("Status Bar", true);
    JRadioButtonMenuItem sm = new JRadioButtonMenuItem("Small"), lg = new JRadioButtonMenuItem("Large");
    ButtonGroup g = new ButtonGroup(); g.add(sm); g.add(lg);
    bar.addActionListener(this); sm.addActionListener(this); lg.addActionListener(this);
    view.add(bar); view.addSeparator(); view.add(sm); view.add(lg);
    mb.add(file); mb.add(view); setJMenuBar(mb); add(l);
    setSize(350,220); setDefaultCloseOperation(EXIT_ON_CLOSE); setVisible(true); }
  public void actionPerformed(ActionEvent e){ l.setText("Selected: "+e.getActionCommand()); }
  public static void main(String a[]){ new MenuDemo(); } }`),
9: `<b>Popup menu:</b> context menu that appears at the mouse position (usually on right-click) instead of in a menu bar; class <b>JPopupMenu</b>.<br><b>Steps:</b> (1) create <i>JPopupMenu pm = new JPopupMenu("Edit");</i> ★ (2) create JMenuItems and add them (pm.add(item), pm.addSeparator()) ★ (3) add ActionListener to each item ★ (4) add a MouseListener to the component; in mousePressed/mouseReleased check <i>e.isPopupTrigger()</i> (platform independent right-click) ★ (5) show it: <b>pm.show(e.getComponent(), e.getX(), e.getY())</b>. Shortcut: <i>comp.setComponentPopupMenu(pm)</i>.<br><b>Methods:</b> add(), addSeparator(), show(component, x, y), setVisible(), insert(), getComponentCount().` + C(`import javax.swing.*; import java.awt.*; import java.awt.event.*;
class PopupDemo extends JFrame implements ActionListener {
  JPopupMenu pm = new JPopupMenu("Edit");
  JTextArea ta = new JTextArea("Right-click here");
  PopupDemo(){
    String items[] = {"Cut","Copy","Paste"};
    for(String s : items){ JMenuItem mi = new JMenuItem(s); mi.addActionListener(this); pm.add(mi); }
    pm.addSeparator();
    JCheckBoxMenuItem bold = new JCheckBoxMenuItem("Bold"); bold.addActionListener(this); pm.add(bold);
    ta.addMouseListener(new MouseAdapter(){
      public void mousePressed(MouseEvent e){ show(e); }
      public void mouseReleased(MouseEvent e){ show(e); }
      void show(MouseEvent e){ if(e.isPopupTrigger()) pm.show(e.getComponent(), e.getX(), e.getY()); } });
    add(new JScrollPane(ta));
    setSize(320,220); setDefaultCloseOperation(EXIT_ON_CLOSE); setVisible(true); }
  public void actionPerformed(ActionEvent e){
    String c = e.getActionCommand();
    if(c.equals("Cut")) ta.cut(); else if(c.equals("Copy")) ta.copy();
    else if(c.equals("Paste")) ta.paste();
    else ta.setFont(ta.getFont().deriveFont(((JCheckBoxMenuItem)e.getSource()).isSelected()? Font.BOLD : Font.PLAIN)); }
  public static void main(String a[]){ new PopupDemo(); } }`) + `<b>Output:</b> right-clicking the text area shows Cut, Copy, Paste, a separator and Bold; choosing an item performs it.`,
10: `{{swing}}<b>Containers</b> hold components. <b>Top-level containers</b> (heavyweight, root of every GUI, have a root pane): <b>JFrame</b> (main window) ★ <b>JDialog</b> (dialog box, modal/modeless) ★ <b>JApplet</b> (deprecated) ★ <b>JWindow</b> (window without title bar). Components are added to their content pane.<br><b>Intermediate containers</b> (lightweight, group components inside top-level containers): <b>JPanel</b> (general grouping, FlowLayout default) ★ <b>JScrollPane</b> (scrolling) ★ <b>JTabbedPane</b> (tabs) ★ <b>JSplitPane</b> (two resizable panes) ★ <b>JToolBar</b> ★ <b>JLayeredPane</b>, JRootPane, JInternalFrame.<br><b>Common components:</b> JLabel, JButton, JTextField, JTextArea, JPasswordField, JCheckBox, JRadioButton, JComboBox, JList, JTable, JTree, JSlider, JProgressBar, JMenuBar, JOptionPane (message/input dialogs).` + C(`import javax.swing.*; import java.awt.*;
class ContainerDemo { public static void main(String a[]){
  JFrame f = new JFrame("Containers");                       // top-level
  JPanel form = new JPanel(new GridLayout(3,2));             // intermediate
  form.add(new JLabel("User:")); form.add(new JTextField());
  form.add(new JLabel("Password:")); form.add(new JPasswordField());
  form.add(new JCheckBox("Remember")); form.add(new JButton("Login"));
  JTextArea notes = new JTextArea(5,20);
  JSplitPane sp = new JSplitPane(JSplitPane.VERTICAL_SPLIT, form, new JScrollPane(notes));
  f.add(sp); f.setSize(320,260); f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); f.setVisible(true);
  JOptionPane.showMessageDialog(f, "Welcome"); } }`) + T([['Top-level', 'Intermediate', 'Components'], ['JFrame, JDialog, JWindow', 'JPanel, JScrollPane, JTabbedPane, JSplitPane', 'JButton, JLabel, JTextField, JList…'], ['heavyweight', 'lightweight', 'lightweight'], ['cannot be added to others', 'added to top-level', 'added to containers']]),
},
};

// expand diagram tokens
for (const u in ANS) for (const q in ANS[u]) ANS[u][q] = ANS[u][q].replace(/\{\{(\w+)\}\}/g, (m, k) => D[k] || '');
module.exports = { Q, A: ANS };
// underscores outside code would be turned into subscripts by the sheet builder -> escape them
for (const u in module.exports.A) for (const q in module.exports.A[u]) module.exports.A[u][q] = module.exports.A[u][q].replace(/_/g, '&#95;');
for (const u in module.exports.Q) for (const q in module.exports.Q[u]) module.exports.Q[u][q] = module.exports.Q[u][q].replace(/_/g, '&#95;');
