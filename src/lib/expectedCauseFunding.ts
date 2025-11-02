import { MintData } from "./chartData";
import { BreakevenPoint } from "./parseBreakevenFromCSV";

export interface ExpectedCauseAnalysis {
  entryN: number;
  breakevenN: number | null;
  expectedCauseContribution: number;
  expectedPercentage: number;
  breakevenCauseContribution: number;
  breakevenPercentage: number;
}

const CAUSE_FEE = 0.2;
const WIN_PROBABILITY = 1 / 256;
const FAIL_PROBABILITY = 1 - WIN_PROBABILITY;

/**
 * Calculate cumulative mint prices from entry to K
 */
const calculateCumulativeMintPrices = (
  entryN: number,
  endN: number,
  mintingData: MintData[]
): number => {
  return mintingData
    .filter(d => d.n >= entryN && d.n <= endN)
    .reduce((sum, d) => sum + d.mintPrice, 0);
};

/**
 * Calculate expected cause contribution using geometric distribution
 * E[Cause] = Σ P(win at K) × [0.2 × Σ(mintPrice from entry to K)]
 */
export const calculateExpectedCauseContribution = (
  entryN: number,
  mintingData: MintData[],
  maxK: number = 2000
): number => {
  let expectedCause = 0;
  
  // Sum over all possible winning mints from entry+1 to maxK
  for (let k = entryN + 1; k <= maxK; k++) {
    // P(win at K | enter at N) = p × (1-p)^(K-N-1)
    const mintsAfterEntry = k - entryN - 1;
    const probWinAtK = WIN_PROBABILITY * Math.pow(FAIL_PROBABILITY, mintsAfterEntry);
    
    // Cause contribution if win at K = 0.2 × Σ(mintPrice from entry to K)
    const cumulativeMintPrices = calculateCumulativeMintPrices(entryN, k, mintingData);
    const causeAtK = CAUSE_FEE * cumulativeMintPrices;
    
    // Weight by probability
    expectedCause += probWinAtK * causeAtK;
    
    // Early termination if probability becomes negligible
    if (probWinAtK < 1e-10) break;
  }
  
  return expectedCause;
};

/**
 * Calculate expected cause funding analysis for all entry points
 */
export const calculateExpectedCauseFundingAnalysis = (
  mintingData: MintData[],
  breakevenPoints: BreakevenPoint[]
): ExpectedCauseAnalysis[] => {
  // Find the maximum breakeven point to determine total cause funding scope
  const maxBreakeven = Math.max(
    ...breakevenPoints
      .filter(bp => bp.breakevenN !== null)
      .map(bp => bp.breakevenN as number)
  );

  // Calculate total cause funding up to the maximum breakeven point
  const totalCauseFunding = mintingData
    .filter(d => d.n <= maxBreakeven)
    .reduce((sum, d) => sum + d.contributionToCause, 0);

  return breakevenPoints.map(bp => {
    if (bp.breakevenN === null) {
      return {
        entryN: bp.entryN,
        breakevenN: null,
        expectedCauseContribution: 0,
        expectedPercentage: 0,
        breakevenCauseContribution: 0,
        breakevenPercentage: 0,
      };
    }

    // Calculate expected cause contribution using probability weighting
    const expectedCauseContribution = calculateExpectedCauseContribution(
      bp.entryN,
      mintingData,
      Math.min(maxBreakeven + 500, mintingData[mintingData.length - 1].n)
    );

    const expectedPercentage = totalCauseFunding > 0
      ? (expectedCauseContribution / totalCauseFunding) * 100
      : 0;

    // Calculate breakeven scenario (investor exits exactly at breakeven)
    const breakevenCauseContribution = mintingData
      .filter(d => d.n >= bp.entryN && d.n <= bp.breakevenN!)
      .reduce((sum, d) => sum + d.mintPrice * CAUSE_FEE, 0);

    const breakevenPercentage = totalCauseFunding > 0
      ? (breakevenCauseContribution / totalCauseFunding) * 100
      : 0;

    return {
      entryN: bp.entryN,
      breakevenN: bp.breakevenN,
      expectedCauseContribution,
      expectedPercentage,
      breakevenCauseContribution,
      breakevenPercentage,
    };
  });
};
