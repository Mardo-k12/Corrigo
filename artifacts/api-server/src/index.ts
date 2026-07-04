import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const workspaceRoot = path.join(projectRoot, "..", "..");

for (const envPath of [
  path.join(workspaceRoot, ".env.local"),
  path.join(workspaceRoot, ".env"),
  path.join(projectRoot, ".env.local"),
  path.join(projectRoot, ".env"),
]) {
  dotenv.config({ path: envPath, override: false });
}

const { default: app } = await import("./app");
const { logger } = await import("./lib/logger");

const rawPort = process.env["PORT"] ?? process.env["API_PORT"] ?? "5001";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
