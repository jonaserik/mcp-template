import { z } from 'zod';

export const IPAPhaseSchema = z.enum([
  'IDLE',
  'INTENT',
  'CONTRACT',
  'IMPLEMENTATION',
  'VALIDATION_PENDING',
  'VALIDATED',
  'ANTIFRAGILITY'
]);

export type IPAPhase = z.infer<typeof IPAPhaseSchema>;

export const IntentSchema = z.object({
  description: z.string(),
  component: z.string(),
  timestamp: z.number()
});

export type Intent = z.infer<typeof IntentSchema>;

export const ContractSchema = z.object({
  inputs: z.record(z.string(), z.any()),
  expected_outputs: z.record(z.string(), z.any()),
  invariants: z.array(z.string()),
  timestamp: z.number()
});

export type Contract = z.infer<typeof ContractSchema>;

export const FailureSchema = z.object({
  error_log: z.string(),
  root_cause: z.string(),
  immunity_plan: z.string(),
  regression_test_path: z.string().optional(),
  timestamp: z.number()
});

export type Failure = z.infer<typeof FailureSchema>;

export const IPAStateSchema = z.object({
  current_phase: IPAPhaseSchema,
  current_intent: IntentSchema.nullable(),
  current_contract: ContractSchema.nullable(),
  last_validation_output: z.string().optional(),
  history: z.array(z.object({
    intent: IntentSchema,
    contract: ContractSchema.nullable(),
    failure: FailureSchema.nullable(),
    completed_at: z.number()
  }))
});

export type IPAState = z.infer<typeof IPAStateSchema>;
