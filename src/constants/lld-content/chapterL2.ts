import type { QuizQuestion } from '@/constants/curriculumTypes';
import type { LLDTopic } from '@/constants/lldTypes';

const q = (id: string, question: string, options: string[], correctIndex: number, explanation: string): QuizQuestion => ({
  id,
  question,
  options,
  correctIndex,
  explanation,
});

export const CHAPTER_L2_TOPICS: LLDTopic[] = [
  {
    id: 'single-responsibility',
    title: 'Single Responsibility Principle',
    readContent:
      "SRP states that a class should have one reason to change. Reason to change means one axis of business concern. If a class handles registration, email delivery, analytics, and reporting, each concern can change independently and therefore the class has multiple reasons to change.\n\nIn interviews, SRP is often the first SOLID principle discussed because it is easy to detect and deeply impactful. God classes are common anti-patterns: huge classes with broad method lists and mixed dependencies. They are hard to test, hard to review, and easy to break during changes.\n\nA practical detection trick: if your class description contains AND repeatedly, it likely violates SRP. Split responsibilities into focused collaborators and keep an orchestrator thin.\n\nSRP applies at method level too. processOrderAndSendEmail should usually become processOrder and sendEmail to reduce coupling and improve composability.\n\nSRP does not mean one method per class; it means one cohesive responsibility domain. A repository can have multiple CRUD methods while still holding one responsibility: persistence.\n\n> ANALOGY: in a restaurant, chef cooks, dishwasher cleans, host seats guests. If one person does all three, delays and failures cascade.\n\n> INTERVIEW TIP: explicitly state each class responsibility in one sentence. If you cannot do it without AND, split the class.\n\nWHY this matters for LLD interviews: SRP improves readability, change safety, and test isolation. Interviewers view it as foundation for other SOLID principles.",
    codeExamples: [],
    diagrams: [
      {
        id: 'l2-1-diagram-1',
        title: 'God Class vs SRP Refactor',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass UserManager {\n  +registerUser()\n  +authenticateUser()\n  +sendWelcomeEmail()\n  +generateUserReport()\n  +logUserActivity()\n}\nclass UserService\nclass EmailService\nclass ReportService\nclass ActivityLogger\nUserService --> EmailService\nUserService --> ReportService\nUserService --> ActivityLogger',
      },
    ],
    exercises: [],
    quizQuestions: [
      q('l2-1-q1', 'SRP means?', ['One method only', 'One reason to change', 'One dependency only', 'No interfaces'], 1, 'Responsibility is about change axis.'),
      q('l2-1-q2', 'God class is problematic because?', ['Too many constructors', 'Mixed concerns and high change risk', 'No getters', 'Too many enums'], 1, 'Unrelated responsibilities increase fragility.'),
      q('l2-1-q3', 'Class description with many AND suggests?', ['Perfect SRP', 'Likely SRP violation', 'Need inheritance', 'Need enum'], 1, 'AND often marks multiple concerns.'),
      q('l2-1-q4', 'OrderProcessor should become?', ['Bigger class', 'Thin orchestrator + focused services', 'Enum only', 'Static utility'], 1, 'Delegation separates concerns.'),
      q('l2-1-q5', 'SRP at method level means?', ['Methods can do multiple jobs', 'Method should do one coherent thing', 'Only private methods', 'No return values'], 1, 'Smaller focused methods are easier to compose/test.'),
      q('l2-1-q6', 'Repository with save/find/update/delete can still follow SRP because?', ['CRUD is one persistence responsibility', 'Methods are static', 'Uses interfaces', 'Has no constructor'], 0, 'Multiple operations can belong to one cohesive responsibility.'),
    ],
    interviewTip:
      "SRP is the foundation. If your design violates SRP, everything else falls apart. Name each class's single responsibility out loud when designing. If you cannot state it in one sentence without 'and', the class does too much.",
    connectedHLDTopics: [],
  },
  {
    id: 'open-closed',
    title: 'Open/Closed Principle',
    readContent:
      "OCP says software entities should be open for extension but closed for modification. Adding behavior should usually mean adding new classes around stable abstractions, not editing old decision-heavy methods.\n\nThe classic violation is switch/if branching on type. Every new type forces edits in existing logic, increasing regression risk. In interviews, this appears in payment types, shipping methods, notification channels, and discount policies.\n\nAchieve OCP with interfaces and polymorphism. Define DiscountStrategy and inject implementation. Add StudentDiscount by creating one class, not rewriting calculator.\n\nDecorator pattern also supports OCP by wrapping behavior without modifying base class.\n\n> IMPORTANT: OCP does not ban modification forever; it minimizes required modifications for common extension paths.\n\n> INTERVIEW TIP: when interviewer asks 'what if we add X?', your answer should be 'add a new class implementing the contract; existing code remains untouched.'\n\nWHY this matters for LLD interviews: OCP design survives requirement growth with lower risk and better team velocity.",
    codeExamples: [],
    diagrams: [
      {
        id: 'l2-2-diagram-1',
        title: 'Discount Strategy OCP',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass DiscountStrategy {\n  <<interface>>\n  +calculateDiscount(order)\n}\nclass RegularDiscount\nclass PremiumDiscount\nclass VIPDiscount\nclass DiscountCalculator\nDiscountStrategy <|.. RegularDiscount\nDiscountStrategy <|.. PremiumDiscount\nDiscountStrategy <|.. VIPDiscount\nDiscountCalculator --> DiscountStrategy',
      },
    ],
    exercises: [],
    quizQuestions: [
      q('l2-2-q1', 'OCP recommends?', ['Modify core class for each new type', 'Extend via new implementations over stable abstraction', 'Use only enums', 'Avoid interfaces'], 1, 'Extension should avoid touching stable code.'),
      q('l2-2-q2', 'Large switch by type is often?', ['DIP success', 'OCP smell', 'LSP fix', 'ISP implementation'], 1, 'Every new type requires modification.'),
      q('l2-2-q3', 'Strategy pattern helps OCP by?', ['Using reflection only', 'Encapsulating variants behind interface', 'Removing constructors', 'Making all methods static'], 1, 'New variants are new classes.'),
      q('l2-2-q4', 'Adding new shipping type ideally requires?', ['Editing 10 files', 'One new strategy class and wiring', 'Database migration only', 'No code'], 1, 'Good OCP keeps changes localized.'),
      q('l2-2-q5', 'Decorator supports OCP because?', ['It modifies base class internals', 'It adds behavior by wrapping', 'It removes interfaces', 'It forbids composition'], 1, 'Wrapping extends behavior without base edits.'),
      q('l2-2-q6', 'When is modification acceptable under OCP?', ['Never', 'When extension points were not anticipated and design evolves intentionally', 'Only in tests', 'Only for enums'], 1, 'OCP is a design goal, not absolute prohibition.'),
    ],
    interviewTip:
      "When the interviewer asks 'what if we need to add X?' — your design should require creating a new class, not modifying existing ones. This is the Open/Closed Principle and it is the clearest signal of good design.",
    connectedHLDTopics: [],
  },
  {
    id: 'liskov-substitution',
    title: 'Liskov Substitution Principle',
    readContent:
      "LSP requires that subtype objects be substitutable wherever supertype objects are expected without breaking behavior. This is about contracts, not just type names.\n\nRectangle-Square is famous because behavioral expectations differ when width and height independence is assumed. Even if Square sounds like a mathematical subtype, program contract may be violated.\n\nCommon LSP smells: overridden methods throwing UnsupportedOperationException, silent no-op overrides, stronger preconditions, weaker postconditions, and client instanceof branching to handle subclass quirks.\n\nFixes include redesigning abstractions to represent true contracts. Often interfaces split capabilities better than forced inheritance trees.\n\n> ANALOGY: if you request a taxi vehicle, any car sent should still complete transport contract. If one subtype cannot carry passengers, substitution fails.\n\n> INTERVIEW TIP: UnsupportedOperationException in subclass overrides is a red flag. Re-check hierarchy and consider interface segregation.\n\nWHY this matters for LLD interviews: behavioral substitutability determines whether polymorphism is safe or brittle under extension.",
    codeExamples: [],
    diagrams: [],
    exercises: [],
    quizQuestions: [
      q('l2-3-q1', 'LSP focuses on?', ['Syntax only', 'Behavioral substitutability', 'Enum completeness', 'Package naming'], 1, 'Subtype must preserve parent contract expectations.'),
      q('l2-3-q2', 'Rectangle-Square issue demonstrates?', ['OCP success', 'LSP violation risk despite apparent IS-A', 'Generics bound', 'Encapsulation leak'], 1, 'Behavior contract matters more than naming.'),
      q('l2-3-q3', 'UnsupportedOperationException in override often means?', ['Good defensive coding', 'Potential LSP violation', 'Compile optimization', 'No issue'], 1, 'Subclass cannot honor parent contract.'),
      q('l2-3-q4', 'Best fix for Bird with Penguin not flying?', ['Keep fly and throw', 'Split interfaces (FlyingBird, SwimmingBird)', 'Make fly static', 'Use enum'], 1, 'Capability interfaces restore valid contracts.'),
      q('l2-3-q5', 'If subclass requires stricter inputs than parent method, it is?', ['LSP-safe', 'LSP violation risk', 'Always better', 'OCP only'], 1, 'Stronger preconditions can break callers.'),
      q('l2-3-q6', 'instanceof chains in client code often indicate?', ['Great polymorphism', 'Hierarchy contract mismatch', 'Fast path', 'Enum use'], 1, 'Clients compensating for subtype behavior usually signals poor abstraction.'),
    ],
    interviewTip:
      'If your subclass throws UnsupportedOperationException or silently does nothing in an overridden method, you are violating LSP. Redesign with separate interfaces instead of forcing an incorrect inheritance hierarchy.',
    connectedHLDTopics: [],
  },
  {
    id: 'interface-segregation',
    title: 'Interface Segregation Principle',
    readContent:
      'ISP says clients should not depend on methods they do not use. Large fat interfaces force irrelevant implementations, often resulting in empty methods or UnsupportedOperationException. This harms clarity and frequently violates LSP too.\n\nSplit broad interfaces into focused capability interfaces. HumanWorker may implement Workable, Eatable, Sleepable, while RobotWorker implements only Workable. This reduces accidental coupling and improves discoverability.\n\nIn real systems, printing/scanning/faxing capabilities vary by device; notification channels vary by urgency and batching support. Small interfaces allow precise contracts.\n\nISP is SRP for interfaces: one interface, one cohesive capability. It also improves testing because mocks become smaller and intent clearer.\n\n> INTERVIEW TIP: if you implement method with empty body or UnsupportedOperationException, split interface. Small 1-3 method interfaces are usually healthiest.',
    codeExamples: [],
    diagrams: [],
    exercises: [],
    quizQuestions: [
      q('l2-4-q1', 'ISP recommends?', ['One large interface for all', 'Small focused interfaces per capability', 'No interfaces', 'Only abstract classes'], 1, 'Clients should depend only on needed methods.'),
      q('l2-4-q2', 'Fat interface symptom?', ['Fast compile', 'UnsupportedOperationException in many implementations', 'Less code', 'Better cohesion'], 1, 'Forced irrelevant methods indicate bad contract granularity.'),
      q('l2-4-q3', 'ISP relation to SRP?', ['Unrelated', 'SRP applied to interfaces', 'ISP replaces SRP', 'Only for databases'], 1, 'Both push cohesive boundaries.'),
      q('l2-4-q4', 'BasicPrinter should implement?', ['Printable only', 'Printable+Faxable mandatory', 'All methods via stubs', 'No interface'], 0, 'Implement only supported capabilities.'),
      q('l2-4-q5', 'Right granularity target?', ['Huge all-in-one APIs', 'Capability-level cohesive methods', 'One method globally', 'Random split'], 1, 'Interfaces should map to coherent client needs.'),
      q('l2-4-q6', 'Why ISP helps testing?', ['Bigger mocks', 'Smaller contracts easier to mock and reason about', 'No tests needed', 'Only integration tests'], 1, 'Focused interfaces simplify test setup and intent.'),
    ],
    interviewTip:
      'If you implement a method with an empty body or throw UnsupportedOperationException, the interface is too fat. Split it. Small interfaces with 1-3 methods are ideal.',
    connectedHLDTopics: [],
  },
  {
    id: 'dependency-inversion',
    title: 'Dependency Inversion Principle',
    readContent:
      "DIP says high-level modules should depend on abstractions, not concrete low-level details. Business logic should consume interfaces, while implementations depend on those interfaces. This reduces coupling and dramatically improves testability.\n\nWithout DIP, services instantiate concrete repositories/gateways internally, causing rigid code and heavy tests requiring real infrastructure. With DIP and constructor injection, service logic is independent from concrete storage/payment/notification providers.\n\nDependency Injection is the mechanism that realizes DIP. Constructor injection is preferred because dependencies are explicit and immutable after construction. In tests, inject fakes/mocks to run fast isolated checks.\n\nDIP also supports OCP: new implementation classes can be added behind stable interfaces without modifying high-level modules.\n\n> IMPORTANT: DIP with constructor injection is one of the highest-impact design practices for real-world code quality.\n\n> INTERVIEW TIP: say explicitly that service constructors accept interfaces (Repository, Gateway, Notifier). Mention production implementation and test fake implementation wiring.\n\nWHY this matters for LLD interviews: DIP demonstrates professional architecture thinking, not just class design. It communicates extensibility, maintainability, and test discipline.",
    codeExamples: [],
    diagrams: [
      {
        id: 'l2-5-diagram-1',
        title: 'OrderService Depends on Abstraction',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass OrderService\nclass OrderRepository {\n  <<interface>>\n  +save(order)\n  +findById(id)\n}\nclass MySQLOrderRepository\nclass InMemoryOrderRepository\nOrderService --> OrderRepository\nOrderRepository <|.. MySQLOrderRepository\nOrderRepository <|.. InMemoryOrderRepository',
      },
    ],
    exercises: [],
    quizQuestions: [
      q('l2-5-q1', 'DIP says high-level module should depend on?', ['Concrete database class', 'Abstraction interface', 'Static utility only', 'Enum values'], 1, 'Abstractions decouple policies from details.'),
      q('l2-5-q2', 'Constructor injection benefit?', ['Hidden dependencies', 'Explicit dependencies and easier testing', 'No interfaces required', 'No constructors needed'], 1, 'Dependencies become explicit and swappable.'),
      q('l2-5-q3', 'Direct new MySQLRepo inside service causes?', ['Loose coupling', 'Tight coupling and hard testing', 'No impact', 'Faster runtime always'], 1, 'Service becomes bound to concrete implementation.'),
      q('l2-5-q4', 'DIP relationship to OCP?', ['No relationship', 'Stable abstractions allow extension with new implementations', 'DIP breaks OCP', 'Only for UI'], 1, 'New implementations can be added without changing high-level logic.'),
      q('l2-5-q5', 'Test with DIP usually uses?', ['Real production DB always', 'Fake/mock implementations', 'No repository', 'Reflection only'], 1, 'Fakes provide fast deterministic unit tests.'),
      q('l2-5-q6', 'Best dependency type in service constructor?', ['Concrete class names', 'Interfaces/abstractions', 'Primitive strings only', 'Static singletons'], 1, 'Program to abstractions for flexibility.'),
    ],
    interviewTip:
      'Always inject dependencies through the constructor as interfaces. This single practice makes your code testable, flexible, and follows DIP. In every LLD interview, use constructor injection for all service dependencies.',
    connectedHLDTopics: ['service-discovery', 'api-gateway', 'microservices-communication'],
  },
];
