import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { IPAStateManager } from "../ipa-state.js";
import { withErrorHandling } from "../lib/errors.js";

export function registerTools(server: McpServer, stateManager: IPAStateManager) {
  server.tool(
    "init_ipa_cycle",
    "Initialize a new IPA work cycle. Must be in IDLE state or used to reset context.",
    { task_description: z.string() },
    withErrorHandling("init_ipa_cycle", async (args: unknown) => {
      const { task_description } = args as { task_description: string };
      const state = stateManager.getState();
      // We allow init to reset if explicitly requested or if we treat it as starting fresh?
      // For safety, warn if not IDLE, but for now we enforce IDLE check.
      if (state.current_phase !== 'IDLE') {
         // Option: throw error, or force reset. Guardian philosophy says: Discipline.
         throw new Error(`Cannot init cycle: Current phase is ${state.current_phase}. Please finish the current cycle or manually reset if stuck.`);
      }
      
      // Ideally we store the task description in the state, but our schema didn't have it in root.
      // We can add it effectively by logging it or just acknowledging.
      return { content: [{ type: "text", text: `IPA Cycle initialized for: "${task_description}".\nCurrent Phase: IDLE.\nNext Step: Call 'register_intent' to define what you want to change.` }] };
    })
  );

  server.tool(
    "register_intent",
    "Step 1: Register the intent of the change. Defines what will change.",
    { description: z.string(), component: z.string() },
    withErrorHandling("register_intent", async (args: unknown) => {
       const { description, component } = args as { description: string, component: string };
       const state = stateManager.getState();
       if (state.current_phase !== 'IDLE' && state.current_phase !== 'INTENT') { 
           throw new Error(`Invalid phase: ${state.current_phase}. Must be IDLE to register intent.`);
       }
       stateManager.setIntent({
           description,
           component,
           timestamp: Date.now()
       });
       return { content: [{ type: "text", text: "Intent registered.\nCurrent Phase: INTENT.\nNext Step: Call 'define_contract' to specify inputs/outputs/invariants." }] };
    })
  );

  server.tool(
    "define_contract",
    "Step 2: Define the contract (inputs, outputs, invariants) BEFORE generating code.",
    { 
        inputs: z.record(z.string(), z.any()).describe("Example inputs for the component"),
        expected_outputs: z.record(z.string(), z.any()).describe("Expected outputs for the inputs"),
        invariants: z.array(z.string()).describe("List of invariants that must hold true (e.g. 'sum must be positive')")
    },
    withErrorHandling("define_contract", async (args: unknown) => {
        const { inputs, expected_outputs, invariants } = args as { inputs: Record<string, any>, expected_outputs: Record<string, any>, invariants: string[] };
        const state = stateManager.getState();
        if (state.current_phase !== 'INTENT') {
            throw new Error(`Invalid phase: ${state.current_phase}. You must register an intent first.`);
        }
        stateManager.setContract({
            inputs,
            expected_outputs,
            invariants,
            timestamp: Date.now()
        });
        stateManager.transitionTo('IMPLEMENTATION');

        return { content: [{ type: "text", text: "Contract defined.\nCurrent Phase: IMPLEMENTATION.\nAction: You may now generata/modify code. \nNext Step: After coding, call 'validate_delta'." }] };
    })
  );

  server.tool(
    "generate_contract_test",
    "Generate a contract test template based on the registered intent/contract.",
    { component_path: z.string(), behavior_description: z.string() },
    withErrorHandling("generate_contract_test", async (args: unknown) => {
          const { component_path, behavior_description } = args as { component_path: string, behavior_description: string };
          const testTemplate = `
// Contract Test for ${component_path}
// Behavior Description: ${behavior_description}

import { describe, it, expect } from 'vitest';

describe('${component_path} Contract', () => {
    it('should adhere to the defined contract', () => {
        // TODO: Implement assertions based on inputs/outputs
        // Input: ...
        // Expected Output: ...
    });
    
    it('should maintain invariants', () => {
        // TODO: Check invariants
    });
});
          `;
          return { content: [{ type: "text", text: testTemplate }] };
    })
  );

  server.tool(
    "run_validation_step",
    "Step 4: Execute a validation command (test). STRICT: If it fails, you go to ANTIFRAGILITY.",
    { 
        command: z.string().describe("The command to run tests (e.g. 'npm test src/tests/my-delta.test.ts')"),
        description: z.string().describe("Description of what is being validated")
    },
    withErrorHandling("run_validation_step", async (args: unknown) => {
        const { command, description } = args as { command: string, description: string };
        const state = stateManager.getState();
         if (state.current_phase !== 'IMPLEMENTATION' && state.current_phase !== 'VALIDATION_PENDING' && state.current_phase !== 'ANTIFRAGILITY') {
            throw new Error(`Invalid phase: ${state.current_phase}. Must be in IMPLEMENTATION or correcting a failure.`);
        }
        
        // Zero-Trust checks for naive commands
        const trimmedCommand = command.trim();
        if (trimmedCommand.startsWith('echo ') || trimmedCommand === 'exit 0' || trimmedCommand === 'true') {
            throw new Error(`Zero-Trust Error: Command '${command}' rejected as a trivial bypass.`);
        }
        
        stateManager.transitionTo('VALIDATION_PENDING');

        // Execute the command
        try {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);

            const { stdout, stderr } = await execAsync(command);
            
            // If we get here, exit code was 0 (success)
            stateManager.setValidationOutput(stdout, command);
            stateManager.transitionTo('VALIDATED');
            return { 
                content: [{ 
                    type: "text", 
                    text: `Validation PASSED.\nCommand: ${command}\nOutput:\n${stdout}\n\nCurrent Phase: VALIDATED.\nNext Step: Call 'finish_cycle' to solidify.` 
                }] 
            };

        } catch (error: any) {
            // Exit code non-zero (failure)
             stateManager.setValidationOutput((error.stdout || '') + '\n' + (error.stderr || ''), command);
             stateManager.transitionTo('ANTIFRAGILITY');
             return { 
                content: [{ 
                    type: "text", 
                    text: `Validation FAILED.\nCommand: ${command}\nError Output:\n${error.stdout}\n${error.stderr}\n\nCurrent Phase: ANTIFRAGILITY.\nAction: You MUST fix the code and/or the test.\nNext Step: Call 'register_failure' to document this learning, then fix and re-run validation.` 
                }] 
            };
        }
    })
  );

  server.tool(
      "register_failure",
      "Step 4.1: Register a failure and create an immunity plan. REQUIRED if validation fails.",
      { 
          error_log: z.string(), 
          root_cause: z.string(), 
          immunity_plan: z.string(),
          regression_test_path: z.string().optional().describe("Path to the new test file created to cover this bug (The 'Antifragile' artifact)")
      },
      withErrorHandling("register_failure", async (args: unknown) => {
          const { error_log, root_cause, immunity_plan, regression_test_path } = args as { error_log: string, root_cause: string, immunity_plan: string, regression_test_path?: string };
          const state = stateManager.getState();
          
          if (state.current_phase === 'ANTIFRAGILITY' && !regression_test_path) {
              throw new Error("Zero-Trust Error: You are in ANTIFRAGILITY phase. You MUST provide 'regression_test_path' to prove you created a test for this bug.");
          }

          stateManager.setFailure({
              error_log,
              root_cause,
              immunity_plan,
              regression_test_path,
              timestamp: Date.now()
          });
          
          return { content: [{ type: "text", text: "Failure registered and securely saved.\nAction: Implement the immunity plan.\nNext Step: Fix code and call 'run_validation_step' again." }] };
      })
  );
  
  server.tool(
      "finish_cycle",
      "Complete the current cycle successfully. Resets state to IDLE.",
      {},
      withErrorHandling("finish_cycle", async () => {
          const state = stateManager.getState();
          if (state.current_phase !== 'VALIDATED') {
               throw new Error(`Cannot finish cycle in phase ${state.current_phase}. Must be in VALIDATED phase (passing tests).`);
          }
          stateManager.archiveAndReset(); 
          return { content: [{ type: "text", text: "Cycle completed successfully. Lore archived to history and state reset to IDLE." }] };
      })
  );
  
   server.tool(
    "analyze_reachability",
    "Analyze reachability of system states by running project script.",
    { script_name: z.string().default("test:ipa:reachability") },
    withErrorHandling("analyze_reachability", async (args: unknown) => {
        const { script_name } = args as { script_name: string };
        try {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);
            const { stdout } = await execAsync(`npm run ${script_name}`);
             return { content: [{ type: "text", text: `Reachability Analysis Output:\n${stdout}` }] };
        } catch (error: any) {
             return { content: [{ type: "text", text: `Reachability Analysis Failed:\n${error.message}\n${error.stderr}` }] };
        }
    })
  );
  
  server.tool(
    "check_structural_integrity",
    "Check structural integrity metrics by running project script.",
    { script_name: z.string().default("test:ipa:metrics") },
    withErrorHandling("check_structural_integrity", async (args: unknown) => {
         const { script_name } = args as { script_name: string };
         try {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);
            const { stdout } = await execAsync(`npm run ${script_name}`);
             return { content: [{ type: "text", text: `Structural Integrity Output:\n${stdout}` }] };
        } catch (error: any) {
             return { content: [{ type: "text", text: `Structural Integrity Check Failed:\n${error.message}\n${error.stderr}` }] };
        }
    })
  );

  server.tool(
      "scaffold_dynamic_fixture",
      "Create a dynamic fixture generator to prevent 'Fixed Data Rot'.",
      { entity_name: z.string() },
      withErrorHandling("scaffold_dynamic_fixture", async (args: unknown) => {
          const { entity_name } = args as { entity_name: string };
          const template = `
// Dynamic Fixture Generator for ${entity_name}
// Generated by MCP IPA Guardian
// Purpose: Generate valid ${entity_name} states on the fly to avoid stale static JSONs.

import { faker } from '@faker-js/faker';

export const generate${entity_name} = (overrides = {}) => {
    return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        createdAt: new Date().toISOString(),
        // TODO: Add domain specific fields based on current schema
        ...overrides
    };
};

export const generate${entity_name}Set = (count = 5) => {
    return Array.from({ length: count }, () => generate${entity_name}());
};
          `;
          return { content: [{ type: "text", text: template }] };
      })
  );
}
