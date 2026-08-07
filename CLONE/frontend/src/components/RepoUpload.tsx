import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { UploadCloud } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { uploadRepo, uploadRepoFromUrl } from "../helpers/api.communication";
import { toast } from "react-hot-toast";
import { useAppTheme } from "../context/ThemeContext";

type RepoType = {
  _id: string;
  repoName: string;
  status?: "processing" | "ready" | "failed";
  source?: "zip" | "github";
};

type Props = {
  fetchRepos: () => Promise<any>;
  setSelectedRepo: (repo: RepoType) => void;
  setProcessing: (processing: boolean) => void;
};

type UploadMode = "zip" | "github";

const RepoUpload = ({ fetchRepos, setSelectedRepo, setProcessing }: Props) => {
  const { tokens } = useAppTheme();
  const { CARD_ALT, TEXT_PAPER, TEXT_PAPER_DIM, ACCENT, BORDER_DARK, SANS } = tokens;

  const [mode, setMode] = useState<UploadMode>("zip");
  const [file, setFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleZipSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a repository ZIP file first.");
      return;
    }
    if (!file.name.endsWith(".zip")) {
      toast.error("Only .zip files are supported for repository upload.");
      return;
    }

    const toastId = toast.loading("Uploading the repo…");
    try {
      setSubmitting(true);
      setProcessing(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploaded = await uploadRepo(formData);
      toast.success(
        `"${uploaded.repoName}" uploaded — indexing in the background. You can watch its progress in the list.`,
        { id: toastId, duration: 4000 }
      );
      setSelectedRepo({ _id: uploaded.repoId, repoName: uploaded.repoName, status: "processing", source: "zip" });
      setFile(null);
      await fetchRepos();
    } catch (error: any) {
      console.error("Error uploading repository:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload and index the repository. Please try again.",
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
      setProcessing(false);
    }
  };

  const handleGithubSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = githubUrl.trim();
    if (!url) {
      toast.error("Paste a GitHub repository link first, e.g. https://github.com/owner/repo");
      return;
    }
    if (!/^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/i.test(url)) {
      toast.error("That doesn't look like a GitHub repository URL. Expected something like https://github.com/owner/repo");
      return;
    }

    const toastId = toast.loading("Fetching the repository from GitHub…");
    try {
      setSubmitting(true);
      setProcessing(true);
      const uploaded = await uploadRepoFromUrl(url);
      toast.success(
        `"${uploaded.repoName}" is downloading and indexing in the background. You can watch its progress in the list.`,
        { id: toastId, duration: 4000 }
      );
      setSelectedRepo({ _id: uploaded.repoId, repoName: uploaded.repoName, status: "processing", source: "github" });
      setGithubUrl("");
      await fetchRepos();
    } catch (error: any) {
      console.error("Error importing repository from GitHub:", error);
      toast.error(
        error.response?.data?.message || "Failed to import the repository from GitHub. Please check the link and try again.",
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
      setProcessing(false);
    }
  };

  const TabButton = ({ target, icon, label }: { target: UploadMode; icon: React.ReactNode; label: string }) => (
    <Box
      onClick={() => setMode(target)}
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        borderRadius: "10px",
        py: "7px",
        cursor: "pointer",
        fontFamily: SANS,
        fontSize: "11.5px",
        fontWeight: 600,
        letterSpacing: "0.2px",
        color: mode === target ? "#0E0F0E" : TEXT_PAPER_DIM,
        background: mode === target ? ACCENT : "transparent",
        transition: "all 0.15s",
        "&:hover": { color: mode === target ? "#0E0F0E" : TEXT_PAPER },
      }}
    >
      {icon}
      {label}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* ── MODE SWITCH ── */}
      <Box sx={{ display: "flex", gap: "4px", background: CARD_ALT, borderRadius: "12px", p: "4px" }}>
        <TabButton target="zip" icon={<UploadCloud size={13} />} label="Upload ZIP" />
        <TabButton target="github" icon={<FaGithub size={13} />} label="GitHub link" />
      </Box>

      {mode === "zip" ? (
        <Box component="form" onSubmit={handleZipSubmit} sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
              accept=".zip"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const selectedFile = e.target.files?.[0];
                if (!selectedFile) return;
                const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
                if (selectedFile.size > MAX_SIZE) {
                  toast.error("That file is too large — the maximum repository ZIP size is 50 MB.");
                  e.target.value = "";
                  setFile(null);
                  return;
                }
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
                {file ? file.name : "Choose a repository .zip (max 50 MB)"}
              </Typography>
            </Box>
          </Box>

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
            {submitting ? "Uploading…" : "Upload & index repository"}
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleGithubSubmit} sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Box
            component="input"
            type="text"
            placeholder="https://github.com/owner/repo"
            value={githubUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
            sx={{
              width: "100%", boxSizing: "border-box",
              border: `1.5px solid ${BORDER_DARK}`, borderRadius: "12px",
              background: "transparent", color: TEXT_PAPER,
              fontFamily: SANS, fontSize: "12.5px", px: "14px", py: "11px",
              outline: "none", transition: "border-color 0.15s",
              "&:focus": { borderColor: ACCENT },
              "&::placeholder": { color: TEXT_PAPER_DIM },
            }}
          />
          <Typography sx={{ fontFamily: SANS, fontSize: "11px", color: TEXT_PAPER_DIM, lineHeight: 1.5 }}>
            Works with any public GitHub repository — we'll fetch, extract, and index it for you.
          </Typography>
          <Box
            component="button"
            type="submit"
            disabled={submitting}
            sx={{
              width: "100%", border: "none", borderRadius: "12px",
              background: !submitting ? ACCENT : CARD_ALT,
              color: !submitting ? "#0E0F0E" : TEXT_PAPER_DIM,
              fontFamily: SANS, fontSize: "12px", fontWeight: 700, letterSpacing: "0.2px",
              py: "10px", cursor: !submitting ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              transition: "opacity 0.15s",
              "&:hover": !submitting ? { opacity: 0.88 } : {},
            }}
          >
            {submitting ? "Fetching…" : "Import from GitHub"}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RepoUpload;
