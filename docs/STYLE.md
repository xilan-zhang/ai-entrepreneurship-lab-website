# Style contract

The visual rules for the lab website. Tokens live at the top of `styles.css`; change them there, not page by page.

## Direction

Revised November 2, 2026, replacing the October 30 photo-hero draft (Xilan agreed that the design could change substantially).

- **One bold moment.** The homepage opens on a dark field with the research globe and the lab name. Everything after it is quiet: white and mist bands, a left-hand section column, large serif statements and generous space.
- **The research is the imagery.** Project tiles and project pages lead with the papers' own figures (event study, financing regimes, program adoption) or field photographs, not stock pictures.
- **Restraint.** No cards with shadows, no small uppercase labels, no decorative gradients outside the opening field. Arrows only on "back" and external links.

No text, logos or photographs are copied from other lab sites.

## Type

| Role | Face | Use |
| --- | --- | --- |
| Display and headings | Newsreader, weights 300–400 | Lab name, page titles, section titles, statements, project and study titles, venues in italics |
| Text | Public Sans, 400–600 | Paragraphs, navigation, labels, buttons, figure text |

Both are under the SIL Open Font License and stored in `assets/fonts/`, so the pages work offline. Body text is 17px. Large titles are light (300–350) with tight tracking; section titles carry a short cardinal rule beneath them.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--cardinal` | `#8c1515` | Stanford Cardinal: links, primary button, rules, status text, figure accents |
| `--ember` | `#e0565b` | Cardinal lifted for the dark field: globe points, rule and arcs |
| `--ink` | `#2e2d29` | Stanford Black: text and headings |
| `--night` | `#1c1b19` | The homepage field and the footer |
| `--mist` | `#f3f3f1` | Light bands, page headings, figure panels |
| `--line` | `#e1dfdb` | Hairlines |
| `--stone` | `#7f7776` | Captions and metadata |

Palo Alto `#175e54`, Lagunita `#007c92`, Sandstone and Archway appear only inside figures and status tags. No orange.

## Layout

- Content column 1320px with a 20–56px gutter.
- Homepage: dark field with globe, About, Research (two lines of work, five project tiles), Selected publications (mist), People, dark footer with contact.
- Sections use a 3/9 split: section title on the left (sticky on wide screens), content on the right. It collapses to one column below 980px.
- Project pages: mist heading with the title on the left and the paper's figure on the right, then 3/9 sections, then a "Next project" link. The project order is set in the footer and the next-project links.
- People: one large portrait for faculty, then a three-column grid; the "More members" placeholder stays last. Portraits are processed to one standard (see below). List current professional roles only.

## Portraits

`assets/people/<name>-portrait.jpg`, 600 × 750. Each is cut out from its source, framed so the face sits at the same height and size, and placed on the shared light backdrop, so nobody's head is cropped and backgrounds do not compete. Keep the source photo next to it and record it in `docs/SOURCES.md`.

## Research globe

- The globe sits in the homepage's opening field: land as a fine dot screen, countries with studies in cardinal, raised arcs from Stanford. It turns slowly on its own (about 80 seconds per turn). Colours are the `--globe-*` tokens.
- Every point needs a public source. Mark entries from internal records "To confirm" (`confirm: true` in `assets/js/research-data.js`) until the authors approve them.
- The caption under the buttons shows the place nearest the front of the visible part, with its study count and a link.
- Each point links straight to that place's research: its own page if there is one (`href`), otherwise `research.html#place-<id>`.
- Dragging turns the globe; hovering a point pauses on it. All motion stops when the visitor's system asks for reduced motion.

## Research data

- `assets/js/research-data.js` is the single source for the globe, the homepage's selected publications and the Research page list. A study that spans several places lists the extra places in `alsoPlaces`.
- Status labels: Published, Under review, Working paper, In progress, Planned, Under discussion, Funded project, Details to add. Do not describe planned work as under way, and do not state journal review stages such as R&R; show unpublished manuscripts as Working paper.
- The Research page list can be filtered by status and arranged by year or by place. Links to `#place-<id>` open the place view.

## Figures

Inline SVG, drawn with the `fig-*` classes in `styles.css`. One sentence of `<desc>` per figure. Illustrations that are not data say so inside the figure and in the caption.

## Checks before merging

- Preview the homepage, Research page and each project page at 1440 px, at 1280 × 720 and at 390 px. Nothing should scroll sideways.
- Keep the photo credits and the `docs/SOURCES.md` entries in step with any image change.

## Writing

Plain English, specific research questions, no promotional claims. Follow `CONTRIBUTING.md` for what may be stated about research status.
