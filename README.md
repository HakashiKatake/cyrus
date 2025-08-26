# AI Exam Paper Generator (Primary Math)

Simple full-stack app for generating primary school math exams using Google Gemini.

## Features
- Topic and question count inputs
- Optional answer key generation
- Loading and error states
- Copy-to-clipboard
- Tailwind CSS, Vite, React
- Node.js/Express backend with secure API key usage

## Setup
1. Backend
  - Copy `.env.example` to `.env` in `backend/` and set `GEMINI_API_KEY`.
   - Install deps and run:
     - `npm install` (in `backend/`)
     - `npm run dev`
2. Frontend
   - Install deps and run:
     - `npm install` (in `frontend/`)
     - `npm run dev`
   - App runs at http://localhost:5173 (proxy to backend at http://localhost:3001).

## Production
Build frontend then start backend:
- `cd frontend && npm run build`
- `cd ../backend && NODE_ENV=production npm start`
Backend serves `frontend/dist` statically.

## API
POST /generate-exam
Body: `{ topic: string, count: number (1-50), includeAnswers?: boolean }`
Response: `{ exam: string }`
