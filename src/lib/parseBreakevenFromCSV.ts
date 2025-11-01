import { realBreakevenData, realMintingData } from "./parseRealCSV";

export interface BreakevenPoint {
  entryN: number;
  breakevenN: number;
  nDifference: number;
}

// Parse actual breakeven data from CSV columns G onwards
// Each row has breakeven pool sizes - when pool reaches these values,
// investors who entered at different N values break even
export const parseBreakevenPoints = (): BreakevenPoint[] => {
  const breakevenPoints: BreakevenPoint[] = [];
  
  // Build a map of N to poolSize for quick lookup
  const nToPoolSize = new Map<number, number>();
  realMintingData.forEach(row => {
    nToPoolSize.set(row.n, row.poolSize);
  });
  
  // For each row with breakeven data, find when those investors break even
  realBreakevenData.forEach(entry => {
    const entryN = entry.entryN;
    
    // Each breakeven pool size represents when an earlier investor breaks even
    // We need to find which N corresponds to each pool size
    entry.breakevenPoolSizes.forEach((breakevenPoolSize, index) => {
      // Find the N where poolSize >= breakevenPoolSize
      let breakevenN = entryN;
      
      for (let n = entryN; n <= 999; n++) {
        const poolSize = nToPoolSize.get(n);
        if (poolSize && poolSize >= breakevenPoolSize) {
          breakevenN = n;
          break;
        }
      }
      
      // Only add if we have meaningful data
      if (breakevenN > entryN) {
        breakevenPoints.push({
          entryN: entryN,
          breakevenN: breakevenN,
          nDifference: breakevenN - entryN
        });
      }
    });
  });
  
  // Remove duplicates and sort
  const uniquePoints = new Map<number, BreakevenPoint>();
  breakevenPoints.forEach(point => {
    const existing = uniquePoints.get(point.entryN);
    if (!existing || point.nDifference < existing.nDifference) {
      uniquePoints.set(point.entryN, point);
    }
  });
  
  return Array.from(uniquePoints.values()).sort((a, b) => a.entryN - b.entryN);
};

export const breakevenData = parseBreakevenPoints();
