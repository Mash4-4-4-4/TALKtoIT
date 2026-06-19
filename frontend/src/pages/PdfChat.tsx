import React, { useEffect, useState } from "react";
import axios from 'axios';
import PdfUpload from '../components/PdfUpload';
import {
  Box,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import { SendIcon } from 'lucide-react';
import { askPdfQuestion } from '../helpers/api.communication';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";

// ── theme tokens ───────────────────────────────────────────────────────────────
const CYAN  = "#00ffcc";
const RED   = "#ff2244";
const AMBER = "#ffaa00";
const GREEN = "#00ff41";
const BLACK = "#000000";
const BODY  = "#c8f0e8";
const MONO  = "'Share Tech Mono', 'Courier New', monospace";
const PIXEL = "'VT323', 'Courier New', monospace";

type PdfType   = { _id: string; pdf: string };
type Message   = { role: "user" | "assistant"; content: string };

// ── per-PDF chat history stored as a Map<pdfId, Message[]> ───────────────────
// This lives outside the component so it survives re-renders without
// needing to be in state (state would cause extra renders on every keystroke).
const pdfChatHistory = new Map<string, Message[]>();

const PdfChat = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [pdfs,        setPdfs       ] = useState<PdfType[]>([]);
  const [selectedpdf, setSelectedPdf] = useState<PdfType | null>(null);
  // messages shown in the main area — always the history for the selected PDF
  const [messages,    setMessages   ] = useState<Message[]>([]);
  const [loading,     setLoading    ] = useState(false);
  const [inputValue,  setInputValue ] = useState<string>("");

  // ── scroll ─────────────────────────────────────────────────────────────────
  const messagesBoxRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // ── fetch PDF list (unchanged) ─────────────────────────────────────────────
  const fetchPdfs = async () => {
    try {
      const result = await axios.get("http://localhost:5000/api/v1/pdf/all");
      setPdfs(result.data.pdfs);
    } catch (error) { console.log(error); }
  };

  useEffect(() => { fetchPdfs(); }, []);

  // ── switch PDF: restore that PDF's chat history ────────────────────────────
  // Called whenever the user clicks a different PDF in the sidebar.
  // Reads the Map for that PDF's id and loads those messages into state.
  // If the PDF has never been chatted with, the Map returns undefined → empty [].
  const handleSelectPdf = (pdf: PdfType) => {
    setSelectedPdf(pdf);
    const existing = pdfChatHistory.get(pdf._id) ?? [];
    setMessages(existing);
    // clear the input when switching PDFs
    if (inputRef.current) inputRef.current.value = "";
    setInputValue("");
  };

  // ── save messages into history map every time messages change ──────────────
  // This keeps the Map in sync with state so when the user switches back
  // to a PDF they were chatting with, the messages are still there.
  useEffect(() => {
    if (!selectedpdf) return;
    pdfChatHistory.set(selectedpdf._id, messages);
  }, [messages, selectedpdf]);

  // ── send message (logic unchanged, just writes to per-PDF history) ─────────
  const handleSend = async () => {
    try {
      if (!selectedpdf) { alert("Select a PDF first"); return; }
      const question = inputRef.current?.value?.trim();
      if (!question) return;
      const userMessage: Message = { role: "user", content: question };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      if (inputRef.current) inputRef.current.value = "";
      setInputValue("");
      const response = await askPdfQuestion(selectedpdf._id, question);
      const assistantMessage: Message = { role: "assistant", content: response.answer };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // ── delete PDF ─────────────────────────────────────────────────────────────
  // Calls the backend delete endpoint, removes the PDF from the list,
  // clears its chat history from the Map, and deselects it if it was active.
  const handleDeletePdf = async (
    e: React.MouseEvent,
    pdf: PdfType
  ) => {
    e.stopPropagation(); // prevent the PDF from being selected on delete click
    try {
      await axios.delete(`http://localhost:5000/api/v1/pdf/${pdf._id}`);
      // remove from history Map
      pdfChatHistory.delete(pdf._id);
      // if the deleted PDF was selected, clear the chat area
      if (selectedpdf?._id === pdf._id) {
        setSelectedPdf(null);
        setMessages([]);
      }
      // refresh the list
      await fetchPdfs();
    } catch (error) {
      console.log(error);
    }
  };

  // ── scroll helpers (unchanged) ─────────────────────────────────────────────
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

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex", height: "100vh", maxHeight: "100vh",
        overflow: "hidden", background: BLACK, fontFamily: MONO, position: "relative",
        "&::before": {
          content: '""', position: "fixed", inset: 0,
          background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,200,0.012) 2px,rgba(0,255,200,0.012) 4px)",
          pointerEvents: "none", zIndex: 9999,
        },
        "@keyframes ttoBlink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        "@keyframes ttoPulse":  { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
      }}
    >
      {/* ── SIDEBAR ── */}
      <Box
        sx={{
          width: "280px", minWidth: "280px", height: "100vh", overflow: "hidden",
          background: BLACK, borderRight: `1.5px solid ${AMBER}`,
          boxShadow: `2px 0 12px ${AMBER}22`, display: "flex",
          flexDirection: "column", position: "relative", zIndex: 1,
        }}
      >
        {/* titlebar */}
        <Box sx={{ borderBottom: `1px solid ${AMBER}44`, px: 1.5, py: 0.75, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: AMBER }}>PDF_CHAT.EXE</Typography>
          <Box sx={{ display: "flex", gap: "4px" }}>
            {[0,1,2].map(i => <Box key={i} sx={{ width: 7, height: 7, border: `1px solid ${AMBER}` }} />)}
          </Box>
        </Box>

        {/* upload section */}
        <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: `${AMBER}55`, px: 2, pt: 2, pb: 1 }}>
          &gt; UPLOAD DOCUMENT
        </Typography>
        <Box sx={{ px: 2 }}>
          <PdfUpload fetchPdfs={fetchPdfs} setSelectedPdf={(pdf) => handleSelectPdf(pdf)} />
        </Box>

        {/* no-pdf hint */}
        {!selectedpdf && (
          <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1px", color: `${AMBER}55`, textAlign: "center", mt: 3, px: 2, animation: "ttoBlink 2s step-end infinite" }}>
            ▌ UPLOAD OR SELECT A PDF TO BEGIN ▌
          </Typography>
        )}

        {/* PDF list */}
        {pdfs.length > 0 && (
          <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: `${AMBER}55`, px: 2, pt: 2, pb: 1 }}>
            &gt; INDEXED DOCUMENTS [{pdfs.length}]
          </Typography>
        )}

        <Box sx={{
          flex: 1, overflowY: "auto", px: 2, pb: 2,
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-track": { background: BLACK },
          "&::-webkit-scrollbar-thumb": { background: `${AMBER}44` },
        }}>
          {pdfs.map((pdf) => {
            const isSelected = selectedpdf?._id === pdf._id;
            // show a dot if this PDF has existing chat history
            const hasHistory = (pdfChatHistory.get(pdf._id)?.length ?? 0) > 0;
            return (
              <Box
                key={pdf._id}
                onClick={() => handleSelectPdf(pdf)}
                sx={{
                  px: "10px", py: "8px", mb: "6px",
                  border: `1px solid ${isSelected ? AMBER : `${AMBER}33`}`,
                  background: isSelected ? `${AMBER}18` : "transparent",
                  boxShadow: isSelected ? `0 0 8px ${AMBER}44` : "none",
                  color: isSelected ? AMBER : `${AMBER}77`,
                  fontFamily: MONO, fontSize: "11px", letterSpacing: "1px",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "6px",
                  "&:hover": { background: `${AMBER}11`, borderColor: AMBER, color: AMBER },
                  // also show hover delete button
                  "&:hover .pdf-delete-btn": { opacity: 1 },
                }}
              >
                {/* prefix: arrow if selected, history dot if has chats */}
                <Box component="span" sx={{ flexShrink: 0, fontSize: "10px" }}>
                  {isSelected ? "▶" : hasHistory ? "·" : " "}
                </Box>

                {/* filename — truncated */}
                <Box component="span" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pdf.pdf}
                </Box>

                {/* history indicator */}
                {hasHistory && !isSelected && (
                  <Box
                    component="span"
                    sx={{ fontFamily: MONO, fontSize: "8px", color: `${CYAN}77`, border: `1px solid ${CYAN}33`, px: "4px", py: "1px", flexShrink: 0 }}
                  >
                    LOG
                  </Box>
                )}

                {/* delete button — shown on row hover */}
                <Box
                  className="pdf-delete-btn"
                  onClick={(e) => handleDeletePdf(e, pdf)}
                  sx={{
                    opacity: 0, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: RED, transition: "all 0.15s",
                    "&:hover": { color: RED, textShadow: `0 0 6px ${RED}` },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: "14px" }} />
                </Box>
              </Box>
            );
          })}
        </Box>

        <Typography sx={{ fontFamily: MONO, fontSize: "9px", color: `${AMBER}33`, letterSpacing: "1px", textAlign: "center", pb: 1.5 }}>
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
        {/* titlebar */}
        <Box sx={{ borderBottom: `1px solid ${CYAN}44`, px: 2, py: 0.75, display: "flex", justifyContent: "space-between", alignItems: "center", background: BLACK }}>
          <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: CYAN }}>
            RAG_ENGINE.EXE &nbsp;—&nbsp;
            {selectedpdf
              ? <Box component="span" sx={{ color: AMBER }}>&nbsp;{selectedpdf.pdf}</Box>
              : <Box component="span" sx={{ color: `${CYAN}55` }}>&nbsp;NO DOCUMENT SELECTED</Box>
            }
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* show message count for current PDF */}
            {selectedpdf && messages.length > 0 && (
              <Typography sx={{ fontFamily: MONO, fontSize: "9px", color: `${CYAN}55`, letterSpacing: "1px" }}>
                {Math.ceil(messages.length / 2)} EXCHANGE{messages.length > 2 ? "S" : ""}
              </Typography>
            )}
            <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: selectedpdf ? GREEN : RED, animation: "ttoBlink 1.5s step-end infinite" }}>
              {selectedpdf ? "▌ READY" : "▌ IDLE"}
            </Typography>
          </Box>
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
          {/* empty state */}
          {messages.length === 0 && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "2px", color: `${CYAN}33`, textAlign: "center", whiteSpace: "pre-line" }}>
                {selectedpdf
                  ? `> DOCUMENT LOADED: ${selectedpdf.pdf}\n> ASK ANYTHING ABOUT IT`
                  : "> SELECT A DOCUMENT FROM THE SIDEBAR TO BEGIN"
                }
              </Typography>
            </Box>
          )}

          {messages.map((message, index) => (
            <Box key={index} sx={{ display: "flex", flexDirection: "column", alignItems: message.role === "user" ? "flex-end" : "flex-start", width: "100%" }}>
              <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: message.role === "user" ? `${AMBER}99` : `${CYAN}77`, mb: "4px", px: "2px" }}>
                {message.role === "user" ? "> USR" : "AI >"}
              </Typography>
              <Box sx={{
                width: message.role === "assistant" ? "100%" : "auto",
                maxWidth: message.role === "assistant" ? "100%" : "70%",
                wordBreak: "break-word", overflowWrap: "break-word",
                border: message.role === "user" ? `1px solid ${AMBER}66` : `1px solid ${CYAN}33`,
                background: message.role === "user" ? `rgba(255,170,0,0.06)` : `rgba(0,255,204,0.03)`,
                boxShadow: message.role === "user" ? `0 0 8px ${AMBER}22` : `0 0 8px ${CYAN}11`,
                px: 2, py: 1.5,
              }}>
                <Typography sx={{ fontFamily: MONO, fontSize: "13px", letterSpacing: "0.3px", lineHeight: 1.8, color: message.role === "user" ? AMBER : BODY, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* thinking indicator */}
          {loading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
              <Typography sx={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: `${CYAN}77`, mb: "4px" }}>AI &gt;</Typography>
              <Box sx={{ border: `1px solid ${CYAN}33`, background: `rgba(0,255,204,0.03)`, px: 2, py: 1.5 }}>
                <Typography sx={{ fontFamily: MONO, fontSize: "13px", color: `${CYAN}77`, animation: "ttoBlink 1s step-end infinite" }}>
                  ▌ PROCESSING DOCUMENT...
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} style={{ height: 0 }} />
        </Box>

        {/* scroll arrow */}
        {showScrollBtn && (
          <Box onClick={scrollToBottom} sx={{ position: "absolute", bottom: "72px", right: "24px", zIndex: 10, width: "36px", height: "36px", border: `1.5px solid ${CYAN}`, background: BLACK, boxShadow: `0 0 12px ${CYAN}66`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", animation: "ttoPulse 2s infinite", transition: "all 0.15s", "&:hover": { background: `${CYAN}22`, boxShadow: `0 0 20px ${CYAN}99` } }}>
            <KeyboardArrowDownIcon sx={{ color: CYAN, fontSize: "20px" }} />
          </Box>
        )}

        {/* ── INPUT AREA ── */}
        <Box sx={{ borderTop: `2px solid ${CYAN}`, boxShadow: `0 -2px 12px ${CYAN}22`, px: 2, py: 1.5, display: "flex", gap: "10px", alignItems: "center", background: BLACK }}>
          <Typography sx={{ fontFamily: MONO, fontSize: "13px", color: CYAN, letterSpacing: "1px", whiteSpace: "nowrap" }}>&gt;_</Typography>
          <TextField
            inputRef={inputRef}
            fullWidth variant="outlined"
            placeholder="ASK ABOUT YOUR DOCUMENT..."
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && inputValue.trim() && !loading) handleSend(); }}
            sx={{
              "& .MuiOutlinedInput-root": { background: "transparent", borderRadius: 0, "& fieldset": { border: `1px solid ${CYAN}44` }, "&:hover fieldset": { border: `1px solid ${CYAN}88` }, "&.Mui-focused fieldset": { border: `1px solid ${CYAN}` } },
              "& .MuiInputBase-input": { color: BODY, fontFamily: MONO, fontSize: "13px", letterSpacing: "1px", py: "10px", "&::placeholder": { color: `${CYAN}44`, fontFamily: MONO }, "&:-webkit-autofill": { WebkitBoxShadow: `0 0 0 100px ${BLACK} inset`, WebkitTextFillColor: BODY } },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim() || loading || !selectedpdf}
            sx={{
              border: `1.5px solid ${(!inputValue.trim() || loading || !selectedpdf) ? `${CYAN}22` : CYAN}`,
              borderRadius: 0, color: (!inputValue.trim() || loading || !selectedpdf) ? `${CYAN}33` : CYAN,
              p: "8px", boxShadow: (!inputValue.trim() || loading || !selectedpdf) ? "none" : `0 0 8px ${CYAN}33`, transition: "all 0.15s",
              "&:hover": { background: (!inputValue.trim() || loading || !selectedpdf) ? "transparent" : `${CYAN}18`, boxShadow: (!inputValue.trim() || loading || !selectedpdf) ? "none" : `0 0 14px ${CYAN}66` },
              "&.Mui-disabled": { color: `${CYAN}33`, border: `1.5px solid ${CYAN}22` },
            }}
          >
            <SendIcon size={18} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PdfChat;