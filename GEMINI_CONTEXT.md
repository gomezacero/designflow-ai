# DesignFlow AI - Project Context for AI Agents

## 1. Project Overview
**Name:** DesignFlow AI
**Purpose:** A task management and workflow automation tool for design teams, featuring AI-powered brief generation ("Magic Brief").
**Tech Stack:**
- **Frontend:** React (Vite), TypeScript, Tailwind CSS.
- **Backend/Database:** Supabase (PostgreSQL).
- **AI:** Google Gemini API (via `geminiService.ts`).
- **Icons:** Lucide React.
- **Deployment:** Vercel.

## 2. Architecture & Patterns
- **State Management:** Custom hooks (`useAppState`, `useUIState`, `useAuth`).
- **Data Layer (`useAppState.ts`):** Hybrid architecture.
  - **Live Mode:** Connects to Supabase if `.env` credentials exist (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - **Mock Mode:** Falls back to local memory if credentials are missing.
- **Service Layer:** `src/services/api/` abstracts direct database calls.
- **Auth (`useAuth.ts`):** Currently **Mocked/Local**. It maintains a `User` state but does not yet authenticate against Supabase Auth.
- **Styling:** iOS-inspired aesthetic (clean, glassmorphism, blur effects).

## 3. Key Data Models (Supabase)
Schema defined in `schema.sql`.
- **Tasks:** The core unit. Links to `sprints`, `designers`, `requesters`.
- **Sprints:** Time-bound cycles (Active, Future, Past).
- **Designers:** Team members who execute tasks.
- **Requesters:** Clients or departments requesting work.

## 4. Current Feature Set (Status: Active)
- **Dashboard:** Kanban board and List view for tasks. Supports filtering and drag-and-drop.
- **Magic Brief:** Modal to generate structured task requirements from natural language using Gemini.
- **Sprints View:** Accordion-style list of sprints showing progress and tasks per sprint.
- **My Profile:** Editable user profile view (updates local state currently).
- **Data Persistence:** Fully functional with Supabase.

## 5. Recent History & Changelog
**Date:** 2025-12-10
- **Fix:** Connected Supabase credentials and fixed data persistence issue (Tasks created are now saved to DB).
- **Feat:** Created `SprintsView.tsx` to visualize sprint progress.
- **Feat:** Created `ProfileView.tsx` for user settings.
- **Refactor:** Cleaned up console logs from production code.
- **DevOps:** Pushed code to GitHub (`main`) and triggered Vercel deployment.

## 6. Known Issues / Next Steps
- **Authentication:** `useAuth` is still local. Needs integration with Supabase Auth for secure login.
- **Search Arbitrage View:** Placeholder in Sidebar, needs implementation.
- **Mobile Menu:** Functional but UI can be polished.
- **Testing:** `vitest` is set up but test coverage is minimal.

## 7. Key Files Map
- `src/App.tsx`: Main router/layout logic.
- `src/hooks/useAppState.ts`: Data fetching and state logic hub.
- `src/lib/supabase.ts`: Database client initialization.
- `src/components/Dashboard.tsx`: Main task view.
- `src/components/MagicBriefModal.tsx`: AI feature implementation.
