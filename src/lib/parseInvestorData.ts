export interface InvestorDataPoint {
  n: number;
  profit: number;
}

export interface InvestorLine {
  investorNumber: number;
  entryPoint: number;
  profitData: InvestorDataPoint[];
}

// Parse the investor profit/loss data from the new CSV
// Columns 6-23 represent Investors 1-18 (regardless of header labels)
const parseCSVData = (csvText: string): InvestorLine[] => {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    return [];
  }

  // Map columns 6-23 (18 columns) to Investors 1-18
  const FIRST_INVESTOR_COLUMN = 6;
  const NUM_INVESTORS = 18;
  
  // Initialize investor lines for Investors 1-18
  const investorMap = new Map<number, InvestorDataPoint[]>();
  for (let i = 1; i <= NUM_INVESTORS; i++) {
    investorMap.set(i, []);
  }

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    const n = parseInt(values[0]);
    
    if (isNaN(n)) continue;
    
    // Extract profit values for each investor (columns 6-23)
    for (let investorNum = 1; investorNum <= NUM_INVESTORS; investorNum++) {
      const columnIndex = FIRST_INVESTOR_COLUMN + (investorNum - 1);
      
      if (columnIndex < values.length) {
        const profitStr = values[columnIndex].trim();
        if (profitStr !== '') {
          const profit = parseFloat(profitStr);
          if (!isNaN(profit)) {
            investorMap.get(investorNum)?.push({ n, profit });
          }
        }
      }
    }
  }

  // Convert map to array
  const investorLines: InvestorLine[] = [];
  for (let investorNum = 1; investorNum <= NUM_INVESTORS; investorNum++) {
    const profitData = investorMap.get(investorNum) || [];
    if (profitData.length > 0) {
      // Find the actual entry point (where profit crosses from positive to negative, closest to zero)
      let entryPoint = profitData[0].n; // Default to first data point
      
      for (let i = 0; i < profitData.length - 1; i++) {
        const current = profitData[i];
        const next = profitData[i + 1];
        
        // Find where profit crosses from positive to negative (entry point)
        if (current.profit >= 0 && next.profit < 0) {
          // Use the point closest to zero as entry point
          entryPoint = Math.abs(current.profit) < Math.abs(next.profit) ? current.n : next.n;
          break;
        }
      }
      
      investorLines.push({
        investorNumber: investorNum,
        entryPoint,
        profitData,
      });
    }
  }

  return investorLines;
};

// Fetch and cache investor data
let cachedInvestorData: InvestorLine[] | null = null;

export const getInvestorData = async (): Promise<InvestorLine[]> => {
  if (cachedInvestorData) return cachedInvestorData;
  
  const response = await fetch('/minting-data.csv');
  const csvText = await response.text();
  cachedInvestorData = parseCSVData(csvText);
  return cachedInvestorData;
};
