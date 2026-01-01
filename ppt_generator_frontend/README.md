# PPT Template Previewer (Frontend)

A React web app that lets you generate and preview PowerPoint decks **fully in the browser** (no backend).

## Quick start

```bash
npm start
```

Runs on **http://localhost:3000**.

## Supported flows

### 1) Recommended: JSON template schema flow
Because full `.pptx` parsing/mapping in a browser can be unreliable/heavy, this app supports a **simple JSON template schema** that defines:

- Slides
- Layout type (e.g. `title`, `title+bullets`, `image-right`)
- Fields (text, bullets, images)

From that schema, the editor dynamically renders the needed fields. The PPTX is generated with **PptxGenJS**.

**How to use**
1. In the left sidebar, click **Import JSON** (or paste JSON) to load a schema.
2. Fill out content in the editor.
3. Use **Download PPT** to generate and download a `.pptx`.
4. Use **Preview Fullscreen** to view a carousel preview.

**Export/import**
- Click **Export current** to download the current schema.
- Click **Download sample** to get an example schema file.

### 2) Optional: Upload `.pptx` template (graceful fallback)
You may upload a `.pptx` template file. In this implementation, the file name is stored and shown to the user; **the app does not map into real slide shapes**.

If you need reliable placeholder-driven generation, use the JSON schema flow.

## Demo templates (feature flag)

Enable Demo Templates gallery by setting:

- `REACT_APP_FEATURE_FLAGS=demo-templates`

Then you can load:
- Pitch Deck (Demo)
- Report (Demo)

## Preview notes

Preview is intentionally lightweight and fast:
- It renders slides as **HTML/CSS approximations**, not actual PPT rendering.
- Images are previewed using their uploaded data URL.

## Accessibility

- Buttons and inputs have `aria-label`s
- Fullscreen preview supports:
  - `Esc` to close
  - `←` / `→` to navigate slides
  - Full keyboard navigation via Tab

## Limitations

- No backend storage; state is kept in React and persisted to `localStorage`.
- Real `.pptx` template parsing/mapping is not implemented (complex in-browser). Use JSON schema templates for reliable results.
- Generated slides use simple layout recreation rather than editing a provided `.pptx` template file.

## Theme

Uses the **Ocean Professional** theme tokens:
- Primary: `#2563EB`
- Secondary/Success: `#F59E0B`
- Error: `#EF4444`
- Background: `#f9fafb`
- Surface: `#ffffff`
- Text: `#111827`
