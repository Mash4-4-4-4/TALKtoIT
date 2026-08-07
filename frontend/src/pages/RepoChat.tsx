import React, { useEffect, useRef, useState } from "react";
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
import { toast } from "react-hot-toast";
import { useAppTheme } from "../context/ThemeContext";
import { FaGithub } from "react-icons/fa";
import ThinkingIndicator from "../components/shared/ThinkingIndicator";
import { confirmToast } from "../components/shared/ConfirmToast";

import RepoFileTree, { type FileTreeNode } from "../components/RepoFileTree";
import RepoCodeViewer from '../components/RepoCodeViewer';
import { getRepoTree, getRepoFile } from '../helpers/api.communication';
import CodeIcon from "@mui/icons-material/Code";

type RepoType = {
  _id: string;
  repoName: string;
  status?: "processing" | "ready" | "failed";
  source?: "zip" | "github";
  errorMessage?: string | null;
};
type Message = { role: "user" | "assistant"; content: string };

// stepped messages shown while a repo is indexing in the background
const PROCESSING_STEPS = [
  "Uploading the repo…",
  "Extracting code…",
  "Indexing files…",
  "Almost there…",
  "Get ready with your questions…",
];

// cycles through PROCESSING_STEPS every ~1.8s — used next to any repo whose
// status is still "processing" so the sidebar always shows clear progress
// instead of looking stuck.
const ProcessingLabel = ({ color }: { color: string }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % PROCESSING_STEPS.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <Box component="span" sx={{ color, fontSize: "11px", fontWeight: 500, display: "block", mt: "1px" }}>
      {PROCESSING_STEPS[step]}
    </Box>
  );
};

