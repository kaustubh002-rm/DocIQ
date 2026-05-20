import { useDropzone } from "react-dropzone";
import API from "../services/api";

export default function UploadBox({ setUploadStatus }) {

  const onDrop = async (acceptedFiles) => {

  const file = acceptedFiles[0];

  const formData = new FormData();

  formData.append("file", file);

  try {

    setUploadStatus("Uploading PDF...");

    const response = await API.post(
      "/upload-pdf",
      formData
    );

    setUploadStatus(response.data.message);

    // SAVE PDF URL
    localStorage.setItem(
      "pdfUrl",
      URL.createObjectURL(file)
    );

  } catch (error) {

    setUploadStatus("Upload failed");

  }
};

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-400 p-10 rounded-xl text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      <p>Drag & Drop PDF Here</p>
    </div>
  );
}