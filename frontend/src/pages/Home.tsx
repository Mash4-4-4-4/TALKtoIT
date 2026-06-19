import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  FaFolder,
  FaRobot,
  FaFilePdf,
  FaDatabase,
  FaCog,
  FaTerminal,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* ─── Add to your global CSS / index.css ──────────────────────────────────────
   @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=VT323&display=swap');
   ─────────────────────────────────────────────────────────────────────────── */

const CYAN  = "#00ffcc";
const RED   = "#ff2244";
const AMBER = "#ffaa00";
const GREEN = "#00ff41";
const BLUE  = "#4488ff";
const DIM   = "#a0d8d0";
const BODY  = "#c8f0e8";
const BLACK = "#000000";

const MONO  = "'Share Tech Mono', 'Courier New', monospace";
const PIXEL = "'VT323', 'Courier New', monospace";

type AccentColor = "cyan" | "red" | "amber" | "green" | "blue";
const ACCENT: Record<AccentColor, string> = { cyan: CYAN, red: RED, amber: AMBER, green: GREEN, blue: BLUE };

/* ─── NeonWindow ───────────────────────────────────────────────────────────── */
const NeonWindow = ({
  title, accent = "cyan", children, sx,
}: {
  title: string; accent?: AccentColor; children: React.ReactNode; sx?: object;
}) => {
  const color = ACCENT[accent];
  return (
    <Box sx={{ border: `1.5px solid ${color}`, boxShadow: `0 0 8px ${color}44, inset 0 0 4px ${color}11`, background: "rgba(0,0,0,0.85)", ...sx }}>
      <Box sx={{ borderBottom: `1px solid ${color}44`, px: 1.5, py: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: "4px" }}>
          {[0, 1, 2].map((i) => <Box key={i} sx={{ width: 8, height: 8, border: `1px solid ${color}` }} />)}
        </Box>
      </Box>
      <Box sx={{ p: 1.5, fontFamily: MONO, color: BODY }}>{children}</Box>
    </Box>
  );
};

/* ─── DesktopIcon ──────────────────────────────────────────────────────────── */
const DesktopIcon = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
      p: 1, border: `1px solid ${CYAN}22`, cursor: "pointer", userSelect: "none", transition: "all 0.15s",
      "&:hover": { background: `${CYAN}11`, borderColor: `${CYAN}88` },
    }}
  >
    <Box sx={{ fontSize: "22px", color: AMBER }}>{icon}</Box>
    <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "1px", color: BODY, textAlign: "center" }}>
      {label}
    </Typography>
  </Box>
);

/* ─── StatusDot — renders as inline-block span to avoid <div> inside <p> ──── */
const StatusDot = ({ state }: { state: "on" | "warn" | "off" }) => {
  const bg = state === "on" ? GREEN : state === "warn" ? AMBER : "#444";
  return (
    <Box
      component="span"           // ← span, not div, so it's safe inside Typography
      sx={{
        display: "inline-block",
        width: 8, height: 8, borderRadius: "50%",
        background: bg,
        boxShadow: state !== "off" ? `0 0 5px ${bg}` : "none",
        mr: "6px",
        verticalAlign: "middle",
        animation: state === "on" ? "ttoPulse 2s infinite" : "none",
        "@keyframes ttoPulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
      }}
    />
  );
};

/* ─── ProgressBar ──────────────────────────────────────────────────────────── */
const ProgressBar = ({ value, color = CYAN }: { value: number; color?: string }) => (
  <Box sx={{ height: "8px", border: `1px solid ${color}44`, background: "#001a14", mt: "4px" }}>
    <Box sx={{ width: `${value}%`, height: "100%", background: color, boxShadow: `0 0 6px ${color}` }} />
  </Box>
);

/* ─── RagNode ──────────────────────────────────────────────────────────────── */
const RagNode = ({ label, color = CYAN }: { label: string; color?: string }) => (
  <Box sx={{ border: `1px solid ${color}55`, px: "8px", py: "3px", fontSize: "10px", letterSpacing: "1px", color, fontFamily: MONO, whiteSpace: "nowrap" }}>
    {label}
  </Box>
);

/* ─── LogLine — renders > prefix as JSX span, not CSS ::before ────────────── */
const LogLine = ({ text, type }: { text: string; type: "ok" | "warn" }) => (
  <Typography
    component="div"              // ← div, not p, so Box children are valid
    sx={{ fontFamily: MONO, fontSize: "11px", color: type === "warn" ? AMBER : GREEN, mb: "4px", display: "flex", alignItems: "center", gap: "4px" }}
  >
    <span style={{ color: CYAN }}>&gt;</span>
    {text}
  </Typography>
);

