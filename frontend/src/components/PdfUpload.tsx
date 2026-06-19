import { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  uploadPdf,
  getPdfText,
  getAllPdfs,
} from "../helpers/api.communication";

// ── theme tokens (same as rest of app) ────────────────────────────────────────
const CYAN  = "#00ffcc";
const AMBER = "#ffaa00";
const GREEN = "#00ff41";
const RED   = "#ff2244";
const BLACK = "#000000";
const BODY  = "#c8f0e8";
const MONO  = "'Share Tech Mono', 'Courier New', monospace";

type PdfType = { _id: string; pdf: string };

type Props = {
  fetchPdfs: () => Promise<void>;
  setSelectedPdf: (pdf: PdfType) => void;
};

const PdfUpload = ({ fetchPdfs, setSelectedPdf }: Props) => {
  const [file,    setFile   ] = useState<File | null>(null);
  const [allpdfs, setAllpdfs] = useState<any[]>([]);

  // ── logic unchanged ────────────────────────────────────────────────────────
  const showPdf = (pdf: string) => {
    const fileUrl = `http://localhost:5000/files/${pdf}`;
    window.open(fileUrl, "_blank");
  };

  const getPdf = async () => {
    try {
      const data = await getAllPdfs();
      setAllpdfs(data.pdfs);
      if (data.pdfs.length > 0) {
        showPdf(data.pdfs[data.pdfs.length - 1].pdf);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) { alert("Please select a PDF first"); return; }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadedPdf = await uploadPdf(formData);
      setSelectedPdf({ _id: uploadedPdf.pdfId, pdf: uploadedPdf.filename });
      await fetchPdfs();
      const text = await getPdfText(formData);
      console.log("PDF Text:");
      console.log(text);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleFileSend}
      sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
    >
      {/* ── FILE INPUT ── */}
      <Box
        sx={{
          border: `1px dashed ${AMBER}55`,
          p: "10px 12px",
          position: "relative",
          transition: "all 0.15s",
          "&:hover": { borderColor: AMBER, background: `${AMBER}08` },
        }}
      >
        {/* hidden native input — covers the whole box */}
        <Box
          component="input"
          type="file"
          accept=".pdf"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
          }}
          sx={{
            position: "absolute", inset: 0,
            opacity: 0, cursor: "pointer", width: "100%", height: "100%",
          }}
        />
        {/* visible label */}
        <Typography
          sx={{
            fontFamily: MONO, fontSize: "10px", letterSpacing: "1px",
            color: file ? AMBER : `${AMBER}55`,
            pointerEvents: "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {file ? `▶ ${file.name}` : "> CHOOSE FILE (.PDF)"}
        </Typography>
      </Box>

      {/* ── UPLOAD BUTTON ── */}
      <Box
        component="button"
        type="submit"
        sx={{
          width: "100%",
          border: `1.5px solid ${file ? AMBER : `${AMBER}33`}`,
          background: "transparent",
          color: file ? AMBER : `${AMBER}33`,
          fontFamily: MONO, fontSize: "11px", letterSpacing: "2px",
          textTransform: "uppercase", py: "8px",
          cursor: file ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          boxShadow: file ? `0 0 8px ${AMBER}33` : "none",
          transition: "all 0.15s",
          "&:hover": file
            ? { background: `${AMBER}18`, boxShadow: `0 0 14px ${AMBER}66` }
            : {},
        }}
      >
        ↑ UPLOAD PDF
      </Box>

      {/* ── SHOW PDF BUTTON ── */}
      <Box
        component="button"
        type="button"
        onClick={getPdf}
        sx={{
          width: "100%",
          border: `1.5px solid ${CYAN}55`,
          background: "transparent",
          color: `${CYAN}99`,
          fontFamily: MONO, fontSize: "11px", letterSpacing: "2px",
          textTransform: "uppercase", py: "8px",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transition: "all 0.15s",
          "&:hover": { background: `${CYAN}11`, borderColor: CYAN, color: CYAN, boxShadow: `0 0 8px ${CYAN}33` },
        }}
      >
        ⊞ SHOW PDF
      </Box>
    </Box>
  );
};

export default PdfUpload;