CONNECT THE DOTS — EXISTING INSTRUCTIONS SCREEN RESTORED

Updates only these two files:
1. src/app/assessments/[assessmentId]/viewer/PageClient.tsx
2. src/modules/assessments/components/type-specific/connect-the-dots/Instructions.tsx (new)

Behavior:
- Learner opens a Connect the Dots assessment for the first time in a tab/session:
  the same existing MCQ-style Instructions screen is shown.
- Assessment title, saved Connect the Dots question count, total marks, duration,
  passing score and creator-provided instructions are read from the assessment draft.
- The checkbox must be checked before Start Assessment is enabled.
- The Connect the Dots viewer is mounted and its timer starts only on Start.
- The instruction acceptance is stored per assessment in sessionStorage, so
  navigating to Scratch Pad / Calculator / Formula Sheet and back does not
  restart the instructions or reset a running attempt.
- Add ?instructions=1 to the viewer URL if you want to show instructions again.
- Admin viewer previews are unchanged.
- Image-Based instructions and every other assessment are unchanged.
- Creator, review, evaluation, viewer functionality and Figma CSS are unchanged.

INSTALL (run from your own Assessment web directory):
cd ~/Desktop/assessments/web
unzip -o ~/Downloads/Connect_The_Dots_Instructions_Screen_Fix_Only.zip -d .
npm run build
npm run dev

NOTE: A full build against your exact Mac project was not run here.
