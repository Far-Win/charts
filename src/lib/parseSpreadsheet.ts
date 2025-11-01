// Utility to parse the full spreadsheet markdown
export const parseSpreadsheetMarkdown = (markdown: string) => {
  const lines = markdown.split('\n');
  const data = [];
  
  for (const line of lines) {
    // Skip if not a data row (has to start with | and contain numbers)
    if (!line.startsWith('|') || line.includes('---') || line.includes('Mint price')) {
      continue;
    }
    
    const cols = line.split('|').map(col => col.trim()).filter(col => col !== '');
    
    // Must have at least 6 columns and first column must be a number
    if (cols.length >= 6 && !isNaN(Number(cols[0]))) {
      const n = Number(cols[0]);
      const mintPrice = Number(cols[1]);
      const contributionToPool = Number(cols[2]);
      const contributionToCause = Number(cols[3]);
      const poolSize = Number(cols[4]);
      const binomialProbability = Number(cols[5]);
      
      // Only add if we have valid numbers
      if (!isNaN(n) && !isNaN(mintPrice) && !isNaN(poolSize) && !isNaN(binomialProbability)) {
        data.push({
          n,
          mintPrice,
          contributionToPool,
          contributionToCause,
          poolSize,
          binomialProbability
        });
      }
    }
  }
  
  return data;
};
