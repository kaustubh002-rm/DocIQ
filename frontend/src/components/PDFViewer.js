import { Document, Page, pdfjs } from "react-pdf";

import { useState } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl }) {

  const [numPages, setNumPages] = useState();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (

    <div className="h-full overflow-y-auto p-4 bg-slate-900">

      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >

        {Array.from(
          new Array(numPages),
          (el, index) => (

            <div
              key={`page_${index + 1}`}
              className="mb-6 flex justify-center"
            >

              <Page
                pageNumber={index + 1}
                width={500}
              />

            </div>
          )
        )}

      </Document>

    </div>
  );
}