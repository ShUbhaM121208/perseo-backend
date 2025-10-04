import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gmailRouter from "./routes/gmail.js";
import chatRouter from "./routes/chat.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'], // Frontend URLs
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/gmail", gmailRouter);
app.use("/api", chatRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
});

export default app;