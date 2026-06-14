import { useState } from "react";
import {
  uploadPdf,
  getPdfText,
  getAllPdfs,
} from "../helpers/api.communication";


type Props = {
  fetchPdfs: () => Promise<void>;
};
const PdfUpload = ({ fetchPdfs }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [allpdfs, setAllpdfs] = useState<any[]>([]);

  const showPdf = (pdf: string) => {
    const fileUrl = `http://localhost:5000/files/${pdf}`;
    window.open(fileUrl, "_blank");
  };

  const getPdf = async () => {
    try {
      const data = await getAllPdfs();

      setAllpdfs(data.pdfs);

      if (data.pdfs.length > 0) {
        showPdf(
          data.pdfs[data.pdfs.length - 1].pdf
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileSend = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a PDF first");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("file", file);

      await uploadPdf(formData);
      await fetchPdfs();

      const text = await getPdfText(formData);

      console.log("PDF Text:");
      console.log(text);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form
        onSubmit={handleFileSend}
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (
              e.target.files &&
              e.target.files[0]
            ) {
              setFile(e.target.files[0]);
            }
          }}
        />

        <button
          type="submit"
          style={{
            cursor: "pointer",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
          }}
        >
          Upload
        </button>
      </form>

      <button
        onClick={getPdf}
        style={{
          cursor: "pointer",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          marginTop: "10px",
        }}
      >
        Show PDF
      </button>
    </>
  );
};

export default PdfUpload;