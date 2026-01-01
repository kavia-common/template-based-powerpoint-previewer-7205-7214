// PUBLIC_INTERFACE
export function getFeatureFlags() {
  /** Parses REACT_APP_FEATURE_FLAGS as comma-separated flags. Example: "demo-templates". */
  const raw = process.env.REACT_APP_FEATURE_FLAGS || "";
  const flags = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  return {
    demoTemplates: flags.has("demo-templates") || flags.has("demo_templates"),
  };
}
