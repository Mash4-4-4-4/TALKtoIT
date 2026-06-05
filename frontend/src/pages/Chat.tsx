//very important file understand this!!!
import React, { useEffect, useState } from "react";
import PdfUpload from "../components/PdfUpload";
import {deleteAllChats, getAllChats} from "../helpers/api.communication";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter"
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import { useNavigate} from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";

import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../context/AuthContext";
import { sendChatMessages } from "../helpers/api.communication";
import { toast } from "react-hot-toast";


type Message = {
  role: "user" | "assistant";
  content: string;
};

function extractCodeFromString(message:string)//this function will extract code blocks from the message string and return an array of code blocks
{
    if(message.includes("```"))
    {
      const blocks=message.split("```");
      return blocks;
    }
    return [message];
}

function isCodeBlock(str:string)
{
  if(
  str.includes("=")||
  str.includes(";")||
  str.includes("[")||
  str.includes("]")||
  str.includes("{")||
  str.includes("}")||
  str.includes("#")||
  str.includes("import")||
  str.includes("from")||
  str.includes("//")
  )
  {
     return true;
  }
  return false;
}
const Chat =  () => {
    const navigate=useNavigate();
   const inputRef=React.useRef<HTMLInputElement>(null);//gives direct reference to the input element
    const auth=useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I assist you today?",
    },
  ]);
const handleSend =async () => 
{
const content=inputRef.current?.value as string;

if(inputRef && inputRef.current){
inputRef.current.value="";//clear input field
}
const newMessage: Message = {
  role: "user",
  content, 
};

setChatMessages((prev)=>[...prev,newMessage]);
    // clear input field
    if (inputRef.current) {
      inputRef.current.value = "";
    }
try {

      // send message to backend
      const chatData = await sendChatMessages(content);

      // update chats with AI response
      setChatMessages(chatData.chats);

    } catch (error) {

      console.log(error);

    }//update chat messages with AI response
  };
//send api request to backend with the new message and get response from AI and update chatMessages with AI response

//delete chats function

const handleDeleteChats=()=>
{
  try
  {
    deleteAllChats();
    setChatMessages([]);
    toast.success("Chats deleted successfully");
  }
  catch(error)
  {
    console.log(error);
    toast.error("Failed to delete chats");
  }
}

const hasFetched = React.useRef(false);
useEffect(() => {
  if (auth?.isLoggedIn && auth?.user) {

     if (hasFetched.current) return;

  hasFetched.current = true;
    const toastID = toast.loading("Fetching chats...");
        
    getAllChats()
      .then((data) => {
        setChatMessages([...data.chats]);
        toast.success("Chats loaded successfully",{id: toastID});
      })
      .catch((err) => {
        toast.error("Failed to load chats",{id: toastID});
        console.log(err);
      });

  }
}, [auth]);

useEffect(()=>
  {
    if(!auth?.user)
    {
      navigate("/login");
    }
  },[auth])
  
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0f172a",
      }}
    >

      {/* Sidebar */}
      <Box
        sx={{
          width: "20%",
          backgroundColor: "#111827",
          borderRight: "1px solid #1e293b",
          p: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "white",
            fontWeight: "bold",
            mb: 3,
          }}
        >
          My AI
        </Typography>

        <Paper
          sx={{
            p: 2,
            backgroundColor: "#1e293b",
            color: "white",
            cursor: "pointer",
          }}
        >
          New Chat
        </Paper>
        <IconButton
        
            onClick={handleDeleteChats}
            sx={{
              top: "10px",
              backgroundColor: "#2563eb",
              color: "white",
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            }}
          >
        <DeleteIcon/>
      </IconButton> 
      </Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          width: "80%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >

        {/* Chat Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
          }}
        >
          {chatMessages.map((chat, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent:
                  chat.role === "user"
                    ? "flex-end"
                    : "flex-start",
                mb: 2,
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: "60%",
                  backgroundColor:
                    chat.role === "user"
                      ? "#2563eb"
                      : "#1e293b",
                  color: "white",
                  borderRadius: 3,
                }}
              >
                {extractCodeFromString(chat.content) ?.map((block, idx) => {
                  if(isCodeBlock(block)) {
                    return (
                      <SyntaxHighlighter
                        key={idx}
                        language={block.split("\n")[0]}
                        style={coldarkCold}
                      >
                        {block.split("\n").slice(1).join("\n")}
                      </SyntaxHighlighter>
                                                                );
                                        }
                  return <Typography key={idx}>{block}</Typography>;
                })}
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #1e293b",
            display: "flex",
            gap: 2,
            backgroundColor: "#111827",
          }}
        >
          <TextField
          inputRef={inputRef}
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            sx={{
              input: {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1e293b",
                borderRadius: "12px",
              },
            }}
          />
<PdfUpload />
           <IconButton
           onClick={handleSend}
            sx={{
              backgroundColor: "#2563eb",
              color: "white",
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>

      </Box>
    </Box>
  );
};

export default Chat;