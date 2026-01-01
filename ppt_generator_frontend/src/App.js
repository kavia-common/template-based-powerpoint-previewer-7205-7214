import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider";
import TemplateManager from "./components/TemplateManager";
import ContentEditor from "./components/ContentEditor";
import PreviewPanel from "./components/PreviewPanel";
import PreviewModal from "./components/PreviewModal";
import { buildPreviewSlides } from "./utils/previewRenderer";
import { clearSession, loadSession, saveSession } from "./utils/storage";
import { createEmptyContentForTemplate, parseTemplateJson, toDownloadableJson } from "./utils/templateSchema";
import { downloadPptx } from "./utils/pptGenerator";
import { validateTemplateContent } from "./utils/validators";

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function AppInner() {
  const { theme } = useTheme();

  const [pptxTemplateFileName, setPptxTemplateFileName] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [content, setContent] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  // Restore session
  useEffect(() => {
    const session = loadSession();
    if (!session) return;

    if (session.pptxTemplateFileName) setPptxTemplateFileName(session.pptxTemplateFileName);
    if (session.activeTemplate) setActiveTemplate(session.activeTemplate);
    if (session.content) setContent(session.content);
  }, []);

  // Persist session
  useEffect(() => {
    saveSession({
      pptxTemplateFileName,
      activeTemplate,
      content,
    });
  }, [pptxTemplateFileName, activeTemplate, content]);

  const errors = useMemo(() => {
    if (!activeTemplate) return [];
    return validateTemplateContent(activeTemplate, content);
  }, [activeTemplate, content]);

  const previewSlides = useMemo(() => {
    if (!activeTemplate) return [];
    return buildPreviewSlides({ template: activeTemplate, content, theme });
  }, [activeTemplate, content, theme]);

  const onUploadPptx = (file) => {
    // Graceful fallback: store file name only (no deep parsing in this implementation)
    setPptxTemplateFileName(file?.name || "");
    setStatus({
      type: "info",
      message:
        "PPTX uploaded. Template parsing is limited in-browser; use JSON schema flow for reliable placeholder mapping.",
    });
  };

  const onSelectTemplate = (tpl) => {
    setActiveTemplate(tpl);
    setContent(createEmptyContentForTemplate(tpl));
    setStatus({ type: "idle", message: "" });
  };

  const onImportTemplateJson = (jsonText) => {
    try {
      const tpl = parseTemplateJson(jsonText);
      // minimal normalization
      if (!tpl.id) tpl.id = `import_${Date.now()}`;
      if (!tpl.name) tpl.name = "Imported Template";
      if (!Array.isArray(tpl.slides)) throw new Error("Template must include slides[]");

      setActiveTemplate(tpl);
      setContent(createEmptyContentForTemplate(tpl));
      setStatus({ type: "success", message: "Template schema loaded." });
    } catch (e) {
      setStatus({ type: "error", message: `Invalid JSON schema: ${e.message || String(e)}` });
    }
  };

  const onExportTemplateJson = () => {
    if (!activeTemplate) return;
    downloadTextFile(
      `${(activeTemplate.name || "template").replace(/\s+/g, "_").toLowerCase()}_schema.json`,
      toDownloadableJson(activeTemplate)
    );
    setStatus({ type: "success", message: "Template schema exported." });
  };

  const onReset = () => {
    setPptxTemplateFileName("");
    setActiveTemplate(null);
    setContent({});
    setIsPreviewOpen(false);
    setStatus({ type: "idle", message: "" });
    clearSession();
  };

  const onDownload = async () => {
    if (!activeTemplate) {
      setStatus({ type: "error", message: "Load a template first." });
      return;
    }
    if (errors.length) {
      setStatus({ type: "error", message: "Please fix required fields before downloading." });
      return;
    }
    try {
      setStatus({ type: "info", message: "Generating PPTX..." });
      await downloadPptx({ template: activeTemplate, content, theme, fileName: activeTemplate.name });
      setStatus({ type: "success", message: "Download started." });
    } catch (e) {
      setStatus({ type: "error", message: `Failed to generate PPTX: ${e.message || String(e)}` });
    }
  };

  const statusStyle = useMemo(() => {
    if (status.type === "error") return { borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", color: "#991b1b" };
    if (status.type === "success") return { borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.12)", color: "#92400e" };
    if (status.type === "info") return { borderColor: "rgba(37,99,235,0.35)", background: "rgba(37,99,235,0.10)", color: "#1e40af" };
    return { borderColor: "var(--ocean-border)", background: "rgba(255,255,255,0.7)", color: "rgba(17,24,39,0.75)" };
  }, [status.type]);

  return (
    <div className="AppShell">
      <div className="TopBar" role="banner" aria-label="Top bar">
        <div className="Brand" aria-label="App brand">
          <div className="BrandMark" aria-hidden="true" />
          <div className="BrandText">
            <strong>PPT Template Previewer</strong>
            <span>Generate + preview decks locally (no backend)</span>
          </div>
        </div>

        <div className="TopActions" aria-label="Primary actions">
          <button type="button" className="Btn Small BtnPrimary" onClick={onDownload} aria-label="Download PPT">
            Download PPT
          </button>
          <button
            type="button"
            className="Btn Small"
            onClick={() => setIsPreviewOpen(true)}
            aria-label="Preview fullscreen"
            disabled={previewSlides.length === 0}
          >
            Preview Fullscreen
          </button>
          <button type="button" className="Btn Small BtnDanger" onClick={onReset} aria-label="Reset session">
            Reset
          </button>
        </div>
      </div>

      <div style={{ padding: "0 14px 14px 14px" }}>
        <div className="Badge" style={{ width: "100%", justifyContent: "space-between", ...statusStyle }}>
          <span>
            {status.message || "Ready. Import a JSON schema or enable demo templates via REACT_APP_FEATURE_FLAGS=demo-templates."}
          </span>
          {pptxTemplateFileName ? <span>Template file: {pptxTemplateFileName}</span> : <span>No .pptx uploaded</span>}
        </div>
      </div>

      <div className="Layout" role="main" aria-label="Main layout">
        <TemplateManager
          activeTemplate={activeTemplate}
          uploadedPptxFileName={pptxTemplateFileName}
          onUploadPptx={onUploadPptx}
          onSelectTemplate={onSelectTemplate}
          onImportTemplateJson={onImportTemplateJson}
          onExportTemplateJson={onExportTemplateJson}
        />

        <ContentEditor template={activeTemplate} content={content} errors={errors} onChangeContent={setContent} />

        <PreviewPanel slides={previewSlides} onOpenFullscreen={() => setIsPreviewOpen(true)} />
      </div>

      <PreviewModal isOpen={isPreviewOpen} slides={previewSlides} onClose={() => setIsPreviewOpen(false)} />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** App entry: wraps UI with ThemeProvider. */
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
