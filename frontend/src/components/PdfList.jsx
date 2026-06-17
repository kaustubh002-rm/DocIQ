import { useEffect, useState } from "react";
import API from "../services/api";

export default function PdfList({
  setPdfUrl,
  close
}) {

  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPdfs();
  }, []);

  const loadPdfs = async () => {

    try {

      const res = await API.get(
        "/my-pdfs"
      );

      setPdfs(res.data);

    } catch (error) {

      console.log(
        "PDF Load Error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  const selectPdf = async (
    fileName
  ) => {

    try {

      await API.post(
        `/select-pdf/${encodeURIComponent(fileName)}`
      );

      const pdfUrl =
        `http://localhost:8000/pdf-file/${encodeURIComponent(fileName)}`;

      localStorage.setItem(
        "pdfName",
        fileName
      );

      localStorage.setItem(
        "pdfUrl",
        pdfUrl
      );

      setPdfUrl(pdfUrl);

      close();

    } catch (error) {

      console.log(error);

      alert(
        "Failed to select PDF"
      );

    }

  };

  const deletePdf = async (
    fileName
  ) => {

    const confirmDelete =
      window.confirm(
        `Delete ${fileName}?`
      );

    if (!confirmDelete) return;

    try {

      await API.delete(
        `/delete-pdf/${encodeURIComponent(fileName)}`
      );

      setPdfs((prev) =>
        prev.filter(
          (pdf) =>
            pdf.file_name !== fileName
        )
      );

      if (
        localStorage.getItem(
          "pdfName"
        ) === fileName
      ) {

        localStorage.removeItem(
          "pdfName"
        );

        localStorage.removeItem(
          "pdfUrl"
        );

        setPdfUrl(null);
      }

    } catch (error) {

      console.log(error);

      alert(
        "Failed to delete PDF"
      );

    }

  };

  if (loading) {

    return (
      <div className="p-4">
        Loading PDFs...
      </div>
    );

  }

  return (

    <div className="p-4">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-bold">
          My PDFs
        </h2>

        <button
          onClick={close}
          className="
            bg-slate-800
            hover:bg-slate-700
            px-3
            py-1
            rounded
          "
        >
          ✕
        </button>

      </div>

      {pdfs.length === 0 ? (

        <p className="text-slate-400">
          No PDFs uploaded yet
        </p>

      ) : (

        <div className="flex flex-col gap-3">

          {pdfs.map(
            (pdf, index) => (

              <div
                key={index}
                className="
                  bg-slate-800
                  rounded-lg
                  p-4
                  flex
                  justify-between
                  items-center
                "
              >

                <div
                  className="cursor-pointer flex-1"
                  onClick={() =>
                    selectPdf(
                      pdf.file_name
                    )
                  }
                >

                  <div className="font-medium">
                    📄 {pdf.file_name}
                  </div>

                  <div
                    className="
                      text-xs
                      text-slate-400
                      mt-1
                    "
                  >
                    {new Date(
                      pdf.upload_date
                    ).toLocaleString()}
                  </div>

                </div>

                <button
                  onClick={() =>
                    deletePdf(
                      pdf.file_name
                    )
                  }
                  className="
                    bg-red-600
                    hover:bg-red-700
                    px-3
                    py-2
                    rounded
                    ml-3
                  "
                >
                  Delete
                </button>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}