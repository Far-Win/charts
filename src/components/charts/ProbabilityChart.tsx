import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mintingData, getChartConfig } from "@/lib/chartData";

const ProbabilityChart = () => {
  const config = getChartConfig();

  return (
    <Card className="shadow-[var(--shadow-card)] border-border/50 transition-[var(--transition-smooth)] hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
          Probability Distribution
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Binomial probability at each mint number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={mintingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.probability.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={config.probability.color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="n" 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Mint Number', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Probability', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="binomialProbability" 
              stroke={config.probability.color} 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorProbability)"
              name={config.probability.label}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProbabilityChart;
