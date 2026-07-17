import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jobDescriptionRoutes from "./routes/jobDescription.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import coverLetterRoutes from "./routes/coverLetter.routes.js";

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.status(200).send("ATS Resume Analyzer API is running");
});
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/job-descriptions", jobDescriptionRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/cover-letters", coverLetterRoutes);

// Expose uploads directory statically if needed
app.use("/uploads", express.static("uploads"));

// Error Handling Middleware
app.use(errorHandler);

export default app;
