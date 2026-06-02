const mongoose = require("mongoose")

const PdfSchema=new mongoose.Schema({
    pdf:String,
  
},{timestamps:true,collections:"pdfs"})

mongoose.model("Pdf",PdfSchema)