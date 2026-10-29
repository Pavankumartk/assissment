IMAGE SORTING — UPDATED FILES ONLY

This update adds Image Sorting under Image-Based -> Create Questions -> Sub type.
It preserves the existing Multiple Choice, Image Matching, Image Labeling,
Image Dropdown and Image Sequencing branches.

The creator has a collapsed and expanded state in the SAME Content.tsx page:
Question and Image, Groups and Items, Grading Method,
Model Answer and Grader Information.

Rows allow an uploaded image, text, correct group, remove and Add Items (2–6).
Group names start as Hardware and Software and are editable.
Before upload only the upload icon appears. The image stays in the 124x56
frame after selection. Preview uses selectable group buttons per item.

Installation on Mac:
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Image_Sorting_Subtype_Figma_Updated_Files_Only.zip -d .
  npm run build
  npm run dev

Only five existing files and one icon asset are included.
No routes, registries, other assessment types or global styles changed.

Validation: changed Image-Based TSX/data files have no TypeScript diagnostics
in the available snapshot; 18 unrelated snapshot diagnostics remain.
No full production Next.js build or pixel-perfect browser check was possible.
Learner submission and production scoring for this subtype are not included.
