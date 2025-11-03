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
  // Filter to only entry points 110-200
  const filteredBreakevenPoints = breakevenPoints.filter(
    bp => bp.entryN >= 110 && bp.entryN <= 200
  );

  // Calculate total cause funding from all investors entering at 110-200
  let totalCauseFunding = 0;
  filteredBreakevenPoints.forEach(bp => {
    if (bp.breakevenN !== null) {
      const contribution = mintingData
        .filter(d => d.n >= bp.entryN && d.n <= bp.breakevenN!)
        .reduce((sum, d) => sum + d.mintPrice * CAUSE_FEE, 0);
      totalCauseFunding += contribution;
    }
  });

  // For each entry point, calculate their contribution to the cause
  const attributions: CauseFundingAttribution[] = filteredBreakevenPoints.map(bp => {
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
