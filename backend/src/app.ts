import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import appRouter from "./routes/Router";
import { errorHnadler } from "./middleware/errorHandler";

const app = express();


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
app.use(errorHnadler);

export default app;