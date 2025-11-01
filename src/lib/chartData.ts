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

// Import real parsed data from CSV
import { realMintingData as importedRealData } from "./parseRealCSV";

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

// Use the real dataset from the parser
const fullDataset = importedRealData;

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
