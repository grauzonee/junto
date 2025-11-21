/**
 * The main Express application instance.
 *
 * This module initializes middleware, API routes, static file serving,
 * and exposes the configured Express app.
 *
 * @packageDocumentation
 */

import express, { Request, Response } from "express";
import { router } from "@/routes/main";
import cors from "cors";
import path from "path";

/**
 * Create the Express application.
 *
 * Sets up:
 * - CORS
 * - JSON body parsing
 * - `/status` health-check route
 * - `/api` main application routes
 * - Static file serving for `/uploads` and `/docs`
 *
 * @returns The configured Express application.
 */
const app = express();

app.use(cors());
app.use(express.json());

/**
 * Health-check endpoint.
 *
 * @route GET /status
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON message confirming the API is running.
 */
app.get("/status", (req: Request, res: Response) => {
    res.json({ message: "Junto API is running!" });
});

/**
 * Main API router.
 *
 * All API endpoints are nested under `/api`.
 */
app.use("/api", router);

/**
 * Static file route for uploaded files.
 *
 * @route GET /uploads
 */
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

/**
 * Static documentation files.
 *
 * @route GET /docs
 */
app.use("/docs", express.static(path.join(__dirname, "..", "docs")));

/**
 * The configured Express app.
 */
export default app;
