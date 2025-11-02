import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { getRealData } from "@/lib/parseRealCSV";
import { getBreakevenPoints } from "@/lib/parseBreakevenFromCSV";
import { calculateExpectedCauseFundingAnalysis, ExpectedCauseAnalysis } from "@/lib/expectedCauseFunding";
import { Loader2 } from "lucide-react";

export const ExpectedCauseFundingChart = () => {
  const [data, setData] = useState<ExpectedCauseAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { mintingData } = await getRealData();
        const breakevenPoints = await getBreakevenPoints();
        const analysis = calculateExpectedCauseFundingAnalysis(mintingData, breakevenPoints);
        
        // Filter to every 10th entry for cleaner visualization
        const filtered = analysis.filter((_, i) => i % 10 === 0);
        setData(filtered);
      } catch (error) {
        console.error("Error loading expected cause funding data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Expected vs Breakeven Cause Funding</CardTitle>
          <CardDescription>
            Probability-weighted analysis of investor cause contributions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Expected vs Breakeven Cause Funding</CardTitle>
        <CardDescription>
          Comparing probability-weighted expected contributions to breakeven scenario.
          Each investor mints until winning - early wins mean less cause contribution and more profit, late wins mean more contribution and potential losses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="entryN" 
              label={{ value: "Entry Point (Mint N)", position: "insideBottom", offset: -5 }}
              className="text-xs"
            />
            <YAxis 
              label={{ value: "% of Total Cause Funding", angle: -90, position: "insideLeft" }}
              className="text-xs"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="expectedPercentage"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Expected % (Probability-weighted)"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="breakevenPercentage"
              stroke="hsl(var(--chart-5))"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Breakeven % (Exit at breakeven)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Key Insight:</strong> A single investor mints continuously until winning the white square. 
            While most (63.2%) win within 256 mints with moderate cause contributions, 
            the geometric distribution's long tail means some unlucky investors mint far beyond their breakeven point, 
            contributing disproportionately more to the cause and potentially losing money.
          </p>
          <p>
            <strong>Expected %:</strong> Probability-weighted average of cause contributions across all possible win outcomes
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
