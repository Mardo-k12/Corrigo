import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { requestIdMiddleware } from "./middlewares/request-id";
import { errorHandler } from "./middlewares/error-handler";
import { initDataDog } from "./lib/datadog";
import { createHttpLogger } from "./lib/http-logger";

const app: Express = express();

// Initialize DataDog
initDataDog();

// Security & Rate Limiting
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: "Too many AI requests, please try again later.",
  skipSuccessfulRequests: false,
});

app.use(limiter);

// Request Logging & ID
app.use(requestIdMiddleware);
app.use(createHttpLogger());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  }),
);

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api", router);

// Apply stricter rate limiting to AI routes
app.use("/api/ai", aiLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", requestId: req.id });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    requestId: req.id,
  });
});

// Error handling (must be last)
app.use(errorHandler);

export default app;
