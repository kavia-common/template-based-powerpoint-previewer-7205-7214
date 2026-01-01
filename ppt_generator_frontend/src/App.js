import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import { ThemeProvider, useTheme } from "./theme/ThemeProvider";
import TemplateManager from "./components/TemplateManager";
import ContentEditor from "./components/ContentEditor";
import PreviewPanel from "./components/PreviewPanel";
import PreviewModal from "./components/PreviewModal";
import { buildPreviewSlides } from "./utils/previewRenderer";
import { clearSession, loadSession, saveSession } from "./utils/storage";
import { createEmptyContentForTemplate, getSampleTemplates } from "./utils/templateSchema";
import { downloadPptx } from "./utils/pptGenerator";
import { validateTemplateContent } from "./utils/validators";

function defaultFirstSlideDataUrl() {
  // We keep it simple: use a public asset path. The browser will fetch it when rendering the preview.
  // For PPTX generation, PptxGenJS expects a data URL; we will convert it on-demand (see ensureDataUrl).
  return "/assets/global-first-slide-default.png";
}

async function ensureDataUrl(src) {
  if (!src) return "";
  if (src.startsWith("data:")) return src;

  // Convert public URL (e.g., /assets/...) into data URL for PptxGenJS usage.
  const res = await fetch(src);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}

