import React, { useMemo, useRef, useState } from "react";
import { getSampleTemplates, parseTemplateJson, toDownloadableJson } from "../utils/templateSchema";
import { getFeatureFlags } from "../utils/featureFlags";

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// PUBLIC_INTERFACE
export default function TemplateManager({
  activeTemplate,
  uploadedPptxFileName,
  onUploadPptx,
  onSelectTemplate,
  onImportTemplateJson,
  onExportTemplateJson,
}) {
  /** Sidebar UI for template selection/upload + JSON schema fallback flow. */
  const flags = getFeatureFlags();
  const fileRef = useRef(null);
  const jsonFileRef = useRef(null);
  const [jsonText, setJsonText] = useState("");

  const demoTemplates = useMemo(() => (flags.demoTemplates ? getSampleTemplates() : []), [flags.demoTemplates]);

  const handlePptxChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadPptx(file);
    e.target.value = "";
  };

  const handleJsonFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onImportTemplateJson(text);
    e.target.value = "";
  };

  const handleImportJsonText = () => {
    onImportTemplateJson(jsonText);
  };

  const handleDownloadSample = () => {
    const sample = getSampleTemplates()[0];
    downloadTextFile("sample_template_schema.json", toDownloadableJson(sample));
  };

  return (
    <div className="Panel SidebarColumn" aria-label="Template manager">
      <div className="PanelHeader">
        <h2>Templates</h2>
        <span className="Badge" aria-label="Template mode badge">
          In-browser
        </span>
      </div>

      <div className="PanelBody">
        <div className="TemplateCard">
          <strong>Upload .pptx template (optional)</strong>
          <p>
            Browser-side parsing of real .pptx templates is limited. If parsing fails, use the JSON schema flow below.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="Btn Small"
              onClick={() => fileRef.current?.click()}
              aria-label="Upload pptx template"
            >
              Upload .pptx
            </button>
            {uploadedPptxFileName ? <span className="Badge">Loaded: {uploadedPptxFileName}</span> : null}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pptx"
            style={{ display: "none" }}
            onChange={handlePptxChange}
            aria-label="PPTX file input"
          />
          <div className="HelpText">
            Limitation: this app currently does <strong>not</strong> map into your real template’s slide shapes. Use JSON schema to
            reliably generate output.
          </div>
        </div>

        <div className="Divider" />

        <div className="TemplateCard">
          <strong>JSON template schema (recommended)</strong>
          <p>Import/export a simple template schema that defines slide layouts and placeholders.</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="Btn Small"
              onClick={() => jsonFileRef.current?.click()}
              aria-label="Import template schema from json file"
            >
              Import JSON
            </button>
            <button type="button" className="Btn Small" onClick={handleDownloadSample} aria-label="Download sample schema JSON">
              Download sample
            </button>
            <button
              type="button"
              className="Btn Small"
              onClick={() => onExportTemplateJson()}
              aria-label="Export current template schema"
              disabled={!activeTemplate}
            >
              Export current
            </button>
          </div>

          <input
            ref={jsonFileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleJsonFileChange}
            aria-label="JSON file input"
          />

          <div className="Field" style={{ marginTop: 10 }}>
            <label htmlFor="jsonSchemaText">Or paste schema JSON</label>
            <textarea
              id="jsonSchemaText"
              className="Textarea"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{"name":"My Template","slides":[...]}'
              aria-label="Paste template schema json"
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="Btn Small" onClick={handleImportJsonText} aria-label="Import pasted schema">
                Load schema
              </button>
            </div>
          </div>

          <div className="HelpText">
            Supports simple placeholders like <code>{"{{title}}"}</code>, <code>{"{{bullets_1}}"}</code>, <code>{"{{image_1}}"}</code>{" "}
            via schema fields. Generation uses layout recreation (title, bullets, image-left/right).
          </div>
        </div>

        {flags.demoTemplates ? (
          <>
            <div className="Divider" />
            <div className="TemplateCard">
              <strong>Demo Templates</strong>
              <p>Enabled via <code>REACT_APP_FEATURE_FLAGS=demo-templates</code></p>
              <div style={{ display: "grid", gap: 10 }}>
                {demoTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="Btn"
                    onClick={() => onSelectTemplate(t)}
                    aria-label={`Load demo template ${t.name}`}
                    style={{ textAlign: "left" }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(17,24,39,0.65)", marginTop: 4 }}>{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <div className="Divider" />

        <div className="HelpText">
          Tip: Use <kbd>Tab</kbd> to navigate. Preview fullscreen supports <kbd>←</kbd>/<kbd>→</kbd> to switch slides.
        </div>
      </div>
    </div>
  );
}
