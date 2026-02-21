import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IPAStateManager } from './ipa-state.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('IPAStateManager', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipa-test-'));
  const ipaDir = path.join(tmpDir, '.ipa');
  const stateFile = path.join(ipaDir, 'state.json');

  beforeEach(() => {
    // Clean up if needed
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should initialize with IDLE state if no file exists', () => {
    const manager = new IPAStateManager(tmpDir);
    const state = manager.getState();
    expect(state.current_phase).toBe('IDLE');
    expect(fs.existsSync(stateFile)).toBe(true);
  });

  it('should transition phases correctly', () => {
    const manager = new IPAStateManager(tmpDir);
    manager.transitionTo('INTENT');
    expect(manager.getState().current_phase).toBe('INTENT');
  });

  it('should save and load intent', () => {
    const manager = new IPAStateManager(tmpDir);
    const intent = {
        description: 'Test Intent',
        component: 'TestComponent',
        timestamp: 123456
    };
    manager.setIntent(intent);
    
    const state = manager.getState();
    expect(state.current_phase).toBe('INTENT');
    expect(state.current_intent).toEqual(intent);
  });
  
  it('should handle VALIDATION_PENDING and VALIDATED phases', () => {
      const manager = new IPAStateManager(tmpDir);
      manager.transitionTo('VALIDATION_PENDING');
      expect(manager.getState().current_phase).toBe('VALIDATION_PENDING');
      
      manager.transitionTo('VALIDATED');
      expect(manager.getState().current_phase).toBe('VALIDATED');
  });
});
