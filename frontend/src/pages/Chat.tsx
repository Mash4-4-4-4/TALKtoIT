//very important file understand this!!!
import React, { useEffect, useState } from "react";
import PdfUpload from "../components/PdfUpload";
import { deleteAllChats, getAllChats } from "../helpers/api.communication";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkCold } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Box,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../context/AuthContext";
import { sendChatMessages } from "../helpers/api.communication";
import { toast } from "react-hot-toast";
import { FaFilePdf, FaRobot } from "react-icons/fa";

/* ─── Add to your global CSS / index.css ──────────────────────────────────────
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
   ─────────────────────────────────────────────────────────────────────────── */

// ── design tokens ── minimalist dark-card aesthetic ─────────────────────────
const PAGE_BG        = "#F3F1EC"; // warm ivory backdrop
const CARD           = "#18181A"; // near-black card surface
const CARD_ALT       = "#222224"; // nested surface within a dark card
const SURFACE        = "#FFFFFF"; // light card surface
const BORDER_SOFT     = "#E8E5DC"; // hairline on light bg
const BORDER_DARK     = "#333335"; // hairline on dark card
const TEXT_INK        = "#17171A"; // primary text on light
const TEXT_MUTED      = "#8B8A84"; // secondary text on light
const TEXT_PAPER      = "#F6F5F1"; // primary text on dark
const TEXT_PAPER_DIM  = "#9C9B9E"; // secondary text on dark
const ACCENT          = "#7C9473"; // quiet sage — status/success only
const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";

// ── types (unchanged) ─────────────────────────────────────────────────────────
type Message = {
  role: "user" | "assistant";
  content: string;
};

// ── helpers (unchanged) ───────────────────────────────────────────────────────
function extractCodeFromString(message: string) {
  if (message.includes("```")) {
    const blocks = message.split("```");
    return blocks;
  }
  return [message];
}

function isCodeBlock(str: string) {
  if (
    str.includes("=") ||
    str.includes(";") ||
    str.includes("[") ||
    str.includes("]") ||
    str.includes("{") ||
    str.includes("}") ||
    str.includes("#") ||
    str.includes("import") ||
    str.includes("from") ||
    str.includes("//")
  ) {
    return true;
  }
  return false;
}

