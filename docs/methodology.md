# Methodology: The IPA Cycle

## The Operational Flow

For every AI-assisted code generation task, the IPA Guardian enforces the following cycle:

### Phase 1: Intent
**Goal:** Explicitly describe the change before touching code.
*   **Tool:** `register_intent`
*   **Question:** What are we changing? Which component is affected?

### Phase 2: Contract
**Goal:** Formalize the boundary conditions.
*   **Tool:** `define_contract`
*   **Question:** What are the valid inputs? What are the invariant truths (e.g., "Total must never be negative")?

### Phase 3: Implementation
**Goal:** Generate the code and the tests.
*   **Action:** The AI Agent writes the code.
*   **Constraint:** Code **must** account for the contract defined in Phase 2.

### Phase 4: Validation (The Critical Gateway)
**Goal:** Prove the delta works.
*   **Tool:** `run_validation_step`
*   **Action:** The Guardian executes the test command.
*   **Outcome:**
    *   **PASS:** Move to `VALIDATED`.
    *   **FAIL:** Move to `ANTIFRAGILITY`.

### Phase 5: Antifragility (If Validation Fails)
**Goal:** Turn the failure into an asset.
*   **Tool:** `register_failure`
*   **Constraint:** You cannot close the failure without providing a `regression_test_path`. This proves you codified the bug into a test case.

### Phase 6: Structural Checks (Optional but Recommended)
**Goal:** Ensure local changes didn't break global structure.
*   **Tool:** `analyze_reachability` / `check_structural_integrity`.

---

## Testing Patterns

### 1. Contract Tests
Ensure the agreed-upon behavior (inputs/outputs) remains valid despite internal refactoring.

### 2. Invariant Tests
Assert fundamental truths about the domain that must never be violated, regardless of specific feature logic.

### 3. Reachability Tests (Brute Force)
For generative systems (e.g., RPG personas, feed algorithms), prove mathematically that all desired states are reachable.
*   *See [Case Study](case-study.md) for an example.*

### 4. Dynamic Fixtures
Instead of static data (which rots), use Generators.
*   **Bad:** `const User = { name: "John" }`
*   **Good:** `const User = generateUser({ name: "John" })`
*   **Tool:** `scaffold_dynamic_fixture` helps create these generators.
