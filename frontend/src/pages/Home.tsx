import React from "react";
import { Box, Typography } from "@mui/material";
import { FaRobot, FaFilePdf, FaCode, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* ─── Add to your global CSS / index.css ──────────────────────────────────────
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
   ─────────────────────────────────────────────────────────────────────────── */

// ── design tokens ── minimalist dark-card aesthetic ─────────────────────────
const PAGE_BG        = "#F3F1EC";
const CARD           = "#18181A";
const CARD_ALT       = "#222224";
const SURFACE        = "#FFFFFF";
const BORDER_SOFT     = "#E8E5DC";
const TEXT_INK        = "#17171A";
const TEXT_MUTED      = "#8B8A84";
const TEXT_PAPER      = "#F6F5F1";
const TEXT_PAPER_DIM  = "#9C9B9E";
const ACCENT          = "#7C9473";
const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";

/* ─── FeatureCard ──────────────────────────────────────────────────────────── */
const FeatureCard = ({
  icon, title, description, onClick,
}: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) => (
  <Box
    onClick={onClick}
    sx={{
      background: SURFACE,
      borderRadius: "24px",
      border: `1px solid ${BORDER_SOFT}`,
      p: 3,
      cursor: "pointer",
      transition: "transform 0.18s, box-shadow 0.18s",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 16px 32px rgba(0,0,0,0.08)",
      },
    }}
  >
    <Box sx={{
      width: "44px", height: "44px", borderRadius: "14px", background: CARD,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: TEXT_PAPER, fontSize: "17px",
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontFamily: SANS, fontWeight: 700, fontSize: "16px", color: TEXT_INK, letterSpacing: "-0.2px" }}>
        {title}
      </Typography>
      <Typography sx={{ fontFamily: SANS, fontSize: "13px", color: TEXT_MUTED, mt: "6px", lineHeight: 1.6 }}>
        {description}
      </Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: "auto" }}>
      <Typography sx={{ fontFamily: SANS, fontSize: "12px", fontWeight: 600, color: TEXT_INK }}>
        Open
      </Typography>
      <FaArrowRight size={10} color={TEXT_INK} />
    </Box>
  </Box>
);

/* ─── Stat ─────────────────────────────────────────────────────────────────── */
const Stat = ({ value, label }: { value: string; label: string }) => (
  <Box>
    <Typography sx={{ fontFamily: SANS, fontWeight: 800, fontSize: "26px", color: TEXT_PAPER, letterSpacing: "-0.5px" }}>
      {value}
    </Typography>
    <Typography sx={{ fontFamily: SANS, fontSize: "12px", fontWeight: 500, color: TEXT_PAPER_DIM, mt: "2px" }}>
      {label}
    </Typography>
  </Box>
);

/* ─── Home ─────────────────────────────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: PAGE_BG,
        fontFamily: SANS,
        color: TEXT_INK,
        boxSizing: "border-box",
        p: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* ── TOP BAR ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "8px" }}>
        <Typography sx={{ fontFamily: SANS, fontWeight: 800, fontSize: "16px", color: TEXT_INK, letterSpacing: "-0.3px" }}>
          TalkToIt
        </Typography>
      </Box>

      {/* ── HERO ── */}
      <Box sx={{
        background: CARD, borderRadius: "32px",
        boxShadow: "0 20px 48px rgba(0,0,0,0.14)",
        px: { xs: 3, md: 6 }, pt: { xs: 5, md: 7 }, pb: { xs: 4, md: 5 },
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <Box sx={{
          display: "flex", alignItems: "center", gap: "8px", mb: "20px",
          borderRadius: "999px", background: CARD_ALT, px: "14px", py: "7px",
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
          <Typography sx={{ fontFamily: SANS, fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px", color: TEXT_PAPER_DIM }}>
            Powered by Groq &amp; Gemini
          </Typography>
        </Box>

        <Typography sx={{
          fontFamily: SANS, fontWeight: 800, fontSize: { xs: "34px", md: "52px" },
          color: TEXT_PAPER, letterSpacing: "-1.5px", lineHeight: 1.08, maxWidth: "760px",
        }}>
          Talk to your code, your docs, and your ideas
        </Typography>

        <Typography sx={{
          fontFamily: SANS, fontSize: { xs: "14px", md: "16px" }, fontWeight: 400,
          color: TEXT_PAPER_DIM, mt: "18px", maxWidth: "540px", lineHeight: 1.65,
        }}>
          Upload a codebase or a PDF, ask a question in plain English, and get
          answers grounded in your own content — no digging through files required.
        </Typography>

        <Box
          onClick={() => navigate("/chat")}
          sx={{
            mt: "32px", borderRadius: "999px", background: TEXT_PAPER, color: TEXT_INK,
            px: "28px", py: "14px", display: "flex", alignItems: "center", gap: "10px",
            cursor: "pointer", fontFamily: SANS, fontSize: "14px", fontWeight: 700,
            transition: "opacity 0.15s", "&:hover": { opacity: 0.88 },
          }}
        >
          Start decoding
          <FaArrowRight size={12} />
        </Box>

        {/* stats strip */}
        <Box sx={{
          mt: "48px", pt: "32px", borderTop: "1px solid #2A2A2C",
          display: "flex", gap: { xs: 4, md: 8 }, flexWrap: "wrap", justifyContent: "center",
        }}>
          <Stat value="2,400+" label="Developers onboard" />
          <Stat value="18K+"   label="Questions answered" />
          <Stat value="3"      label="AI modes in one app" />
        </Box>
      </Box>

      {/* ── FEATURE CARDS ── */}
      <Box sx={{
        display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: "16px", flex: 1,
      }}>
        <FeatureCard
          icon={<FaRobot />}
          title="General chat"
          description="A fast, general-purpose assistant for everyday questions, brainstorming, and quick answers."
          onClick={() => navigate("/chat")}
        />
        <FeatureCard
          icon={<FaFilePdf />}
          title="PDF chat"
          description="Upload any document and ask questions about it directly — no more scanning pages by hand."
          onClick={() => navigate("/pdf")}
        />
        <FeatureCard
          icon={<FaCode />}
          title="Repo chat"
          description="Upload a zipped codebase and ask how it works, where something lives, or why it breaks."
          onClick={() => navigate("/repo")}
        />
      </Box>
    </Box>
  );
};

export default Home;