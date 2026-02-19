# MCP IPA Guardian
> **Incremental • Procedural • Antifragile**

An MCP Server that enforces the IPA methodology for AI-assisted engineering. It acts as a strict guardian to prevent the degradation of code quality in high-speed generation environments.

## The Philosophy (Tao of IPA)
1.  **Incremental:** Nothing is tested as a whole system. Everything is validated as a delta.
2.  **Procedural:** AI creativity requires human discipline. Every change follows a ritual: `Intent -> Contract -> Generation -> Validation`.
3.  **Antifragile:** Bugs are fuel. No failure is closed without becoming a permanent regression test.

## Workflow

The server enforces the following state machine:

1.  **IDLE**: System is ready.
2.  **INTENT**: User defines *what* changes (`register_intent`).
3.  **CONTRACT**: User defines *how* it behaves (`define_contract`).
4.  **IMPLEMENTATION**: Code is generated.
5.  **VALIDATION_PENDING**: Test is executed actively (`run_validation_step`).
    *   **PASS**: -> `VALIDATED`.
    *   **FAIL**: -> `ANTIFRAGILITY`.
6.  **ANTIFRAGILITY**: A failure occurred. You must fix it and provide a regression test path to retry validation.
7.  **VALIDATED**: Cycle can be finished (`finish_cycle`), resetting to IDLE.

## Tools

*   `init_ipa_cycle`: Start a new task.
*   `register_intent`: step 1.
*   `define_contract`: step 2.
*   `generate_contract_test`: Helper to scaffold tests.
*   `run_validation_step`: **Active Execution** of tests.
*   `register_failure`: Log failures and immunity plans.
*   `analyze_reachability`: Runs `npm run test:ipa:reachability`.
*   `check_structural_integrity`: Runs `npm run test:ipa:metrics`.
*   `scaffold_dynamic_fixture`: Generates dynamic data builders to avoid "Fixed Data Rot".

## Integration

To use the structural checks, add these scripts to your project's `package.json`:

```json
"scripts": {
  "test:ipa:reachability": "ts-node tests/reachability.ts", // or your equivalent
  "test:ipa:metrics": "ts-node tests/metrics.ts"
}
```

## Documentation
*   [Philosophy (The Tao of IPA)](docs/philosophy.md)
*   [Setup & Usage Guide](docs/setup.md)
*   [Methodology & Workflow](docs/methodology.md)
*   [Case Study: Reachability](docs/case-study.md)
