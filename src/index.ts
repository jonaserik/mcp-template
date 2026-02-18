#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { initDatabase, closeDatabase } from "./db.js";

// Initialize database before starting server
try {
  initDatabase();
} catch (error) {
  console.error("Failed to initialize database:", error);
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
  // Create STDIO transport for communication
  const transport = new StdioServerTransport();

  // Connect server to transport (handles handshake automatically)
  await server.connect(transport);

  console.error("MCP server running on STDIO");
}

function gracefulShutdown() {
  console.error("Received shutdown signal. Closing server and database...");
  server.close();
  closeDatabase();
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
