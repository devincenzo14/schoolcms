# School CMS

A production-ready school management system with a dynamic public website and admin dashboard, built with Next.js 16, MongoDB, and Tailwind CSS.

## Features

- **Dynamic Public Website** — Hero carousel, programs, gallery, announcements, and student application form — all content served from MongoDB
- **Admin Dashboard** — Full CRUD management for all content types with image uploads, rich text editing, drag-to-reorder, and publish/unpublish controls
- **RBAC (Role-Based Access Control)** — Three roles: Admin (full access), Principal (content + applications), Teacher (limited content)
- **JWT Authentication** — Secure httpOnly cookie-based sessions with middleware-protected routes
- **Student Applications** — Public application form with status tracking (pending → approved/rejected)

## Tech Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **MongoDB** via Mongoose 9
- **Tailwind CSS v4**
- **TypeScript**
- **Zod** for validation
- **sanitize-html** for XSS prevention

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB Atlas connection string and a JWT secret:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/edulinks
JWT_SECRET=your-random-secret-key
```

### 3. Seed the database

```bash
npm run seed
```

This creates an admin user and sample content:
- **Email:** admin@edulinks.com
- **Password:** Admin123!

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public website and [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the admin panel.

## Project Structure

```
src/
├── app/
│   ├── (public)/        # Public website pages
│   ├── dashboard/       # Admin dashboard pages
│   └── api/             # REST API routes
├── components/
│   ├── public/          # Navbar, Footer, HeroCarousel, etc.
│   └── dashboard/       # Sidebar, Modal, ImageUpload, etc.
├── lib/                 # DB connection, auth, RBAC, upload, validators
├── models/              # Mongoose schemas (User, Carousel, Program, etc.)
├── scripts/             # Database seed script
└── types/               # Shared TypeScript interfaces
```
