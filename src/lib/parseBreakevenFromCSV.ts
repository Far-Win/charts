import { realBreakevenData, realMintingData } from "./parseRealCSV";

export interface InvestorProfitLine {
  entryN: number; // N value where this investor entered
  profitData: { n: number; profit: number }[]; // Profit/loss at each subsequent mint number
}

// Parse investor profit/loss data from columns G-AA
// Column G = investor entering at n=151
// Column H = investor entering at n=152
// ... 
// Column AA = investor entering at n=171 (21 investors total)
export const parseInvestorProfitLines = (): InvestorProfitLine[] => {
  const investorLines: InvestorProfitLine[] = [];
  const FIRST_INVESTOR_N = 151; // First investor enters at n=151
  const NUM_INVESTORS = 21; // Columns G through AA = 21 columns
  
  // Build a map of n -> investor profits array
  const profitsByN = new Map<number, number[]>();
  realBreakevenData.forEach(entry => {
    profitsByN.set(entry.entryN, entry.breakevenPoolSizes);
  });
  
  // Create a line for each of the 21 investors
  for (let investorIndex = 0; investorIndex < NUM_INVESTORS; investorIndex++) {
    const entryN = FIRST_INVESTOR_N + investorIndex;
    const profitData: { n: number; profit: number }[] = [];
    
    // For each row starting from this investor's entry point
    profitsByN.forEach((profits, currentN) => {
      if (currentN >= entryN) {
        // This investor's profit is at index investorIndex in the profits array
        const profit = profits[investorIndex];
        if (profit !== undefined && !isNaN(profit)) {
          profitData.push({
            n: currentN,
            profit: profit
          });
        }
      }
    });
    
    if (profitData.length > 0) {
      investorLines.push({
        entryN,
        profitData: profitData.sort((a, b) => a.n - b.n)
      });
    }
  }
  
  return investorLines.sort((a, b) => a.entryN - b.entryN);
};

export const investorProfitLines = parseInvestorProfitLines();
