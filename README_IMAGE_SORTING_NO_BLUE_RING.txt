Image Sorting focus/selection styling fix.

Updated files:
- src/modules/assessments/components/type-specific/image-based/Content.tsx
- src/modules/assessments/components/type-specific/image-based/image-based.css
- src/modules/assessments/components/type-specific/image-based/image-based-preview.css

Changes:
- Remove tick mark from Hardware/Software group options.
- Remove bright-blue focus rings from Image-Based creator and Preview controls.
- Retain inset selected state and existing neumorphic shadows.
- Preserve all other assessment types and Image-Based functionality.

Install from web root:
  unzip -o ~/Downloads/Image_Sorting_No_Blue_Ring_No_Checkmark_Fix.zip -d .
  npm run build
