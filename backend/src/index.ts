// src/index.ts
import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
// name this import depending on what routes correspond to productAPI or commentsAPI
import apiRoutes from "./routes/routes";

// Initialize dotenv to read and parse `.env` file contents into `process.env`.
dotenv.config();

// Instantiate an Express application and store it in the variable 'app'.
const app: Express = express();
const port = process.env.PORT || 5001;

// Apply CORS middleware to the Express app to allow cross-origin requests.
app.use(cors());

app.use("/api", apiRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Start the Express app and listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
