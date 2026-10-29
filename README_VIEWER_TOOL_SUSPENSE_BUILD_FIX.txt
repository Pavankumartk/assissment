VIEWER TOOL ROUTES — NEXT.JS 16 PRERENDER FIX (ONLY 3 FILES)

Fixes useParams() outside Suspense during npm run build for the
calculator, scratch, and formulasheet assessment-specific routes.

Original tool code and UI are unchanged: each original tool component is
rendered as ToolContent under a Suspense boundary in the same page file.

INSTALL:
cd ~/Desktop/assessments/web
unzip -o ~/Downloads/Viewer_Tools_UseParams_Suspense_Build_Fix_Only.zip -d .
npm run build

No change to CSS, images, question viewer, submit popup, or creator pages.
