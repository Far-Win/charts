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

  // Generate colors for different investor lines
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // Sample investors to show (to avoid cluttering with too many lines)
  const selectedInvestors = investorProfitLines.filter((_, index) => 
    index % Math.max(1, Math.floor(investorProfitLines.length / 8)) === 0
  );

  return (
    <Card className="shadow-glow border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Investor Profit/Loss Analysis</CardTitle>
        <CardDescription>
          Profit trajectory for investors entering at different N values (columns G-AA)
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
          <p>Each line shows profit/loss for investors entering at different mint numbers. Breakeven occurs when the line crosses zero.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakevenChart;
