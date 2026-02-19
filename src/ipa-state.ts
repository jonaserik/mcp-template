import fs from 'fs';
import path from 'path';
import { IPAState, IPAStateSchema, IPAPhase, Intent, Contract, Failure } from './types.js';

const IPA_DIR = '.ipa';
const STATE_FILE = 'state.json';

export class IPAStateManager {
  private statePath: string;

  constructor(rootDir: string) {
    this.statePath = path.join(rootDir, IPA_DIR, STATE_FILE);
    this.ensureInitialized(rootDir);
  }

  private ensureInitialized(rootDir: string) {
    const dir = path.join(rootDir, IPA_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.statePath)) {
      const initialState: IPAState = {
        current_phase: 'IDLE',
        current_intent: null,
        current_contract: null,
        history: []
      };
      fs.writeFileSync(this.statePath, JSON.stringify(initialState, null, 2));
    }
  }

  getState(): IPAState {
    try {
      if (!fs.existsSync(this.statePath)) {
          // Should have been initialized, but just in case
          throw new Error("State file not found");
      }
      const data = fs.readFileSync(this.statePath, 'utf-8');
      return IPAStateSchema.parse(JSON.parse(data));
    } catch (error) {
       // Backup reset if corrupted? For now just throw
       throw new Error(`Failed to read IPA state: ${error}`);
    }
  }

  saveState(state: IPAState) {
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  reset() {
      const state = this.getState();
      // Archive current if needed, for now just reset active
      state.current_phase = 'IDLE';
      state.current_intent = null;
      state.current_contract = null;
      this.saveState(state);
  }

  transitionTo(phase: IPAPhase) {
    const state = this.getState();
    state.current_phase = phase;
    this.saveState(state);
  }

  setIntent(intent: Intent) {
      const state = this.getState();
      state.current_intent = intent;
      state.current_phase = 'INTENT';
      this.saveState(state);
  }

  setContract(contract: Contract) {
      const state = this.getState();
      state.current_contract = contract;
      state.current_phase = 'CONTRACT';
      this.saveState(state);
  }
}
