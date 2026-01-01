const STORAGE_KEY = "ppt_generator_session_v2";

/**
 * Notes:
 * - v2 adds fields:
 *   - uploadedPptxTemplate: { name, size, lastModified } (metadata only; no parsing)
 *   - globalFirstSlide: { enabled, imageDataUrl }
 */

// PUBLIC_INTERFACE
export function loadSession() {
  /** Loads last session from localStorage, or null if none/invalid. Performs light migration from older versions. */
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // Migrate from v1 if present
    const v1Raw = localStorage.getItem("ppt_generator_session_v1");
    if (!v1Raw) return null;

    const v1 = JSON.parse(v1Raw);

    // Map old keys to new where possible
    const migrated = {
      uploadedPptxTemplate: v1.pptxTemplateFileName
        ? { name: v1.pptxTemplateFileName, size: null, lastModified: null }
        : null,
      activeTemplate: v1.activeTemplate || null,
      content: v1.content || {},
      globalFirstSlide: null,
    };

    // Save migrated into v2 key so future loads are consistent
    saveSession(migrated);
    return migrated;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function saveSession(session) {
  /** Saves current session to localStorage. */
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore quota errors
  }
}

// PUBLIC_INTERFACE
export function clearSession() {
  /** Clears saved session from localStorage. */
  try {
    localStorage.removeItem(STORAGE_KEY);
    // also clear old key
    localStorage.removeItem("ppt_generator_session_v1");
  } catch {
    // ignore
  }
}
