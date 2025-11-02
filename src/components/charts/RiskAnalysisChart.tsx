import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { generateProbabilityCurve, getPercentileMints } from "@/lib/investorAnalysis";

const RiskAnalysisChart = () => {
  const probabilityCurve = generateProbabilityCurve(1500);

  // Calculate key percentile points
  const percentile50 = getPercentileMints(0.5);
  const percentile90 = getPercentileMints(0.9);
  const percentile99 = getPercentileMints(0.99);
  const expectedValue = 256;

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Analysis: Probability of Winning</CardTitle>
        <CardDescription>
          Cumulative probability of winning white (1/256) based on number of mints played
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={probabilityCurve} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="mints"
              label={{ value: "Number of Mints After Entry", position: "insideBottom", offset: -5 }}
              className="text-xs"
            />
            <YAxis
              tickFormatter={formatPercent}
              label={{ value: "Cumulative Probability", angle: -90, position: "insideLeft" }}
              className="text-xs"
            />
            <Tooltip
              formatter={(value: number) => formatPercent(value)}
              labelFormatter={(label) => `${label} mints`}
              contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
            />
            
            {/* Reference lines for key percentiles */}
            <ReferenceLine
              x={percentile50}
              stroke="hsl(var(--chart-3))"
              strokeDasharray="3 3"
              label={{ value: "50%", position: "top" }}
            />
            <ReferenceLine
              x={expectedValue}
              stroke="hsl(var(--chart-1))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: "Expected (256)", position: "top" }}
            />
            <ReferenceLine
              x={percentile90}
              stroke="hsl(var(--chart-4))"
              strokeDasharray="3 3"
              label={{ value: "90%", position: "top" }}
            />
            <ReferenceLine
              x={percentile99}
              stroke="hsl(var(--chart-5))"
              strokeDasharray="3 3"
              label={{ value: "99%", position: "top" }}
            />
            
            <Line
              type="monotone"
              dataKey="cumulativeProb"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              dot={false}
              name="Probability"
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-muted-foreground mb-1">50% Chance</div>
            <div className="font-bold">{percentile50} mints</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-muted-foreground mb-1">Expected Value</div>
            <div className="font-bold">{expectedValue} mints</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-muted-foreground mb-1">90% Chance</div>
            <div className="font-bold">{percentile90} mints</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-muted-foreground mb-1">99% Chance</div>
            <div className="font-bold">{percentile99} mints</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAnalysisChart;
