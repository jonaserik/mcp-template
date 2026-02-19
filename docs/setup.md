# Setup & Usage Guide

## Installation

1.  **Build the Server:**
    ```bash
    git clone [repo-url] mcp-ipa-guardian
    cd mcp-ipa-guardian
    npm install
    npm run build
    ```

2.  **Configure your MCP Client:**
    Add the server to your configuration (e.g., `claude_desktop_config.json`):
    ```json
    "mcp-ipa-guardian": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-ipa-guardian/dist/index.js"]
    }
    ```

## Integrating with Your Project

To fully utilize the **Structural Integrity** and **Reachability** checks, you must expose specific scripts in your project's `package.json`. The Guardian will call these scripts to verify the health of your system.

### 1. Add Scripts to `package.json`

```json
{
  "scripts": {
    "test:ipa:reachability": "ts-node tests/reachability.ts", 
    "test:ipa:metrics": "ts-node tests/metrics.ts",
    "test:ipa": "npm run test:ipa:reachability && npm run test:ipa:metrics"
  }
}
```

*   **`test:ipa:reachability`**: Should exit with 0 if all system states (e.g., Personas, Routes) are reachable.
*   **`test:ipa:metrics`**: Should exit with 0 if structural metrics (e.g., Vector Balance, Invariant Coverage) are healthy.

### 2. Using the Guardian

Once configured, you can interact with the Guardian through your AI Agent:

*   **Start a Task:** "Initialize a new IPA cycle for [Task Description]."
*   **Define Changes:** "Register intent to [Intent] affecting [Component]."
*   **Contract:** "Define contract with inputs [X] and expected outputs [Y]."
*   **Validate:** "Run validation step on command 'npm test my-feature.test.ts'."
*   **Analyze:** "Check structural integrity."

## Best Practices

*   **Dynamic Fixtures:** Use the `scaffold_dynamic_fixture` tool to generate data builders. Avoid static JSON files for testing AI logic, as they rot quickly.
*   **Strict Cycles:** Do not bypass the `validate_delta` step. The Guardian will prevent you from finishing the cycle if you haven't validated.