function AppInner() {
  const { theme } = useTheme();

  // Single-template upload flow: we store metadata only (no parsing).
  const [uploadedPptxTemplate, setUploadedPptxTemplate] = useState(null);

  // We still need a schema template for the editor/generator. Since gallery/JSON import are removed,
  // we bind the app to a single internal schema (the first demo schema) and gate the workflow by PPTX upload.
  const activeTemplate = useMemo(() => getSampleTemplates()[0], []);

  const [content, setContent] = useState(() => createEmptyContentForTemplate(activeTemplate));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const [globalFirstSlide, setGlobalFirstSlide] = useState({
    enabled: true,
    imageDataUrl: defaultFirstSlideDataUrl(),
  });

  // Restore session
  useEffect(() => {
    const session = loadSession();
    if (!session) return;

    if (session.uploadedPptxTemplate) setUploadedPptxTemplate(session.uploadedPptxTemplate);
    if (session.content) setContent(session.content);

    if (session.globalFirstSlide) {
      setGlobalFirstSlide({
        enabled: Boolean(session.globalFirstSlide.enabled),
        imageDataUrl: session.globalFirstSlide.imageDataUrl || defaultFirstSlideDataUrl(),
      });
    }
  }, []);

  // Persist session
  useEffect(() => {
    saveSession({
      uploadedPptxTemplate,
      // Keep these for potential future expansion; activeTemplate is stable and not user-switchable.
      activeTemplate,
      content,
      globalFirstSlide,
    });
  }, [uploadedPptxTemplate, activeTemplate, content, globalFirstSlide]);

  const hasUploadedTemplate = Boolean(uploadedPptxTemplate?.name);

  const errors = useMemo(() => {
    if (!hasUploadedTemplate) return [];
    return validateTemplateContent(activeTemplate, content);
  }, [hasUploadedTemplate, activeTemplate, content]);

  const previewSlides = useMemo(() => {
    if (!hasUploadedTemplate) return [];
    return buildPreviewSlides({ template: activeTemplate, content, theme, globalFirstSlide });
  }, [hasUploadedTemplate, activeTemplate, content, theme, globalFirstSlide]);

  const onUploadPptx = (file) => {
    setUploadedPptxTemplate({
      name: file?.name || "",
      size: typeof file?.size === "number" ? file.size : null,
      lastModified: typeof file?.lastModified === "number" ? file.lastModified : null,
    });

    setStatus({
      type: "success",
      message: "Template uploaded. You can now edit content, preview, and download your deck.",
    });
  };

  const onResetTemplate = () => {
    setUploadedPptxTemplate(null);
    setIsPreviewOpen(false);
    setStatus({ type: "idle", message: "Template removed. Upload a template to continue." });
  };

  const onResetAll = () => {
    setUploadedPptxTemplate(null);
    setContent(createEmptyContentForTemplate(activeTemplate));
    setGlobalFirstSlide({ enabled: true, imageDataUrl: defaultFirstSlideDataUrl() });
    setIsPreviewOpen(false);
    setStatus({ type: "idle", message: "" });
    clearSession();
  };

  const onDownload = async () => {
    if (!hasUploadedTemplate) {
      setStatus({ type: "error", message: "Upload a template (.pptx) first." });
      return;
    }
    if (errors.length) {
      setStatus({ type: "error", message: "Please fix required fields before downloading." });
      return;
    }

    try {
      setStatus({ type: "info", message: "Generating PPTX..." });

      // Ensure first slide is a data URL for PptxGenJS.
      const firstSlideDataUrl = await ensureDataUrl(globalFirstSlide?.imageDataUrl || "");

      await downloadPptx({
        template: activeTemplate,
        content,
        theme,
        fileName: uploadedPptxTemplate?.name ? uploadedPptxTemplate.name.replace(/\.pptx$/i, "") : activeTemplate.name,
        globalFirstSlide: {
          enabled: Boolean(globalFirstSlide?.enabled),
          imageDataUrl: firstSlideDataUrl,
        },
      });

      setStatus({ type: "success", message: "Download started." });
    } catch (e) {
      setStatus({ type: "error", message: `Failed to generate PPTX: ${e.message || String(e)}` });
    }
  };

  const statusStyle = useMemo(() => {
    if (status.type === "error")
      return { borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", color: "#991b1b" };
    if (status.type === "success")
      return { borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.12)", color: "#92400e" };
    if (status.type === "info")
      return { borderColor: "rgba(37,99,235,0.35)", background: "rgba(37,99,235,0.10)", color: "#1e40af" };
    return {
      borderColor: "var(--ocean-border)",
      background: "rgba(255,255,255,0.7)",
      color: "rgba(17,24,39,0.75)",
    };
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
          <button
            type="button"
            className="Btn Small BtnPrimary"
            onClick={onDownload}
            aria-label="Download PPT"
            disabled={!hasUploadedTemplate}
            title={!hasUploadedTemplate ? "Upload a template to enable download" : "Download PPT"}
          >
            Download PPT
          </button>
          <button
            type="button"
            className="Btn Small"
            onClick={() => setIsPreviewOpen(true)}
            aria-label="Preview fullscreen"
            disabled={!hasUploadedTemplate || previewSlides.length === 0}
            title={!hasUploadedTemplate ? "Upload a template to enable preview" : "Preview fullscreen"}
          >
            Preview Fullscreen
          </button>
          <button type="button" className="Btn Small BtnDanger" onClick={onResetAll} aria-label="Reset session">
            Reset
          </button>
        </div>
      </div>

      <div style={{ padding: "0 14px 14px 14px" }}>
        <div className="Badge" style={{ width: "100%", justifyContent: "space-between", ...statusStyle }}>
          <span>
            {status.message ||
              (hasUploadedTemplate
                ? "Ready. Edit content, preview, and download."
                : "Upload a template (.pptx) to start. Editor/Preview/Download will be enabled after upload.")}
          </span>
          {hasUploadedTemplate ? <span>Template file: {uploadedPptxTemplate.name}</span> : <span>No .pptx uploaded</span>}
        </div>
      </div>

      <div className="Layout" role="main" aria-label="Main layout">
        <TemplateManager
          uploadedPptxTemplate={uploadedPptxTemplate}
          onUploadPptx={onUploadPptx}
          globalFirstSlide={globalFirstSlide}
          onSetGlobalFirstSlideImage={(imageDataUrl) =>
            setGlobalFirstSlide((prev) => ({
              ...prev,
              // Empty string (Clear) means revert to default, per requirements.
              imageDataUrl: imageDataUrl ? imageDataUrl : defaultFirstSlideDataUrl(),
            }))
          }
          onToggleGlobalFirstSlideEnabled={(enabled) => setGlobalFirstSlide((prev) => ({ ...prev, enabled }))}
          onResetTemplate={onResetTemplate}
        />

        {/* Gate editor by uploaded template, per requirements */}
        {hasUploadedTemplate ? (
          <ContentEditor template={activeTemplate} content={content} errors={errors} onChangeContent={setContent} />
        ) : (
          <div className="Panel MainColumn" aria-label="Content editor">
            <div className="PanelHeader">
              <h2>Editor</h2>
              <span className="KbdHint">Upload a template to start</span>
            </div>
            <div className="PanelBody">
              <div className="TemplateCard">
                <strong>Upload a template to begin</strong>
                <p>
                  This app is configured for a single-template flow. Upload your PPTX in the left panel to enable editing, preview,
                  and download.
                </p>
              </div>
            </div>
          </div>
        )}

        <PreviewPanel
          slides={previewSlides}
          onOpenFullscreen={() => setIsPreviewOpen(true)}
        />
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
