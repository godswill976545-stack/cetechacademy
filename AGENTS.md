# Project Brief: cetech-academy 
 
 ## Tech Stack 
 - **Frontend:** React with Vite (utilizing `.jsx` and `.css` file extensions for all frontend source code) 
 - **Backend:** Convex, with all server logic defined in the `/convex` directory (schema, auth, queries, mutations, actions) 
 - **Database & Auth:** Convex, with complete database schema defined in `convex/schema.ts` 
 - **Email Service:** Resend, integrated via Convex actions for OTP and notifications 
 - **Hosting:** Vercel, configured for continuous deployment from the production codebase 
 
 ## Rules & Conventions 
 - **Main Branch:** The official production branch is permanently set to `master`; all production-ready code must be merged to this branch only 
 - **Styling:** Implement all UI styling using either Tailwind CSS or standard CSS aligned with the patterns and conventions established in `Aurora.css` 
 - **Architecture:** Enforce strict separation of concerns by maintaining all client-side frontend logic within the `/frontend` directory (or root for landing pages) and all backend logic within the `/convex` directory 
 - **Environment Variables:** Retrieve all local secrets and configuration values exclusively from the `.env` file (Vite) or Convex Dashboard; never hardcode API keys, credentials, or sensitive environment values directly in source code 
 - **Convex Functions:** Use `mutation` for data writes, `query` for reads, and `action` for external API calls (e.g., Bird.com email sending) 
 
 ## Convex Structure 
 - `convex/schema.ts` — Database schema (all tables: users, courses, units, lessons, enrollments, user_progress, quizzes, questions, quiz_results, user_notes, user_bookmarks, assignments, assignment_submissions, verification_codes) 
 - `convex/auth/` — Auth mutations (register, login, verifyOTP, resendOTP) and queries (getUser) 
 - `convex/courses/` — Course data queries (listCourses, getCourse, getLessonsByUnit) 
 - `convex/progress/` — User progress tracking (updateProgress, getUserProgress) 
 - `convex/enrollments/` — Enrollment management (createEnrollment, checkEnrollment) 
 - `convex/email/` — Bird.com email action (sendOTP) 
 - `convex/users/` — User profile mutations and queries 
 - `convex/http.ts` — HTTP endpoints (health check, contact form, webhooks) 
 - `convex/structure/` — Seed data initialization 
 
 ## Bird.com Configuration 
 - Set `BIRD_API_KEY`, `BIRD_WORKSPACE_ID`, and `BIRD_REGION` in `.env` 
 - Bird.com endpoint: `https://email.{region}.api.bird.com/api/workspaces/{workspaceId}/reach/transmissions` 
 - Auth: `Authorization: Bearer <api_key>` 
 - The sendOTP action in `convex/email/sendOTP.ts` sends 6-digit codes for email verification 
 
 ## Deployment 
 - Any push to the `master` branch automatically triggers a full production build and deployment pipeline on Vercel; verify all code changes pass local testing before merging to `master` to avoid deployment failures 
 - Run `npx convex dev` locally to start the Convex dev server alongside Vite 
