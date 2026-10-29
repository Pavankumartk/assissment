TARGETED VIEWER CORRECTIONS - 29 OCT 2026

Image Dropdown: only the screenshot areas (shuffle/hint/Bloom’s/flag/navigation/actions/tools) receive scoped neumorphic styles. The rest of the Figma viewer is unchanged.

Image Sequencing: normalizes invalid/missing durations, uses creator Shuffle Steps option, starts in a stable shuffled order when enabled, keeps up/down controls active except at the actual list boundaries or after submission/time expiry, and counts interacted sequences as answered even if incorrect. Correctness scoring is still based on the saved correct order. The existing Submit and Submitted popups remain unchanged.

No other assessment pages, shared popups, creator files or routes are changed.

Install from the directory containing package.json:
  unzip -o ~/Downloads/Image_Dropdown_Bottom_UI_Sequencing_Arrows_Fix_Only.zip -d .
  npm run build

If you previously submitted this exact test, use its existing Retry flow for a fresh attempt: submitted tests correctly keep their controls locked.
