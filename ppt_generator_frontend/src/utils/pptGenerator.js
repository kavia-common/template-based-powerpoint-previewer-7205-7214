import PptxGenJS from "pptxgenjs";
import { normalizeBullets } from "./validators";

/**
 * Notes:
 * - Full .pptx template parsing is intentionally not implemented here (browser-only + complexity).
 * - For uploaded .pptx templates, we keep the file in session and show a graceful fallback:
 *   users can import a JSON schema or use Demo Templates to generate slides that approximate layouts.
 */

function slideSizeFromAspect(aspect) {
  if (aspect === "LAYOUT_4X3") return "LAYOUT_4X3";
  return "LAYOUT_WIDE";
}

function addTopAccent(slide, theme) {
  // Add a subtle top bar accent
  slide.addShape(PptxGenJS.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.35,
    fill: { color: theme.colors.primary.replace("#", "") },
    line: { color: theme.colors.primary.replace("#", "") },
  });
}

function addTitle(slide, text, theme) {
  slide.addText(text || " ", {
    x: 0.7,
    y: 0.55,
    w: 12,
    h: 0.8,
    fontFace: "Inter",
    fontSize: 34,
    bold: true,
    color: theme.colors.text.replace("#", ""),
  });
}

function addSubtitle(slide, text) {
  slide.addText(text || " ", {
    x: 0.7,
    y: 1.4,
    w: 12,
    h: 0.6,
    fontFace: "Inter",
    fontSize: 18,
    color: "475569",
  });
}

function addBodyText(slide, text) {
  slide.addText(text || " ", {
    x: 0.9,
    y: 1.7,
    w: 11.6,
    h: 4.8,
    fontFace: "Inter",
    fontSize: 16,
    color: "111827",
    valign: "top",
  });
}

function addBullets(slide, bullets) {
  const clean = normalizeBullets(bullets);
  if (clean.length === 0) {
    slide.addText(" ", { x: 0.9, y: 1.7, w: 11.6, h: 4.8 });
    return;
  }
  slide.addText(
    clean.map((t) => ({ text: t, options: { bullet: { indent: 18 }, hanging: 6 } })),
    {
      x: 0.9,
      y: 1.75,
      w: 7.2,
      h: 4.8,
      fontFace: "Inter",
      fontSize: 18,
      color: "111827",
      valign: "top",
    }
  );
}

function addImage(slide, imageDataUrl, opts) {
  if (!imageDataUrl) return;
  slide.addImage({ data: imageDataUrl, ...opts });
}

// PUBLIC_INTERFACE
export async function generatePptx({ template, content, theme }) {
  /** Generates a PPTX from a JSON schema template and user content (all in-browser). */
  const pptx = new PptxGenJS();
  pptx.layout = slideSizeFromAspect(template.aspect);

  pptx.author = "PPT Template Previewer";
  pptx.company = "In-browser";
  pptx.subject = template.name || "Generated Deck";

  for (const slideDef of template.slides || []) {
    const slide = pptx.addSlide();
    addTopAccent(slide, theme);

    const data = content?.[slideDef.id] || {};

    const title = String(data.title || slideDef.name || " ");
    const subtitle = String(data.subtitle || " ");
    const summary = String(data.summary || " ");

    switch (slideDef.layout) {
      case "title": {
        addTitle(slide, title, theme);
        addSubtitle(slide, subtitle);
        break;
      }
      case "title+content": {
        addTitle(slide, title, theme);
        addBodyText(slide, summary || String(data.content || " "));
        break;
      }
      case "title+bullets": {
        addTitle(slide, title, theme);
        addBullets(slide, data.bullets);
        break;
      }
      case "image-left": {
        addTitle(slide, title, theme);
        addBullets(slide, data.bullets);
        addImage(slide, data.image_1, { x: 8.4, y: 2.0, w: 4.2, h: 3.8 });
        break;
      }
      case "image-right": {
        addTitle(slide, title, theme);
        // bullets left, image right
        addBullets(slide, data.bullets);
        addImage(slide, data.image_1, { x: 8.4, y: 2.0, w: 4.2, h: 3.8 });
        break;
      }
      default: {
        addTitle(slide, title, theme);
        // Render any first multiline/text field as body, fallback
        const anyText = Object.values(data).find((v) => typeof v === "string" && v.trim());
        addBodyText(slide, String(anyText || " "));
        break;
      }
    }
  }

  return pptx;
}

// PUBLIC_INTERFACE
export async function downloadPptx({ template, content, theme, fileName }) {
  /** Generates PPTX and triggers download in the browser. */
  const pptx = await generatePptx({ template, content, theme });
  const safe =
    (fileName || template.name || "presentation")
      .replace(/[^\w\- ]+/g, "")
      .trim()
      .replace(/\s+/g, "_") || "presentation";
  await pptx.writeFile({ fileName: `${safe}.pptx` });
}
