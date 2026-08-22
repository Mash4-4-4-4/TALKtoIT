import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import googleAuthRoutes from "./routes/googleAuth";
import appRouter from "./routes/Router";
import { errorHnadler } from "./middleware/errorHandler";

const app = express();

app.get("/", (req, res) => {
  res.send("TalkToIt backend is running 🚀");
});

app.use(
  "/files",
  express.static("files")
);

const allowedOrigins = [
  "http://localhost:5173",
  "https://tal-kto-it.vercel.app",
  "https://tal-kto-3jcde85br-mash4-4-4-4s-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin, such as server-to-server requests
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use('/api/v1/auth', googleAuthRoutes);

app.use(errorHnadler);
export default app;