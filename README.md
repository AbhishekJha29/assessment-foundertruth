# FounderTruth — Full-Stack Founder Intelligence & Content Feed

FounderTruth is a full-stack founder intelligence platform built as a **unified Next.js 14 application** (App Router, Serverless Route Handlers, React 18, and MongoDB Atlas). It features curated article discovery, JWT authentication, gated reading flows, robust duplicate prevention, and user-scoped bookmark management.

---

## 1. Architecture & Tech Stack

- **Unified Framework**: Next.js 14 (App Router & Serverless Route Handlers)
- **Frontend UI**: React 18, Vanilla CSS (Dark Mode Design System, responsive grid)
- **Database & ODM**: MongoDB Atlas, Mongoose (v9) with cached connection pooling
- **Authentication**: Stateless JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (password hashing)
- **API Architecture**: Clean service layer pattern (`services/`), input validation (`lib/validation.js`), centralized error handling (`lib/errorHandler.js`)

```text
assessment-foundertruth/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── health/route.js              # GET /api/v1/health
│   │       ├── auth/
│   │       │   ├── register/route.js        # POST /api/v1/auth/register
│   │       │   └── login/route.js           # POST /api/v1/auth/login
│   │       ├── feed/
│   │       │   ├── route.js                 # GET /api/v1/feed (query params)
│   │       │   └── [id]/
│   │       │       ├── route.js             # GET /api/v1/feed/:id
│   │       │       └── bookmark/route.js    # POST, DELETE /api/v1/feed/:id/bookmark
│   │       └── bookmarks/
│   │           └── route.js                 # GET /api/v1/bookmarks
│   ├── feed/
│   │   ├── page.js                          # Publicly browsable feed UI
│   │   └── [id]/page.js                     # Gated article detail view UI
│   ├── bookmarks/page.js                    # Authenticated bookmarks UI
│   ├── login/page.js                        # User sign in UI
│   ├── register/page.js                     # User registration UI
│   ├── layout.js                            # Root layout with responsive Navbar
│   ├── page.js                              # Root redirect to /feed
│   └── globals.css                          # Global dark mode theme & styles
├── components/
│   └── Navbar.js                            # Dynamic Navbar with auth state sync
├── lib/
│   ├── api.js                               # Frontend API fetch client wrapper
│   ├── auth.js                              # JWT verification and token generation
│   ├── db.js                                # Cached Mongoose connection helper
│   ├── errorHandler.js                      # Centralized API error response handler
│   ├── validation.js                        # Request and query parameter validation
│   └── AppError.js                          # Custom operational error class
├── models/
│   ├── User.js                              # User schema (email unique, password select: false)
│   ├── Content.js                           # Content schema (text search & sort indexes)
│   └── Bookmark.js                          # Bookmark schema (compound unique index)
├── services/
│   ├── authService.js                       # Register and login business logic
│   ├── feedService.js                       # Feed pagination & query logic
│   └── bookmarkService.js                   # Scoped user bookmark CRUD logic
├── scripts/
│   └── seed.js                              # Standalone database seed script
├── .env.local                               # Environment configuration
├── .env.local.example                       # Environment template
├── next.config.js                           # Next.js configuration
├── package.json                             # Unified dependencies & scripts
└── deploy.md                                # Complete Vercel deployment guide
```

---

## 2. Quickstart & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI (or local MongoDB)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/foundertruth?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### Step 3: Seed Database
Populate MongoDB with 16 sample founder articles:
```bash
npm run seed
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. API Reference (`/api/v1`)

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/health` | No | Service health check |
| `POST` | `/api/v1/auth/register` | No | Register new user account |
| `POST` | `/api/v1/auth/login` | No | Authenticate user & return JWT |
| `GET` | `/api/v1/feed` | No | List articles (`page`, `limit`, `sort`, `source`, `search`) |
| `GET` | `/api/v1/feed/:id` | No | Get single article details |
| `POST` | `/api/v1/feed/:id/bookmark` | **Yes** | Bookmark an article (duplicate returns 409) |
| `DELETE`| `/api/v1/feed/:id/bookmark` | **Yes** | Remove bookmark for authenticated user |
| `GET` | `/api/v1/bookmarks` | **Yes** | List all bookmarks for authenticated user |

---

## 4. Standard Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
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

### Error Response
```json
{
  "success": false,
  "message": "Explanation of the error"
}
```

---

## 5. Deployment

See [`deploy.md`](file:///C:/Users/ADMIN/projects/assessment-foundertruth/deploy.md) for step-by-step instructions on deploying this unified Next.js application to Vercel with MongoDB Atlas.
