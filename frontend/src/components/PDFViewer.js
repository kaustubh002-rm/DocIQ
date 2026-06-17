import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl }) {

  const [numPages, setNumPages] = useState(null);

  return (
    <div className="h-full overflow-auto bg-slate-900 p-4">

      {!fileUrl && (
        <div>No PDF Selected</div>
      )}

      <Document
        file={{
          url: fileUrl
        }}
        onLoadSuccess={({ numPages }) => {
          console.log("PDF Loaded");
          setNumPages(numPages);
        }}
        onLoadError={(error) => {
          console.error("PDF ERROR:", error);
        }}
      >

        {numPages &&
          Array.from(
            { length: numPages },
            (_, index) => (
              <Page
                key={index}
                pageNumber={index + 1}
                width={600}
              />
            )
          )}

      </Document>

    </div>
  );
}