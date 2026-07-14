import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { uploadRepo } from "../helpers/api.communication";
import { toast } from "react-hot-toast";

const CYAN  = "#00ffcc";
const AMBER = "#ffaa00";
const GREEN = "#00ff41";
const RED   = "#ff2244";
const BLACK = "#000000";
const BODY  = "#c8f0e8";
const MONO  = "'Share Tech Mono', 'Courier New', monospace";

type RepoType = { _id: string; repoName: string };

type Props = {
  fetchRepos: () => Promise<void>;
  setSelectedRepo: (repo: RepoType) => void;
  setProcessing: (processing: boolean) => void;
};

const RepoUpload = ({ fetchRepos, setSelectedRepo, setProcessing }: Props) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
  toast.error("Please select a repository ZIP file first.");
  return;
}

if (!file.name.endsWith(".zip")) {
  toast.error("Only ZIP files are supported for repository upload.");
  return;
}

    try {
      setProcessing(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploaded = await uploadRepo(formData);
      setSelectedRepo({ _id: uploaded.repoId, repoName: uploaded.repoName });
      setFile(null);
      await fetchRepos();
      setProcessing(false);
    } catch (error: any) {
  console.error("Error uploading repository:", error);

  toast.error(
    error.response?.data?.message ||
    "Failed to upload and index the repository."
  );

  setProcessing(false);
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
          border: `1px dashed ${GREEN}55`,
          p: "10px 12px",
          position: "relative",
          transition: "all 0.15s",
          "&:hover": { borderColor: GREEN, background: `${GREEN}08` },
        }}
      >
        <Box
          component="input"
          type="file"
          accept=".zip"
onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];

  if (!selectedFile) return;

  const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

  if (selectedFile.size > MAX_SIZE) {
    toast.error("File size cannot exceed 50 MB.");
    e.target.value = ""; // Clear the input
    setFile(null);
    return;
  }

  setFile(selectedFile);
}}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
            width: "100%",
            height: "100%",
          }}
        />
        <Typography
          sx={{
            fontFamily: MONO,
            fontSize: "10px",
            letterSpacing: "1px",
            color: file ? GREEN : `${GREEN}55`,
            pointerEvents: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file ? `▶ ${file.name}` : "> CHOOSE REPO (.ZIP)"}
        </Typography>
      </Box>

      {/* ── UPLOAD BUTTON ── */}
      <Box
        component="button"
        type="submit"
        sx={{
          width: "100%",
          border: `1.5px solid ${file ? GREEN : `${GREEN}33`}`,
          background: "transparent",
          color: file ? GREEN : `${GREEN}33`,
          fontFamily: MONO,
          fontSize: "11px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          py: "8px",
          cursor: file ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          boxShadow: file ? `0 0 8px ${GREEN}33` : "none",
          transition: "all 0.15s",
          "&:hover": file
            ? { background: `${GREEN}18`, boxShadow: `0 0 14px ${GREEN}66` }
            : {},
        }}
      >
        ↑ UPLOAD REPO
      </Box>
    </Box>
  );
};

export default RepoUpload;
