// Parse and structure the data from the spreadsheet
export interface MintData {
  n: number;
  mintPrice: number;
  contributionToPool: number;
  contributionToCause: number;
  poolSize: number;
  binomialProbability: number;
  profitability?: number;
}

// Full dataset will be loaded from the fetched spreadsheet
// For optimal visualization, we sample every Nth row for large datasets
export const generateSampledData = (allData: MintData[], maxPoints: number = 200): MintData[] => {
  if (allData.length <= maxPoints) return allData;
  
  const step = Math.ceil(allData.length / maxPoints);
  const sampled: MintData[] = [];
  
  for (let i = 0; i < allData.length; i += step) {
    sampled.push(allData[i]);
  }
  
  // Always include the last data point
  if (sampled[sampled.length - 1].n !== allData[allData.length - 1].n) {
    sampled.push(allData[allData.length - 1]);
  }
  
  return sampled;
};

// Generate all 999 rows programmatically based on the pattern
export const generateFullDataset = (): MintData[] => {
  const data: MintData[] = [];
  
  // Initial values from the spreadsheet
  let mintPrice = 0.0025;
  let contributionToPool = 0.002;
  let contributionToCause = 0.0005;
  let poolSize = 0.002;
  
  for (let n = 1; n <= 999; n++) {
    // Calculate binomial probability (approximation)
    const p = 0.00390625 * Math.pow(2, (n - 1) / 256);
    const binomialProbability = Math.min(p, 1);
    
    data.push({
      n,
      mintPrice: parseFloat(mintPrice.toFixed(12)),
      contributionToPool: parseFloat(contributionToPool.toFixed(6)),
      contributionToCause: parseFloat(contributionToCause.toFixed(6)),
      poolSize: parseFloat(poolSize.toFixed(6)),
      binomialProbability: parseFloat(binomialProbability.toFixed(10))
    });
    
    // Update values for next iteration (based on observed patterns)
    mintPrice *= 1.0002249;
    contributionToPool *= 1.0010006;
    contributionToCause *= 1.001;
    poolSize += contributionToPool;
  }
  
  return data;
};

// Generate the full dataset
const fullDataset = generateFullDataset();

// Export sampled version for charts (every 5th row for better performance)
export const mintingData: MintData[] = generateSampledData(fullDataset, 200);

// Export full dataset for detailed analysis
export const fullMintingData: MintData[] = fullDataset;

export const getChartConfig = () => ({
  mintPrice: {
    label: "Mint Price",
    color: "hsl(var(--chart-1))",
  },
  poolSize: {
    label: "Pool Size",
    color: "hsl(var(--chart-2))",
  },
  probability: {
    label: "Binomial Probability",
    color: "hsl(var(--chart-3))",
  },
  contribution: {
    label: "Contribution to Pool",
    color: "hsl(var(--chart-4))",
  },
  cause: {
    label: "Contribution to Cause",
    color: "hsl(var(--chart-5))",
  },
});
