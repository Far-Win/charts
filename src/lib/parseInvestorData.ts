export interface InvestorDataPoint {
  n: number;
  profit: number;
}

export interface InvestorLine {
  investorNumber: number;
  profitData: InvestorDataPoint[];
}

// Parse the investor profit/loss data from the new CSV
const parseCSVData = (csvText: string): InvestorLine[] => {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    return [];
  }

  // Parse header row to find investor columns
  const header = lines[0].split(',');
  const investorColumns: { index: number; investorNum: number }[] = [];
  
  header.forEach((col, idx) => {
    const trimmedCol = col.trim();
    if (trimmedCol.startsWith('Investor')) {
      const match = trimmedCol.match(/Investor\s+(\d+)/);
      if (match) {
        const investorNum = parseInt(match[1]);
        investorColumns.push({ index: idx, investorNum });
      }
    }
  });

  // Initialize investor lines
  const investorMap = new Map<number, InvestorDataPoint[]>();
  investorColumns.forEach(({ investorNum }) => {
    investorMap.set(investorNum, []);
  });

  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    const n = parseInt(values[0]);
    
    if (isNaN(n)) continue;
    
    // Extract profit values for each investor
    investorColumns.forEach(({ index, investorNum }) => {
      if (index < values.length) {
        const profitStr = values[index].trim();
        if (profitStr !== '') {
          const profit = parseFloat(profitStr);
          if (!isNaN(profit)) {
            investorMap.get(investorNum)?.push({ n, profit });
          }
        }
      }
    });
  }

  // Convert map to array
  const investorLines: InvestorLine[] = [];
  investorColumns.forEach(({ investorNum }) => {
    const profitData = investorMap.get(investorNum) || [];
    if (profitData.length > 0) {
      investorLines.push({
        investorNumber: investorNum,
        profitData,
      });
    }
  });

  return investorLines;
};

// Fetch and cache investor data
let cachedInvestorData: InvestorLine[] | null = null;

export const getInvestorData = async (): Promise<InvestorLine[]> => {
  if (cachedInvestorData) return cachedInvestorData;
  
  const response = await fetch('/investor-data.csv');
  const csvText = await response.text();
  cachedInvestorData = parseCSVData(csvText);
  return cachedInvestorData;
};
