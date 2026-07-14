import React, { useEffect, useState } from "react";
import RepoUpload from '../components/RepoUpload';
import {
  Box,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getRepoChatHistory } from '../helpers/api.communication';
import { SendIcon } from 'lucide-react';
import { getAllRepos, askRepoQuestion, deleteRepo } from '../helpers/api.communication';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";

import RepoFileTree, { type FileTreeNode } from "../components/RepoFileTree";
import RepoCodeViewer from '../components/RepoCodeViewer';
import { getRepoTree, getRepoFile } from '../helpers/api.communication';
import CodeIcon from "@mui/icons-material/Code";

// ── design tokens ── minimalist dark-card aesthetic ─────────────────────────
const PAGE_BG        = "#F3F1EC";
const CARD           = "#18181A";
const CARD_ALT       = "#222224";
const SURFACE        = "#FFFFFF";
const BORDER_SOFT     = "#E8E5DC";
const BORDER_DARK     = "#333335";
const TEXT_INK        = "#17171A";
const TEXT_MUTED      = "#8B8A84";
const TEXT_PAPER      = "#F6F5F1";
const TEXT_PAPER_DIM  = "#9C9B9E";
const ACCENT          = "#7C9473";
const ACCENT_WARN     = "#C98A4B";
const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";

type RepoType = { _id: string; repoName: string };
type Message = { role: "user" | "assistant"; content: string };


