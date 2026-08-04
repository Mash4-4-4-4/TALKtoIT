import { StrictMode } from 'react'
import "highlight.js/styles/github.css";
import { createRoot } from 'react-dom/client'
import {createTheme ,ThemeProvider} from "@mui/material/styles";
import './index.css'
import {BrowserRouter} from "react-router-dom" 
import App from './App.tsx'
import AuthProvider from './context/AuthContext.tsx';
import axios from 'axios';
import {Toaster} from "react-hot-toast"
import {GoogleOAuthProvider} from "@react-oauth/google"

axios.defaults.baseURL="http://localhost:5000/api/v1";
axios.defaults.withCredentials=true; //this will chack for cookies in the browser and send it to the server for authentication
//crated theme for the entire app
const theme = createTheme(
  {
    typography:
    {
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      allVariants:{color:"white"},
    },
  }
);
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Google Client ID:', clientId); // temporary debug line
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
    <BrowserRouter>
    <ThemeProvider theme={theme}>
      <Toaster position="top-right" />
      <App />
    </ThemeProvider>
    </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)
