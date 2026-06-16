import { useEffect, useState } from "react";
import API from "../services/api";

export default function PdfList({
  setPdfUrl,
  close
}) {

  const [pdfs, setPdfs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

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

    loadPdfs();

  }, []);

  const selectPdf = async (fileName) => {

  try {

    await API.post(
      `/select-pdf/${fileName}`
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

        <div className="flex flex-wrap gap-3">

          {pdfs.map(
            (pdf, index) => (

              <button
                key={index}
                onClick={() =>
                  selectPdf(
                    pdf.file_name
                  )
                }
                className="
                  bg-slate-800
                  hover:bg-slate-700
                  px-4
                  py-3
                  rounded-lg
                  text-left
                  transition
                "
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

              </button>

            )
          )}

        </div>

      )}

    </div>

  );
}