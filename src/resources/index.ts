import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { IPAStateManager } from "../ipa-state.js";

export function registerResources(server: McpServer, stateManager: IPAStateManager) {
    server.resource(
        "ipa-status",
        "ipa://status",
        async (uri) => {
            const state = stateManager.getState();
            return {
                contents: [{
                    uri: uri.href,
                    mimeType: "application/json",
                    text: JSON.stringify(state, null, 2)
                }]
            };
        }
    );

    server.resource(
        "ipa-leis",
        "ipa://leis",
        async (uri) => {
            const manifesto = `
# The Tao of IPA

1. **Incremental:** 
   Nothing is tested as an entire system. Everything is validated as a delta (change).

2. **Procedural:** 
   AI creativity demands human discipline. Every new code must follow an explicit ritual:
   **Intent -> Contract -> Generation -> Validation**.

3. **Antifragile:** 
   Errors are not simply fixed; they must generate systemic immunity. No bug is closed without becoming a regression test or a structural change.
            `;
            return {
                contents: [{
                    uri: uri.href,
                    mimeType: "text/markdown",
                    text: manifesto
                }]
            };
        }
    );

    server.resource(
        "ipa-metrics",
        "ipa://metrics",
        async (uri) => {
             const state = stateManager.getState();
             const total_cycles = state.history ? state.history.length : 0;
             const failures_caught = state.history ? state.history.filter((h: any) => h.failure).length : 0;

             return {
                contents: [{
                    uri: uri.href,
                    mimeType: "application/json",
                    text: JSON.stringify({
                        total_cycles_completed: total_cycles,
                        failures_caught_and_immunized: failures_caught,
                        health_status: total_cycles > 0 ? "Active" : "New",
                        coverage: "N/A",
                        invariants_density: "N/A",
                        note: "Metrics execution via history analysis active"
                    }, null, 2)
                }]
            };
        }
    );
}
