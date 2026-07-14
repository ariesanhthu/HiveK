import { Injectable } from '@nestjs/common';

export interface ProrationInput {
  oldPrice: number;
  newPrice: number;
  cycleStartAt: Date;
  cycleEndsAt: Date;
  changeDate: Date;
}

export interface ProrationResult {
  refundAmount: number;
  remainingDays: number;
  totalCycleDays: number;
}

@Injectable()
export class ProrationService {
  /**
   * Calculate the prorated refund when a plan changes mid-cycle.
   *
   * Formula:
   *   dailyRateOld = oldPrice / totalCycleDays
   *   dailyRateNew = newPrice / totalCycleDays
   *   refund = remainingDays × (dailyRateOld - dailyRateNew)
   *
   * Returns 0 if no refund is due (upgrade or same price).
   *
   * Edge cases handled:
   *   - Already expired cycle     → refund = 0
   *   - Zero-length cycle          → refund = 0
   *   - New price >= old price     → refund = 0 (upgrade, no refund)
   *   - Very small refund (< 0.01) → rounded to 0
   */
  calculatePlanChangeRefund(input: ProrationInput): ProrationResult {
    const { oldPrice, newPrice, cycleStartAt, cycleEndsAt, changeDate } = input;

    const totalMs = cycleEndsAt.getTime() - cycleStartAt.getTime();
    const remainingMs = cycleEndsAt.getTime() - changeDate.getTime();

    // Guard: already expired or zero-length cycle
    if (remainingMs <= 0 || totalMs <= 0) {
      return { refundAmount: 0, remainingDays: 0, totalCycleDays: 0 };
    }

    const totalCycleDays = totalMs / (1000 * 60 * 60 * 24);
    const remainingDays = remainingMs / (1000 * 60 * 60 * 24);

    const dailyRateOld = oldPrice / totalCycleDays;
    const dailyRateNew = newPrice / totalCycleDays;

    // Only refund when downgrading (old > new)
    const refundPerDay = dailyRateOld - dailyRateNew;
    if (refundPerDay <= 0) {
      return { refundAmount: 0, remainingDays, totalCycleDays };
    }

    const refundAmount = refundPerDay * remainingDays;

    return {
      refundAmount: Math.round(refundAmount * 100) / 100,
      remainingDays: Math.round(remainingDays * 2) / 2, // round to half-day
      totalCycleDays: Math.round(totalCycleDays * 2) / 2,
    };
  }
}
