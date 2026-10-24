Assessment Creator & Viewer — Fill in the Blanks integration
==========================================================
What this update changes:
- Learner dashboard reminder: matched the existing neumorphic background, raised/inset shadows, text and button styles in all responsive sizes.
- Fill in the Blank is a working creator type in the existing Assessment type picker.
- Shares the same Details, Evaluation and Review layout as MCQ but saves its own fillBlanks... browser drafts.
- Uses the uploaded Fillintheblanks.zip Content question builder, with validation and configured question count (no sample questions).
- Includes uploaded viewfilblanks.zip viewer, preceded by learner Instructions and followed by a result summary.
- Connects creator publish -> learner list -> instructions -> start -> submit -> result. Saves attempt history in existing browser-only assessment storage.
- Separates author previews from learner submissions and never injects demo questions.
- Reuses public/assets/assessmenticons and public/assets/viewericons; no duplicate icon folder.
- The pre-existing Generate With AI configuration screen recognizes the Fill in the Blanks type; a live AI service is NOT connected.

Install on Mac:
1. Download this ZIP to Downloads.
2. In Terminal, run:
   cd ~/Desktop/assessments/web
   cp -R src ../src-before-fill-integration
   unzip -o ~/Downloads/Assessment_Fill_Blanks_Creator_Viewer_Learner_Integrated.zip -d .
   rm -rf .next
   npm run build
3. If build succeeds, run npm run dev, then test both Institute Admin and Learner roles.
4. Push to GitHub ONLY after npm run build succeeds.

Important: browser localStorage isolates drafts per assessmentId. This frontend-only demo does not sync assessment data across browsers/devices or users.
