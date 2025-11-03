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
    
    mintingData.push({
      n,
      mintPrice,
      contributionToPool,
      contributionToCause,
      poolSize,
      binomialProbability,
      profitability: undefined
    });
    
    // Parse investor profit data from columns G-AA (indices 6-26)
    // Column positions are FIXED: G=investor0, H=investor1, I=investor2, etc.
    // Empty cells before an investor enters should remain as null/undefined
    const investorProfits: (number | null)[] = [];
    const MAX_INVESTOR_COLUMNS = 21; // G through AA = 21 columns
    
    for (let j = 0; j < MAX_INVESTOR_COLUMNS; j++) {
      const columnIndex = 6 + j; // Start from column G (index 6)
      if (columnIndex < values.length && values[columnIndex].trim() !== '') {
        const parsedVal = parseFloat(values[columnIndex]);
        if (!isNaN(parsedVal)) {
          investorProfits[j] = parsedVal;
        } else {
          investorProfits[j] = null;
        }
      } else {
        investorProfits[j] = null;
      }
    }
    
    // Only add if at least one investor value exists
    if (investorProfits.some(v => v !== null)) {
      breakevenData.push({
        entryN: n,
        breakevenPoolSizes: investorProfits as number[] // Cast after filtering nulls in usage
      });
    }
  }
  
  return { mintingData, breakevenData };
};

// Fetch CSV data at runtime
let cachedData: { mintingData: MintData[], breakevenData: BreakevenEntry[] } | null = null;

export const getRealData = async () => {
  // Always refetch to reflect latest CSV updates
  const response = await fetch(`/minting-data.csv?t=${Date.now()}`, { cache: 'no-store' });
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