const RepoChat = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [repos, setRepos] = useState<RepoType[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepoType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const messagesBoxRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [showFilePanel, setShowFilePanel] = useState(false);
const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
const [treeLoading, setTreeLoading] = useState(false);
const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
const [fileContent, setFileContent] = useState("");
const [fileLoading, setFileLoading] = useState(false);

  const fetchRepos = async () => {
    try {
      const data = await getAllRepos();
      setRepos(data.repos || []);
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);
const handleSelectRepo = async (repo: RepoType) => {
  setSelectedRepo(repo);
  setMessages([]); // clear immediately so old repo's messages don't flash
  if (inputRef.current) inputRef.current.value = "";
  setInputValue("");

  try {
    const data = await getRepoChatHistory(repo._id);
    setMessages(data.messages || []);
  } catch (error) {
    console.error("Error loading repo chat history:", error);
  }
};
  const handleSend = async () => {
    try {
      if (!selectedRepo) {
        alert("Select a Repository first");
        return;
      }
      const question = inputRef.current?.value?.trim();
      if (!question) return;

      const userMessage: Message = { role: "user", content: question };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      if (inputRef.current) inputRef.current.value = "";
      setInputValue("");

      const response = await askRepoQuestion(selectedRepo._id, question);
      const assistantMessage: Message = { role: "assistant", content: response.answer };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    } catch (error) {
      console.error("Error asking repo question:", error);
      setLoading(false);
    }
  };

  const handleDeleteRepo = async (e: React.MouseEvent, repo: RepoType) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${repo.repoName}?`)) return;
    try {
      await deleteRepo(repo._id);
      if (selectedRepo?._id === repo._id) {
        setSelectedRepo(null);
        setMessages([]);
      }
      await fetchRepos();
    } catch (error) {
      console.error("Error deleting repository:", error);
    }
  };

  const handleMessagesScroll = () => {
    const el = messagesBoxRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const el = messagesBoxRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) scrollToBottom();
  }, [messages]);

  const handleToggleFilePanel = async () => {
  if (!selectedRepo) return;
  const opening = !showFilePanel;
  setShowFilePanel(opening);
  if (opening && fileTree.length === 0) {
    setTreeLoading(true);
    try {
      const data = await getRepoTree(selectedRepo._id);
      setFileTree(data.tree || []);
    } catch (error) {
      console.error("Error loading repo tree:", error);
    } finally {
      setTreeLoading(false);
    }
  }
};

const handleSelectFile = async (filePath: string) => {
  if (!selectedRepo) return;
  setSelectedFilePath(filePath);
  setFileLoading(true);
  try {
    const data = await getRepoFile(selectedRepo._id, filePath);
    setFileContent(data.content || "");
  } catch (error) {
    console.error("Error loading file content:", error);
    setFileContent("// Failed to load file");
  } finally {
    setFileLoading(false);
  }
};

  return (
    <Box
      sx={{
        display: "flex", height: "100vh", maxHeight: "100vh",
        overflow: "hidden", background: PAGE_BG, fontFamily: SANS,
        p: "16px", gap: "16px", boxSizing: "border-box",
      }}
    >
      {/* ── SIDEBAR ── */}
      <Box
        sx={{
          width: "280px", minWidth: "280px", height: "100%", overflow: "hidden",
          background: CARD, borderRadius: "24px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* titlebar */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          {selectedRepo && (
  <IconButton
    onClick={handleToggleFilePanel}
    size="small"
    sx={{
      color: showFilePanel ? TEXT_INK : TEXT_MUTED,
      background: showFilePanel ? "#F0EEE6" : "transparent",
      borderRadius: "8px",
      "&:hover": { background: "#F0EEE6" },
    }}
  >
    <CodeIcon sx={{ fontSize: "17px" }} />
  </IconButton>
)}
          <Typography sx={{ fontFamily: SANS, fontWeight: 700, fontSize: "17px", color: TEXT_PAPER, letterSpacing: "-0.2px" }}>
            Repositories
          </Typography>
          <Typography sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_PAPER_DIM, mt: "2px" }}>
            Ask questions about any indexed codebase
          </Typography>
        </Box>

        {/* upload section */}
        <Box sx={{ px: 2 }}>
          <RepoUpload
            fetchRepos={fetchRepos}
            setSelectedRepo={(repo) => handleSelectRepo(repo)}
            setProcessing={setProcessing}
          />
        </Box>

        {/* processing indicator */}
        {processing && (
          <Typography
            sx={{ fontFamily: SANS, fontSize: "12px", color: ACCENT_WARN, textAlign: "center", mt: 2, px: 2, fontWeight: 500 }}
          >
            Extracting and indexing codebase…
          </Typography>
        )}

        {/* no-repo hint */}
        {!selectedRepo && !processing && (
          <Typography
            sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_PAPER_DIM, textAlign: "center", mt: 3, px: 2 }}
          >
            Upload or select a repo to begin
          </Typography>
        )}

        {/* Repos list */}
        {repos.length > 0 && (
          <Typography sx={{ fontFamily: SANS, fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px", color: TEXT_PAPER_DIM, px: 2.5, pt: 2.5, pb: 1 }}>
            INDEXED REPOSITORIES ({repos.length})
          </Typography>
        )}

        <Box
          sx={{
            flex: 1, overflowY: "auto", px: 1.5, pb: 2,
            "&::-webkit-scrollbar": { width: "3px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: BORDER_DARK },
          }}
        >
          {repos.map((repo) => {
            const isSelected = selectedRepo?._id === repo._id;
            return (
              <Box
                key={repo._id}
                onClick={() => handleSelectRepo(repo)}
                sx={{
                  px: "14px", py: "11px", mb: "4px", borderRadius: "14px",
                  background: isSelected ? CARD_ALT : "transparent",
                  color: isSelected ? TEXT_PAPER : TEXT_PAPER_DIM,
                  fontFamily: SANS, fontSize: "13px", fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "8px",
                  "&:hover": { background: CARD_ALT, color: TEXT_PAPER },
                  "&:hover .repo-delete-btn": { opacity: 1 },
                }}
              >
                <Box component="span" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {repo.repoName}
                </Box>
                <Box
                  className="repo-delete-btn"
                  onClick={(e) => handleDeleteRepo(e, repo)}
                  sx={{
                    opacity: 0, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: TEXT_PAPER_DIM, transition: "all 0.15s",
                    "&:hover": { color: "#D98577" },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: "15px" }} />
                </Box>
              </Box>
            );
          })}
        </Box>

        <Typography sx={{ fontFamily: SANS, fontSize: "10px", color: "#4A4A4C", letterSpacing: "0.2px", textAlign: "center", pb: 2 }}>
          TalkToIt
        </Typography>
      </Box>
{showFilePanel && selectedRepo && (
  <Box
    sx={{
      width: "560px", minWidth: "560px", height: "100%", overflow: "hidden",
      display: "flex", borderRadius: "24px",
      boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
    }}
  >
    <Box sx={{ width: "200px", minWidth: "200px", background: CARD, overflowY: "auto", py: 1.5 }}>
      {treeLoading ? (
        <Typography sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_PAPER_DIM, px: 2, py: 1 }}>
          Loading tree…
        </Typography>
      ) : (
        <RepoFileTree nodes={fileTree} selectedPath={selectedFilePath} onSelectFile={handleSelectFile} />
      )}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <RepoCodeViewer
        filePath={selectedFilePath}
        content={fileContent}
        loading={fileLoading}
        onClose={() => setShowFilePanel(false)}
      />
    </Box>
  </Box>
)}
      {/* ── MAIN CHAT AREA ── */}
      <Box
        sx={{
          flex: 1, minWidth: 0, height: "100%", display: "flex",
          flexDirection: "column", overflow: "hidden", position: "relative",
          background: SURFACE, borderRadius: "24px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
        }}
      >
        {/* titlebar */}
        <Box
          sx={{
            borderBottom: `1px solid ${BORDER_SOFT}`, px: 3, py: 2,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <Typography sx={{ fontFamily: SANS, fontWeight: 600, fontSize: "14px", letterSpacing: "-0.1px", color: TEXT_INK }}>
            {selectedRepo ? selectedRepo.repoName : "No repository selected"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {selectedRepo && messages.length > 0 && (
              <Typography sx={{ fontFamily: SANS, fontSize: "11px", color: TEXT_MUTED }}>
                {Math.ceil(messages.length / 2)} exchange{messages.length > 2 ? "s" : ""}
              </Typography>
            )}
            <Typography
              sx={{ fontFamily: SANS, fontSize: "11px", fontWeight: 500, letterSpacing: "0.2px", color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", background: selectedRepo ? ACCENT : "#D8D5CB", display: "inline-block" }} />
              {selectedRepo ? "Ready" : "Idle"}
            </Typography>
          </Box>
        </Box>

        {/* ── MESSAGES ── */}
        <Box
          ref={messagesBoxRef}
          onScroll={handleMessagesScroll}
          sx={{
            flex: 1, overflowY: "auto", overflowX: "hidden",
            px: 3, py: 2.5, display: "flex", flexDirection: "column",
            gap: "18px", position: "relative",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: BORDER_SOFT, borderRadius: "4px" },
          }}
        >
          {/* empty state */}
          {messages.length === 0 && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography
                sx={{ fontFamily: SANS, fontSize: "13px", color: TEXT_MUTED, textAlign: "center", whiteSpace: "pre-line" }}
              >
                {selectedRepo
                  ? `Codebase indexed: ${selectedRepo.repoName}\nAsk any architecture, code, or implementation questions`
                  : "Select a repository from the sidebar to chat"
                }
              </Typography>
            </Box>
          )}

          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{ display: "flex", flexDirection: "column", alignItems: message.role === "user" ? "flex-end" : "flex-start", width: "100%" }}
            >
            <Box
  sx={{
    width: "fit-content",
    maxWidth: message.role === "assistant" ? "820px" : "70%",
    background: message.role === "user" ? CARD : "#F8F8F6",
    border:
      message.role === "assistant"
        ? `1px solid ${BORDER_SOFT}`
        : "none",
    borderRadius:
      message.role === "user"
        ? "18px 18px 4px 18px"
        : "18px",
    px: 3,
    py: 2,
    boxShadow:
      message.role === "assistant"
        ? "0 2px 12px rgba(0,0,0,.05)"
        : "none",
    overflow: "hidden",
  }}
>
  {message.role === "user" ? (
    <Typography
      sx={{
        color: TEXT_PAPER,
        fontSize: 15,
        lineHeight: 1.8,
      }}
    >
      {message.content}
    </Typography>
  ) : (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h1: ({ children }) => (
          <Typography
            variant="h4"
            sx={{
              mt: 2,
              mb: 2,
              fontWeight: 700,
              color: TEXT_INK,
            }}
          >
            {children}
          </Typography>
        ),

        h2: ({ children }) => (
          <Typography
            variant="h5"
            sx={{
              mt: 3,
              mb: 1.5,
              fontWeight: 700,
              color: TEXT_INK,
            }}
          >
            {children}
          </Typography>
        ),

        h3: ({ children }) => (
          <Typography
            variant="h6"
            sx={{
              mt: 2.5,
              mb: 1,
              fontWeight: 600,
            }}
          >
            {children}
          </Typography>
        ),

        p: ({ children }) => (
          <Typography
            sx={{
              mb: 2,
              lineHeight: 1.9,
              fontSize: 15,
              color: TEXT_INK,
            }}
          >
            {children}
          </Typography>
        ),

        ul: ({ children }) => (
          <Box
            component="ul"
            sx={{
              pl: 3,
              mb: 2,
            }}
          >
            {children}
          </Box>
        ),

        ol: ({ children }) => (
          <Box
            component="ol"
            sx={{
              pl: 3,
              mb: 2,
            }}
          >
            {children}
          </Box>
        ),

        li: ({ children }) => (
          <Typography
            component="li"
            sx={{
              color: TEXT_INK,
              mb: .8,
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {children}
          </Typography>
        ),

code({ className, children }) {
  const isBlock = className?.startsWith("language-");

  if (!isBlock) {
    return (
      <Box
        component="code"
        sx={{
          px: "6px",
          py: "2px",
          borderRadius: "6px",
          bgcolor: "#ECECEC",
          color: "#C7254E",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.92em",
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="pre"
      sx={{
        bgcolor: "#1E1E1E",
        color: "#fff",
        p: 2,
        borderRadius: 3,
        overflowX: "auto",
        my: 2,
      }}
    >
      <code className={className}>{children}</code>
    </Box>
  );
},

        blockquote: ({ children }) => (
          <Box
            sx={{
              borderLeft: "4px solid #7C9473",
              pl: 2,
              py: 1,
              my: 2,
              bgcolor: "#F3F6F2",
              fontStyle: "italic",
            }}
          >
            {children}
          </Box>
        ),

        table: ({ children }) => (
          <Box
            component="table"
            sx={{
              borderCollapse: "collapse",
              width: "100%",
              my: 2,

              "& td,& th": {
                border: "1px solid #ddd",
                p: 1,
              },

              "& th": {
                bgcolor: "#F5F5F5",
                fontWeight: 700,
              },
            }}
          >
            {children}
          </Box>
        ),
      }}
    >
      {message.content}
    </ReactMarkdown>
  )}
</Box>
            </Box>
          ))}

          {/* thinking indicator */}
          {loading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
              <Box sx={{ borderRadius: "18px 18px 18px 4px", background: "#F5F4EF", px: 2.25, py: 1.5 }}>
                <Typography sx={{ fontFamily: SANS, fontSize: "14px", color: TEXT_MUTED }}>
                  Analyzing the codebase…
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} style={{ height: 0 }} />
        </Box>

        {/* scroll arrow */}
        {showScrollBtn && (
          <Box
            onClick={scrollToBottom}
            sx={{
              position: "absolute", bottom: "88px", right: "28px", zIndex: 10,
              width: "38px", height: "38px", borderRadius: "50%",
              background: CARD, boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "transform 0.15s",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <KeyboardArrowDownIcon sx={{ color: TEXT_PAPER, fontSize: "20px" }} />
          </Box>
        )}

        {/* ── INPUT AREA ── */}
        <Box
          sx={{
            px: 3, py: 2.5, display: "flex", gap: "10px", alignItems: "center",
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            variant="outlined"
            placeholder="Ask about the codebase…"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim() && !loading) handleSend();
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "#F5F4EF", borderRadius: "999px",
                "& fieldset": { border: "none" },
              },
              "& .MuiInputBase-input": {
                color: TEXT_INK, fontFamily: SANS, fontSize: "14px", letterSpacing: "0.1px", py: "13px", px: "8px",
                "&::placeholder": { color: TEXT_MUTED, opacity: 1 },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim() || loading || !selectedRepo}
            sx={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: (!inputValue.trim() || loading || !selectedRepo) ? "#EDEBE3" : CARD,
              color: (!inputValue.trim() || loading || !selectedRepo) ? TEXT_MUTED : TEXT_PAPER,
              transition: "all 0.15s",
              "&:hover": {
                background: (!inputValue.trim() || loading || !selectedRepo) ? "#EDEBE3" : "#000",
              },
              "&.Mui-disabled": { color: TEXT_MUTED },
            }}
          >
            <SendIcon size={18} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default RepoChat;