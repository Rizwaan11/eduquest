import { useCallback, memo } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Essential Styles for the viewer
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

/**
 * OptimizedPdfViewer — Renders a PDF with built-in virtualization,
 * toolbars, zoom, and search out of the box.
 */
function PdfViewer({ url, onTextSelect }) {
  // Initialize the default layout plugin (adds toolbar, sidebar, etc.)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Capture text selection from the PDF
  const handleMouseUp = useCallback(() => {
    // Delay ensures the browser's native selection is completely finished
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 3) {
        return; // Ignore empty or very short accidental clicks
      }

      // Find which page the text was selected on
      let pageNum = 1; // Fallback
      const anchorNode = selection.anchorNode;

      if (anchorNode) {
        let el =
          anchorNode.nodeType === Node.TEXT_NODE
            ? anchorNode.parentElement
            : anchorNode;

        // Traverse up the DOM tree to find the page container
        while (el && el !== document.body) {
          const testId = el.getAttribute("data-testid");
          // react-pdf-viewer uses 'core__page-layer-0', 'core__page-layer-1', etc.
          if (testId && testId.startsWith("core__page-layer-")) {
            // Add 1 because the DOM index is 0-based, but pages are 1-based
            pageNum = parseInt(testId.split("-").pop(), 10) + 1;
            break;
          }
          el = el.parentElement;
        }
      }

      onTextSelect?.(text, pageNum);
    }, 50);
  }, [onTextSelect]);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 bg-[#111]">
        Waiting for PDF URL...
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full w-full bg-[#1a1a1a] overflow-hidden"
      onMouseUp={handleMouseUp}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="flex-1 h-full">
          <Viewer
            fileUrl={url}
            plugins={[defaultLayoutPluginInstance]}
            theme="dark"
          />
        </div>
      </Worker>
    </div>
  );
}

// React.memo prevents the heavy PDF engine from re-rendering
// if the parent component (CompanionView) updates its internal state.
export default memo(PdfViewer);