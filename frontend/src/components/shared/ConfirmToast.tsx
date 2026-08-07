import toast from "react-hot-toast";
import { Box, Typography } from "@mui/material";
import type { Tokens } from "../../theme/tokens";

// ── in-app confirm toast ─────────────────────────────────────────────────────
// Replaces the browser's native window.confirm(...) popup (which ignores the
// app's theme entirely and looks like an OS alert) with an in-app toast that
// picks up the current light/dark tokens and matches the rest of the UI.
export function confirmToast(
  tokens: Tokens,
  message: string,
  onConfirm: () => void,
  options?: { confirmLabel?: string; cancelLabel?: string }
) {
  const { CARD, CARD_ALT, TEXT_PAPER, TEXT_PAPER_DIM, ACCENT_DANGER, SANS } = tokens;
  const confirmLabel = options?.confirmLabel ?? "Delete";
  const cancelLabel = options?.cancelLabel ?? "Cancel";

  toast.custom(
    (t) => (
      <Box
        sx={{
          background: CARD,
          borderRadius: "16px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
          px: 2.5,
          py: 2,
          minWidth: "280px",
          maxWidth: "340px",
          opacity: t.visible ? 1 : 0,
          transform: t.visible ? "translateY(0)" : "translateY(-6px)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      >
        <Typography
          sx={{ fontFamily: SANS, fontSize: "13px", lineHeight: 1.5, color: TEXT_PAPER, mb: 1.75 }}
        >
          {message}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Box
            component="button"
            onClick={() => toast.dismiss(t.id)}
            sx={{
              border: "none", cursor: "pointer", borderRadius: "10px",
              px: "14px", py: "7px", fontFamily: SANS, fontSize: "12px", fontWeight: 600,
              background: CARD_ALT, color: TEXT_PAPER_DIM,
              transition: "background 0.15s, color 0.15s",
              "&:hover": { background: "#2a2a2c", color: TEXT_PAPER },
            }}
          >
            {cancelLabel}
          </Box>
          <Box
            component="button"
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            sx={{
              border: "none", cursor: "pointer", borderRadius: "10px",
              px: "14px", py: "7px", fontFamily: SANS, fontSize: "12px", fontWeight: 600,
              background: ACCENT_DANGER, color: "#FFF8F6",
              transition: "opacity 0.15s",
              "&:hover": { opacity: 0.88 },
            }}
          >
            {confirmLabel}
          </Box>
        </Box>
      </Box>
    ),
    { duration: 8000, position: "top-center" }
  );
}
