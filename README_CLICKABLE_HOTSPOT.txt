CLICKABLE HOTSPOT — CREATOR + LEARNER FLOW INTEGRATION

Input: Your Clickablehotspot.zip and Viewclickable.zip, preserving the Figma
TSX/CSS of both screens. No other assessment's TSX or CSS is replaced.

Flow — Creator
  Select Clickable Hotspot -> Details (shared MCQ Details step) -> Content
  (original Clickablehotspot creator including preview/validation)
  -> Evaluation (existing MCQ Evaluation step) -> Review (Hotspot-specific
  real images/regions overview) -> Publish -> Assessment dashboard.

Flow — Learner
  Learner dashboard -> Published Clickable Hotspot assessment -> Instructions
  -> Tick confirmation -> Start Assessment -> Answer image hotspots
  -> Previous/Next/Flag/Tools -> Submit confirmation -> Success popup
  -> Saved results. Timer expiry also saves results. Submitted attempts
  are locked on later visits; explicit ?retry=wrong remains supported.

Drafts, attempts and results are scoped by active assessmentId through
assessmentStorage; the viewer does not load Match the Following or other
assessment content or substitute sample questions in a real attempt.

INSTALL (Mac Terminal)
1. In your terminal:
      cd ~/Desktop/assessments/web

2. Extract the downloaded ZIP into this 'web' directory; example:
      unzip -o ~/Downloads/Clickable_Hotspot_Full_Flow_Integration_Only.zip -d .

3. Before writing, check what will change:
      python3 install_clickable_hotspot.py . --check

4. Apply only the missing integration edits:
      python3 install_clickable_hotspot.py .

5. Verify and build:
      git diff --stat
      npm run build
      npm run dev

6. When happy, commit and push:
      git add src/modules/assessments/config/assessment-types.ts \
        src/modules/assessments/config/component-registry.ts \
        src/modules/assessments/components/common/AssessmentForm.tsx \
        src/modules/assessments/storage/assessment-storage.ts \
        'src/app/assessments/[assessmentId]/viewer/PageClient.tsx' \
        src/modules/assessments/components/type-specific/clickable-hotspot/
      git commit -m 'Integrate Clickable Hotspot creator and learner flow'
      git push origin main

OPTIONAL: rm install_clickable_hotspot.py to keep the installer out of your repo.

IMPORTANT
- The installer aborts BEFORE editing any file if known anchors differ from
  your project version; it never blindly overwrites shared routes.
- The installer is idempotent (running it twice does not duplicate entries).
- The only shared files it edits are the 5 listed above.
- All seven dedicated Clickable Hotspot component/CSS files are under
  src/modules/assessments/components/type-specific/clickable-hotspot/.
- Your source project was not uploaded, so a complete `npm run build` against
  your current repository could not be run here. The installer was tested against
  the prior assessment integration files available in this conversation.