// ── component ─────────────────────────────────────────────────────────────────
const Chat = () => {
  const navigate  = useNavigate();
  const inputRef  = React.useRef<HTMLInputElement>(null);
  const auth      = useAuth();

  // ── input text tracker — drives the disabled state of the send button ───────
  const [inputValue, setInputValue] = useState<string>("");

  // ── chat messages ──────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);

  // ── user display name ──────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const user = auth?.user;
    if (!user) return;
    const name =
      (user as any).name ||
      (user as any).username ||
      (user as any).email?.split("@")[0] ||
      "";
    setDisplayName(name);
  }, [auth?.user]);

  // ── scroll-to-bottom ───────────────────────────────────────────────────────
  const messagesBoxRef  = React.useRef<HTMLDivElement>(null);
  const messagesEndRef  = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = React.useState(false);

  // ── handlers (unchanged logic) ────────────────────────────────────────────
  const handleSend = async () => {
    const content = inputRef.current?.value as string;
    if (!content?.trim()) return; // guard: never send empty
    if (inputRef.current) inputRef.current.value = "";
    setInputValue(""); // clear tracker → re-disables button immediately
    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);
    try {
      const chatData = await sendChatMessages(content);
      setChatMessages(chatData.chats);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteChats = () => {
    try {
      deleteAllChats();
      setChatMessages([]);
      toast.success("Chats deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete chats");
    }
  };

  const hasFetched = React.useRef(false);
  useEffect(() => {
    if (auth?.isLoggedIn && auth?.user) {
      if (hasFetched.current) return;
      hasFetched.current = true;
      const toastID = toast.loading("Fetching chats...");
      getAllChats()
        .then((data) => {
          setChatMessages([...data.chats]);
          toast.success("Chats loaded successfully", { id: toastID });
        })
        .catch((err) => {
          toast.error("Failed to load chats", { id: toastID });
          console.log(err);
        });
    }
  }, [auth]);

  useEffect(() => {
    if (!auth?.user) navigate("/login");
  }, [auth]);

  // ── scroll handler: show arrow when user has scrolled up ──────────────────
  const handleMessagesScroll = () => {
    const el = messagesBoxRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 120);
  };

  // ── scroll to bottom helper ────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ── auto-scroll on new message (only if already near bottom) ──────────────
  useEffect(() => {
    const el = messagesBoxRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 200) scrollToBottom();
  }, [chatMessages]);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        background: PAGE_BG,
        fontFamily: SANS,
        p: "16px",
        gap: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* ── SIDEBAR ── */}
      <Box
        sx={{
          width: "240px", minWidth: "240px", height: "100%", overflow: "hidden",
          background: CARD, borderRadius: "24px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* user info */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "10px" }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT }} />
            <Typography sx={{ fontFamily: SANS, fontSize: "11px", letterSpacing: "0.5px", color: TEXT_PAPER_DIM, fontWeight: 500 }}>
              Online
            </Typography>
          </Box>
          <Typography sx={{ fontFamily: SANS, fontWeight: 700, fontSize: "20px", color: TEXT_PAPER, letterSpacing: "-0.3px" }}>
            {displayName || (
              <Box component="span" sx={{ color: TEXT_PAPER_DIM }}>Loading…</Box>
            )}
          </Typography>
        </Box>

        <Box sx={{ height: "1px", background: BORDER_DARK, mx: 2.5 }} />

        {/* nav */}
        <Box sx={{ px: 1.5, pt: 2, display: "flex", flexDirection: "column", gap: "4px" }}>
          <Box
            onClick={() => setChatMessages([])}
            sx={{
              mx: 1, borderRadius: "14px", px: "14px", py: "11px",
              fontFamily: SANS, fontSize: "13px", fontWeight: 600, letterSpacing: "0.1px",
              color: TEXT_PAPER, cursor: "pointer",
              background: CARD_ALT,
              display: "flex", alignItems: "center", gap: "10px",
              transition: "background 0.15s",
              "&:hover": { background: "#2a2a2c" },
            }}
          >
            <FaRobot size={13} /> AI Chat
          </Box>

          <Box
            onClick={() => navigate("/pdf")}
            sx={{
              mx: 1, borderRadius: "14px", px: "14px", py: "11px",
              fontFamily: SANS, fontSize: "13px", fontWeight: 500, letterSpacing: "0.1px",
              color: TEXT_PAPER_DIM, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "10px",
              transition: "background 0.15s, color 0.15s",
              "&:hover": { background: CARD_ALT, color: TEXT_PAPER },
            }}
          >
            <FaFilePdf size={13} /> PDF Chat
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* clear chats */}
        <Box sx={{ px: 1.5, pb: 2 }}>
          <Box
            onClick={handleDeleteChats}
            sx={{
              mx: 1, borderRadius: "14px", px: "14px", py: "11px",
              fontFamily: SANS, fontSize: "13px", fontWeight: 500, letterSpacing: "0.1px",
              color: TEXT_PAPER_DIM, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "10px",
              transition: "background 0.15s, color 0.15s",
              "&:hover": { background: CARD_ALT, color: "#D98577" },
            }}
          >
            <DeleteIcon sx={{ fontSize: "15px" }} /> Clear chat
          </Box>
        </Box>

        <Typography sx={{ fontFamily: SANS, fontSize: "10px", color: "#4A4A4C", letterSpacing: "0.2px", textAlign: "center", pb: 2 }}>
          TalkToIt
        </Typography>
      </Box>

      {/* ── MAIN CHAT AREA ── */}
      <Box
        sx={{
          flex: 1, minWidth: 0, height: "100%", display: "flex",
          flexDirection: "column", overflow: "hidden", position: "relative",
          background: SURFACE, borderRadius: "24px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.06)",
        }}
      >
        {/* chat titlebar */}
        <Box sx={{ borderBottom: `1px solid ${BORDER_SOFT}`, px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontFamily: SANS, fontWeight: 600, fontSize: "14px", letterSpacing: "-0.1px", color: TEXT_INK }}>
            Assistant
          </Typography>
          <Typography sx={{ fontFamily: SANS, fontSize: "11px", fontWeight: 500, letterSpacing: "0.2px", color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "6px" }}>
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
            Live
          </Typography>
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
          {chatMessages.map((chat, index) => (
            <Box
              key={index}
              sx={{ display: "flex", flexDirection: "column", alignItems: chat.role === "user" ? "flex-end" : "flex-start", width: "100%" }}
            >
              <Box
                sx={{
                  width: chat.role === "assistant" ? "100%" : "auto",
                  maxWidth: chat.role === "assistant" ? "100%" : "70%",
                  wordBreak: "break-word", overflowWrap: "break-word",
                  borderRadius: chat.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: chat.role === "user" ? CARD : "#F5F4EF",
                  px: 2.25, py: 1.5,
                }}
              >
                {(() => {
                  const hasFence = chat.content.includes("```");
                  const blocks   = hasFence ? chat.content.split("```") : [chat.content];
                  return blocks.map((block, idx) => {
                    const isFencedCode = hasFence && idx % 2 !== 0;
                    if (isFencedCode) {
                      const lines = block.split("\n");
                      const lang  = lines[0].trim() || "text";
                      const code  = lines.slice(1).join("\n");
                      return (
                        <SyntaxHighlighter key={idx} language={lang} style={coldarkCold}
                          customStyle={{ borderRadius: "10px", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", margin: "8px 0", overflowX: "auto", maxWidth: "100%", whiteSpace: "pre" }}>
                          {code}
                        </SyntaxHighlighter>
                      );
                    }
                    if (!block.trim()) return null;
                    return (
                      <Typography key={idx}
                        sx={{ fontFamily: SANS, fontSize: "14px", letterSpacing: "0.1px", lineHeight: 1.65, color: chat.role === "user" ? TEXT_PAPER : TEXT_INK, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
                        {block}
                      </Typography>
                    );
                  });
                })()}
              </Box>
            </Box>
          ))}

          <div ref={messagesEndRef} style={{ height: 0 }} />
        </Box>

        {/* ── SCROLL TO BOTTOM ARROW ── */}
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
            placeholder="Message the assistant…"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && inputValue.trim()) handleSend(); }}
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
            disabled={!inputValue.trim()}
            sx={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: inputValue.trim() ? CARD : "#EDEBE3",
              color: inputValue.trim() ? TEXT_PAPER : TEXT_MUTED,
              transition: "all 0.15s",
              "&:hover": { background: inputValue.trim() ? "#000" : "#EDEBE3" },
              "&.Mui-disabled": { color: TEXT_MUTED },
            }}
          >
            <SendIcon sx={{ fontSize: "18px" }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;