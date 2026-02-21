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

---

## 5. Architectural Synergy of the IPA Method
*Or: How AI Governance scales from MVPs to Distributed Systems.*

The **IPA Method (Incremental, Procedural, Antifragile)** does not replace the traditional foundation of testing (the classic Testing Pyramid) or consolidated development methodologies. Its role is to act as a **governance layer or meta-testing**, whose sole objective is to tame the extreme speed and unpredictability introduced by Artificial Intelligence.
Regardless of the software's size — from a solo script to a global ecosystem — AI acts as the acceleration engine, while IPA acts as the directional brake.

### Level 1: Simple and Monolithic Applications (Solo Projects, MVPs)
*Defining characteristic: Centralized code, coupling is tolerated to save time, prototyping speed dictates the rules.*

**A. Assisted TDD (Synergy with Unit Testing)**
*   **The IPA Application:** The *Intent* (Procedural Pillar) forces the developer to generate the Contract (the initial failing test) *before* the AI writes the actual function.
*   **The Gain:** The unit test strictly guarantees the behavior of that specific small generated delta (Incremental Pillar), allowing speed without corrupting basic business logic.

**B. "Reachability" Tests (Synergy with Logical Integration Testing)**
*   **The IPA Application:** Requires the creation of "brute force" scripts that sweep the conceptual paths of the domain to ensure states remain mathematically reachable despite AI rapid code mutations.
*   **The Antifragility:** Prevents the MVP from rapidly degenerating into an invisible, uncontrollable "Big Ball of Mud".

### Level 2: Medium Complexity Applications (Defined Modules, Early Microservices)
*Defining characteristic: Well-delimited separation of responsibilities (e.g., Frontend, Backend API, Queue Worker).*

**A. Boundary Protection (Synergy with Consumer-Driven Contracts)**
*   **The IPA Application:** The procedural *Contract* locks and monitors API communication. Instead of merely generating code, the Guardian incrementally verifies if the AI's mutation respects the consumed interface (e.g., rejecting structural data changes without a contract update).

**B. Antifragile Refactoring in Isolated Modules**
*   **The IPA Application:** Any "bug" exposed after a rapid AI rewrite does not result in a simple *hotfix*. It forces a **Systemic Regression Test**. The failure must generate an immunity plan that shields that business rule against malicious new alterations in the future.

### Level 3: Distributed, Scaled, and Highly Available Applications
*Defining characteristic: Eventual state using asynchronous events and multiple replicas. Failures echo in cascading effects.*

**A. The Automatic Chaos Twin (Synergy with Chaos Engineering)**
*   **The IPA Application:** When instability arises (e.g., a Queue Worker failing under load), the IPA protocol dictates that the response must be programming a survival behavior, not just a manual fix.
*   **Required Immunity Plan:** AI orchestrates the implementation of a *Circuit Breaker* with fallbacks and *Retry* limits. The system didn't just plug a hole; it grew permanent thicker scales.

**B. Asynchronous End-to-End and Compensatory Sagas**
*   **The IPA Application:** AI mutations in complex components trigger automatic requirements for transversal auditing. If a part corrupts, the IPA Guardian instructs continuous root cause documentation and imposes heavy *Rollback / Compensatory Operations* routines in the code as a vaccine.

---

## 6. Conclusion: Brain, Muscle, and Tool
The IPA method adapts to all scales through its functional triangle:
1. **Artificial Intelligence:** The formal muscle (writes thousands of lines instantly; refactors at the speed of thought).
2. **Testing Infrastructure:** The physical field of real-world stress verification.
3. **IPA Method (Guardian):** The *Procedural Law / Cognitive Direction*. It acts as a non-negotiable architectural traffic light, ensuring that generated code only enters production if proven experimentally, validated incrementally, and vaccinated for the future.

---
<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/jonaserik/mcp-ipa-guardian/blob/main/docs/methodology.md">IPA Operational Methodology & Synergy</a> by <span property="cc:attributionName">Jonas Erik</span> is licensed under <a href="https://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt=""></a></p>
