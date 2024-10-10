import express, { Request, Response } from "express";

const router = express.Router();

// Define a GET route on the root path ('/') that responds with a simple message.

router.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

export default router;
