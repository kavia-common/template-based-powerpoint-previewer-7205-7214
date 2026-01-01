import React, { useRef } from "react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

// PUBLIC_INTERFACE
export default function TemplateManager({
  uploadedPptxTemplate,
  onUploadPptx,
  globalFirstSlide,
  onSetGlobalFirstSlideImage,
  onToggleGlobalFirstSlideEnabled,
  onResetTemplate,
}) {
  /** Sidebar UI for the single-template upload flow + global first slide image configuration. */
  const pptxFileRef = useRef(null);
  const firstSlideFileRef = useRef(null);

  const handlePptxChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadPptx(file);
    e.target.value = "";
  };

  const handleFirstSlideImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    onSetGlobalFirstSlideImage(dataUrl);
    e.target.value = "";
  };

  const hasTemplate = Boolean(uploadedPptxTemplate?.name);

  return (
    <div className="Panel SidebarColumn" aria-label="Template manager">
      <div className="PanelHeader">
        <h2>Template</h2>
        <span className="Badge" aria-label="Template mode badge">
          Single upload
        </span>
      </div>

      <div className="PanelBody">
        <div className="TemplateCard" style={{ borderColor: "rgba(37,99,235,0.25)" }}>
          <strong>Upload Template (.pptx)</strong>
          <p>
            Upload one PPTX file and use it as the active template for this session. The app generates slides client-side and will
            prepend your Global First Slide during preview and download.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <button
              type="button"
              className="Btn BtnPrimary"
              onClick={() => pptxFileRef.current?.click()}
              aria-label="Upload template pptx"
            >
              Upload Template (.pptx)
            </button>

            {hasTemplate ? (
              <div className="Badge" aria-label="Uploaded template badge" style={{ justifyContent: "space-between" }}>
                <span>Active template: {uploadedPptxTemplate.name}</span>
                <button type="button" className="Btn Small BtnDanger" onClick={onResetTemplate} aria-label="Remove template">
                  Remove
                </button>
              </div>
            ) : (
              <div className="HelpText">No template uploaded yet.</div>
            )}
          </div>

          <input
            ref={pptxFileRef}
            type="file"
            accept=".pptx"
            style={{ display: "none" }}
            onChange={handlePptxChange}
            aria-label="PPTX file input"
          />
        </div>

        <div className="Divider" />

        <div className="TemplateCard">
          <strong>Global First Slide</strong>
          <p>Slide 1 for the whole deck. This image will be shown first in Preview and inserted as the first slide in the PPTX.</p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={Boolean(globalFirstSlide?.enabled)}
                onChange={(e) => onToggleGlobalFirstSlideEnabled(e.target.checked)}
                aria-label="Enable global first slide"
              />
              Enabled
            </label>

            <button
              type="button"
              className="Btn Small"
              onClick={() => firstSlideFileRef.current?.click()}
              aria-label="Replace global first slide image"
            >
              Replace image
            </button>

            <button
              type="button"
              className="Btn Small BtnGhost"
              onClick={() => onSetGlobalFirstSlideImage("")}
              aria-label="Clear global first slide image"
            >
              Clear
            </button>
          </div>

          <input
            ref={firstSlideFileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFirstSlideImageChange}
            aria-label="Global first slide image input"
          />

          <div style={{ marginTop: 10 }}>
            {globalFirstSlide?.imageDataUrl ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div className="HelpText">Preview:</div>
                <img
                  src={globalFirstSlide.imageDataUrl}
                  alt="Global first slide preview"
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    border: "1px solid rgba(17,24,39,0.12)",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                    background: "#fff",
                  }}
                />
              </div>
            ) : (
              <div className="HelpText">No image selected.</div>
            )}
          </div>
        </div>

        <div className="Divider" />

        <div className="HelpText">
          Tip: Upload your template first. The Editor, Preview, and Download will be enabled once a template is uploaded.
        </div>
      </div>
    </div>
  );
}
