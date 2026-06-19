import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { IoIosLogIn } from 'react-icons/io'
import React, { useEffect } from 'react'
import CustomizedInput from '../components/shared/CustomizedInput'
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext'

const CYAN  = "#00ffcc";
const RED   = "#ff2244";
const BLACK = "#000000";
const BODY  = "#c8f0e8";
const MONO  = "'Share Tech Mono', 'Courier New', monospace";
const PIXEL = "'VT323', 'Courier New', monospace";

const Signup = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name     = formData.get("name")     as string;
    const email    = formData.get("email")    as string;
    const password = formData.get("password") as string;
    try {
      toast.loading("Signing in...", { id: "signup" });
      await auth?.signup(name, email, password);
      toast.success("Signup successful!", { id: "signup" });
    } catch (error) {
      console.error("signup failed:", error);
      toast.error("Signup failed. Please try again.", { id: "signup" });
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
        flexDirection: "row",
        backgroundColor: BLACK,
        overflow: "hidden",
        /* scanlines */
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,200,0.012) 2px,rgba(0,255,200,0.012) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        },
        "@keyframes ttoBlink": {
          "0%,100%": { opacity: 1 },
          "50%":     { opacity: 0 },
        },
        "@keyframes ttoGlow": {
          "0%,100%": { boxShadow: `0 0 8px ${CYAN}66` },
          "50%":     { boxShadow: `0 0 18px ${CYAN}cc` },
        },
      }}
    >
      {/* ── LEFT: FORM ── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            width: "340px",
            padding: "36px 32px",
            border: `1.5px solid ${CYAN}`,
            boxShadow: `0 0 24px ${CYAN}33, inset 0 0 8px ${CYAN}08`,
            background: "rgba(0,255,204,0.03)",
            position: "relative",
          }}
        >
          {/* window titlebar */}
          <Box
            sx={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              borderBottom: `1px solid ${CYAN}44`,
              px: 1.5, py: 0.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", color: CYAN }}>
              USER_REGISTER.EXE
            </Typography>
            <Box sx={{ display: "flex", gap: "4px" }}>
              {[0, 1, 2].map((i) => (
                <Box key={i} sx={{ width: 7, height: 7, border: `1px solid ${CYAN}` }} />
              ))}
            </Box>
          </Box>

          {/* spacer for titlebar */}
          <Box sx={{ mt: "20px" }} />

          {/* heading */}
          <Typography
            sx={{
              fontFamily: PIXEL,
              fontSize: "42px",
              color: CYAN,
              letterSpacing: "4px",
              lineHeight: 1,
              textAlign: "center",
              textShadow: `0 0 12px ${CYAN}88`,
            }}
          >
            SIGN UP
          </Typography>

          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: "10px",
              letterSpacing: "2px",
              color: `${CYAN}99`,
              textAlign: "center",
              animation: "ttoBlink 2s step-end infinite",
            }}
          >
            ▌ CREATE NEW USER ACCOUNT ▌
          </Typography>

          {/* fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "14px", mt: "4px" }}>
            {/* field label style */}
            {[
              { type: "text",     name: "name",     label: "NAME" },
              { type: "email",    name: "email",    label: "EMAIL" },
              { type: "password", name: "password", label: "PASSWORD" },
            ].map(({ type, name, label }) => (
              <Box key={name}>
                <Typography
                  sx={{
                    fontFamily: MONO,
                    fontSize: "9px",
                    letterSpacing: "2px",
                    color: `${CYAN}99`,
                    mb: "4px",
                  }}
                >
                
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${CYAN}55`,
                    "&:focus-within": {
                      border: `1px solid ${CYAN}`,
                      boxShadow: `0 0 8px ${CYAN}44`,
                    },
                    "& input": {
                      background: "transparent",
                      color: BODY,
                      fontFamily: MONO,
                      fontSize: "13px",
                      letterSpacing: "1px",
                      border: "none",
                      outline: "none",
                      width: "100%",
                      padding: "8px 10px",
                    },
                    "& label": { color: `${CYAN}77 !important` },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                    "& .MuiInputLabel-root": { fontFamily: `${MONO} !important`, fontSize: "12px !important", letterSpacing: "1px" },
                    "& .MuiInputBase-input": { color: `${BODY} !important`, fontFamily: `${MONO} !important`, fontSize: "13px !important" },
                  }}
                >
                  <CustomizedInput type={type} name={name} label={label} />
                </Box>
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
              border: `1.5px solid ${RED}`,
              background: "transparent",
              color: RED,
              fontFamily: MONO,
              fontSize: "12px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              py: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: `0 0 8px ${RED}44`,
              transition: "all 0.15s",
              animation: "ttoGlow 2s ease-in-out infinite",
              "@keyframes ttoGlow": {
                "0%,100%": { boxShadow: `0 0 6px ${RED}44` },
                "50%":     { boxShadow: `0 0 16px ${RED}99` },
              },
              "&:hover": {
                background: `${RED}18`,
                boxShadow: `0 0 20px ${RED}88`,
              },
            }}
          >
            INITIALIZE ACCOUNT
            <IoIosLogIn size={18} />
          </Box>

          {/* bottom status */}
          <Typography
            sx={{
              fontFamily: MONO,
              fontSize: "9px",
              color: `${CYAN}55`,
              letterSpacing: "1px",
              textAlign: "center",
              mt: "-4px",
            }}
          >
            TALKTOIT OS v1.0 &nbsp;|&nbsp; SECURE CHANNEL
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT: IMAGE ── */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* neon frame around image */}
        <Box
          sx={{
            border: `1.5px solid ${CYAN}44`,
            boxShadow: `0 0 30px ${CYAN}22`,
            p: "6px",
            position: "relative",
          }}
        >
          {/* corner accents */}
          {["top left", "top right", "bottom left", "bottom right"].map((pos) => {
            const [v, h] = pos.split(" ");
            return (
              <Box
                key={pos}
                sx={{
                  position: "absolute",
                  [v]: -2, [h]: -2,
                  width: 16, height: 16,
                  borderTop:    v === "top"    ? `2px solid ${CYAN}` : "none",
                  borderBottom: v === "bottom" ? `2px solid ${CYAN}` : "none",
                  borderLeft:   h === "left"   ? `2px solid ${CYAN}` : "none",
                  borderRight:  h === "right"  ? `2px solid ${CYAN}` : "none",
                }}
              />
            );
          })}
          <img
            src="login.png"
            alt="signup visual"
            style={{
              width: "100%",
              maxWidth: "420px",
              height: "auto",
              display: "block",
              filter: "brightness(0.85) contrast(1.1)",
            }}
          />
          {/* scan overlay on image */}
          <Box
            sx={{
              position: "absolute",
              inset: "6px",
              background:
                "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,204,0.03) 3px,rgba(0,255,204,0.03) 4px)",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;