IMAGE MATCHING — FIGMA STYLE CORRECTION (UPDATED FILES ONLY)

Scope: Image-Based Assessment > Sub type > Image Matching.
Only Content.tsx and the two Image-Based CSS files are included.
This patch does not change assessment registration, route selection,
question storage types, grading, the learner viewer or other assessment types.

Updates: Figma 58px subtype input; 57px accordion headers retained;
56px inset matching text and image fields; 42px raised image thumbnail;
60x56px raised remove-button housing with 32px inset circle;
156x40px raised gradient Add Pairs/Add Extra; 58px inset shuffle track;
692px centered preview rows, 118x70px image wells, 70px select dropdowns.
Segoe UI and #DFE6E9, white/#C4C4C4 raised/inset shadows.
The matching upload control uses your assessmenticons paths, with an
ImageIcon fallback if the corresponding SVG is not present.

INSTALL (Mac):
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Image_Matching_Figma_Design_Shadow_Fix_Only.zip -d .
  npm run build
  npm run dev

Open Assessment > Image-Based > Create Questions > Sub type: Image Matching.
Then Preview Questions.

IMPORTANT: This patch was checked for TSX syntax and CSS parsing, but a
full production Next.js build on the user's latest Mac project and a
pixel-by-pixel browser screenshot comparison were not available here.
