import type { QuizQuestion } from '@/constants/curriculumTypes';
import type { LLDTopic } from '@/constants/lldTypes';

const q = (id: string, question: string, options: string[], correctIndex: number, explanation: string): QuizQuestion => ({
  id,
  question,
  options,
  correctIndex,
  explanation,
});

export const CHAPTER_L1_TOPICS: LLDTopic[] = [
  {
    id: 'classes-objects-constructors',
    title: 'Classes, Objects, and Constructors',
    readContent: `A class is the smallest practical design unit in most LLD interviews. When an interviewer gives requirements like 'build a parking lot', they are really asking whether you can convert real world nouns into coherent software boundaries. In this context, a class is a blueprint: it defines what data an entity owns and what behavior that entity controls. If your blueprint is weak, everything on top of it becomes fragile. If your blueprint is tight, your interactions become predictable and interview discussions become easier.

In Java OOP design, objects are concrete runtime instances of classes. Think of ParkingLot as a blueprint and 'Downtown Parking Garage' as an object with specific floors, occupancy, and policy configuration. This distinction matters in interviews because many candidates explain architecture at class level but fail to reason about state transitions of real instances. Interviewers often probe with runtime questions: what happens when two vehicles try to park in the same spot, or how ticket state changes over time. Good object modeling answers these naturally.

Fields model state. A ParkingSpot may own spotNumber, spotType, occupied, and currentVehicle. If state is wrong, behavior is wrong. That is why encapsulation is not an academic rule; it is risk control. Public mutable fields let any caller put your object in invalid state, which creates bug chains that are hard to debug in larger systems. In LLD rounds, showing private fields and controlled mutations signals production mindset.

Methods model behavior and enforce invariants. park(vehicle), removeVehicle(), and isAvailable() are not just conveniences; they are policy gateways. A clean class does not let outside code toggle occupied directly. Instead, it validates transitions in one place. This style lowers mental load, helps testing, and makes concurrency safer because fewer places mutate core state.

Constructors are your first line of defense. They define valid initial state. A ParkingSpot constructor can reject negative spot numbers and null type. Without this, invalid objects spread through your object graph and every method must defensively re-check assumptions. Constructor validation makes invalid state unrepresentable early, which is one of the strongest OO habits in Java interviews.

Constructor overloading lets you support multiple creation paths while preserving invariants. For example, Vehicle(licensePlate, type) and Vehicle(licensePlate, type, color, owner) can both route through a core validator. This gives usability without sacrificing correctness. The key is avoiding duplicated constructor logic: chain constructors or centralize checks.

The this keyword disambiguates field vs parameter names and improves readability. this.spotNumber = spotNumber is clear and unambiguous. It also helps fluent APIs when returning this for builder-like patterns.

For robust model classes, override toString(), equals(), and hashCode(). toString helps debugging and logs during interview walkthroughs. equals/hashCode are essential when using sets, maps, and dedup logic. If logically equal objects produce different hash codes, collection behavior breaks. Interviewers often test this indirectly with 'how would you store unique tickets in a HashSet?'.

Immutability is another advanced signal. Immutable objects with final fields and no setters are safer in multithreaded designs and easier to reason about. In LLD systems, value objects like Address, Money, and DateRange should usually be immutable. If a mutable field is exposed, return defensive copies. This prevents external mutation from violating hidden invariants.

> ANALOGY: a class is like an architectural blueprint for a house. It defines the rooms, doors, and windows. An object is an actual house built from that blueprint. You can build many houses (objects) from the same blueprint (class), each with different paint colors and furniture (different field values).

> IMPORTANT: model classes are not just data holders. They are invariant guardians. If state transitions are allowed anywhere, bugs become distributed and difficult to trace.

> INTERVIEW TIP: in LLD interviews, start by identifying the main classes from the requirements. Every noun is a potential class. Every verb is a potential method. 'The parking lot has floors. Each floor has parking spots. Vehicles can park in spots.' Classes: ParkingLot, Floor, ParkingSpot, Vehicle.

> NUMBERS: most candidate bugs in OO rounds come from invalid state transitions, not syntax. By validating in constructor + behavior methods, you usually eliminate entire categories of edge cases before coding tests.

WHY this matters for LLD interviews: interviewers are not grading Java syntax; they are grading design judgment. Strong class design demonstrates boundary thinking, correctness under change, and maintainability. If you start with private fields, validated constructors, enums for fixed categories, and immutable value objects where possible, your design quality rises immediately. This foundation directly supports later topics like SOLID, patterns, and testability.`,
    codeExamples: [
      {
        id: 'l1-1-code-1',
        title: 'Bad: Public Fields, No Constructor',
        language: 'java',
        isGood: false,
        code:
          "public class ParkingSpot {\n  public int spotNumber;\n  public String type;\n  public boolean occupied;\n  public String vehicleLicense;\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    ParkingSpot spot = new ParkingSpot();\n    spot.spotNumber = -1;\n    spot.type = 'banana';\n    spot.occupied = true;\n    spot.vehicleLicense = null;\n\n    System.out.println('Spot: ' + spot.spotNumber + ' type=' + spot.type);\n  }\n}",
        explanation:
          'Public fields let anyone set invalid state. There is no validation, no constructor to ensure a valid starting state, and the class cannot evolve without breaking all code that uses it.',
      },
      {
        id: 'l1-1-code-2',
        title: 'Good: Encapsulated with Validation',
        language: 'java',
        isGood: true,
        code:
          "enum SpotType {\n  COMPACT,\n  REGULAR,\n  LARGE\n}\n\nclass Vehicle {\n  private final String licensePlate;\n\n  public Vehicle(String licensePlate) {\n    if (licensePlate == null || licensePlate.isBlank()) {\n      throw new IllegalArgumentException('licensePlate must not be blank');\n    }\n    this.licensePlate = licensePlate;\n  }\n\n  public String getLicensePlate() {\n    return licensePlate;\n  }\n}\n\npublic class ParkingSpot {\n  private final int spotNumber;\n  private final SpotType spotType;\n  private boolean occupied;\n  private Vehicle vehicle;\n\n  public ParkingSpot(int spotNumber, SpotType spotType) {\n    if (spotNumber < 0) {\n      throw new IllegalArgumentException('spotNumber must be non-negative');\n    }\n    if (spotType == null) {\n      throw new IllegalArgumentException('spotType is required');\n    }\n    this.spotNumber = spotNumber;\n    this.spotType = spotType;\n    this.occupied = false;\n  }\n\n  public boolean park(Vehicle incoming) {\n    if (incoming == null || occupied) {\n      return false;\n    }\n    this.vehicle = incoming;\n    this.occupied = true;\n    return true;\n  }\n\n  public Vehicle removeVehicle() {\n    if (!occupied) {\n      return null;\n    }\n    Vehicle removed = this.vehicle;\n    this.vehicle = null;\n    this.occupied = false;\n    return removed;\n  }\n\n  public boolean isAvailable() {\n    return !occupied;\n  }\n\n  public int getSpotNumber() {\n    return spotNumber;\n  }\n\n  public SpotType getSpotType() {\n    return spotType;\n  }\n}",
        explanation:
          'Private fields prevent invalid state. The constructor validates inputs. An enum ensures only valid spot types. The park() and removeVehicle() methods manage state transitions safely. This class is robust and self-documenting.',
      },
      {
        id: 'l1-1-code-3',
        title: 'Immutable: Address Value Object',
        language: 'java',
        isGood: true,
        code:
          "import java.util.Objects;\n\npublic final class Address {\n  private final String street;\n  private final String city;\n  private final String state;\n  private final String zipCode;\n\n  public Address(String street, String city, String state, String zipCode) {\n    this.street = Objects.requireNonNull(street, 'street');\n    this.city = Objects.requireNonNull(city, 'city');\n    this.state = Objects.requireNonNull(state, 'state');\n    this.zipCode = Objects.requireNonNull(zipCode, 'zipCode');\n  }\n\n  public String getStreet() { return street; }\n  public String getCity() { return city; }\n  public String getState() { return state; }\n  public String getZipCode() { return zipCode; }\n\n  @Override\n  public boolean equals(Object obj) {\n    if (this == obj) return true;\n    if (!(obj instanceof Address)) return false;\n    Address other = (Address) obj;\n    return street.equals(other.street)\n      && city.equals(other.city)\n      && state.equals(other.state)\n      && zipCode.equals(other.zipCode);\n  }\n\n  @Override\n  public int hashCode() {\n    return Objects.hash(street, city, state, zipCode);\n  }\n\n  @Override\n  public String toString() {\n    return street + ', ' + city + ', ' + state + ' ' + zipCode;\n  }\n}",
        explanation:
          'Value objects like Address should be immutable. Once created, they never change. This makes them safe to share between objects, use as Map keys, and reason about in concurrent code.',
      },
    ],
    diagrams: [
      {
        id: 'l1-1-diagram-1',
        title: 'ParkingSpot Structure',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass ParkingSpot {\n  -int spotNumber\n  -SpotType spotType\n  -boolean occupied\n  -Vehicle vehicle\n  +boolean park(Vehicle vehicle)\n  +Vehicle removeVehicle()\n  +boolean isAvailable()\n  +SpotType getSpotType()\n}\nclass SpotType {\n  <<enumeration>>\n  COMPACT\n  REGULAR\n  LARGE\n}\nParkingSpot --> SpotType',
      },
    ],
    exercises: [
      {
        id: 'l1-1-ex-1',
        title: 'Create a Movie Class',
        difficulty: 'easy',
        description: 'Design a Movie class for a movie ticket booking system.',
        requirements: [
          'Use private fields: title, genre, durationMinutes, rating.',
          'Validate constructor inputs: duration > 0 and rating between 0 and 10.',
          'Provide getters and override toString().',
          'Add isLongMovie() returning true when duration > 150.',
        ],
        starterCode:
          "public class Movie {\n  // TODO: private fields\n\n  public Movie(String title, String genre, int durationMinutes, double rating) {\n    // TODO: add validation\n  }\n\n  // TODO: getters\n\n  // TODO: isLongMovie()\n\n  @Override\n  public String toString() {\n    // TODO\n    return '';\n  }\n}",
        testCases: [
          'Movie with duration 148 is not long.',
          'Movie with duration 160 is long.',
          'Invalid rating throws IllegalArgumentException.',
        ],
        hints: [
          'Start with private fields and a constructor.',
          'Add validation in constructor using IllegalArgumentException.',
          "toString can return 'Movie: Inception (Sci-Fi) - 148min - Rating: 8.8'.",
        ],
        solution:
          "public class Movie {\n  private final String title;\n  private final String genre;\n  private final int durationMinutes;\n  private final double rating;\n\n  public Movie(String title, String genre, int durationMinutes, double rating) {\n    if (durationMinutes <= 0) {\n      throw new IllegalArgumentException('duration must be positive');\n    }\n    if (rating < 0 || rating > 10) {\n      throw new IllegalArgumentException('rating must be between 0 and 10');\n    }\n    this.title = title;\n    this.genre = genre;\n    this.durationMinutes = durationMinutes;\n    this.rating = rating;\n  }\n\n  public String getTitle() { return title; }\n  public String getGenre() { return genre; }\n  public int getDurationMinutes() { return durationMinutes; }\n  public double getRating() { return rating; }\n\n  public boolean isLongMovie() {\n    return durationMinutes > 150;\n  }\n\n  @Override\n  public String toString() {\n    return 'Movie: ' + title + ' (' + genre + ') - ' + durationMinutes + 'min - Rating: ' + rating;\n  }\n}",
        solutionExplanation:
          'Validation protects the object from invalid values at creation time. Private fields preserve encapsulation. A focused method like isLongMovie keeps business intent inside the model.',
        designPrinciples: ['Encapsulation', 'Validation in Constructor'],
        connectedHLDTopic: null,
      },
      {
        id: 'l1-1-ex-2',
        title: 'Create a BankAccount Class',
        difficulty: 'medium',
        description: 'Design a BankAccount class that manages deposits and withdrawals safely.',
        requirements: [
          'Use private fields accountId, ownerName, balance.',
          'Use BigDecimal for balance and all monetary operations.',
          'Validate constructor and methods; no negative balance and no overdraft.',
          'Throw custom InsufficientFundsException for overdraw.',
        ],
        starterCode:
          "import java.math.BigDecimal;\n\npublic class BankAccount {\n  // TODO: private fields\n\n  public BankAccount(String accountId, String ownerName, BigDecimal balance) {\n    // TODO: validate initial balance\n  }\n\n  public void deposit(BigDecimal amount) {\n    // TODO\n  }\n\n  public void withdraw(BigDecimal amount) {\n    // TODO: throw InsufficientFundsException\n  }\n}",
        testCases: [
          'Deposit positive amount increases balance.',
          'Withdraw beyond balance throws InsufficientFundsException.',
          'Negative amount rejects with IllegalArgumentException.',
        ],
        hints: [
          'Use BigDecimal compareTo for comparisons.',
          'Never use double for money.',
          'Synchronize mutating methods if thread safety is needed.',
        ],
        solution:
          "import java.math.BigDecimal;\n\nclass InsufficientFundsException extends RuntimeException {\n  public InsufficientFundsException(String message) {\n    super(message);\n  }\n}\n\npublic class BankAccount {\n  private final String accountId;\n  private final String ownerName;\n  private BigDecimal balance;\n\n  public BankAccount(String accountId, String ownerName, BigDecimal initialBalance) {\n    if (initialBalance == null || initialBalance.compareTo(BigDecimal.ZERO) < 0) {\n      throw new IllegalArgumentException('balance must be non-negative');\n    }\n    this.accountId = accountId;\n    this.ownerName = ownerName;\n    this.balance = initialBalance;\n  }\n\n  public synchronized void deposit(BigDecimal amount) {\n    validateAmount(amount);\n    balance = balance.add(amount);\n  }\n\n  public synchronized void withdraw(BigDecimal amount) {\n    validateAmount(amount);\n    if (balance.compareTo(amount) < 0) {\n      throw new InsufficientFundsException('insufficient funds');\n    }\n    balance = balance.subtract(amount);\n  }\n\n  public synchronized BigDecimal getBalance() {\n    return balance;\n  }\n\n  private void validateAmount(BigDecimal amount) {\n    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {\n      throw new IllegalArgumentException('amount must be positive');\n    }\n  }\n}",
        solutionExplanation:
          'BigDecimal preserves financial correctness, synchronized methods protect balance updates, and explicit validation blocks invalid states and unsafe transitions.',
        designPrinciples: ['Encapsulation', 'Defensive Programming', 'Value Correctness'],
        connectedHLDTopic: null,
      },
      {
        id: 'l1-1-ex-3',
        title: 'Create an Immutable User Class',
        difficulty: 'medium',
        description: 'Design an immutable User class where state cannot change after creation.',
        requirements: [
          'Use final class and final fields id, name, email, roles.',
          'No setters.',
          'Use defensive copy in constructor and getter for roles.',
          'Provide builder for convenient construction.',
        ],
        starterCode:
          "import java.util.List;\n\npublic final class User {\n  // TODO: final fields\n\n  private User(Builder builder) {\n    // TODO\n  }\n\n  public static class Builder {\n    // TODO: builder fields and build()\n  }\n}",
        testCases: [
          'Mutating original input list does not change user roles.',
          'Mutating roles from getter does not affect internal state.',
          'Equals/hashCode use id-based identity.',
        ],
        hints: [
          'Mark class final to prevent mutable subclassing.',
          'Use new ArrayList<>(roles) in constructor.',
          'Return new ArrayList<>(roles) from getter.',
        ],
        solution:
          "import java.util.ArrayList;\nimport java.util.List;\nimport java.util.Objects;\n\npublic final class User {\n  private final String id;\n  private final String name;\n  private final String email;\n  private final List<String> roles;\n\n  private User(Builder builder) {\n    this.id = Objects.requireNonNull(builder.id);\n    this.name = Objects.requireNonNull(builder.name);\n    this.email = Objects.requireNonNull(builder.email);\n    this.roles = new ArrayList<>(builder.roles);\n  }\n\n  public String getId() { return id; }\n  public String getName() { return name; }\n  public String getEmail() { return email; }\n  public List<String> getRoles() { return new ArrayList<>(roles); }\n\n  @Override\n  public boolean equals(Object obj) {\n    if (this == obj) return true;\n    if (!(obj instanceof User)) return false;\n    User other = (User) obj;\n    return id.equals(other.id);\n  }\n\n  @Override\n  public int hashCode() {\n    return id.hashCode();\n  }\n\n  public static class Builder {\n    private String id;\n    private String name;\n    private String email;\n    private List<String> roles = new ArrayList<>();\n\n    public Builder id(String id) { this.id = id; return this; }\n    public Builder name(String name) { this.name = name; return this; }\n    public Builder email(String email) { this.email = email; return this; }\n    public Builder roles(List<String> roles) { this.roles = new ArrayList<>(roles); return this; }\n\n    public User build() { return new User(this); }\n  }\n}",
        solutionExplanation:
          'Defensive copies prevent aliasing bugs. Final fields and no setters make state stable. Builder gives readability for larger constructors while retaining immutability.',
        designPrinciples: ['Immutability', 'Defensive Copying', 'Builder Pattern'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q('l1-1-q1', 'Why are public fields usually discouraged in LLD class design?', ['They compile slower', 'They prevent inheritance', 'They allow uncontrolled invalid state changes', 'They cannot be serialized'], 2, 'Public fields bypass validation and expose internals, causing invariant drift.'),
      q('l1-1-q2', 'What is the main role of constructor validation?', ['Avoid writing getters', 'Ensure object starts in valid state', 'Enable polymorphism', 'Replace unit tests'], 1, 'Constructor checks catch invalid input early and keep downstream logic simpler.'),
      q('l1-1-q3', 'When is immutability especially useful?', ['When object changes frequently', 'For shared value objects and concurrency safety', 'Only for database entities', 'Never in Java'], 1, 'Immutable value objects are easier to reason about and thread-safe by default.'),
      q('l1-1-q4', 'What contract must equals and hashCode follow?', ['Equal objects must have same hash code', 'Hash code must be unique', 'equals should compare memory only', 'hashCode not needed with maps'], 0, 'Collections rely on equal => same hash code.'),
      q('l1-1-q5', 'In LLD context, class vs object means?', ['Class is runtime instance', 'Object is blueprint', 'Class defines behavior/state shape; object is concrete instance', 'Both are identical'], 2, 'Class is template, object is concrete runtime entity.'),
      q('l1-1-q6', 'Why use enum SpotType over String type?', ['Enums are faster in all cases', 'Enums enforce fixed valid set at compile time', 'Enums reduce memory to zero', 'Strings cannot be logged'], 1, 'Enums prevent typo-driven invalid values and improve readability.'),
    ],
    interviewTip:
      'Start every LLD interview by identifying the core classes. Make fields private, validate in constructors, and use enums for type safety. This shows the interviewer you write production-quality code, not quick hacks.',
    connectedHLDTopics: [],
  },
  {
    id: 'interfaces-vs-abstract-classes',
    title: 'Interfaces vs Abstract Classes',
    readContent: `This distinction appears in almost every LLD interview because it reveals whether you model contracts and inheritance responsibly. Interfaces define capability contracts. Abstract classes define shared family structure with common state and behavior. Both enable polymorphism, but they serve different design intents.

An interface answers 'what can this do?'. A PaymentStrategy interface says processPayment(amount). CreditCardPayment, CashPayment, and UPIPayment can all implement it even though their internal state and workflows differ. They may not share meaningful parent fields, and they should not be forced into one inheritance tree just to reuse a method signature.

An abstract class answers 'what is this?'. An abstract Vehicle can centralize licensePlate and shared description logic while requiring subclasses to implement fee calculation. Car, Truck, and Motorcycle are related by a genuine family relationship and can benefit from inherited common behavior.

Key interview difference: interfaces support multiple implementation; classes support single inheritance. This matters when capabilities cross-cut unrelated classes. A class can implement Payable, Auditable, and Retryable together. If those were abstract classes, Java inheritance would block composition of capabilities.

Java 8+ blurred edges by allowing default and static methods in interfaces. Still, the semantic distinction remains: default methods should express optional shared behavior for the same contract, not become a hidden stateful base class replacement.

The diamond problem explains why Java disallows multiple class inheritance. If class C inherited from A and B and both define foo(), ambiguity appears. Interfaces avoid most ambiguity because they usually carry contracts; when default method conflicts occur, Java forces explicit override resolution.

In LLD design for parking lot, ParkingStrategy is a clean interface because NearestFirst and FloorBased are interchangeable algorithms, not a strict inheritance family. Vehicle can be abstract because car/truck/motorcycle share a structural core.

Common mistake: using abstract class where interface is better. If there is no shared state, no shared logic, and no constructor need, abstract class just reduces flexibility. It prevents classes from extending another useful base class and introduces unnecessary coupling.

Selection rule that interviewers love: capability => interface, family with shared implementation => abstract class. Say it aloud while designing. It communicates architectural intent, not just syntax preference.

> IMPORTANT: the most common LLD interview mistake is using inheritance when you should use an interface. If two classes share a capability but are not in the same family, use an interface. 'Can process payment' is a capability (interface). 'Is a type of vehicle' is a family (abstract class or inheritance).

> INTERVIEW TIP: when the interviewer sees you choose between interface and abstract class correctly, it signals strong OOP understanding. Say: 'I will make ParkingStrategy an interface because different strategies are not related by inheritance — they just share a contract. I will make Vehicle an abstract class because Car, Truck, and Motorcycle share common fields and behavior.'

> ANALOGY: interface is like a legal contract that multiple vendors can sign; abstract class is like a parent franchise handbook with shared templates and mandatory inherited structure.

> NUMBERS: designs with capability interfaces generally scale better as features grow because each new capability implementation adds one class instead of modifying or stretching an inheritance hierarchy.

WHY this matters for LLD interviews: this choice affects extensibility, testability, and team velocity. Interviewers often add requirement changes mid-round. If your design uses contracts correctly, adding a new payment method or strategy is a new class, not a rewrite.`,
    codeExamples: [
      {
        id: 'l1-2-code-1',
        title: 'Interface: Payment Strategy',
        language: 'java',
        isGood: true,
        code:
          "import java.math.BigDecimal;\n\ninterface PaymentStrategy {\n  boolean processPayment(BigDecimal amount);\n}\n\nclass CreditCardPayment implements PaymentStrategy {\n  public boolean processPayment(BigDecimal amount) {\n    System.out.println('Charging card: ' + amount);\n    return true;\n  }\n}\n\nclass CashPayment implements PaymentStrategy {\n  public boolean processPayment(BigDecimal amount) {\n    System.out.println('Accepting cash: ' + amount);\n    return true;\n  }\n}\n\nclass UPIPayment implements PaymentStrategy {\n  public boolean processPayment(BigDecimal amount) {\n    System.out.println('UPI transfer: ' + amount);\n    return true;\n  }\n}\n\nclass PaymentProcessor {\n  private final PaymentStrategy strategy;\n\n  PaymentProcessor(PaymentStrategy strategy) {\n    this.strategy = strategy;\n  }\n\n  boolean pay(BigDecimal amount) {\n    return strategy.processPayment(amount);\n  }\n}",
        explanation:
          'PaymentStrategy is an interface because the different payment methods have nothing in common except the ability to process a payment. They do not share state or behavior — they just share a contract.',
      },
      {
        id: 'l1-2-code-2',
        title: 'Abstract Class: Vehicle Hierarchy',
        language: 'java',
        isGood: true,
        code:
          "abstract class Vehicle {\n  private final String licensePlate;\n  private final String vehicleType;\n\n  protected Vehicle(String licensePlate, String vehicleType) {\n    this.licensePlate = licensePlate;\n    this.vehicleType = vehicleType;\n  }\n\n  public String getDescription() {\n    return vehicleType + ' - ' + licensePlate;\n  }\n\n  public abstract double calculateParkingFee(int hours);\n}\n\nclass Car extends Vehicle {\n  Car(String plate) { super(plate, 'Car'); }\n  public double calculateParkingFee(int hours) { return hours * 10.0; }\n}\n\nclass Truck extends Vehicle {\n  Truck(String plate) { super(plate, 'Truck'); }\n  public double calculateParkingFee(int hours) { return hours * 20.0; }\n}\n\nclass Motorcycle extends Vehicle {\n  Motorcycle(String plate) { super(plate, 'Motorcycle'); }\n  public double calculateParkingFee(int hours) { return hours * 5.0; }\n}",
        explanation:
          'Vehicle is an abstract class because Car, Truck, and Motorcycle share common state (license plate, type) and behavior (getDescription) but differ in specific behavior (fee calculation). This is an IS-A relationship with shared code.',
      },
      {
        id: 'l1-2-code-3',
        title: 'Bad: Using Abstract Class When Interface Is Better',
        language: 'java',
        isGood: false,
        code:
          "abstract class Notifiable {\n  public abstract void notifyUser(String message);\n}\n\nclass EmailNotification extends Notifiable {\n  public void notifyUser(String message) {\n    System.out.println('Email: ' + message);\n  }\n}\n\nclass SMSNotification extends Notifiable {\n  public void notifyUser(String message) {\n    System.out.println('SMS: ' + message);\n  }\n}\n\nclass PushNotification extends Notifiable {\n  public void notifyUser(String message) {\n    System.out.println('Push: ' + message);\n  }\n}",
        explanation:
          'Notifiable has no shared state or behavior — it is purely a contract. Using an abstract class here prevents these classes from extending anything else (single inheritance). An interface is correct here because it defines a capability, not a family.',
      },
    ],
    diagrams: [
      {
        id: 'l1-2-diagram-1',
        title: 'Payment Strategy Interface',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass PaymentStrategy {\n  <<interface>>\n  +processPayment(amount)\n}\nclass CreditCardPayment\nclass CashPayment\nclass UPIPayment\nPaymentStrategy <|.. CreditCardPayment\nPaymentStrategy <|.. CashPayment\nPaymentStrategy <|.. UPIPayment',
      },
      {
        id: 'l1-2-diagram-2',
        title: 'Vehicle Abstract Family',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Vehicle {\n  <<abstract>>\n  -licensePlate: String\n  -vehicleType: String\n  +getDescription(): String\n  +calculateParkingFee(hours): double\n}\nclass Car\nclass Truck\nclass Motorcycle\nVehicle <|-- Car\nVehicle <|-- Truck\nVehicle <|-- Motorcycle',
      },
    ],
    exercises: [],
    quizQuestions: [
      q('l1-2-q1', 'Best use of interface?', ['Shared mutable state', 'Capability contract across unrelated classes', 'Single inheritance hierarchy only', 'Constructor reuse'], 1, 'Interfaces express capability contracts.'),
      q('l1-2-q2', 'Why abstract class for Vehicle?', ['Only because Java requires it', 'No reason', 'Shared state/behavior plus specialized methods', 'To support multiple inheritance'], 2, 'Vehicle has shared fields and common logic.'),
      q('l1-2-q3', 'A class can implement how many interfaces?', ['One', 'Two only', 'Many', 'Zero only'], 2, 'Java allows multiple interface implementation.'),
      q('l1-2-q4', 'Diamond problem is mainly about?', ['Database joins', 'Ambiguity from multiple class inheritance', 'Enum conflicts', 'Hash collisions'], 1, 'Java avoids this by single class inheritance.'),
      q('l1-2-q5', 'Default methods in interfaces are for?', ['Replacing all abstract classes', 'Providing optional shared contract behavior', 'Mutable state management', 'Disabling polymorphism'], 1, 'They add convenience while preserving interface contract role.'),
      q('l1-2-q6', 'PaymentStrategy should be?', ['Enum', 'Concrete class', 'Interface', 'Final utility class'], 2, 'Multiple unrelated payment types share capability only.'),
    ],
    interviewTip:
      'Use interfaces for capabilities (what something CAN do). Use abstract classes for families (what something IS). If two classes only share a method signature but no state or logic, use an interface.',
    connectedHLDTopics: [],
  },
  {
    id: 'inheritance-is-a-relationship',
    title: "Inheritance and the 'is-a' Relationship",
    readContent:
      "Inheritance means one class extends another and receives state + behavior contracts from the parent. This is powerful and dangerous. It should model genuine specialization, not convenience reuse. In LLD interviews, good inheritance appears when a subclass truly satisfies all parent expectations. Car IS-A Vehicle works. Stack IS-NOT-A ArrayList does not.\n\nCorrect inheritance gives polymorphism: code written against Vehicle can process Car, Truck, and Motorcycle uniformly. Overriding lets subclasses customize behavior while keeping shared API. Always use @Override because it provides compiler safety and readability.\n\nThe super keyword is central. super(...) calls parent constructor and must be first line in child constructor. super.method() lets child extend parent behavior instead of duplicating it.\n\nAccess control matters. Protected can expose extension hooks for subclasses, but overusing protected fields leaks internals and increases coupling. Prefer private fields with protected getters if needed.\n\nFragile base class problem: parent changes can accidentally break child behavior. If parent internals change assumptions, subclasses may fail silently. This is why inheritance depth should remain shallow (usually 1-2 levels). Deep trees raise cognitive cost and regression risk.\n\n> IMPORTANT: inheritance is the most overused OOP feature. Just because two classes share some code does not mean one should extend the other. Ask: Is X genuinely a specialized version of Y? If not, use composition.\n\n> INTERVIEW TIP: interviewers watch for inheritance abuse. If you create deep inheritance hierarchies or use inheritance just to reuse code, it signals weak OOP understanding. Keep hierarchies shallow and always validate the IS-A relationship.\n\n> ANALOGY: inheritance is like legal lineage: a subclass inherits rights and obligations. If a child cannot honor parent obligations, the relationship itself is wrong.\n\n> NUMBERS: once inheritance depth grows beyond 3, debugging and onboarding time often increases sharply because behavior becomes distributed across many files.\n\nWHY this matters for LLD interviews: inheritance quality is a direct proxy for abstraction quality. If your substitutions are safe and hierarchies shallow, your design is maintainable and extensible. If not, interviewers infer future bugs and brittle code.",
    codeExamples: [
      {
        id: 'l1-3-code-1',
        title: 'Correct Inheritance: Vehicle Hierarchy',
        language: 'java',
        isGood: true,
        code:
          "import java.util.List;\n\nabstract class Vehicle {\n  protected final String plate;\n\n  protected Vehicle(String plate) {\n    this.plate = plate;\n  }\n\n  public abstract double calculateParkingFee(int hours);\n}\n\nclass Car extends Vehicle {\n  Car(String plate) { super(plate); }\n  @Override\n  public double calculateParkingFee(int hours) { return hours * 10.0; }\n}\n\nclass Truck extends Vehicle {\n  Truck(String plate) { super(plate); }\n  @Override\n  public double calculateParkingFee(int hours) { return hours * 20.0; }\n}\n\nclass Motorcycle extends Vehicle {\n  Motorcycle(String plate) { super(plate); }\n  @Override\n  public double calculateParkingFee(int hours) { return hours * 5.0; }\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    List<Vehicle> list = List.of(new Car('C1'), new Truck('T1'), new Motorcycle('M1'));\n    for (Vehicle v : list) {\n      System.out.println(v.calculateParkingFee(2));\n    }\n  }\n}",
        explanation:
          'This hierarchy is a valid IS-A relationship and supports polymorphic fee calculation cleanly.',
      },
      {
        id: 'l1-3-code-2',
        title: 'Bad: Inheritance for Code Reuse',
        language: 'java',
        isGood: false,
        code:
          "import java.util.ArrayList;\n\nclass BadStack<E> extends ArrayList<E> {\n  public void push(E value) {\n    add(value);\n  }\n\n  public E pop() {\n    return remove(size() - 1);\n  }\n}\n\nclass DemoBad {\n  public static void main(String[] args) {\n    BadStack<String> s = new BadStack<>();\n    s.push('A');\n    s.add(0, 'B');\n    System.out.println(s.get(0));\n  }\n}",
        explanation:
          'Stack extends ArrayList to reuse code, but now Stack has methods like get(index) and add(index, element) that break stack abstraction. Use composition instead.',
      },
    ],
    diagrams: [
      {
        id: 'l1-3-diagram-1',
        title: 'Vehicle Inheritance',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Vehicle {\n  <<abstract>>\n  +calculateParkingFee(hours)\n}\nclass Car\nclass Truck\nclass Motorcycle\nVehicle <|-- Car\nVehicle <|-- Truck\nVehicle <|-- Motorcycle',
      },
    ],
    exercises: [],
    quizQuestions: [
      q('l1-3-q1', 'Inheritance is appropriate when?', ['Need two methods reused', 'True IS-A specialization exists', 'Classes are in same package', 'Performance concerns'], 1, 'IS-A specialization is the core criterion.'),
      q('l1-3-q2', 'Why use @Override?', ['Runtime speed', 'Compile-time safety for intended override', 'Enable generics', 'Required for abstract classes'], 1, 'It prevents silent signature mistakes.'),
      q('l1-3-q3', 'Fragile base class means?', ['Base class too small', 'Parent changes can break subclasses unexpectedly', 'Subclass cannot access parent', 'No constructors'], 1, 'Inheritance coupling makes parent changes risky.'),
      q('l1-3-q4', 'Recommended inheritance depth?', ['As deep as needed', '1-2 levels typically', 'At least 5 levels', 'No limit ever'], 1, 'Shallow trees reduce complexity.'),
      q('l1-3-q5', 'Stack extends ArrayList is bad because?', ['ArrayList is final', 'Violates stack abstraction and IS-A', 'No generics support', 'Memory leak'], 1, 'Inherited methods expose invalid operations for stack semantics.'),
      q('l1-3-q6', 'Protected vs private in parent?', ['Always protected fields', 'Prefer private fields, expose controlled access', 'Always public', 'No modifiers'], 1, 'Private keeps encapsulation stronger.'),
    ],
    interviewTip:
      'Keep inheritance hierarchies shallow — 1-2 levels max. Always validate the IS-A relationship. If you find yourself extending a class just to reuse 2 methods, use composition instead.',
    connectedHLDTopics: [],
  },
  {
    id: 'composition-has-a-relationship',
    title: "Composition and the 'has-a' Relationship",
    readContent:
      "Composition means a class owns references to other classes and collaborates through them. ParkingLot HAS Floors, Floor HAS ParkingSpots, ParkingLot HAS ParkingStrategy. This is usually more flexible than inheritance because dependencies can be swapped, tested, and evolved independently.\n\nInheritance hardwires behavior into type hierarchy. Composition wires behavior through object graph. In interviews, composition helps handle changing requirements. If strategy changes from nearest-first to floor-based, swap strategy object rather than rewriting inheritance tree.\n\nAggregation vs composition: aggregation is weak ownership (Department has Employees who can live independently), composition is strong ownership (Order has LineItems that rarely make sense outside order context). Mentioning this distinction is a maturity signal in LLD discussions.\n\nDelegation is practical composition in motion. ParkingLot.parkVehicle delegates findSpot to strategy, then delegates parking to spot. Each class keeps one responsibility and collaboration is explicit.\n\nComposition also prevents inheritance explosion. Coffee addons are classic example: MilkCoffee, SugarCoffee, MilkSugarCoffee, MilkSugarWhipCoffee quickly become unmanageable. With composition, Coffee has list of Addon; adding feature is one class.\n\n> IMPORTANT: favor composition over inheritance. Use inheritance only for clear, stable IS-A relationships. For most behavior assembly, composition is safer and more adaptable.\n\n> INTERVIEW TIP: explicitly state the choice: 'ParkingLot uses composition, it has Floors and a ParkingStrategy. I can swap strategy at runtime without changing ParkingLot.' This signals mature design thinking.\n\n> ANALOGY: composition is like building a team from specialists. You do not become the database or payment gateway; you collaborate with them.\n\n> NUMBERS: composition usually reduces blast radius of change because modifications stay localized to one collaborator instead of rippling through inheritance chains.\n\nWHY this matters for LLD interviews: interviewers frequently add new requirements mid-design. Composition allows extension by adding collaborators, which keeps existing code stable and makes OCP easier to satisfy.",
    codeExamples: [],
    diagrams: [
      {
        id: 'l1-4-diagram-1',
        title: 'ParkingLot Composition',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass ParkingLot\nclass Floor\nclass ParkingSpot\nclass ParkingStrategy {\n  <<interface>>\n}\nParkingLot *-- "1..*" Floor\nFloor *-- "1..*" ParkingSpot\nParkingLot --> ParkingStrategy',
      },
    ],
    exercises: [],
    quizQuestions: [
      q('l1-4-q1', 'Composition represents?', ['IS-A', 'HAS-A', 'ONLY-A', 'KIND-OF'], 1, 'Composition models ownership/collaboration.'),
      q('l1-4-q2', 'Why composition over inheritance often?', ['Less code always', 'More runtime flexibility and lower coupling', 'Required by Java', 'No constructors needed'], 1, 'Composition supports swapping collaborators and reduces fragile coupling.'),
      q('l1-4-q3', 'Aggregation vs composition?', ['No difference', 'Aggregation weak ownership, composition strong ownership', 'Composition only for interfaces', 'Aggregation only for primitives'], 1, 'Lifecycle/ownership strength differs.'),
      q('l1-4-q4', 'Delegation means?', ['Recursion', 'Forwarding behavior to composed object', 'Extending class', 'Reflection'], 1, 'Delegation keeps responsibilities focused.'),
      q('l1-4-q5', 'Coffee addons best modeled by?', ['Deep inheritance tree', 'Composition with Addon list', 'Enums only', 'Static methods'], 1, 'Composition avoids class explosion.'),
      q('l1-4-q6', 'Strategy pattern depends on?', ['Inheritance depth', 'Composition and interface contract', 'Package-private fields', 'Reflection'], 1, 'Swappable strategy instances require composition.'),
    ],
    interviewTip:
      "Default to composition. Only use inheritance for clear IS-A relationships. Say 'I use composition here because I want to swap strategies at runtime' — this is music to an interviewer's ears.",
    connectedHLDTopics: [],
  },
  {
    id: 'enums-in-design',
    title: 'Enums and When to Use Them',
    readContent:
      "Enums model fixed sets safely. Instead of String vehicleType with typo risks, use VehicleType.CAR/TRUCK/MOTORCYCLE. This gives compile-time safety, IDE completion, cleaner APIs, and fewer runtime bugs.\n\nIn LLD interviews, enum usage is a fast quality signal. Interviewers immediately notice whether you design with constrained domains or free-form strings. Statuses, levels, directions, and categories should often be enums.\n\nJava enums are full classes. They can have fields, constructors, and methods. You can encode business metadata like spot size and hourly rate directly in enum values. This removes fragile switch blocks and centralizes logic.\n\nEnums can also have constant-specific behavior via abstract methods, which helps remove type branching in callers. However, avoid overusing enums when external extensibility is needed. If third parties must add variants, interface + plugin architecture is better.\n\nCommon anti-patterns: relying on ordinal() for persistence logic, creating huge enums for dynamic domain values, or forcing frequently changing taxonomies into enums.\n\n> INTERVIEW TIP: use enums for any fixed set of values in your LLD design. enum VehicleType instead of String vehicleType signals attention to type safety and clean design.\n\nWHY this matters for LLD interviews: many system bugs stem from invalid states. Enums narrow state space and make invalid values impossible at compile time in many paths.",
    codeExamples: [],
    diagrams: [],
    exercises: [],
    quizQuestions: [
      q('l1-5-q1', 'Why enums over strings?', ['Smaller class files', 'Compile-time constrained values', 'No need for classes', 'Auto persistence'], 1, 'Enums enforce allowed values.'),
      q('l1-5-q2', 'Enum with methods helps by?', ['Removing constructors', 'Eliminating scattered switch logic', 'Disabling polymorphism', 'Increasing memory always'], 1, 'Behavior can live with the enum constants.'),
      q('l1-5-q3', 'When not to use enum?', ['Fixed status set', 'Externally extensible plugin variants', 'Log levels', 'Directions'], 1, 'Interfaces are better for open extension domains.'),
      q('l1-5-q4', 'Using ordinal() in business logic is?', ['Best practice', 'Fragile if order changes', 'Required for maps', 'Faster and safe'], 1, 'Ordinal depends on declaration order.'),
      q('l1-5-q5', 'Great enum use case in LLD?', ['User input comment text', 'OrderStatus lifecycle', 'Unbounded product names', 'Random UUIDs'], 1, 'Order statuses are finite and well-defined.'),
    ],
    interviewTip:
      'Use enums for every fixed set of values: statuses, types, directions, levels. Add fields and methods to enums to eliminate switch statements. This is a small thing that makes a big impression.',
    connectedHLDTopics: [],
  },
  {
    id: 'access-modifiers-encapsulation',
    title: 'Access Modifiers and Encapsulation',
    readContent:
      "Java gives four access levels: private, package-private, protected, public. In LLD design, these are API surface controls. Good encapsulation minimizes what outside code can touch. Principle of least privilege applies directly: expose only what callers need.\n\nPrivate should be default for fields and most helper methods. Public should represent intentional contract methods. Protected should be rare extension hooks. Package-private is useful for internal implementation classes hidden within module boundaries.\n\nEncapsulation in practice means private fields + validated operations. For collections, return unmodifiable views or defensive copies. Never leak mutable internal references because external mutation can silently violate invariants.\n\nTell-don't-ask principle keeps behavior where data lives. Instead of reading flags and making external decisions, send command methods to object and let object enforce state rules.\n\n> INTERVIEW TIP: make EVERYTHING private by default. Only make methods public when another class genuinely needs to call them. This discipline prevents design mistakes and shows the interviewer you think about API surface area.\n\nWHY this matters for LLD interviews: uncontrolled visibility is one of the fastest ways to degrade design quality. Tight encapsulation improves correctness, evolution safety, and test clarity.",
    codeExamples: [],
    diagrams: [],
    exercises: [],
    quizQuestions: [
      q('l1-6-q1', 'Default field modifier best practice?', ['public', 'protected', 'private', 'package-private'], 2, 'Private fields protect invariants.'),
      q('l1-6-q2', 'Leaking mutable list through getter causes?', ['Faster code', 'Broken encapsulation/invariants', 'Compilation errors', 'Better testability'], 1, 'Callers can mutate internal state directly.'),
      q('l1-6-q3', 'Tell-don’t-ask means?', ['Read all fields then decide outside', 'Let object enforce behavior via commands', 'Use static methods only', 'Avoid constructors'], 1, 'Logic should live with owned state.'),
      q('l1-6-q4', 'protected is best used for?', ['All fields', 'Subclass extension points', 'Public API', 'Constants only'], 1, 'Use sparingly for inheritance hooks.'),
      q('l1-6-q5', 'Package-private is useful when?', ['Public SDK methods', 'Internal package-only implementation', 'Cross-module APIs', 'Reflection only'], 1, 'Keeps internals hidden outside package.'),
    ],
    interviewTip:
      'Private by default. Public only when necessary. Return unmodifiable collections. These three rules prevent 90% of encapsulation-related design mistakes.',
    connectedHLDTopics: [],
  },
  {
    id: 'generics-basics',
    title: 'Generics for Design Flexibility',
    readContent:
      "Generics let you write reusable code with compile-time type safety. Repository<T> can work for User, Order, Product without duplicating logic or using unsafe Object casts. In LLD interviews, this demonstrates professional abstraction design.\n\nGeneric classes and interfaces encode relationships between types directly in method signatures. Cache<K, V> clarifies key/value contracts better than raw maps hidden behind Object. Bounded generics (T extends Entity) ensure required capabilities like getId are available.\n\nWithout generics, you either duplicate classes or lose type safety. Both are poor design outcomes. With generics, compiler catches misuse early and APIs become self-documenting.\n\nWildcards appear less often in interviews, but PECS is worth naming briefly: producer extends, consumer super.\n\n> INTERVIEW TIP: using generics in your LLD solution shows you write reusable, professional code. A generic Repository<T> is more impressive than separate UserRepository and OrderRepository with duplicated code.\n\nWHY this matters for LLD interviews: reusable abstractions reduce boilerplate and future maintenance. They also signal that your design can scale across entities and services cleanly.",
    codeExamples: [],
    diagrams: [],
    exercises: [],
    quizQuestions: [
      q('l1-7-q1', 'Main benefit of generics?', ['Runtime speed only', 'Type-safe reusable abstractions', 'No classes needed', 'No tests needed'], 1, 'Generics improve reuse and safety.'),
      q('l1-7-q2', 'T extends Entity means?', ['T must be primitive', 'T must implement/extend Entity contract', 'T can be anything', 'No type checks'], 1, 'Bounded types enforce required capabilities.'),
      q('l1-7-q3', 'Repository<Object> vs Repository<User>?', ['Same safety', 'User version prevents wrong type operations', 'Object is always better', 'No difference in compile checks'], 1, 'Specific generic types catch errors early.'),
      q('l1-7-q4', 'Cache<K,V> is an example of?', ['Interface segregation only', 'Generic interface design', 'Inheritance depth', 'Enum behavior'], 1, 'It abstracts key/value operations across types.'),
      q('l1-7-q5', 'Using Object everywhere causes?', ['Cleaner contracts', 'Loss of compile-time type safety', 'Faster builds only', 'Automatic bounds'], 1, 'Requires casting and risks runtime ClassCastException.'),
    ],
    interviewTip:
      'Use generics for any class that should work with multiple types: repositories, caches, event handlers, response wrappers. It shows you write reusable, type-safe code.',
    connectedHLDTopics: [],
  },
];
