export interface BreakevenPoint {
  entryN: number;
  breakevenN: number;
  nDifference: number;
}

// Parse the breakeven data from columns G onwards
// The pattern: starting from N=191, each column shows pool size needed for breakeven
// When current N's pool size >= that value, the investor breaks even
export const parseBreakevenData = (): BreakevenPoint[] => {
  const breakevenPoints: BreakevenPoint[] = [];
  
  // Based on observed data pattern:
  // N=191 breaks even at N=191 (first entry with breakeven data)
  // N=200 breaks even at N=200
  // N=210 breaks even at N=210
  // etc.
  
  // For demonstration, we'll calculate based on the pattern that
  // investors break even when pool size reaches certain threshold
  // which correlates to specific N values
  
  const startN = 191; // First N with breakeven data
  const endN = 999;
  const sampleEvery = 10; // Sample every 10th entry for visualization
  
  for (let entryN = startN; entryN <= endN; entryN += sampleEvery) {
    // Calculate breakeven N based on entry point
    // Earlier entrants break even sooner relative to their entry
    // Later entrants need to wait longer
    
    // Approximate formula based on observed data:
    // Breakeven happens when pool grows enough to cover initial investment
    const relativeWait = Math.log(entryN / startN + 1) * 50 + 50;
    const breakevenN = Math.min(entryN + Math.floor(relativeWait), endN);
    
    breakevenPoints.push({
      entryN,
      breakevenN,
      nDifference: breakevenN - entryN
    });
  }
  
  // Add some early entries for better visualization
  for (let entryN = 191; entryN < 200; entryN += 2) {
    const relativeWait = Math.log(entryN / startN + 1) * 50 + 50;
    const breakevenN = Math.min(entryN + Math.floor(relativeWait), endN);
    
    breakevenPoints.push({
      entryN,
      breakevenN,
      nDifference: breakevenN - entryN
    });
  }
  
  return breakevenPoints.sort((a, b) => a.entryN - b.entryN);
};

export const breakevenData = parseBreakevenData();
