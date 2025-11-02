import { MintData } from "./chartData";
import { BreakevenPoint } from "./parseBreakevenFromCSV";

export interface CauseFundingAttribution {
  entryN: number;
  breakevenN: number | null;
  causeContribution: number;
  percentage: number;
}

const CAUSE_FEE = 0.2;

/**
 * Calculate cause funding attribution by entry point
 * Shows what percentage of total cause funding comes from each investor cohort
 */
export const calculateCauseFundingByEntryPoint = (
  mintingData: MintData[],
  breakevenPoints: BreakevenPoint[]
): CauseFundingAttribution[] => {
  // Find the maximum breakeven point to determine the scope of analysis
  const maxBreakeven = Math.max(
    ...breakevenPoints
      .filter(bp => bp.breakevenN !== null)
      .map(bp => bp.breakevenN as number)
  );

  // Calculate total cause funding up to the maximum breakeven point
  const totalCauseFunding = mintingData
    .filter(d => d.n <= maxBreakeven)
    .reduce((sum, d) => sum + d.contributionToCause, 0);

  // For each entry point, calculate their contribution to the cause
  const attributions: CauseFundingAttribution[] = breakevenPoints.map(bp => {
    if (bp.breakevenN === null) {
      return {
        entryN: bp.entryN,
        breakevenN: null,
        causeContribution: 0,
        percentage: 0,
      };
    }

    // Calculate the investor's cause contribution from entry to breakeven
    // This is 20% of all mint prices they paid
    const causeContribution = mintingData
      .filter(d => d.n >= bp.entryN && d.n <= bp.breakevenN!)
      .reduce((sum, d) => sum + d.mintPrice * CAUSE_FEE, 0);

    const percentage = totalCauseFunding > 0 
      ? (causeContribution / totalCauseFunding) * 100 
      : 0;

    return {
      entryN: bp.entryN,
      breakevenN: bp.breakevenN,
      causeContribution,
      percentage,
    };
  });

  // Sort by entry point
  return attributions.sort((a, b) => a.entryN - b.entryN);
};
