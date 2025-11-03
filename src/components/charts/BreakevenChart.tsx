import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { getInvestorData, type InvestorLine } from "@/lib/parseInvestorData";

const BreakevenChart = () => {
  const [investorLines, setInvestorLines] = useState<InvestorLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getInvestorData().then(lines => {
      setInvestorLines(lines);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || investorLines.length === 0) {
    return (
      <Card className="shadow-glow border-border/50">
        <CardHeader>
        <CardTitle className="text-2xl">Fund Profit/Loss depending on entry point</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[1200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading investor data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a combined dataset with all investor profit lines
  // Each investor's data needs to be merged into rows by N value
  const allNValues = new Set<number>();
  investorLines.forEach(investor => {
    investor.profitData.forEach(point => allNValues.add(point.n));
  });

  const chartData = Array.from(allNValues).sort((a, b) => a - b).map(n => {
    const dataPoint: any = { n };
    investorLines.forEach(investor => {
      const profitPoint = investor.profitData.find(p => p.n === n);
      if (profitPoint) {
        dataPoint[`entry_${investor.entryPoint}`] = profitPoint.profit;
      }
    });
    return dataPoint;
  });

  // Generate distinct colors for all investor lines
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
  ];

  // Show all investor lines
  const selectedInvestors = investorLines;

  return (
    <Card className="shadow-glow border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Fund Profit/Loss depending on entry point</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={1200}>
          <LineChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="n"
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Mint Number (N)', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
              domain={[100, 500]}
              type="number"
              allowDataOverflow={true}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Profit/Loss (ETH)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
              domain={[-1, 2]}
              allowDataOverflow={true}
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
            
            {/* N=256 reference line */}
            <ReferenceLine
              x={256}
              stroke="hsl(var(--chart-3))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: 'N=256', position: 'top', fill: 'hsl(var(--chart-3))' }}
            />
            
            {/* Draw lines for selected investors */}
            {selectedInvestors.map((investor, index) => (
              <Line
                key={`entry_${investor.entryPoint}`}
                type="monotone"
                dataKey={`entry_${investor.entryPoint}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                name={`Entry ${investor.entryPoint}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Multiple scenarios showing fund profit/loss depending on game entry point. Each line represents a different investor entering at various points. Breakeven occurs when crossing zero into negative territory.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakevenChart;
