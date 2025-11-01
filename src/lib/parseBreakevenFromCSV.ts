import { realBreakevenData, realMintingData } from "./parseRealCSV";

export interface InvestorProfitLine {
  entryN: number; // Which investor cohort this line represents
  profitData: { n: number; profit: number }[]; // Profit at each mint number
}

// Parse investor profit/loss data from columns G onwards
// Each column (G to AA) represents an investor entering at a specific N
// Values show their profit/loss as minting continues
export const parseInvestorProfitLines = (): InvestorProfitLine[] => {
  const investorLines: InvestorProfitLine[] = [];
  
  // Each entry in realBreakevenData has breakevenPoolSizes array
  // representing profit/loss values for that investor cohort
  realBreakevenData.forEach(entry => {
    const entryN = entry.entryN;
    const profitData: { n: number; profit: number }[] = [];
    
    // Each value in breakevenPoolSizes is actually the profit at successive N values
    entry.breakevenPoolSizes.forEach((profit, index) => {
      const currentN = entryN + index;
      if (currentN <= 999) {
        profitData.push({
          n: currentN,
          profit: profit
        });
      }
    });
    
    if (profitData.length > 0) {
      investorLines.push({
        entryN,
        profitData
      });
    }
  });
  
  return investorLines.sort((a, b) => a.entryN - b.entryN);
};

export const investorProfitLines = parseInvestorProfitLines();
