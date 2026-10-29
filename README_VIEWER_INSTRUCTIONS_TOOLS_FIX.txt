IMAGE-BASED SCROLL + INSTRUCTIONS + ASSESSMENT TOOLS FIX — 2026-10-29

Target: Next.js Assessment Management web directory.
Install:
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Assessment_Viewers_Instructions_Scroll_Tools_No_Side_Result_Fix.zip -d .
  npm run build

Changes:
1. Reuses MCQ's existing assessment instructions layout before Image-Based learner tests.
   Start Assessment requires confirming instructions. Preview bypasses instruction gate.
2. Image Dropdown and Labelling: scrollable page without spilling images/dropdowns outside image frame.
3. Existing Scratch Pad, Calculator and Formula Sheet routes enabled for all assessment types:
   short-answer and one-word keep their own existing tools; all others reuse existing MCQ tools.
4. Shared MCQ / True-False, Fill in the Blanks and Match the Following viewer buttons now use the current assessment-specific tool URLs.
5. Four user-provided Image-Based viewer right panels no longer show View Result.
   The existing Assessment Submitted popup retains its View Result action according to release settings.

No viewer CSS from the four user-supplied Figma viewer flows was altered.
No creator/Evaluation/Review page design was altered.

IMPORTANT: The screen changes are based on the available project snapshot. Test the flow
against your current Mac build. The shared generic tool pages still derive question labels
from MCQ's draft on non-MCQ assessments; the calculator and scratch functionality works
but cross-type question titles/counts can differ until a shared tool-data adapter is added.
