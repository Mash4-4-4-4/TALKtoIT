import express from "express";
import morgan from "morgan";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";

import appRouter from "./routes/Router";

const app = express();

config();


import { chunkText } from "./services/chunkService";
import  {generateEmbedding} from "./services/embeddingService";

async function test() {

  const embedding =
    await generateEmbedding(
      "Variables store values"
    );

  console.log(
    embedding?.length
  );

  console.log(
    embedding?.slice(0,10)
  );
}

test();




app.use(
  "/files",
  express.static("files")
);

app.use(
  cors({
    origin:
    "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  cookieParser(
    process.env.COOKIE_SECRET
  )
);

app.use(morgan("dev"));

app.use("/api/v1", appRouter);

export default app;