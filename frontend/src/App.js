import { useState } from "react";

import UploadBox from "./components/UploadBox";

import ChatBox from "./components/ChatBox";

import PDFViewer from "./components/PDFViewer";

export default function App() {

  const [uploadStatus, setUploadStatus] = useState("");

  const isUploaded =
    uploadStatus === "PDF uploaded successfully";

  const pdfUrl = localStorage.getItem("pdfUrl");

  return (

    <div className="h-screen bg-[#0f172a] text-white flex flex-col">

      {/* TOP BAR */}

      <div className="h-16 border-b border-slate-800 flex items-center px-6">

        <h1 className="text-2xl font-bold">
          PDF Assistant
        </h1>

      </div>

      {/* MAIN */}

      <div className="flex-1 overflow-hidden">

        {!isUploaded ? (

          <div className="h-full flex items-center justify-center">

            <div className="w-full max-w-2xl px-6">

              <UploadBox
                setUploadStatus={setUploadStatus}
              />

              {uploadStatus && (

                <p className="mt-5 text-center text-lg">
                  {uploadStatus}
                </p>

              )}

            </div>

          </div>

        ) : (

          <div className="h-full flex">

            {/* PDF PANEL */}

            <div className="w-1/2 border-r border-slate-800">

              <PDFViewer fileUrl={pdfUrl} />

            </div>

            {/* CHAT PANEL */}

            <div className="w-1/2">

              <ChatBox />

            </div>

          </div>

        )}

      </div>

    </div>
  );
}