# SkillBridge — Student Skills and Freelancing Platform

SkillBridge is a beginner-friendly full-stack prototype where students can explore learning resources and student-friendly freelance project ideas.

## Technology stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js and Express
- Database: Supabase PostgreSQL
- Version control: Git and GitHub

## Features in this starter

- Responsive landing page
- Skills and learning resources loaded from Supabase through the backend API
- Projects loaded from Supabase through the backend API
- Search and category filtering
- Basic client-side profile form validation
- Demo login and registration forms (not yet connected to Supabase Auth)
- Clear API error states

> Important: Applications, profile persistence, and authentication are still demo-only. The API currently provides read endpoints for skills and projects.

## Setup

### 1. Create the Supabase database

Create a Supabase project and run the SQL schema supplied during project setup. The schema should create `profiles`, `skills`, `projects`, and `applications` tables, enable RLS, and insert sample skills and projects.

### 2. Configure the backend

Install a current LTS version of Node.js.

Open a terminal in the `backend` directory and run:

```bash
npm init -y
npm install express cors dotenv @supabase/supabase-js
```

Fill in `backend/.env` with your Supabase project URL and publishable/anon key:

```env
PORT=3000
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Do not put a service-role or secret key in the frontend or commit credentials to GitHub.

### 3. Start the backend

From the `backend` directory:

```bash
node server.js
```

Check these endpoints in your browser:

- http://localhost:3000/
- http://localhost:3000/api/health
- http://localhost:3000/api/skills
- http://localhost:3000/api/projects

### 4. Open the frontend

Open `frontend/index.html` in your browser. Keep the backend server running. The frontend fetches data from `http://localhost:3000/api`.

If the browser blocks local file requests, serve the `frontend` directory with a simple local static server, for example the VS Code Live Server extension. Keep the API server running separately.

## Current limitations

- Supabase Auth is not connected yet.
- Profile form saves only in browser memory.
- Application submission and withdrawal are not connected to the database.
- Only skills and projects have backend read endpoints.
- Add authenticated, ownership-checked routes before implementing database writes.

## GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial SkillBridge project"
```

Create a new empty repository on GitHub, then follow GitHub's instructions to add the remote and push. Confirm `.env` is not staged before pushing.
