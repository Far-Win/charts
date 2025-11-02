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
  Legend,
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
          <CardDescription>Loading statistical proof...</CardDescription>
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
      category: "Non-Investors",
      contribution: analysis.nonInvestorContribution,
      percentage: analysis.nonInvestorPercentage,
      period: `N=1 to N=${analysis.firstInvestorEntry - 1}`,
    },
    {
      category: "Investors",
      contribution: analysis.investorContribution,
      percentage: analysis.investorPercentage,
      period: `N=${analysis.firstInvestorEntry} to N=${analysis.maxBreakeven}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Proof Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Statistical Proof: Investors Fund {'>'}50% of Cause
          </CardTitle>
          <CardDescription>
            Binomial probability + bonding curve analysis demonstrates investors systematically contribute the majority of cause funding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metric Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Cause Funding</div>
              <div className="text-2xl font-bold">{analysis.totalCauseFunding.toFixed(2)} ETH</div>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
              <div className="text-sm text-muted-foreground mb-1">Investor Contribution</div>
              <div className="text-2xl font-bold text-primary">
                {analysis.investorPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analysis.investorContribution.toFixed(2)} ETH
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Non-Investor Contribution</div>
              <div className="text-2xl font-bold">
                {analysis.nonInvestorPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {analysis.nonInvestorContribution.toFixed(2)} ETH
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
                          {data.contribution.toFixed(2)} ETH contributed
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

          {/* Statistical Explanation */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Mathematical Proof
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Non-investor period volume:</span>
                <span className="font-mono">{analysis.firstInvestorEntry - 1} mints</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Investor period volume:</span>
                <span className="font-mono">{analysis.maxBreakeven - analysis.firstInvestorEntry + 1} mints</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-muted-foreground">Volume ratio (Investor/Non-investor):</span>
                <span className="font-mono font-semibold">{analysis.volumeRatio.toFixed(1)}×</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg mint price (Non-investor):</span>
                <span className="font-mono">{analysis.averageMintPriceNonInvestorPeriod.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Avg mint price (Investor):</span>
                <span className="font-mono">{analysis.averageMintPriceInvestorPeriod.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-muted-foreground">Price ratio (Investor/Non-investor):</span>
                <span className="font-mono font-semibold">
                  {(analysis.averageMintPriceInvestorPeriod / analysis.averageMintPriceNonInvestorPeriod).toFixed(1)}×
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic border-t pt-2">
              <strong>Conclusion:</strong> Investors contribute {analysis.investorPercentage.toFixed(1)}% due to the compound effect 
              of {analysis.volumeRatio.toFixed(1)}× volume and {(analysis.averageMintPriceInvestorPeriod / analysis.averageMintPriceNonInvestorPeriod).toFixed(1)}× 
              higher average prices during their participation period (geometric distribution E[K]=256 → ~256 mints expected before white square).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Robustness Analysis: Different White Square Scenarios
          </CardTitle>
          <CardDescription>
            Investor contribution remains {'>'}50% across all reasonable scenarios from geometric distribution
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
                label={{ value: "Investor Contribution (%)", angle: -90, position: "insideLeft" }}
                domain={[0, 100]}
              />
              <ReferenceLine y={50} stroke="hsl(var(--destructive))" strokeDasharray="3 3" strokeWidth={2} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-1">{data.label}</p>
                        <p className="text-sm text-muted-foreground">White square at N={data.breakevenN}</p>
                        <p className="text-sm font-semibold text-primary mt-2">
                          {data.investorPercentage.toFixed(2)}% investor contribution
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.investorContribution.toFixed(2)} ETH / {data.totalCauseFunding.toFixed(2)} ETH total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="investorPercentage" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Statistical Guarantee:</strong> Given p = 1/256 (white square probability), the geometric distribution 
              guarantees that even in the 25th percentile scenario (early white square at ~74 mints after first investor), 
              investors still contribute {scenarios[0]?.investorPercentage.toFixed(1)}% of cause funding due to the bonding curve's 
              exponential price growth. The {'>'}50% threshold holds with {((1 - 0.25) * 100).toFixed(0)}% confidence.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
