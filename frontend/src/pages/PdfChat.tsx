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
const ACCENT_DANGER   = "#B95C50";
const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";

type PdfType   = { _id: string; pdf: string };
type Message   = { role: "user" | "assistant"; content: string };

// ── per-PDF chat history stored as a Map<pdfId, Message[]> ───────────────────
const pdfChatHistory = new Map<string, Message[]>();

const PdfChat = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [pdfs,        setPdfs       ] = useState<PdfType[]>([]);
  const [selectedpdf, setSelectedPdf] = useState<PdfType | null>(null);
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

  const handleSelectPdf = (pdf: PdfType) => {
    setSelectedPdf(pdf);
    const existing = pdfChatHistory.get(pdf._id) ?? [];
    setMessages(existing);
    if (inputRef.current) inputRef.current.value = "";
    setInputValue("");
  };

  useEffect(() => {
    if (!selectedpdf) return;
    pdfChatHistory.set(selectedpdf._id, messages);
  }, [messages, selectedpdf]);

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

  const handleDeletePdf = async (
    e: React.MouseEvent,
    pdf: PdfType
  ) => {
    e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5000/api/v1/pdf/${pdf._id}`);
      pdfChatHistory.delete(pdf._id);
      if (selectedpdf?._id === pdf._id) {
        setSelectedPdf(null);
        setMessages([]);
      }
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
          <Typography sx={{ fontFamily: SANS, fontWeight: 700, fontSize: "17px", color: TEXT_PAPER, letterSpacing: "-0.2px" }}>
            Documents
          </Typography>
          <Typography sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_PAPER_DIM, mt: "2px" }}>
            Chat with any uploaded PDF
          </Typography>
        </Box>

        {/* upload section */}
        <Box sx={{ px: 2 }}>
          <PdfUpload fetchPdfs={fetchPdfs} setSelectedPdf={(pdf) => handleSelectPdf(pdf)} />
        </Box>

        {/* no-pdf hint */}
        {!selectedpdf && (
          <Typography sx={{ fontFamily: SANS, fontSize: "12px", color: TEXT_PAPER_DIM, textAlign: "center", mt: 3, px: 2 }}>
            Upload or select a document to begin
          </Typography>
        )}

        {/* PDF list */}
        {pdfs.length > 0 && (
          <Typography sx={{ fontFamily: SANS, fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px", color: TEXT_PAPER_DIM, px: 2.5, pt: 2.5, pb: 1 }}>
            YOUR DOCUMENTS ({pdfs.length})
          </Typography>
        )}

        <Box sx={{
          flex: 1, overflowY: "auto", px: 1.5, pb: 2,
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: BORDER_DARK },
        }}>
          {pdfs.map((pdf) => {
            const isSelected = selectedpdf?._id === pdf._id;
            const hasHistory = (pdfChatHistory.get(pdf._id)?.length ?? 0) > 0;
            return (
              <Box
                key={pdf._id}
                onClick={() => handleSelectPdf(pdf)}
                sx={{
                  px: "14px", py: "11px", mb: "4px", borderRadius: "14px",
                  background: isSelected ? CARD_ALT : "transparent",
                  color: isSelected ? TEXT_PAPER : TEXT_PAPER_DIM,
                  fontFamily: SANS, fontSize: "13px", fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "8px",
                  "&:hover": { background: CARD_ALT, color: TEXT_PAPER },
                  "&:hover .pdf-delete-btn": { opacity: 1 },
                }}
              >
                <Box component="span" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pdf.pdf}
                </Box>

                {hasHistory && !isSelected && (
                  <Box
                    component="span"
                    sx={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }}
                  />
                )}

                <Box
                  className="pdf-delete-btn"
                  onClick={(e) => handleDeletePdf(e, pdf)}
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
        <Box sx={{ borderBottom: `1px solid ${BORDER_SOFT}`, px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontFamily: SANS, fontWeight: 600, fontSize: "14px", letterSpacing: "-0.1px", color: TEXT_INK }}>
            {selectedpdf ? selectedpdf.pdf : "No document selected"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {selectedpdf && messages.length > 0 && (
              <Typography sx={{ fontFamily: SANS, fontSize: "11px", color: TEXT_MUTED }}>
                {Math.ceil(messages.length / 2)} exchange{messages.length > 2 ? "s" : ""}
              </Typography>
            )}
            <Typography sx={{ fontFamily: SANS, fontSize: "11px", fontWeight: 500, letterSpacing: "0.2px", color: TEXT_MUTED, display: "flex", alignItems: "center", gap: "6px" }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", background: selectedpdf ? ACCENT : "#D8D5CB", display: "inline-block" }} />
              {selectedpdf ? "Ready" : "Idle"}
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
              <Typography sx={{ fontFamily: SANS, fontSize: "13px", color: TEXT_MUTED, textAlign: "center", whiteSpace: "pre-line" }}>
                {selectedpdf
                  ? `Document loaded: ${selectedpdf.pdf}\nAsk anything about it`
                  : "Select a document from the sidebar to begin"
                }
              </Typography>
            </Box>
          )}

          {messages.map((message, index) => (
            <Box key={index} sx={{ display: "flex", flexDirection: "column", alignItems: message.role === "user" ? "flex-end" : "flex-start", width: "100%" }}>
              <Box sx={{
                width: message.role === "assistant" ? "100%" : "auto",
                maxWidth: message.role === "assistant" ? "100%" : "70%",
                wordBreak: "break-word", overflowWrap: "break-word",
                borderRadius: message.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: message.role === "user" ? CARD : "#F5F4EF",
                px: 2.25, py: 1.5,
              }}>
                <Typography sx={{ fontFamily: SANS, fontSize: "14px", letterSpacing: "0.1px", lineHeight: 1.65, color: message.role === "user" ? TEXT_PAPER : TEXT_INK, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
                  {message.content}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* thinking indicator */}
          {loading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
              <Box sx={{ borderRadius: "18px 18px 18px 4px", background: "#F5F4EF", px: 2.25, py: 1.5 }}>
                <Typography sx={{ fontFamily: SANS, fontSize: "14px", color: TEXT_MUTED }}>
                  Reading the document…
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} style={{ height: 0 }} />
        </Box>

        {/* scroll arrow */}
        {showScrollBtn && (
          <Box onClick={scrollToBottom} sx={{ position: "absolute", bottom: "88px", right: "28px", zIndex: 10, width: "38px", height: "38px", borderRadius: "50%", background: CARD, boxShadow: "0 6px 18px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.15s", "&:hover": { transform: "translateY(-2px)" } }}>
            <KeyboardArrowDownIcon sx={{ color: TEXT_PAPER, fontSize: "20px" }} />
          </Box>
        )}

        {/* ── INPUT AREA ── */}
        <Box sx={{ px: 3, py: 2.5, display: "flex", gap: "10px", alignItems: "center" }}>
          <TextField
            inputRef={inputRef}
            fullWidth variant="outlined"
            placeholder="Ask about your document…"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && inputValue.trim() && !loading) handleSend(); }}
            sx={{
              "& .MuiOutlinedInput-root": { background: "#F5F4EF", borderRadius: "999px", "& fieldset": { border: "none" } },
              "& .MuiInputBase-input": { color: TEXT_INK, fontFamily: SANS, fontSize: "14px", letterSpacing: "0.1px", py: "13px", px: "8px", "&::placeholder": { color: TEXT_MUTED, opacity: 1 } },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim() || loading || !selectedpdf}
            sx={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: (!inputValue.trim() || loading || !selectedpdf) ? "#EDEBE3" : CARD,
              color: (!inputValue.trim() || loading || !selectedpdf) ? TEXT_MUTED : TEXT_PAPER,
              transition: "all 0.15s",
              "&:hover": { background: (!inputValue.trim() || loading || !selectedpdf) ? "#EDEBE3" : "#000" },
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

export default PdfChat;