import { getRealData } from "./parseRealCSV";
import { getBreakevenPoints } from "./parseBreakevenFromCSV";
import { calculateCauseFundingByEntryPoint } from "./causeFundingAttribution";

export const getEntry131Data = async () => {
  const { mintingData } = await getRealData();
  const breakevenPoints = await getBreakevenPoints();
  const causeFunding = calculateCauseFundingByEntryPoint(mintingData, breakevenPoints);
  
  const entry131 = causeFunding.find(cf => cf.entryN === 131);
  
  return entry131;
};
