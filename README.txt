Assignment Content structural correction only.

Files: AssignmentUI.tsx and assignment.css.
- Removed the redundant .asgn-figma-content-frame wrapper around <main>.
- The existing shared Sidebar and Header remain; only <main> is scrollable.
- Removed historical competing CSS rules for Content shell and progress arrows.
- Only one background layer (no shadowed outer panel). Assignment cards keep their Figma raised shadows.
- Stepper uses a single consistent chevron outline, with horizontal scrolling on smaller screens.
- Evaluation and other assessment flows unchanged.

Run: npm run build && npm run dev
