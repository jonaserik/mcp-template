#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { createLogger } from "./lib/logger.js";
import { db } from "./lib/database.js";

const logger = createLogger('Main');

// Initialize database
try {
  db.init(`
    CREATE TABLE IF NOT EXISTS system_metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (error) {
  logger.error("Failed to initialize database", error);
  process.exit(1);
}

// Create MCP server instance
const server = new McpServer({
  name: "mcp-template",
  version: "1.0.0",
});

// TODO: Add your tools here
// Tool de teste para verificar conectividade
server.tool(
  "template_ping",
  "Ferramenta de teste simples para verificar se o servidor MCP está rodando e respondendo.",
  { 
    message: z.string().optional().describe("Uma mensagem opcional para ecoar de volta") 
  },
  async ({ message }) => {
    const reply = message ? `Pong! Você disse: ${message}` : "Pong!";
    console.error(`[template_ping] Recebido ping com mensagem: ${message || '(vazio)'}`);
    return { content: [{ type: "text", text: reply }] };
  }
);

// TODO: Add your resources here
// server.resource("resource-name", "resource://template/example", async (uri) => {
//   return { contents: [{ uri: uri.href, mimeType: "text/plain", text: "Resource content" }] };
// });

// TODO: Add your prompts here
// server.prompt("prompt-name", "Prompt description", { /* schema */ }, async (args) => {
//   return { messages: [{ role: "user", content: { type: "text", text: "Prompt content" } }] };
// });

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("MCP server running on STDIO");
}

function gracefulShutdown() {
  logger.info("Received shutdown signal. Closing server and database...");
  server.close();
  db.close();
  process.exit(0);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

main().catch((error) => {
  logger.error("Fatal error", error);
  process.exit(1);
});
