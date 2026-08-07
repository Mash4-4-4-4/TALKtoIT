import { StrictMode, type ReactNode } from 'react'
import "highlight.js/styles/github.css";
import { createRoot } from 'react-dom/client'
import {createTheme ,ThemeProvider} from "@mui/material/styles";
import './index.css'
import {BrowserRouter} from "react-router-dom" 
import App from './App.tsx'
import AuthProvider from './context/AuthContext.tsx';
import { AppThemeProvider, useAppTheme } from './context/ThemeContext.tsx';
import axios from 'axios';
import {Toaster} from "react-hot-toast"
import {GoogleOAuthProvider} from "@react-oauth/google"

axios.defaults.baseURL="http://localhost:5000/api/v1";
axios.defaults.withCredentials=true; //this will chack for cookies in the browser and send it to the server for authentication

// Bridges our AppThemeProvider (dark/light + design tokens) into MUI's own
// theme so components rendered outside our per-page sx tokens (like the
// Toaster) still look right in both modes.
const MuiThemeBridge = ({ children }: { children: ReactNode }) => {
  const { mode, tokens } = useAppTheme();
  const theme = createTheme({
    palette: { mode },
    typography: {
      fontFamily: tokens.SANS,
      allVariants: { color: mode === "dark" ? tokens.TEXT_INK : tokens.TEXT_INK },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: tokens.CARD,
            color: tokens.TEXT_PAPER,
            fontFamily: tokens.SANS,
            fontSize: "13px",
          },
          success: { iconTheme: { primary: tokens.ACCENT, secondary: tokens.CARD } },
          error: { iconTheme: { primary: tokens.ACCENT_DANGER, secondary: tokens.CARD } },
        }}
      />
      {children}
    </ThemeProvider>
  );
};

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Google Client ID:', clientId); // temporary debug line
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
    <BrowserRouter>
    <AppThemeProvider>
      <MuiThemeBridge>
        <App />
      </MuiThemeBridge>
    </AppThemeProvider>
    </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
