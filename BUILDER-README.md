# Portfolio Builder

This builder starts from the exact `index.html` and `projects.html` in your supplied portfolio. Their content, embedded Computer Modern fonts, mathematical signal, current sizes, project selection, PDFs, and visit counter are the defaults. Opening the builder does not replace your pages.

## Everyday workflow

1. Extract this package into your existing portfolio folder, allowing the updated builder files to replace the older builder. Keep the entire `builder/` folder and `builder-defaults.js` beside `index-builder.html`.
2. Open **index-builder.html** in desktop **Chrome or Edge**.
3. Click **Open portfolio folder**. Select the folder containing your current `index.html` and `projects.html`, and allow browser access.
4. Customize the portfolio using the category menu on the left. Check the homepage and projects previews, and switch between Fit, Desktop, Tablet, and Phone.
5. Click **Save to folder** (or **Ctrl+S**). The builder updates the files in that same folder.
6. Review your changes, commit, and push with Git as usual.

Opening a folder loads its current pages. If you open the builder directly without selecting a folder, the included snapshot provides the exact starting version. Saving refreshes `builder-defaults.js`, so the next direct opening starts with your saved pages. When running from a local server, the builder also reads the adjacent current HTML pages automatically.

An older browser draft is offered with a separate **Restore draft** button. It never replaces your current files automatically.

## Customization controls

| Area | Controls |
| --- | --- |
| Name and hero | Name, designation, role line, headline lines, italic words, introduction, button label, footer and tribute |
| Content | About paragraphs, affiliations, research, nested research notes, tags, courses, course themes, semester, exploration, gallery introductions |
| Journey | Years, categories, roles, organizations, locations, descriptions, source link, visibility, order, duplication |
| Projects | Titles, marks, categories, descriptions, links, features, notes, homepage selection, ordering, duplication, visibility, uploaded tile images, standalone HTML app uploads |
| Documents | PDF upload, preview-image upload, title, metadata, description, page count, paper/resource classification, order, visibility |
| Equations | LaTeX, title, explanation, notation, attribution, source, visibility, ordering, individual equation scale |
| Sections | Show/hide, order, individual backgrounds and padding, navigation labels/links/order, extra text/image sections |
| Colors | Original palette plus eight presets, individual page/text/accent/signal/teaching colors, match teaching to page |
| Typography | Embedded Computer Modern, system font, 24 named font alternatives, independent body/headline/heading/card/label/equation scales, line height |
| Layout | Overall scale, content width, section spacing, gaps, card padding, preview height, grid columns, hero alignment and height, header position, border, corner radius, shadow, image aspect ratio and crop |
| Signal | Visibility, initial motion, motion/ripple buttons, movement strength, speed, mouse response, strand spacing, line thickness, signal visibility |
| Counter | Existing shared counter URL, label, colors, alignment, badge style and height |
| Metadata | Separate page titles, search description, canonical URL, search-indexing preference, favicon upload, social title/description/image |
| Advanced | Custom CSS applied to both pages, design JSON import/export, exported HTML design import, undo/redo, browser drafts, restore loaded version |

Fonts other than Computer Modern use fonts installed on the visitor's device, followed by a serif, sans-serif, or monospace fallback. Selecting a font does not download a new font file.

A section needs content to appear: add a resource PDF before enabling an empty teaching-PDF section. Additional custom sections appear after the existing sections. Custom section IDs must be unique letters, numbers, dashes, or underscores.

Uploaded HTML apps should be standalone files. For an app with other scripts, styles, or images, copy its complete folder into `apps/` and enter its relative URL instead. Upload a separate image for a PDF preview; this builder does not rasterize PDFs.

## What Save writes

- `index.html` and `projects.html`: current page content and styling. A completely unchanged page is preserved exactly.
- `portfolio-design.json`: editable content and builder settings.
- `builder-defaults.js`: refreshed starting pages and preview images.
- Referenced uploaded files: new images, PDFs, or standalone HTML apps.
- An ignore rule for local backups, if the rule is missing.

It keeps existing apps, PDFs, source files, and repository history. It does not delete old uploaded assets when you remove a card; you can remove unused files later through your usual file/Git workflow.

Before replacing existing files, Save copies their original bytes into `.portfolio-backups/<timestamp>/`. The builder refuses to overwrite a tracked target if it changed outside the editor after opening. If a write fails partway through, it attempts to restore the previous files and reports any restoration problem. Backups are available for manual recovery. Multi-file browser saves are not an operating-system transaction.

The pages still contain the original saved design data plus the updated builder settings. Updates are applied to the loaded HTML, so unrelated content and scripts remain. Editing a list rebuilds that list's cards from its editable data; manually coded additions inside that list should instead be added through the controls or custom CSS.

Saving changes files on your computer; **Git commit and push remain your next step**. No GitHub token is needed by the builder.

## If direct folder access is unavailable

Use **Download update ZIP**, then merge its contents into the existing portfolio directory. Keep your original `builder/`, `apps/`, `pdfs/`, and `previews/` folders. This update ZIP contains current pages, settings, refreshed defaults, and referenced new uploads; it is not a fresh copy of the complete app/PDF collection.

If Chrome or Edge blocks folder access for a directly opened file, run this in the portfolio folder:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Then open [the local builder](http://localhost:8000/index-builder.html). Stop the server with Ctrl+C when finished. No Python packages are needed for this fallback.

Browser folder access requires your explicit folder selection and permission. See [Chrome's File System Access documentation](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).

## Visit counter

The existing counter service and identifier are retained. Builder previews remove the counter request, so editing does not add visits. The published portfolio continues to use the same shared counter. Changing the identifier/path in the badge URL creates or targets a different count; the builder cannot set the service's historical count.

## Verification

The supplied pages match the packaged builder defaults byte for byte. JavaScript syntax, current design/LaTeX validation, relative asset references, directory-save backups, collision handling, stale-file protection, repeated-save behavior, and failure rollback were checked. Interactive browser/visual testing was not performed.
