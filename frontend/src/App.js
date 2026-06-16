import { useState } from "react";

import UploadBox from "./components/UploadBox";
import ChatBox from "./components/ChatBox";
import PDFViewer from "./components/PDFViewer";
import ChatHistory from "./components/ChatHistory";
import PdfList from "./components/PdfList";

import Login from "./components/Login";
import Signup from "./components/Signup";

export default function App() {

  const [showHistory, setShowHistory] = useState(true);

  const [showPdfs, setShowPdfs] = useState(false);

  const [showLogin, setShowLogin] = useState(true);

  const [pdfUrl, setPdfUrl] = useState(
    localStorage.getItem("pdfUrl")
  );

  const token = localStorage.getItem("token");

  const isUploaded = !!pdfUrl;

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("pdfUrl");
    localStorage.removeItem("pdfName");

    window.location.reload();
  };

  const uploadNewPdf = () => {

    localStorage.removeItem("pdfUrl");
    localStorage.removeItem("pdfName");

    setPdfUrl(null);
  };

  // ==========================
  // LOGIN / SIGNUP
  // ==========================

  if (!token) {

    return (

      <div className="h-screen bg-[#0f172a] flex items-center justify-center">

        <div className="w-full max-w-md">

          {
            showLogin
              ? <Login />
              : <Signup setShowLogin={setShowLogin} />
          }

          <button
            className="mt-6 w-full text-blue-400 hover:text-blue-300"
            onClick={() => setShowLogin(!showLogin)}
          >
            {
              showLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"
            }
          </button>

        </div>

      </div>

    );
  }

  // ==========================
  // MAIN APP
  // ==========================

  return (

    <div className="h-screen bg-[#0f172a] text-white flex flex-col">

      {/* NAVBAR */}

      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">

        <h1 className="text-2xl font-bold">
          PDF Assistant
        </h1>

        <div className="flex items-center gap-3">

          {isUploaded && (

            <>
              {/* Current PDF */}

              <div
                className="
                  bg-slate-800
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  max-w-[250px]
                  truncate
                "
              >
                📄 {localStorage.getItem("pdfName")}
              </div>

              {/* My PDFs */}

              <button
                onClick={() =>
                  setShowPdfs(!showPdfs)
                }
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  px-4
                  py-2
                  rounded-lg
                "
              >
                My PDFs
              </button>

              {/* Upload New PDF */}

              <button
                onClick={uploadNewPdf}
                className="
                  bg-green-600
                  hover:bg-green-700
                  px-4
                  py-2
                  rounded-lg
                "
              >
                Upload PDF
              </button>

              {/* Toggle History */}

              <button
                onClick={() =>
                  setShowHistory(!showHistory)
                }
                className="
                  bg-slate-800
                  hover:bg-slate-700
                  px-4
                  py-2
                  rounded-lg
                "
              >
                {
                  showHistory
                    ? "Hide History"
                    : "Show History"
                }
              </button>
            </>

          )}

          <div className="text-slate-300">

            Welcome,

            <span className="font-semibold ml-2">
              {localStorage.getItem("name")}
            </span>

          </div>

          <button
            onClick={logout}
            className="
              bg-red-600
              hover:bg-red-700
              px-4
              py-2
              rounded-lg
            "
          >
            Logout
          </button>

        </div>

      </div>

      {/* PDF LIST */}

      {showPdfs && (

        <div className="bg-slate-900 border-b border-slate-800">

          <PdfList
            setPdfUrl={setPdfUrl}
            close={() => setShowPdfs(false)}
          />

        </div>

      )}

      {/* BODY */}

      <div className="flex-1 overflow-hidden">

        {!isUploaded ? (

          <div className="h-full flex items-center justify-center">

            <div className="w-full max-w-2xl px-6">

              <UploadBox
                setPdfUrl={setPdfUrl}
              />

              <p className="mt-6 text-center text-slate-400">
                Upload a PDF to start chatting with it.
              </p>

            </div>

          </div>

        ) : (

          <div className="h-full flex">

            {/* HISTORY */}

            {showHistory && (

              <div
                className="
                  w-[280px]
                  bg-slate-950
                  border-r
                  border-slate-800
                "
              >
                <ChatHistory />
              </div>

            )}

            {/* PDF VIEWER */}

            <div
              className={`
                ${
                  showHistory
                    ? "flex-1"
                    : "w-[55%]"
                }
                border-r
                border-slate-800
              `}
            >
              <PDFViewer fileUrl={pdfUrl} />
            </div>

            {/* CHAT */}

            <div
              className={`
                ${
                  showHistory
                    ? "w-[500px]"
                    : "w-[45%]"
                }
              `}
            >
              <ChatBox />
            </div>

          </div>

        )}

      </div>

    </div>

  );
}