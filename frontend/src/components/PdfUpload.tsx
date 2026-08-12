import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { UploadCloud, Eye } from "lucide-react";
import {
  uploadPdf,
  getPdfText,
  getAllPdfs,
} from "../helpers/api.communication";
import { toast } from "react-hot-toast";
import { useAppTheme } from "../context/ThemeContext";

type PdfType = { _id: string; pdf: string };

type Props = {
  fetchPdfs: () => Promise<void>;
  setSelectedPdf: (pdf: PdfType) => void;
};

const PdfUpload = ({ fetchPdfs, setSelectedPdf }: Props) => {
  const { tokens } = useAppTheme();
  const { CARD_ALT, TEXT_PAPER, TEXT_PAPER_DIM, ACCENT, BORDER_DARK, SANS } = tokens;

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showPdf = (pdf: string) => {
    const fileUrl = `http://localhost:5000/files/${pdf}`;
    window.open(fileUrl, "_blank");
  };

  const getPdf = async () => {
    try {
      const data = await getAllPdfs();
      if (data.pdfs.length > 0) {
        showPdf(data.pdfs[data.pdfs.length - 1].pdf);
      } else {
        toast("No PDFs uploaded yet.", { icon: "📄" });
      }
    } catch (error) {
      console.log(error);
      toast.error("Couldn't load PDFs.");
    }
  };

  const handleFileSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a PDF first.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported.");
      return;
    }

    const toastId = toast.loading("Uploading…");
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);
      const uploadedPdf = await uploadPdf(formData);
      setSelectedPdf({ _id: uploadedPdf.pdfId, pdf: uploadedPdf.filename });
      await fetchPdfs();
      await getPdfText(formData);
      toast.success(`"${file.name}" is ready.`, { id: toastId });
      setFile(null);
    } catch (error) {
      console.log(error);
      toast.error("Upload failed. Try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleFileSend} sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* ── DROPZONE ── */}
      <Box
        sx={{
          border: `1.5px dashed ${BORDER_DARK}`,
          borderRadius: "14px",
          p: "14px 12px",
          position: "relative",
          transition: "all 0.15s",
          "&:hover": { borderColor: ACCENT, background: `${ACCENT}14` },
        }}
      >
        <Box
          component="input"
          type="file"
          accept=".pdf"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (!selectedFile) return;
            setFile(selectedFile);
          }}
          sx={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", pointerEvents: "none" }}>
          <UploadCloud size={15} color={file ? ACCENT : TEXT_PAPER_DIM} />
          <Typography
            sx={{
              fontFamily: SANS, fontSize: "12px", fontWeight: 500,
              color: file ? TEXT_PAPER : TEXT_PAPER_DIM,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {file ? file.name : "Choose a PDF file"}
          </Typography>
        </Box>
      </Box>

      {/* ── UPLOAD BUTTON ── */}
      <Box
        component="button"
        type="submit"
        disabled={!file || submitting}
        sx={{
          width: "100%", border: "none", borderRadius: "12px",
          background: file && !submitting ? ACCENT : CARD_ALT,
          color: file && !submitting ? "#0E0F0E" : TEXT_PAPER_DIM,
          fontFamily: SANS, fontSize: "12px", fontWeight: 700, letterSpacing: "0.2px",
          py: "10px", cursor: file && !submitting ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transition: "opacity 0.15s",
          "&:hover": file && !submitting ? { opacity: 0.88 } : {},
        }}
      >
        {submitting ? "Uploading…" : "Upload document"}
      </Box>

      {/* ── SHOW LATEST PDF BUTTON ── */}
      <Box
        component="button"
        type="button"
        onClick={getPdf}
        sx={{
          width: "100%", border: `1.5px solid ${BORDER_DARK}`, borderRadius: "12px",
          background: "transparent", color: TEXT_PAPER_DIM,
          fontFamily: SANS, fontSize: "12px", fontWeight: 600, letterSpacing: "0.2px",
          py: "9px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transition: "all 0.15s",
          "&:hover": { borderColor: ACCENT, color: TEXT_PAPER },
        }}
      >
        <Eye size={13} />
        View latest PDF
      </Box>
    </Box>
  );
};

export default PdfUpload;