# Style contract

The visual rules for the lab website. Tokens live at the top of `styles.css`; change them there, not page by page.

## Direction

Chosen by Xilan on October 30, 2026:

- **Overall:** a calm, editorial look close to the [AI Governance Lab](https://aigovlab.stanford.edu/): a photograph hero, then light bands with generous space. Avoid very high contrast, such as large dark bands next to white.
- **Layout ideas:** from her whole-look picks (RegLab, Politics and Social Change Lab, MIT Initiative on the Digital Economy, AI Governance Lab): a full-width photo hero with the lab name over it, a single long homepage, and thin stripes as a quiet graphic motif on page headings.
- **Type:** the AI Governance Lab pairing, Newsreader with Public Sans.
- **Colour:** Stanford colours as STVP uses them. No orange.

No text, logos or photographs are copied from any of these sites.

## Type

| Role | Face | Use |
| --- | --- | --- |
| Headings | Newsreader, weight 500 | Page and section titles, wordmark, card and study titles |
| Body | Public Sans, 400–600 | Paragraphs, navigation, labels, buttons |

Both are under the SIL Open Font License and are stored in `assets/fonts/`, so the pages work offline. Body text is 17px. Section titles have a short cardinal rule beneath them. No small uppercase labels above titles.

## Colour

Core palette, from Stanford's identity colours as used on stvp.stanford.edu:

| Token | Value | Stanford name | Use |
| --- | --- | --- | --- |
| `--cardinal` | `#8c1515` | Cardinal Red | Accent: links, primary button, rules, map points |
| `--cardinal-dark` | `#820000` | Cardinal Dark | Button hover |
| `--ink` | `#2e2d29` | Stanford Black | Body text and headings |
| `--ink-soft` | `#53565a` | Cool Grey | Secondary text |
| `--stone` | `#7f7776` | Stone | Captions and metadata |
| `--fog` | `#f4f4f4` | Fog | Footer |
| `--warm` | `#f7f4f0` | (light stone tint) | Alternate bands: map, People, page headings |

Accents, used sparingly for marks and never for large areas: Palo Alto `#175e54` (Stanford on the map, a direction card), Lagunita `#007c92` (in-progress tags, focus outline), Sandstone `#d2c295` and Archway `#5d4b3c` (under-review tags). Do not use Poppy or other oranges.

The only dark area is the photo hero, shaded with a translucent Stanford Black gradient.

## Layout

- Homepage rhythm: photo hero, white (About), warm (research globe), white (Research), warm (People), white (Stay in Touch), fog footer.
- Content column 1200px with a 20–40px gutter.
- Hero: Huang Engineering Center photograph, centred serif title, short white rule, one short line ("Rethinking entrepreneurship in the age of AI."), two buttons. Keep the photo credit visible.
- No oversized background words.
- Cards: white, 1px warm-grey border, 8px radius, no shadows.
- People: a grid of cards with round portrait photos (`assets/people/`). Use a monogram when there is no photo. List current professional roles only, not proposed lab roles. Order: faculty, then postdoctoral fellows, then everyone else by last name; the add-members card stays last.

## Research map

- Every point needs a public source. Mark entries from internal records "To confirm" (`confirm: true` in `assets/js/research-data.js`) until the authors approve them.
- Status labels: Published, Under review, Working paper, In progress, Planned, Under discussion, Funded project, Details to add. Do not describe planned work as under way, and do not state journal review stages such as R&R; show unpublished manuscripts as Working paper.
- The map is a globe on the homepage, not a separate page. It is large, runs off the right edge of the section (and slightly off the top and bottom), and turns slowly on its own (about 80 seconds per turn). The card beside it shows the place nearest the front of the visible part. No totals and no place buttons.
- Dragging turns the globe; hovering a point pauses on it.
- Each point links straight to that place's research: its own page if there is one (`href` in the data, e.g. `uganda.html`), otherwise its section on `research.html#place-<id>`.
- Light globe: warm-white sea, warm-grey land, study countries tinted pale cardinal, dashed cardinal arcs from Stanford. Stanford is the Palo Alto green point. Colours are the `--globe-*` tokens in `styles.css`.
- All motion stops when the visitor's system asks for reduced motion.

## Research data

- `assets/js/research-data.js` is the single source for the globe and the Research page list (`research.html`, grouped by place, with `#place-<id>` anchors). The Research page has no method note.
- Authors appear in the order the authors use. Xilan reviewed every entry on October 30, 2026 (keep, delete or reorder authors); keep that review in mind before re-adding deleted items.
- To add or correct a study, edit the data file and check both pages in a browser.

## Checks before merging

- Preview the homepage, Research page and Uganda page at desktop width and at 390 px. Nothing should scroll sideways, and the globe text and card should not overlap at short window heights (for example 1280 × 720).
- Keep the photo credits and the `docs/SOURCES.md` entries in step with any image change.

## Writing

Plain English, specific research questions, no promotional claims. Follow `CONTRIBUTING.md` for what may be stated about research status.
