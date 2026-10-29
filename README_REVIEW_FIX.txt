CLICKABLE HOTSPOT — USE THE EXISTING REVIEW SCREEN (FIX ONLY)

This fixes the earlier integration that added a separate Clickable Hotspot Review.
The creator now uses the existing MCQ/Figma ReviewStep at:
  src/modules/assessments/components/common/steps/ReviewStep/ReviewStep.tsx
The old ReviewStep and review.css ARE NOT MODIFIED.

If the earlier Clickable Hotspot integration is already installed:

  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Clickable_Hotspot_Use_Existing_Review_Fix_Only.zip -d .
  python3 fix_clickable_hotspot_review.py . --check
  python3 fix_clickable_hotspot_review.py .
  npm run build

The script edits ONLY the clickable-hotspot entry and original Review routing in
  src/modules/assessments/components/common/AssessmentForm.tsx
It removes the obsolete custom Review.tsx and review.css ONLY when those two files
match the previous integration's unmodified copies. User edits are protected.
No viewer, content, details, evaluation, other types, or shared Review files are edited.

When successful:
  git add -A
  git commit -m 'Use existing Review page for Clickable Hotspot'
  git push origin main

If you have not installed Clickable Hotspot at all, use the corrected FULL integration
ZIP instead; this smaller fix is only for the previous integration.
