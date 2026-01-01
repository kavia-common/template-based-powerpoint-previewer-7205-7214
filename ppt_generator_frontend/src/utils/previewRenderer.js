/**
 * Produces lightweight preview "render models" for slides.
 * The UI renders them as HTML/CSS approximations (fast, no PPT rendering).
 */

// PUBLIC_INTERFACE
export function buildPreviewSlides({ template, content, theme }) {
  /** Returns an array of preview slide models with layout + normalized content. */
  const slides = [];
  for (const slideDef of template.slides || []) {
    const data = content?.[slideDef.id] || {};
    slides.push({
      id: slideDef.id,
      name: slideDef.name,
      layout: slideDef.layout,
      title: String(data.title || slideDef.name || ""),
      subtitle: String(data.subtitle || ""),
      summary: String(data.summary || data.content || ""),
      bullets: Array.isArray(data.bullets) ? data.bullets : [],
      image_1: data.image_1 || "",
      theme,
    });
  }
  return slides;
}
