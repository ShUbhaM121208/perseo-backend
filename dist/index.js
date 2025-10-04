import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gmailRouter from "./routes/gmail.js";
import chatRouter from "./routes/chat.js";
import onboardingRoutes from './routes/onboarding.js';
import composioRoutes from './routes/composio.js';
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
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/composio", composioRoutes);
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
    // Development logging
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🔐 Supabase integration active`);
        console.log(`📋 Onboarding API: http://localhost:${PORT}/api/onboarding`);
    }
});
export default app;
//# sourceMappingURL=index.js.map