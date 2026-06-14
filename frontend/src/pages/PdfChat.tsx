 
import React, {
  useEffect,
  useState
} from "react";
import axios from 'axios';
import PdfUpload from '../components/PdfUpload';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import { SendIcon } from 'lucide-react';
import { askPdfQuestion } from '../helpers/api.communication';
import { DeleteIcon } from 'lucide-react';


const PdfChat = () =>
{
  type PdfType={
    _id:string,
    pdf:string;
}
    const inputRef=React.useRef<HTMLInputElement>(null);//gives direct reference to the input element
    
const [pdfs,setPdfs]=useState<PdfType[]>([]);
    const [selectedpdf,setSelectedPdf]=  useState<PdfType | null>(null);
const [messages, setMessages] =
  useState<Message[]>([]);

    type Message = {
  role: "user" | "assistant";
  content: string;
};

       const handleSend = async () => {
  try {
    if (!selectedpdf) {
      alert("Select a PDF first");
      return;
    }

    const question =
      inputRef.current?.value?.trim();

    if (!question) return;

    const userMessage: Message = {
      role: "user",
      content: question,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    const response =
      await askPdfQuestion(
        selectedpdf._id,
        question
      );

    const assistantMessage: Message = {
      role: "assistant",
      content: response.answer,
    };

    setMessages((prev) => [
      ...prev,
      assistantMessage,
    ]);
  } catch (error) {
    console.log(error);
  }
};

        const fetchPdfs=async()=>
        {
          try {
            const result=await axios.get(
                "http://localhost:5000/api/v1/pdf/all"
            );
            setPdfs(result.data.pdfs);

            
          } catch (error)
           {
            console.log(error)
          }
        }
          useEffect(
        ()=>
        {
            fetchPdfs();
        }
        
        ,[])


    return (
    <div>
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
    width: "30%",
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
    PDF Chat
  </Typography>

  <PdfUpload fetchPdfs={fetchPdfs} />

  <Box sx={{ mt: 2 }}>
    {pdfs.map((pdf) => (
      <Paper
  key={pdf._id}
  onClick={() => {
    alert("clicked");
    console.log("CLICKED");
    console.log(pdf);
    setSelectedPdf(pdf);
  }}
        sx={{
          p: 2,
          mb: 1,
          cursor: "pointer",
          backgroundColor:
            selectedpdf?._id === pdf._id
              ? "#2563eb"
              : "#1e293b",
          color: "white",
        }}
      >
        {pdf.pdf}
      </Paper>
    ))}
  </Box>
</Box>

      {/* Main Chat Area */}
      <Box
        sx={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
       <Box
  sx={{
    flex: 1,
    overflowY: "auto",
    p: 2,
  }}
>
  {messages.map((message, index) => (
    <Paper
      key={index}
      sx={{
        p: 2,
        mb: 2,
        ml:
          message.role === "user"
            ? "auto"
            : 0,
        maxWidth: "70%",
        backgroundColor:
          message.role === "user"
            ? "#2563eb"
            : "#1e293b",
        color: "white",
      }}
    >
      {message.content}
    </Paper>
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
     </div>
  );
};

export default PdfChat