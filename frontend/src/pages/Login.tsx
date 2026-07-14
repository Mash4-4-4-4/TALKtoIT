import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { IoIosLogIn } from 'react-icons/io'
import React from 'react'
import { useEffect } from 'react'
import CustomizedInput from '../components/shared/CustomizedInput'
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../helpers/api.communication'

// ── design tokens ── minimalist dark-card aesthetic ─────────────────────────
const PAGE_BG   = "#F3F1EC";
const CARD      = "#18181A";
const TEXT_INK  = "#17171A";
const TEXT_MUTED = "#8B8A84";
const TEXT_PAPER = "#F6F5F1";
const TEXT_PAPER_DIM = "#9C9B9E";
const SANS = "'Inter', -apple-system, 'Segoe UI', sans-serif";

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email    = formData.get("email")    as string;
    const password = formData.get("password") as string;
    try {
      toast.loading("Logging in...", { id: "login" });
      await auth?.login(email, password);
      toast.success("Login successful!", { id: "login" });
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please try again.", { id: "login" });
    }
  };

  useEffect(() => {
    if (auth?.user) navigate("/chat");
  }, [auth]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: PAGE_BG,
        fontFamily: SANS,
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "380px",
          padding: "40px 36px",
          borderRadius: "28px",
          background: CARD,
          boxShadow: "0 20px 48px rgba(0,0,0,0.16)",
        }}
      >
        {/* heading */}
        <Box>
          <Typography
            sx={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: "28px",
              color: TEXT_PAPER,
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontFamily: SANS,
              fontSize: "13px",
              fontWeight: 500,
              color: TEXT_PAPER_DIM,
              mt: "6px",
            }}
          >
            Log in to continue to TalkToIt
          </Typography>
        </Box>

        {/* fields */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", mt: "4px" }}>
          {[
            { type: "email",    name: "email",    label: "Email"    },
            { type: "password", name: "password", label: "Password" },
          ].map(({ type, name, label }) => (
            <Box
              key={name}
              sx={{
                borderRadius: "14px",
                background: "#222224",
                "&:focus-within": { boxShadow: "0 0 0 2px #F6F5F1" },
                "& .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                "& .MuiInputLabel-root": { fontFamily: `${SANS} !important`, fontSize: "13px !important", color: `${TEXT_PAPER_DIM} !important` },
                "& .MuiInputBase-input": { color: `${TEXT_PAPER} !important`, fontFamily: `${SANS} !important`, fontSize: "14px !important", padding: "14px !important" },
              }}
            >
              <CustomizedInput type={type} name={name} label={label} />
            </Box>
          ))}
        </Box>

        {/* submit button */}
        <Box
          component="button"
          type="submit"
          sx={{
            mt: "8px",
            width: "100%",
            border: "none",
            borderRadius: "999px",
            background: TEXT_PAPER,
            color: TEXT_INK,
            fontFamily: SANS,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1px",
            py: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "opacity 0.15s",
            "&:hover": { opacity: 0.88 },
          }}
        >
          Log in
          <IoIosLogIn size={18} />
        </Box>

        {/* bottom status */}
        <Typography
          sx={{
            fontFamily: SANS,
            fontSize: "11px",
            color: TEXT_PAPER_DIM,
            textAlign: "center",
            mt: "-6px",
          }}
        >
          TalkToIt &nbsp;·&nbsp; Secure channel
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;