# Current portfolio builder

Open `index-builder.html` and follow [BUILDER-README.md](BUILDER-README.md). This builder loads the current supplied pages, adds expanded customization, and saves updates into your chosen local portfolio folder. The documentation below describes the earlier portfolio package.

---

# Adnan Bashir — Portfolio + Website Builder

## Start here

**Open index-builder.html to edit your website.** It is a standalone file: no server, installation, account, or API key is needed. The builder starts with your current portfolio and its original color palette.

Open **index.html** to view the website, or **projects.html** to view the eight-project collection. Keep **pdfs/** and **previews/** beside these pages so the framed document tiles and downloads work. The standalone builder includes the seven supplied PDFs and their preview images for later ZIP exports.

## Change colors and content

1. In **Colors**, choose one of eight palettes or adjust individual colors. Both signal colors, text, accents, the main background, and the teaching panel are editable.
2. In **Content**, edit your name, introduction, biography, research, courses, project-page introduction, and footer. Headings support line breaks; list fields use one item per line.
3. In **Projects**, edit project titles, descriptions, notes, and links. Choose whether to include each project and whether to feature it on the homepage. Move projects up or down, or add and remove cards.
4. In **PDFs**, edit titles, categories, descriptions, page counts, links, and gallery placement. Reorder or hide documents. For a new document, supply a PDF link and a first-page PNG, JPEG, or WebP image link; upload those files with the website, or use existing HTTPS URLs. The builder bundles the seven supplied documents; it does not fetch new URLs.
5. In **Math**, edit the LaTeX, card copy, variable definitions, conditions, and source attribution. Reorder, hide, remove, or add equations. Standard LaTeX is rendered as native MathML; current browsers display it offline. Expand **Inside the equation** on the website for notation and sources.
6. Use the homepage/projects and desktop/tablet/mobile selectors above the live preview. Scroll and move the pointer inside the preview to interact with the signal. External app links open from the exported website.

**Original ember** always restores the original colors. The **Original website** entry in Versions restores the original content and colors together.

## Save now, edit later

- Your draft saves automatically in the current browser.
- **Save version** creates a named snapshot. Enter an optional name in the Versions tab, or use the automatic name. Up to 20 snapshots are retained; the original design is always available separately.
- Restoring a version or opening a design saves the current draft into Versions first.
- **Export → Editable design · JSON** downloads a portable backup of the current content, colors, and project settings.
- Later, open index-builder.html and click **Open design** to choose your JSON file. You can also open an index.html or projects.html previously exported by this builder: both contain the complete editable design.
- Browser storage belongs to that browser and can be cleared. Keep a downloaded JSON copy when you want to preserve a design across computers or browser resets.
- If browser storage is blocked or full, the editor reports it and leaves your current work available for download. If a restore-point save fails, the earlier stored draft is preserved; subsequent edits are labeled session-only until a save succeeds. Incomplete drafts can be saved and restored, while website exports require valid project links.

The included **portfolio-design.json** is a backup of the current starting design. Open design supports this builder's design format and its exported HTML pages; it is not an importer for arbitrary websites.

## Publish changes on GitHub Pages

For your first upload, extract this complete ZIP and upload its contents to the repository. Keep the **apps/** folder structure.

For later edits, choose **Export → Website pages ZIP** in the builder. It downloads:

- index.html — your updated homepage
- projects.html — your matching project collection
- portfolio-design.json — editable design backup
- pdfs/ — the seven bundled original documents
- previews/ — their actual first-page images
- .nojekyll
- READ-ME.txt

Replace the two HTML pages and copy **pdfs/** and **previews/** into your repository. **Keep your existing apps/ folder**. The builder’s update ZIP contains the pages, settings, and the seven supplied documents and previews; it does not repackage the app files. Those eight apps are included in this complete portfolio package. When you add a new project card, upload its app or point the card at an existing external URL.

The exported homepage and projects page contain their own CSS, native MathML, and interactive signal code. Their document images and downloads use the companion previews/ and pdfs/ folders. They do not need a separate stylesheet or signal.js. Updating a palette in the builder keeps both pages consistent when you export them together. The editor does not change the styling inside the eight independent apps.

Keep index-builder.html and your design JSON wherever you prefer to edit; neither is required for the public website. Your previous unrelated styles.css and other project pages can stay in the repository.

For the main personal site, use **ml-adnan-bashir.github.io**. In repository Settings → Pages, select **Deploy from a branch**, **main**, and **/ (root)**. The address will be https://ml-adnan-bashir.github.io/ when GitHub finishes deployment. All internal project links are relative, so subdirectory project sites are also supported.

## Papers, diagrams, and teaching PDFs

All thumbnails show the actual first page, inside a responsive frame. A thumbnail opens the PDF in a new tab; each tile also has a download link. Source PDFs are copied without changes.

| Document | Pages | Website placement |
|---|---:|---|
| DRUM: A Real Time Detector for Regime Shifts in Data Streams via an Unsupervised, Multivariate Framework | 9 | Papers & diagrams |
| SegStream backbone flowchart | 1 | Papers & diagrams |
| NAT-ICS practice test with worked answers | 26 | Teaching resources |
| NAT-ICS analytical reasoning guide | 18 | Teaching resources |
| NET mathematics formula and trick book | 12 | Teaching resources |
| NET physics formula and trick book | 12 | Teaching resources |
| NET Benchmark MCQ strategy book | 221 | Teaching resources |

