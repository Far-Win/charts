import { MintData } from "./chartData";

export interface BreakevenEntry {
  entryN: number;
  breakevenPoolSizes: number[];
}

// Parse CSV synchronously from the uploaded data file
// Using static import to embed CSV data at build time
const parseCSVData = (csvText: string): { 
  mintingData: MintData[], 
  breakevenData: BreakevenEntry[] 
} => {
  const lines = csvText.trim().split('\n');
  const mintingData: MintData[] = [];
  const breakevenData: BreakevenEntry[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    
    const n = parseInt(values[0]);
    if (isNaN(n)) continue;
    
    const mintPrice = parseFloat(values[1]);
    const contributionToPool = parseFloat(values[2]);
    const contributionToCause = parseFloat(values[3]);
    const poolSize = parseFloat(values[4]);
    const binomialProbability = parseFloat(values[5]);
    const profitability = values[6] ? parseFloat(values[6]) : undefined;
    
    mintingData.push({
      n,
      mintPrice,
      contributionToPool,
      contributionToCause,
      poolSize,
      binomialProbability,
      profitability
    });
    
    // Parse investor profit data (columns G-AA, which are indices 7-27)
    // Column G = investor entering at n=151, H = n=152, etc.
    // Each row shows profit for all active investors at that mint number
    const investorProfits: number[] = [];
    for (let j = 7; j < values.length; j++) {
      const val = parseFloat(values[j]);
      if (!isNaN(val)) {
        investorProfits.push(val);
      }
    }
    
    if (investorProfits.length > 0) {
      breakevenData.push({
        entryN: n,
        breakevenPoolSizes: investorProfits
      });
    }
  }
  
  return { mintingData, breakevenData };
};

// Fetch CSV data at runtime
let cachedData: { mintingData: MintData[], breakevenData: BreakevenEntry[] } | null = null;

export const getRealData = async () => {
  if (cachedData) return cachedData;
  
  const response = await fetch('/minting-data.csv');
  const csvText = await response.text();
  cachedData = parseCSVData(csvText);
  return cachedData;
};

// For synchronous exports (will be empty initially, populated after fetch)
export const realMintingData: MintData[] = [];
export const realBreakevenData: BreakevenEntry[] = [];

// Auto-initialize
getRealData().then(data => {
  realMintingData.length = 0;
  realMintingData.push(...data.mintingData);
  realBreakevenData.length = 0;
  realBreakevenData.push(...data.breakevenData);
});
