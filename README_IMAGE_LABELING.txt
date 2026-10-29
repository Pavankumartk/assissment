IMAGE LABELING — UPDATED FILES ONLY

Adds "Image Labeling" to the Image-Based Assessment subtype dropdown.
The existing route handles collapsed/expanded creation, and the existing
/assessments/create/image-based-preview route renders the labeling preview.

Only five Image-Based files are replaced. Other assessment types, shared
registrations, global CSS, routes, and learner viewer are unchanged.

Download ZIP to ~/Downloads, then from your Mac:

cd ~/Desktop/assessments/web
unzip -o ~/Downloads/Image_Labeling_Subtype_Creator_Preview_Updated_Files_Only.zip -d .
npm run build
npm run dev

Select Image-Based > Create Questions > Sub type > Image Labeling.
Upload a PNG/JPG/WebP image, click it to create 2–6 pins, enter a unique
label for every pin and optionally add extra unused labels. Open Preview
Questions to test the labels. Back to Question returns to the editor.

NOTE: Uploaded project snapshot has existing unrelated TypeScript errors.
This patch does not add production learner labeling submission/scoring.
Figma export styling was applied to scoped Image Labeling classes; visual
pixel-by-pixel verification against your running Mac app is still needed.
