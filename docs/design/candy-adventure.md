# Candy adventure UI

User direction: Candy Crush inspiration; playful map with calmer reading screens. Original Kislap assets and product behavior remain authoritative. Mode: Operate. Implemented directly in the existing React project.

## Direction contract

THESIS: Make selecting a story feel like entering a colorful reading adventure, while giving the reading sentence a quiet surface.

OWN-WORLD: Glossy raspberry controls, sky-blue map, mint hills, violet and blue story markers. Baloo 2 gives controls a rounded character; Andika carries reading text. Keep Ningning and the original Filipino sticker artwork.

STORY: Meet Ningning, choose one of three stories, read aloud, and return to view locally earned stars and stickers. No invented progress or artificial locked stories.

FIRST VIEWPORT: Desktop pairs a greeting and Play action with a winding map; mobile stacks the greeting above the map, with alternating horizontal story labels. The signature interaction is the glossy numbered marker lifting on hover and pressing into place on activation. Honor reduced motion.

FORM: The explicitly requested Candy Crush inspiration overrides the exploratory seed assignment (a9a64872). The user confirmed the playful-map/calm-reading balance. No generated comp or new raster assets were needed; existing vector art remains local.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Verification

- Production build and all 117 existing tests pass.
- Lint has only the existing React Fast Refresh warning in src/i18n/index.tsx.
- Isolated Chromium checks at 1440, 768, 390, and 320 pixels cover story navigation, reading view, six sticker slots, bilingual switching, settings persistence, practice empty state, and microphone screen navigation. No page errors or horizontal page overflow.
- Two batched screenshot rounds: corrected narrow-map label collisions and night-mode accents. Independent visual review disposition: ship, with no material defects in the supplied captures.
- Mechanical design detector returned no findings.
- Screenshots and the local verification runner are in the ignored .playwright-mcp directory.

Microphone hardware, recognition quality, and voice-driven Word Pop are not validated by the UI checks. Word Pop now offers the saved practice-word view and selection controls; it does not award progress for clicking words. Reading/session logic was updated concurrently by another contributor and preserved.
