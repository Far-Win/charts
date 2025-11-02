import { useState, useEffect } from "react";
import { TrendingUp, Coins, Percent, DollarSign } from "lucide-react";
import TrendChart from "@/components/charts/TrendChart";
import PoolSizeChart from "@/components/charts/PoolSizeChart";
import ProbabilityChart from "@/components/charts/ProbabilityChart";
import ContributionChart from "@/components/charts/ContributionChart";
import BreakevenChart from "@/components/charts/BreakevenChart";
import BreakevenPointChart from "@/components/charts/BreakevenPointChart";
import ProfitableDurationChart from "@/components/charts/ProfitableDurationChart";
import ExpectedValueCalculator from "@/components/charts/ExpectedValueCalculator";
import RiskAnalysisChart from "@/components/charts/RiskAnalysisChart";
import CapitalRequirementsTable from "@/components/charts/CapitalRequirementsTable";
import BreakevenCalculator from "@/components/charts/BreakevenCalculator";
import { OptimalEntryHeatmap } from "@/components/charts/OptimalEntryHeatmap";
import { CauseFundingAttributionChart } from "@/components/charts/CauseFundingAttributionChart";
import { ExpectedCauseFundingChart } from "@/components/charts/ExpectedCauseFundingChart";
import StatsCard from "@/components/charts/StatsCard";
import { getRealData } from "@/lib/parseRealCSV";
import type { MintData } from "@/lib/chartData";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fullMintingData, setFullMintingData] = useState<MintData[]>([]);
  const [entry113Percentage, setEntry113Percentage] = useState<number | null>(null);
  const [entry131Percentage, setEntry131Percentage] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getRealData();
      setFullMintingData(data.mintingData);
      
      // Calculate specific scenario: Entry at N=113, win at N=256
      const CAUSE_FEE = 0.2;
      const entryN = 113;
      const winN = 256;
      
      // Calculate cause contribution from entry to win
      const causeContribution = data.mintingData
        .filter(d => d.n >= entryN && d.n <= winN)
        .reduce((sum, d) => sum + d.mintPrice * CAUSE_FEE, 0);
      
      // Calculate total cause funding
      const totalCauseFunding = data.mintingData
        .reduce((sum, d) => sum + d.contributionToCause, 0);
      
      const percentage113 = totalCauseFunding > 0 
        ? (causeContribution / totalCauseFunding) * 100 
        : 0;
      
      setEntry113Percentage(percentage113);
      
      // For N=131, keep the original calculation
      const { getBreakevenPoints } = await import("@/lib/parseBreakevenFromCSV");
      const { calculateCauseFundingByEntryPoint } = await import("@/lib/causeFundingAttribution");
      const breakevenPoints = await getBreakevenPoints();
      const causeFunding = calculateCauseFundingByEntryPoint(data.mintingData, breakevenPoints);
      
      const entry131 = causeFunding.find(cf => cf.entryN === 131);
      if (entry131) {
        setEntry131Percentage(entry131.percentage);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  if (isLoading || fullMintingData.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading minting data...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics from full dataset
  const lastEntry = fullMintingData[fullMintingData.length - 1];
  const firstEntry = fullMintingData[0];
  const avgProbability = (fullMintingData.reduce((sum, item) => sum + item.binomialProbability, 0) / fullMintingData.length).toFixed(4);
  const totalPoolSize = lastEntry.poolSize.toFixed(2);
  const priceIncrease = (((lastEntry.mintPrice - firstEntry.mintPrice) / firstEntry.mintPrice) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
            Minting Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive visualization of minting data, pool contributions, and probability distributions
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Key Entry Point Statistics */}
        <div className="mb-8 p-6 bg-card border border-border rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">🎯 Key Entry Point Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entry113Percentage !== null && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Entry at N=113, Win at N=256</p>
                <p className="text-3xl font-bold text-primary">{entry113Percentage.toFixed(4)}%</p>
                <p className="text-xs text-muted-foreground mt-1">of total cause funding</p>
              </div>
            )}
            {entry131Percentage !== null && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Entry at N=131 (Breakeven)</p>
                <p className="text-3xl font-bold text-primary">{entry131Percentage.toFixed(4)}%</p>
                <p className="text-xs text-muted-foreground mt-1">of total cause funding</p>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Percentage of total cause funding contributed when investor enters at specified N and wins at breakeven point
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Current Mint Price"
            value={`${lastEntry.mintPrice.toFixed(6)}`}
            subtitle="Latest mint price"
            icon={DollarSign}
            trend={`+${priceIncrease}% from start`}
          />
          <StatsCard
            title="Total Pool Size"
            value={totalPoolSize}
            subtitle="Cumulative pool"
            icon={Coins}
            trend="Growing steadily"
          />
          <StatsCard
            title="Avg Probability"
            value={avgProbability}
            subtitle="Mean binomial probability"
            icon={Percent}
          />
          <StatsCard
            title="Total Mints"
            value="999"
            subtitle="Complete dataset"
            icon={TrendingUp}
            trend="All rows visualized"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TrendChart />
          <PoolSizeChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ProbabilityChart />
          <ContributionChart />
        </div>

        <div className="grid grid-cols-1 gap-8 mt-8">
          <BreakevenChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <BreakevenPointChart />
          <ProfitableDurationChart />
        </div>

        {/* Risk Analysis Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-2">📊 Investor Risk Analysis</h2>
          <p className="text-muted-foreground mb-8">
            Expected value calculations and capital requirements for different entry points (assumes 1/256 white probability and unlimited games)
          </p>
          
          <div className="space-y-8">
            <OptimalEntryHeatmap />
            <CauseFundingAttributionChart />
            <ExpectedCauseFundingChart />
            <BreakevenCalculator />
            <ExpectedValueCalculator />
            <RiskAnalysisChart />
            <CapitalRequirementsTable />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Data Analytics Dashboard • 999 rows visualized • Sampled for optimal performance
        </div>
      </footer>
    </div>
  );
};

export default Index;
