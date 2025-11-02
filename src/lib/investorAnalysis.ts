import { MintData } from "./chartData";

export interface RiskAnalysis {
  entryN: number;
  poolSizeAtEntry: number;
  expectedMintsToWin: number;
  expectedCost: number;
  expectedProfit: number;
  percentile50Capital: number;
  percentile90Capital: number;
  percentile99Capital: number;
}

export interface ProbabilityCurvePoint {
  mints: number;
  cumulativeProb: number;
}

const WHITE_PROBABILITY = 1 / 256;
const CAUSE_FEE = 0.2;

// Calculate sum of mint prices from entry point for K mints
const calculateMintPriceSum = (
  entryN: number,
  numMints: number,
  data: MintData[]
): number => {
  let sum = 0;
  const startIndex = data.findIndex(d => d.n >= entryN);
  
  if (startIndex === -1) return 0;
  
  for (let i = 0; i < numMints && startIndex + i < data.length; i++) {
    sum += data[startIndex + i].mintPrice;
  }
  
  return sum;
};

// Calculate expected cost (net outflow = 20% of mint prices to cause)
const calculateExpectedCost = (
  entryN: number,
  numMints: number,
  data: MintData[]
): number => {
  const totalMintPrices = calculateMintPriceSum(entryN, numMints, data);
  return totalMintPrices * CAUSE_FEE;
};

// Generate risk analysis for specific entry points
export const generateRiskAnalysis = (
  data: MintData[],
  entryPoints: number[]
): RiskAnalysis[] => {
  return entryPoints.map(entryN => {
    const entryData = data.find(d => d.n === entryN);
    const poolSizeAtEntry = entryData?.poolSize || 0;
    
    const expectedMintsToWin = Math.round(1 / WHITE_PROBABILITY);
    const expectedCost = calculateExpectedCost(entryN, expectedMintsToWin, data);
    const expectedProfit = poolSizeAtEntry - expectedCost;
    
    // Calculate capital requirements for different percentiles
    // 50th percentile: 177 mints, 90th: 589 mints, 99th: 1177 mints
    const percentile50Capital = calculateMintPriceSum(entryN, 177, data);
    const percentile90Capital = calculateMintPriceSum(entryN, 589, data);
    const percentile99Capital = calculateMintPriceSum(entryN, 1177, data);
    
    return {
      entryN,
      poolSizeAtEntry,
      expectedMintsToWin,
      expectedCost,
      expectedProfit,
      percentile50Capital,
      percentile90Capital,
      percentile99Capital,
    };
  });
};

// Generate cumulative probability curve for geometric distribution
export const generateProbabilityCurve = (
  maxMints: number = 1500,
  baseProbability: number = WHITE_PROBABILITY
): ProbabilityCurvePoint[] => {
  const curve: ProbabilityCurvePoint[] = [];
  
  for (let k = 1; k <= maxMints; k += 5) {
    // Cumulative probability: P(win by mint K) = 1 - (1 - p)^K
    const cumulativeProb = 1 - Math.pow(1 - baseProbability, k);
    curve.push({ mints: k, cumulativeProb });
  }
  
  return curve;
};

// Calculate specific percentile values
export const getPercentileMints = (percentile: number): number => {
  // Solve: percentile = 1 - (1 - p)^K
  // K = ln(1 - percentile) / ln(1 - p)
  return Math.ceil(Math.log(1 - percentile) / Math.log(1 - WHITE_PROBABILITY));
};
