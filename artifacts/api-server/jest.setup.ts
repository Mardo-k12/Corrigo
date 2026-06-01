// Jest setup file - Initialize test environment variables
process.env.NODE_ENV = "test";
process.env.AI_INTEGRATIONS_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
process.env.AI_INTEGRATIONS_GEMINI_API_KEY = "test-key";
process.env.PORT = "5001";
process.env.JWT_SECRET = "test-secret";
process.env.CORS_ORIGIN = "http://localhost:5173";
