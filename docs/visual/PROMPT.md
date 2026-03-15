@docs Set up a web-based React Flow visualization workspace for this repository under `docs/visual/`.

Context
- Markdown docs are the source of truth.
- The visual graph is a derived but editable projection of the docs.
- The graph must support two-way sync:
  - docs changes -> graph updates
  - graph changes -> docs updates
- The graph hierarchy must be centered on: feature -> workflow -> file
- The visualization must be editable on the web.
- The repository already contains documentation rules. Follow them strictly.

Main goal
Create a self-contained React Flow workspace inside `docs/visual/` that can be opened locally in the browser and used as:
- a visual explorer of docs and code relationships
- a graph editor
- a markdown-linked documentation workspace

Required outputs
Create and maintain:
- `docs/visual/package.json`
- `docs/visual/index.html`
- `docs/visual/src/main.tsx` or `main.jsx`
- `docs/visual/src/App.tsx` or `App.jsx`
- `docs/visual/src/components/`
- `docs/visual/src/lib/`
- `docs/visual/src/styles/`
- `docs/visual/graph.json`
- `docs/visual/README.md`

Tech requirements
- Use React Flow as the graph editor/viewer
- Use a lightweight local web setup that can run independently from the main app
- Prefer Vite for the local web workspace
- Keep the setup minimal, maintainable, and easy to run
- Use local file-based graph loading from `docs/visual/graph.json`
- Make the workspace easy for both humans and agents to inspect and edit

Install/setup tasks
1. Create a standalone frontend workspace under `docs/visual/`
2. Install the required packages for:
   - React
   - React DOM
   - React Flow
   - any minimal utilities needed for local state and file handling
3. Set up scripts so the workspace can be run locally in the browser
4. Ensure the local dev server starts from `docs/visual/`
5. Add clear instructions in `docs/visual/README.md` for how to run the visual workspace

UI requirements
The React Flow UI must:
- load graph data from `docs/visual/graph.json`
- render nodes and edges clearly
- support editing node labels
- support editing linked markdown paths
- support adding nodes
- support deleting nodes
- support adding edges
- support deleting edges
- support selecting node type
- support saving graph changes back into the graph data file or exportable JSON
- support opening linked markdown docs
- support editing markdown content from the UI
- include zoom controls, fit view, minimap, and background
- support filtering/grouping by feature and workflow
- keep the interface simple and readable

Data model requirements
Use a stable graph schema.

Nodes must support at least:
- `id`
- `type`
- `label`
- `path`
- `parentId`
- `feature`
- `workflow`
- `description`
- `tags`
- `status`
- `position`
- `lastSyncedAt`

Edges must support at least:
- `id`
- `source`
- `target`
- `relation`
- `label`

Node type requirements
Support these node types:
- `feature`
- `workflow`
- `file`
- `folder`
- `note`

Graph behavior rules
- Keep the graph centered on feature -> workflow -> file
- Avoid unnecessary visual complexity
- Keep IDs stable
- Keep labels human-readable
- Use markdown docs as the primary source of truth
- If graph and docs conflict, prefer docs unless a graph edit is clearly newer and intentional

Editing requirements
Implement a practical editing workflow:
- clicking a node shows editable metadata
- metadata panel allows editing:
  - label
  - path
  - description
  - feature
  - workflow
  - tags
  - status
- markdown-linked nodes can open and edit markdown content in a side panel
- adding a node should allow choosing its type and linked path
- deleting a node should also handle related edges safely
- adding an edge should allow choosing a relation type

Markdown integration requirements
- If a node links to a markdown file, the UI should expose that link clearly
- If a markdown file does not exist yet, allow creating it intentionally
- If a user edits markdown from the UI, preserve human-written content as much as possible
- Do not overwrite docs blindly
- Prefer updating structured sections if they exist

Project structure requirements
Create a clean structure similar to:

docs/visual/
  package.json
  index.html
  graph.json
  README.md
  src/
    main.tsx
    App.tsx
    components/
      GraphCanvas.tsx
      Sidebar.tsx
      NodeInspector.tsx
      MarkdownEditor.tsx
      Toolbar.tsx
    lib/
      graph.ts
      markdown.ts
      sync.ts
      schema.ts
    styles/
      app.css

Implementation expectations
- Build a working first version, not a placeholder
- Use reasonable defaults and example data if necessary
- Preload the UI with a starter graph if `graph.json` is empty or missing
- Keep code readable and modular
- Add comments only where helpful
- Avoid unnecessary abstractions

README requirements
In `docs/visual/README.md`, explain:
- what this visual workspace is for
- how to install dependencies
- how to start the local web server
- where `graph.json` lives
- how graph data relates to docs
- how the two-way sync is intended to work
- current limitations, if any

Execution rules
- First inspect the existing repository structure and documentation rules
- Read relevant `structure.md` files before modifying folders
- Then create the React Flow workspace under `docs/visual/`
- Then install dependencies
- Then implement the UI
- Then create or update `graph.json`
- Then document the setup in `docs/visual/README.md`

Non-negotiable rule
Do not stop at scaffolding only.
Produce a usable local web workspace that can actually be run and visually edited.

Final deliverable
At the end, provide:
- the files created or changed
- how to run the visual workspace locally
- any assumptions made