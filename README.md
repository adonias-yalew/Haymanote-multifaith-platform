# Haymanote (ሃይማኖት) — Ethiopian Faith Community Platform

> **ሃይማኖት** means _"Faith"_ in Amharic.Haymanote is a modern, full-stack digital home for Ethiopian faith communities, bringing together Orthodox, Protestant, and Muslim believers, religious leaders, and trusted vendors in one unified platform. It fosters connection, learning, community engagement, and access to faith-based services while respecting the unique traditions of each faith.

## ✨ Features

### 🙏 Community & Worship

- **Community Feed** — Share posts, testimonies, and prayer requests (with anonymous posting option)
- **Sermons** — Upload, browse, and stream sermons from verified leaders
- **Prayer Requests** — Submit and respond to prayer needs within the community
- **Events** — Discover and share upcoming church events

### 👥 Roles & Dashboards

| Role       | Capabilities                                                           |
| ---------- | ---------------------------------------------------------------------- |
| **User**   | Post, comment, save content, donate, track spiritual journey           |
| **Leader** | Publish sermons & teachings, respond to community, manage congregation |
| **Vendor** | List products in the marketplace, manage orders & messages             |
| **Admin**  | Full platform oversight, user management, donation recipient control   |

### 🛒 Marketplace

- Browse and purchase faith-related products
- Vendor dashboards for product, order, and message management

### 🤖 AI Copilot

- AI-powered spiritual guidance and Q&A assistant integrated directly into the platform

### 💰 Donations

- Support ministry leaders and community projects with a built-in donation system

### 🌍 Multi-Language Support

- **English** (`en`)
- **አማርኛ / Amharic** (`am`)
- **Afaan Oromoo** (`om`)

### 🔐 Security & Access Control

- JWT-based authentication with role-based access control (RBAC)
- Row Level Security (RLS) on all database tables via Supabase
- Religion-aware access control per community
- Document verification for leader accounts
- Password hashing with bcrypt
- Email verification flow

---

## 🏗️ Architecture

```
Haymanote Platform
├── Frontend  →  React 19 + Vite + TypeScript + TailwindCSS
├── Backend   →  Express + TypeScript (Modular Monolith)
└── Database  →  Supabase (PostgreSQL) with RLS
```

### Backend — Modular Monolith

- **Framework:** Express + TypeScript
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Auth:** JWT + RBAC (User / Leader / Vendor / Admin)
- **Module pattern:** `src/modules/{feature}/{controller,service,routes,types}.ts`

**Modules:** `auth` · `users` · `posts` · `comments` · `sermons` · `prayers` · `donations` · `leaders` · `marketplace` · `reports` · `admin` · `ai`

### Frontend — React SPA

- **Framework:** React 19 + Vite + TypeScript
- **Styling:** TailwindCSS with custom design tokens
- **State:** Context API + custom React hooks
- **Routing:** React Router with protected routes per role
- **i18n:** `i18next` supporting English, Amharic, and Afaan Oromo

---

## 📁 Project Structure

```
Haymanote-Project/
├── backend/
│   └── src/
│       ├── modules/          # Feature modules (auth, posts, sermons, ai, …)
│       ├── config/           # Environment configuration
│       ├── db/               # Supabase database client
│       ├── middleware/       # Auth, error handling, validation middleware
│       ├── types/            # Shared TypeScript types
│       └── utils/            # Utility functions
│
├── frontend/
│   └── src/
│       ├── pages/            # Route-level components (31 pages)
│       ├── components/       # Reusable UI components
│       ├── layouts/          # Layout wrappers (public, dashboard, etc.)
│       ├── context/          # React Context providers (Auth, Theme, …)
│       ├── hooks/            # Custom React hooks
│       ├── services/         # API service layer
│       ├── actions/          # Form actions / data mutations
│       ├── i18n/             # Internationalization (en, am, om)
│       ├── loaders/          # Route data loaders
│       └── types/            # TypeScript type definitions
│
├── database/
│   ├── migrations/           # 17 versioned SQL migration files
│   └── seeds/                # Seed data
│
├── shared/                   # Types shared between frontend and backend
└── package.json              # Root workspace (npm workspaces)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- A **Supabase** project ([create one free](https://supabase.com))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Haymanote-Project

# Install all dependencies (root + frontend + backend)
npm run install:all
```

### 2. Environment Variables

**Backend** — create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Setup

Run the migrations **in order** in your Supabase SQL Editor:

```
database/migrations/
  001_initial_schema.sql
  002_rls_policies.sql
  003_haymanote_migration.sql
  004_haymanote_migration.sql
  005_mock_data_and_schema_fixes.sql
  006_religion_access_control.sql
  007_enforce_user_religion.sql
  008_role_navigation_marketplace_anonymous_rules.sql
  009_add_email_verification_and_features.sql
  010_add_leader_response_column.sql
  011_add_document_verification.sql
  012_update_comments_trigger.sql
  013_community_fixes.sql
  014_admin_management.sql
  015_admin_management_reconcile.sql
  016_disable_email_verification_and_auto_approve.sql
```

### 4. Run Locally

```bash
# Start both frontend and backend concurrently
npm run dev

# Or run them separately:
npm run dev:backend    # API server → http://localhost:3000
npm run dev:frontend   # React app → http://localhost:5173
```

---

## 🛠️ Development

### Available Scripts

| Command                  | Description                           |
| ------------------------ | ------------------------------------- |
| `npm run dev`            | Start frontend + backend concurrently |
| `npm run dev:backend`    | Start backend dev server only         |
| `npm run dev:frontend`   | Start frontend dev server only        |
| `npm run build`          | Build both frontend and backend       |
| `npm run build:backend`  | Build backend only                    |
| `npm run build:frontend` | Build frontend only                   |
| `npm run install:all`    | Install all workspace dependencies    |

### Code Style

- TypeScript **strict mode** throughout
- ESLint + Prettier enforced
- Naming conventions: `camelCase` for variables/functions, `PascalCase` for types and React components

### Backend Module Pattern

Each feature module is self-contained:

```
modules/{name}/
├── controller.ts   # HTTP request handlers
├── service.ts      # Business logic
├── routes.ts       # Route definitions & middleware
└── types.ts        # Module-specific TypeScript types
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

<div align="center">
  <strong>Haymanote · ሃይማኖት</strong><br/>
  <em>Building a faithful digital community for Ethiopia and beyond.</em>
</div>
