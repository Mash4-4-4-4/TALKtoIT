import "dotenv/config";

import app from "./app.js";
import { ConnectToDatabase } from "./db/connections.js";

const PORT = Number(process.env.PORT) || 8080;

ConnectToDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });