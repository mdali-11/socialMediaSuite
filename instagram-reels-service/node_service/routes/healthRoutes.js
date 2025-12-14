import express from "express";
import { isPythonServiceHealthy } from "../services/pythonService.js";

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check for Node.js service and Python service
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const pythonHealthy = await isPythonServiceHealthy();
  
  res.json({
    status: "healthy",
    service: "Instagram Reels Service - Node.js",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    services: {
      nodejs: {
        status: "healthy",
        port: process.env.PORT || 5000
      },
      python: {
        status: pythonHealthy ? "healthy" : "unavailable",
        port: process.env.INSTAGRAM_SERVICE_PORT || 5001,
        message: pythonHealthy 
          ? "Python service is running" 
          : "Python service is not available"
      }
    }
  });
});

export default router;