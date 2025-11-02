import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { getRealData } from "@/lib/parseRealCSV";
import { getBreakevenPoints } from "@/lib/parseBreakevenFromCSV";
import { calculateCauseFundingByEntryPoint, CauseFundingAttribution } from "@/lib/causeFundingAttribution";

// Color palette for different entry points
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(40, 70%, 50%)",
  "hsl(160, 70%, 50%)",
];

export const CauseFundingAttributionChart = () => {
  const [attributions, setAttributions] = useState<CauseFundingAttribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { mintingData } = await getRealData();
      const breakevenPoints = await getBreakevenPoints();
      
      const data = calculateCauseFundingByEntryPoint(mintingData, breakevenPoints);
      setAttributions(data.filter(d => d.percentage > 0));
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cause Funding Attribution</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cause Funding Attribution</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate total for display
  const totalContribution = attributions.reduce((sum, a) => sum + a.causeContribution, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cause Funding Attribution by Entry Point</CardTitle>
        <CardDescription>
          Percentage of total cause funding (before white square) contributed by investors at each entry point. 
          Total cause funding: {totalContribution.toFixed(2)} ETH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={attributions}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="entryN"
              label={{ value: "Entry Point (N)", position: "insideBottom", offset: -10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: "Percentage of Total Cause Funding (%)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CauseFundingAttribution;
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-1">Entry Point: N={data.entryN}</p>
                      <p className="text-sm text-muted-foreground">
                        Breakeven: N={data.breakevenN}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contribution: {data.causeContribution.toFixed(4)} ETH
                      </p>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {data.percentage.toFixed(2)}% of total cause funding
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {attributions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Key Insight:</strong> This chart shows which investor cohorts (by entry point) contributed the most to the cause before reaching their breakeven point. 
            Higher percentages indicate that investors from that entry point funded a larger share of the total cause contributions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
