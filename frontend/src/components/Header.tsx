import React from 'react'
import { AppBar, Toolbar, Box } from '@mui/material'
import Logo from './shared/Logo'
import { useAuth } from '../context/AuthContext'
import NavLink from './shared/NavigationLink'

const CYAN  = "#00ffcc";
const RED   = "#ff2244";
const AMBER = "#ffaa00";
const GREEN = "#00ff41";
const BODY  = "#c8f0e8";
const BLACK = "#000000";
const MONO  = "'Share Tech Mono', 'Courier New', monospace";

/* ─── Retro neon button ─────────────────────────────────────────────────────── */
const NeonNavButton = ({
  to,
  text,
  accent = CYAN,
  onClick,
}: {
  to: string;
  text: string;
  accent?: string;
  onClick?: () => Promise<void>;
}) => (
  <Box
    sx={{
      display: "inline-block",
      border: `1.5px solid ${accent}`,
      boxShadow: `0 0 6px ${accent}55`,
      fontFamily: MONO,
      fontSize: "11px",
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: accent,
      px: "14px",
      py: "6px",
      cursor: "pointer",
      transition: "all 0.15s",
      ml: "10px",
      "&:hover": {
        background: `${accent}22`,
        boxShadow: `0 0 12px ${accent}88`,
      },
    }}
  >
    <NavLink
      to={to}
      text={text}
      bg="transparent"
      textColor={accent}
      onClick={onClick}
    />
  </Box>
);

const Header = () => {
  const auth = useAuth();

  return (
    <AppBar
      sx={{
        bgcolor: BLACK,
        position: "static",
        boxShadow: "none",
        borderBottom: `2px solid ${CYAN}`,
        boxShadow: `0 2px 12px ${CYAN}33`,
        /* scanline overlay */
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,200,0.012) 2px,rgba(0,255,200,0.012) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          minHeight: "56px !important",
          px: "16px !important",
        }}
      >
        {/* LOGO + version tag */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Logo />
          <Box
            sx={{
              fontFamily: MONO,
              fontSize: "9px",
              letterSpacing: "2px",
              color: RED,
              border: `1px solid ${RED}55`,
              px: "6px",
              py: "2px",
              animation: "ttoBlink 2s step-end infinite",
              "@keyframes ttoBlink": {
                "0%,100%": { opacity: 1 },
                "50%": { opacity: 0.3 },
              },
            }}
          >
            v1.0
          </Box>
        </Box>

        {/* NAV BUTTONS */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {auth?.isLoggedIn ? (
            <>
              <NeonNavButton
                to="/chat"
                text="GO TO CHAT"
                accent={CYAN}
              />
              <NeonNavButton
                to="/"
                text="LOGOUT"
                accent={RED}
                onClick={auth?.logout}
              />
            </>
          ) : (
            <>
              <NeonNavButton
                to="/login"
                text="LOGIN"
                accent={AMBER}
              />
              <NeonNavButton
                to="/signup"
                text="SIGNUP"
                accent={GREEN}
              />
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;