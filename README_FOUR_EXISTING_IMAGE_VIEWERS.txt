FOUR EXISTING IMAGE-BASED VIEWERS — WIRED TO THE ASSESSMENT ROUTE

Source: the user's Imagematching.zip, not a new viewer design.

Included viewer components (their CSS files are copied byte-for-byte from the source ZIP):
- Image-Based Multiple Choice: viewer-flows/Imagebased/Page.tsx + image.css
- Image Matching: viewer-flows/Imagematching/Page.tsx + imagematch.css
- Image Sequencing: viewer-flows/Imagesequence/Page.tsx + imagesequence.css
- Image Sorting: viewer-flows/Imagesorting/Page.tsx + imagesorting.css

Integration:
- Viewer.tsx selects the appropriate existing viewer based on the saved image-based subtype.
- image-viewer-bridge.ts adapts imageBasedContentDraft fields to the original viewer page's data format.
- Existing Image Labelling viewer continues unchanged.
- Remaining subtypes continue using the existing fallback; no new design is introduced.
- Only Next.js imports, creator-draft reads, and Tools navigation paths are changed inside the supplied TSX files.
- The 4 Figma CSS files are not modified.
- Three existing SVG shapes copied to public/assets/viewericons because the source TSX references them.

INSTALL:
  cd ~/Desktop/assessments/web
  unzip -o ~/Downloads/Four_Existing_Image_Based_Viewers_Integrated_Only.zip -d .
  npm run build
  npm run dev

EXPECTED EXISTING FILES (from previous patches, not overwritten here):
  src/modules/assessments/components/type-specific/image-based/image-based-data.ts
  src/modules/assessments/components/type-specific/image-based/ImageFigmaViewer.tsx
  src/modules/assessments/components/type-specific/image-based/image-figma-viewer.css

SCOPE: Only 4 Image-Based viewer flows. No creator, Evaluation, Review, Result, or other assessment CSS changed.

VERIFICATION: TSX parsing, TypeScript check for modified Image-Based files and ZIP integrity passed in the available older project snapshot. The full latest Mac build and exact browser pixel comparison are unverified. Older snapshot has unrelated missing imports and TypeScript errors.

NOTE: The uploaded standalone viewers save their submit state independently; this update wires their viewer screens and saved question data. It does not redesign or replace the existing Result page.