DRUM is credited to Adnan Bashir and Trilce Estrada, DaWaK 2023, LNCS 14148, pp. 294–302; DOI: https://doi.org/10.1007/978-3-031-39831-5_27 . The separate SegStream flowchart is labeled a research diagram.

The five teaching resources were selected from the uploaded website archive. Two overlapping math-revision versions and the invalid five-byte test.pdf placeholder were omitted. Original PDF content and branding are preserved.

## Mathematical notes

Six cards cover DRUM’s Lobo Change Score, Shannon capacity, Little’s law, Bayes’ rule, cross-entropy loss, and Shannon entropy. DRUM’s score is transcribed from Eq. (4), printed p. 296 / PDF page 3, with the variable and weight definitions from the paper. The other five are established foundations, clearly attributed and not presented as original research or claims about the DRUM implementation. Every card has a source link and expandable notation and model conditions.

The studio embeds KaTeX 0.16.11 for converting editable LaTeX to MathML. The public pages need no math CDN or JavaScript math renderer. KaTeX’s MIT notice is embedded in the builder and included in THIRD-PARTY-NOTICES.txt. JSZip is embedded for local ZIP generation. Supplied PDF data lives in the builder, outside design settings, so named versions remain compact. Older builder designs automatically acquire the new document and math sections while retaining their previous content and colors.

## Selected projects

| Project | Source from your archive | Main purpose |
|---|---|---|
| RAFTAR | speedtest.html | Download/upload speed and latency |
| ZARB | zarb.html | Tap-tempo BPM, history, and averages |
| Boundary & State Lab | bns.html | Time-series boundaries, states, and feature evidence |
| NET Practice Simulator | net_latest.html | Timed practice, grading, saved progress, and review |
| Urdu Word Cloud | death.html | Urdu typography, palettes, and animated layout |
| Enterprise Workspace | ERM.html | Tasks, planning, roles, and approvals |
| Cantt Events | ce.html | Hall bookings, a simulated fleet, and reports |
| Tilt Scale | scale.html | A calibrated phone-orientation experiment |

Only one assessment app is included. net_latest.html was selected for its complete grading and review workflow, five difficulty levels, resume support, and exports. The separate benchmark/checker versions and overlapping SegStream feature-selection page were not included.

## Project requirements

The portfolio and signal use no external libraries. Individual apps retain these requirements:

- RAFTAR transfers test data to/from Cloudflare speed-test endpoints. It requires internet and consumes data during tests. Failed measurements now show an error/retry state rather than a completed zero-speed result. The missing optional portrait uses the app's original inline avatar.
- ZARB measures the tempo of your taps, not audio files. The missing optional background-image pack has been omitted; the gauge themes and other settings remain.
- The SegStream lab embeds its dataset, analysis results, equations, and fonts. It needs a modern browser supporting DecompressionStream. It is the largest bundled app, around 16 MB uncompressed. Its source-package download is disabled by its existing offline initialization.
- The NET simulator loads KaTeX 0.16.10 from jsDelivr for math rendering.
- The Urdu word cloud embeds its Urdu fonts.
- Enterprise Workspace uses browser-local demonstration records. It has no backend or live enterprise connection.
- Cantt Events uses demonstration fleet data and browser-local bookings. It loads Leaflet 1.9.4, Chart.js 4.4.0, and jsPDF 2.5.1 from public CDNs, plus map tiles and optional fonts/photos.
- Tilt Scale is a physical-computing experiment, requiring a compatible phone, sensor permission, a balance setup, and a known calibration weight. Open it over HTTPS on GitHub Pages for sensor access.
- Several apps optionally load Google Fonts; system font fallbacks remain available.

## Validation

Checked standalone HTML and JSON export/reopen round trips, including Urdu, quotes, angle brackets, and literal script-closing text. Checked independent version snapshots, history limits, storage-failure handling, invalid import rejection, URL validation, all eight palettes, selected-project counts, local links, and inline JavaScript parsing. Also checked legacy design migration, valid MathML generation, document/math visibility controls, malformed LaTeX handling, all 14 bundled PDF/image asset bytes, PDF and image links, and unchanged hashes of the two supplied PDFs. First pages were rendered and inspected. No browser visual test, live network speed test, or phone-sensor measurement was performed.

The signal retains pointer bending, click/tap ripples, a pause control, and reduced-motion support. Between sections or project, document, and equation tile rows, the two ribbons curve inward and touch at the center. They open out again when the next section or row reaches the upper third of the viewport. Scrolling upward reverses the same motion. Section positions are remeasured after layout changes, including expanded research/course details and mobile reflow. The homepage and projects collection use the same saved palette.

DRUM publication metadata comes from the supplied paper. Other research descriptions do not claim publication status or benchmark results. Course themes are introductory summaries, not official syllabi.

Original portfolio and signal design, with appreciation for https://openai.com/index/gpt-6-astra/ . Independent personal website; no OpenAI affiliation or endorsement.
