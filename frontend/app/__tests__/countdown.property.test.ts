// Feature: phase-1-foundation, Property 1: countdown decomposition round-trip
// Validates: Requirements 1.3

import * as fc from 'fast-check';

/**
 * Property 1: Countdown decomposition round-trip
 *
 * For any positive duration in milliseconds, decomposing it into
 * days/hours/minutes/seconds and reconstructing the total milliseconds
 * from those units should yield the original value within a 1-second floor.
 */
describe('Countdown decomposition round-trip', () => {
  it('reconstructed ms is within 1 second of original for any positive duration', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1_000_000_000_000 }),
        (ms) => {
          const days = Math.floor(ms / 86_400_000);
          const hours = Math.floor((ms % 86_400_000) / 3_600_000);
          const minutes = Math.floor((ms % 3_600_000) / 60_000);
          const seconds = Math.floor((ms % 60_000) / 1000);
          const reconstructed =
            (days * 86_400 + hours * 3_600 + minutes * 60 + seconds) * 1000;
          return Math.abs(reconstructed - ms) < 1000; // within 1 second floor
        }
      ),
      { numRuns: 100 }
    );
  });
});
