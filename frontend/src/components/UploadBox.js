import { useState } from "react";
import { useDropzone } from "react-dropzone";
import API from "../services/api";

export default function UploadBox({ setPdfUrl }) {

  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles) => {

    const file = acceptedFiles[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {

      setUploading(true);

      const response = await API.post(
        "/upload-pdf",
        formData
      );

      if (response.data.error) {

        alert(response.data.error);

        return;
      }

      // Create local URL for PDF Viewer
      const url = URL.createObjectURL(file);

      // Save PDF URL
      localStorage.setItem(
        "pdfUrl",
        url
      );

      // Save PDF Name
      localStorage.setItem(
        "pdfName",
        file.name
      );

      // Update App state
      setPdfUrl(url);

      alert(
        `PDF Uploaded Successfully\n\nChunks: ${
          response.data.chunks || 0
        }`
      );

    } catch (error) {

      console.log(error);

      alert("Upload Failed");

    } finally {

      setUploading(false);

    }

  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"]
    },
    multiple: false,
    onDrop
  });

  return (

    <div
      {...getRootProps()}
      className="
        border-2
        border-dashed
        border-blue-500
        rounded-3xl
        p-14
        text-center
        cursor-pointer
        bg-slate-900
        hover:bg-slate-800
        hover:border-blue-400
        transition-all
        duration-300
        shadow-xl
      "
    >

      <input {...getInputProps()} />

      {uploading ? (

        <div>

          <div className="text-5xl animate-pulse mb-4">
            ⏳
          </div>

          <h2 className="text-2xl font-bold">
            Processing PDF...
          </h2>

          <p className="mt-3 text-slate-400">
            Extracting text and creating embeddings
          </p>

        </div>

      ) : (

        <div>

          <div className="text-6xl mb-5">
            📄
          </div>

          <h2 className="text-3xl font-bold">
            Upload PDF
          </h2>

          <p className="mt-4 text-slate-400">
            Drag & Drop your PDF here
          </p>

          <p className="text-slate-500 mt-2">
            or click to browse
          </p>

          <div className="mt-6 text-sm text-slate-500">
            Supports PDF documents for AI-powered Q&A
          </div>

        </div>

      )}

    </div>

  );
}