IMAGE SORTING – FIGMA CONTROLS + MOBILE FIX

Only these files are updated:
- src/modules/assessments/components/type-specific/image-based/Content.tsx
- src/modules/assessments/components/type-specific/image-based/PreviewQuestions.tsx
- src/modules/assessments/components/type-specific/image-based/image-based.css
- src/modules/assessments/components/type-specific/image-based/image-based-preview.css
- public/assets/assessmenticons/grid-view.svg (new Figma four-square section icon)

Corrections:
- Correct Question and Image grid-view section icon ONLY on Image Sorting.
- Add Items button: exact 156 x 40 raised shape, blue-to-pink gradient lettering, existing plus-1.svg gradient icon.
- Creator Hardware/Software (group) dropdowns: custom inset 56px controls and raised neumorphic options. The menu expands in flow instead of obscuring neighboring rows; arrow remains inside trigger.
- Preview: inset 70px group wells and raised 46px Hardware/Software buttons with selected inset state.
- Responsive changes scoped to Image Sorting on tablet and mobile.
- No changes to other assessment subtypes, type registry, question data or draft storage.

Install:
cd ~/Desktop/assessments/web
unzip -o ~/Downloads/Image_Sorting_Question_Icon_Add_Items_Dropdown_Mobile_Fix.zip -d .
npm run build
npm run dev

Check before Git push. TSX parser and CSS parser passed. A TypeScript check of the available project snapshot reported no errors in the changed Image-Based files, but 18 existing errors elsewhere. A full build against your current Mac project was not available.
