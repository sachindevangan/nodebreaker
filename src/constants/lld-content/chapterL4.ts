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

export const CHAPTER_L4_TOPICS: LLDTopic[] = [
  {
    id: 'adapter-pattern',
    title: 'Adapter Pattern',
    readContent: `# Adapter Pattern

## The integration problem

You inherit a third-party SDK, a legacy module, or a partner API whose method names, types, and error models do not match your domain interfaces. Rewriting the vendor is impossible; forking it is expensive. Changing every caller to speak the vendor dialect scatters coupling and makes future swaps painful. The Adapter pattern inserts a **translator** class that implements **your** interface and delegates to **their** implementation, mapping parameters, exceptions, and semantics.

## What Adapter does

Adapter converts one interface into another that clients expect. The **target** is the interface your application already uses. The **adaptee** is the foreign API. The **adapter** implements Target and wraps Adaptee, translating each call. Clients remain unaware of the vendor.

## Class adapter vs object adapter

**Class adapter** (multiple inheritance in languages that allow it) subclasses the adaptee—rare in Java. **Object adapter** composes the adaptee as a field—preferred: favor composition over inheritance, and you can wrap multiple adaptees or swap implementations at runtime.

## When to use Adapter

Integrating payment gateways, SMS providers, cloud storage SDKs, or legacy XML services behind your JSON-first interfaces. Anytime you want business logic to depend on stable abstractions while vendors churn.

## When not to use

If you own both sides and can change the API freely, refactor the API instead of adding indirection. If mapping is trivial one-liner, a simple function may suffice—though teams still wrap for testability.

## Java ecosystem examples

\`InputStreamReader\` adapts byte streams to character \`Reader\`. \`Arrays.asList\` adapts arrays to \`List\` view. JDBC drivers adapt vendor wire protocols behind standard interfaces.

## OCP connection

New provider? New adapter class. Core domain unchanged—only wiring updates.

> ANALOGY: A travel plug adapter lets your US charger connect to EU sockets—same device, different socket shape.

> INTERVIEW TIP: "I expose \`PaymentGateway\` internally; \`StripePaymentAdapter\` implements it and wraps Stripe’s SDK. Switching providers swaps one class."

## Why LLD interviews care

External integration is universal. Adapter shows boundary discipline and test strategy (fake gateways).

> NUMBERS: Teams often support 3+ payment providers—adapters prevent N× duplication in business services.

## Mapping concerns beyond signatures

Real adapters translate **error models** (vendor-specific codes to domain exceptions), **units** (cents vs dollars), **idempotency keys**, **timeouts**, and **telemetry** (propagating trace IDs into vendor headers). In LLD discussions, mention that the adapter is the **only** place allowed to know SDK quirks—domain services speak your ubiquitous language.

## Testing and evolution

With an interface + adapter, unit tests use **in-memory fakes**; contract tests can run against vendor sandboxes behind the adapter boundary. When a vendor deprecates an API version, you update one class rather than chasing call sites across services.

## Anti-patterns

**Fat adapters** that embed business rules become god classes—keep adapters thin: translate and delegate. **Leaky abstractions** that expose vendor types through your interface defeat the purpose—return domain types.

> IMPORTANT: If two teams share the same adapter, publish it as a small internal library with semver to avoid copy-paste drift.

## How this connects to HLD

At system level, **API gateways** and **BFFs** are architectural cousins: they sit at the edge translating external contracts to internal ones. The mental model matches: protect the core from volatile external shapes.`,
    codeExamples: [
      {
        id: 'l4-1-bad-direct',
        title: 'Bad: Checkout Coupled to StripeSdk',
        language: 'java',
        isGood: false,
        code:
          "final class StripeSdk {\n  boolean chargeUsd(double dollars, String customer) { return true; }\n}\n\nfinal class CheckoutServiceBad {\n  private final StripeSdk stripe = new StripeSdk();\n\n  void buy(long cents, String user) {\n    stripe.chargeUsd(cents / 100.0, user);\n  }\n}\n",
        explanation:
          'Domain layer names Stripe; swapping providers requires rewriting CheckoutService and all tests.',
      },
      {
        id: 'l4-1-pay',
        title: 'Adapter: Payment Gateway Integration',
        language: 'java',
        isGood: true,
        code:
          "interface PaymentGateway {\n  ChargeResult charge(Money amount, String customerId);\n}\n\nfinal class Money {\n  private final long cents;\n  Money(long cents) { this.cents = cents; }\n  long cents() { return cents; }\n}\n\nfinal class ChargeResult {\n  private final boolean ok;\n  ChargeResult(boolean ok) { this.ok = ok; }\n  boolean ok() { return ok; }\n}\n\n/** Third-party SDK we cannot change. */\nfinal class StripeSdk {\n  boolean chargeUsd(double dollars, String stripeCustomer) {\n    return dollars > 0;\n  }\n}\n\nfinal class StripePaymentAdapter implements PaymentGateway {\n  private final StripeSdk stripe = new StripeSdk();\n\n  public ChargeResult charge(Money amount, String customerId) {\n    double dollars = amount.cents() / 100.0;\n    boolean ok = stripe.chargeUsd(dollars, customerId);\n    return new ChargeResult(ok);\n  }\n}\n\nfinal class CheckoutService {\n  private final PaymentGateway gateway;\n\n  CheckoutService(PaymentGateway gateway) {\n    this.gateway = gateway;\n  }\n\n  void buy(Money m, String user) {\n    gateway.charge(m, user);\n  }\n}",
        explanation:
          'CheckoutService depends on PaymentGateway only; Stripe specifics stay in the adapter.',
      },
      {
        id: 'l4-1-legacy',
        title: 'Adapter: Legacy XML to JSON-shaped API',
        language: 'java',
        isGood: true,
        code:
          "interface DataSource {\n  String getDataJson(String id);\n}\n\nfinal class XmlDataSource {\n  String getXMLData(String id) {\n    return '<user id=\\'' + id + '\\'><name>Ada</name></user>';\n  }\n}\n\nfinal class XmlDataSourceAdapter implements DataSource {\n  private final XmlDataSource legacy;\n\n  XmlDataSourceAdapter(XmlDataSource legacy) {\n    this.legacy = legacy;\n  }\n\n  public String getDataJson(String id) {\n    String xml = legacy.getXMLData(id);\n    return toJson(xml); // pretend mapping\n  }\n\n  private String toJson(String xml) {\n    return '{\"raw\": \"' + xml + '\"}';\n  }\n}",
        explanation:
          'Modern clients see JSON; XML quarantine stays inside adapter.',
      },
    ],
    diagrams: [
      {
        id: 'l4-1-d1',
        title: 'Adapter wraps adaptee',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass PaymentGateway {\n  <<interface>>\n  +charge(amount, customer)\n}\nclass StripeSdk\nclass StripePaymentAdapter\nPaymentGateway <|.. StripePaymentAdapter\nStripePaymentAdapter --> StripeSdk : wraps',
      },
      {
        id: 'l4-1-d2',
        title: 'Client depends on Target only',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Client\nclass Target {\n  <<interface>>\n}\nclass Adapter\nclass Adaptee\nClient --> Target\nTarget <|.. Adapter\nAdapter --> Adaptee',
      },
    ],
    exercises: [
      {
        id: 'l4-1-ex1',
        title: 'Multi-provider Notification Adapters',
        difficulty: 'medium',
        description: 'Unify Twilio, SendGrid, Firebase behind NotificationSender.',
        requirements: [
          'NotificationSender with send(recipient, message).',
          'TwilioAdapter, SendGridAdapter, FirebaseAdapter wrap stub SDKs.',
          'NotificationService depends only on NotificationSender.',
        ],
        starterCode:
          "interface NotificationSender {\n  void send(String recipient, String message);\n}\n\n// TODO: adapters + service\n",
        testCases: [
          'Service can swap sender without code changes.',
          'Each adapter maps to its SDK signature.',
        ],
        hints: [
          'Keep third-party classes in separate final classes.',
          'Constructor-inject the chosen NotificationSender.',
          'Map exceptions to domain exceptions inside adapter.',
        ],
        solution:
          "interface NotificationSender {\n  void send(String recipient, String message);\n}\n\nfinal class TwilioSdk {\n  void sms(String to, String body) { }\n}\n\nfinal class SendGridSdk {\n  void email(String to, String body) { }\n}\n\nfinal class FirebaseSdk {\n  void push(String token, String body) { }\n}\n\nfinal class TwilioAdapter implements NotificationSender {\n  private final TwilioSdk sdk = new TwilioSdk();\n  public void send(String recipient, String message) {\n    sdk.sms(recipient, message);\n  }\n}\n\nfinal class SendGridAdapter implements NotificationSender {\n  private final SendGridSdk sdk = new SendGridSdk();\n  public void send(String recipient, String message) {\n    sdk.email(recipient, message);\n  }\n}\n\nfinal class FirebaseAdapter implements NotificationSender {\n  private final FirebaseSdk sdk = new FirebaseSdk();\n  public void send(String recipient, String message) {\n    sdk.push(recipient, message);\n  }\n}\n\nfinal class NotificationService {\n  private final NotificationSender sender;\n\n  NotificationService(NotificationSender sender) {\n    this.sender = sender;\n  }\n\n  void notifyUser(String userContact, String msg) {\n    sender.send(userContact, msg);\n  }\n}",
        solutionExplanation:
          'Each vendor difference is isolated; NotificationService stays stable.',
        designPrinciples: ['Adapter', 'Dependency Inversion', 'Open/Closed Principle'],
        connectedHLDTopic: null,
      },
      {
        id: 'l4-1-ex2',
        title: 'Adapter + factory',
        difficulty: 'medium',
        description: 'Select adapter by configuration key at startup.',
        requirements: ['Map provider id to adapter implementation.', 'Throw on unknown provider.'],
        starterCode:
          "enum Provider { TWILIO, SENDGRID, FIREBASE }\n\n// TODO: NotificationSender create(Provider p)\n",
        testCases: ['TWILIO returns TwilioAdapter.', 'UNKNOWN throws.'],
        hints: [
          'Use switch or EnumMap<Provider, Supplier<NotificationSender>>.',
          'Keep construction in composition root.',
          'Do not switch inside domain service.',
        ],
        solution:
          "enum Provider { TWILIO, SENDGRID, FIREBASE }\n\ninterface NotificationSender {\n  void send(String to, String msg);\n}\n\nfinal class TwilioAdapter implements NotificationSender {\n  public void send(String to, String msg) { }\n}\nfinal class SendGridAdapter implements NotificationSender {\n  public void send(String to, String msg) { }\n}\nfinal class FirebaseAdapter implements NotificationSender {\n  public void send(String to, String msg) { }\n}\n\nfinal class SenderFactory {\n  static NotificationSender create(Provider p) {\n    return switch (p) {\n      case TWILIO -> new TwilioAdapter();\n      case SENDGRID -> new SendGridAdapter();\n      case FIREBASE -> new FirebaseAdapter();\n    };\n  }\n}",
        solutionExplanation:
          'Factory chooses adapter once; services consume interface only.',
        designPrinciples: ['Adapter', 'Factory Method'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l4-1-q1',
        'Adapter primary goal?',
        ['Add caching', 'Translate one interface into another', 'Sort collections', 'Create threads'],
        1,
        'Bridge incompatible interfaces.',
      ),
      q(
        'l4-1-q2',
        'Object adapter vs class adapter in Java?',
        [
          'Java favors composition-based object adapter',
          'Java uses multiple inheritance for class adapter widely',
          'They are identical',
          'Adapters cannot wrap classes',
        ],
        0,
        'Prefer wrapping adaptee instance.',
      ),
      q(
        'l4-1-q3',
        'Adapter vs Facade?',
        [
          'Same pattern',
          'Adapter translates; facade simplifies a subsystem',
          'Facade only for UI',
          'Adapter only for databases',
        ],
        1,
        'Different intent: translate vs simplify.',
      ),
      q(
        'l4-1-q4',
        'Why adapter helps OCP?',
        [
          'It removes interfaces',
          'New vendor = new adapter, core unchanged',
          'It forbids testing',
          'It adds global state',
        ],
        1,
        'Extend by adding adapter classes.',
      ),
      q(
        'l4-1-q5',
        'Java example resembling adapter?',
        ['String.length()', 'InputStreamReader', 'Math.random()', 'Object.wait()'],
        1,
        'Streams adaptation.',
      ),
      q(
        'l4-1-q6',
        'When is adapter overkill?',
        [
          'Always',
          'You control both APIs and can refactor directly without translation',
          'Third-party SDKs',
          'Microservices',
        ],
        1,
        'Unnecessary if boundary already matches.',
      ),
    ],
    interviewTip:
      'Use Adapter whenever you integrate external services or legacy modules. Name adapters after provider + role (StripePaymentAdapter). Emphasize that business logic depends on your interface, not the SDK.',
    connectedHLDTopics: ['api-gateway-pattern', 'api-gateway-the-front-door'],
  },
  {
    id: 'decorator-pattern',
    title: 'Decorator Pattern',
    readContent: `# Decorator Pattern

## The feature combinatorics problem

You need optional behaviors around a core object: coffee add-ons, HTTP middleware, repository caching, authorization checks. Subclassing every combination explodes (\`MilkSugarWhipCoffee\`). Inheritance is also static—you cannot rearrange layers at runtime.

## What Decorator does

Decorators wrap a component implementing the same interface, delegate to the inner object, and add behavior before/after. Multiple decorators compose: \`new LoggingDecorator(new CacheDecorator(service))\`.

## Decorator vs inheritance

Inheritance fixes structure at compile time. Decorators let you stack behaviors dynamically and reorder them (with care).

## When to use

Optional cross-cutting features, formatting pipelines, I/O layers, and pricing modifiers. Java I/O (\`BufferedInputStream\` around \`FileInputStream\`) is canonical.

## When not to use

If behavior combinations are fixed and small, plain composition or a single class may suffice. If decorators must communicate complex state, reconsider design—chains can obscure data flow.

## Decorator vs Proxy

Both wrap. **Intent differs**: proxy usually controls access (lazy load, security). Decorator adds responsibilities. Interviewers probe this distinction.

> INTERVIEW TIP: "Toppings and cross-cutting concerns → Decorator. I can add LoggingDecorator and CachingDecorator without changing DatabaseService."

## LLD relevance

Pricing pipelines, notification middleware, and request enrichment commonly use decorators or the same structural idea.

> IMPORTANT: Document ordering—some decorators are not commutative (auth before cache vs cache before auth).

## Stack semantics and performance

Each decorator adds indirection. For hot paths, excessive layers cost CPU and harm stack traces—balance composability with profiling. Memoizing decorators must define **cache keying** and **invalidation** clearly or subtle staleness bugs appear.

## Decorators and dependency injection

In Spring, decorators are often modeled as additional beans wrapping a primary implementation—ordering controlled by \`@Order\` or explicit wiring. Mentioning DI shows you connect patterns to frameworks.

## Interview narrative

Walk through **Java I/O** (\`BufferedInputStream\` → \`FileInputStream\`) as the canonical example, then map to your domain (e.g., \`MetricsDecorator\` around \`HttpClient\`). Explain **non-commutative** stacks: **authorization** before **caching** prevents leaking unauthorized responses from cache.

> ANALOGY: Decorators are nested transparent film on a camera lens—each layer tweaks the image; order changes the final photo.`,
    codeExamples: [
      {
        id: 'l4-2-bad',
        title: 'Bad: Subclass Explosion',
        language: 'java',
        isGood: false,
        code:
          "interface Coffee {\n  double cost();\n  String desc();\n}\n\nfinal class BasicCoffee implements Coffee {\n  public double cost() { return 2.0; }\n  public String desc() { return 'Coffee'; }\n}\n\nfinal class MilkCoffee extends BasicCoffee {\n  public double cost() { return super.cost() + 0.5; }\n  public String desc() { return super.desc() + ' + milk'; }\n}\n\nfinal class MilkSugarCoffee extends MilkCoffee {\n  public double cost() { return super.cost() + 0.2; }\n  public String desc() { return super.desc() + ' + sugar'; }\n}\n\n// Adding whipped cream multiplies combinations...\n",
        explanation:
          'Each new topping multiplies class count; order of toppings is awkward to model.',
      },
      {
        id: 'l4-2-good',
        title: 'Good: Decorator Chain',
        language: 'java',
        isGood: true,
        code:
          "interface Coffee {\n  double cost();\n  String desc();\n}\n\nfinal class BasicCoffee implements Coffee {\n  public double cost() { return 2.0; }\n  public String desc() { return 'Coffee'; }\n}\n\nabstract class CoffeeDecorator implements Coffee {\n  private final Coffee inner;\n  CoffeeDecorator(Coffee inner) { this.inner = inner; }\n  protected Coffee inner() { return inner; }\n}\n\nfinal class MilkDecorator extends CoffeeDecorator {\n  MilkDecorator(Coffee inner) { super(inner); }\n  public double cost() { return inner().cost() + 0.5; }\n  public String desc() { return inner().desc() + ' + milk'; }\n}\n\nfinal class WhipDecorator extends CoffeeDecorator {\n  WhipDecorator(Coffee inner) { super(inner); }\n  public double cost() { return inner().cost() + 0.7; }\n  public String desc() { return inner().desc() + ' + whip'; }\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    Coffee c = new WhipDecorator(new MilkDecorator(new BasicCoffee()));\n    System.out.println(c.desc() + ' = ' + c.cost());\n  }\n}",
        explanation:
          'New topping = one decorator class; arbitrary stacks possible.',
      },
      {
        id: 'l4-2-cross',
        title: 'Logging + Caching Decorators',
        language: 'java',
        isGood: true,
        code:
          "interface DataService {\n  String getData(String key);\n}\n\nfinal class DatabaseService implements DataService {\n  public String getData(String key) { return 'db:' + key; }\n}\n\nabstract class ServiceDecorator implements DataService {\n  private final DataService inner;\n  ServiceDecorator(DataService inner) { this.inner = inner; }\n  protected DataService inner() { return inner; }\n}\n\nfinal class LoggingDecorator extends ServiceDecorator {\n  LoggingDecorator(DataService inner) { super(inner); }\n  public String getData(String key) {\n    long t0 = System.nanoTime();\n    try {\n      return inner().getData(key);\n    } finally {\n      long dt = System.nanoTime() - t0;\n      System.out.println('getData ' + key + ' in ' + dt + 'ns');\n    }\n  }\n}\n\nfinal class CachingDecorator extends ServiceDecorator {\n  private final java.util.Map<String, String> cache = new java.util.HashMap<>();\n  CachingDecorator(DataService inner) { super(inner); }\n  public String getData(String key) {\n    return cache.computeIfAbsent(key, k -> inner().getData(k));\n  }\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    DataService svc = new LoggingDecorator(new CachingDecorator(new DatabaseService()));\n    svc.getData('a');\n  }\n}",
        explanation:
          'Cross-cutting concerns compose; inner service stays focused.',
      },
    ],
    diagrams: [
      {
        id: 'l4-2-d1',
        title: 'Decorator structure',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Coffee {\n  <<interface>>\n  +cost()\n  +desc()\n}\nclass CoffeeDecorator {\n  <<abstract>>\n  #inner: Coffee\n}\nclass MilkDecorator\nclass BasicCoffee\nCoffee <|.. BasicCoffee\nCoffee <|.. CoffeeDecorator\nCoffeeDecorator <|-- MilkDecorator\nCoffeeDecorator o-- Coffee',
      },
      {
        id: 'l4-2-d2',
        title: 'Decorator object chain',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass WhipDecorator\nclass MilkDecorator\nclass BasicCoffee\nWhipDecorator --> MilkDecorator : wraps\nMilkDecorator --> BasicCoffee : wraps',
      },
    ],
    exercises: [
      {
        id: 'l4-2-ex1',
        title: 'Text Formatter Decorators',
        difficulty: 'medium',
        description: 'Combine bold, italic, uppercase as nested decorators.',
        requirements: [
          'TextFormatter with format(String).',
          'PlainText base; BoldDecorator, ItalicDecorator, UpperCaseDecorator.',
          'Demonstrate stacking order matters.',
        ],
        starterCode:
          "interface TextFormatter {\n  String format(String text);\n}\n// TODO\n",
        testCases: ['Upper then bold wraps tags correctly.', 'Decorators compose.'],
        hints: [
          'Use abstract decorator holding inner formatter.',
          'Apply inner.format first then wrap.',
          'UpperCase can be outermost to affect all.',
        ],
        solution:
          "interface TextFormatter {\n  String format(String text);\n}\n\nfinal class PlainText implements TextFormatter {\n  public String format(String text) { return text; }\n}\n\nabstract class FormatterDecorator implements TextFormatter {\n  private final TextFormatter inner;\n  FormatterDecorator(TextFormatter inner) { this.inner = inner; }\n  protected TextFormatter inner() { return inner; }\n}\n\nfinal class BoldDecorator extends FormatterDecorator {\n  BoldDecorator(TextFormatter inner) { super(inner); }\n  public String format(String text) {\n    return '<b>' + inner().format(text) + '</b>';\n  }\n}\n\nfinal class ItalicDecorator extends FormatterDecorator {\n  ItalicDecorator(TextFormatter inner) { super(inner); }\n  public String format(String text) {\n    return '<i>' + inner().format(text) + '</i>';\n  }\n}\n\nfinal class UpperCaseDecorator extends FormatterDecorator {\n  UpperCaseDecorator(TextFormatter inner) { super(inner); }\n  public String format(String text) {\n    return inner().format(text).toUpperCase();\n  }\n}",
        solutionExplanation:
          'Each decorator wraps formatted output of the inner layer.',
        designPrinciples: ['Decorator', 'Composition over Inheritance'],
        connectedHLDTopic: null,
      },
      {
        id: 'l4-2-ex2',
        title: 'UserService decorators',
        difficulty: 'medium',
        description: 'Logging, caching, retry around getUser(id).',
        requirements: [
          'UserService interface.',
          'DatabaseUserService base.',
          'Three decorators; stack all three.',
        ],
        starterCode:
          "interface UserService {\n  String getUser(String id);\n}\n// TODO decorators\n",
        testCases: ['Retry wraps inner failures (simulate).', 'Cache avoids duplicate DB hits.'],
        hints: [
          'Retry only on transient exceptions.',
          'Cache keyed by id.',
          'Log entry/exit at outermost or innermost—pick and justify.',
        ],
        solution:
          "interface UserService {\n  String getUser(String id);\n}\n\nfinal class DatabaseUserService implements UserService {\n  public String getUser(String id) { return 'user:' + id; }\n}\n\nabstract class UserServiceDecorator implements UserService {\n  private final UserService inner;\n  UserServiceDecorator(UserService inner) { this.inner = inner; }\n  protected UserService inner() { return inner; }\n}\n\nfinal class LoggingUserDecorator extends UserServiceDecorator {\n  LoggingUserDecorator(UserService inner) { super(inner); }\n  public String getUser(String id) {\n    System.out.println('getUser ' + id);\n    return inner().getUser(id);\n  }\n}\n\nfinal class CachingUserDecorator extends UserServiceDecorator {\n  private final java.util.Map<String, String> cache = new java.util.HashMap<>();\n  CachingUserDecorator(UserService inner) { super(inner); }\n  public String getUser(String id) {\n    return cache.computeIfAbsent(id, inner()::getUser);\n  }\n}\n\nfinal class RetryUserDecorator extends UserServiceDecorator {\n  RetryUserDecorator(UserService inner) { super(inner); }\n  public String getUser(String id) {\n    int attempts = 0;\n    while (true) {\n      try {\n        return inner().getUser(id);\n      } catch (RuntimeException e) {\n        if (++attempts >= 3) throw e;\n      }\n    }\n  }\n}",
        solutionExplanation:
          'Decorators add policies orthogonally to data access.',
        designPrinciples: ['Decorator', 'Single Responsibility Principle'],
        connectedHLDTopic: 'why-caching-matters',
      },
    ],
    quizQuestions: [
      q(
        'l4-2-q1',
        'Decorator solves?',
        ['Compile-time-only constants', 'Dynamic stacking of optional behaviors', 'Database migration', 'Sorting arrays'],
        1,
        'Compose behaviors at runtime.',
      ),
      q(
        'l4-2-q2',
        'Classic Java example?',
        ['String', 'BufferedInputStream wrapping InputStream', 'int', 'enum'],
        1,
        'I/O stream wrappers.',
      ),
      q(
        'l4-2-q3',
        'Decorator vs Proxy?',
        [
          'Same intent always',
          'Proxy controls access; decorator adds responsibilities',
          'Proxy adds features; decorator security only',
          'No difference',
        ],
        1,
        'Intent differs even if structure similar.',
      ),
      q(
        'l4-2-q4',
        'Why prefer decorator over deep inheritance for toppings?',
        [
          'Inheritance cannot work',
          'Combinations grow exponentially with inheritance',
          'Decorators cannot compose',
          'Java forbids inheritance',
        ],
        1,
        'Subclass explosion is the motivation.',
      ),
      q(
        'l4-2-q5',
        'Decorator chain order matters when?',
        [
          'Never',
          'When behaviors are not commutative (auth vs cache)',
          'Always irrelevant',
          'Only for primitives',
        ],
        1,
        'Semantics can change with ordering.',
      ),
      q(
        'l4-2-q6',
        'Each decorator should?',
        [
          'Change the core interface',
          'Implement same interface as component',
          'Extend Thread',
          'Be final without delegation',
        ],
        1,
        'Transparent substitution requires same interface.',
      ),
    ],
    interviewTip:
      'Decorator is the answer to optional add-ons and cross-cutting stacks: logging, caching, retry. Show composition order and note non-commutative cases. Mention Java I/O streams as the canonical example.',
    connectedHLDTopics: ['why-caching-matters'],
  },
  {
    id: 'facade-pattern',
    title: 'Facade Pattern',
    readContent: `# Facade Pattern

## Complexity at the boundary

Subsystems grow: validators, repositories, gateways, messaging, idempotency keys. Client code that orchestrates five services with correct ordering, compensating actions, and error mapping becomes copy-pasted and wrong. Facade offers a **narrow, opinionated API** that performs the workflow internally.

## What Facade does

Facade provides a unified interface to a set of interfaces in a subsystem. Facade knows the choreography; clients call \`placeOrder()\` instead of five steps.

## Facade vs Adapter

Adapter **translates** between mismatched interfaces. Facade **simplifies** many moving parts—may wrap unrelated collaborators behind cohesive use cases.

## When to use

Entry points to complex modules, onboarding new developers, stabilizing APIs while refactoring internals, and taming third-party libraries.

## When not to use

If indirection hides necessary flexibility and every caller needs low-level control—expose both facade for common paths and direct APIs for advanced scenarios.

## Real examples

\`JdbcTemplate\` facades raw JDBC steps. Home automation “movie mode” coordinates lights, HVAC, AV.

> INTERVIEW TIP: "OrderFacade.placeOrder runs validation, payment, inventory reservation, notifications—callers get one method."

## SRP note

Facades can become god objects if they absorb domain logic—keep them thin orchestrators; push rules to domain services.

> NUMBERS: Facades often cut integration test setup by centralizing wiring once.

## Compensation and sagas

For distributed workflows, facades often coordinate **local transactions** and emit **compensating actions** on failure (release inventory if payment fails). Mentioning rollback strategy elevates LLD answers—facade is a natural place to orchestrate, while each service still owns its invariants.

## Facade vs BFF

In microservices, a **Backend-for-Frontend** can be viewed as a facade tailored to a client—aggregating calls, shaping DTOs, and hiding service churn. The pattern name differs; the coupling reduction goal aligns.

## API stability

Facades stabilize team boundaries: mobile teams depend on a narrow facade API while backend services evolve internally. Version the facade contract carefully.

> INTERVIEW TIP: Pair facade with **idempotency keys** for payments when describing order placement flows.

## When facades hurt

If every user needs different composition, a single facade may be too coarse—consider multiple facades or graph APIs.`,
    codeExamples: [
      {
        id: 'l4-3-bad',
        title: 'Bad: Client Orchestrates Everything',
        language: 'java',
        isGood: false,
        code:
          "final class Client {\n  void checkout(Order o, OrderValidator v, PaymentService p, InventoryService i, NotificationService n) {\n    v.validate(o);\n    p.charge(o.total());\n    i.reserve(o.sku(), o.qty());\n    n.send('ordered');\n  }\n}\n\nfinal class OrderValidator {\n  void validate(Order o) { }\n}\nfinal class PaymentService {\n  void charge(long cents) { }\n}\nfinal class InventoryService {\n  void reserve(String sku, int qty) { }\n}\nfinal class NotificationService {\n  void send(String m) { }\n}\ninterface Order {\n  long total();\n  String sku();\n  int qty();\n}",
        explanation:
          'Every client duplicates ordering, error handling, and rollback semantics.',
      },
      {
        id: 'l4-3-good',
        title: 'Good: Facade',
        language: 'java',
        isGood: true,
        code:
          "interface Order {\n  long total();\n  String sku();\n  int qty();\n}\n\nfinal class OrderValidator {\n  void validate(Order o) { }\n}\nfinal class PaymentService {\n  void charge(long cents) { }\n}\nfinal class InventoryService {\n  void reserve(String sku, int qty) { }\n}\nfinal class NotificationService {\n  void send(String m) { }\n}\n\nfinal class OrderFacade {\n  private final OrderValidator validator;\n  private final PaymentService payments;\n  private final InventoryService inventory;\n  private final NotificationService notifications;\n\n  OrderFacade(OrderValidator validator, PaymentService payments, InventoryService inventory, NotificationService notifications) {\n    this.validator = validator;\n    this.payments = payments;\n    this.inventory = inventory;\n    this.notifications = notifications;\n  }\n\n  void placeOrder(Order o) {\n    validator.validate(o);\n    payments.charge(o.total());\n    inventory.reserve(o.sku(), o.qty());\n    notifications.send('ordered');\n  }\n}",
        explanation:
          'Clients depend on facade; workflow centralized and easier to evolve.',
      },
    ],
    diagrams: [
      {
        id: 'l4-3-d1',
        title: 'Facade orchestration',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass OrderFacade {\n  +placeOrder(Order)\n}\nclass OrderValidator\nclass PaymentService\nclass InventoryService\nclass NotificationService\nOrderFacade --> OrderValidator\nOrderFacade --> PaymentService\nOrderFacade --> InventoryService\nOrderFacade --> NotificationService',
      },
    ],
    exercises: [
      {
        id: 'l4-3-ex1',
        title: 'Smart Home Facade',
        difficulty: 'medium',
        description: 'Modes: morning, movie, away coordinating subsystems.',
        requirements: [
          'LightingSystem, SecuritySystem, Thermostat, EntertainmentSystem.',
          'SmartHomeFacade.setMode for each scenario.',
        ],
        starterCode:
          "// TODO: systems + facade\n",
        testCases: ['movie dims lights and arms security.', 'away sets temp to 65.'],
        hints: [
          'Keep subsystems dumb; facade encodes scenarios.',
          'Use enums for mode names.',
          'Log actions for demo.',
        ],
        solution:
          "enum Mode { MORNING, MOVIE, AWAY }\n\nfinal class LightingSystem {\n  void on() { }\n  void off() { }\n  void dim(int pct) { }\n}\n\nfinal class SecuritySystem {\n  void arm() { }\n  void disarm() { }\n}\n\nfinal class Thermostat {\n  void setTemp(int f) { }\n}\n\nfinal class EntertainmentSystem {\n  void on() { }\n  void off() { }\n  void hdmi() { }\n}\n\nfinal class SmartHomeFacade {\n  private final LightingSystem lights = new LightingSystem();\n  private final SecuritySystem security = new SecuritySystem();\n  private final Thermostat thermo = new Thermostat();\n  private final EntertainmentSystem tv = new EntertainmentSystem();\n\n  void setMode(Mode mode) {\n    switch (mode) {\n      case MORNING -> {\n        lights.on();\n        security.disarm();\n        thermo.setTemp(72);\n        tv.off();\n      }\n      case MOVIE -> {\n        lights.dim(10);\n        security.arm();\n        thermo.setTemp(70);\n        tv.on();\n        tv.hdmi();\n      }\n      case AWAY -> {\n        lights.off();\n        security.arm();\n        thermo.setTemp(65);\n        tv.off();\n      }\n    }\n  }\n}",
        solutionExplanation:
          'Facade encodes coordinated transitions; subsystems stay reusable.',
        designPrinciples: ['Facade', 'Separation of Concerns'],
        connectedHLDTopic: null,
      },
      {
        id: 'l4-3-ex2',
        title: 'Thin vs fat facade',
        difficulty: 'easy',
        description: 'Explain what logic belongs inside OrderFacade vs domain services.',
        requirements: ['List what facade should NOT do.'],
        starterCode:
          "// Write 3-5 bullet points in comments as answer\n",
        testCases: ['Student articulates orchestration vs domain rules.'],
        hints: [
          'Facade coordinates; pricing rules live in PricingService.',
          'Avoid embedding SQL in facade.',
          'Transaction boundaries may live in facade or application service layer.',
        ],
        solution:
          "/**\n * Facade should: coordinate calls, map errors, manage transaction boundaries if needed.\n * Facade should NOT: contain pricing formulas, SQL, or complex domain invariants — those belong\n * in domain services / aggregates.\n */\nfinal class Notes { }",
        solutionExplanation:
          'Keeps facade maintainable and respects layered architecture.',
        designPrinciples: ['Facade', 'Single Responsibility Principle'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l4-3-q1',
        'Facade primary purpose?',
        ['Translate vendor types', 'Simplify access to complex subsystem', 'Clone objects', 'Sort lists'],
        1,
        'Hide complexity behind a simpler surface.',
      ),
      q(
        'l4-3-q2',
        'Facade vs Adapter?',
        [
          'Same',
          'Adapter matches foreign interface; facade simplifies many internal parts',
          'Adapter is only for UI',
          'Facade cannot wrap more than one class',
        ],
        1,
        'Different goals.',
      ),
      q(
        'l4-3-q3',
        'Risk of facades?',
        [
          'They are always bad',
          'Becoming a god object with domain logic',
          'Cannot be tested',
          'Require inheritance',
        ],
        1,
        'Keep orchestration thin.',
      ),
      q(
        'l4-3-q4',
        'JdbcTemplate is an example of?',
        ['Adapter only', 'Facade over JDBC', 'Singleton only', 'Prototype'],
        1,
        'Simplifies common JDBC operations.',
      ),
      q(
        'l4-3-q5',
        'Can clients still access subsystem classes?',
        [
          'Never allowed',
          'Yes if exposed — facade is not forced to be the only entry',
          'Illegal in Java',
          'Only via reflection',
        ],
        1,
        'Facade is convenience, not necessarily exclusive.',
      ),
    ],
    interviewTip:
      'Use Facade for multi-step workflows across subsystems. Keep it an orchestrator, not a dumping ground for business rules. Mention rollback/compensation for distributed operations when relevant.',
    connectedHLDTopics: ['monolith-vs-microservices'],
  },
  {
    id: 'proxy-pattern',
    title: 'Proxy Pattern',
    readContent: `# Proxy Pattern

## Controlling access

Sometimes you need a stand-in: defer expensive work, enforce permissions, cache results, or represent remote objects. Proxy implements the same interface as the real subject and forwards calls—adding control in front.

## Proxy flavors

**Virtual proxy** lazily initializes heavy resources. **Protection proxy** checks credentials/roles. **Remote proxy** represents objects in another process (RMI historically). **Logging/auditing proxy** records access. **Caching proxy** memoizes reads.

## Proxy vs Decorator

Structure is similar; **intent differs**. Proxy focuses on **controlling access** to the real object. Decorator stacks **additional responsibilities**. Interviewers expect you to articulate intent, not just UML.

## When to use

Lazy loading media, securing documents, rate limiting outbound APIs, RPC stubs, memoization.

## Pitfalls

Over-proxying obscures behavior; debugging becomes harder. Transparent proxies (framework-generated) can surprise developers—understand ordering with transactions and AOP.

> INTERVIEW TIP: "Rate limiting and auth checks belong in a proxy in front of ApiService—core service stays business-focused."

## Java notes

\`java.lang.reflect.Proxy\` builds dynamic proxies for interfaces. Spring AOP uses proxies for aspects around beans.

> IMPORTANT: Match equals/hashCode carefully when proxies wrap entities—identity semantics can get subtle.

## Remote and RMI history

Classic Java RMI stubs are remote proxies: local interface, network hop underneath. Modern **gRPC clients** and **REST clients** generated from OpenAPI are conceptually similar—wire protocol hidden behind familiar interfaces.

## Security and auditing

Protection proxies centralize authorization, ensuring business objects stay free of role checks scattered everywhere. Logging proxies help with **audit trails** for regulated domains—who accessed which record.

## Performance and lazy loading

Virtual proxies trade **latency on first access** for faster graph construction—essential in UI lists where most items are never expanded. Pair with **pagination** at higher levels to avoid huge lazy-proxy graphs.

## Testing

Proxies should be unit-tested for policy (deny/allow) independently of receivers. Integration tests combine proxy + real receiver.

> ANALOGY: A security guard at a building door is a protection proxy—you interact with the building (subject) only after the guard’s policy allows.`,
    codeExamples: [
      {
        id: 'l4-4-virtual',
        title: 'Virtual Proxy: Lazy Image',
        language: 'java',
        isGood: true,
        code:
          "interface Image {\n  void display();\n}\n\nfinal class RealImage implements Image {\n  private final String file;\n  RealImage(String file) {\n    this.file = file;\n    loadFromDisk();\n  }\n  private void loadFromDisk() {\n    System.out.println('load ' + file);\n  }\n  public void display() {\n    System.out.println('show ' + file);\n  }\n}\n\nfinal class ImageProxy implements Image {\n  private final String file;\n  private RealImage real;\n\n  ImageProxy(String file) {\n    this.file = file;\n  }\n\n  public void display() {\n    if (real == null) {\n      real = new RealImage(file);\n    }\n    real.display();\n  }\n}",
        explanation:
          'Heavy load happens on first display, not when constructing proxies.',
      },
      {
        id: 'l4-4-protect',
        title: 'Protection Proxy: Document edit',
        language: 'java',
        isGood: true,
        code:
          "interface Document {\n  String view();\n  void edit(String text);\n}\n\nfinal class RealDocument implements Document {\n  private String text = '';\n  public String view() { return text; }\n  public void edit(String text) { this.text = text; }\n}\n\nfinal class ProtectedDocumentProxy implements Document {\n  private final Document inner;\n  private final String role;\n\n  ProtectedDocumentProxy(Document inner, String role) {\n    this.inner = inner;\n    this.role = role;\n  }\n\n  public String view() { return inner.view(); }\n\n  public void edit(String text) {\n    if (!'ADMIN'.equals(role)) {\n      throw new SecurityException('deny');\n    }\n    inner.edit(text);\n  }\n}",
        explanation:
          'Authorization enforced at proxy boundary.',
      },
    ],
    diagrams: [
      {
        id: 'l4-4-d1',
        title: 'Proxy pattern',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Image {\n  <<interface>>\n  +display()\n}\nclass RealImage\nclass ImageProxy\nImage <|.. RealImage\nImage <|.. ImageProxy\nImageProxy --> RealImage : lazy',
      },
    ],
    exercises: [
      {
        id: 'l4-4-ex1',
        title: 'Rate-Limited API Proxy',
        difficulty: 'medium',
        description: 'Limit calls per minute to RealApiService.',
        requirements: [
          'ApiService interface makeRequest(endpoint).',
          'RateLimitedApiProxy tracks timestamps, throws when exceeded.',
        ],
        starterCode:
          "interface ApiService {\n  String makeRequest(String endpoint);\n}\n// TODO\n",
        testCases: ['Burst beyond limit throws.', 'After window passes, allowed again (simplified).'],
        hints: [
          'Use ArrayDeque of request times.',
          'Evict times older than window.',
          'Synchronize for thread safety.',
        ],
        solution:
          "import java.util.ArrayDeque;\nimport java.util.Deque;\n\ninterface ApiService {\n  String makeRequest(String endpoint);\n}\n\nfinal class RealApiService implements ApiService {\n  public String makeRequest(String endpoint) { return 'ok:' + endpoint; }\n}\n\nfinal class RateLimitExceededException extends RuntimeException {}\n\nfinal class RateLimitedApiProxy implements ApiService {\n  private final ApiService inner;\n  private final int maxPerMinute;\n  private final Deque<Long> times = new ArrayDeque<>();\n\n  RateLimitedApiProxy(ApiService inner, int maxPerMinute) {\n    this.inner = inner;\n    this.maxPerMinute = maxPerMinute;\n  }\n\n  public synchronized String makeRequest(String endpoint) {\n    long now = System.currentTimeMillis();\n    long windowStart = now - 60_000;\n    while (!times.isEmpty() && times.peekFirst() < windowStart) {\n      times.pollFirst();\n    }\n    if (times.size() >= maxPerMinute) {\n      throw new RateLimitExceededException();\n    }\n    times.addLast(now);\n    return inner.makeRequest(endpoint);\n  }\n}",
        solutionExplanation:
          'Proxy enforces non-functional requirement without polluting core API.',
        designPrinciples: ['Proxy', 'Separation of Concerns'],
        connectedHLDTopic: null,
      },
      {
        id: 'l4-4-ex2',
        title: 'Proxy vs Decorator essay',
        difficulty: 'easy',
        description: 'Two paragraphs comparing intent and use cases.',
        requirements: ['Mention access control vs feature stacking.'],
        starterCode:
          "// TODO comment answer\n",
        testCases: ['Clear intent distinction.'],
        hints: [
          'Proxy: lazy/security/remote.',
          'Decorator: toppings/middleware.',
          'Same structure, different motivation.',
        ],
        solution:
          "/** Proxy: control access to real object — lazy init, security, rate limits, remote stubs.\n * Decorator: add responsibilities around object — logging, caching, formatting stacks.\n * UML similar; tell intent in interviews.\n */\nclass Answer {}",
        solutionExplanation:
          'Interview answers should emphasize motivation, not only class diagrams.',
        designPrinciples: ['Proxy', 'Decorator'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l4-4-q1',
        'Virtual proxy defers?',
        ['Compilation', 'Expensive initialization until needed', 'Garbage collection', 'Exceptions'],
        1,
        'Lazy creation pattern.',
      ),
      q(
        'l4-4-q2',
        'Protection proxy adds?',
        ['Toppings', 'Authorization / access rules', 'SQL joins', 'JSON parsing'],
        1,
        'Gate operations by role or token.',
      ),
      q(
        'l4-4-q3',
        'Spring transactional proxies relate to?',
        ['Prototype', 'AOP proxies around beans', 'Singleton enum', 'String pool'],
        1,
        'Cross-cutting behavior via proxy objects.',
      ),
      q(
        'l4-4-q4',
        'Proxy vs Decorator intent?',
        [
          'Identical',
          'Proxy controls access; decorator adds behavior',
          'Decorator cannot wrap',
          'Proxy cannot implement interfaces',
        ],
        1,
          'Classic interview distinction.',
      ),
      q(
        'l4-4-q5',
        'Remote proxy used for?',
        [
          'Local CPU registers',
          'Represent remote object in another address space',
          'Primitive types',
          'Annotations',
        ],
        1,
        'RMI stubs / RPC clients.',
      ),
      q(
        'l4-4-q6',
        'Caching proxy caches?',
        ['Source code', 'Results of expensive calls', 'Bytecode', 'Thread stacks'],
        1,
        'Memoization transparently.',
      ),
    ],
    interviewTip:
      'Proxy controls access: lazy loading, security, rate limits, remote stubs. Contrast with Decorator clearly. Mention dynamic proxies and Spring AOP when relevant.',
    connectedHLDTopics: [],
  },
  {
    id: 'composite-pattern',
    title: 'Composite Pattern',
    readContent: `# Composite Pattern

## Uniform trees

Filesystems mix files and folders; UIs nest panels and controls; organizations group people and departments. Clients want one operation—\`getSize()\`, \`render()\`, \`getSalaryTotal()\`—whether the target is a leaf or a container.

## What Composite does

Composite composes objects into part-whole hierarchies. Component interface is implemented by **Leaf** (no children) and **Composite** (holds child Components). Composite operations recurse over children.

## When to use

Tree-structured models, nested menus, scene graphs, AST-like structures.

## When not to use

If leaves and composites have radically different operations, forcing a common interface feels wrong—consider separate types or visitor pattern.

## Implementation tips

Be careful with **type safety**: \`add(Component)\` on leaves may throw or be avoided via separate composite interface. Document whether children order matters.

> INTERVIEW TIP: "Files and folders—both support getSize(); folder sums children recursively."

## Performance

Naive recursion can be deep; consider caching aggregates for huge trees with invalidation on change.

> NUMBERS: Balanced trees keep operations at O(depth); wide folders may need batching for UI rendering.

## Visitor and iteration

When new operations on trees are common but node types stable, **Visitor** complements Composite. If node types churn, Composite + polymorphic methods may suffice.

## Type safety variants

Some APIs split **Composite** and **Leaf** interfaces so \`add\` exists only on composites—avoids no-op add on files. Discuss tradeoffs: more types vs safer API.

## Concurrency

Iterating mutable children while others modify requires synchronization or snapshot iterators—mention when discussing directory trees in multi-threaded loaders.

## UI and documents

React-like virtual DOM and scene graphs are composite structures—uniform rendering APIs traverse trees. Mentioning this links LLD to front-end intuition.

> INTERVIEW TIP: For expression trees, pair Composite with **Interpreter** evaluation; be ready to compare with Visitor for extensible operations.`,
    codeExamples: [
      {
        id: 'l4-5-fs',
        title: 'Composite: File system',
        language: 'java',
        isGood: true,
        code:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface Node {\n  String getName();\n  int getSize();\n}\n\nfinal class File implements Node {\n  private final String name;\n  private final int size;\n  File(String name, int size) {\n    this.name = name;\n    this.size = size;\n  }\n  public String getName() { return name; }\n  public int getSize() { return size; }\n}\n\nfinal class Folder implements Node {\n  private final String name;\n  private final List<Node> children = new ArrayList<>();\n  Folder(String name) { this.name = name; }\n  void add(Node n) { children.add(n); }\n  public String getName() { return name; }\n  public int getSize() {\n    int sum = 0;\n    for (Node c : children) sum += c.getSize();\n    return sum;\n  }\n}",
        explanation:
          'Folder delegates size aggregation; files return direct size.',
      },
      {
        id: 'l4-5-org',
        title: 'Composite: Org hierarchy',
        language: 'java',
        isGood: true,
        code:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface Employee {\n  String getName();\n  int getSalary();\n}\n\nfinal class Individual implements Employee {\n  private final String name;\n  private final int salary;\n  Individual(String name, int salary) {\n    this.name = name;\n    this.salary = salary;\n  }\n  public String getName() { return name; }\n  public int getSalary() { return salary; }\n}\n\nfinal class Manager implements Employee {\n  private final String name;\n  private final int salary;\n  private final List<Employee> team = new ArrayList<>();\n  Manager(String name, int salary) {\n    this.name = name;\n    this.salary = salary;\n  }\n  void add(Employee e) { team.add(e); }\n  public String getName() { return name; }\n  public int getSalary() {\n    int sum = salary;\n    for (Employee e : team) sum += e.getSalary();\n    return sum;\n  }\n}",
        explanation:
          'Note: salary aggregation example—often separate getOwnSalary vs team cost to avoid confusion.',
      },
    ],
    diagrams: [
      {
        id: 'l4-5-d1',
        title: 'Composite structure',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Node {\n  <<interface>>\n  +getSize()\n}\nclass File\nclass Folder\nNode <|.. File\nNode <|.. Folder\nFolder o-- Node : children',
      },
    ],
    exercises: [
      {
        id: 'l4-5-ex1',
        title: 'Menu System',
        difficulty: 'medium',
        description: 'Nested menus with items; print with indentation.',
        requirements: [
          'MenuComponent: getName, getPrice, print, optional add.',
          'MenuItem leaf; Menu composite.',
        ],
        starterCode:
          "interface MenuComponent {\n  // TODO\n}\n",
        testCases: ['Nested menu prints tree.', 'Price sums nested items for menu.'],
        hints: [
          'add() only on Menu; throw on MenuItem or use safe default.',
          'print(prefix) accumulates indentation.',
          'Recursively sum child prices.',
        ],
        solution:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface MenuComponent {\n  String getName();\n  int getPrice();\n  void print(String indent);\n}\n\nfinal class MenuItem implements MenuComponent {\n  private final String name;\n  private final int priceCents;\n  MenuItem(String name, int priceCents) {\n    this.name = name;\n    this.priceCents = priceCents;\n  }\n  public String getName() { return name; }\n  public int getPrice() { return priceCents; }\n  public void print(String indent) {\n    System.out.println(indent + name + ' - ' + priceCents);\n  }\n}\n\nfinal class Menu implements MenuComponent {\n  private final String name;\n  private final List<MenuComponent> children = new ArrayList<>();\n  Menu(String name) { this.name = name; }\n  void add(MenuComponent c) { children.add(c); }\n  public String getName() { return name; }\n  public int getPrice() {\n    int sum = 0;\n    for (MenuComponent c : children) sum += c.getPrice();\n    return sum;\n  }\n  public void print(String indent) {\n    System.out.println(indent + name);\n    for (MenuComponent c : children) {\n      c.print(indent + '  ');\n    }\n  }\n}",
        solutionExplanation:
          'Composite recurses for print and price; uniform interface for items and submenus.',
        designPrinciples: ['Composite', 'Recursion'],
        connectedHLDTopic: null,
      },
      {
        id: 'l4-5-ex2',
        title: 'Expression tree',
        difficulty: 'medium',
        description: 'Evaluate (3 + 5) * 2 = 16.',
        requirements: [
          'Expression with evaluate().',
          'NumberExpression leaf; BinaryExpression composite.',
        ],
        starterCode:
          "interface Expression {\n  double evaluate();\n}\n// TODO\n",
        testCases: ['Evaluates sample expression.', 'Supports + - * /.'],
        hints: [
          'BinaryExpression holds op char and left/right Expression.',
          'NumberExpression stores value.',
          'Build tree bottom-up.',
        ],
        solution:
          "interface Expression {\n  double evaluate();\n}\n\nfinal class NumberExpression implements Expression {\n  private final double value;\n  NumberExpression(double value) { this.value = value; }\n  public double evaluate() { return value; }\n}\n\nfinal class BinaryExpression implements Expression {\n  private final char op;\n  private final Expression left;\n  private final Expression right;\n  BinaryExpression(char op, Expression left, Expression right) {\n    this.op = op;\n    this.left = left;\n    this.right = right;\n  }\n  public double evaluate() {\n    double l = left.evaluate();\n    double r = right.evaluate();\n    return switch (op) {\n      case '+' -> l + r;\n      case '-' -> l - r;\n      case '*' -> l * r;\n      case '/' -> l / r;\n      default -> throw new IllegalArgumentException(String.valueOf(op));\n    };\n  }\n}\n\nclass Demo {\n  public static void main(String[] args) {\n    Expression expr = new BinaryExpression('*',\n      new BinaryExpression('+', new NumberExpression(3), new NumberExpression(5)),\n      new NumberExpression(2));\n    System.out.println(expr.evaluate());\n  }\n}",
        solutionExplanation:
          'Composite AST: recursive evaluation mirrors tree structure.',
        designPrinciples: ['Composite', 'Interpreter'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l4-5-q1',
        'Composite models?',
        ['Flat maps only', 'Part-whole hierarchies', 'Single objects only', 'Primitives'],
        1,
        'Tree structures with uniform interface.',
      ),
      q(
        'l4-5-q2',
        'Leaf vs composite?',
        [
          'Same always',
          'Leaf has no children; composite aggregates children',
          'Leaf cannot implement interface',
          'Composite cannot recurse',
        ],
        1,
        'Classic distinction.',
      ),
      q(
        'l4-5-q3',
        'getSize on folder typically?',
        ['Returns 0 always', 'Sums children recursively', 'Throws', 'Uses SQL'],
        1,
        'Recursive aggregation.',
      ),
      q(
        'l4-5-q4',
        'Design smell if leaf and composite differ too much?',
        [
          'Always fine',
          'Forcing one interface may be wrong—consider visitor or split types',
          'Composite forbids visitors',
          'Use only inheritance',
        ],
        1,
        'Not every hierarchy fits composite.',
      ),
      q(
        'l4-5-q5',
        'Real-world composite example?',
        ['int', 'UI widget trees', 'bytecode opcode', 'CPU register'],
        1,
        'Nested UI components.',
      ),
    ],
    interviewTip:
      'Composite answers hierarchical questions: files/folders, menus, org charts, ASTs. Discuss whether operations make sense on both leaves and nodes; consider add() only on composites.',
    connectedHLDTopics: [],
  },
];
