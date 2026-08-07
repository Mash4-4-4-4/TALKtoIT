import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useAppTheme } from "../../context/ThemeContext";

// ── Thinking / typing indicator ──────────────────────────────────────────────
// Shown in place of the assistant's next message while a reply is in flight.
// Cycles through a short list of status words ("Thinking…" → "Replying…" etc.)
// so a slow response still feels alive instead of stuck, and uses tokens for
// every color so it looks correct in light mode, dark mode, and mid-toggle.
type ThinkingIndicatorProps = {
  /** Status words to cycle through, e.g. ["Thinking", "Replying"] */
  labels?: string[];
  /** ms between label swaps */
  intervalMs?: number;
};

const ThinkingIndicator = ({
  labels = ["Thinking", "Replying"],
  intervalMs = 1600,
}: ThinkingIndicatorProps) => {
  const { tokens } = useAppTheme();
  const { SURFACE_ALT, TEXT_MUTED, SANS } = tokens;

  const [labelIndex, setLabelIndex] = useState(0);

  useEffect(() => {
    if (labels.length <= 1) return;
    const id = setInterval(() => {
      setLabelIndex((i) => (i + 1) % labels.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [labels, intervalMs]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: "10px",
          borderRadius: "18px 18px 18px 4px",
          background: SURFACE_ALT,
          px: 2.25, py: 1.5,
          transition: "background 0.2s ease",
        }}
      >
        {/* three-dot pulse */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 6, height: 6, borderRadius: "50%",
                background: TEXT_MUTED,
                animation: "thinkingBounce 1.1s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
                "@keyframes thinkingBounce": {
                  "0%, 60%, 100%": { transform: "translateY(0)", opacity: 0.4 },
                  "30%": { transform: "translateY(-3px)", opacity: 1 },
                },
              }}
            />
          ))}
        </Box>

        <Typography
          key={labelIndex}
          sx={{
            fontFamily: SANS, fontSize: "13px", fontWeight: 500,
            letterSpacing: "0.1px", color: TEXT_MUTED,
            animation: "thinkingFade 0.35s ease",
            "@keyframes thinkingFade": {
              from: { opacity: 0, transform: "translateY(2px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {labels[labelIndex]}…
        </Typography>
      </Box>
    </Box>
  );
};

export default ThinkingIndicator;
