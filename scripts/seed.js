const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectDB = require('../lib/db');
const Content = require('../models/Content');

// Helper to stagger publication dates in the past for realistic pagination & sorting testing
const daysAgo = (days, hours = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date;
};

const sampleContent = [
  {
    title: 'OpenAI Unveils Next-Gen Reasoning Models with Enhanced Multimodal Capabilities',
    description: 'A deep dive into the latest architectural breakthroughs in frontier reasoning models and their real-world benchmarks.',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2026/08/10/openai-next-gen-reasoning-models',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(0, 2)
  },
  {
    title: 'The Rise of Local-First Web Applications: Architecture and Patterns',
    description: 'Why modern engineering teams are shifting away from pure cloud architectures to offline-ready, distributed client state.',
    source: 'Dev.to',
    url: 'https://dev.to/engineering/local-first-web-architecture-2026',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(0, 5)
  },
  {
    title: 'TypeScript 5.8 Released: Key Highlights and Performance Improvements',
    description: 'Exploring granular module resolution, optimized type-checking caches, and cleaner return type inference.',
    source: 'Hacker News',
    url: 'https://news.ycombinator.com/item?id=41002931',
    image: 'https://images.unsplash.com/photo-1516116211227-bbc13c32906b?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(1, 3)
  },
  {
    title: 'Inside the Next Decade of Semiconductor Packaging and High-Bandwidth Memory',
    description: 'How 3D chip stacking and optical interconnects are addressing the memory wall in distributed AI clusters.',
    source: 'Ars Technica',
    url: 'https://arstechnica.com/gadgets/2026/08/semiconductor-packaging-hbm4',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(2, 6)
  },
  {
    title: 'Designing Ultra-Low Latency APIs: Lessons from High-Frequency Systems',
    description: 'Benchmarking protocol buffers vs. JSON, zero-copy serialization, and kernel bypass techniques in Node.js and Go.',
    source: 'Hacker News',
    url: 'https://news.ycombinator.com/item?id=41014820',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(3, 1)
  },
  {
    title: 'European Union Finalizes New Standards for Algorithmic Transparency',
    description: 'New compliance requirements take effect for AI safety assessments, training data disclosures, and auditability.',
    source: 'Wired',
    url: 'https://www.wired.com/story/eu-algorithmic-transparency-guidelines-2026',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(4, 8)
  },
  {
    title: 'Mastering MongoDB Indexing Strategies for High-Throughput Feeds',
    description: 'Compound indexes, partial indexes, and cursor-based pagination best practices for millions of documents.',
    source: 'Dev.to',
    url: 'https://dev.to/mongodb/indexing-strategies-high-throughput-feeds',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(5, 4)
  },
  {
    title: 'Quantum Computing Startups Reach New Coherence Time Milestones',
    description: 'Neutral-atom quantum processors demonstrate two-qubit gate fidelities exceeding 99.8% in laboratory trials.',
    source: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/2026/08/quantum-coherence-milestones',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(6, 12)
  },
  {
    title: 'Building Resilient Distributed Systems with Event-Driven Architecture',
    description: 'A pragmatic look at event sourcing, CQRS trade-offs, and idempotency guarantees across microservices.',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2026/08/04/event-driven-architecture-resilience',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(8, 2)
  },
  {
    title: 'The Evolution of CSS: Container Queries, Subgrid, and Native Scoping',
    description: 'How modern CSS features are reducing the need for heavy UI utility abstraction layers.',
    source: 'The Verge',
    url: 'https://www.theverge.com/2026/8/2/modern-css-evolution-subgrid',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(10, 5)
  },
  {
    title: 'Security Posture: Protecting JWT Implementations from Token Leakage and CSRF',
    description: 'Why rotating refresh tokens in HttpOnly secure cookies remains the gold standard for web session management.',
    source: 'Dev.to',
    url: 'https://dev.to/security/protecting-jwt-auth-in-modern-apps',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(12, 7)
  },
  {
    title: 'Autonomous Mobile Robots Enter Warehousing at Unprecedented Scale',
    description: 'Supply chain automation sees triple-digit adoption as vision-language navigation algorithms mature.',
    source: 'Wired',
    url: 'https://www.wired.com/story/autonomous-warehouse-robotics-scale',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(14, 3)
  },
  {
    title: 'Node.js 24 and the Built-in Test Runner: Migration Case Study',
    description: 'Eliminating external test dependencies by adopting the native node:test runner and code coverage tooling.',
    source: 'Hacker News',
    url: 'https://news.ycombinator.com/item?id=40958102',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(16, 9)
  },
  {
    title: 'Clean Architecture in JavaScript: Decoupling Controllers from Business Logic',
    description: 'How to structure Node.js applications that remain maintainable as business requirements scale.',
    source: 'Dev.to',
    url: 'https://dev.to/clean-architecture-in-javascript-node',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(18, 4)
  },
  {
    title: 'Next-Generation Browser Engines: WebAssembly Garbage Collection in Action',
    description: 'How WasmGC unlocks first-class performance for languages like Dart, Kotlin, and Rust in client-side applications.',
    source: 'Ars Technica',
    url: 'https://arstechnica.com/gadgets/2026/07/webassembly-gc-adoption',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(21, 10)
  },
  {
    title: 'The State of Open Source Databases in 2026',
    description: 'A comparative benchmark of relational, document, and vector databases under high-concurrency write workloads.',
    source: 'TechCrunch',
    url: 'https://techcrunch.com/2026/07/open-source-databases-state-of-the-art',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
    publishedAt: daysAgo(25, 6)
  }
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing Content collection...');
    await Content.deleteMany({});

    console.log(`[Seed] Inserting ${sampleContent.length} sample articles...`);
    const insertedDocs = await Content.insertMany(sampleContent);

    console.log(`[Seed] Success! Successfully inserted ${insertedDocs.length} Content documents.`);

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Seeding failed: ${error.message}`);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

seedDatabase();
