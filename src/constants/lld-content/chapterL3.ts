import type { QuizQuestion } from '@/constants/curriculumTypes';
import type { LLDTopic } from '@/constants/lldTypes';

const q = (
  id: string,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): QuizQuestion => ({
  id,
  question,
  options,
  correctIndex,
  explanation,
});

export const CHAPTER_L3_TOPICS: LLDTopic[] = [
  {
    id: 'factory-method',
    title: 'Factory Method Pattern',
    readContent: `# Factory Method Pattern

## The problem object creation creates

In many codebases, business logic sprinkles \`new ConcreteType()\` across services, controllers, and helpers. That feels convenient at first: you know exactly which class you instantiate. The pain arrives when requirements change. You add a new notification channel, a new vehicle type, or a new database dialect. Suddenly every call site that constructed the old family of objects must be edited, retested, and redeployed. That is a direct violation of the Open/Closed Principle: the system is not closed to modification when behavior extends. Worse, creation rules—validation, default configuration, feature flags—get duplicated or forgotten, producing subtle production bugs.

In LLD interviews, interviewers watch whether you isolate **who** decides the concrete type from **who** uses the abstraction. If your design says “the payment service knows it is charging Stripe today,” you have coupled policy to implementation. Factory Method is one of the standard ways to reverse that coupling: the creator exposes a seam where subclasses or dedicated factory objects choose the concrete product, while client code depends only on interfaces.

## What Factory Method does

The Gang of Four Factory Method pattern defines an interface for creating objects but lets subclasses (or dedicated creator types) decide which class to instantiate. A typical structure includes a **Product** interface, **ConcreteProducts**, a **Creator** that declares \`factoryMethod()\`, and **ConcreteCreators** that override \`factoryMethod()\` to return a specific product. The creator’s other methods can use the product without naming concrete classes.

A closely related idea is the **Simple Factory**: one class with a static method and a switch on type. It is not a formal GoF pattern, but it appears constantly in real Java code because it centralizes creation in one place. Factory Method goes further by using polymorphism: each creator subclass encapsulates a creation rule, which is ideal when creation policy itself varies (different tenants, different environments, different strategies).

## Simple Factory vs Factory Method

Simple Factory centralizes construction in a single place—often \`create(Type t)\` with branching. It improves OCP versus scattered \`new\` calls, but the factory method body still changes when you add types unless you replace branching with registration maps or dependency injection. Factory Method distributes creation across subclasses: \`WindowsDialog\` creates \`WindowsButton\`, \`WebDialog\` creates \`HtmlButton\`. Adding a new platform is a new subclass pair, not edits inside a giant switch.

## When to use Factory Method

Use it when a class cannot know upfront which concrete product it needs, when subclasses should specify the product, when you want one place to enforce invariants during construction, or when you want to mock factories in tests. Common LLD examples include \`NotificationFactory\` producing email, SMS, and push implementations; \`VehicleFactory\` producing cars, trucks, and motorcycles; and \`ConnectionFactory\` producing vendor-specific JDBC wrappers.

## When not to use it

Skip it when there is exactly one product type that will never vary, when construction is a single trivial \`new\` with no rules, or when a dependency injection framework already constructs beans for you—adding a manual factory may duplicate the container’s job.

## Real Java and platform examples

Java’s collections use Factory Method in spirit: \`Collection.iterator()\` is overridden so \`ArrayList\` returns an \`ArrayListIterator\` while \`HashSet\` returns a different iterator implementation. \`Calendar.getInstance(Locale)\` returns locale-specific calendar implementations. Spring’s \`BeanFactory\` resolves object graphs from configuration—another factory story. Josh Bloch’s **Effective Java** Item 1 also describes **static factory methods** (\`Integer.valueOf\`, \`List.of\`, \`Optional.of\`) as preferred over constructors when names improve readability, instances can be cached, or subtypes can be returned.

## Static factory method idiom (Java-specific)

Static factories are not the same class as subclass-based Factory Method, but interviews blend the vocabulary. Advantages: meaningful names (\`Point.atOrigin()\` vs overloaded constructors), ability to return cached or pooled instances, and flexibility to return interface types or hidden implementations. This matters in LLD because readable construction reduces parameter-order bugs in complex domains.

> ANALOGY: Factory Method is like ordering pasta at a restaurant. You request “pasta” by concept; the kitchen chooses spaghetti, penne, or fettuccine based on recipe and inventory. You receive a \`Pasta\` without micromanaging the concrete shape.

> INTERVIEW TIP: When creation depends on type or configuration, say: “I would introduce a Factory Method so adding a new notification type is a new class plus a localized factory update—notification sending logic stays untouched.”

> NUMBERS: In mature systems, centralized creation can reduce duplicate validation code by consolidating it in one or few factory methods—often eliminating dozens of risky call sites.

## Why this matters for LLD interviews

Interviewers reward designs that scale with new requirements. Factory Method (and its static variant) shows you understand encapsulation of construction, testability (inject a factory mock), and alignment with OCP. Name factories clearly—\`VehicleFactory\`, not \`VehicleHelper\`—because names communicate intent in design reviews and interviews.`,
    codeExamples: [
      {
        id: 'l3-1-bad',
        title: 'Bad: Direct Instantiation with Switch',
        language: 'java',
        isGood: false,
        code:
          "enum NotificationType { EMAIL, SMS, PUSH }\n\ninterface Notification {\n  void send(String userId, String message);\n}\n\n// Anti-pattern: every new NotificationType forces editing this method (OCP violation).\nclass NotificationSender {\n  Notification create(NotificationType type) {\n    switch (type) {\n      case EMAIL:\n        return new EmailNotification();\n      case SMS:\n        return new SmsNotification();\n      case PUSH:\n        return new PushNotification();\n      default:\n        throw new IllegalArgumentException('unknown type');\n    }\n  }\n}\n\nclass EmailNotification implements Notification {\n  public void send(String userId, String message) { }\n}\nclass SmsNotification implements Notification {\n  public void send(String userId, String message) { }\n}\nclass PushNotification implements Notification {\n  public void send(String userId, String message) { }\n}",
        explanation:
          'Centralizing switch logic is better than scattered news, but adding a type still modifies this method. Interviewers often push for registry, map, or polymorphic factory to avoid editing core switch code.',
      },
      {
        id: 'l3-1-good-factory',
        title: 'Good: Factory with Registration',
        language: 'java',
        isGood: true,
        code:
          "import java.util.EnumMap;\nimport java.util.Map;\nimport java.util.function.Supplier;\n\nenum NotificationType { EMAIL, SMS, PUSH }\n\ninterface Notification {\n  void send(String userId, String message);\n}\n\nfinal class EmailNotification implements Notification {\n  public void send(String userId, String message) {\n    System.out.println('email to ' + userId);\n  }\n}\n\nfinal class NotificationFactory {\n  private final Map<NotificationType, Supplier<Notification>> registry = new EnumMap<>(NotificationType.class);\n\n  NotificationFactory() {\n    registry.put(NotificationType.EMAIL, EmailNotification::new);\n    registry.put(NotificationType.SMS, SmsNotification::new);\n    registry.put(NotificationType.PUSH, PushNotification::new);\n  }\n\n  Notification create(NotificationType type) {\n    Supplier<Notification> supplier = registry.get(type);\n    if (supplier == null) {\n      throw new IllegalArgumentException('unsupported type: ' + type);\n    }\n    return supplier.get();\n  }\n}\n\nfinal class SmsNotification implements Notification {\n  public void send(String userId, String message) { }\n}\n\nfinal class PushNotification implements Notification {\n  public void send(String userId, String message) { }\n}",
        explanation:
          'Creation is centralized; adding a new notification is a new class plus one registry line. Callers depend on Notification, not concrete types.',
      },
      {
        id: 'l3-1-static-factory',
        title: 'Static Factory Methods for Connections',
        language: 'java',
        isGood: true,
        code:
          "final class Connection {\n  private final String driver;\n\n  private Connection(String driver) {\n    this.driver = driver;\n  }\n\n  public static Connection mysql(String host, int port) {\n    return new Connection('mysql:' + host + ':' + port);\n  }\n\n  public static Connection postgres(String host, int port) {\n    return new Connection('postgres:' + host + ':' + port);\n  }\n\n  public static Connection sqlite(String path) {\n    return new Connection('sqlite:' + path);\n  }\n\n  @Override\n  public String toString() {\n    return 'Connection(' + driver + ')';\n  }\n}",
        explanation:
          'Named static factories document intent better than overloaded constructors and leave room to cache or return subtypes later.',
      },
    ],
    diagrams: [
      {
        id: 'l3-1-d1',
        title: 'Factory creates Notification implementations',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Notification {\n  <<interface>>\n  +send(userId, message)\n}\nclass EmailNotification\nclass SmsNotification\nclass PushNotification\nclass NotificationFactory\n  +create(type) Notification\nNotification <|.. EmailNotification\nNotification <|.. SmsNotification\nNotification <|.. PushNotification\nNotificationFactory ..> Notification : creates',
      },
    ],
    exercises: [
      {
        id: 'l3-1-ex1',
        title: 'Vehicle Factory',
        difficulty: 'easy',
        description: 'Create a VehicleFactory that produces Car, Truck, and Motorcycle objects based on a VehicleType enum.',
        requirements: [
          'Vehicle interface with getType(), getWheels(), getMaxSpeed().',
          'Three implementations: Car, Truck, Motorcycle.',
          'VehicleFactory.createVehicle(VehicleType) returns the correct implementation.',
          'Adding Bicycle later should require a new class and one factory update only.',
        ],
        starterCode:
          "enum VehicleType { CAR, TRUCK, MOTORCYCLE }\n\ninterface Vehicle {\n  // TODO: methods\n}\n\nclass VehicleFactory {\n  Vehicle create(VehicleType type) {\n    // TODO\n    return null;\n  }\n}\n",
        testCases: [
          'CAR returns 4 wheels and a positive max speed.',
          'TRUCK has more wheels than CAR.',
          'Unknown future type is rejected clearly if not registered.',
        ],
        hints: [
          'Define the Vehicle interface first with the common methods.',
          'Each vehicle class implements Vehicle with its own values.',
          'Use switch on VehicleType or EnumMap of suppliers for registration.',
        ],
        solution:
          "enum VehicleType { CAR, TRUCK, MOTORCYCLE }\n\ninterface Vehicle {\n  VehicleType getType();\n  int getWheels();\n  int getMaxSpeedKmh();\n}\n\nfinal class Car implements Vehicle {\n  public VehicleType getType() { return VehicleType.CAR; }\n  public int getWheels() { return 4; }\n  public int getMaxSpeedKmh() { return 200; }\n}\n\nfinal class Truck implements Vehicle {\n  public VehicleType getType() { return VehicleType.TRUCK; }\n  public int getWheels() { return 6; }\n  public int getMaxSpeedKmh() { return 120; }\n}\n\nfinal class Motorcycle implements Vehicle {\n  public VehicleType getType() { return VehicleType.MOTORCYCLE; }\n  public int getWheels() { return 2; }\n  public int getMaxSpeedKmh() { return 280; }\n}\n\nfinal class VehicleFactory {\n  Vehicle create(VehicleType type) {\n    return switch (type) {\n      case CAR -> new Car();\n      case TRUCK -> new Truck();\n      case MOTORCYCLE -> new Motorcycle();\n    };\n  }\n}",
        solutionExplanation:
          'The factory is the only place that maps enum values to concrete vehicles, keeping the rest of the system on the Vehicle abstraction.',
        designPrinciples: ['Factory Method', 'Open/Closed Principle', 'Programming to Interfaces'],
        connectedHLDTopic: null,
      },
      {
        id: 'l3-1-ex2',
        title: 'Document Parser Factory',
        difficulty: 'medium',
        description: 'Design parsers for PDF, Word, and CSV with a factory selecting by file extension.',
        requirements: [
          'DocumentParser interface with parse(InputStream) returning Document.',
          'PDFParser, WordParser, CSVParser implementations.',
          'DocumentParserFactory selects parser by extension.',
          'Adding XMLParser should not modify existing parser classes.',
        ],
        starterCode:
          "import java.io.InputStream;\n\ninterface Document {\n  String text();\n}\n\ninterface DocumentParser {\n  Document parse(InputStream in);\n}\n\nclass DocumentParserFactory {\n  DocumentParser forFileName(String name) {\n    // TODO: map extension to parser\n    return null;\n  }\n}\n",
        testCases: [
          '.pdf uses PDFParser.',
          '.csv uses CSVParser.',
          'Unknown extension throws or returns Optional.empty().',
        ],
        hints: [
          'Normalize extension to lowercase.',
          'Use a Map<String, Supplier<DocumentParser>> for OCP-friendly registration.',
          'Keep Document as a simple immutable value object.',
        ],
        solution:
          "import java.io.InputStream;\nimport java.util.HashMap;\nimport java.util.Locale;\nimport java.util.Map;\nimport java.util.function.Supplier;\n\ninterface Document {\n  String text();\n}\n\nfinal class SimpleDocument implements Document {\n  private final String text;\n  SimpleDocument(String text) { this.text = text; }\n  public String text() { return text; }\n}\n\ninterface DocumentParser {\n  Document parse(InputStream in);\n}\n\nfinal class PdfParser implements DocumentParser {\n  public Document parse(InputStream in) { return new SimpleDocument('pdf'); }\n}\n\nfinal class WordParser implements DocumentParser {\n  public Document parse(InputStream in) { return new SimpleDocument('doc'); }\n}\n\nfinal class CsvParser implements DocumentParser {\n  public Document parse(InputStream in) { return new SimpleDocument('csv'); }\n}\n\nfinal class DocumentParserFactory {\n  private final Map<String, Supplier<DocumentParser>> registry = new HashMap<>();\n\n  DocumentParserFactory() {\n    registry.put('pdf', PdfParser::new);\n    registry.put('doc', WordParser::new);\n    registry.put('docx', WordParser::new);\n    registry.put('csv', CsvParser::new);\n  }\n\n  DocumentParser forFileName(String fileName) {\n    int dot = fileName.lastIndexOf('.');\n    if (dot < 0) {\n      throw new IllegalArgumentException('no extension');\n    }\n    String ext = fileName.substring(dot + 1).toLowerCase(Locale.ROOT);\n    Supplier<DocumentParser> supplier = registry.get(ext);\n    if (supplier == null) {\n      throw new IllegalArgumentException('unsupported ext: ' + ext);\n    }\n    return supplier.get();\n  }\n}",
        solutionExplanation:
          'Registration keeps the factory open for new extensions: add XmlParser class and one registry entry without touching other parsers.',
        designPrinciples: ['Factory Method', 'Open/Closed Principle', 'Single Responsibility'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l3-1-q1',
        'When is Factory Method most appropriate?',
        [
          'Exactly one concrete class forever',
          'Creation depends on type, config, or subclass policy',
          'Never — use only new',
          'Only for singletons',
        ],
        1,
        'Factory Method helps when the concrete product varies.',
      ),
      q(
        'l3-1-q2',
        'Simple Factory vs Factory Method: which uses inheritance heavily?',
        [
          'Simple Factory always',
          'Factory Method often uses creator subclasses',
          'Neither',
          'Only Builder',
        ],
        1,
        'Factory Method typically involves creator subclasses overriding factoryMethod.',
      ),
      q(
        'l3-1-q3',
        'How does Factory Method support OCP?',
        [
          'By deleting old classes',
          'By adding new products and creators without changing client code that depends on interfaces',
          'By using public fields',
          'By forbidding interfaces',
        ],
        1,
        'Clients program to Product; new concrete types extend behavior.',
      ),
      q(
        'l3-1-q4',
        'A static factory method advantage per Effective Java is:',
        [
          'It must be synchronized',
          'It can have a descriptive name and return cached instances',
          'It replaces equals/hashCode',
          'It removes garbage collection',
        ],
        1,
          'Named factories and caching are common motivations.',
      ),
      q(
        'l3-1-q5',
        'Which Java API behaves like a factory for iterators?',
        [
          'System.gc()',
          'Collection.iterator() overridden per collection type',
          'String.intern()',
          'Thread.sleep()',
        ],
        1,
        'Each collection returns its own iterator implementation.',
      ),
      q(
        'l3-1-q6',
        'Factory Method is over-engineering when:',
        [
          'You have many product types',
          'There is one trivial immutable type that never changes',
          'You need tests',
          'You use Spring',
        ],
        1,
        'Simple cases may not justify extra abstraction.',
      ),
    ],
    interviewTip:
      'Use Factory Method whenever object creation depends on a type, configuration, or context. Centralize creation logic and name factories clearly (VehicleFactory, not VehicleHelper). Say that adding a type should mean a new class and a localized factory change—not edits across the codebase.',
    connectedHLDTopics: [],
  },
  {
    id: 'abstract-factory',
    title: 'Abstract Factory Pattern',
    readContent: `# Abstract Factory Pattern

## The problem: families must stay consistent

Some systems need **families** of related objects that must work together. A UI toolkit must render a button, text field, and checkbox that all match the same theme. Mixing a Material button with an iOS checkbox breaks UX consistency. Likewise, a data access stack might require that connection pools, dialect-specific query builders, and migration tools all target the same vendor—mixing MySQL drivers with PostgreSQL-specific SQL is a recipe for runtime failure.

The Abstract Factory pattern provides an interface for creating families of related objects without naming concrete classes in client code. The client depends on abstract product interfaces (\`Button\`, \`TextField\`) and obtains them from an abstract factory (\`UIFactory\`). Concrete factories (\`MaterialUIFactory\`, \`IosUIFactory\`) produce matching sets.

## What Abstract Factory does

An **AbstractFactory** declares multiple factory methods—one per product kind. Each **ConcreteFactory** implements all methods so every product in the family is internally consistent. This differs from Factory Method, which often focuses on creating **one** product type with subclassed creators. Abstract Factory is “a factory of factories” in intuition: one object encapsulates the creation of an entire related set.

## How it differs from Factory Method

Factory Method: one product line, creation delegated to subclasses. Abstract Factory: multiple product lines (button, checkbox, window) created together. If you only ever create one object type, Abstract Factory is likely too heavy.

## When to use Abstract Factory

Use it when you must swap entire product families (themes, database vendors, game asset packs), when cross-product consistency is a correctness requirement, or when you want configuration-time selection of a whole stack. LLD examples: cross-platform notification stacks (Android vs iOS push pipelines), pluggable infrastructure (MySQL stack vs Postgres stack), themed game asset bundles (forest enemies vs desert enemies).

## When not to use it

Avoid it when there is only one product type, when families are not truly related, or when the product **kinds** change frequently. Adding a new abstract product method (e.g., \`createSlider()\`) forces changes to **every** concrete factory—an OCP pressure point at the factory interface level. Abstract Factory works best when product categories are relatively stable but families vary.

## Real Java flavor

JDBC \`Driver\` and related APIs echo abstract factories: a driver vendor supplies consistent connection, statement, and metadata objects. UI toolkits and look-and-feel packages also compose families.

## Limitation (interview gold)

Interviewers like when you acknowledge tradeoffs: extending **families** is easy; extending the **matrix** with new product types touches all factories. Mitigations include abstract factory plus separate plugin registries, or combining with Factory Method inside each concrete factory.

> ANALOGY: Abstract Factory is like buying a coordinated furniture set—modern sofa, table, and chair match. You do not mix modern sofa with rustic table from another line.

> INTERVIEW TIP: Say: “I use Abstract Factory when I need consistent families—database vendor components or UI theme components must come from one factory so we never mix incompatible implementations.”

> IMPORTANT: If new **kinds** of products are added often, budget refactors across all concrete factories or consider a more dynamic registry approach.

## Why this matters for LLD interviews

Questions about multi-platform apps, theming, or swappable infrastructure maps cleanly to Abstract Factory. Naming the consistency constraint and the OCP limitation shows senior-level thinking.`,
    codeExamples: [
      {
        id: 'l3-2-db',
        title: 'Abstract Factory: Database Access',
        language: 'java',
        isGood: true,
        code:
          "interface Connection {\n  void ping();\n}\n\ninterface QueryBuilder {\n  String buildSelect(String table);\n}\n\ninterface Migrator {\n  void apply(String ddl);\n}\n\ninterface DatabaseFactory {\n  Connection createConnection();\n  QueryBuilder createQueryBuilder();\n  Migrator createMigrator();\n}\n\nfinal class MySqlConnection implements Connection {\n  public void ping() { System.out.println('mysql ping'); }\n}\n\nfinal class MySqlQueryBuilder implements QueryBuilder {\n  public String buildSelect(String table) { return 'SELECT * FROM ' + table; }\n}\n\nfinal class MySqlMigrator implements Migrator {\n  public void apply(String ddl) { }\n}\n\nfinal class MySqlFactory implements DatabaseFactory {\n  public Connection createConnection() { return new MySqlConnection(); }\n  public QueryBuilder createQueryBuilder() { return new MySqlQueryBuilder(); }\n  public Migrator createMigrator() { return new MySqlMigrator(); }\n}\n\nfinal class PostgresFactory implements DatabaseFactory {\n  public Connection createConnection() { return new PostgresConnection(); }\n  public QueryBuilder createQueryBuilder() { return new PostgresQueryBuilder(); }\n  public Migrator createMigrator() { return new PostgresMigrator(); }\n}\n\nfinal class PostgresConnection implements Connection {\n  public void ping() { System.out.println('postgres ping'); }\n}\nfinal class PostgresQueryBuilder implements QueryBuilder {\n  public String buildSelect(String table) { return 'SELECT * FROM ' + table; }\n}\nfinal class PostgresMigrator implements Migrator {\n  public void apply(String ddl) { }\n}\n\nfinal class OrderRepository {\n  private final DatabaseFactory factory;\n\n  OrderRepository(DatabaseFactory factory) {\n    this.factory = factory;\n  }\n\n  void smokeTest() {\n    try (var c = factory.createConnection()) {\n      c.ping();\n    }\n  }\n}",
        explanation:
          'Client code depends on DatabaseFactory and abstract products; swapping MySqlFactory for PostgresFactory replaces the whole stack consistently.',
      },
      {
        id: 'l3-2-ui',
        title: 'Abstract Factory: UI Theme',
        language: 'java',
        isGood: true,
        code:
          "interface Button {\n  void render();\n}\n\ninterface TextField {\n  void render();\n}\n\ninterface UIFactory {\n  Button createButton();\n  TextField createTextField();\n}\n\nfinal class MaterialButton implements Button {\n  public void render() { System.out.println('Material button'); }\n}\n\nfinal class MaterialTextField implements TextField {\n  public void render() { System.out.println('Material field'); }\n}\n\nfinal class MaterialFactory implements UIFactory {\n  public Button createButton() { return new MaterialButton(); }\n  public TextField createTextField() { return new MaterialTextField(); }\n}\n\nfinal class IOSButton implements Button {\n  public void render() { System.out.println('iOS button'); }\n}\n\nfinal class IOSTextField implements TextField {\n  public void render() { System.out.println('iOS field'); }\n}\n\nfinal class IOSFactory implements UIFactory {\n  public Button createButton() { return new IOSButton(); }\n  public TextField createTextField() { return new IOSTextField(); }\n}\n\nfinal class Screen {\n  private final Button button;\n  private final TextField field;\n\n  Screen(UIFactory factory) {\n    this.button = factory.createButton();\n    this.field = factory.createTextField();\n  }\n\n  void draw() {\n    button.render();\n    field.render();\n  }\n}",
        explanation:
          'Changing the injected UIFactory switches the entire visual family in one configuration point.',
      },
    ],
    diagrams: [
      {
        id: 'l3-2-d1',
        title: 'Abstract factory and product families',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass DatabaseFactory {\n  <<interface>>\n  +createConnection()\n  +createQueryBuilder()\n  +createMigrator()\n}\nclass MySqlFactory\nclass PostgresFactory\nclass Connection {\n  <<interface>>\n}\nclass QueryBuilder {\n  <<interface>>\n}\nDatabaseFactory <|.. MySqlFactory\nDatabaseFactory <|.. PostgresFactory\nMySqlFactory ..> Connection\nPostgresFactory ..> Connection',
      },
    ],
    exercises: [
      {
        id: 'l3-2-ex1',
        title: 'Cross-Platform Notification System',
        difficulty: 'medium',
        description: 'Android and iOS each need push, in-app, and sound components that must stay consistent per platform.',
        requirements: [
          'NotificationFactory with createPush(), createInApp(), createSound().',
          'AndroidNotificationFactory and IOSNotificationFactory implementations.',
          'Client code depends only on NotificationFactory and abstract product interfaces.',
        ],
        starterCode:
          "interface PushNotification { void show(String title); }\ninterface InAppNotification { void banner(String msg); }\ninterface NotificationSound { void play(); }\n\ninterface NotificationFactory {\n  // TODO\n}\n",
        testCases: [
          'Android factory returns Android-styled implementations.',
          'iOS factory returns iOS-styled implementations.',
          'Client can swap factory without changing call sites.',
        ],
        hints: [
          'Define three product interfaces first.',
          'Each concrete factory implements all three creators.',
          'Inject NotificationFactory into application bootstrap.',
        ],
        solution:
          "interface PushNotification {\n  void show(String title);\n}\n\ninterface InAppNotification {\n  void banner(String msg);\n}\n\ninterface NotificationSound {\n  void play();\n}\n\ninterface NotificationFactory {\n  PushNotification createPush();\n  InAppNotification createInApp();\n  NotificationSound createSound();\n}\n\nfinal class AndroidPush implements PushNotification {\n  public void show(String title) { System.out.println('android push ' + title); }\n}\n\nfinal class AndroidInApp implements InAppNotification {\n  public void banner(String msg) { System.out.println('android banner ' + msg); }\n}\n\nfinal class AndroidSound implements NotificationSound {\n  public void play() { System.out.println('android sound'); }\n}\n\nfinal class AndroidNotificationFactory implements NotificationFactory {\n  public PushNotification createPush() { return new AndroidPush(); }\n  public InAppNotification createInApp() { return new AndroidInApp(); }\n  public NotificationSound createSound() { return new AndroidSound(); }\n}\n\nfinal class IOSPush implements PushNotification {\n  public void show(String title) { System.out.println('ios push ' + title); }\n}\n\nfinal class IOSInApp implements InAppNotification {\n  public void banner(String msg) { System.out.println('ios banner ' + msg); }\n}\n\nfinal class IOSSound implements NotificationSound {\n  public void play() { System.out.println('ios sound'); }\n}\n\nfinal class IOSNotificationFactory implements NotificationFactory {\n  public PushNotification createPush() { return new IOSPush(); }\n  public InAppNotification createInApp() { return new IOSInApp(); }\n  public NotificationSound createSound() { return new IOSSound(); }\n}\n\nfinal class NotificationClient {\n  private final NotificationFactory factory;\n\n  NotificationClient(NotificationFactory factory) {\n    this.factory = factory;\n  }\n\n  void demo() {\n    factory.createPush().show('hello');\n    factory.createInApp().banner('sale');\n    factory.createSound().play();\n  }\n}",
        solutionExplanation:
          'Each platform factory returns a coherent triple of implementations, preventing mixed-platform UI or audio behavior.',
        designPrinciples: ['Abstract Factory', 'Dependency Inversion', 'Interface Segregation'],
        connectedHLDTopic: null,
      },
      {
        id: 'l3-2-ex2',
        title: 'Theme switch at runtime',
        difficulty: 'easy',
        description: 'Given UIFactory, write a Settings class that swaps Material vs IOS theme.',
        requirements: [
          'Hold UIFactory reference.',
          'Method applyTheme(UIFactory) replaces factory.',
          'Screen redraw uses new factory products.',
        ],
        starterCode:
          "interface Button { void render(); }\ninterface UIFactory { Button createButton(); }\n// TODO: Settings class\n",
        testCases: ['applyTheme swaps button implementation.', 'No direct new MaterialButton in Screen.'],
        hints: [
          'Store UIFactory as a field.',
          'Recreate UI components when theme changes.',
          'Keep Screen depending on interfaces only.',
        ],
        solution:
          "interface Button {\n  void render();\n}\n\ninterface UIFactory {\n  Button createButton();\n}\n\nfinal class Settings {\n  private UIFactory theme;\n\n  Settings(UIFactory initial) {\n    this.theme = initial;\n  }\n\n  void applyTheme(UIFactory factory) {\n    this.theme = factory;\n  }\n\n  UIFactory theme() {\n    return theme;\n  }\n}\n\nfinal class Screen {\n  private final Settings settings;\n\n  Screen(Settings settings) {\n    this.settings = settings;\n  }\n\n  void draw() {\n    settings.theme().createButton().render();\n  }\n}",
        solutionExplanation:
          'Runtime theme switching is just swapping the abstract factory implementation.',
        designPrinciples: ['Abstract Factory', 'Dependency Injection'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l3-2-q1',
        'Abstract Factory vs Factory Method: which builds whole families?',
        ['Factory Method only', 'Abstract Factory', 'Singleton', 'Adapter'],
        1,
        'Abstract Factory coordinates multiple related products.',
      ),
      q(
        'l3-2-q2',
        'Main risk when adding a new product kind to Abstract Factory?',
        [
          'No impact',
          'Must update abstract factory interface and all concrete factories',
          'Only update one class',
          'Only update tests',
        ],
        1,
        'New abstract methods ripple across all concrete factories.',
      ),
      q(
        'l3-2-q3',
        'When is Abstract Factory a good fit?',
        [
          'Single class with one field',
          'Need consistent bundles (theme, vendor stack)',
          'Only primitive types',
          'Never',
        ],
        1,
        'Families must stay internally compatible.',
      ),
      q(
        'l3-2-q4',
        'Client code in Abstract Factory should depend on?',
        ['Concrete PostgresConnection', 'Abstract factory and abstract products', 'String names only', 'Static utilities'],
        1,
        'Depend on abstractions for flexibility.',
      ),
      q(
        'l3-2-q5',
        'JDBC driver stacks resemble Abstract Factory because?',
        [
          'They use only primitives',
          'Vendor provides coherent connection/statement family',
          'They forbid interfaces',
          'They compile SQL',
        ],
        1,
        'Vendor-specific objects are designed to work together.',
      ),
      q(
        'l3-2-q6',
        'Abstract Factory is poor when?',
        [
          'Families are stable',
          'Product kinds churn constantly and matrix grows',
          'You need themes',
          'You need dependency injection',
        ],
        1,
        'Frequent new product categories cause wide interface churn.',
      ),
    ],
    interviewTip:
      'Use Abstract Factory when you need consistent families of objects. Factory Method creates one thing; Abstract Factory creates a matching set. Mention platform-specific behavior or swappable backends as triggers.',
    connectedHLDTopics: ['monolith-vs-microservices'],
  },
  {
    id: 'builder-pattern',
    title: 'Builder Pattern',
    readContent: `# Builder Pattern

## The problem: complex construction explodes

Real domain objects often need many attributes: users with profile, preferences, roles, addresses; orders with line items, discounts, delivery windows; HTTP requests with URL, method, headers, body, timeouts, and retry policies. A single constructor with ten parameters is unreadable at call sites: \`new User("John", "john@x.com", 25, "555", null, null, "ADMIN", true, false, "dark")\`. Which boolean is which? Which null means “unset” versus “explicitly absent”? This is the **telescoping constructor** anti-pattern: overloads with increasing parameter counts that still confuse readers and encourage positional mistakes.

In LLD interviews, clarity of object construction signals engineering maturity. Interviewers probe edge cases: “What if phone is optional?” “What if address is required only for shipping?” Builders encode those rules explicitly.

## What Builder does

The Builder pattern separates **construction** from **representation**. A dedicated builder accumulates parameters through named, fluent methods, validates invariants, then atomically constructs the target object. The final object can be immutable: all fields \`final\`, no setters—builder mutability is temporary scaffolding.

## Telescoping constructor vs Builder

Telescoping constructors multiply overloads and still fail to express optional combinations cleanly. Builder replaces positional parameters with **named steps**: \`User.builder().name("John").email("a@b.com").role("ADMIN").build()\`.

## Implementation sketch in Java

Use a static nested \`Builder\` with fields mirroring the product. Each setter returns \`this\` for chaining. The outer class has a **private** constructor taking \`Builder\`. \`build()\` validates required fields and may throw \`IllegalStateException\` if invariants fail. Optional fields default in the builder.

## Required vs optional fields

Required values can be builder constructor parameters or validated in \`build()\`. Optional fields get sensible defaults in the builder. This prevents half-initialized objects escaping into the system—another LLD win.

## Immutability + Builder

Builder is a standard way to construct immutable value objects: collect mutable state in builder, then freeze into immutable product. This pairs well with concurrency and defensive design.

## Lombok @Builder

Many teams use Lombok \`@Builder\` to codegen builders. Interviews still expect you to explain manual structure: interviewers want conceptual clarity, not annotation magic.

## When not to use Builder

Skip it for trivial types with one to three fields and no optional combinations. Do not force immutability via builder if the domain requires heavy post-construction mutation—consider a different lifecycle model.

## LLD examples

\`HttpRequest\` builders, SQL/query builders, test data builders, configuration objects, and pizza/order models all benefit. Anywhere readability and validation matter, Builder shines.

> ANALOGY: Builder is like ordering a custom sandwich: bread, protein, toppings, condiments—each choice is explicit. You do not order “combo #7” unless you memorize the chart.

> INTERVIEW TIP: Say: “More than three to four parameters or multiple optionals → Builder with validation in build().”

> IMPORTANT: Always validate in \`build()\` so invalid aggregates cannot exist.

## Why this matters for LLD interviews

Builders demonstrate API ergonomics, invariants, and immutability—topics interviewers love. They also pair naturally with factories: a factory might choose which builder preset to use.

## Common follow-up questions

Interviewers often ask how you handle **partial builds** or **stepwise validation**—for example, ensuring shipping address exists only when physical delivery is selected. The clean answer is to keep validation in \`build()\` and model mutually exclusive options as enums or sealed types so illegal combinations are rejected in one place. Another follow-up is **thread-safety**: builders are typically not thread-safe; if two threads mutate the same builder instance, you can corrupt state. For concurrent construction, create a builder per thread or synchronize—most domain objects are built on a single thread anyway.

## LLD tradeoffs

Builders add boilerplate: nested class, duplicated field names, and maintenance when fields evolve. Teams mitigate this with Lombok or records plus factories. Also, builders do not automatically make APIs discoverable—document defaults in Javadoc and keep method names consistent (\`withX\` vs \`setX\` vs bare \`x()\`).

## Mistakes to avoid

Returning partially constructed objects from intermediate steps, forgetting to copy collections defensively in \`build()\`, and allowing \`build()\` to succeed with contradictory fields (e.g., express shipping without address). Treat \`build()\` as a transaction boundary.`,
    codeExamples: [
      {
        id: 'l3-3-bad',
        title: 'Bad: Telescoping Constructor',
        language: 'java',
        isGood: false,
        code:
          "final class Order {\n  private final String customer;\n  private final String item;\n  private final int quantity;\n  private final String address;\n\n  Order(String customer) {\n    this(customer, null, 1, null);\n  }\n\n  Order(String customer, String item) {\n    this(customer, item, 1, null);\n  }\n\n  Order(String customer, String item, int quantity) {\n    this(customer, item, quantity, null);\n  }\n\n  Order(String customer, String item, int quantity, String address) {\n    this.customer = customer;\n    this.item = item;\n    this.quantity = quantity;\n    this.address = address;\n  }\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    // Which parameter is missing meaning? Hard to read at scale.\n    Order o = new Order('Ann', 'Pizza', 2, '123 Main');\n  }\n}",
        explanation:
          'Overload explosion still yields positional confusion and many combinations to maintain.',
      },
      {
        id: 'l3-3-good',
        title: 'Good: Builder Pattern',
        language: 'java',
        isGood: true,
        code:
          "final class Order {\n  private final String customer;\n  private final String item;\n  private final int quantity;\n  private final String address;\n\n  private Order(Builder b) {\n    this.customer = b.customer;\n    this.item = b.item;\n    this.quantity = b.quantity;\n    this.address = b.address;\n  }\n\n  static Builder builder() {\n    return new Builder();\n  }\n\n  static final class Builder {\n    private String customer;\n    private String item;\n    private int quantity = 1;\n    private String address;\n\n    Builder customer(String customer) {\n      this.customer = customer;\n      return this;\n    }\n\n    Builder item(String item) {\n      this.item = item;\n      return this;\n    }\n\n    Builder quantity(int quantity) {\n      this.quantity = quantity;\n      return this;\n    }\n\n    Builder address(String address) {\n      this.address = address;\n      return this;\n    }\n\n    Order build() {\n      if (customer == null || item == null) {\n        throw new IllegalStateException('customer and item required');\n      }\n      return new Order(this);\n    }\n  }\n}",
        explanation:
          'Named steps and validation in build() make construction readable and safe.',
      },
      {
        id: 'l3-3-validate',
        title: 'Builder with Validation',
        language: 'java',
        isGood: true,
        code:
          "final class HttpRequest {\n  private final String url;\n  private final String method;\n  private final String body;\n\n  private HttpRequest(Builder b) {\n    this.url = b.url;\n    this.method = b.method;\n    this.body = b.body;\n  }\n\n  static Builder builder() { return new Builder(); }\n\n  static final class Builder {\n    private String url;\n    private String method = 'GET';\n    private String body;\n\n    Builder url(String url) {\n      this.url = url;\n      return this;\n    }\n\n    Builder method(String method) {\n      this.method = method;\n      return this;\n    }\n\n    Builder body(String body) {\n      this.body = body;\n      return this;\n    }\n\n    HttpRequest build() {\n      if (url == null || url.isBlank()) {\n        throw new IllegalStateException('url required');\n      }\n      String m = method.toUpperCase();\n      boolean bodyAllowed = m.equals('POST') || m.equals('PUT');\n      if (!bodyAllowed && body != null) {\n        throw new IllegalStateException('body not allowed for ' + m);\n      }\n      return new HttpRequest(this);\n    }\n  }\n}",
        explanation:
          'Cross-field rules (body only for POST/PUT) belong in build(), not scattered across callers.',
      },
    ],
    diagrams: [
      {
        id: 'l3-3-d1',
        title: 'Builder and product',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Order {\n  -customer: String\n  -item: String\n  -quantity: int\n  -Order(Builder)\n}\nclass Builder {\n  +customer(String): Builder\n  +item(String): Builder\n  +quantity(int): Builder\n  +build(): Order\n}\nOrder +-- Builder : nested',
      },
    ],
    exercises: [
      {
        id: 'l3-3-ex1',
        title: 'Pizza Builder',
        difficulty: 'easy',
        description: 'Build a Pizza with crust, size, toppings, sauce, gluten-free flag using Builder.',
        requirements: [
          'Enums for crust, size (SMALL, MEDIUM, LARGE), sauce default TOMATO.',
          'cheese defaults true; toppings optional list.',
          'build() validates size and produces immutable Pizza.',
        ],
        starterCode:
          "enum Crust { THIN, REGULAR, STUFFED }\nenum Size { SMALL, MEDIUM, LARGE }\nenum Sauce { TOMATO, PESTO, WHITE }\n\nfinal class Pizza {\n  // TODO: fields + private ctor + Builder\n}\n",
        testCases: [
          'Invalid size rejected.',
          'Immutable: no setters after build.',
          'Toppings list not shared mutable reference.',
        ],
        hints: [
          'Use static nested Builder with defaults.',
          'Copy toppings list in build().',
          'Validate enum nulls and size.',
        ],
        solution:
          "import java.util.ArrayList;\nimport java.util.Collections;\nimport java.util.List;\n\nenum Crust { THIN, REGULAR, STUFFED }\nenum Size { SMALL, MEDIUM, LARGE }\nenum Sauce { TOMATO, PESTO, WHITE }\n\nfinal class Pizza {\n  private final Crust crust;\n  private final Size size;\n  private final boolean cheese;\n  private final List<String> toppings;\n  private final Sauce sauce;\n  private final boolean glutenFree;\n\n  private Pizza(Builder b) {\n    this.crust = b.crust;\n    this.size = b.size;\n    this.cheese = b.cheese;\n    this.toppings = List.copyOf(b.toppings);\n    this.sauce = b.sauce;\n    this.glutenFree = b.glutenFree;\n  }\n\n  static Builder builder() { return new Builder(); }\n\n  static final class Builder {\n    private Crust crust;\n    private Size size;\n    private boolean cheese = true;\n    private final List<String> toppings = new ArrayList<>();\n    private Sauce sauce = Sauce.TOMATO;\n    private boolean glutenFree = false;\n\n    Builder crust(Crust crust) { this.crust = crust; return this; }\n    Builder size(Size size) { this.size = size; return this; }\n    Builder cheese(boolean cheese) { this.cheese = cheese; return this; }\n    Builder addTopping(String t) { toppings.add(t); return this; }\n    Builder sauce(Sauce sauce) { this.sauce = sauce; return this; }\n    Builder glutenFree(boolean g) { this.glutenFree = g; return this; }\n\n    Pizza build() {\n      if (crust == null || size == null) {\n        throw new IllegalStateException('crust and size required');\n      }\n      return new Pizza(this);\n    }\n  }\n}",
        solutionExplanation:
          'List.copyOf ensures immutability; build() enforces required fields.',
        designPrinciples: ['Builder', 'Immutability', 'Validation'],
        connectedHLDTopic: null,
      },
      {
        id: 'l3-3-ex2',
        title: 'HTTP Request Builder',
        difficulty: 'medium',
        description: 'HttpRequest with url, method, headers, body, timeout, retries.',
        requirements: [
          'url and method required.',
          'body only for POST/PUT; GET/DELETE must not set body.',
          'timeout default 30s; retries default 0.',
        ],
        starterCode:
          "import java.util.HashMap;\nimport java.util.Map;\n\nfinal class HttpRequest {\n  // TODO: Builder with validation\n}\n",
        testCases: [
          'GET with body fails build.',
          'POST with body allowed.',
          'Empty url fails.',
        ],
        hints: [
          'Normalize method to uppercase in build().',
          'Store headers in builder map; copy in build().',
          'Use IllegalStateException for invalid combos.',
        ],
        solution:
          "import java.util.HashMap;\nimport java.util.Map;\n\nfinal class HttpRequest {\n  private final String url;\n  private final String method;\n  private final Map<String, String> headers;\n  private final String body;\n  private final int timeoutSeconds;\n  private final int retries;\n\n  private HttpRequest(Builder b) {\n    this.url = b.url;\n    this.method = b.method;\n    this.headers = Map.copyOf(b.headers);\n    this.body = b.body;\n    this.timeoutSeconds = b.timeoutSeconds;\n    this.retries = b.retries;\n  }\n\n  static Builder builder() { return new Builder(); }\n\n  static final class Builder {\n    private String url;\n    private String method;\n    private final Map<String, String> headers = new HashMap<>();\n    private String body;\n    private int timeoutSeconds = 30;\n    private int retries = 0;\n\n    Builder url(String url) { this.url = url; return this; }\n    Builder method(String method) { this.method = method; return this; }\n    Builder header(String k, String v) { headers.put(k, v); return this; }\n    Builder body(String body) { this.body = body; return this; }\n    Builder timeoutSeconds(int s) { this.timeoutSeconds = s; return this; }\n    Builder retries(int r) { this.retries = r; return this; }\n\n    HttpRequest build() {\n      if (url == null || url.isBlank()) throw new IllegalStateException('url');\n      if (method == null || method.isBlank()) throw new IllegalStateException('method');\n      String m = method.toUpperCase();\n      boolean bodyOk = m.equals('POST') || m.equals('PUT');\n      if (!bodyOk && body != null) throw new IllegalStateException('body not allowed');\n      if (bodyOk && body == null) throw new IllegalStateException('body required');\n      return new HttpRequest(this);\n    }\n  }\n}",
        solutionExplanation:
          'Validation encodes HTTP semantics in one place; Map.copyOf freezes headers.',
        designPrinciples: ['Builder', 'Defensive Copying', 'Invariant Enforcement'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l3-3-q1',
        'Builder primarily solves?',
        [
          'Slow CPU',
          'Unreadable/telescoping multi-parameter construction',
          'Garbage collection pauses',
          'Inheritance depth',
        ],
        1,
        'Named fluent configuration replaces positional parameters.',
      ),
      q(
        'l3-3-q2',
        'Validation should usually happen?',
        ['In every setter', 'In build()', 'Never', 'Only in toString()'],
        1,
        'build() ensures atomic creation of valid aggregates.',
      ),
      q(
        'l3-3-q3',
        'Method chaining works because setters?',
        ['Return void', 'Return this', 'Are static', 'Throw always'],
        1,
        'Fluent APIs return the builder.',
      ),
      q(
        'l3-3-q4',
        'Immutability pairs with Builder by?',
        [
          'Public setters on product',
          'Private product ctor + final fields',
          'Synchronized builders only',
          'Using clone()',
        ],
        1,
        'Product is frozen after build; builder is temporary.',
      ),
      q(
        'l3-3-q5',
        'Telescoping constructor problem is?',
        [
          'Too few types',
          'Many overloads yet poor readability and combinatorics',
          'No inheritance',
          'Too many interfaces',
        ],
        1,
        'Overload explosion does not fix optional clarity.',
      ),
      q(
        'l3-3-q6',
        'Lombok @Builder is?',
        [
          'A JDK feature',
          'Code generation for builder boilerplate',
          'Replacement for equals',
          'Deprecated since Java 8',
        ],
        1,
        'Teams use it after understanding manual builders.',
      ),
    ],
    interviewTip:
      'Use Builder for classes with more than three to four parameters or meaningful optional fields. Implement as a static nested class with method chaining and validate in build(). That prevents invalid objects and impresses interviewers with API clarity.',
    connectedHLDTopics: [],
  },
  {
    id: 'singleton-pattern',
    title: 'Singleton Pattern (and Its Problems)',
    readContent: `# Singleton Pattern (and Its Problems)

## What Singleton tries to solve

Some resources are naturally global and expensive: a connection pool, a shared cache facade, or configuration loaded once. Singleton ensures a class has only one instance and provides a global access point—typically \`getInstance()\`—while hiding the constructor.

## Classic mechanics

Private constructor, private static field holding the instance, public static accessor. **Lazy** initialization creates on first use; **eager** creates at class load time. Both are simple on paper.

## Thread safety

Unsynchronized lazy init can double-instantiate under concurrency: two threads see \`null\`, both construct. Fixes include \`synchronized\` methods (simple but contended), **double-checked locking** with \`volatile\`, **initialization-on-demand holder idiom** (lazy + safe via classloader semantics), and **enum singleton**—Josh Bloch’s preferred idiom: \`public enum Pool { INSTANCE; ... }\`.

## Why Singleton is controversial

**Global state** complicates reasoning—anyone can call \`getInstance()\` and mutate. **Testing** suffers: you cannot easily substitute a mock; tests share hidden state and ordering becomes flaky. **Hidden dependencies**: \`new OrderService()\` that internally calls \`DatabasePool.getInstance()\` obscures coupling compared to constructor injection. **SRP tension**: the class mixes domain behavior with lifecycle control. **DIP violation**: callers bind to concrete singleton accessor rather than abstraction.

## Better alternative: dependency injection

Let the container (Spring) manage one instance per scope (default singleton bean). Dependencies are explicit in constructors; tests inject fakes. You keep “only one pool” without global statics.

## When Singleton is still acceptable

Enum singleton for truly global constants; thin logging facades; legacy constraints. Even then, prefer interfaces + DI where possible.

> IMPORTANT: In modern Spring-style Java, manual Singleton is rarely needed—framework singleton scopes achieve uniqueness without static globals.

> INTERVIEW TIP: If you mention Singleton, immediately discuss drawbacks and enum or DI alternatives. Nuance scores higher than blind pattern use.

## Why this matters for LLD interviews

Interviewers test whether you understand testability and explicit dependencies. Singleton vs DI is a common follow-up.

## Lifecycle in distributed systems

Even when you want a single pool per JVM, containers may run multiple replicas—**process-level** singleton does not imply **cluster-wide** singleton. Coordination across nodes needs distributed locks or external stores. Mentioning this in HLD/LLD bridging questions shows depth.

## Serialization pitfalls

Classic singleton breaks when deserialization creates new instances unless guarded. Enum singleton avoids many pitfalls. If you must serialize, specify \`readResolve\` or avoid singleton pattern entirely.

## Practical guidance

Prefer **scoped singletons** via CDI/Spring (\`@Singleton\`, default singleton beans) with interfaces. Keep statics for pure functions or constants, not for service wiring.`,
    codeExamples: [
      {
        id: 'l3-4-bad',
        title: 'Bad: Non-Thread-Safe Singleton',
        language: 'java',
        isGood: false,
        code:
          "final class CounterService {\n  private static CounterService instance;\n\n  private CounterService() { }\n\n  static CounterService getInstance() {\n    if (instance == null) {\n      instance = new CounterService(); // race: two threads can both enter here\n    }\n    return instance;\n  }\n}",
        explanation:
          'Concurrent first-use can construct two instances—breaking singleton guarantees.',
      },
      {
        id: 'l3-4-enum',
        title: 'Thread-Safe: Enum Singleton',
        language: 'java',
        isGood: true,
        code:
          "enum DatabasePool {\n  INSTANCE;\n\n  public String acquire() {\n    return 'conn';\n  }\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    DatabasePool.INSTANCE.acquire();\n  }\n}",
        explanation:
          'Enum singleton is serializable-safe, reflection-safe, and thread-safe by language rules.',
      },
      {
        id: 'l3-4-di',
        title: 'Better: Dependency Injection',
        language: 'java',
        isGood: true,
        code:
          "interface ConnectionPool {\n  String acquire();\n}\n\nfinal class AppPool implements ConnectionPool {\n  public String acquire() { return 'conn'; }\n}\n\nfinal class OrderService {\n  private final ConnectionPool pool;\n\n  OrderService(ConnectionPool pool) {\n    this.pool = pool;\n  }\n\n  void place() {\n    pool.acquire();\n  }\n}\n\nfinal class Test {\n  public static void main(String[] args) {\n    OrderService svc = new OrderService(new AppPool());\n    svc.place();\n  }\n}",
        explanation:
          'Tests can pass a fake pool; no static global, dependency is explicit.',
      },
    ],
    diagrams: [
      {
        id: 'l3-4-d1',
        title: 'Singleton access',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Singleton {\n  -static instance\n  -Singleton()\n  +getInstance() Singleton\n}',
      },
    ],
    exercises: [
      {
        id: 'l3-4-ex1',
        title: 'Configuration Manager: Enum vs DI',
        difficulty: 'easy',
        description: 'Implement settings reader as enum singleton, then show DI variant.',
        requirements: [
          'Enum ConfigurationManager with getString, getInt default, getBoolean default.',
          'reload() method.',
          'Alternate plain class injected via constructor.',
        ],
        starterCode:
          "enum ConfigurationManager {\n  INSTANCE;\n  // TODO\n}\n",
        testCases: ['Singleton identity stable.', 'DI version accepts Properties in ctor.'],
        hints: [
          'Store Properties inside enum instance.',
          'reload replaces Properties from stream.',
          'DI class takes Properties via constructor for tests.',
        ],
        solution:
          "import java.io.IOException;\nimport java.io.StringReader;\nimport java.util.Properties;\n\nenum ConfigurationManager {\n  INSTANCE;\n\n  private Properties props = new Properties();\n\n  public synchronized void reload(String data) throws IOException {\n    Properties p = new Properties();\n    p.load(new StringReader(data));\n    this.props = p;\n  }\n\n  public String getString(String key) {\n    return props.getProperty(key);\n  }\n\n  public int getInt(String key, int def) {\n    String v = props.getProperty(key);\n    return v == null ? def : Integer.parseInt(v);\n  }\n\n  public boolean getBoolean(String key, boolean def) {\n    String v = props.getProperty(key);\n    return v == null ? def : Boolean.parseBoolean(v);\n  }\n}\n\nfinal class ConfigService {\n  private final Properties props;\n\n  ConfigService(Properties props) {\n    this.props = props;\n  }\n\n  String getString(String key) {\n    return props.getProperty(key);\n  }\n}",
        solutionExplanation:
          'Enum gives global process-wide config; DI version is trivially mockable in tests.',
        designPrinciples: ['Singleton', 'Dependency Inversion'],
        connectedHLDTopic: null,
      },
      {
        id: 'l3-4-ex2',
        title: 'Refactor Logger Singleton to DI',
        difficulty: 'medium',
        description: 'Replace Logger.getInstance() with injected Logger interface.',
        requirements: [
          'Logger interface with log(String).',
          'ConsoleLogger and FileLogger implementations.',
          'Service takes Logger in constructor.',
          'Test uses FakeLogger.',
        ],
        starterCode:
          "// Before: Logger.getInstance().log('x');\n// TODO: interface + DI\n",
        testCases: ['FakeLogger captures messages.', 'No static getInstance in service.'],
        hints: [
          'Define Logger interface in domain package.',
          'Remove static field from service; add ctor param.',
          'In test, assert fake received message.',
        ],
        solution:
          "interface Logger {\n  void log(String msg);\n}\n\nfinal class ConsoleLogger implements Logger {\n  public void log(String msg) { System.out.println(msg); }\n}\n\nfinal class FileLogger implements Logger {\n  public void log(String msg) { }\n}\n\nfinal class FakeLogger implements Logger {\n  String last;\n  public void log(String msg) { last = msg; }\n}\n\nfinal class PaymentService {\n  private final Logger logger;\n\n  PaymentService(Logger logger) {\n    this.logger = logger;\n  }\n\n  void pay() {\n    logger.log('paid');\n  }\n}",
        solutionExplanation:
          'Dependency injection makes logging explicit and tests deterministic without global state.',
        designPrinciples: ['Dependency Inversion', 'Testability'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l3-4-q1',
        'Double-checked locking needs instance as?',
        ['int', 'volatile', 'float', 'byte'],
        1,
        'volatile publishes safe publication for singleton.',
      ),
      q(
        'l3-4-q2',
        'Enum singleton advantage?',
        ['Slower than all', 'Thread-safe and serialization-friendly by design', 'Requires subclassing', 'No methods allowed'],
        1,
        'Bloch recommends enum for many singletons.',
      ),
      q(
        'l3-4-q3',
        'Main testing issue with static Singleton?',
        [
          'Too fast',
          'Hard to replace with mock; shared global state',
          'Requires Java 21',
          'Cannot compile',
        ],
        1,
        'Globals create order-dependent tests.',
      ),
      q(
        'l3-4-q4',
        'Preferred modern alternative in enterprise Java?',
        ['More singletons', 'Dependency injection with scoped beans', 'More static blocks', 'Cloneable'],
        1,
        'Containers manage single instances without static accessors.',
      ),
      q(
        'l3-4-q5',
        'Hidden dependency problem means?',
        [
          'Constructor params visible',
          'Class calls getInstance internally — coupling not visible in API',
          'Too many interfaces',
          'Immutable objects',
        ],
        1,
        'Static lookups hide collaborators.',
      ),
      q(
        'l3-4-q6',
        'Eager singleton initializes when?',
        [
          'First garbage collection',
          'Class is loaded',
          'Never',
          'Only on Sunday',
        ],
        1,
        'Static initializer/class loading triggers eager creation.',
      ),
    ],
    interviewTip:
      'If you use Singleton in an interview, acknowledge tradeoffs and prefer dependency injection for testability. Show the enum singleton when asked for implementation. Framework-managed singletons replace most hand-written globals.',
    connectedHLDTopics: [],
  },
  {
    id: 'prototype-pattern',
    title: 'Prototype Pattern',
    readContent: `# Prototype Pattern

## The problem: expensive or repetitive construction

Sometimes object creation is costly: loading templates from disk, parsing configuration, hitting the database for defaults, or computing derived fields. Other times you need many near-duplicate objects—game enemies, document drafts, test fixtures—where only a few attributes differ. Constructing each instance from scratch duplicates work and clutters call sites.

Prototype solves this by **cloning** an exemplar object and applying small deltas. Instead of a long constructor sequence each time, you start from a validated template.

## What Prototype does

Define prototype objects that know how to produce duplicates. Callers invoke \`clone()\` or a copy method to obtain a fresh instance. In Java, \`Object.clone()\` and \`Cloneable\` exist but are widely criticized: \`clone()\` returns \`Object\`, breaks generic clarity, defaults to shallow copy, and \`Cloneable\` is a marker without methods.

## Better Java approach: copy constructors / factories

\`public User(User other)\` copies fields explicitly. Or \`User.copyOf(User other)\` static factory with clear semantics. You control deep vs shallow copying explicitly.

## Shallow vs deep copy

Shallow copy duplicates top-level fields but **shares** nested mutable references—two users might share the same \`ArrayList\` of tags unless you copy the list. Deep copy duplicates nested mutable graphs (more costly, more correct). For LLD, always mention which you need.

## When to use Prototype

When instantiation is expensive, when templates vary slightly, or when you want to snapshot defaults from a master object. Game dev, document generation, and test data often fit.

## When not to use

Cheap immutable objects (just use constructors), graphs with cycles (deep copy complexity), or objects with strict identity semantics (duplication may violate domain rules unless new IDs are assigned).

> INTERVIEW TIP: Prefer copy constructors over Cloneable; articulate shallow vs deep copy tradeoffs clearly.

## Why this matters for LLD interviews

Shows you understand performance, duplication safety, and API clarity beyond textbook \`clone()\`.

## Prototype vs Factory Method

Factory Method creates fresh objects from parameters. Prototype duplicates from an exemplar. Choose prototype when the exemplar already encodes complex defaults you do not want to re-specify. Choose factory when inputs are simple and validation is parametric.

## Identity and aggregates

When cloning domain entities with database IDs, generate new identifiers on copy to avoid uniqueness violations. For aggregates, decide whether invariants must re-validate on clone—often \`build()\`-style validation runs again after mutation.

## Performance note

Copying large graphs can be expensive; profile before assuming prototype saves time. Sometimes **structural sharing** with immutable data is better than physical duplication.

## Testing angle

Prototype-style test fixtures (\`baseUser().withRole("ADMIN")\`) improve readability. They resemble builders but start from a realistic template—combine both ideas in mature codebases.`,
    codeExamples: [
      {
        id: 'l3-5-good',
        title: 'Prototype: Copy Constructor',
        language: 'java',
        isGood: true,
        code:
          "import java.util.ArrayList;\nimport java.util.List;\n\nfinal class GameCharacter {\n  private final String name;\n  private final int health;\n  private final List<String> skills;\n\n  GameCharacter(String name, int health, List<String> skills) {\n    this.name = name;\n    this.health = health;\n    this.skills = new ArrayList<>(skills);\n  }\n\n  GameCharacter(GameCharacter other) {\n    this.name = other.name;\n    this.health = other.health;\n    this.skills = new ArrayList<>(other.skills);\n  }\n\n  GameCharacter withWeaponSkill(String s) {\n    GameCharacter copy = new GameCharacter(this);\n    copy.skills.add(s);\n    return copy;\n  }\n}",
        explanation:
          'Copy constructor duplicates mutable list so variants do not share skill lists accidentally.',
      },
      {
        id: 'l3-5-bad-shallow',
        title: 'Bad: Shallow Copy Problem',
        language: 'java',
        isGood: false,
        code:
          "import java.util.ArrayList;\nimport java.util.List;\n\nfinal class Player {\n  final List<String> skills;\n\n  Player(List<String> skills) {\n    this.skills = skills;\n  }\n\n  Player shallowCopy() {\n    return new Player(this.skills); // shares list reference\n  }\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    Player a = new Player(new ArrayList<>(List.of('jump')));\n    Player b = a.shallowCopy();\n    b.skills.add('dash');\n    System.out.println(a.skills.size()); // mutates original — surprise\n  }\n}",
        explanation:
          'Shallow copy of mutable collections aliases state between instances.',
      },
    ],
    diagrams: [
      {
        id: 'l3-5-d1',
        title: 'Prototype cloning',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass GameCharacter {\n  +GameCharacter(copy)\n  +withWeaponSkill(s)\n}\nGameCharacter ..> GameCharacter : clones',
      },
    ],
    exercises: [
      {
        id: 'l3-5-ex1',
        title: 'Document Template Cloning',
        difficulty: 'easy',
        description: 'Clone document templates with deep-copied tags and metadata.',
        requirements: [
          'DocumentTemplate with title, content, author, tags list, metadata map.',
          'Copy constructor deep-copies mutable collections.',
          'Create variants from one template with different titles.',
        ],
        starterCode:
          "import java.util.List;\nimport java.util.Map;\n\nfinal class DocumentTemplate {\n  // TODO\n}\n",
        testCases: [
          'Changing clone tags does not affect original.',
          'Metadata maps are independent.',
        ],
        hints: [
          'Use new ArrayList<>(original.tags).',
          'Use new HashMap<>(original.metadata).',
          'Strings are immutable—safe to assign.',
        ],
        solution:
          "import java.util.ArrayList;\nimport java.util.HashMap;\nimport java.util.List;\nimport java.util.Map;\n\nfinal class DocumentTemplate {\n  private final String title;\n  private final String content;\n  private final String author;\n  private final List<String> tags;\n  private final Map<String, String> metadata;\n\n  DocumentTemplate(String title, String content, String author, List<String> tags, Map<String, String> metadata) {\n    this.title = title;\n    this.content = content;\n    this.author = author;\n    this.tags = new ArrayList<>(tags);\n    this.metadata = new HashMap<>(metadata);\n  }\n\n  DocumentTemplate(DocumentTemplate other) {\n    this.title = other.title;\n    this.content = other.content;\n    this.author = other.author;\n    this.tags = new ArrayList<>(other.tags);\n    this.metadata = new HashMap<>(other.metadata);\n  }\n\n  DocumentTemplate withTitle(String newTitle) {\n    DocumentTemplate copy = new DocumentTemplate(this);\n    // title is final — use factory pattern: recreate via ctor in real code use builder; here simplify:\n    return new DocumentTemplate(newTitle, copy.content, copy.author, copy.tags, copy.metadata);\n  }\n}",
        solutionExplanation:
          'Deep copies prevent shared mutable tags/maps; new title uses constructor for immutability.',
        designPrinciples: ['Prototype', 'Defensive Copying'],
        connectedHLDTopic: null,
      },
      {
        id: 'l3-5-ex2',
        title: 'Assign new IDs on clone',
        difficulty: 'medium',
        description: 'Ensure each clone gets a fresh UUID while copying other fields.',
        requirements: [
          'Entity with id, name.',
          'copy() preserves name but generates new id.',
        ],
        starterCode:
          "import java.util.UUID;\n\nfinal class Entity {\n  private final UUID id;\n  private final String name;\n  // TODO ctor + copy\n}\n",
        testCases: ['copy().id != original.id.', 'name matches.'],
        hints: [
          'UUID.randomUUID() in copy factory.',
          'Keep constructor private if needed.',
          'Consider static factory copyOf(Entity e).',
        ],
        solution:
          "import java.util.UUID;\n\nfinal class Entity {\n  private final UUID id;\n  private final String name;\n\n  Entity(UUID id, String name) {\n    this.id = id;\n    this.name = name;\n  }\n\n  static Entity create(String name) {\n    return new Entity(UUID.randomUUID(), name);\n  }\n\n  Entity copy() {\n    return new Entity(UUID.randomUUID(), this.name);\n  }\n\n  UUID id() { return id; }\n  String name() { return name; }\n}",
        solutionExplanation:
          'Domain identities must not be duplicated accidentally—new UUID on clone.',
        designPrinciples: ['Prototype', 'Domain Modeling'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l3-5-q1',
        'Shallow copy risks?',
        [
          'None',
          'Shared mutable nested state between instances',
          'Slower CPU',
          'More garbage always',
        ],
        1,
        'References to mutable collections alias.',
      ),
      q(
        'l3-5-q2',
        'Preferred Java idiom over Cloneable?',
        ['finalize()', 'Copy constructor or static copy factory', 'wait()', 'Serializable only'],
        1,
        'Explicit copying is clearer and safer.',
      ),
      q(
        'l3-5-q3',
        'Prototype fits when?',
        [
          'Object creation is costly or templated',
          'Only primitives exist',
          'Never in Java',
          'Only for threads',
        ],
        1,
        'Templates and expensive init favor cloning.',
      ),
      q(
        'l3-5-q4',
        'Deep copy means?',
        [
          'Copy references only',
          'Duplicate nested mutable objects recursively',
          'Copy class object only',
          'Copy bytecode',
        ],
        1,
        'Nested graphs duplicated per policy.',
      ),
      q(
        'l3-5-q5',
        'Object.clone() default behavior is mostly?',
        ['Deep copy always', 'Shallow copy', 'No copy', 'Security manager only'],
        1,
        'Arrays and references shared unless overridden.',
      ),
    ],
    interviewTip:
      'Use copy constructors instead of Cloneable. Deep-copy mutable fields. Prototype helps when creation is expensive or when you need many similar objects with small deltas.',
    connectedHLDTopics: [],
  },
];
