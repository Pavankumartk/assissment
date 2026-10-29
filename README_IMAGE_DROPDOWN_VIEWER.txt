Image Dropdown viewer integration — limited patch

Uploaded Figma attachments were headed Image Labelling and Image Dropdown, not Image Sequencing.
This patch adds Image Dropdown to the existing ImageFigmaViewer shell with question diagram and position-based dropdowns; it preserves the original Image Labelling view and the already integrated Image Sequencing flow.

Modified: Viewer.tsx, ImageFigmaViewer.tsx, image-viewer-submission.ts
New: image-dropdown-viewer.css (scoped styles for Image Dropdown only)
No existing viewer stylesheet is replaced. Existing shared Submit/Submitted popups, View Result and Retry integration are reused.

Apply: unzip -o <zipname> -d .
Then: npm run build
