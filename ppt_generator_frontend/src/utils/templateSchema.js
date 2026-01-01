/**
 * JSON-based template schema (fallback when .pptx parsing is unavailable/heavy).
 *
 * A template is a list of slides. Each slide has a layout hint and fields.
 * Fields can be: text, bullets, image.
 *
 * This enables placeholder-based editing and PPT generation entirely client-side.
 */

// PUBLIC_INTERFACE
export function getSampleTemplates() {
  /** Returns built-in sample templates (Pitch Deck + Report). */
  return [
    {
      id: "demo_pitch_deck",
      name: "Pitch Deck (Demo)",
      description: "Classic pitch: title, problem, solution, traction, team.",
      aspect: "LAYOUT_WIDE",
      slides: [
        {
          id: "s1",
          name: "Cover",
          layout: "title",
          fields: [
            { key: "title", label: "Title", type: "text", required: true },
            { key: "subtitle", label: "Subtitle", type: "text" },
          ],
        },
        {
          id: "s2",
          name: "Problem",
          layout: "title+bullets",
          fields: [
            { key: "title", label: "Slide title", type: "text", required: true },
            { key: "bullets", label: "Key points", type: "bullets" },
          ],
        },
        {
          id: "s3",
          name: "Solution (Image Right)",
          layout: "image-right",
          fields: [
            { key: "title", label: "Slide title", type: "text", required: true },
            { key: "bullets", label: "Highlights", type: "bullets" },
            { key: "image_1", label: "Product image", type: "image" },
          ],
        },
        {
          id: "s4",
          name: "Traction",
          layout: "title+bullets",
          fields: [
            { key: "title", label: "Slide title", type: "text", required: true },
            { key: "bullets", label: "Metrics", type: "bullets" },
          ],
        },
        {
          id: "s5",
          name: "Team",
          layout: "image-left",
          fields: [
            { key: "title", label: "Slide title", type: "text", required: true },
            { key: "bullets", label: "Team highlights", type: "bullets" },
            { key: "image_1", label: "Team photo", type: "image" },
          ],
        },
      ],
    },
    {
      id: "demo_report",
      name: "Report (Demo)",
      description: "Executive summary + section pages; good for weekly reports.",
      aspect: "LAYOUT_WIDE",
      slides: [
        {
          id: "r1",
          name: "Executive Summary",
          layout: "title+content",
          fields: [
            { key: "title", label: "Title", type: "text", required: true },
            { key: "summary", label: "Summary", type: "multiline" },
          ],
        },
        {
          id: "r2",
          name: "Highlights",
          layout: "title+bullets",
          fields: [
            { key: "title", label: "Slide title", type: "text", required: true },
            { key: "bullets", label: "Highlights", type: "bullets" },
          ],
        },
        {
          id: "r3",
          name: "Risks (Image Right)",
          layout: "image-right",
          fields: [
            { key: "title", label: "Slide title", type: "text", required: true },
            { key: "bullets", label: "Risks", type: "bullets" },
            { key: "image_1", label: "Chart / Screenshot", type: "image" },
          ],
        },
      ],
    },
  ];
}

// PUBLIC_INTERFACE
export function createEmptyContentForTemplate(template) {
  /** Creates an initial content object (per-slide, per-field) for a template schema. */
  const content = {};
  for (const slide of template.slides) {
    content[slide.id] = {};
    for (const field of slide.fields) {
      if (field.type === "bullets") content[slide.id][field.key] = [""];
      else content[slide.id][field.key] = "";
    }
  }
  return content;
}

// PUBLIC_INTERFACE
export function toDownloadableJson(template) {
  /** Stringify a template schema for export/download. */
  return JSON.stringify(template, null, 2);
}

// PUBLIC_INTERFACE
export function parseTemplateJson(jsonText) {
  /** Parses and lightly validates a JSON template schema string. Throws on invalid JSON. */
  const obj = JSON.parse(jsonText);
  return obj;
}

// PUBLIC_INTERFACE
export function getPlaceholdersFromTemplate(template) {
  /**
   * Returns placeholder-like keys (e.g., {{title}}) useful for user guidance.
   * This is informational for the fallback JSON flow.
   */
  const list = [];
  for (const slide of template.slides || []) {
    for (const field of slide.fields || []) {
      if (field.type === "bullets") {
        list.push(`{{${field.key}_1}}`, `{{${field.key}_2}}`, `{{${field.key}_n}}`);
      } else {
        list.push(`{{${field.key}}}`);
      }
    }
  }
  return Array.from(new Set(list));
}
