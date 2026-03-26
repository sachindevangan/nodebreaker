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

export const CHAPTER_L5_TOPICS: LLDTopic[] = [
  {
    id: 'strategy-pattern',
    title: 'Strategy Pattern',
    readContent: `# Strategy Pattern

## The polymorphic algorithm problem

Business rules vary: pricing models, route finders, payment processors, compression codecs. The naïve approach is a growing \`switch\` on type or string codes inside one class. Every new variant edits the same method—higher regression risk, poor test isolation, and OCP violations. Strategy extracts each algorithm into its own class behind a shared interface.

## What Strategy does

Define \`Strategy\` interface for the varying behavior. Concrete strategies implement it. **Context** holds a reference to a strategy and delegates: \`context.execute()\` calls \`strategy.run()\`. Swap strategies at runtime by assignment—no inheritance explosion.

## Strategy vs raw conditionals

Conditionals couple decision logic with execution sites. Strategy localizes each algorithm, enables unit tests per strategy, and pairs with factories for configuration-driven selection.

## Relationship to other patterns

Factories often **create** strategies. Template Method fixes skeleton with inheritance; Strategy swaps via composition—more flexible runtime changes. State resembles Strategy but transitions are driven by internal state machine, not external selection.

## When to use

Multiple interchangeable algorithms, runtime selection, plugin-like behavior. Parking fees, discounts, shipping calculators, sorting policies.

## When not to use

A single algorithm unlikely to change—keep simple methods. Over-abstraction hurts readability.

## HLD bridge

Load balancers choose Round Robin vs Least Connections—strategies at infrastructure scale.

> INTERVIEW TIP: "ParkingLot holds \`PricingStrategy\`; \`setStrategy\` for peak hours dynamic pricing."

> NUMBERS: Replacing a 200-line switch with 5 strategy classes often cuts cyclomatic complexity dramatically.

## Enterprise and interview scenarios

In payments, strategies correspond to **capture** vs **auth-only** flows, region-specific rules, or partner-specific fee schedules. In shipping, strategies encode carrier APIs with different cutoffs. Articulate **who selects** the strategy: configuration service, user choice, A/B experiment, or business rule engine.

## Pitfalls

Over-generalizing a single \`Strategy\` interface when clusters of algorithms need different inputs leads to bloated parameter objects—consider multiple strategy interfaces (segregation). Also avoid hiding side effects inside strategies when the context must coordinate transactions—make side effects explicit.

## Connection to functional style

Java functional interfaces (\`UnaryOperator\`, \`Predicate\`) can act as lightweight strategies for simple cases—mention when discussing modern style.

> INTERVIEW TIP: Pair Strategy with **Factory** when strategies are selected from configuration: factory builds the right strategy object, context merely executes.`,
    codeExamples: [
      {
        id: 'l5-1-bad',
        title: 'Bad: Switch on Payment Type',
        language: 'java',
        isGood: false,
        code:
          "enum PaymentType { CREDIT_CARD, PAYPAL, CASH }\n\nfinal class PaymentProcessor {\n  boolean processPayment(PaymentType type, long cents) {\n    switch (type) {\n      case CREDIT_CARD:\n        return chargeCard(cents);\n      case PAYPAL:\n        return chargePaypal(cents);\n      case CASH:\n        return acceptCash(cents);\n      default:\n        throw new IllegalArgumentException();\n    }\n  }\n\n  private boolean chargeCard(long cents) { return true; }\n  private boolean chargePaypal(long cents) { return true; }\n  private boolean acceptCash(long cents) { return true; }\n}",
        explanation:
          'Adding CRYPTO edits this class—OCP violation and growing method.',
      },
      {
        id: 'l5-1-good',
        title: 'Good: Strategy Injection',
        language: 'java',
        isGood: true,
        code:
          "interface PaymentStrategy {\n  boolean processPayment(long cents);\n}\n\nfinal class CreditCardStrategy implements PaymentStrategy {\n  public boolean processPayment(long cents) { return true; }\n}\n\nfinal class PaymentProcessor {\n  private PaymentStrategy strategy;\n\n  void setStrategy(PaymentStrategy strategy) {\n    this.strategy = strategy;\n  }\n\n  boolean pay(long cents) {\n    return strategy.processPayment(cents);\n  }\n}",
        explanation:
          'New payment = new class + wiring; PaymentProcessor stable.',
      },
      {
        id: 'l5-1-runtime',
        title: 'Runtime Strategy Switch',
        language: 'java',
        isGood: true,
        code:
          "interface SortStrategy {\n  void sort(int[] data);\n}\n\nfinal class InsertionSort implements SortStrategy {\n  public void sort(int[] data) { /* small n */ }\n}\n\nfinal class MergeSort implements SortStrategy {\n  public void sort(int[] data) { /* large n */ }\n}\n\nfinal class Sorter {\n  private SortStrategy strategy = new InsertionSort();\n\n  void setStrategy(SortStrategy strategy) {\n    this.strategy = strategy;\n  }\n\n  void sort(int[] data) {\n    if (data.length > 64) {\n      setStrategy(new MergeSort());\n    }\n    strategy.sort(data);\n  }\n}",
        explanation:
          'Context chooses strategy based on input characteristics.',
      },
    ],
    diagrams: [
      {
        id: 'l5-1-d1',
        title: 'Strategy context',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Context {\n  -strategy: Strategy\n  +execute()\n}\nclass Strategy {\n  <<interface>>\n  +algorithm()\n}\nclass ConcreteStrategyA\nclass ConcreteStrategyB\nStrategy <|.. ConcreteStrategyA\nStrategy <|.. ConcreteStrategyB\nContext --> Strategy',
      },
    ],
    exercises: [
      {
        id: 'l5-1-ex1',
        title: 'Discount Strategy',
        difficulty: 'easy',
        description: 'Percentage, flat, BOGO strategies for cart.',
        requirements: [
          'DiscountStrategy calculateDiscount(originalPrice).',
          'ShoppingCart uses injected strategy.',
        ],
        starterCode:
          "interface DiscountStrategy {\n  long centsAfterDiscount(long originalCents);\n}\n// TODO\n",
        testCases: ['Percentage halves price for 50%.', 'Flat never below zero.'],
        hints: [
          'Use long cents for money.',
          'BOGO can return complex structure—simplify to percent equivalent.',
          'Inject strategy via constructor.',
        ],
        solution:
          "interface DiscountStrategy {\n  long centsAfterDiscount(long originalCents);\n}\n\nfinal class PercentageDiscount implements DiscountStrategy {\n  private final int percentOff;\n  PercentageDiscount(int percentOff) { this.percentOff = percentOff; }\n  public long centsAfterDiscount(long originalCents) {\n    return originalCents * (100 - percentOff) / 100;\n  }\n}\n\nfinal class FlatDiscount implements DiscountStrategy {\n  private final long offCents;\n  FlatDiscount(long offCents) { this.offCents = offCents; }\n  public long centsAfterDiscount(long originalCents) {\n    return Math.max(0, originalCents - offCents);\n  }\n}\n\nfinal class ShoppingCart {\n  private final DiscountStrategy discount;\n  ShoppingCart(DiscountStrategy discount) { this.discount = discount; }\n  long totalAfter(long cents) { return discount.centsAfterDiscount(cents); }\n}",
        solutionExplanation:
          'Strategies isolate pricing rules; cart stays simple.',
        designPrinciples: ['Strategy', 'Open/Closed Principle'],
        connectedHLDTopic: null,
      },
      {
        id: 'l5-1-ex2',
        title: 'Route planning strategies',
        difficulty: 'medium',
        description: 'Driving, walking, cycling strategies.',
        requirements: ['RouteStrategy calculateRoute(a,b) returning distance estimate.'],
        starterCode:
          "record Route(int distanceMeters, int etaSeconds) {}\ninterface RouteStrategy {\n  Route calculateRoute(String a, String b);\n}\n// TODO Navigator\n",
        testCases: ['Each strategy returns different distances.'],
        hints: [
          'Return record or simple POJO.',
          'Navigator holds RouteStrategy field.',
          'Dummy graph ok for interview.',
        ],
        solution:
          "record Route(int distanceMeters, int etaSeconds) {}\n\ninterface RouteStrategy {\n  Route calculateRoute(String a, String b);\n}\n\nfinal class DrivingStrategy implements RouteStrategy {\n  public Route calculateRoute(String a, String b) {\n    return new Route(5000, 600);\n  }\n}\n\nfinal class WalkingStrategy implements RouteStrategy {\n  public Route calculateRoute(String a, String b) {\n    return new Route(4200, 3000);\n  }\n}\n\nfinal class Navigator {\n  private RouteStrategy strategy;\n\n  Navigator(RouteStrategy strategy) {\n    this.strategy = strategy;\n  }\n\n  void setStrategy(RouteStrategy strategy) {\n    this.strategy = strategy;\n  }\n\n  Route plan(String a, String b) {\n    return strategy.calculateRoute(a, b);\n  }\n}",
        solutionExplanation:
          'Algorithms vary independently; Navigator delegates.',
        designPrinciples: ['Strategy', 'Dependency Inversion'],
        connectedHLDTopic: null,
      },
      {
        id: 'l5-1-ex3',
        title: 'Parking fee strategies',
        difficulty: 'medium',
        description: 'Hourly, flat, dynamic by occupancy.',
        requirements: ['PricingStrategy calculateFee(vehicleType, hours).', 'ParkingLot holds strategy.'],
        starterCode:
          "enum VehicleType { CAR, TRUCK }\ninterface PricingStrategy {\n  long cents(VehicleType v, int hours);\n}\n// TODO\n",
        testCases: ['Dynamic increases fee when occupancy high (stub).'],
        hints: [
          'Pass occupancy service into DynamicPricing.',
          'Use long cents.',
          'Swap strategy on ParkingLot setter.',
        ],
        solution:
          "enum VehicleType { CAR, TRUCK }\n\ninterface PricingStrategy {\n  long cents(VehicleType v, int hours);\n}\n\nfinal class HourlyPricing implements PricingStrategy {\n  private final long centsPerHour;\n  HourlyPricing(long centsPerHour) { this.centsPerHour = centsPerHour; }\n  public long cents(VehicleType v, int hours) {\n    long mult = v == VehicleType.TRUCK ? 2 : 1;\n    return centsPerHour * hours * mult;\n  }\n}\n\nfinal class FlatPricing implements PricingStrategy {\n  private final long flatCents;\n  FlatPricing(long flatCents) { this.flatCents = flatCents; }\n  public long cents(VehicleType v, int hours) { return flatCents; }\n}\n\nfinal class DynamicPricing implements PricingStrategy {\n  private final double occupancy; // 0..1\n  DynamicPricing(double occupancy) { this.occupancy = occupancy; }\n  public long cents(VehicleType v, int hours) {\n    long base = 500L * hours;\n    return (long) (base * (1.0 + occupancy));\n  }\n}\n\nfinal class ParkingLot {\n  private PricingStrategy pricing = new HourlyPricing(1000);\n\n  void setPricing(PricingStrategy pricing) {\n    this.pricing = pricing;\n  }\n\n  long fee(VehicleType v, int hours) {\n    return pricing.cents(v, hours);\n  }\n}",
        solutionExplanation:
          'Runtime pricing changes for events or congestion without editing ParkingLot logic.',
        designPrinciples: ['Strategy', 'Open/Closed Principle'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l5-1-q1',
        'Strategy mainly avoids?',
        ['Interfaces', 'Large switch/if chains for algorithms', 'Constructors', 'Garbage collection'],
        1,
        'Replace branching with polymorphism.',
      ),
      q(
        'l5-1-q2',
        'Context delegates to?',
        ['Only static methods', 'Strategy interface implementation', 'Primitives', 'main()'],
        1,
        'Delegation to interchangeable algorithms.',
      ),
      q(
        'l5-1-q3',
        'Runtime switching means?',
        [
          'Cannot change',
          'Replace strategy object without subclassing context',
          'Only compile-time',
          'Requires new JVM',
        ],
        1,
        'Composition swap.',
      ),
      q(
        'l5-1-q4',
        'Strategy vs State?',
        [
          'Same',
          'State transitions driven internally; strategy often chosen externally',
          'State cannot use interfaces',
          'Strategy only for databases',
        ],
        1,
        'Intent differs though structure similar.',
      ),
      q(
        'l5-1-q5',
        'OCP connection?',
        [
          'None',
          'Add new strategy class without editing existing ones',
          'Forbid new classes',
          'Requires switch',
        ],
        1,
        'Extend by adding classes.',
      ),
      q(
        'l5-1-q6',
        'Load balancer algorithms as strategies relates to?',
        ['Sorting ints', 'Pluggable selection policies', 'TCP ports', 'DNS TTL'],
        1,
        'Same idea at distributed systems level.',
      ),
    ],
    interviewTip:
      'Strategy is the default answer for multiple algorithms for one task. Name the interface after behavior (PricingStrategy), inject it, and emphasize adding new implementations without touching callers.',
    connectedHLDTopics: ['l4-vs-l7-load-balancing'],
  },
  {
    id: 'observer-pattern',
    title: 'Observer Pattern',
    readContent: `# Observer Pattern

## The fan-out notification problem

One domain event must update many subscribers: price tick feeds multiple UIs, order placement triggers inventory, email, analytics. Naïve code hardcodes a list of direct calls inside the subject—tight coupling, order sensitivity, and merge conflicts whenever a new listener appears.

## What Observer does

Define a **subject** maintaining observer registry. On state change, subject notifies all registered observers via a common callback (\`update\` / \`onEvent\`). Observers subscribe and unsubscribe dynamically.

## Push vs pull

**Push** sends data with notification—simple but may overshare. **Pull** notifies then observers query subject for details—flexible but couples observers to subject API. Hybrid approaches are common.

## Java ecosystem

\`Observable\`/\`Observer\` are deprecated; prefer \`PropertyChangeSupport\`, reactive streams, or event buses. Concept remains central.

## Event-driven architecture link

Observer at process level mirrors **pub/sub** at system level—same mental model, different scale.

> INTERVIEW TIP: "Auction bids notify BidHistory UI, current price display, and notifier—each observer decoupled."

## Thread safety

If notifications happen on background threads, document threading rules; consider concurrent collections for observer lists.

> NUMBERS: Fan-out cost grows linearly with observers—watch hot paths.

## Delivery guarantees

Observer in-process is **not** the same as durable messaging—if process crashes after state change but before notifications finish, events may be lost. For critical domains, pair domain events with **outbox pattern** or message brokers—connect this to HLD pub/sub.

## Memory and leaks

Strong references to observers without unsubscribe cause leaks in UI toolkits—use weak references or lifecycle-bound subscriptions where frameworks support it.

## Backpressure

If observers do heavy work synchronously, they stall the subject—consider async dispatch or event bus with worker pools.

> ANALOGY: Observer is a newsletter subscription—publishers broadcast; subscribers choose how to react.

## Testing

Subjects should be unit-tested with **test doubles** registering deterministic observers asserting call counts and payloads.`,
    codeExamples: [
      {
        id: 'l5-2-stock',
        title: 'Observer: Stock price',
        language: 'java',
        isGood: true,
        code:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface StockObserver {\n  void onPriceChanged(String symbol, double price);\n}\n\nfinal class StockPriceSubject {\n  private final List<StockObserver> observers = new ArrayList<>();\n  private double price;\n\n  void subscribe(StockObserver o) { observers.add(o); }\n  void unsubscribe(StockObserver o) { observers.remove(o); }\n\n  void setPrice(double price) {\n    this.price = price;\n    for (StockObserver o : observers) {\n      o.onPriceChanged('STK', price);\n    }\n  }\n}\n\nfinal class MobileObserver implements StockObserver {\n  public void onPriceChanged(String symbol, double price) {\n    System.out.println('mobile ' + symbol + ' ' + price);\n  }\n}\n\nfinal class EmailObserver implements StockObserver {\n  public void onPriceChanged(String symbol, double price) {\n    System.out.println('email ' + symbol + ' ' + price);\n  }\n}",
        explanation:
          'Subject broadcasts; observers independently react.',
      },
      {
        id: 'l5-2-order',
        title: 'Observer: Order placed',
        language: 'java',
        isGood: true,
        code:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface OrderListener {\n  void onOrderPlaced(String orderId);\n}\n\nfinal class OrderSubject {\n  private final List<OrderListener> listeners = new ArrayList<>();\n\n  void subscribe(OrderListener l) { listeners.add(l); }\n\n  void placeOrder(String orderId) {\n    for (OrderListener l : listeners) {\n      l.onOrderPlaced(orderId);\n    }\n  }\n}\n\nfinal class InventoryObserver implements OrderListener {\n  public void onOrderPlaced(String orderId) {\n    System.out.println('reserve stock ' + orderId);\n  }\n}\n\nfinal class EmailObserver implements OrderListener {\n  public void onOrderPlaced(String orderId) {\n    System.out.println('email ' + orderId);\n  }\n}",
        explanation:
          'Downstream reactions isolated; easy to add AnalyticsObserver.',
      },
    ],
    diagrams: [
      {
        id: 'l5-2-d1',
        title: 'Observer',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Subject {\n  +subscribe(Observer)\n  +notify()\n}\nclass Observer {\n  <<interface>>\n  +update()\n}\nSubject --> Observer : many',
      },
    ],
    exercises: [
      {
        id: 'l5-2-ex1',
        title: 'Weather station',
        difficulty: 'medium',
        description: 'Temperature, humidity, pressure updates fan out to displays.',
        requirements: [
          'WeatherStation holds measurements and observer list.',
          'CurrentConditions, Statistics, Forecast displays.',
        ],
        starterCode:
          "interface WeatherObserver {\n  void update(float temp, float humidity, float pressure);\n}\n// TODO\n",
        testCases: ['All displays receive updates.', 'Unsubscribe stops notifications.'],
        hints: [
          'setMeasurements notifies all.',
          'Statistics display tracks min/max internally.',
          'Forecast can compare pressure delta heuristically.',
        ],
        solution:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface WeatherObserver {\n  void update(float temp, float humidity, float pressure);\n}\n\nfinal class WeatherStation {\n  private final List<WeatherObserver> observers = new ArrayList<>();\n  private float temp, humidity, pressure;\n\n  void subscribe(WeatherObserver o) { observers.add(o); }\n  void unsubscribe(WeatherObserver o) { observers.remove(o); }\n\n  void setMeasurements(float t, float h, float p) {\n    this.temp = t;\n    this.humidity = h;\n    this.pressure = p;\n    for (WeatherObserver o : observers) {\n      o.update(t, h, p);\n    }\n  }\n}\n\nfinal class CurrentConditions implements WeatherObserver {\n  public void update(float temp, float humidity, float pressure) {\n    System.out.println('now ' + temp + 'C ' + humidity + '%');\n  }\n}\n\nfinal class StatisticsDisplay implements WeatherObserver {\n  private float min = Float.MAX_VALUE;\n  private float max = Float.MIN_VALUE;\n  public void update(float temp, float humidity, float pressure) {\n    min = Math.min(min, temp);\n    max = Math.max(max, temp);\n    System.out.println('min ' + min + ' max ' + max);\n  }\n}",
        solutionExplanation:
          'Subject pushes measurements; each observer maintains its own derived state.',
        designPrinciples: ['Observer', 'Loose Coupling'],
        connectedHLDTopic: null,
      },
      {
        id: 'l5-2-ex2',
        title: 'Auction observers',
        difficulty: 'medium',
        description: 'Bid changes notify history, outbid notifier, auctioneer display.',
        requirements: ['subscribe/unsubscribe', 'observers use current bid fields.'],
        starterCode:
          "interface BidObserver {\n  void onBid(String bidder, long cents);\n}\n// TODO AuctionItem\n",
        testCases: ['Previous high bidder notified on outbid.'],
        hints: [
          'Track currentBid and currentBidder.',
          'On new bid, compare to old highest.',
          'Notify all for history; special case for outbid.',
        ],
        solution:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface BidObserver {\n  void onBid(String bidder, long cents);\n}\n\nfinal class AuctionItem {\n  private final List<BidObserver> observers = new ArrayList<>();\n  private String highBidder;\n  private long highCents;\n\n  void subscribe(BidObserver o) { observers.add(o); }\n\n  void bid(String bidder, long cents) {\n    if (cents <= highCents) {\n      return;\n    }\n    highBidder = bidder;\n    highCents = cents;\n    for (BidObserver o : observers) {\n      o.onBid(bidder, cents);\n    }\n  }\n}",
        solutionExplanation:
          'Observers decouple bidding logic from presentation and notifications.',
        designPrinciples: ['Observer', 'Separation of Concerns'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l5-2-q1',
        'Observer solves?',
        ['Sorting', 'One-to-many dependency notification', 'Memory leaks only', 'SQL joins'],
        1,
        'Fan-out updates.',
      ),
      q(
        'l5-2-q2',
        'Push model sends?',
        [
          'Nothing',
          'Data with notification',
          'Only class names',
          'Bytecodes',
        ],
        1,
        'Observers receive event payload directly.',
      ),
      q(
        'l5-2-q3',
        'Why avoid hardcoded listener calls in subject?',
        [
          'Faster',
          'Tight coupling and change ripple',
          'Required by Java',
          'Observers illegal',
        ],
        1,
        'Open/closed and maintainability suffer.',
      ),
      q(
        'l5-2-q4',
        'HLD analogue?',
        ['DNS only', 'Pub/sub messaging', 'L1 cache', 'Garbage collector'],
        1,
        'Event-driven distribution.',
      ),
      q(
        'l5-2-q5',
        'Deprecated Java API?',
        ['List.of', 'Observable/Observer', 'StringBuilder', 'Optional'],
        1,
        'Prefer modern alternatives.',
      ),
      q(
        'l5-2-q6',
        'Pull model observers might?',
        [
          'Never access subject',
          'Query subject after notify for details',
          'Replace subject',
          'Compile subject',
        ],
        1,
        'Observers fetch what they need.',
      ),
    ],
    interviewTip:
      'Observer decouples state changes from reactions—use for notifications, MVC updates, and domain events. Connect to pub/sub in distributed design when bridging to HLD.',
    connectedHLDTopics: ['pub-sub-pattern'],
  },
  {
    id: 'state-pattern',
    title: 'State Pattern',
    readContent: `# State Pattern

## State explosion in methods

Objects whose behavior depends on internal mode—vending machines, TCP connections, document workflows—often accumulate \`if (state == ...)\` across every method. Adding a state touches all methods; transitions become inconsistent.

## What State does

Represent each state as a class implementing a common \`State\` interface with operations relevant to the domain (\`insertCoin\`, \`selectProduct\`). **Context** holds current \`State\` reference and delegates; states may switch context to next state.

## State vs Strategy

Structure resembles Strategy. **Strategy**: client picks algorithm. **State**: object transitions itself based on actions—internal rules dominate.

## Transition tables

Document valid transitions; map invalid operations to errors or no-ops. Makes testing straightforward: given state S and action A, expect state T.

## LLD classics

Vending machines, elevators, order pipelines, traffic lights.

> INTERVIEW TIP: Draw the state diagram first, then map each bubble to a class.

## Pitfalls

Too many micro-states can overcomplicate; sometimes enums + guarded methods suffice for tiny cases—use judgment.

## State charts and persistence

Long-lived workflows may need **state persistence** and **hydration** after restarts—mention storing current state name + version for migrations. For audit, log transitions with timestamps and actor ids.

## Hierarchical state machines

Nested states (e.g., **Active** with substates) reduce duplication; advanced interviews may expect awareness of **state chart** complexity—acknowledge when flat classes become unwieldy.

## Concurrency

If actions arrive concurrently, guard context transitions with locks or serialize events through an actor/queue—otherwise duplicate transitions corrupt invariants.

> INTERVIEW TIP: When asked vending machine, enumerate **invalid operations per state** explicitly—shows thoroughness.`,
    codeExamples: [
      {
        id: 'l5-3-bad',
        title: 'Bad: If-else state',
        language: 'java',
        isGood: false,
        code:
          "enum VMState { IDLE, HAS_COIN }\n\nfinal class VendingMachineBad {\n  private VMState state = VMState.IDLE;\n\n  void insertCoin() {\n    if (state == VMState.IDLE) {\n      state = VMState.HAS_COIN;\n    } else if (state == VMState.HAS_COIN) {\n      // duplicate handling scattered\n    }\n  }\n\n  void select() {\n    if (state == VMState.IDLE) {\n      return;\n    } else if (state == VMState.HAS_COIN) {\n      state = VMState.IDLE;\n    }\n  }\n}",
        explanation:
          'Adding MAINTENANCE state requires editing every method.',
      },
      {
        id: 'l5-3-good',
        title: 'Good: State classes',
        language: 'java',
        isGood: true,
        code:
          "interface State {\n  void insertCoin(VendingMachine ctx);\n  void select(VendingMachine ctx);\n}\n\nfinal class IdleState implements State {\n  public void insertCoin(VendingMachine ctx) {\n    ctx.setState(new HasCoinState());\n  }\n  public void select(VendingMachine ctx) { }\n}\n\nfinal class HasCoinState implements State {\n  public void insertCoin(VendingMachine ctx) { }\n  public void select(VendingMachine ctx) {\n    ctx.setState(new IdleState());\n  }\n}\n\nfinal class VendingMachine {\n  private State state = new IdleState();\n\n  void setState(State s) { this.state = s; }\n\n  void insertCoin() { state.insertCoin(this); }\n  void select() { state.select(this); }\n}",
        explanation:
          'Each state encapsulates valid transitions; add new state class with localized changes.',
      },
    ],
    diagrams: [
      {
        id: 'l5-3-state',
        title: 'Vending states',
        type: 'class',
        mermaidCode:
          'stateDiagram-v2\n[*] --> Idle\nIdle --> HasCoin: insertCoin\nHasCoin --> Idle: select / dispense',
      },
      {
        id: 'l5-3-class',
        title: 'State classes',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass VendingMachine\nclass State {\n  <<interface>>\n}\nclass IdleState\nclass HasCoinState\nState <|.. IdleState\nState <|.. HasCoinState\nVendingMachine --> State',
      },
    ],
    exercises: [
      {
        id: 'l5-3-ex1',
        title: 'Vending machine states',
        difficulty: 'medium',
        description: 'IDLE, COIN, SELECTED, DISPENSING, OUT_OF_STOCK with actions.',
        requirements: ['Invalid actions return messages.', 'States encapsulate transitions.'],
        starterCode:
          "// Skeleton only — expand\ninterface VmState {\n  String insertCoin(Vm ctx);\n}\n",
        testCases: ['Cannot select in IDLE.', 'Dispense moves to IDLE.'],
        hints: [
          'Each state class in its own file for clarity.',
          'Context exposes inventory count.',
          'Return String errors for interview simplicity.',
        ],
        solution:
          "interface VmState {\n  String insertCoin(Vm ctx);\n  String select(Vm ctx);\n}\n\nfinal class Idle implements VmState {\n  public String insertCoin(Vm ctx) {\n    ctx.setState(new HasCoin());\n    return 'ok';\n  }\n  public String select(Vm ctx) { return 'insert coin first'; }\n}\n\nfinal class HasCoin implements VmState {\n  public String insertCoin(Vm ctx) { return 'already have coin'; }\n  public String select(Vm ctx) {\n    ctx.setState(new Dispensing());\n    return 'selected';\n  }\n}\n\nfinal class Dispensing implements VmState {\n  public String insertCoin(Vm ctx) { return 'wait'; }\n  public String select(Vm ctx) { return 'wait'; }\n}\n\nfinal class Vm {\n  private VmState state = new Idle();\n  void setState(VmState s) { state = s; }\n  String insertCoin() { return state.insertCoin(this); }\n  String select() { return state.select(this); }\n}",
        solutionExplanation:
          'States own transition logic; context stays thin.',
        designPrinciples: ['State', 'Encapsulation'],
        connectedHLDTopic: null,
      },
      {
        id: 'l5-3-ex2',
        title: 'Document workflow',
        difficulty: 'medium',
        description: 'DRAFT → UNDER_REVIEW → APPROVED/REJECTED → PUBLISHED.',
        requirements: ['submit, approve, reject, publish, edit transitions.'],
        starterCode:
          "interface DocState {\n  void submit(Doc doc);\n}\n// TODO\n",
        testCases: ['Cannot publish from DRAFT.', 'Reject allows edit back to DRAFT.'],
        hints: [
          'Keep audit log list in Doc if required.',
          'Illegal transitions throw IllegalStateException.',
          'Enum current state or state object pattern.',
        ],
        solution:
          "final class Doc {\n  private DocState state = new DraftState();\n  void setState(DocState s) { state = s; }\n  void submit() { state.submit(this); }\n  void approve() { state.approve(this); }\n}\n\ninterface DocState {\n  void submit(Doc doc);\n  void approve(Doc doc);\n}\n\nfinal class DraftState implements DocState {\n  public void submit(Doc doc) { doc.setState(new ReviewState()); }\n  public void approve(Doc doc) { throw new IllegalStateException(); }\n}\n\nfinal class ReviewState implements DocState {\n  public void submit(Doc doc) { throw new IllegalStateException(); }\n  public void approve(Doc doc) { doc.setState(new ApprovedState()); }\n}\n\nfinal class ApprovedState implements DocState {\n  public void submit(Doc doc) { }\n  public void approve(Doc doc) { }\n}",
        solutionExplanation:
          'Workflow rules live in state classes; easy to extend with new states.',
        designPrinciples: ['State', 'Explicit transitions'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l5-3-q1',
        'State vs Strategy?',
        [
          'Identical',
          'State transitions internally; strategy often chosen externally',
          'Strategy never uses interfaces',
          'State cannot have classes',
        ],
        1,
        'Intent differs.',
      ),
      q(
        'l5-3-q2',
        'Invalid operation in state should?',
        ['Silently succeed always', 'Fail gracefully or throw domain error', 'Restart JVM', 'Change JDK'],
        1,
        'Guard invalid transitions.',
      ),
      q(
        'l5-3-q3',
        'Context delegates to?',
        ['Static utils', 'Current State object', 'main()', 'Random'],
        1,
        'State object handles behavior.',
      ),
      q(
        'l5-3-q4',
        'First step in interview for stateful systems?',
        [
          'Write code immediately',
          'Draw state diagram',
          'Choose database',
          'Pick sorting algorithm',
        ],
        1,
        'Visual transitions clarify design.',
      ),
      q(
        'l5-3-q5',
        'Adding new state with pattern often?',
        [
          'Edit every line of old code',
          'Add class + wire transitions from related states',
          'Impossible',
          'Requires new JVM',
        ],
        1,
        'Localized additions.',
      ),
      q(
        'l5-3-q6',
        'If-else state anti-pattern symptom?',
        [
          'Too fast',
          'Repeated state checks across methods',
          'Too many packages',
          'Garbage collection',
        ],
        1,
        'Centralize in state classes.',
      ),
    ],
    interviewTip:
      'For vending machines, elevators, workflows: draw states and transitions, then implement each state as a class. Mention invalid operations explicitly.',
    connectedHLDTopics: [],
  },
  {
    id: 'command-pattern',
    title: 'Command Pattern',
    readContent: `# Command Pattern

## Requests as first-class objects

Direct method calls execute immediately and leave no trace—hard to undo, queue, log, or compose. Command encapsulates a request as an object with \`execute()\` (and optionally \`undo()\`), letting you parameterize clients with different requests, schedule execution, and support macro operations.

## Roles

**Invoker** triggers command; **Command** knows how to act; **Receiver** performs domain work. This decouples UI buttons from light bulbs in classic remote examples.

## Undo/redo

Keep stacks of executed commands; \`undo()\` reverses using memento-like state captured in command fields.

## Transactions and sagas

Macro command runs subcommands; on failure, undo in reverse order—conceptually related to compensating transactions.

## When not to use

Trivial one-off actions with no history requirements—avoid extra objects.

> INTERVIEW TIP: "Each toolbar action is a Command with execute/undo; history stacks enable unlimited undo."

## Command queueing and remote invocation

Commands enable **job queues**: serialize command objects to disk or message queues for asynchronous execution—foundation for task runners. In distributed systems, **idempotent** commands pair with retries.

## CQRS and event sourcing (light touch)

Commands as domain events feed write models; queries separate—mention only if interviewer goes deep—shows breadth without derailing LLD scope.

## Macro commands and sagas

Composite commands should define **compensation ordering** clearly—undo in reverse execution order mirrors saga rollback semantics.

## Pitfalls

Over-command-ifying trivial getters adds noise—use for operations with history, scheduling, or auditing needs.

> IMPORTANT: Commands that capture large object snapshots can be memory-heavy—store diffs or operational transforms for text editors at scale.`,
    codeExamples: [
      {
        id: 'l5-4-bad-direct',
        title: 'Bad: Mutations Without Command Objects',
        language: 'java',
        isGood: false,
        code:
          "final class Editor {\n  private String text = '';\n  void type(String s) { text += s; }\n  String getText() { return text; }\n}\n\nfinal class Ui {\n  private final Editor editor = new Editor();\n\n  void onKey(String s) {\n    editor.type(s); // no undo history possible — actions not recorded\n  }\n}",
        explanation:
          'Without command objects there is no reversible history, scheduling, or macro replay.',
      },
      {
        id: 'l5-4-editor',
        title: 'Command: Text insert with undo',
        language: 'java',
        isGood: true,
        code:
          "interface Command {\n  void execute();\n  void undo();\n}\n\nfinal class Document {\n  private String text = '';\n  void append(String s) { text += s; }\n  void setText(String t) { text = t; }\n  String text() { return text; }\n}\n\nfinal class InsertCommand implements Command {\n  private final Document doc;\n  private final String insert;\n  private String before;\n\n  InsertCommand(Document doc, String insert) {\n    this.doc = doc;\n    this.insert = insert;\n  }\n\n  public void execute() {\n    before = doc.text();\n    doc.append(insert);\n  }\n\n  public void undo() {\n    doc.setText(before);\n  }\n}",
        explanation:
          'Command stores enough state to reverse insertion.',
      },
      {
        id: 'l5-4-remote',
        title: 'Command: Remote slots',
        language: 'java',
        isGood: true,
        code:
          "interface Command { void execute(); }\n\nfinal class Light {\n  void on() { System.out.println('on'); }\n  void off() { System.out.println('off'); }\n}\n\nfinal class LightOnCommand implements Command {\n  private final Light light;\n  LightOnCommand(Light light) { this.light = light; }\n  public void execute() { light.on(); }\n}\n\nfinal class Remote {\n  private Command slot;\n  void setCommand(Command c) { slot = c; }\n  void press() { slot.execute(); }\n}",
        explanation:
          'Invoker decoupled from receiver; commands swappable.',
      },
    ],
    diagrams: [
      {
        id: 'l5-4-d1',
        title: 'Command',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Invoker {\n  +run()\n}\nclass Command {\n  <<interface>>\n  +execute()\n}\nclass Receiver\nInvoker --> Command\nCommand --> Receiver',
      },
      {
        id: 'l5-4-d2',
        title: 'Macro command',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass MacroCommand {\n  +execute()\n  +undo()\n}\nclass Command {\n  <<interface>>\n}\nMacroCommand o-- Command : children',
      },
    ],
    exercises: [
      {
        id: 'l5-4-ex1',
        title: 'Undo/redo drawing',
        difficulty: 'medium',
        description: 'DrawCircle, DrawRectangle commands with history stacks.',
        requirements: ['Command execute/undo', 'Canvas receiver', 'undo/redo methods.'],
        starterCode:
          "interface Command {\n  void execute();\n  void undo();\n}\n// TODO\n",
        testCases: ['Undo removes last shape.', 'Redo reapplies.'],
        hints: [
          'Store canvas snapshot or inverse operation.',
          'Two stacks: undo and redo.',
          'Clear redo on new command.',
        ],
        solution:
          "import java.util.ArrayDeque;\nimport java.util.Deque;\n\ninterface Command {\n  void execute();\n  void undo();\n}\n\nfinal class Canvas {\n  private final StringBuilder shapes = new StringBuilder();\n  void addShape(String s) { shapes.append(s).append(';'); }\n  void removeLastToken() {\n    int i = shapes.lastIndexOf(\";\");\n    if (i >= 0) shapes.delete(i, shapes.length());\n  }\n  String snapshot() { return shapes.toString(); }\n}\n\nfinal class DrawCircleCommand implements Command {\n  private final Canvas canvas;\n  private String before;\n  DrawCircleCommand(Canvas canvas) { this.canvas = canvas; }\n  public void execute() {\n    before = canvas.snapshot();\n    canvas.addShape('circle');\n  }\n  public void undo() {\n    canvas.removeLastToken();\n  }\n}\n\nfinal class History {\n  private final Deque<Command> undo = new ArrayDeque<>();\n  private final Deque<Command> redo = new ArrayDeque<>();\n\n  void run(Command c) {\n    c.execute();\n    undo.push(c);\n    redo.clear();\n  }\n\n  void undoLast() {\n    if (!undo.isEmpty()) {\n      Command c = undo.pop();\n      c.undo();\n      redo.push(c);\n    }\n  }\n}",
        solutionExplanation:
          'Command pattern enables reversible operations and history management.',
        designPrinciples: ['Command', 'Memento-like state'],
        connectedHLDTopic: null,
      },
      {
        id: 'l5-4-ex2',
        title: 'Macro command with rollback',
        difficulty: 'medium',
        description: 'CompositeCommand runs child commands; undo in reverse order.',
        requirements: [
          'MacroCommand implements Command with List<Command>.',
          'execute runs all; undo undoes from last to first.',
        ],
        starterCode:
          "interface Command {\n  void execute();\n  void undo();\n}\n// TODO MacroCommand\n",
        testCases: ['If second command fails, undo first.', 'Undo order is reverse of execute.'],
        hints: [
          'Collect commands in ArrayList.',
          'On failure in execute, undo executed prefix.',
          'Macro undo pops from end.',
        ],
        solution:
          "import java.util.ArrayList;\nimport java.util.List;\n\ninterface Command {\n  void execute();\n  void undo();\n}\n\nfinal class MacroCommand implements Command {\n  private final List<Command> commands = new ArrayList<>();\n\n  void add(Command c) { commands.add(c); }\n\n  public void execute() {\n    for (Command c : commands) {\n      c.execute();\n    }\n  }\n\n  public void undo() {\n    for (int i = commands.size() - 1; i >= 0; i--) {\n      commands.get(i).undo();\n    }\n  }\n}",
        solutionExplanation:
          'Composite command composes smaller commands; reverse undo mirrors saga compensations.',
        designPrinciples: ['Command', 'Composite'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l5-4-q1',
        'Command encapsulates?',
        ['TCP packet', 'Request as object', 'Class loader', 'Primitive int'],
        1,
        'Objectify operations.',
      ),
      q(
        'l5-4-q2',
        'Undo typically needs?',
        [
          'No state',
          'Previous state or inverse operation data',
          'New thread',
          'Serialization only',
        ],
        1,
        'Store enough to reverse.',
      ),
      q(
        'l5-4-q3',
        'Macro command is?',
        [
          'Single byte',
          'Composite of commands executed together',
          'Only GUI',
          'Not related',
        ],
        1,
        'Batch execution with optional rollback.',
      ),
      q(
        'l5-4-q4',
        'Benefit for queuing?',
        [
          'None',
          'Commands can be scheduled/replayed',
          'Slower always',
          'Disables threads',
        ],
        1,
        'First-class requests.',
      ),
      q(
        'l5-4-q5',
        'Invoker role?',
        [
          'Database',
          'Triggers command execution',
          'GC',
          'Compiler',
        ],
        1,
        'Button, scheduler, remote.',
      ),
      q(
        'l5-4-q6',
        'Compared to direct call?',
        [
          'Same',
          'Command adds indirection for logging/undo/queue',
          'Command forbids execution',
          'Direct call always better',
        ],
        1,
        'Extra capabilities.',
      ),
    ],
    interviewTip:
      'Command is the undo/redo and macro answer—execute/undo, history stacks, transactional batching. Mention event sourcing replay as advanced connection.',
    connectedHLDTopics: [],
  },
  {
    id: 'chain-of-responsibility',
    title: 'Chain of Responsibility Pattern',
    readContent: `# Chain of Responsibility Pattern

## Unknown handler upfront

A request might be serviceable by one of several handlers—support tiers, approval limits, middleware validation. The sender should not embed a fixed if-chain of who handles what. Chain of Responsibility links handlers; each either processes or forwards.

## Mechanics

Handler interface \`handle(request)\` plus \`setNext\`. Concrete handlers decide based on request attributes. Configure chain order carefully—order is semantics.

## Middleware parallel

HTTP filters, Spring Security filter chains, logging chains—same idea at platform scale.

## Pitfalls

Ensure requests always terminate—avoid infinite forwarding. Consider default handler at end.

## OCP

Add new handler without editing existing ones—only wiring changes.

> INTERVIEW TIP: "Auth → rate limit → validation → business handler pipeline."

## Short-circuit vs full traversal

Some chains stop after handling (logging handled fully); others always propagate (metrics). Clarify **whether handlers can terminate early**—ambiguous chains confuse teams.

## Ordering and injection

In frameworks, chain order often lives in configuration—document defaults and overrides. Mis-ordered security checks are a common production incident class.

## Error handling

Decide whether a handler **swallows** errors or aborts the chain—consistent policy per layer (e.g., auth failure stops immediately).

## Comparison to interceptors

Servlet filters and Spring interceptors are chains—name these parallels in interviews to bridge LLD pattern vocabulary to framework mechanics.

> NUMBERS: Deep chains increase latency linearly—measure each handler’s cost; consider async where appropriate.`,
    codeExamples: [
      {
        id: 'l5-5-expense',
        title: 'Expense approval chain',
        language: 'java',
        isGood: true,
        code:
          "interface Handler {\n  Handler setNext(Handler next);\n  String handle(long cents);\n}\n\nabstract class BaseHandler implements Handler {\n  private Handler next;\n  public Handler setNext(Handler next) {\n    this.next = next;\n    return next;\n  }\n  protected String forward(long cents) {\n    return next == null ? 'reject' : next.handle(cents);\n  }\n}\n\nfinal class ManagerHandler extends BaseHandler {\n  public String handle(long cents) {\n    if (cents <= 1000_00) return 'manager ok';\n    return forward(cents);\n  }\n}\n\nfinal class DirectorHandler extends BaseHandler {\n  public String handle(long cents) {\n    if (cents <= 10_000_00) return 'director ok';\n    return forward(cents);\n  }\n}\n\nfinal class VpHandler extends BaseHandler {\n  public String handle(long cents) {\n    return 'vp ok';\n  }\n}",
        explanation:
          'Escalation stops at first authority capable or ends at VP.',
      },
      {
        id: 'l5-5-pipe',
        title: 'Validation pipeline',
        language: 'java',
        isGood: true,
        code:
          "interface RequestHandler {\n  void handle(String req);\n}\n\nfinal class AuthHandler implements RequestHandler {\n  private final RequestHandler next;\n  AuthHandler(RequestHandler next) { this.next = next; }\n  public void handle(String req) {\n    if (!req.startsWith('token:')) throw new SecurityException();\n    next.handle(req);\n  }\n}\n\nfinal class BusinessHandler implements RequestHandler {\n  public void handle(String req) {\n    System.out.println('biz ' + req);\n  }\n}",
        explanation:
          'Each layer performs one concern then delegates.',
      },
    ],
    diagrams: [
      {
        id: 'l5-5-d1',
        title: 'Handler chain',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass Handler {\n  <<interface>>\n  +handle(req)\n  +setNext(Handler)\n}\nHandler --> Handler : next',
      },
      {
        id: 'l5-5-d2',
        title: 'Concrete chain',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass AuthHandler\nclass RateLimitHandler\nclass BusinessHandler\nAuthHandler --> RateLimitHandler\nRateLimitHandler --> BusinessHandler',
      },
    ],
    exercises: [
      {
        id: 'l5-5-ex1',
        title: 'Logger chain by level',
        difficulty: 'medium',
        description: 'Console all; file WARN+; email ERROR+.',
        requirements: [
          'LogHandler handle(level, message), setNext.',
          'Chain processes in order; each may filter.',
        ],
        starterCode:
          "enum Level { DEBUG, INFO, WARN, ERROR, FATAL }\ninterface LogHandler {\n  void handle(Level level, String msg);\n}\n// TODO\n",
        testCases: ['FATAL reaches all handlers in chain.', 'DEBUG only console.'],
        hints: [
          'Compare ordinal() for thresholds.',
          'Always forward if policy says continue.',
          'Build chain email → file → console or reverse per spec.',
        ],
        solution:
          "enum Level { DEBUG, INFO, WARN, ERROR, FATAL }\n\ninterface LogHandler {\n  void setNext(LogHandler next);\n  void handle(Level level, String msg);\n}\n\nabstract class AbstractLogHandler implements LogHandler {\n  private LogHandler next;\n  public void setNext(LogHandler next) { this.next = next; }\n  protected void forward(Level level, String msg) {\n    if (next != null) next.handle(level, msg);\n  }\n}\n\nfinal class ConsoleHandler extends AbstractLogHandler {\n  public void handle(Level level, String msg) {\n    System.out.println('console ' + level + ' ' + msg);\n    forward(level, msg);\n  }\n}\n\nfinal class FileHandler extends AbstractLogHandler {\n  public void handle(Level level, String msg) {\n    if (level.ordinal() >= Level.WARN.ordinal()) {\n      System.out.println('file ' + level + ' ' + msg);\n    }\n    forward(level, msg);\n  }\n}",
        solutionExplanation:
          'Chain combines filtering and fan-out; order encodes policy.',
        designPrinciples: ['Chain of Responsibility', 'Single Responsibility Principle'],
        connectedHLDTopic: null,
      },
      {
        id: 'l5-5-ex2',
        title: 'Support ticket escalation chain',
        difficulty: 'medium',
        description: 'L1 handles general; L2 handles billing; L3 handles legal — pass unknown categories.',
        requirements: [
          'SupportHandler with handle(Ticket).',
          'Each handler either resolves or forwards.',
        ],
        starterCode:
          "enum Category { GENERAL, BILLING, LEGAL }\nrecord Ticket(Category c, String body) {}\ninterface SupportHandler {\n  SupportHandler setNext(SupportHandler n);\n  String handle(Ticket t);\n}\n// TODO\n",
        testCases: ['GENERAL resolved at L1.', 'LEGAL reaches L3.', 'Unknown returns escalate message.'],
        hints: [
          'Base class stores next reference.',
          'Return non-null stops chain or use Optional.',
          'Default handler at end of chain.',
        ],
        solution:
          "enum Category { GENERAL, BILLING, LEGAL }\n\nrecord Ticket(Category c, String body) {}\n\nabstract class BaseSupport implements SupportHandler {\n  private SupportHandler next;\n  public SupportHandler setNext(SupportHandler n) {\n    this.next = n;\n    return n;\n  }\n  protected String forward(Ticket t) {\n    return next == null ? 'escalate: no handler' : next.handle(t);\n  }\n}\n\nfinal class L1 extends BaseSupport {\n  public String handle(Ticket t) {\n    if (t.c() == Category.GENERAL) return 'l1 ok';\n    return forward(t);\n  }\n}\n\nfinal class L2 extends BaseSupport {\n  public String handle(Ticket t) {\n    if (t.c() == Category.BILLING) return 'l2 ok';\n    return forward(t);\n  }\n}\n\nfinal class L3 extends BaseSupport {\n  public String handle(Ticket t) {\n    if (t.c() == Category.LEGAL) return 'l3 ok';\n    return forward(t);\n  }\n}",
        solutionExplanation:
          'Chain passes ticket until specialized handler matches.',
        designPrinciples: ['Chain of Responsibility', 'Open/Closed Principle'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l5-5-q1',
        'Chain purpose?',
        ['Sort array', 'Pass request along handlers until handled', 'Hash data', 'Compile'],
        1,
        'Decouple sender from specific handler.',
      ),
      q(
        'l5-5-q2',
        'Order of handlers?',
        [
          'Never matters',
          'Matters — defines semantics',
          'Random',
          'Alphabetical only',
        ],
        1,
        'Pipeline ordering is policy.',
      ),
      q(
        'l5-5-q3',
        'Servlet filters exemplify?',
        ['Singleton', 'Chain of responsibility', 'Prototype', 'Flyweight'],
        1,
        'Request passes filter chain.',
      ),
      q(
        'l5-5-q4',
        'Risk?',
        [
          'None',
          'Unhandled request if no terminal/default handler',
          'Too fast',
          'Cannot add handlers',
        ],
        1,
        'Ensure termination.',
      ),
      q(
        'l5-5-q5',
        'Compared to Strategy?',
        [
          'Same',
          'Chain tries multiple handlers sequentially; strategy picks one algorithm',
          'Strategy is pipeline',
          'Neither uses interfaces',
        ],
        1,
        'Different selection model.',
      ),
      q(
        'l5-5-q6',
        'API Gateway middleware layers resemble Chain of Responsibility because?',
        [
          'They sort databases',
          'Requests pass through sequential handlers/filters',
          'They replace TCP',
          'They compile Java',
        ],
        1,
        'Edge pipelines compose cross-cutting checks.',
      ),
    ],
    interviewTip:
      'Chain of Responsibility models pipelines: middleware, approvals, validation stacks. Emphasize ordering, short-circuit, and default terminal handling.',
    connectedHLDTopics: ['api-gateway-pattern'],
  },
  {
    id: 'template-method',
    title: 'Template Method Pattern',
    readContent: `# Template Method Pattern

## Shared algorithm skeleton

Multiple workflows share the same steps in order—export pipeline (extract, transform, load), game turn loop, test lifecycle (\`setUp\`, \`run\`, \`tearDown\`). Duplicating control flow in subclasses invites drift. Template Method defines a **final** method implementing the skeleton calling abstract/hook methods subclasses override.

## Hooks

Optional steps with default no-op in base class—subclasses override selectively.

## Template Method vs Strategy

Template Method uses **inheritance** to vary steps. Strategy uses **composition** to swap algorithms. Strategy more runtime-flexible; Template Method simpler when skeleton is truly fixed.

## When to use

Stable overall algorithm with varying steps; enforcing ordering invariants.

## Java examples

\`HttpServlet\` service methods, \`AbstractList\` iterator templates, JUnit lifecycle.

> INTERVIEW TIP: "ETL pipeline: \`run()\` is final; subclasses override extract/transform/load only."

## Fragile base class caution

Heavy inheritance hierarchies hurt—use hooks sparingly and document extension points.

## When Template Method wins

Excellent for **frameworks** defining lifecycle contracts—your code plugs into stable skeletons. Less ideal when algorithms vary wildly runtime—Strategy may fit better.

## Hooks vs abstract methods

Too many abstract methods burden subclasses—prefer a few abstract + several hooks with sane defaults to reduce forced overrides.

## Testing

Test base class behavior by creating small test doubles overriding only necessary steps—ensure \`final\` template cannot be accidentally broken by subclasses (sometimes test via reflection rules in teams).

## Relationship to functional pipelines

Modern code may use stream pipelines instead of inheritance—acknowledge alternative compositions while defending Template Method when **ordering enforcement** is paramount.

> ANALOGY: Template Method is like a recipe card with fixed steps but customizable ingredients per step.`,
    codeExamples: [
      {
        id: 'l5-6-report',
        title: 'Template Method: Reports',
        language: 'java',
        isGood: true,
        code:
          "abstract class ReportGenerator {\n  final void generateReport() {\n    String data = gatherData();\n    String processed = processData(data);\n    byte[] out = formatOutput(processed);\n    deliver(out);\n  }\n\n  protected abstract String gatherData();\n  protected String processData(String data) { return data; }\n  protected abstract byte[] formatOutput(String processed);\n  protected void deliver(byte[] out) {\n    System.out.println(out.length);\n  }\n}\n\nfinal class DatabaseReport extends ReportGenerator {\n  protected String gatherData() { return 'db'; }\n  protected byte[] formatOutput(String processed) {\n    return processed.getBytes();\n  }\n}",
        explanation:
          'Skeleton fixed; subclasses specialize steps.',
      },
      {
        id: 'l5-6-game',
        title: 'Template Method: Game turn',
        language: 'java',
        isGood: true,
        code:
          "abstract class GameTurn {\n  final void executeTurn() {\n    rollDice();\n    movePlayer();\n    checkWinCondition();\n  }\n\n  protected abstract void rollDice();\n  protected abstract void movePlayer();\n  protected abstract void checkWinCondition();\n}\n\nfinal class ChessTurn extends GameTurn {\n  protected void rollDice() { }\n  protected void movePlayer() { System.out.println('chess move'); }\n  protected void checkWinCondition() { }\n}",
        explanation:
          'Turn structure enforced; games customize moves.',
      },
    ],
    diagrams: [
      {
        id: 'l5-6-d1',
        title: 'Template method',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass AbstractClass {\n  +templateMethod()\n  #stepOne()* \n  #hook() \n}\nclass ConcreteClass\nAbstractClass <|-- ConcreteClass',
      },
      {
        id: 'l5-6-d2',
        title: 'Subclass overrides steps',
        type: 'class',
        mermaidCode:
          'classDiagram\nclass ReportGenerator {\n  <<abstract>>\n  +generateReport() final\n  #gatherData()* \n  #formatOutput()* \n  #deliver()\n}\nclass DatabaseReport\nReportGenerator <|-- DatabaseReport',
      },
    ],
    exercises: [
      {
        id: 'l5-6-ex1',
        title: 'Data pipeline template',
        difficulty: 'medium',
        description: 'extract, transform, validate, load with hook afterLoad.',
        requirements: ['final run()', 'Concrete pipelines override steps.'],
        starterCode:
          "abstract class DataPipeline {\n  // TODO final run()\n}\n",
        testCases: ['afterLoad hook called.', 'Cannot override run() in subclass attempt—final.'],
        hints: [
          'Mark template method final.',
          'Provide default no-op hook.',
          'Validate throws on bad data in validate step.',
        ],
        solution:
          "abstract class DataPipeline {\n  final void run() {\n    String raw = extract();\n    String t = transform(raw);\n    validate(t);\n    load(t);\n    afterLoad();\n  }\n\n  protected abstract String extract();\n  protected abstract String transform(String raw);\n  protected void validate(String data) {\n    if (data == null || data.isBlank()) throw new IllegalArgumentException();\n  }\n  protected abstract void load(String data);\n  protected void afterLoad() { }\n}\n\nfinal class CsvToDb extends DataPipeline {\n  protected String extract() { return 'a,b'; }\n  protected String transform(String raw) { return raw.toUpperCase(); }\n  protected void load(String data) { }\n}",
        solutionExplanation:
          'Template enforces ordering; subclasses fill in domain specifics.',
        designPrinciples: ['Template Method', 'Open/Closed Principle'],
        connectedHLDTopic: null,
      },
      {
        id: 'l5-6-ex2',
        title: 'Game turn with hook',
        difficulty: 'medium',
        description: 'Abstract game turn with optional onTurnEnd hook default empty.',
        requirements: [
          'final executeTurn() calls start, play, end, then hook onTurnEnd.',
          'ChessTurn overrides play; MonopolyTurn overrides play and onTurnEnd.',
        ],
        starterCode:
          "abstract class AbstractGame {\n  // TODO template method\n}\n",
        testCases: ['Hook runs after every turn.', 'Subclass can override hook.'],
        hints: [
          'Make executeTurn final.',
          'Protected abstract playPhase().',
          'protected void onTurnEnd() { } hook.',
        ],
        solution:
          "abstract class AbstractGame {\n  final void executeTurn() {\n    startTurn();\n    playPhase();\n    endTurn();\n    onTurnEnd();\n  }\n\n  protected void startTurn() { }\n  protected abstract void playPhase();\n  protected void endTurn() { }\n  protected void onTurnEnd() { }\n}\n\nfinal class Chess extends AbstractGame {\n  protected void playPhase() {\n    System.out.println('chess move');\n  }\n}\n\nfinal class Monopoly extends AbstractGame {\n  protected void playPhase() {\n    System.out.println('roll & move');\n  }\n  protected void onTurnEnd() {\n    System.out.println('pass dice');\n  }\n}",
        solutionExplanation:
          'Hook allows optional end-of-turn behavior without forcing all games to implement it.',
        designPrinciples: ['Template Method', 'Hook Methods'],
        connectedHLDTopic: null,
      },
    ],
    quizQuestions: [
      q(
        'l5-6-q1',
        'Template method defines?',
        ['Random order', 'Algorithm skeleton in base class', 'Only interfaces', 'SQL queries'],
        1,
        'Fixed sequence of steps.',
      ),
      q(
        'l5-6-q2',
        'Hook method is?',
        [
          'Always abstract',
          'Optional step with default in base',
          'Not allowed',
          'Only static',
        ],
        1,
        'Override if needed.',
      ),
      q(
        'l5-6-q3',
        'final on template method prevents?',
        [
          'Compilation',
          'Subclasses changing step order',
          'Using hooks',
          'Creating objects',
        ],
        1,
        'Preserves algorithm structure.',
      ),
      q(
        'l5-6-q4',
        'Template Method vs Strategy?',
        [
          'Same',
          'Inheritance for steps vs composition for algorithm object',
          'Strategy uses inheritance only',
          'Neither uses polymorphism',
        ],
        1,
        'Flexibility tradeoff.',
      ),
      q(
        'l5-6-q5',
        'JUnit lifecycle resembles?',
        ['Singleton', 'Template Method', 'Prototype', 'Bridge'],
        1,
        'setup/test/teardown hooks.',
      ),
      q(
        'l5-6-q6',
        'Why mark template method as final?',
        [
          'Faster bytecode',
          'Prevent subclasses from altering the skeleton ordering',
          'Required by JVM',
          'To enable multiple inheritance',
        ],
        1,
        'Protects the invariant algorithm structure.',
      ),
    ],
    interviewTip:
      'Template Method fits fixed multi-step processes: ETL, reports, game loops. Keep the template final; vary steps via protected methods and hooks. Contrast with Strategy when interviewers ask for composition-based flexibility.',
    connectedHLDTopics: [],
  },
];
