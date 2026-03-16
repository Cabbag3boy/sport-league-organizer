# Architecture Boundaries

This codebase follows a four-layer structure:

1. Client UI/state

- React components, client hooks, Zustand stores, browser-only utilities.
- Responsible for rendering, local interaction state, and calling app APIs.
- Must not perform direct Supabase mutations.

1. Transport routes

- Next.js route handlers under `app/api/**`.
- Responsible for request parsing, auth/CSRF validation, and response shaping.
- Should stay thin and delegate orchestration to server services.

1. Server services

- Feature-level orchestration for reads and mutations.
- Responsible for coordinating queries, mapping database rows, and building domain responses.
- Must not depend on React or browser APIs.

1. Repository/data-access helpers

- Supabase client factories and focused query/mapping helpers.
- Responsible for privilege-aware data access and low-level row transformations.

Guardrails:

- No direct Supabase writes from client code.
- No heavy query or mapping logic inside route handlers.
- No ambiguous server privilege boundaries in server-side Supabase setup.
- First-page bootstrap is server-owned on initial render; client bootstrap fetch is retained as a guarded fallback/refresh path.
