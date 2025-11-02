import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRealData } from "@/lib/parseRealCSV";
import { generateRiskAnalysis, type RiskAnalysis } from "@/lib/investorAnalysis";
import { Loader2 } from "lucide-react";

const ExpectedValueCalculator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [riskData, setRiskData] = useState<RiskAnalysis[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<number>(11);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRealData();
      const entryPoints = Array.from({ length: 21 }, (_, i) => 11 + i * 20);
      const analysis = generateRiskAnalysis(data.mintingData, entryPoints);
      setRiskData(analysis);
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

  const selected = riskData.find(d => d.entryN === selectedEntry);

  if (!selected) return null;

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
        <div>
          <label className="text-sm font-medium mb-2 block">Entry Point (Mint Number)</label>
          <Select value={selectedEntry.toString()} onValueChange={(v) => setSelectedEntry(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {riskData.map(d => (
                <SelectItem key={d.entryN} value={d.entryN.toString()}>
                  N = {d.entryN}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <div className="text-2xl font-bold text-destructive">{formatCurrency(selected.expectedCost)}</div>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Expected Profit</div>
            <div className={`text-2xl font-bold ${selected.expectedProfit > 0 ? 'text-chart-4' : 'text-destructive'}`}>
              {formatCurrency(selected.expectedProfit)}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <h4 className="font-semibold text-sm">Capital Requirements (Full Mint Price)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded bg-background border">
              <div className="text-muted-foreground mb-1">50th Percentile</div>
              <div className="font-bold">{formatCurrency(selected.percentile50Capital)}</div>
              <div className="text-xs text-muted-foreground mt-1">177 mints</div>
            </div>
            <div className="p-3 rounded bg-background border">
              <div className="text-muted-foreground mb-1">90th Percentile</div>
              <div className="font-bold">{formatCurrency(selected.percentile90Capital)}</div>
              <div className="text-xs text-muted-foreground mt-1">589 mints</div>
            </div>
            <div className="p-3 rounded bg-background border">
              <div className="text-muted-foreground mb-1">99th Percentile</div>
              <div className="font-bold">{formatCurrency(selected.percentile99Capital)}</div>
              <div className="text-xs text-muted-foreground mt-1">1,177 mints</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpectedValueCalculator;
