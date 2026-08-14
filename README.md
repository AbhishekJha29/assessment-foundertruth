# FounderTruth — Content Feed & Intelligence Platform

A full-stack content intelligence and founder feed platform built with a decoupled Node.js/Express REST API backend and a Next.js 14 frontend. The application features curated article discovery, JWT authentication, gated reading flows, robust duplicate prevention, and user-scoped bookmark management.

---

## 1. Project Overview

FounderTruth is a full-stack content feed application designed to deliver curated technical playbooks, architectural breakdowns, and startup intelligence. It provides a publicly browsable feed of articles with pagination, source filtering, and text search, while gating individual article reading and user-specific bookmarks behind stateless JWT authentication. The system is built with layered service architecture on the backend and a responsive, dark-themed UI on the frontend.

---

## 2. Tech Stack

### Backend
- **Runtime & Framework**: Node.js, Express.js (v5)
- **Database & ODM**: MongoDB Atlas, Mongoose (v9)
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (salt rounds: 12), `helmet`, `cors`
- **Logging & Dev Tooling**: `morgan`, `nodemon`, `dotenv`

### Frontend
- **Framework**: Next.js 14 (App Router, React 18)
- **Styling**: Vanilla CSS (Custom tokens, responsive grid, dark mode aesthetic)
- **Client Architecture**: Modular API client wrapper, custom event bus for cross-component auth synchronization (`ft_auth_changed`), Suspense-wrapped client boundaries

---

## 3. Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (v9.x or later)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string or local MongoDB instance

---

### Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd assessment-foundertruth

# Install backend dependencies
npm install

# Install frontend dependencies
npm run frontend:install
# or: cd frontend && npm install && cd ..
```

---

### Step 2: Configure Environment Variables

Create `.env` at the root of the project and `.env.local` inside the `frontend` directory using the provided templates:

```bash
# Copy root environment template
cp .env.example .env

# Copy frontend environment template
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env` to include your MongoDB connection string and a secret for JWT signing:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/foundertruth?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

---

### Step 3: Run the Database Seed Script

Populate the MongoDB collection with sample founder articles, timestamps, sources, and categories:

```bash
npm run seed
```

*Expected output:*
```
[Seed] Connecting to MongoDB...
[Seed] Clearing existing Content collection...
[Seed] Inserting 16 sample articles...
[Seed] Success! Successfully inserted 16 Content documents.
[Seed] Database connection closed cleanly.
```

---

### Step 4: Start the Application

Open two terminal windows (or run concurrent scripts):

#### Terminal 1 — Start Backend Server (Port 5000)
```bash
npm run dev
```

#### Terminal 2 — Start Frontend Application (Port 3000)
```bash
npm run frontend:dev
# or: cd frontend && npm run dev
```

---

### Default URLs & Ports

| Service | URL | Notes |
|---|---|---|
| **Frontend Web App** | `http://localhost:3000` | Landing & Intelligence Feed |
| **Backend REST API** | `http://localhost:5000/api/v1` | API Base Route |
| **Backend Health Check** | `http://localhost:5000/api/v1/health` | Service Liveness Check |

---

## 4. Environment Variables

| Variable | Scope | Description | Example / Default |
|---|---|---|---|
| `PORT` | Backend | HTTP listener port for Express server | `5000` |
| `NODE_ENV` | Backend | Runtime environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | Backend | MongoDB Atlas / local MongoDB connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Backend | Symmetric secret key used to sign and verify JWT tokens | `super_secret_jwt_key_2026` |
| `JWT_EXPIRES_IN` | Backend | Validity duration for generated JSON Web Tokens | `7d` |
| `CORS_ORIGIN` | Backend | Whitelisted origin URL for Cross-Origin requests | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | Target API endpoint for browser fetch requests | `http://localhost:5000/api/v1` |

---

## 5. API Documentation

All API responses follow a standardized JSON schema:
- **Success**: `{ success: true, message?: string, data?: any, pagination?: object }`
- **Error**: `{ success: false, message: string }`

---

### Health Check

