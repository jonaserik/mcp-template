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
# O Tao do IPA

1. **Incremental:** 
   Nada é testado como sistema inteiro. Tudo é validado como delta (mudança).

2. **Procedural:** 
   A criatividade da IA exige disciplina humana. Todo código novo deve seguir um ritual explícito:
   **Intenção -> Contrato -> Geração -> Validação**.

3. **Antifrágil:** 
   Erros não são apenas corrigidos; eles devem gerar imunidade sistêmica. Nenhum bug é fechado sem virar um teste de regressão ou uma mudança estrutural.
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
             return {
                contents: [{
                    uri: uri.href,
                    mimeType: "application/json",
                    text: JSON.stringify({
                        coverage: "N/A",
                        invariants_density: "N/A",
                        cycle_health: "Good",
                        note: "Metrics execution not yet implemented"
                    }, null, 2)
                }]
            };
        }
    );
}
