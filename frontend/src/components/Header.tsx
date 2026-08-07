import React from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Sun, Moon, MessageSquare, FileText, Code2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";

/* ─── Header ── matches the minimalist dark-card aesthetic used everywhere
   else in the app: a persistent near-black "card" bar, rounded corners,
   pill-shaped nav items, sage accent for the active route, and a theme
   toggle on the far right. ─────────────────────────────────────────────── */

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
};

const Header = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme, tokens } = useAppTheme();
  const { CARD, CARD_ALT, TEXT_PAPER, TEXT_PAPER_DIM, ACCENT, SANS } = tokens;

  const NavItem = ({ to, label, icon, active, onClick }: NavItemProps) => (
    <Box
      onClick={() => {
        if (onClick) onClick();
        else navigate(to);
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        borderRadius: "999px",
        px: "16px",
        py: "8px",
        cursor: "pointer",
        fontFamily: SANS,
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.1px",
        color: active ? "#0E0F0E" : TEXT_PAPER_DIM,
        background: active ? ACCENT : "transparent",
        transition: "background 0.15s, color 0.15s",
        "&:hover": {
          background: active ? ACCENT : CARD_ALT,
          color: active ? "#0E0F0E" : TEXT_PAPER,
        },
      }}
    >
      {icon}
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
        {label}
      </Box>
    </Box>
  );

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Box
        sx={{
          background: CARD,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: "14px", sm: "22px" },
          py: "10px",
          gap: "12px",
          fontFamily: SANS,
          minHeight: "56px",
          boxSizing: "border-box",
        }}
      >
        {/* ── LOGO ── */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: "30px",
              height: "30px",
              borderRadius: "9px",
              background: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0E0F0E",
              fontWeight: 800,
              fontSize: "14px",
            }}
          >
            T
          </Box>
          <Typography
            sx={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: "16px",
              letterSpacing: "-0.3px",
              color: TEXT_PAPER,
            }}
          >
            TalkToIt
          </Typography>
        </Box>

        {/* ── NAV ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center", overflowX: "auto" }}>
          {auth?.isLoggedIn ? (
            <>
              <NavItem to="/chat" label="AI Chat" icon={<MessageSquare size={15} />} active={location.pathname === "/chat"} />
              <NavItem to="/pdf" label="PDF Chat" icon={<FileText size={15} />} active={location.pathname === "/pdf"} />
              <NavItem to="/repo" label="Repo Chat" icon={<Code2 size={15} />} active={location.pathname === "/repo"} />
            </>
          ) : null}
        </Box>

        {/* ── RIGHT SIDE: theme toggle + auth actions ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <Box
            onClick={toggleTheme}
            title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
            sx={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: TEXT_PAPER_DIM,
              background: CARD_ALT,
              transition: "color 0.15s, transform 0.15s",
              "&:hover": { color: TEXT_PAPER, transform: "rotate(20deg)" },
            }}
          >
            {mode === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </Box>

          {auth?.isLoggedIn ? (
            <NavItem
              to="/"
              label="Logout"
              icon={<LogOut size={15} />}
              active={false}
              onClick={async () => {
                await auth?.logout?.();
                navigate("/");
              }}
            />
          ) : (
            <>
              <Box
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: "999px", px: "16px", py: "8px", cursor: "pointer",
                  fontFamily: SANS, fontSize: "13px", fontWeight: 600, color: TEXT_PAPER_DIM,
                  transition: "background 0.15s, color 0.15s",
                  "&:hover": { background: CARD_ALT, color: TEXT_PAPER },
                }}
              >
                Login
              </Box>
              <Box
                onClick={() => navigate("/signup")}
                sx={{
                  borderRadius: "999px", px: "16px", py: "8px", cursor: "pointer",
                  fontFamily: SANS, fontSize: "13px", fontWeight: 700, color: "#0E0F0E",
                  background: ACCENT,
                  transition: "opacity 0.15s",
                  "&:hover": { opacity: 0.88 },
                }}
              >
                Sign up
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
