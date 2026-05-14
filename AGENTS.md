# Project Brief: cetech-academy 
 
 ## Tech Stack 
 - **Frontend:** React with Vite (utilizing `.jsx` and `.css` file extensions for all frontend source code) 
 - **Backend:** Node.js, with all backend implementation housed exclusively in the `/backend` directory 
 - **Database:** Supabase, with complete database schema and initialization scripts defined in `setup_supabase.sql` 
 - **Hosting:** Vercel, configured for continuous deployment from the production codebase 
 
 ## Rules & Conventions 
 - **Main Branch:** The official production branch is permanently set to `master`; all production-ready code must be merged to this branch only 
 - **Styling:** Implement all UI styling using either Tailwind CSS or standard CSS aligned with the patterns and conventions established in `Aurora.css` 
 - **Architecture:** Enforce strict separation of concerns by maintaining all client-side frontend logic within the `/frontend` directory and all server-side API logic within the `/api` directory 
 - **Environment Variables:** Retrieve all local secrets and configuration values exclusively from the `.env` file; never hardcode API keys, credentials, or sensitive environment values directly in source code 
 
 ## Deployment 
 - Any push to the `master` branch automatically triggers a full production build and deployment pipeline on Vercel; verify all code changes pass local testing before merging to `master` to avoid deployment failures 
