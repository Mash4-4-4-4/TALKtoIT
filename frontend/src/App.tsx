import Header from "./components/Header"
import Home from "./pages/Home"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import {Routes,Route} from "react-router-dom";
import Signup from "./pages/Signup";
import { useAuth } from "./context/AuthContext";
import PdfChat from "./pages/PdfChat";
function App() {
  return (
    <>
       <main>
        <Header/>
        <Routes> //route container

          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/notfound" element={<NotFound/>}></Route>
          <Route path="/chat" element={<Chat/>}></Route>
          <Route path="/pdf"element={<PdfChat/>} ></Route>
        </Routes>
       </main>
    </>
  )
}

export default App
