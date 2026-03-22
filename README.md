# NodeBreaker ⚡

A browser-based system design simulator with real-time traffic simulation and chaos injection. Design distributed architectures, simulate traffic flow, and break things to find bottlenecks.

[screenshot/gif placeholder]

## Features

- **Visual System Design** — Drag-and-drop infrastructure components (Load Balancer, Service, Database, Cache, Queue, CDN)
- **Real-Time Simulation** — Watch traffic flow through your architecture with animated visualizations
- **Bottleneck Detection** — Nodes change color based on utilization (green → yellow → red)
- **Chaos Engineering** — Inject failures mid-simulation: node crashes, latency spikes, packet loss, cascading failures
- **Live Metrics Dashboard** — Per-node throughput, latency, queue depth, and drop rates
- **Preset Templates** — Start with common architectures: URL Shortener, Chat App, E-Commerce, Microservices
- **Export/Import** — Save and share your designs as JSON
- **Keyboard Shortcuts** — Space to play/pause, speed controls, and more

## Tech Stack

React • TypeScript • Vite • React Flow • Zustand • Tailwind CSS • Framer Motion

## Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/nodebreaker.git
cd nodebreaker
npm install
npm run dev
```

## How It Works

1. Drag components from the sidebar onto the canvas
2. Connect them by dragging between handles
3. Configure throughput, latency, and capacity per node
4. Hit "Start Simulation" and watch traffic flow
5. Inject chaos events to stress-test your design
6. Use the metrics dashboard to identify bottlenecks

## Architecture Decisions

- **React Flow** for the interactive node-based canvas
- **Zustand** for lightweight state management across simulation, flow, and chaos stores
- **Tick-based simulation engine** — pure TypeScript, no backend needed
- **CSS animations** for traffic flow visualization
- Fully client-side — no server, no database, deploys as a static site

## License

MIT
