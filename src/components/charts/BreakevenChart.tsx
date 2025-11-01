import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { breakevenData } from "@/lib/parseBreakevenFromCSV";

const BreakevenChart = () => {
  const chartConfig = {
    breakevenN: {
      label: "Breakeven at N",
      color: "hsl(var(--chart-1))",
    },
    entryN: {
      label: "Entry at N",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card className="shadow-glow border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Investor Breakeven Analysis</CardTitle>
        <CardDescription>
          Shows when investors entering at different N values reach breakeven
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={breakevenData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="entryN"
                label={{ value: 'Entry Point (N)', position: 'insideBottom', offset: -10 }}
                className="text-muted-foreground"
              />
              <YAxis
                label={{ value: 'Breakeven Point (N)', angle: -90, position: 'insideLeft' }}
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => `Entry at N=${value}`}
                    formatter={(value, name) => [
                      name === "breakevenN" ? `Breakeven at N=${value}` : `Entry at N=${value}`,
                      name === "breakevenN" ? "Breakeven" : "Entry"
                    ]}
                  />
                }
              />
              {/* Reference line showing immediate breakeven (y=x) */}
              <ReferenceLine
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                segment={[
                  { x: 191, y: 191 },
                  { x: 999, y: 999 }
                ]}
              />
              {/* Breakeven line */}
              <Line
                type="monotone"
                dataKey="breakevenN"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--chart-1))", r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Earliest Entry (N=191)</span>
            <span className="font-semibold text-lg">
              Breakeven: N={breakevenData[0]?.breakevenN}
            </span>
            <span className="text-muted-foreground text-xs">
              Wait: {breakevenData[0]?.nDifference} mints
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Mid Entry (N=500)</span>
            <span className="font-semibold text-lg">
              Breakeven: N={breakevenData.find(d => d.entryN >= 500)?.breakevenN || 'N/A'}
            </span>
            <span className="text-muted-foreground text-xs">
              Wait: {breakevenData.find(d => d.entryN >= 500)?.nDifference || 0} mints
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Late Entry (N=900)</span>
            <span className="font-semibold text-lg">
              Breakeven: N={breakevenData.find(d => d.entryN >= 900)?.breakevenN || 'N/A'}
            </span>
            <span className="text-muted-foreground text-xs">
              Wait: {breakevenData.find(d => d.entryN >= 900)?.nDifference || 0} mints
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreakevenChart;
