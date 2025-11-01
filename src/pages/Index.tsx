import { TrendingUp, Coins, Percent, DollarSign } from "lucide-react";
import TrendChart from "@/components/charts/TrendChart";
import ProbabilityChart from "@/components/charts/ProbabilityChart";
import ContributionChart from "@/components/charts/ContributionChart";
import StatsCard from "@/components/charts/StatsCard";
import { mintingData, fullMintingData } from "@/lib/chartData";

const Index = () => {
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
          <ProbabilityChart />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <ContributionChart />
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
