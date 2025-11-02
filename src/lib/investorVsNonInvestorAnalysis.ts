import { MintData } from "./chartData";
import { BreakevenPoint } from "./parseBreakevenFromCSV";

export interface InvestorContributionAnalysis {
  entryN: number;
  breakevenN: number;
  poolAtEntry: number;
  investorCauseContribution: number;
  totalCauseFundingAtBreakeven: number;
  investorPercentage: number;
  nonInvestorPercentage: number;
  mintCount: number;
  averageMintPrice: number;
}

const CAUSE_FEE = 0.2;

/**
 * Calculate investor contribution for a specific entry point
 * At breakeven: investor's cause contribution = pool size at entry
 * Therefore: investor contributes exactly 50% of total cause funding at breakeven
 */
export const analyzeInvestorContribution = (
  mintingData: MintData[],
  breakevenPoints: BreakevenPoint[]
): InvestorContributionAnalysis | null => {
  // Find a valid breakeven point to analyze (pick one with actual breakeven)
  const validBreakeven = breakevenPoints.find(bp => bp.breakevenN !== null);
  
  if (!validBreakeven || validBreakeven.breakevenN === null) {
    return null;
  }

  const entryN = validBreakeven.entryN;
  const breakevenN = validBreakeven.breakevenN;

  // Pool at entry = all cause contributions before investor enters
  const poolAtEntry = mintingData
    .filter(d => d.n < entryN)
    .reduce((sum, d) => sum + d.contributionToCause, 0);

  // Investor's cause contribution = 20% of all mint prices from entry to breakeven
  const investorCauseContribution = mintingData
    .filter(d => d.n >= entryN && d.n <= breakevenN)
    .reduce((sum, d) => sum + d.mintPrice * CAUSE_FEE, 0);

  // At breakeven, investor contribution ≈ pool at entry (by definition of breakeven)
  const totalCauseFundingAtBreakeven = poolAtEntry + investorCauseContribution;
  
  const investorPercentage = (investorCauseContribution / totalCauseFundingAtBreakeven) * 100;
  const nonInvestorPercentage = (poolAtEntry / totalCauseFundingAtBreakeven) * 100;

  // Calculate mint count and average price during investor period
  const investorMints = mintingData.filter(d => d.n >= entryN && d.n <= breakevenN);
  const mintCount = investorMints.length;
  const averageMintPrice = mintCount > 0
    ? investorMints.reduce((sum, d) => sum + d.mintPrice, 0) / mintCount
    : 0;

  return {
    entryN,
    breakevenN,
    poolAtEntry,
    investorCauseContribution,
    totalCauseFundingAtBreakeven,
    investorPercentage,
    nonInvestorPercentage,
    mintCount,
    averageMintPrice,
  };
};

/**
 * Generate scenario analysis for different entry points
 * Shows that at breakeven, all investors contribute exactly 50% regardless of entry point
 */
export const generateScenarioAnalysis = (
  mintingData: MintData[],
  breakevenPoints: BreakevenPoint[]
) => {
  // Analyze several entry points that have breakeven
  const validBreakevens = breakevenPoints
    .filter(bp => bp.breakevenN !== null)
    .slice(0, 6); // Take first 6 for variety

  return validBreakevens.map(bp => {
    const poolAtEntry = mintingData
      .filter(d => d.n < bp.entryN)
      .reduce((sum, d) => sum + d.contributionToCause, 0);

    const investorContribution = mintingData
      .filter(d => d.n >= bp.entryN && d.n <= bp.breakevenN!)
      .reduce((sum, d) => sum + d.mintPrice * CAUSE_FEE, 0);

    const total = poolAtEntry + investorContribution;
    const investorPercentage = (investorContribution / total) * 100;

    return {
      label: `Entry N=${bp.entryN}`,
      entryN: bp.entryN,
      breakevenN: bp.breakevenN,
      investorPercentage,
      investorContribution,
      poolAtEntry,
      totalCauseFunding: total,
    };
  });
};
