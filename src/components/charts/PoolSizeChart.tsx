import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { mintingData, getChartConfig } from "@/lib/chartData";

const PoolSizeChart = () => {
  const config = getChartConfig();

  return (
    <Card className="shadow-[var(--shadow-card)] border-border/50 transition-[var(--transition-smooth)] hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
          Pool Size Growth
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Cumulative pool size over mint numbers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={mintingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="n" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Mint Number (N)', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Pool Size', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="poolSize" 
              stroke={config.poolSize.color} 
              strokeWidth={2.5}
              dot={{ fill: config.poolSize.color, r: 3 }}
              name={config.poolSize.label}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PoolSizeChart;
