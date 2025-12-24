# BeyondChats – Technical Assignment Submission

This repository contains my **end-to-end solution** for the **BeyondChats Technical Assignment**, covering backend scraping, content enrichment using LLMs, and a production-ready frontend UI.

The system is intentionally designed to be **simple, pragmatic, and resilient**, focusing on correctness, trade-offs, and real-world constraints rather than overengineering.

---

## 🔗 Live Demo (Deployed)

- **Frontend (React + Vite on Vercel)**  
  -> https://beyondchats-assignment-one.vercel.app/

- **Backend API (Laravel on Railway)**  
  -> https://laravel-services-production.up.railway.app/api/articles

> The frontend consumes live data from the deployed Laravel backend.

---

## Overview

The system is implemented in **three phases**:

### Phase 1 – Laravel Backend
- Scrapes the **oldest 5 blog articles** from BeyondChats
- Stores them in a MySQL database
- Exposes RESTful CRUD APIs

### Phase 2 – Node.js Content Pipeline
- Fetches original articles from Laravel
- Searches Google for related high-ranking articles
- Scrapes external reference articles
- Uses an LLM to enhance original content
- Publishes updated articles back to Laravel

### Phase 3 – React Frontend
- Displays original articles in a clean UI
- Allows comparison of original vs updated content
- Handles loading and error states gracefully

---

## Architecture & Data Flow

BeyondChats Blog  
↓  
Laravel Scraper (Phase 1)  
↓  
MySQL Database (Railway)  
↓  
Laravel REST APIs  
↓  
Node.js Pipeline (Phase 2)  
├─ Google Search  
├─ External Article Scraping  
├─ LLM Content Enhancement  
↓  
Updated Articles stored in Laravel  
↓  
React Frontend (Vercel)


---

## 📂 Repository Structure

**beyondchats-assignment/**  
├── **backend-laravel/** — Laravel backend *(Phase 1)*  
├── **node-pipeline/** — Node.js enrichment pipeline *(Phase 2)*  
├── **beyondchats-frontend/** — React + Vite frontend *(Phase 3)*  
└── **README.md** — Project documentation  


---

## Phase 1 – Laravel Backend

### Features
- Scrapes the oldest articles from the BeyondChats blog
- Stores articles with `original` / `updated` status
- Parent–child relationship between original and updated articles
- RESTful CRUD APIs

### Key Design Decisions
- Single `articles` table with parent-child mapping
- `source_url` reused to store reference URLs as a JSON array
- Avoided additional tables to keep schema simple

### Local Setup
```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Phase 2 – Node.js Content Pipeline

### What the pipeline does
For each original article:
- Fetches article from Laravel API
- Searches Google using the article title
- Filters non-blog / irrelevant domains
- Scrapes content from external articles
- Enhances original content using an LLM
- Publishes the updated article back to Laravel

### Failure Handling
- Skips articles if fewer than 2 valid reference articles are found
- Falls back to mock content if LLM quota is exceeded
- Scraping failures are logged and skipped safely

### Reference Storage
- External reference URLs are stored as a JSON array in `source_url`
- Keeps references structured without additional schema complexity

### Local Setup
```bash
cd node-pipeline
npm install
cp .env.example .env
npm start
```

## Phase 3 – React Frontend

### Features
- Card-based article layout
- Modal view with tabs:
  - Original Article
  - Updated Article
- Loader and error states
- Responsive UI using Tailwind CSS

### UX Decisions
- Content hidden from cards to avoid clutter
- Modal-based reading experience for focus
- Graceful handling of missing updated articles

### Local Setup
```bash
cd beyondchats-frontend
npm install
npm run dev
```

## Known Limitations & Trade-offs

- Some websites block scraping (Medium, AMP pages, etc.)
- Google search results may vary between runs
- Free-tier LLM quota limits trigger fallback behavior
- Scraper is not automated via cron by design

### These trade-offs were consciously accepted to prioritize reliability, clarity, and correctness under time constraints.

## Key Takeaways
- Focused on correctness over perfection
- Designed with failure handling in mind
- Avoided unnecessary complexity
- Completed full production deployment end-to-end
