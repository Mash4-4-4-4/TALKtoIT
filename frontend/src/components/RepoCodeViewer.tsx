import React, { useEffect, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";
const TEXT_MUTED = "#8B8A84";

type Props = {
  filePath: string | null;
  content: string;
  loading: boolean;
  onClose: () => void;
};

const getLanguageFromPath = (filePath: string): string => {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    json: "json", py: "python", css: "css", scss: "scss", html: "xml",
    md: "markdown", yml: "yaml", yaml: "yaml", sh: "bash", sql: "sql",
  };
  return map[ext] || "plaintext";
};

const RepoCodeViewer: React.FC<Props> = ({ filePath, content, loading, onClose }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && content) {
      codeRef.current.removeAttribute("data-highlighted");
      hljs.highlightElement(codeRef.current);
    }
  }, [content]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", background: "#1E1E1E" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid #333" }}>
        <Typography sx={{ fontFamily: SANS, fontSize: "12px", color: "#DDD", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {filePath || "No file selected"}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#999" }}>
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Typography sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_MUTED, p: 2 }}>Loading file…</Typography>
        ) : filePath ? (
          <Box component="pre" sx={{ m: 0, p: 2, fontSize: "12.5px", lineHeight: 1.6 }}>
            <Box component="code" ref={codeRef} className={`language-${getLanguageFromPath(filePath)}`}>
              {content}
            </Box>
          </Box>
        ) : (
          <Typography sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_MUTED, p: 2 }}>
            Select a file from the tree to preview it here.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default RepoCodeViewer;