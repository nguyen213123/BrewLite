import { beforeEach, describe, expect, it } from 'vitest';
import {
  ORDER_STATUS,
  canTransition,
} from './order-status.js';

describe('Order State Machine', () => {
  beforeEach(() => {
    // Không cần database cho unit test State Machine.
  });

  it('should allow a valid transition from PREPARING to READY', () => {
    expect(
      canTransition(
        ORDER_STATUS.PREPARING,
        ORDER_STATUS.READY,
      ),
    ).toBe(true);
  });

  it('should allow a valid transition from READY to COMPLETED', () => {
    expect(
      canTransition(
        ORDER_STATUS.READY,
        ORDER_STATUS.COMPLETED,
      ),
    ).toBe(true);
  });

  it('should reject an invalid transition from PREPARING to COMPLETED', () => {
    expect(
      canTransition(
        ORDER_STATUS.PREPARING,
        ORDER_STATUS.COMPLETED,
      ),
    ).toBe(false);
  });

  it('should reject a transition from COMPLETED back to PAID', () => {
    expect(
      canTransition(
        ORDER_STATUS.COMPLETED,
        ORDER_STATUS.PAID,
      ),
    ).toBe(false);
  });
});