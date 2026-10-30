# Contributing

## Make a change

1. Create a branch with a descriptive name, such as `content/uganda-description` or `design/mobile-header`.
2. Edit the relevant HTML or CSS file. Keep changes focused so they are easy to review.
3. Preview the affected pages in a browser at desktop and phone widths. Check that images load and links work.
4. Open a pull request against `main`. Explain what changed and include a screenshot if the layout changed.
5. Ask a labmate to review the pull request before merging.

If you edit locally, a typical sequence is:

```sh
git switch main
git pull --ff-only
git switch -c content/uganda-description
# Edit and preview the files, then:
git add uganda.html
git commit -m "Clarify Uganda research description"
git push -u origin content/uganda-description
```

Open the pull request using the link GitHub returns. For small text edits, GitHub's web editor can create the branch and pull request without a local Git setup.

## Current editorial decisions

- Keep the working-preview notice until the site is ready for an agreed public launch.
- The removed hero line “A research group in development” stays absent.
- People currently lists only Chuck Eesley. Other members remain placeholders until inclusion and roles are agreed.
- Do not restore the removed personal email or substitute another person's address without an agreed change.
- Keep the mentorship study, planned AI advice-presentation study and prospective savings-group pilot distinct. Preparation, proposals and observed findings have different meanings.
- Support research statements with sources. Do not turn early presentation scenarios, provisional budgets or unreported findings into established results.
- Preserve image credits and meaningful alt text. Record new image sources and permissions in `docs/SOURCES.md`.
- Use plain English, semantic heading levels, readable contrast and layouts that work on narrow screens.

## Repository scope

This repository contains website source and collaboration documentation. Keep participant records, private correspondence, manuscripts, funding drafts and credentials in their appropriate private project locations.

GitHub Pages and any other public deployment are separate from collaboration on this repository. Confirm the publication route, affiliation, branding and image permissions before a public launch.
