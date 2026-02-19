#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLogger } from "./lib/logger.js";
import { IPAStateManager } from "./ipa-state.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";

const logger = createLogger('Main');

// Initialize IPA State Manager
// We use process.cwd() so the state is tracked in the folder where the server is running (the project being guarded)
const stateManager = new IPAStateManager(process.cwd());

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
  logger.error("Fatal error", error);
  process.exit(1);
});
