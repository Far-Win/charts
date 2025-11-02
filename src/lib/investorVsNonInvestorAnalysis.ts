import { MintData } from "./chartData";
import { BreakevenPoint } from "./parseBreakevenFromCSV";

export interface InvestorContributionAnalysis {
  totalCauseFunding: number;
  investorContribution: number;
  nonInvestorContribution: number;
  investorPercentage: number;
  nonInvestorPercentage: number;
  firstInvestorEntry: number;
  maxBreakeven: number;
  averageMintPriceInvestorPeriod: number;
  averageMintPriceNonInvestorPeriod: number;
  volumeRatio: number;
}

const CAUSE_FEE = 0.2;
const FIRST_INVESTOR_ENTRY = 11; // First investor enters at N=11

/**
 * Calculate investor vs non-investor cause contributions
 * Proves that investors contribute >50% due to:
 * 1. Bonding curve creates higher mint prices during investor period
 * 2. Geometric distribution (E[K]=256) means investors mint ~600 times before white square
 * 3. Volume × Price effect concentrates cause funding in investor period
 */
export const analyzeInvestorContribution = (
  mintingData: MintData[],
  breakevenPoints: BreakevenPoint[]
): InvestorContributionAnalysis => {
  // Find maximum breakeven point (when white square appears)
  const maxBreakeven = Math.max(
    ...breakevenPoints
      .filter(bp => bp.breakevenN !== null)
      .map(bp => bp.breakevenN as number)
  );

  // Split data into non-investor period (N=1 to N=10) and investor period (N=11 to maxBreakeven)
  const nonInvestorPeriodData = mintingData.filter(d => d.n < FIRST_INVESTOR_ENTRY);
  const investorPeriodData = mintingData.filter(
    d => d.n >= FIRST_INVESTOR_ENTRY && d.n <= maxBreakeven
  );

  // Calculate contributions
  const nonInvestorContribution = nonInvestorPeriodData.reduce(
    (sum, d) => sum + d.contributionToCause,
    0
  );

  const investorContribution = investorPeriodData.reduce(
    (sum, d) => sum + d.contributionToCause,
    0
  );

  const totalCauseFunding = nonInvestorContribution + investorContribution;

  // Calculate percentages
  const investorPercentage = (investorContribution / totalCauseFunding) * 100;
  const nonInvestorPercentage = (nonInvestorContribution / totalCauseFunding) * 100;

  // Calculate average mint prices for comparison
  const avgMintPriceNonInvestor = nonInvestorPeriodData.length > 0
    ? nonInvestorPeriodData.reduce((sum, d) => sum + d.mintPrice, 0) / nonInvestorPeriodData.length
    : 0;

  const avgMintPriceInvestor = investorPeriodData.length > 0
    ? investorPeriodData.reduce((sum, d) => sum + d.mintPrice, 0) / investorPeriodData.length
    : 0;

  // Volume ratio: how many more mints happen during investor period
  const volumeRatio = investorPeriodData.length / Math.max(nonInvestorPeriodData.length, 1);

  return {
    totalCauseFunding,
    investorContribution,
    nonInvestorContribution,
    investorPercentage,
    nonInvestorPercentage,
    firstInvestorEntry: FIRST_INVESTOR_ENTRY,
    maxBreakeven,
    averageMintPriceInvestorPeriod: avgMintPriceInvestor,
    averageMintPriceNonInvestorPeriod: avgMintPriceNonInvestor,
    volumeRatio,
  };
};

/**
 * Generate scenario analysis for different white square appearance points
 * Shows that investor contribution remains >50% across reasonable scenarios
 */
export const generateScenarioAnalysis = (
  mintingData: MintData[],
  breakevenPoints: BreakevenPoint[]
) => {
  // Get actual max breakeven
  const actualMaxBreakeven = Math.max(
    ...breakevenPoints
      .filter(bp => bp.breakevenN !== null)
      .map(bp => bp.breakevenN as number)
  );

  // Test scenarios at different percentiles of geometric distribution
  // p = 1/256, so E[K] = 256
  // 25th percentile: ~74 mints, 50th: ~177, 75th: ~354, 90th: ~589
  const scenarios = [
    { label: "25th Percentile (Early)", breakevenN: FIRST_INVESTOR_ENTRY + 74 },
    { label: "50th Percentile (Median)", breakevenN: FIRST_INVESTOR_ENTRY + 177 },
    { label: "Expected Value", breakevenN: FIRST_INVESTOR_ENTRY + 256 },
    { label: "75th Percentile", breakevenN: FIRST_INVESTOR_ENTRY + 354 },
    { label: "90th Percentile", breakevenN: FIRST_INVESTOR_ENTRY + 589 },
    { label: "Actual (Observed)", breakevenN: actualMaxBreakeven },
  ];

  return scenarios.map(scenario => {
    const nonInvestorContribution = mintingData
      .filter(d => d.n < FIRST_INVESTOR_ENTRY)
      .reduce((sum, d) => sum + d.contributionToCause, 0);

    const investorContribution = mintingData
      .filter(d => d.n >= FIRST_INVESTOR_ENTRY && d.n <= scenario.breakevenN)
      .reduce((sum, d) => sum + d.contributionToCause, 0);

    const total = nonInvestorContribution + investorContribution;
    const investorPercentage = (investorContribution / total) * 100;

    return {
      ...scenario,
      investorPercentage,
      investorContribution,
      totalCauseFunding: total,
    };
  });
};
