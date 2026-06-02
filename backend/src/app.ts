import express from "express"
import morgan from "morgan"
import cors from "cors"
import {config} from "dotenv"; //mogodb connection
import appRouter from "./routes/Router";
import cookieParser from "cookie-parser";
import "./models/pdf"
import mongoose from "mongoose";

const app=express()

app.use("/files",express.static("files")) //this will serve the files from the "files" folder when the client requests for them, make sure to create this folder in your project root
config()
app.use(cors({origin:"http://localhost:5173",credentials:true})) //this will allow the frontend to make requests to the backend from a different origin
app.use(express.json()) //this tells that the in and out requests will be in json format





import multer from "multer";
const PdfSchema=mongoose.model("Pdf") //this will get the Pdf model that we defined in the pdf.ts file, we can use this model to interact with the pdfs collection in the database  
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files') //this is the folder where the uploaded files will be stored, make sure to create this folder in your project root
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() 
    cb(null, uniqueSuffix+file.originalname)     //this will give the file a unique name by appending the current timestamp to the original file name
  }
})
const upload = multer({ storage: storage }) //this will create a multer instance with the defined storage configuration
app.post("/uploadfiles",upload.single("file"),async (req,res)=>
{ if(!req.file){
    return res.status(400).json({message:"No file uploaded"})
}
  console.log(req.file);
  const filename=req.file.filename;
  res.json({message:"File uploaded successfully", filename})

  try {
    await PdfSchema.create({ pdf: filename })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving file to database" })
  }
})

app.get("/getpdfs",async(req,res)=>{
  try
{
PdfSchema.find({}).then(data=>
{
  res.send({pdfs:data})
}
)
}
catch(error)
{
  console.log(error);
  res.status(500).json({message:"Error fetching pdfs from database"})
}
})


app.use(cookieParser(process.env.COOKIE_SECRET)) //this will parse the cookie from the request header and make it available in req.cookies
//remove it once you deploy
app.use(morgan("dev"))

app.use("/api/v1",appRouter)
export default app;
