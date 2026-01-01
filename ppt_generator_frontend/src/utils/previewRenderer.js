/**
 * Produces lightweight preview "render models" for slides.
 * The UI renders them as HTML/CSS approximations (fast, no PPT rendering).
 */

// PUBLIC_INTERFACE
export function buildPreviewSlides({ template, content, theme, globalFirstSlide }) {
  /** Returns an array of preview slide models with layout + normalized content. */
  const slides = [];

  if (globalFirstSlide?.enabled && globalFirstSlide?.imageDataUrl) {
    slides.push({
      id: "__global_first_slide__",
      name: "Global First Slide",
      layout: "image-only",
      title: "",
      subtitle: "",
      summary: "",
      bullets: [],
      image_1: globalFirstSlide.imageDataUrl,
      theme,
    });
  }

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
