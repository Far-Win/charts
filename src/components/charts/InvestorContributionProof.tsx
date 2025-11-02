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
  ReferenceLine,
  Label,
} from "recharts";
import { getRealData } from "@/lib/parseRealCSV";
import { getBreakevenPoints } from "@/lib/parseBreakevenFromCSV";
import {
  analyzeInvestorContribution,
  generateScenarioAnalysis,
  InvestorContributionAnalysis,
} from "@/lib/investorVsNonInvestorAnalysis";
import { TrendingUp, Users, Calculator } from "lucide-react";

export const InvestorContributionProof = () => {
  const [analysis, setAnalysis] = useState<InvestorContributionAnalysis | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { mintingData } = await getRealData();
      const breakevenPoints = await getBreakevenPoints();

      const mainAnalysis = analyzeInvestorContribution(mintingData, breakevenPoints);
      const scenarioData = generateScenarioAnalysis(mintingData, breakevenPoints);

      setAnalysis(mainAnalysis);
      setScenarios(scenarioData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investor Contribution Analysis</CardTitle>
          <CardDescription>Loading mathematical proof...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  // Data for main comparison chart
  const comparisonData = [
    {
      category: "Non-Investors (Pool)",
      contribution: analysis.poolAtEntry,
      percentage: analysis.nonInvestorPercentage,
      period: `N=1 to N=${analysis.entryN - 1}`,
    },
    {
      category: "Investor",
      contribution: analysis.investorCauseContribution,
      percentage: analysis.investorPercentage,
      period: `N=${analysis.entryN} to N=${analysis.breakevenN}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Proof Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Mathematical Proof: Investors Fund Exactly 50% at Breakeven
          </CardTitle>
          <CardDescription>
            At breakeven, an investor's cause contribution equals the pool they win, resulting in exactly 50% of total cause funding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metric Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Cause Funding</div>
              <div className="text-2xl font-bold">{analysis.totalCauseFundingAtBreakeven.toFixed(4)} ETH</div>
              <div className="text-xs text-muted-foreground mt-1">At breakeven N={analysis.breakevenN}</div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Investor Contribution
              </div>
              <div className="text-2xl font-bold text-primary">
                {analysis.investorPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analysis.investorCauseContribution.toFixed(4)} ETH
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Pool at Entry (Non-Investors)
              </div>
              <div className="text-2xl font-bold">
                {analysis.nonInvestorPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analysis.poolAtEntry.toFixed(4)} ETH
              </div>
            </div>
          </div>

          {/* Visual Comparison */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="category"
                label={{ value: "Contributor Type", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                label={{ value: "Percentage of Total Cause Funding", angle: -90, position: "insideLeft" }}
              />
              <ReferenceLine y={50} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeWidth={2}>
                <Label value="50% Threshold" position="right" fill="hsl(var(--destructive))" />
              </ReferenceLine>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-1">{data.category}</p>
                        <p className="text-sm text-muted-foreground">{data.period}</p>
                        <p className="text-sm font-semibold text-primary mt-2">
                          {data.percentage.toFixed(2)}% of total
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.contribution.toFixed(4)} ETH contributed
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 1 ? "hsl(var(--chart-1))" : "hsl(var(--chart-5))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Mathematical Explanation */}
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-3">
            <p className="font-medium text-foreground">
              Mathematical Proof (Entry N={analysis.entryN}):
            </p>
            
            <div className="space-y-2 font-mono text-sm">
              <p>
                <strong>Pool at Entry:</strong> {analysis.poolAtEntry.toFixed(4)} ETH<br />
                <span className="text-xs">(Sum of 20% of all mint prices from N=1 to N={analysis.entryN - 1})</span>
              </p>
              
              <p>
                <strong>Investor's Cause Contribution:</strong> {analysis.investorCauseContribution.toFixed(4)} ETH<br />
                <span className="text-xs">(20% of mint prices from N={analysis.entryN} to N={analysis.breakevenN}, total {analysis.mintCount} mints)</span>
              </p>
              
              <p>
                <strong>At Breakeven:</strong><br />
                Investor Profit = Pool - Cause Contribution = 0<br />
                Therefore: Pool = Cause Contribution<br />
                {analysis.poolAtEntry.toFixed(4)} ETH ≈ {analysis.investorCauseContribution.toFixed(4)} ETH ✓
              </p>
              
              <p className="text-foreground">
                <strong>Total Cause Funding:</strong><br />
                = Pool + Investor Contribution<br />
                = {analysis.poolAtEntry.toFixed(4)} + {analysis.investorCauseContribution.toFixed(4)}<br />
                = {analysis.totalCauseFundingAtBreakeven.toFixed(4)} ETH
              </p>
              
              <p className="text-primary font-bold">
                <strong>Investor Percentage:</strong><br />
                = {analysis.investorCauseContribution.toFixed(4)} / {analysis.totalCauseFundingAtBreakeven.toFixed(4)}<br />
                = {analysis.investorPercentage.toFixed(1)}% (exactly 50% at breakeven)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Consistency Across Entry Points
          </CardTitle>
          <CardDescription>
            All investors contribute exactly 50% at their breakeven point, regardless of entry timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scenarios} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                domain={[45, 55]}
                label={{ 
                  value: 'Investor Contribution %', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(2)}%`}
                labelFormatter={(label) => `Entry: ${label}`}
              />
              <ReferenceLine y={50} stroke="hsl(var(--primary))" strokeDasharray="3 3">
                <Label value="50% (Theoretical)" position="right" />
              </ReferenceLine>
              <Bar dataKey="investorPercentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="text-sm text-muted-foreground space-y-2 mt-4">
            <p>
              <strong>Mathematical Certainty:</strong> At breakeven, every investor's cause contribution equals 
              the pool they win. This is the definition of breakeven: Profit = Pool - Cost = 0.
            </p>
            <p>
              Since Total Cause Funding = Pool (non-investors) + Investor Contribution, and Pool = Investor Contribution 
              at breakeven, the ratio is always{' '}
              <span className="font-semibold text-foreground">exactly 50% / 50%</span>.
            </p>
            <p className="text-xs">
              Note: Small variations from 50.0% in the data are due to rounding and the discrete nature of the mints.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
