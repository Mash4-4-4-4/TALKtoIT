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

// ── theme tokens ───────────────────────────────────────────────────────────────
const CYAN  = "#00ffcc";
const RED   = "#ff2244";
const AMBER = "#ffaa00";
const GREEN = "#00ff41";
const BLACK = "#000000";
const BODY  = "#c8f0e8";
const MONO  = "'Share Tech Mono', 'Courier New', monospace";
const PIXEL = "'VT323', 'Courier New', monospace";

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
  // We track the input value in state so React re-renders when it changes.
  const [inputValue, setInputValue] = useState<string>("");

  // ── chat messages ──────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);

  // ── user display name ──────────────────────────────────────────────────────
  // auth.user resolves asynchronously after login/signup.
  // Watch it and update displayName as soon as it's available.
  // Tries .name → .username → email prefix, in that order.
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    const user = auth?.user;
    if (!user) return;
    const name =
      (user as any).name ||
      (user as any).username ||
      (user as any).email?.split("@")[0] ||
      "";
    setDisplayName(name.toUpperCase());
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
        background: BLACK,
        fontFamily: MONO,
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,200,0.012) 2px,rgba(0,255,200,0.012) 4px)",
          pointerEvents: "none",
          zIndex: 9999,
        },
        "@keyframes ttoBlink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        "@keyframes ttoPulse":  { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
      }}
    >
      {/* ── SIDEBAR ── */}
      <Box
        sx={{
          width: "220px", minWidth: "220px", height: "100vh", overflow: "hidden",
          background: BLACK, borderRight: `1.5px solid ${CYAN}`,
          boxShadow: `2px 0 12px ${CYAN}22`, display: "flex",
          flexDirection: "column", position: "relative", zIndex: 1,
        }}
      >
        {/* titlebar */}
        <Box sx={{ borderBottom: `1px solid ${CYAN}44`, px: 1.5, py: 0.75, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: CYAN }}>TALKTOIT OS</Typography>
          <Box sx={{ display: "flex", gap: "4px" }}>
            {[0,1,2].map(i => <Box key={i} sx={{ width: 7, height: 7, border: `1px solid ${CYAN}` }} />)}
          </Box>
        </Box>

        {/* user info — displayName updates reactively once auth resolves */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${CYAN}22` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "4px" }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: `0 0 5px ${GREEN}`, animation: "ttoPulse 2s infinite" }} />
            <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1px", color: GREEN }}>USER ONLINE</Typography>
          </Box>
          <Typography sx={{ fontFamily: PIXEL, fontSize: "20px", color: CYAN, letterSpacing: "2px" }}>
            {displayName || (
              <Box component="span" sx={{ animation: "ttoBlink 1s step-end infinite", color: `${CYAN}66` }}>
                LOADING...
              </Box>
            )}
          </Typography>
        </Box>

        {/* modules label */}
        <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: `${CYAN}55`, px: 2, pt: 2, pb: 1 }}>
          &gt; MODULES
        </Typography>

        {/* AI Chat */}
        <Box
          onClick={() => setChatMessages([])}
          sx={{ mx: 2, mb: 1, border: `1px solid ${CYAN}55`, px: "12px", py: "8px", fontFamily: MONO, fontSize: "11px", letterSpacing: "2px", color: CYAN, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s", "&:hover": { background: `${CYAN}11`, borderColor: CYAN } }}
        >
          <FaRobot size={13} /> AI CHAT
        </Box>

        {/* PDF Chat */}
        <Box
          onClick={() => navigate("/pdf")}
          sx={{ mx: 2, mb: 1, border: `1px solid ${AMBER}55`, px: "12px", py: "8px", fontFamily: MONO, fontSize: "11px", letterSpacing: "2px", color: AMBER, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s", "&:hover": { background: `${AMBER}11`, borderColor: AMBER } }}
        >
          <FaFilePdf size={13} /> PDF CHAT
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Clear log */}
        <Box
          onClick={handleDeleteChats}
          sx={{ mx: 2, mb: 2, border: `1px solid ${RED}55`, px: "12px", py: "8px", fontFamily: MONO, fontSize: "11px", letterSpacing: "2px", color: RED, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s", "&:hover": { background: `${RED}11`, borderColor: RED } }}
        >
          <DeleteIcon sx={{ fontSize: "13px" }} /> CLEAR LOG
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: "9px", color: `${CYAN}33`, letterSpacing: "1px", textAlign: "center", pb: 1.5 }}>
          TALKTOIT OS v1.0
        </Typography>
      </Box>

      {/* ── MAIN CHAT AREA ── */}
      <Box
        sx={{
          flex: 1, minWidth: 0, height: "100vh", display: "flex",
          flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1,
        }}
      >
        {/* chat titlebar */}
        <Box sx={{ borderBottom: `1px solid ${CYAN}44`, px: 2, py: 0.75, display: "flex", justifyContent: "space-between", alignItems: "center", background: BLACK }}>
          <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: CYAN }}>
            AI_CORE.EXE &nbsp;—&nbsp; GROQ LLAMA 3.3 70B
          </Typography>
          <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: RED, animation: "ttoBlink 1.5s step-end infinite" }}>
            ▌ LIVE
          </Typography>
        </Box>

        {/* ── MESSAGES ── */}
        <Box
          ref={messagesBoxRef}
          onScroll={handleMessagesScroll}
          sx={{
            flex: 1, overflowY: "auto", overflowX: "hidden",
            px: 3, py: 2, display: "flex", flexDirection: "column",
            gap: "20px", position: "relative",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: BLACK },
            "&::-webkit-scrollbar-thumb": { background: `${CYAN}44`, borderRadius: 0 },
          }}
        >
          {chatMessages.map((chat, index) => (
            <Box
              key={index}
              sx={{ display: "flex", flexDirection: "column", alignItems: chat.role === "user" ? "flex-end" : "flex-start", width: "100%" }}
            >
              <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: chat.role === "user" ? `${AMBER}99` : `${CYAN}77`, mb: "4px", px: "2px" }}>
                {chat.role === "user" ? "> USR" : "AI >"}
              </Typography>

              <Box
                sx={{
                  width: chat.role === "assistant" ? "100%" : "auto",
                  maxWidth: chat.role === "assistant" ? "100%" : "70%",
                  wordBreak: "break-word", overflowWrap: "break-word",
                  border: chat.role === "user" ? `1px solid ${AMBER}66` : `1px solid ${CYAN}33`,
                  background: chat.role === "user" ? `rgba(255,170,0,0.06)` : `rgba(0,255,204,0.03)`,
                  boxShadow: chat.role === "user" ? `0 0 8px ${AMBER}22` : `0 0 8px ${CYAN}11`,
                  px: 2, py: 1.5,
                }}
              >
                {(() => {
                  // Only split on ``` if the message has fenced code.
                  // Odd-indexed blocks = code, even-indexed = plain text.
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
                          customStyle={{ border: `1px solid ${CYAN}33`, background: "#050e0c", fontFamily: MONO, fontSize: "12px", margin: "8px 0", overflowX: "auto", maxWidth: "100%", whiteSpace: "pre", borderRadius: 0 }}>
                          {code}
                        </SyntaxHighlighter>
                      );
                    }
                    if (!block.trim()) return null;
                    return (
                      <Typography key={idx}
                        sx={{ fontFamily: MONO, fontSize: "13px", letterSpacing: "0.3px", lineHeight: 1.8, color: chat.role === "user" ? AMBER : BODY, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
                        {block}
                      </Typography>
                    );
                  });
                })()}
              </Box>
            </Box>
          ))}

          {/* Invisible anchor — scrollIntoView targets this */}
          <div ref={messagesEndRef} style={{ height: 0 }} />
        </Box>

        {/* ── SCROLL TO BOTTOM ARROW ── */}
        {showScrollBtn && (
          <Box
            onClick={scrollToBottom}
            sx={{
              position: "absolute", bottom: "72px", right: "24px", zIndex: 10,
              width: "36px", height: "36px", border: `1.5px solid ${CYAN}`,
              background: BLACK, boxShadow: `0 0 12px ${CYAN}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", animation: "ttoPulse 2s infinite", transition: "all 0.15s",
              "&:hover": { background: `${CYAN}22`, boxShadow: `0 0 20px ${CYAN}99` },
            }}
          >
            <KeyboardArrowDownIcon sx={{ color: CYAN, fontSize: "20px" }} />
          </Box>
        )}

        {/* ── INPUT AREA ── */}
        <Box
          sx={{
            borderTop: `2px solid ${CYAN}`, boxShadow: `0 -2px 12px ${CYAN}22`,
            px: 2, py: 1.5, display: "flex", gap: "10px", alignItems: "center", background: BLACK,
          }}
        >
          <Typography sx={{ fontFamily: MONO, fontSize: "13px", color: CYAN, letterSpacing: "1px", whiteSpace: "nowrap" }}>
            &gt;_
          </Typography>

          <TextField
            inputRef={inputRef}
            fullWidth
            variant="outlined"
            placeholder="ENTER COMMAND..."
            // Track value in state so the send button reacts instantly
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && inputValue.trim()) handleSend(); }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "transparent", borderRadius: 0,
                "& fieldset": { border: `1px solid ${CYAN}44` },
                "&:hover fieldset": { border: `1px solid ${CYAN}88` },
                "&.Mui-focused fieldset": { border: `1px solid ${CYAN}` },
              },
              "& .MuiInputBase-input": {
                color: BODY, fontFamily: MONO, fontSize: "13px", letterSpacing: "1px", py: "10px",
                "&::placeholder": { color: `${CYAN}44`, fontFamily: MONO },
                "&:-webkit-autofill": { WebkitBoxShadow: `0 0 0 100px ${BLACK} inset`, WebkitTextFillColor: BODY },
              },
            }}
          />

          {/* Send button — disabled when input is empty/whitespace only */}
          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim()}
            sx={{
              border: `1.5px solid ${inputValue.trim() ? CYAN : `${CYAN}33`}`,
              borderRadius: 0,
              color: inputValue.trim() ? CYAN : `${CYAN}33`,
              p: "8px",
              boxShadow: inputValue.trim() ? `0 0 8px ${CYAN}33` : "none",
              transition: "all 0.15s",
              "&:hover": {
                background: inputValue.trim() ? `${CYAN}18` : "transparent",
                boxShadow: inputValue.trim() ? `0 0 14px ${CYAN}66` : "none",
              },
              "&.Mui-disabled": {
                // Override MUI's default grey — keep the retro dim-cyan look
                color: `${CYAN}33`,
                border: `1.5px solid ${CYAN}22`,
              },
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