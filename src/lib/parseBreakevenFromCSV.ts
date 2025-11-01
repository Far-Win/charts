import { getRealData, type BreakevenEntry } from "./parseRealCSV";

export interface InvestorProfitLine {
  entryN: number; // N value where this investor entered
  profitData: { n: number; profit: number }[]; // Profit/loss at each subsequent mint number
}

// CSV structure notes:
// - After the base columns, there are up to 21 investor P/L columns.
// - At mint number n, only investors who have already entered have a value.
// - The investor P/L columns are ordered from newest (left) to oldest (right).
// - The newest investor at the current n has 0 profit and is not included in the array.
// - Therefore, at n with K active investors, the array has length K-1.

export const parseInvestorProfitLines = (breakevenData: BreakevenEntry[]): InvestorProfitLine[] => {
  const investorLines: InvestorProfitLine[] = [];
  const FIRST_INVESTOR_N = 11; // First investor enters at n=11
  const INVESTOR_ENTRY_INTERVAL = 20; // New investor every 20 mints
  const NUM_INVESTORS = 21; // Maximum number of investor columns

  // Create a line for each of the 21 investors
  for (let investorIndex = 0; investorIndex < NUM_INVESTORS; investorIndex++) {
    const entryN = FIRST_INVESTOR_N + investorIndex * INVESTOR_ENTRY_INTERVAL;
    const profitData: { n: number; profit: number }[] = [];

    // Add initial zero at the exact entry point
    profitData.push({ n: entryN, profit: 0 });

    for (const entry of breakevenData) {
      const currentN = entry.entryN;
      if (currentN < entryN) continue; // Not entered yet

      // Active investors at currentN (capped at NUM_INVESTORS)
      const activeCount = Math.min(
        NUM_INVESTORS,
        Math.floor((currentN - FIRST_INVESTOR_N) / INVESTOR_ENTRY_INTERVAL) + 1
      );

      // If just entered at this n, profit is 0 and already added as the first point
      if (currentN === entryN) continue;

      // profits array is ordered from newest-1 (index 0) -> oldest (index activeCount-2)
      const profits = entry.breakevenPoolSizes as unknown as (number | null)[];
      const pos = activeCount - 2 - investorIndex; // map investor index to position

      if (pos >= 0 && pos < profits.length) {
        const profit = profits[pos];
        if (profit !== null && profit !== undefined && !isNaN(profit)) {
          profitData.push({ n: currentN, profit: profit as number });
        }
      }
    }

    if (profitData.length > 0) {
      investorLines.push({ entryN, profitData });
    }
  }

  return investorLines.sort((a, b) => a.entryN - b.entryN);
};

// Async function to get investor profit lines
export const getInvestorProfitLines = async (): Promise<InvestorProfitLine[]> => {
  const data = await getRealData();
  return parseInvestorProfitLines(data.breakevenData);
};
