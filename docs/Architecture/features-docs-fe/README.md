# Frontend Architecture Docs (NOT Runtime Code)

This folder contains **documentation-first frontend architecture** for HIVEK.

It is **not** the production codebase. Instead, it acts as a **design + spec workspace** for:

- Next.js 14 App Router structure (public/auth/dashboard groups)
- Feature-based folder layout (`features/`, `components/`, `styles/`)
- Public marketing website (landing, ranking, profile, etc.)
- UI/UX guidelines and brand system for the client app

## What lives here

- `app/` – example App Router tree for docs (demo-only)
- `components/` – global layout + reusable sections (docs/source-of-truth for UI)
- `features/` – feature-level composition used in docs (landing, etc.)
- `styles/` – global CSS + mapping from `ux-ui-style.md` palette
- `pages.md` – list of pages, URLs, components, and APIs
- `ux-ui-style.md` – brand palette and UI guidelines
- `structure.md` – architectural description and link to visual graph

> Any code here is **reference code**: it describes how the frontend should be structured, but the real runtime lives under `client/`.

## Where the real app lives

The actual Next.js app runs from:

```text
client/
  src/
    app/          # real Next.js App Router
    components/   # runtime components
    features/     # runtime features
    styles/       # runtime styles
```

When implementing or changing frontend behavior:

1. **Design/update here first** (`docs/Architecture/frontend`):
   - update specs in `pages.md` / `structure.md`
   - adjust example layout/components if needed
2. **Then apply changes in `client/src/**`**:
   - copy patterns or components as needed
   - keep naming and structure aligned with the docs
3. Keep both **docs** and **client code** in sync.

## Relation to Visual Graph

This folder is connected to the React Flow workspace under `docs/visual/`:

- Nodes in `graph.json` should reference:
  - features (e.g. `landing`)
  - workflows (e.g. `landing.hero-and-nav`)
  - files in this folder (`app/`, `components/`, `features/`, `styles/`, `pages.md`, etc.)
- See `structure.md` here and `docs/visual/README.md` for how the graph and docs stay in sync.

If you create, rename, or delete files/folders here:

- update `structure.md`
- update `docs/visual/graph.json` node paths accordingly

