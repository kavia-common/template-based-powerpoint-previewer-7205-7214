import React from "react";

function SlideHtml({ slide, mode }) {
  const isFull = mode === "full";
  const pad = isFull ? 28 : 14;

  const titleSize = isFull ? 34 : 18;
  const subtitleSize = isFull ? 18 : 12;
  const bodySize = isFull ? 18 : 12;

  const hasImage = Boolean(slide.image_1);

  // Special case: Global First Slide (image-only)
  if (slide.layout === "image-only") {
    return (
      <div
        className={isFull ? "FullSlide" : "ThumbSlide"}
        style={{
          position: "relative",
          padding: 0,
          background: "#fff",
        }}
        aria-label={`Preview slide ${slide.name}`}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: isFull ? 8 : 5,
            width: "100%",
            background: slide.theme.colors.primary,
            opacity: 0.95,
            zIndex: 2,
          }}
        />
        <div style={{ width: "100%", height: "100%" }}>
          {hasImage ? (
            <img
              src={slide.image_1}
              alt={`${slide.name} visual`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ padding: pad }} className="HelpText">
              No image selected.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={isFull ? "FullSlide" : "ThumbSlide"}
      style={{
        position: "relative",
        padding: pad,
        background: "#fff",
      }}
      aria-label={`Preview slide ${slide.name}`}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: isFull ? 8 : 5,
          width: "100%",
          background: slide.theme.colors.primary,
          opacity: 0.95,
        }}
      />
      <div style={{ marginTop: isFull ? 10 : 8 }}>
        <div style={{ fontWeight: 800, fontSize: titleSize, color: slide.theme.colors.text, lineHeight: 1.15 }}>
          {slide.title || slide.name}
        </div>
        {slide.subtitle ? (
          <div style={{ marginTop: 6, fontSize: subtitleSize, color: "rgba(17,24,39,0.65)" }}>{slide.subtitle}</div>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: hasImage && slide.layout.includes("image") ? "1fr 0.95fr" : "1fr",
          gap: 16,
          marginTop: isFull ? 18 : 10,
        }}
      >
        <div style={{ overflow: "hidden" }}>
          {slide.layout === "title+content" && slide.summary ? (
            <div style={{ fontSize: bodySize, color: slide.theme.colors.text, opacity: 0.9, whiteSpace: "pre-wrap" }}>
              {slide.summary}
            </div>
          ) : null}

          {Array.isArray(slide.bullets) && slide.bullets.some((b) => String(b || "").trim()) ? (
            <ul style={{ margin: 0, paddingLeft: 18, marginTop: slide.summary ? 10 : 0 }}>
              {slide.bullets
                .filter((b) => String(b || "").trim())
                .slice(0, isFull ? 12 : 6)
                .map((b, idx) => (
                  <li
                    key={idx}
                    style={{ fontSize: bodySize, color: slide.theme.colors.text, opacity: 0.92, marginBottom: 6 }}
                  >
                    {b}
                  </li>
                ))}
            </ul>
          ) : null}
        </div>

        {hasImage && slide.layout.includes("image") ? (
          <div
            style={{
              border: "1px solid rgba(17,24,39,0.12)",
              borderRadius: isFull ? 14 : 10,
              overflow: "hidden",
              background: "rgba(37,99,235,0.04)",
              minHeight: isFull ? 240 : 90,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={slide.image_1} alt={`${slide.name} visual`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          right: pad,
          bottom: pad,
          fontSize: isFull ? 12 : 10,
          color: "rgba(17,24,39,0.55)",
        }}
      >
        {slide.theme.name}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function PreviewPanel({ slides, onOpenFullscreen }) {
  /** Right panel showing slide thumbnails for fast live preview. */
  return (
    <div className="Panel PreviewColumn" aria-label="Preview panel">
      <div className="PanelHeader">
        <h2>Preview</h2>
        <button type="button" className="Btn Small" onClick={onOpenFullscreen} aria-label="Open fullscreen preview">
          Fullscreen
        </button>
      </div>

      <div className="PanelBody">
        <div className="ThumbGrid" aria-label="Slide thumbnail list">
          {slides.length === 0 ? (
            <div className="HelpText">No slides to preview yet. Load a template and start editing.</div>
          ) : (
            slides.map((s, idx) => (
              <div key={s.id} className="SlideThumb" aria-label={`Slide thumbnail ${idx + 1}`}>
                <div className="SlideThumbHeader">
                  <span>
                    {idx + 1}. {s.name}
                  </span>
                  <span style={{ color: "rgba(17,24,39,0.55)" }}>{s.layout}</span>
                </div>
                <div className="SlideThumbBody">
                  <SlideHtml slide={s} mode="thumb" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function FullSlidePreview({ slide }) {
  return <SlideHtml slide={slide} mode="full" />;
}
