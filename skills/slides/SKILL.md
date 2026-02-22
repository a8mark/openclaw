# Slides Skill — Google Slides Deck Builder

Create visually polished Google Slides presentations using the native Slides API.

## Location

`/home/autumn/openclaw/skills/slides/`

## Dependencies

- Node.js googleapis package (installed in skill directory)
- `gog` CLI for OAuth token management
- Environment: `GOG_KEYRING_PASSWORD`, `GOG_ACCOUNT`

## API Modules

- **`auth.js`** — OAuth2 authentication using gog's stored refresh token
- **`slides-api.js`** — Google Slides API helpers (create, batchUpdate, text boxes, tables, images, backgrounds, thumbnails)

## Workflow (MANDATORY — follow this order)

### Step 1: Research & Outline

- Gather all source material (Drive files, emails, repos, etc.)
- Create a detailed **slide outline** in a markdown file in the workspace
- Each slide entry MUST include:
  - **Slide number & title**
  - **Layout type** (title, content, two-column, image-heavy, data table, quote, etc.)
  - **Full text content** — every word that will appear on the slide
  - **Design notes** — colors, emphasis, positioning guidance
  - **Image instructions** — what images are needed (if any), with generation prompts or source URLs
- Present the outline to the user for review before proceeding

### Step 2: User Approval

- Wait for user to approve or request changes to the outline
- Iterate until approved
- This prevents wasted effort building the wrong thing

### Step 3: Build the Deck

- Use `slides-api.js` to create a native Google Slides presentation
- Build each slide according to the approved outline
- Use the helper functions:
  - `createPresentation(title, folderId)` — create in specified Drive folder
  - `createSlideRequest(slideId, layout)` — add slides (layouts: BLANK, TITLE, TITLE_AND_BODY, etc.)
  - `createTextBox(slideId, boxId, text, x, y, w, h, opts)` — add text with formatting
  - `setSlideBackground(slideId, color)` — set background color
  - `createTable(slideId, tableId, rows, cols, x, y, w, h)` — add tables
  - `insertTableText(tableId, row, col, text)` — populate table cells
  - `insertImage(slideId, imageId, url, x, y, w, h)` — add images from URLs
  - `rgb(r, g, b)` — color helper (0-255 range)
- Standard slide dimensions: 10" × 5.625" (widescreen 16:9)
- Always share the file with the requester as editor

### Step 4: Verify

- Use `getThumbnail(presentationId, pageId)` to export slide thumbnails
- Review thumbnails visually (via Canvas or image tool)
- Fix any issues

### Step 5: Deliver

- Email the requester with the Google Slides link
- Include a summary of what was built

## Design Principles

- **Dark backgrounds** for impact slides (title, key numbers, differentiators)
- **Light backgrounds** for content-heavy slides (text, tables, details)
- **Consistent color palette** — pick 2-3 brand colors and stick with them
- **Large fonts** for headings (28-44pt), readable body text (16-20pt)
- **White space** — don't cram everything; split across multiple slides if needed
- **Font pairing** — use a clean sans-serif (Roboto, Open Sans, Montserrat) for body, bold/condensed variant for headings

## Predefined Layouts

Available `predefinedLayout` values for `createSlideRequest`:

- `BLANK` — empty slide
- `CAPTION_ONLY` — caption at bottom
- `TITLE` — centered title + subtitle
- `TITLE_AND_BODY` — title bar + body content area
- `TITLE_AND_TWO_COLUMNS` — title + two body columns
- `TITLE_ONLY` — title bar only
- `SECTION_HEADER` — section divider
- `ONE_COLUMN_TEXT` — single text column
- `MAIN_POINT` — large centered text
- `BIG_NUMBER` — prominent number display

## Text Style Options

`createTextBox` opts:

- `fontSize` (number, in points)
- `fontFamily` (string)
- `color` (use `rgb()` helper)
- `bold` (boolean)
- `italic` (boolean)
- `alignment` ('START', 'CENTER', 'END', 'JUSTIFIED')

## Environment Setup

```bash
export GOG_KEYRING_PASSWORD=autumn2026
export GOG_ACCOUNT=autumn@autom8ly.com
```

Run scripts from skill directory:

```bash
cd /home/autumn/openclaw/skills/slides && node your-script.js
```

## Important Notes

- Always create **native Google Slides** (not PPTX uploads)
- Always **share with requester** as editor immediately after creation
- Always follow the **long-running task protocol**: acknowledge → build → notify
- The Slides API has a limit of ~100 requests per batchUpdate call; split larger decks into multiple batches
