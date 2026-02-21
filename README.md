# MCP IPA Guardian
> **Incremental • Procedural • Antifragile**

An MCP Server designed to enforce the IPA methodology for AI-assisted software engineering. Its primary objective is to maintain code quality and structural integrity in environments characterized by rapid code generation.

## Core Methodology
1.  **Incremental:** System validation is treated as an iterative process. Every change is validated as a specific delta against the existing behavior.
2.  **Procedural:** Automated generation requires structured governance. Every modification adheres to a defined lifecycle: `Intent -> Contract -> Generation -> Validation`.
3.  **Antifragile:** Failures serve as a mechanism for improvement. Every identified issue must be accompanied by a reliable regression test to prevent recurrence and enhance system resilience.

## Workflow

The server enforces the following state machine to manage the development lifecycle:

1.  **IDLE**: The system is ready for new tasks.
2.  **INTENT**: The expected changes and objectives are defined (`register_intent`).
3.  **CONTRACT**: The expected behavior, inputs, and outputs are specified (`define_contract`).
4.  **IMPLEMENTATION**: The code modifications are generated.
5.  **VALIDATION_PENDING**: The defined tests are actively executed (`run_validation_step`).
    *   **PASS**: Transitions to `VALIDATED`.
    *   **FAIL**: Transitions to `ANTIFRAGILITY`.
6.  **ANTIFRAGILITY**: A failure has been detected. The issue must be resolved, and a regression test path must be provided before validation can be retried.
7.  **VALIDATED**: The cycle is successfully completed (`finish_cycle`), returning the state to IDLE.

## Tools

*   `init_ipa_cycle`: Initializes a new development task.
*   `register_intent`: Defines the intent of the change (Step 1).
*   `define_contract`: Establishes the contract for the change (Step 2).
*   `generate_contract_test`: Helper utility to scaffold test structures.
*   `run_validation_step`: Executes the defined validation tests.
*   `register_failure`: Logs failures and outlines remediation plans.
*   `analyze_reachability`: Executes `npm run test:ipa:reachability`.
*   `check_structural_integrity`: Executes `npm run test:ipa:metrics`.
*   `scaffold_dynamic_fixture`: Generates dynamic data builders to mitigate static data degradation.

## Integration

To utilize the structural validation features, add the following scripts to your project's `package.json`:

```json
"scripts": {
  "test:ipa:reachability": "ts-node tests/reachability.ts", // Optional: adapt to your environment
  "test:ipa:metrics": "ts-node tests/metrics.ts"
}
```

## Documentation
*   [IPA Methodology Core Principles](docs/philosophy.md)
*   [Setup & Usage Guide](docs/setup.md)
*   [Operational Workflow](docs/methodology.md)
*   [Case Study: Reachability](docs/case-study.md)

## License
This project utilizes a **Dual Licensing** strategy to protect the intellectual property of the methodology while promoting open adoption of the software:

* **Codebase (`mcp-ipa-guardian`)**: Licensed under the [Apache License 2.0](LICENSE). You are free to use, modify, and distribute the code, including commercially, provided you adhere to the terms (e.g., patent clause and attribution).
* **Methodology & Documentation (`docs/`)**: The conceptual framework and detailed articles describing the IPA Methodology are licensed under a [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You are free to share and adapt the conceptual material, provided you give appropriate credit to the original creator (Jonas Erik).
