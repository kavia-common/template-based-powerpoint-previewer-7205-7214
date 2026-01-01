import React from "react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function FieldHeader({ title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 12, color: "rgba(17,24,39,0.65)", marginTop: 2 }}>{subtitle}</div> : null}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function ContentEditor({ template, content, errors, onChangeContent }) {
  /** Renders a schema-driven editor for the current template. */
  if (!template) {
    return (
      <div className="Panel MainColumn" aria-label="Content editor">
        <div className="PanelHeader">
          <h2>Editor</h2>
          <span className="KbdHint">Load a template to start</span>
        </div>
        <div className="PanelBody">
          <div className="TemplateCard">
            <strong>No template uploaded</strong>
            <p>Upload a template (.pptx) from the left panel to enable the editor.</p>
          </div>
        </div>
      </div>
    );
  }

  const errorMap = new Map();
  for (const e of errors || []) errorMap.set(`${e.slideId}:${e.fieldKey}`, e.message);

  const setSlideField = (slideId, fieldKey, value) => {
    onChangeContent({
      ...content,
      [slideId]: {
        ...(content?.[slideId] || {}),
        [fieldKey]: value,
      },
    });
  };

  const onAddBullet = (slideId, fieldKey) => {
    const prev = content?.[slideId]?.[fieldKey] || [""];
    setSlideField(slideId, fieldKey, [...prev, ""]);
  };

  const onRemoveBullet = (slideId, fieldKey, index) => {
    const prev = content?.[slideId]?.[fieldKey] || [""];
    const next = prev.filter((_, i) => i !== index);
    setSlideField(slideId, fieldKey, next.length ? next : [""]);
  };

  const onChangeBullet = (slideId, fieldKey, index, value) => {
    const prev = content?.[slideId]?.[fieldKey] || [""];
    const next = prev.map((v, i) => (i === index ? value : v));
    setSlideField(slideId, fieldKey, next);
  };

  const onPickImage = async (slideId, fieldKey, file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setSlideField(slideId, fieldKey, dataUrl);
  };

  return (
    <div className="Panel MainColumn" aria-label="Content editor">
      <div className="PanelHeader">
        <h2>Editor</h2>
        <span className="Badge" aria-label="Template name badge">
          {template.name}
        </span>
      </div>

      <div className="PanelBody">
        {template.slides.map((slide) => (
          <div key={slide.id} className="TemplateCard" style={{ marginBottom: 14 }}>
            <FieldHeader title={slide.name} subtitle={`Layout: ${slide.layout}`} />
            <div className="Divider" />

            {slide.fields.map((field) => {
              const val = content?.[slide.id]?.[field.key];
              const err = errorMap.get(`${slide.id}:${field.key}`);

              if (field.type === "text") {
                return (
                  <div key={field.key} className="Field">
                    <label htmlFor={`${slide.id}_${field.key}`}>
                      {field.label} {field.required ? <span style={{ color: "var(--ocean-error)" }}>*</span> : null}
                    </label>
                    <input
                      id={`${slide.id}_${field.key}`}
                      className="Input"
                      value={val || ""}
                      onChange={(e) => setSlideField(slide.id, field.key, e.target.value)}
                      aria-label={`${slide.name} ${field.label}`}
                    />
                    {err ? <div className="HelpText" style={{ color: "var(--ocean-error)" }}>{err}</div> : null}
                  </div>
                );
              }

              if (field.type === "multiline") {
                return (
                  <div key={field.key} className="Field">
                    <label htmlFor={`${slide.id}_${field.key}`}>
                      {field.label} {field.required ? <span style={{ color: "var(--ocean-error)" }}>*</span> : null}
                    </label>
                    <textarea
                      id={`${slide.id}_${field.key}`}
                      className="Textarea"
                      value={val || ""}
                      onChange={(e) => setSlideField(slide.id, field.key, e.target.value)}
                      aria-label={`${slide.name} ${field.label}`}
                    />
                    {err ? <div className="HelpText" style={{ color: "var(--ocean-error)" }}>{err}</div> : null}
                  </div>
                );
              }

              if (field.type === "bullets") {
                const bullets = Array.isArray(val) ? val : [""];
                return (
                  <div key={field.key} className="Field">
                    <label>{field.label}</label>
                    <div style={{ display: "grid", gap: 8 }}>
                      {bullets.map((b, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <input
                            className="Input"
                            value={b}
                            onChange={(e) => onChangeBullet(slide.id, field.key, idx, e.target.value)}
                            aria-label={`${slide.name} bullet ${idx + 1}`}
                          />
                          <button
                            type="button"
                            className="Btn Small BtnGhost"
                            onClick={() => onRemoveBullet(slide.id, field.key, idx)}
                            aria-label={`Remove bullet ${idx + 1}`}
                            title="Remove"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="Btn Small"
                          onClick={() => onAddBullet(slide.id, field.key)}
                          aria-label={`Add bullet to ${slide.name}`}
                        >
                          + Add bullet
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (field.type === "image") {
                const dataUrl = typeof val === "string" ? val : "";
                return (
                  <div key={field.key} className="Field">
                    <label>{field.label}</label>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPickImage(slide.id, field.key, e.target.files?.[0])}
                        aria-label={`${slide.name} ${field.label} file input`}
                      />
                      {dataUrl ? (
                        <div style={{ display: "grid", gap: 6 }}>
                          <img
                            src={dataUrl}
                            alt={`${slide.name} preview`}
                            style={{
                              width: 180,
                              height: 110,
                              objectFit: "cover",
                              borderRadius: 12,
                              border: "1px solid rgba(17,24,39,0.12)",
                            }}
                          />
                          <button
                            type="button"
                            className="Btn Small BtnGhost"
                            onClick={() => setSlideField(slide.id, field.key, "")}
                            aria-label={`Remove ${field.label} from ${slide.name}`}
                          >
                            Clear image
                          </button>
                        </div>
                      ) : (
                        <span className="HelpText">No image selected.</span>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.key} className="HelpText">
                  Unsupported field type: <code>{field.type}</code>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
