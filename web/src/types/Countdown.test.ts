import { SECONDS_PER_BLOCK } from './Countdown';
import type {
  CountdownUnits,
  CountdownPhase,
  CountdownState,
  UseCountdownInput,
} from './Countdown';

describe('Countdown constants', () => {
  it('SECONDS_PER_BLOCK is 600', () => {
    expect(SECONDS_PER_BLOCK).toBe(600);
  });
});

describe('CountdownPhase type', () => {
  it('accepts all four valid phase values', () => {
    const phases: CountdownPhase[] = ['counting', 'imminent', 'unlocked', 'withdrawn'];
    expect(phases.length).toBe(4);
  });
});

describe('CountdownUnits interface', () => {
  it('can be created with all four time units', () => {
    const units: CountdownUnits = { days: 1, hours: 2, minutes: 30, seconds: 45 };
    expect(units.days).toBe(1);
    expect(units.hours).toBe(2);
    expect(units.minutes).toBe(30);
    expect(units.seconds).toBe(45);
  });

  it('accepts zero values', () => {
    const units: CountdownUnits = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    expect(units.days + units.hours + units.minutes + units.seconds).toBe(0);
  });
});

describe('CountdownState interface', () => {
  it('can be constructed with all required fields', () => {
    const state: CountdownState = {
      units: { days: 0, hours: 1, minutes: 30, seconds: 0 },
      totalSecondsRemaining: 5400,
      phase: 'counting',
      ariaLabel: '1 hour 30 minutes remaining',
    };
    expect(state.totalSecondsRemaining).toBe(5400);
    expect(state.phase).toBe('counting');
  });
});

describe('UseCountdownInput interface', () => {
  it('can be constructed with required fields', () => {
    const input: UseCountdownInput = {
      createdAt: 100,
      unlockHeight: 300,
      currentBlockHeight: 200,
      isWithdrawn: false,
    };
    expect(input.unlockHeight - input.currentBlockHeight).toBe(100);
  });
});