/* ─── Home ─────────────────────────────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const [clock, setClock] = useState(new Date().toLocaleTimeString("en-US", { hour12: false }));

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString("en-US", { hour12: false })), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh", background: BLACK, display: "flex", flexDirection: "column",
        fontFamily: MONO, color: BODY, position: "relative",
        "&::before": {
          content: '""', position: "fixed", inset: 0,
          background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,200,0.015) 2px,rgba(0,255,200,0.015) 4px)",
          pointerEvents: "none", zIndex: 9999,
        },
        "@keyframes ttoGlitch": {
          "0%,90%,100%": { textShadow: `2px 0 ${RED}, -2px 0 ${BLUE}`, transform: "translateX(0)" },
          "91%":         { textShadow: `-3px 0 ${RED}, 3px 0 ${BLUE}`, transform: "translateX(2px)" },
          "93%":         { textShadow: `3px 0 ${GREEN}, -2px 0 ${RED}`, transform: "translateX(-1px)" },
          "95%":         { textShadow: `2px 0 ${RED}, -2px 0 ${BLUE}`, transform: "translateX(0)" },
        },
        "@keyframes ttoBlink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
      }}
    >
      {/* ── HERO ── */}
      <Box sx={{ p: "12px 12px 0" }}>
        <NeonWindow title="TALKTOIT OS  |  v1.0" accent="red">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, py: 0.5 }}>
            <Box>
              <Typography sx={{ fontFamily: PIXEL, fontSize: { xs: "36px", md: "52px" }, color: CYAN, letterSpacing: "4px", lineHeight: 1, textShadow: `2px 0 ${RED}, -2px 0 ${BLUE}`, animation: "ttoGlitch 4s infinite" }}>
                TALKTOIT OS
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: "12px", letterSpacing: "3px", color: DIM, mt: "4px" }}>
                RETRO AI OPERATING SYSTEM
              </Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "3px", color: RED, mt: "6px", animation: "ttoBlink 1.2s step-end infinite" }}>
                ▌ SYSTEM ONLINE ▌
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: AMBER }}>QUERIES PROCESSED</Typography>
              <Typography sx={{ fontFamily: PIXEL, fontSize: "40px", color: RED, letterSpacing: "3px", textShadow: `0 0 10px ${RED}88` }}>00419</Typography>
              <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: AMBER }}>HIGH SCORE: 99999</Typography>
            </Box>
          </Box>
        </NeonWindow>
      </Box>

      {/* ── MAIN GRID ── */}
      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "200px 1fr" }, gap: "12px", p: "12px" }}>

        {/* DESKTOP ICONS */}
        <NeonWindow title="DESKTOP" accent="cyan">
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
            <DesktopIcon icon={<FaRobot />}    label="AI CHAT"   onClick={() => navigate("/chat")} />
            <DesktopIcon icon={<FaFilePdf />}  label="PDF CHAT"  onClick={() => navigate("/pdf")} />
            <DesktopIcon icon={<FaDatabase />} label="VECTOR DB" />
            <DesktopIcon icon={<FaFolder />}   label="DOCS" />
            <DesktopIcon icon={<FaCog />}      label="SETTINGS" />
            <DesktopIcon icon={<FaTerminal />} label="TERMINAL" />
          </Box>
          <Box sx={{ mt: 2, borderTop: `1px solid ${CYAN}22`, pt: 1.5 }}>
            <Typography sx={{ fontFamily: PIXEL, fontSize: "24px", color: BLUE, letterSpacing: "2px" }}>1UP 00419</Typography>
            <Typography sx={{ fontFamily: MONO, fontSize: "10px", color: AMBER, letterSpacing: "1px", mt: "2px" }}>
              RANK: 1ST &nbsp;|&nbsp; NAME: USER
            </Typography>
          </Box>
        </NeonWindow>

        {/* RIGHT 2×2 */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: "12px" }}>

          {/* SYSTEM STATUS */}
          <NeonWindow title="SYSTEM STATUS" accent="green">
            {([ { label: "AI CORE", state: "on", val: "ONLINE" }, { label: "VECTOR SEARCH", state: "on", val: "ACTIVE" }, { label: "PDF MODULE", state: "on", val: "READY" }, { label: "GROQ LLM", state: "on", val: "CONNECTED" }, { label: "REPO CHAT", state: "warn", val: "SOON" } ] as const).map(({ label, state, val }) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "8px" }}>
                {/* FIX: component="span" so StatusDot (inline span) is valid inside */}
                <Typography component="span" sx={{ fontFamily: MONO, fontSize: "11px", color: BODY, display: "flex", alignItems: "center" }}>
                  <StatusDot state={state} />{label}
                </Typography>
                <Typography component="span" sx={{ fontFamily: MONO, fontSize: "11px", color: state === "on" ? GREEN : AMBER }}>
                  {val}
                </Typography>
              </Box>
            ))}
            <Typography sx={{ fontFamily: MONO, fontSize: "10px", color: DIM, letterSpacing: "1px", mt: 1 }}>MEMORY USAGE: 68%</Typography>
            <ProgressBar value={68} color={CYAN} />
            <Typography sx={{ fontFamily: MONO, fontSize: "10px", color: DIM, letterSpacing: "1px", mt: 1 }}>EMBEDDING ENGINE: 91%</Typography>
            <ProgressBar value={91} color={AMBER} />
          </NeonWindow>

          {/* ACTIVITY LOG */}
          <NeonWindow title="ACTIVITY LOG" accent="amber">
            {/* FIX: LogLine uses component="div" + JSX span for >, no CSS ::before */}
            <LogLine text="USER LOGIN OK"        type="ok" />
            <LogLine text="PDF INDEXED [3 DOCS]" type="ok" />
            <LogLine text="EMBEDDINGS GENERATED" type="ok" />
            <LogLine text="VECTOR SEARCH READY"  type="ok" />
            <LogLine text="GROQ QUOTA: 74%"       type="warn" />
            <LogLine text="MONGODB CONNECTED"     type="ok" />
            <LogLine text="RAG PIPELINE WARM"     type="ok" />
            <Typography component="div" sx={{ fontFamily: MONO, fontSize: "11px", color: CYAN, display: "flex", gap: "4px", animation: "ttoBlink 1s step-end infinite" }}>
              <span style={{ color: CYAN }}>&gt;</span> SYSTEM STABLE ▌
            </Typography>
          </NeonWindow>

          {/* RAG PIPELINE */}
          <NeonWindow title="RAG PIPELINE" accent="cyan">
            {[
              { from: "PDF UPLOAD",    to: "CHUNKING",       fc: CYAN, tc: CYAN  },
              { from: "GEMINI EMBED",  to: "MONGO VECTOR",   fc: CYAN, tc: CYAN  },
              { from: "QUERY",         to: "SEMANTIC SEARCH", fc: CYAN, tc: CYAN  },
              { from: "LLAMA 3.3 70B", to: "ANSWER",         fc: RED,  tc: GREEN },
            ].map(({ from, to, fc, tc }) => (
              <Box key={from} sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "8px" }}>
                <RagNode label={from} color={fc} />
                <Typography component="span" sx={{ color: AMBER, fontSize: "12px" }}>→</Typography>
                <RagNode label={to} color={tc} />
              </Box>
            ))}
            <Typography sx={{ fontFamily: MONO, fontSize: "10px", color: AMBER, letterSpacing: "1px", mt: 1 }}>
              POWERED BY GROQ &nbsp;/&nbsp; MONGODB ATLAS
            </Typography>
          </NeonWindow>

          {/* AVAILABLE MODULES */}
          <NeonWindow title="AVAILABLE MODULES" accent="blue">
            {[
              { name: "General Chat",      status: "ONLINE",      state: "on"   },
              { name: "PDF Chat",          status: "ONLINE",      state: "on"   },
              { name: "Authentication",    status: "ONLINE",      state: "on"   },
              { name: "Vector Search",     status: "ONLINE",      state: "on"   },
              { name: "Persistent History",status: "ONLINE",      state: "on"   },
              { name: "Repository Chat",   status: "COMING SOON", state: "warn" },
              { name: "Code Analysis",     status: "QUEUED",      state: "off"  },
            ].map(({ name, status, state }) => {
              const bc = state === "on" ? GREEN : state === "warn" ? AMBER : "#444";
              return (
                <Box key={name} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "5px", borderBottom: "1px solid #ffffff08" }}>
                  <Typography sx={{ fontFamily: MONO, fontSize: "11px", color: BODY }}>{name}</Typography>
                  <Box sx={{ border: `1px solid ${bc}66`, color: bc, fontFamily: MONO, fontSize: "9px", letterSpacing: "1px", px: "6px", py: "2px" }}>{status}</Box>
                </Box>
              );
            })}
          </NeonWindow>

        </Box>
      </Box>

      {/* ── TASKBAR ── */}
      <Box sx={{ height: "44px", background: BLACK, borderTop: `2px solid ${CYAN}`, boxShadow: `0 -2px 12px ${CYAN}33`, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}>
        <Box
          onClick={() => navigate("/chat")}
          sx={{ border: `1.5px solid ${CYAN}`, px: 2, py: 0.5, display: "flex", alignItems: "center", gap: 1, cursor: "pointer", boxShadow: `0 0 6px ${CYAN}44`, fontFamily: MONO, fontSize: "11px", letterSpacing: "2px", color: CYAN, transition: "background 0.15s", "&:hover": { background: `${CYAN}22` } }}
        >
          <FaRobot /><span>START</span>
        </Box>
        <Typography sx={{ fontFamily: MONO, fontSize: "11px", color: DIM, letterSpacing: "2px" }}>
          TALKTOIT OS v1.0 &nbsp;|&nbsp; GROQ + MONGODB
        </Typography>
        <Typography sx={{ fontFamily: MONO, fontSize: "11px", color: CYAN, letterSpacing: "2px" }}>
          {clock}
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;