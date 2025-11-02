import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getRealData } from "@/lib/parseRealCSV";
import { MintData } from "@/lib/chartData";
import { Loader2 } from "lucide-react";

const WHITE_PROBABILITY = 1 / 256;
const CAUSE_FEE = 0.2;

const BreakevenCalculator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<MintData[]>([]);
  const [selectedEntry, setSelectedEntry] = useState(11);
  const [inputValue, setInputValue] = useState("11");
  const [probability, setProbability] = useState(90);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getRealData();
      setData(result.mintingData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Calculate mints needed for target probability
  const mintsNeeded = Math.ceil(Math.log(1 - probability / 100) / Math.log(1 - WHITE_PROBABILITY));
  
  // Get entry data
  const entryData = data.find(d => d.n === selectedEntry);
  const poolSizeAtEntry = entryData?.poolSize || 0;
  
  // Calculate total ETH needed for these mints
  const startIndex = data.findIndex(d => d.n >= selectedEntry);
  let totalMintPriceETH = 0;
  if (startIndex !== -1) {
    for (let i = 0; i < mintsNeeded && startIndex + i < data.length; i++) {
      totalMintPriceETH += data[startIndex + i].mintPrice;
    }
  }
  
  // Calculate net cost (20% fee to cause)
  const netCostETH = totalMintPriceETH * CAUSE_FEE;
  
  // Calculate profit/loss
  const profitLossETH = poolSizeAtEntry - netCostETH;
  const isProfit = profitLossETH > 0;
  
  // Calculate ROI
  const roi = netCostETH > 0 ? (profitLossETH / netCostETH) * 100 : 0;

  const formatETH = (value: number) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Get valid range from data
  const minN = data[0]?.n || 0;
  const maxN = data[data.length - 1]?.n || 0;
  
  // Validate entered N exists in data
  const isValidEntry = data.some(d => d.n === selectedEntry);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && data.some(d => d.n === numValue)) {
      setSelectedEntry(numValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakeven Calculator</CardTitle>
        <CardDescription>
          Set your desired win probability to see capital requirements and expected returns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Entry Point Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Entry Point (Mint Number N)</label>
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            min={minN}
            max={maxN}
            className={!isValidEntry ? "border-destructive" : ""}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Valid range: {minN} to {maxN}</span>
            {!isValidEntry && <span className="text-destructive">Invalid entry point</span>}
          </div>
        </div>

        {/* Probability Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Target Win Probability</label>
            <span className="text-2xl font-bold text-primary">{probability}%</span>
          </div>
          <Slider
            value={[probability]}
            onValueChange={(value) => setProbability(value[0])}
            min={50}
            max={99}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50% (Median)</span>
            <span>75%</span>
            <span>90%</span>
            <span>99% (Very Safe)</span>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Mints Required</div>
            <div className="text-2xl font-bold">{mintsNeeded.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {probability}% chance to win white
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Pool Size at Entry</div>
            <div className="text-2xl font-bold text-chart-2">{formatETH(poolSizeAtEntry)}</div>
            <div className="text-xs text-muted-foreground">
              Total prize if you win
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Total Capital Required</div>
            <div className="text-2xl font-bold text-chart-1">{formatETH(totalMintPriceETH)}</div>
            <div className="text-xs text-muted-foreground">
              Full mint price for {mintsNeeded.toLocaleString()} mints
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Net Cost (20% Fee)</div>
            <div className="text-2xl font-bold text-destructive">{formatETH(netCostETH)}</div>
            <div className="text-xs text-muted-foreground">
              Permanent cost to cause
            </div>
          </div>
        </div>

        {/* Breakeven Analysis */}
        <div className={`p-6 rounded-lg border-2 ${isProfit ? 'bg-chart-4/10 border-chart-4' : 'bg-destructive/10 border-destructive'}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expected Profit/Loss</span>
              <span className={`text-3xl font-bold ${isProfit ? 'text-chart-4' : 'text-destructive'}`}>
                {isProfit ? '+' : ''}{formatETH(profitLossETH)}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-medium">Return on Investment (ROI)</span>
              <span className={`text-2xl font-bold ${roi > 0 ? 'text-chart-4' : 'text-destructive'}`}>
                {roi > 0 ? '+' : ''}{formatPercent(roi)}
              </span>
            </div>

            <div className="pt-3 text-sm text-muted-foreground">
              {isProfit ? (
                <>
                  ✓ <strong>Profitable:</strong> At {probability}% confidence, you expect to profit {formatETH(profitLossETH)} after winning the pool.
                </>
              ) : (
                <>
                  ✗ <strong>Unprofitable:</strong> At {probability}% confidence, pool size doesn't cover the net cost. Expected loss of {formatETH(Math.abs(profitLossETH))}.
                </>
              )}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• <strong>Total Capital:</strong> Full ETH needed to mint {mintsNeeded.toLocaleString()} times (80% goes to pool, 20% to cause)</p>
          <p>• <strong>Net Cost:</strong> The 20% that goes to cause (your permanent expense)</p>
          <p>• <strong>Expected Profit:</strong> Pool size minus net cost (assumes you win by target probability)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakevenCalculator;
