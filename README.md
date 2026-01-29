# Contest Management System

This is a **Turborepo** monorepo containing a full-stack **Competitive Programming & Contest Platform**. It is designed to host, manage, and run coding or quiz-based contests with ease.

## 🌟 What is this Project?

This project is a comprehensive **Contest Management System** that allows administrators to create and schedule contests, and users to participate in them in real-time.

**Core Functionalities:**
- **For Participants:** A clean, responsive interface to view upcoming contests, register, and enter the "Contest Arena" to solve problems.
- **For Administrators:** A powerful dashboard to create contests, manage questions (CRUD), and monitor active sessions.
- **Real-time Lifecycle:** Automated background jobs manage the precise start and end times of contests.
- **Scalable Architecture:** Built with a separate backend and frontend to handle high traffic, utilizing Redis for caching and job queues.

It utilizes a shared package architecture for maximum code reuse and type safety.

## 🏗 Project Structure

The project is organized as follows:

```
├── apps
│   ├── web            # Next.js 16 frontend application
│   └── http-backend   # Express.js backend (running with Bun)
├── packages
│   ├── db             # Prisma database schema and client
│   ├── ui             # Shared React UI components
│   ├── eslint-config  # Shared ESLint configurations
│   └── typescript-config # Shared TypeScript configurations
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (Required for backend)
- [PostgreSQL](https://www.postgresql.org/) (or a compatible SQL database)
- [Redis](https://redis.io/) (Required for backend caching/queues)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd contest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

### Configuration

You need to set up environment variables for the apps and packages.

**1. Database (`packages/db/.env`):**
Create a `.env` file in `packages/db` and add your database connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/contest_db"
```

**2. Backend (`apps/http-backend/.env`):**
Create a `.env` file in `apps/http-backend` with the following variables:
```
PORT=3001
JWT_SECRET=your_secret_key
DATABASE_URL="postgresql://user:password@localhost:5432/contest_db"
REDIS_URL="redis://localhost:6379"
```

**3. Frontend (`apps/web/.env.local`):**
Create a `.env.local` file in `apps/web` (if needed for API URLs):
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Database Setup

Initialize the database using Prisma from the `db` package:

```bash
cd packages/db
npx prisma generate
npx prisma db push
# or to create a migration
npx prisma migrate dev
```

### Running the Project

To start all applications (Frontend + Backend) simultaneously:

```bash
turbo dev
```

- **Web Frontend:** [http://localhost:3000](http://localhost:3000)
- **HTTP Backend:** [http://localhost:3001](http://localhost:3001)

## 📦 Applications & Features

### 1. Web Frontend (`apps/web`)

A modern Next.js application built with React 19, Tailwind CSS, and Zustand.

**Key Routes:**
- **Admin Dashboard** (`/contests/[id]`): specialized interface for administrators to manage specific contests.
- **User Dashboard** (`/dashboard`): Personal dashboard for users to view their contests and progress.
- **Contest Arena** (`/contest/[id]`): Public-facing page where users participate in contests.
- **Authentication** (`/signin`): User login/signup flow.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Lucide React, Framer Motion, Three.js (Fiber/Drei).

### 2. HTTP Backend (`apps/http-backend`)

A high-performance REST API built with Express and optimized with Bun.

**API Endpoints:**
- `/auth`: Authentication routes (Login/Signup).
- `/user`: User profile and data management.
- `/contest`: Contest creation, retrieval, and management.
- `/batch`: Batch management for admin operations.
- `/question`: Question CRUD operations for contests.

**Key Features:**
- **Contest Lifecycle Job:** A background job (cron/redis) that manages the state of contests (starting/stopping based on schedule).
- **Middleware:** Custom authentication and admin middleware for secure access.

**Tech Stack:** Express, Bun, TypeScript, Redis, Bcrypt, JWT, Node-Cron.

## 🛠 Shared Packages

- **`@repo/db`**: Contains the Prisma schema and generated client, ensuring type-safe database access across both apps.
- **`@repo/ui`**: A shared library of UI components to maintain design consistency.
- **`@repo/config`**: Shared ESLint and TypeScript configurations.

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
