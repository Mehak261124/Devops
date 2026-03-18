# 🛍️ ShopSmart — Premium E-Commerce Platform

A full-stack e-commerce application built with **React**, **Express.js**, **Prisma ORM**, and **SQLite**, showcasing modern DevOps practices including CI/CD pipelines, automated testing, linting, and deployment automation.

---

## 🏗️ Architecture

```
ShopSmart/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── NavBar.jsx           # Sticky glassmorphism navbar
│   │   │   ├── HeroSection.jsx      # Animated hero with CTA
│   │   │   ├── ProductList.jsx      # Product grid with search & filter
│   │   │   ├── ProductCard.jsx      # Glass card with hover effects
│   │   │   ├── CategoryFilter.jsx   # Pill-style category tabs
│   │   │   ├── SearchBar.jsx        # Icon search with glass input
│   │   │   ├── CartDrawer.jsx       # Slide-in shopping cart
│   │   │   ├── ProductModal.jsx     # Product detail overlay
│   │   │   ├── Toast.jsx            # Notification system
│   │   │   └── Footer.jsx           # Multi-column footer
│   │   ├── App.jsx         # Root component with state management
│   │   ├── utils.js        # Utility functions
│   │   └── index.css       # Design system (800+ lines)
│   ├── e2e/                # Playwright E2E tests
│   └── playwright.config.js
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── app.js          # Express app with full CRUD API
│   │   └── index.js        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema (SQLite)
│   │   └── seed.js         # Database seeding (10 products)
│   └── tests/
│       └── app.test.js     # Jest + Supertest integration tests
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                          # Main CI pipeline
│   │   ├── unit-integration.yaml           # Unit & integration tests
│   │   ├── server-matrix-test.yaml         # Matrix testing (Node 18/20/22)
│   │   ├── deploy-ec2.yaml                 # AWS EC2 deployment
│   │   ├── deploy-pages.yml                # GitHub Pages deployment
│   │   ├── variables-secrets-artifacts.yaml # Variables & artifacts demo
│   │   └── recap.yaml                      # Hello world demo
│   └── dependabot.yml      # Automated dependency updates
├── dev-setup.sh            # Idempotent development setup
├── deploy.sh               # Idempotent EC2 deployment
├── .prettierrc             # Code formatting config
└── .pre-commit-config.yaml # Pre-commit hooks
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 18, Vite 5, Vanilla CSS            |
| Backend    | Express.js 4, Node.js 20                 |
| Database   | SQLite 3 via Prisma ORM                  |
| Testing    | Vitest, Jest, Supertest, Playwright       |
| CI/CD      | GitHub Actions (7 workflows)             |
| Linting    | ESLint (client + server), Prettier        |
| Deployment | Render, Vercel, AWS EC2, GitHub Pages     |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Quick Setup (Idempotent)
```bash
chmod +x dev-setup.sh
./dev-setup.sh
```

### Manual Setup
```bash
# Server
cd server
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev          # Starts on http://localhost:5001

# Client (in new terminal)
cd client
npm install
npm run dev          # Starts on http://localhost:5173
```

---

## ✅ Testing

### Unit Tests (Client — Vitest)
```bash
cd client && npx vitest --run
```
Tests: `App.test.jsx`, `utils.test.js`, `ProductCard.test.jsx`, `ProductList.test.jsx`, `SearchBar.test.jsx`

### Integration Tests (Server — Jest + Supertest)
```bash
cd server && npm test
```
Tests all CRUD operations: GET, POST, PUT, DELETE products + health check + validation

### E2E Tests (Playwright)
```bash
cd client && npx playwright test
```
Tests: Homepage rendering, product listing, search, cart, toast notifications, product modal

---

## 🔄 CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR to main | Install → Lint → Test → Build (client & server) |
| `unit-integration.yaml` | push/PR | Full-stack unit & integration tests |
| `server-matrix-test.yaml` | push/PR | Server tests across Node 18/20/22 |
| `deploy-ec2.yaml` | push to main | SSH deploy to AWS EC2 via PM2 |
| `deploy-pages.yml` | push to main | Client → GitHub Pages |
| `variables-secrets-artifacts.yaml` | push/manual | Demonstrates env vars, secrets, artifacts |
| `recap.yaml` | manual | Hello world workflow dispatch demo |

---

## 🎨 Design Decisions

### Frontend
- **Premium Dark Theme**: Deep navy background with purple/pink gradient accents using HSL-tuned colors
- **Glassmorphism**: Frosted glass effect via `backdrop-filter: blur()` on navbar, cards, and inputs
- **Micro-Animations**: Hover lifts, badge pop, toast slide-in, shimmer loading skeletons, hero pulse
- **Component Architecture**: 10 focused, reusable components with clear separation of concerns
- **Cart System**: Full client-side cart with add/remove/quantity controls and real-time total
- **Toast Notifications**: Custom hook-based notification system replacing `alert()` calls

### Backend
- **Prisma ORM**: Type-safe database access with SQLite for zero-config setup
- **RESTful CRUD**: Full `/api/products` API with search, category filter, validation
- **Graceful Shutdown**: SIGTERM/SIGINT handling with Prisma disconnect

### DevOps
- **Idempotent Scripts**: Both `dev-setup.sh` and `deploy.sh` use `command -v` checks, `mkdir -p`, and conditional operations to be safely re-runnable
- **Dependabot**: Automated weekly dependency checks for npm (client + server) and GitHub Actions versions
- **PR Quality Gates**: ESLint linting + test suite runs on every pull request

---

## 🧩 Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| CORS between client/server | Vite proxy in development, CORS middleware in production |
| Database in CI pipeline | Prisma `db push` with `file:./test.db` in CI environment |
| E2E test timing | Playwright `webServer` config auto-starts both servers |
| Product search | Backend `contains` filter with OR across name/category/description |
| Idempotent deployments | PM2 `describe` check before start-or-restart logic |

---

## 📋 Deployment

### Render (Production)
- Backend: `render.yaml` defines web service config
- Frontend: Static site built from `client/dist`

### AWS EC2
- Automated via `deploy-ec2.yaml` workflow using SSH
- Uses PM2 for process management with auto-restart

### GitHub Pages
- Client SPA deployed via `deploy-pages.yml` workflow

---

## 📄 License

This project is for academic/educational purposes as part of a DevOps course evaluation.
