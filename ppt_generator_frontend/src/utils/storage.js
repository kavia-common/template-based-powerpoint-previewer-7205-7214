const STORAGE_KEY = "ppt_generator_session_v1";

// PUBLIC_INTERFACE
export function loadSession() {
  /** Loads last session from localStorage, or null if none/invalid. */
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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
  } catch {
    // ignore
  }
}
