// This script converts the CSV to a TypeScript file for static import
// Run with: node scripts/csv-to-ts.js

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../public/minting-data.csv');
const tsPath = path.join(__dirname, '../src/lib/realMintingData.ts');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');

let tsContent = `// Auto-generated from CSV - do not edit manually
import { MintData } from "./chartData";

export interface BreakevenEntry {
  entryN: number;
  breakevenPoolSizes: number[];
}

export const realMintingData: MintData[] = [\n`;

const breakevenEntries = [];

// Skip header
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
  const profitability = values[6] ? parseFloat(values[6]) : 'undefined';
  
  tsContent += `  { n: ${n}, mintPrice: ${mintPrice}, contributionToPool: ${contributionToPool}, contributionToCause: ${contributionToCause}, poolSize: ${poolSize}, binomialProbability: ${binomialProbability}, profitability: ${profitability} },\n`;
  
  // Parse breakeven data
  const breakevenPoolSizes = [];
  for (let j = 7; j < values.length; j++) {
    const val = parseFloat(values[j]);
    if (!isNaN(val)) {
      breakevenPoolSizes.push(val);
    }
  }
  
  if (breakevenPoolSizes.length > 0) {
    breakevenEntries.push({ entryN: n, breakevenPoolSizes });
  }
}

tsContent += `];\n\nexport const realBreakevenData: BreakevenEntry[] = [\n`;

for (const entry of breakevenEntries) {
  tsContent += `  { entryN: ${entry.entryN}, breakevenPoolSizes: [${entry.breakevenPoolSizes.join(', ')}] },\n`;
}

tsContent += `];\n`;

fs.writeFileSync(tsPath, tsContent);
console.log(`Generated ${tsPath}`);