const RepoChat = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { tokens } = useAppTheme();
  const { PAGE_BG, CARD, CARD_ALT, SURFACE, SURFACE_ALT, SURFACE_MUTED, ON_ACCENT, BORDER_SOFT, BORDER_DARK, TEXT_INK, TEXT_MUTED, TEXT_PAPER, TEXT_PAPER_DIM, ACCENT, ACCENT_WARN, ACCENT_DANGER, SANS } = tokens;

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
      return data.repos as RepoType[];
    } catch (error) {
      console.error("Error fetching repositories:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  // ── auto-refresh the repo list while anything is still indexing ──────────
  // No manual page refresh needed: this polls in the background and stops
  // itself once every repo has settled into "ready" or "failed", then
  // announces the transition with a toast.
  const prevStatuses = useRef<Record<string, string>>({});
  useEffect(() => {
    const anyProcessing = repos.some((r) => r.status === "processing");
    if (!anyProcessing) {
      // still record current statuses so future transitions are detected correctly
      repos.forEach((r) => { prevStatuses.current[r._id] = r.status || "ready"; });
      return;
    }

    const interval = setInterval(async () => {
      const fresh = await fetchRepos();
      if (!fresh) return;
      fresh.forEach((r) => {
        const prev = prevStatuses.current[r._id];
        if (prev === "processing" && r.status === "ready") {
          toast.success(`"${r.repoName}" finished indexing — ask away!`);
        } else if (prev === "processing" && r.status === "failed") {
          toast.error(`"${r.repoName}" failed to index${r.errorMessage ? `: ${r.errorMessage}` : "."}`);
        }
        prevStatuses.current[r._id] = r.status || "ready";
      });
      // keep the currently-open repo's status in sync too
      setSelectedRepo((current) => {
        if (!current) return current;
        const match = fresh.find((r) => r._id === current._id);
        return match ? { ...current, status: match.status, errorMessage: match.errorMessage } : current;
      });
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repos.some((r) => r.status === "processing")]);

const handleSelectRepo = async (repo: RepoType) => {
  setSelectedRepo(repo);
  setMessages([]); // clear immediately so old repo's messages don't flash
  if (inputRef.current) inputRef.current.value = "";
  setInputValue("");

  if (repo.status === "processing") {
    toast(`"${repo.repoName}" is still indexing — you can ask questions once it's ready.`, { icon: "⏳" });
    return;
  }
  if (repo.status === "failed") {
    toast.error(`"${repo.repoName}" failed to index${repo.errorMessage ? `: ${repo.errorMessage}` : "."} Try deleting and re-uploading it.`);
    return;
  }

  try {
    const data = await getRepoChatHistory(repo._id);
    setMessages(data.messages || []);
  } catch (error) {
    console.error("Error loading repo chat history:", error);
    toast.error("Couldn't load this repository's chat history.");
  }
};
  const handleSend = async () => {
    try {
      if (!selectedRepo) {
        toast.error("Select a repository from the sidebar before asking a question.");
        return;
      }
      if (selectedRepo.status === "processing") {
        toast(`"${selectedRepo.repoName}" is still indexing — hang tight.`, { icon: "⏳" });
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
    } catch (error: any) {
      console.error("Error asking repo question:", error);
      setLoading(false);
      toast.error(error.response?.data?.message || "Couldn't get an answer for that question. Please try again.");
    }
  };

  const handleDeleteRepo = async (e: React.MouseEvent, repo: RepoType) => {
    e.stopPropagation();
    confirmToast(tokens, `Delete "${repo.repoName}"? This can't be undone.`, async () => {
      try {
        await deleteRepo(repo._id);
        if (selectedRepo?._id === repo._id) {
          setSelectedRepo(null);
          setMessages([]);
        }
        await fetchRepos();
        toast.success(`"${repo.repoName}" was deleted.`);
      } catch (error) {
        console.error("Error deleting repository:", error);
        toast.error(`Couldn't delete "${repo.repoName}". Please try again.`);
      }
    });
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
  }, [messages, loading]);

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
      toast.error("Couldn't load the file tree for this repository.");
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
    toast.error(`Couldn't open "${filePath}".`);
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
      color: showFilePanel ? ON_ACCENT : TEXT_MUTED,
      background: showFilePanel ? "#F0EEE6" : "transparent",
      borderRadius: "8px",
      "&:hover": { background: "#F0EEE6", color: ON_ACCENT },
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

        {/* no-repo hint */}
        {!selectedRepo && !processing && repos.length === 0 && (
          <Typography
            sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_PAPER_DIM, textAlign: "center", mt: 3, px: 2 }}
          >
            Upload a ZIP or paste a GitHub link to begin
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
            const statusColor =
              repo.status === "failed" ? ACCENT_DANGER : repo.status === "processing" ? ACCENT_WARN : ACCENT;
            return (
              <Box
                key={repo._id}
                onClick={() => handleSelectRepo(repo)}
                title={repo.status === "failed" ? (repo.errorMessage || "Indexing failed") : undefined}
                sx={{
                  px: "14px", py: "11px", mb: "4px", borderRadius: "14px",
                  background: isSelected ? CARD_ALT : "transparent",
                  color: isSelected ? TEXT_PAPER : TEXT_PAPER_DIM,
                  fontFamily: SANS, fontSize: "13px", fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "flex-start", gap: "8px",
                  "&:hover": { background: CARD_ALT, color: TEXT_PAPER },
                  "&:hover .repo-delete-btn": { opacity: 1 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6, height: 6, borderRadius: "50%", background: statusColor,
                    flexShrink: 0, mt: "6px",
                    animation: repo.status === "processing" ? "repoPulse 1.4s ease-in-out infinite" : "none",
                    "@keyframes repoPulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.35 } },
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box component="span" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {repo.source === "github" ? <FaGithub size={11} style={{ marginRight: 5, verticalAlign: "-1px" }} /> : null}
                    {repo.repoName}
                  </Box>
                  {repo.status === "processing" && <ProcessingLabel color={ACCENT_WARN} />}
                  {repo.status === "failed" && (
                    <Box component="span" sx={{ color: ACCENT_DANGER, fontSize: "11px", fontWeight: 500, display: "block", mt: "1px" }}>
                      Indexing failed — tap for details
                    </Box>
                  )}
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
            {selectedRepo && selectedRepo.status !== "processing" && messages.length > 0 && (
              <Typography sx={{ fontFamily: SANS, fontSize: "11px", color: TEXT_MUTED }}>
                {Math.ceil(messages.length / 2)} exchange{messages.length > 2 ? "s" : ""}
              </Typography>
            )}
            <Typography
              sx={{ fontFamily: SANS, fontSize: "11px", fontWeight: 500, letterSpacing: "0.2px", color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Box
                component="span"
                sx={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: !selectedRepo ? "#D8D5CB" : selectedRepo.status === "failed" ? ACCENT_DANGER : selectedRepo.status === "processing" ? ACCENT_WARN : ACCENT,
                  display: "inline-block",
                }}
              />
              {!selectedRepo ? "Idle" : selectedRepo.status === "processing" ? "Indexing…" : selectedRepo.status === "failed" ? "Failed" : "Ready"}
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
                  ? selectedRepo.status === "processing"
                    ? `Indexing "${selectedRepo.repoName}"…\nYou'll be able to ask questions as soon as it's ready.`
                    : selectedRepo.status === "failed"
                    ? `"${selectedRepo.repoName}" failed to index.\n${selectedRepo.errorMessage || "Try deleting it and uploading again."}`
                    : `Codebase indexed: ${selectedRepo.repoName}\nAsk any architecture, code, or implementation questions`
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
    background: message.role === "user" ? CARD : SURFACE_ALT,
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
              bgcolor: SURFACE_ALT,
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
              color: TEXT_INK,

              "& td,& th": {
                border: `1px solid ${BORDER_SOFT}`,
                p: 1,
              },

              "& th": {
                bgcolor: SURFACE_MUTED,
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
            <ThinkingIndicator labels={["Analyzing the codebase", "Thinking", "Replying"]} />
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
            placeholder={selectedRepo?.status === "processing" ? "Indexing in progress — hang tight…" : "Ask about the codebase…"}
            disabled={selectedRepo?.status === "processing"}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputValue.trim() && !loading) handleSend();
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: SURFACE_ALT, borderRadius: "999px", transition: "background 0.2s ease",
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
            disabled={!inputValue.trim() || loading || !selectedRepo || selectedRepo.status === "processing"}
            sx={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: (!inputValue.trim() || loading || !selectedRepo || selectedRepo.status === "processing") ? SURFACE_MUTED : CARD,
              color: (!inputValue.trim() || loading || !selectedRepo || selectedRepo.status === "processing") ? TEXT_MUTED : TEXT_PAPER,
              transition: "all 0.15s",
              "&:hover": {
                background: (!inputValue.trim() || loading || !selectedRepo || selectedRepo.status === "processing") ? SURFACE_MUTED : "#000",
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