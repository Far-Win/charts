import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getRealData } from "@/lib/parseRealCSV";
import { generateRiskAnalysis, type RiskAnalysis } from "@/lib/investorAnalysis";
import { MintData } from "@/lib/chartData";
import { Loader2 } from "lucide-react";

const ExpectedValueCalculator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<MintData[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<number>(11);
  const [inputValue, setInputValue] = useState("11");

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

  // Calculate analysis for selected entry on the fly
  const analysis = generateRiskAnalysis(data, [selectedEntry]);
  const selected = analysis[0];

  if (!selected) return null;

  const formatETH = (value: number) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected Value Calculator</CardTitle>
        <CardDescription>
          Calculate expected returns and capital requirements for different entry points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Pool Size at Entry</div>
            <div className="text-2xl font-bold text-chart-2">{formatETH(selected.poolSizeAtEntry)}</div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Expected Mints to Win</div>
            <div className="text-2xl font-bold">{selected.expectedMintsToWin}</div>
            <div className="text-xs text-muted-foreground">Based on 1/256 probability</div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Expected Cost (20% Fee)</div>
            <div className="text-2xl font-bold text-destructive">{formatETH(selected.expectedCost)}</div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Expected Profit</div>
            <div className={`text-2xl font-bold ${selected.expectedProfit > 0 ? 'text-chart-4' : 'text-destructive'}`}>
              {formatETH(selected.expectedProfit)}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <h4 className="font-semibold text-sm">Capital Requirements (Full Mint Price)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded bg-background border">
              <div className="text-muted-foreground mb-1">50th Percentile</div>
              <div className="font-bold">{formatETH(selected.percentile50Capital)}</div>
              <div className="text-xs text-muted-foreground mt-1">177 mints</div>
            </div>
            <div className="p-3 rounded bg-background border">
              <div className="text-muted-foreground mb-1">90th Percentile</div>
              <div className="font-bold">{formatETH(selected.percentile90Capital)}</div>
              <div className="text-xs text-muted-foreground mt-1">589 mints</div>
            </div>
            <div className="p-3 rounded bg-background border">
              <div className="text-muted-foreground mb-1">99th Percentile</div>
              <div className="font-bold">{formatETH(selected.percentile99Capital)}</div>
              <div className="text-xs text-muted-foreground mt-1">1,177 mints</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpectedValueCalculator;
