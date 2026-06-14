import mongoose from "mongoose";

const chunkSchema=new mongoose.Schema(
    {
        pdfId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pdf",  
            required: true,   
    },
    chunk:
    {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
},
    {
        timestamps: true,
        collection: "chunks",
    }
);

export default mongoose.model("Chunk", chunkSchema);