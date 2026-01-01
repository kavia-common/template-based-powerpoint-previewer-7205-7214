// PUBLIC_INTERFACE
export function validateTemplateContent(template, content) {
  /**
   * Validates that required fields are filled.
   * Returns an array of error objects: { slideId, fieldKey, message }.
   */
  const errors = [];
  for (const slide of template.slides || []) {
    for (const field of slide.fields || []) {
      if (!field.required) continue;
      const value = content?.[slide.id]?.[field.key];
      const isEmpty =
        value == null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.filter((x) => String(x || "").trim()).length === 0);
      if (isEmpty) {
        errors.push({
          slideId: slide.id,
          fieldKey: field.key,
          message: `“${field.label || field.key}” is required.`,
        });
      }
    }
  }
  return errors;
}

// PUBLIC_INTERFACE
export function normalizeBullets(bullets) {
  /** Trims and removes empty bullet items. */
  if (!Array.isArray(bullets)) return [];
  return bullets.map((b) => String(b || "").trim()).filter(Boolean);
}
