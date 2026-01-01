import React, { useEffect, useMemo, useRef, useState } from "react";
import { FullSlidePreview } from "./PreviewPanel";

// PUBLIC_INTERFACE
export default function PreviewModal({ isOpen, slides, initialIndex = 0, onClose }) {
  /** Fullscreen modal/carousel for slide previews. */
  const [index, setIndex] = useState(initialIndex);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const current = useMemo(() => slides[index], [slides, index]);

  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(slides.length - 1, i + 1));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ModalOverlay" role="dialog" aria-modal="true" aria-label="Fullscreen preview">
      <div className="Modal">
        <div className="ModalHeader">
          <h3>Preview Fullscreen</h3>
          <button ref={closeBtnRef} type="button" className="Btn Small" onClick={onClose} aria-label="Close fullscreen preview">
            Close
          </button>
        </div>

        <div className="ModalBody">
          <div className="ModalNav" aria-label="Preview navigation">
            <button
              type="button"
              className="Btn Small"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label="Previous slide"
            >
              ← Prev
            </button>
            <div className="Badge" aria-label="Current slide indicator">
              Slide {index + 1} / {slides.length}
            </div>
            <button
              type="button"
              className="Btn Small"
              onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
              disabled={index === slides.length - 1}
              aria-label="Next slide"
            >
              Next →
            </button>
          </div>

          {current ? <FullSlidePreview slide={current} /> : <div className="HelpText">No slide selected.</div>}
        </div>
      </div>
    </div>
  );
}
