import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { investorProfitLines } from "@/lib/parseBreakevenFromCSV";

const BreakevenChart = () => {
  // Create a combined dataset with all investor profit lines
  // Each investor's data needs to be merged into rows by N value
  const allNValues = new Set<number>();
  investorProfitLines.forEach(investor => {
    investor.profitData.forEach(point => allNValues.add(point.n));
  });

  const chartData = Array.from(allNValues).sort((a, b) => a - b).map(n => {
    const dataPoint: any = { n };
    investorProfitLines.forEach(investor => {
      const profitPoint = investor.profitData.find(p => p.n === n);
      if (profitPoint) {
        dataPoint[`investor_${investor.entryN}`] = profitPoint.profit;
      }
    });
    return dataPoint;
  });

  // Generate distinct colors for all 21 investor lines
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#6366f1", // indigo
    "#f43f5e", // rose
    "#84cc16", // lime
    "#14b8a6", // teal
    "#a855f7", // violet
    "#fb923c", // orange
    "#22d3ee", // sky
    "#4ade80", // green
    "#facc15", // yellow
    "#e11d48", // red
    "#7c3aed", // purple variant
  ];

  // Show ALL 21 investor lines
  const selectedInvestors = investorProfitLines;

  return (
    <Card className="shadow-glow border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Investor Profit/Loss Analysis</CardTitle>
        <CardDescription>
          21 investor scenarios (n=151 to n=171) showing profit declining to breakeven and beyond
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="n"
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Mint Number (N)', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Profit/Loss', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            
            {/* Zero reference line */}
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            
            {/* Draw lines for selected investors */}
            {selectedInvestors.map((investor, index) => (
              <Line
                key={`investor_${investor.entryN}`}
                type="monotone"
                dataKey={`investor_${investor.entryN}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                name={`Entry N=${investor.entryN}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>All 21 investor scenarios (n=151 through n=171). Each line shows profit declining as minting continues. Breakeven occurs when crossing zero into negative territory.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakevenChart;