#### `GET /api/v1/health`
- **Auth Required**: No
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-08-14T12:00:00.000Z"
}
```

---

### Authentication Endpoints

#### `POST /api/v1/auth/register`
- **Auth Required**: No
- **Request Body**:
```json
{
  "username": "alex_founder",
  "email": "alex@example.com",
  "password": "Password123"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "66bc00112233445566778899",
      "username": "alex_founder",
      "email": "alex@example.com",
      "createdAt": "2026-08-14T12:00:00.000Z",
      "updatedAt": "2026-08-14T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (e.g. invalid email format, password under 6 characters).
  - `409 Conflict`: An account with this email already exists.

---

#### `POST /api/v1/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "Password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "66bc00112233445566778899",
      "username": "alex_founder",
      "email": "alex@example.com",
      "createdAt": "2026-08-14T12:00:00.000Z",
      "updatedAt": "2026-08-14T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid email or password.

---

### Feed Endpoints

#### `GET /api/v1/feed`
- **Auth Required**: No
- **Query Parameters**:
  - `page` *(optional, default: 1)*: Page number (min: 1)
  - `limit` *(optional, default: 20, max: 100)*: Items per page
  - `sort` *(optional, default: 'latest')*: `'latest'` (newest first) or `'oldest'`
  - `source` *(optional)*: Filter by publisher name (e.g. `TechCrunch`, `Dev.to`, `Wired`)
  - `search` *(optional)*: Full-text search across article titles and descriptions
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "66bc01001122334455667788",
      "title": "OpenAI Unveils Next-Gen Reasoning Models with Enhanced Multimodal Capabilities",
      "description": "A deep dive into the latest architectural breakthroughs...",
      "source": "TechCrunch",
      "url": "https://techcrunch.com/2026/08/10/openai-next-gen-reasoning-models",
      "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      "publishedAt": "2026-08-14T10:00:00.000Z",
      "createdAt": "2026-08-14T10:00:00.000Z",
      "updatedAt": "2026-08-14T10:00:00.000Z"
    }
  ],
  "pagination": {
    "totalItems": 16,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 9,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
- **Error Responses**:
  - `500 Internal Server Error`: Unexpected database query error.

---

#### `GET /api/v1/feed/:id`
- **Auth Required**: No (API level)
- **Path Parameters**: `:id` (MongoDB ObjectId)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "66bc01001122334455667788",
    "title": "The Rise of Local-First Web Applications: Architecture and Patterns",
    "description": "Why modern engineering teams are shifting away from pure cloud architectures...",
    "source": "Dev.to",
    "url": "https://dev.to/engineering/local-first-web-architecture-2026",
    "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    "publishedAt": "2026-08-14T07:00:00.000Z",
    "createdAt": "2026-08-14T07:00:00.000Z",
    "updatedAt": "2026-08-14T07:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid MongoDB ObjectId format.
  - `404 Not Found`: Content item with the specified ID does not exist.

---

### Bookmarks Endpoints

All bookmark endpoints require an `Authorization: Bearer <token>` header.

#### `GET /api/v1/bookmarks`
- **Auth Required**: Yes
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "66bc033344556677889900aa",
      "userId": "66bc00112233445566778899",
      "contentId": "66bc01001122334455667788",
      "content": {
        "id": "66bc01001122334455667788",
        "title": "The Rise of Local-First Web Applications: Architecture and Patterns",
        "description": "Why modern engineering teams are shifting away...",
        "source": "Dev.to",
        "url": "https://dev.to/engineering/local-first-web-architecture-2026",
        "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
        "publishedAt": "2026-08-14T07:00:00.000Z",
        "createdAt": "2026-08-14T07:00:00.000Z",
        "updatedAt": "2026-08-14T07:00:00.000Z"
      },
      "createdAt": "2026-08-14T12:30:00.000Z",
      "updatedAt": "2026-08-14T12:30:00.000Z"
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing, invalid, or expired JWT token.

---

#### `POST /api/v1/feed/:id/bookmark`
- **Auth Required**: Yes
- **Path Parameters**: `:id` (Content ObjectId to bookmark)
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Bookmark added successfully",
  "data": {
    "id": "66bc033344556677889900aa",
    "userId": "66bc00112233445566778899",
    "contentId": "66bc01001122334455667788",
    "createdAt": "2026-08-14T12:30:00.000Z",
    "updatedAt": "2026-08-14T12:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Malformed content ID.
  - `401 Unauthorized`: Unauthenticated request.
  - `404 Not Found`: Target content item does not exist.
  - `409 Conflict`: User has already bookmarked this content.

---

#### `DELETE /api/v1/feed/:id/bookmark`
- **Auth Required**: Yes
- **Path Parameters**: `:id` (Content ObjectId to unbookmark)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bookmark removed successfully"
}
```
- **Error Responses**:
  - `400 Bad Request`: Malformed content ID.
  - `401 Unauthorized`: Unauthenticated request.
  - `404 Not Found`: Bookmark does not exist for this authenticated user and content.

---

## 6. Database Design

```
+------------------+         +--------------------------+         +-------------------+
|      User        |         |         Bookmark         |         |      Content      |
+------------------+         +--------------------------+         +-------------------+
| _id (ObjectId)   |<---+    | _id (ObjectId)           |    +--->| _id (ObjectId)    |
| username (String)|    +----| userId (Ref: User)       |    |    | title (String)    |
| email (String)   |         | contentId (Ref: Content) |----+    | description (Str) |
| password (String)|         | createdAt (Date)         |         | source (String)   |
| createdAt (Date) |         | updatedAt (Date)         |         | url (String)      |
| updatedAt (Date) |         +--------------------------+         | image (String)    |
+------------------+                                              | publishedAt (Date)|
                                                                  | createdAt (Date)  |
                                                                  | updatedAt (Date)  |
                                                                  +-------------------+
```

### Collections & Schema Specifications

1. **`User` Collection**:
   - `username`: String (3–30 characters, trimmed).
   - `email`: String (RFC 5322 regex validation, lowercase, trimmed, unique).
   - `password`: String (bcrypt hashed, `select: false` so hashes are never leaked in queries by default).
   - `timestamps`: Automatically manages `createdAt` and `updatedAt`.

2. **`Content` Collection**:
   - `title`: String (required, trimmed).
   - `description`: String (trimmed).
   - `source`: String (publication/source identifier).
   - `url`: String (canonical article URL, unique).
   - `image`: String (remote image thumbnail URL).
   - `publishedAt`: Date (publication timestamp, defaults to `Date.now`).
   - `timestamps`: Manages `createdAt` and `updatedAt`.

3. **`Bookmark` Collection**:
   - `userId`: ObjectId reference targeting `User` (required).
   - `contentId`: ObjectId reference targeting `Content` (required).
   - `timestamps`: Manages `createdAt` and `updatedAt`.

---

### Indexing Rationale

- **`Bookmark: { userId: 1, contentId: 1 } (Unique)`**:
  Enforces a compound unique constraint at the database layer. This guarantees that concurrent duplicate requests cannot insert duplicate bookmarks, eliminating race conditions. Attempted duplicates trigger a native MongoDB `E11000` error, caught by the centralized error handler to return a 409 Conflict.
- **`Bookmark: { userId: 1, createdAt: -1 }`**:
  Optimizes querying a specific user's saved bookmarks sorted chronologically in reverse order.
- **`User: { email: 1 } (Unique)`**:
  Provides $O(1)$ lookup performance during authentication and enforces single-account email constraints.
- **`Content: { publishedAt: -1 }` & `{ source: 1, publishedAt: -1 }`**:
  Enables index-covered sorting for the public feed, preventing in-memory sort overflows on large datasets.
- **`Content: { title: "text", description: "text" }`**:
  Enables full-text keyword indexing across titles and descriptions for search queries.

---

## 7. Technical Decisions

### 1. Stateless JWT Authentication vs. Server-Side Sessions
- **Decision**: Implemented stateless JSON Web Tokens signed with HMAC-SHA256 and transmitted in the `Authorization: Bearer <token>` header.
- **Rationale**: A stateless architecture eliminates the need for shared session store clustering (such as Redis) across backend instances, minimizing infrastructure complexity and enabling easy horizontal scaling.
- **Trade-off**: Revocation before expiration requires a token blocklist. This was balanced by using a 7-day token expiration window and clearing client-side tokens upon logout or 401 response detection.

### 2. Compound Unique Index for Duplicate Bookmark Prevention
- **Decision**: Enforced uniqueness using a MongoDB compound index `{ userId: 1, contentId: 1 }` with `{ unique: true }`, backed by a preemptive existence check in `bookmarkService.js`.
- **Rationale**: Application-level checks (`findOne` prior to `create`) are vulnerable to race conditions under rapid concurrent clicks or network retries. The database constraint guarantees data integrity at the storage layer regardless of concurrency.
- **Trade-off**: Requires central error handling middleware to gracefully intercept and translate driver-level `E11000` duplicate key errors into HTTP 409 responses.

### 3. Curated Database Seeding (Option A) vs. Live External Ingestion
- **Decision**: Implemented a standalone seed script (`npm run seed`) with structured, realistic tech news and founder intelligence.
- **Rationale**: Standalone seeding guarantees deterministic data, predictable test runs, and zero external dependency flakiness (e.g. rate limits, third-party API downtime, or paid API keys) during evaluation.
- **Trade-off**: Content is static until the seed script is re-run or an automated background worker is attached.

### 4. Client-Side Article Reading Gating with Post-Login Redirects
- **Decision**: Allowed open public access to the feed listing, while gating specific article detail views (`/feed/[id]`) and bookmark actions behind authentication. If an unauthenticated user attempts to read an article, they are routed to `/login?redirect=/feed/:id` and redirected back post-login.
- **Rationale**: Keeps the platform discoverable and indexable while encouraging signups to access deep insights, matching common content intelligence platforms.
- **Trade-off**: Requires route-aware authentication checks in both the feed card click handlers and the article detail page component.

---

## 8. Project Structure

```
assessment-foundertruth/
├── .env.example                     # Environment variable template for backend
├── .gitignore                       # Git ignore configuration
├── package.json                     # Root npm scripts & backend dependencies
├── README.md                        # Complete project documentation
├── src/                             # Backend source code
│   ├── app.js                       # Express app configuration & middleware setup
│   ├── server.js                    # Database connection & HTTP server bootstrap
│   ├── config/
│   │   └── db.js                    # Mongoose connection logic
│   ├── controllers/
│   │   ├── authController.js        # Auth route controllers (register, login)
│   │   ├── bookmarkController.js    # Bookmark CRUD controllers
│   │   └── feedController.js        # Feed list & detail controllers
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification & req.user attachment
│   │   ├── errorHandler.js          # Centralized error handler & Mongoose formatter
│   │   └── validationMiddleware.js  # Request payload & ObjectId validators
│   ├── models/
│   │   ├── Bookmark.js              # Bookmark schema with compound unique index
│   │   ├── Content.js               # Content schema with text & sorting indexes
│   │   └── User.js                  # User schema with bcrypt hashing & validation
│   ├── routes/
│   │   ├── authRoutes.js            # /api/v1/auth routes
│   │   ├── bookmarkRoutes.js        # /api/v1/bookmarks & /feed/:id/bookmark routes
│   │   └── feedRoutes.js            # /api/v1/feed routes
│   ├── services/
│   │   ├── authService.js           # Registration, credential check, JWT signing
│   │   ├── bookmarkService.js       # Bookmark creation, deletion, population logic
│   │   └── feedService.js           # Feed query builder, pagination & search
│   └── utils/
│       ├── AppError.js              # Operational error class
│       ├── catchAsync.js            # Async error boundary wrapper
│       ├── generateToken.js         # JWT signing helper
│       ├── hashPassword.js          # bcrypt comparison and hashing helpers
│       └── seed.js                  # Database seed script for mock content
└── frontend/                        # Frontend Next.js application
    ├── .env.local.example           # Frontend environment variable template
    ├── next.config.js               # Next.js configuration
    ├── package.json                 # Frontend dependencies & Next scripts
    ├── app/
    │   ├── globals.css              # Global design system & theme tokens
    │   ├── layout.js                # Root layout with shared Navbar
    │   ├── page.js                  # Root redirect to /feed
    │   ├── bookmarks/
    │   │   └── page.js              # Saved bookmarks view
    │   ├── feed/
    │   │   ├── page.js              # Publicly accessible intelligence feed
    │   │   └── [id]/
    │   │       └── page.js          # Gated article detail & reader view
    │   ├── login/
    │   │   └── page.js              # Sign-in form with redirect parameter handling
    │   └── register/
    │       └── page.js              # Registration form with redirect support
    ├── components/
    │   └── Navbar.js                # Global navigation bar with live auth state sync
    └── lib/
        └── api.js                   # Client fetch wrapper, token & storage utils
```

---

## 9. How Authentication & Authorization Work

### Authentication Flow
1. **User Sign Up / Sign In**:
   The user sends credentials (`POST /api/v1/auth/register` or `POST /api/v1/auth/login`). Passwords are encrypted using `bcryptjs` with 12 salt rounds.
2. **Token Generation**:
   Upon verification, the server generates a signed JSON Web Token containing the user's MongoDB `_id` payload (`{ userId: user._id }`) with a 7-day expiration.
3. **Client Storage & Dispatch**:
   The frontend receives the token and stores it in `localStorage` under `ft_token`. A custom DOM event (`ft_auth_changed`) is fired to synchronize Navbar and UI state instantly across components.

### Authorization & User Scoping
1. **Route Protection**:
   Protected endpoints mount `protect` middleware ([`src/middleware/authMiddleware.js`](file:///C:/Users/ADMIN/projects/assessment-foundertruth/src/middleware/authMiddleware.js)). It extracts the token from `Authorization: Bearer <token>`, verifies its signature with `JWT_SECRET`, checks that the user still exists in MongoDB, and attaches the sanitized user document to `req.user`.
2. **User-Scoped Queries**:
   All bookmark operations in [`src/services/bookmarkService.js`](file:///C:/Users/ADMIN/projects/assessment-foundertruth/src/services/bookmarkService.js) strictly filter and delete using `req.user.id`:
   - Fetch: `Bookmark.find({ userId: req.user.id })`
   - Delete: `Bookmark.findOneAndDelete({ userId: req.user.id, contentId: req.params.id })`
   Because queries explicitly inject `req.user.id` from the verified token, **no user can ever read, modify, or delete another user's bookmarks**.

---

## 10. Possible Improvements at Scale

1. **Feed Caching with Redis**:
   Cache responses for the first few pages of `/api/v1/feed` in Redis with a short TTL (e.g. 60 seconds). Invalidate or update the cache when new articles are ingested to drastically reduce MongoDB read load.
2. **Cursor-Based (Keyset) Pagination**:
   Transition from offset-based pagination (`skip` + `limit`) to cursor-based pagination using `{ _id, publishedAt }` for multi-million row datasets to prevent MongoDB scanning overhead on high page numbers.
3. **Token Storage in HttpOnly Secure Cookies**:
   Migrate JWT storage from `localStorage` to `httpOnly`, `SameSite=Strict`, `Secure` cookies with a paired refresh-token rotation strategy to eliminate XSS token extraction vectors.
4. **Automated Asynchronous Content Ingestion**:
   Implement a background message queue (e.g. BullMQ / Redis worker) to regularly fetch, deduplicate, and parse RSS feeds or newsletter APIs without blocking the main Express event loop.
5. **Rate Limiting & DDOS Protection**:
   Add `express-rate-limit` backed by Redis on `/api/v1/auth/login` and `/api/v1/auth/register` to mitigate brute-force credential stuffing.

---

## 11. AI/Tool Usage Note

Gemini CLI was utilized as an interactive AI coding assistant during this build to scaffold project components, verify error handling boundaries, and implement features across Phases 1 through 8. Each phase of development (models, validations, routes, services, middleware, frontend design, and documentation) was reviewed, verified, and tested prior to moving forward.
