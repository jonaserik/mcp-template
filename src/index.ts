#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLogger } from "./lib/logger.js";
import { IPAStateManager } from "./ipa-state.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";

const logger = createLogger('Main');

// Initialize IPA State Manager
// We use process.env.IPA_ROOT if provided, otherwise fallback to process.cwd()
const rootDir = process.env.IPA_ROOT || process.cwd();
const stateManager = new IPAStateManager(rootDir);

// Create MCP server instance
const server = new McpServer({
  name: "mcp-ipa-guardian",
  version: "1.0.0",
});

// Register Tools and Resources
registerTools(server, stateManager);
registerResources(server, stateManager);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("MCP IPA Guardian running on STDIO");
}

function gracefulShutdown() {
  logger.info("Received shutdown signal. Closing server...");
  server.close();
  process.exit(0);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

main().catch((error) => {
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(process.cwd(), 'mcp-ipa-error.log');
  const errorMessage = `[${new Date().toISOString()}] FATAL ERROR: ${error.stack || error}\n`;
  fs.appendFileSync(logPath, errorMessage);
  
  logger.error("Fatal error", error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(process.cwd(), 'mcp-ipa-error.log');
  const errorMessage = `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${error.stack || error}\n`;
  fs.appendFileSync(logPath, errorMessage);
  
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(process.cwd(), 'mcp-ipa-error.log');
  const errorMessage = `[${new Date().toISOString()}] UNHANDLED REJECTION: ${reason}\n`;
  fs.appendFileSync(logPath, errorMessage);
  
  console.error("Unhandled Rejection:", reason);
});
