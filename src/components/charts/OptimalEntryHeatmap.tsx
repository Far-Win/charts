import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRealData } from "@/lib/parseRealCSV";
import type { MintData } from "@/lib/chartData";
import { Loader2 } from "lucide-react";

interface HeatmapDataPoint {
  entryN: number;
  confidenceLevel: number;
  roi: number;
  netCost: number;
  poolSize: number;
  mintsNeeded: number;
  profitLoss: number;
}

const WHITE_PROBABILITY = 1 / 256;
const CAUSE_FEE = 0.2;

// Calculate sum of mint prices from entry point for K mints
const calculateMintPriceSum = (
  entryN: number,
  numMints: number,
  data: MintData[]
): number => {
  let sum = 0;
  const startIndex = data.findIndex(d => d.n >= entryN);
  
  if (startIndex === -1) return 0;
  
  for (let i = 0; i < numMints && startIndex + i < data.length; i++) {
    sum += data[startIndex + i].mintPrice;
  }
  
  return sum;
};

// Calculate ROI for a given entry point and confidence level
const calculateROI = (
  entryN: number,
  confidenceLevel: number,
  data: MintData[]
): HeatmapDataPoint | null => {
  const entryData = data.find(d => d.n === entryN);
  if (!entryData) return null;
  
  const poolSize = entryData.poolSize;
  
  // Calculate mints needed: K = ln(1 - confidence) / ln(1 - p)
  const mintsNeeded = Math.ceil(
    Math.log(1 - confidenceLevel) / Math.log(1 - WHITE_PROBABILITY)
  );
  
  // Calculate total mint prices needed
  const totalMintPrices = calculateMintPriceSum(entryN, mintsNeeded, data);
  
  // Net cost is 20% of total mint prices (the cause fee)
  const netCost = totalMintPrices * CAUSE_FEE;
  
  // Profit/Loss
  const profitLoss = poolSize - netCost;
  
  // ROI as percentage
  const roi = netCost > 0 ? (profitLoss / netCost) * 100 : 0;
  
  return {
    entryN,
    confidenceLevel,
    roi,
    netCost,
    poolSize,
    mintsNeeded,
    profitLoss,
  };
};

const getColorForROI = (roi: number): string => {
  if (roi < -50) return 'hsl(0, 70%, 35%)';      // Deep red
  if (roi < -20) return 'hsl(0, 70%, 50%)';      // Red
  if (roi < 0) return 'hsl(30, 90%, 55%)';       // Orange
  if (roi < 20) return 'hsl(55, 90%, 70%)';      // Light yellow
  if (roi < 50) return 'hsl(120, 50%, 70%)';     // Light green
  if (roi < 100) return 'hsl(120, 60%, 45%)';    // Green
  return 'hsl(120, 70%, 30%)';                   // Dark green
};

export const OptimalEntryHeatmap = () => {
  const [data, setData] = useState<MintData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getRealData();
        setData(result.mintingData);
      } catch (error) {
        console.error("Failed to load minting data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    if (data.length === 0) return [];

    // Sample entry points every 10 mints starting from N=40
    const entryPoints: number[] = [];
    const maxN = data[data.length - 1]?.n || 999;
    for (let n = 40; n <= maxN; n += 10) {
      if (data.find(d => d.n === n)) {
        entryPoints.push(n);
      }
    }

    // Confidence levels from 50% to 99%
    const confidenceLevels = [0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95, 0.99];

    const points: HeatmapDataPoint[] = [];
    
    entryPoints.forEach(entryN => {
      confidenceLevels.forEach(confidence => {
        const point = calculateROI(entryN, confidence, data);
        if (point) {
          points.push(point);
        }
      });
    });

    return points;
  }, [data]);

  // Grid dimensions - optimized for single screen width
  const cellWidth = 24;
  const cellHeight = 26;
  const marginLeft = 70;
  const marginTop = 40;
  const marginBottom = 35;
  const marginRight = 80;

  const entryPoints = useMemo(() => 
    [...new Set(heatmapData.map(d => d.entryN))].sort((a, b) => a - b),
    [heatmapData]
  );
  
  const confidenceLevels = useMemo(() => 
    [...new Set(heatmapData.map(d => d.confidenceLevel))].sort((a, b) => b - a),
    [heatmapData]
  );

  const svgWidth = entryPoints.length * cellWidth + marginLeft + marginRight;
  const svgHeight = confidenceLevels.length * cellHeight + marginTop + marginBottom;

  const getXPosition = (entryN: number) => {
    const index = entryPoints.indexOf(entryN);
    return marginLeft + index * cellWidth;
  };

  const getYPosition = (confidence: number) => {
    const index = confidenceLevels.indexOf(confidence);
    return marginTop + index * cellHeight;
  };

  const formatETH = (value: number) => `${value.toFixed(4)} ETH`;
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimal Entry Point Finder</CardTitle>
        <CardDescription>
          ROI % heatmap across entry points and win probabilities. Hover over cells for details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full flex justify-center">
          <svg 
            width={svgWidth} 
            height={svgHeight}
            className="mx-auto"
            onMouseMove={handleMouseMove}
          >
            {/* Grid cells */}
            {heatmapData.map((point) => (
              <rect
                key={`${point.entryN}-${point.confidenceLevel}`}
                x={getXPosition(point.entryN)}
                y={getYPosition(point.confidenceLevel)}
                width={cellWidth}
                height={cellHeight}
                fill={getColorForROI(point.roi)}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                onMouseEnter={() => setHoveredCell(point)}
                onMouseLeave={() => setHoveredCell(null)}
                className="transition-opacity hover:opacity-80 cursor-pointer"
              />
            ))}

            {/* X-axis labels (Entry Points) */}
            {entryPoints.map((entryN, i) => (
              i % 2 === 0 && (
                <text
                  key={`x-${entryN}`}
                  x={getXPosition(entryN) + cellWidth / 2}
                  y={svgHeight - marginBottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {entryN}
                </text>
              )
            ))}
            <text
              x={svgWidth / 2}
              y={svgHeight - 5}
              textAnchor="middle"
              className="text-sm fill-foreground font-medium"
            >
              Entry Point (Mint N)
            </text>

            {/* Y-axis labels (Confidence Levels) */}
            {confidenceLevels.map((confidence) => (
              <text
                key={`y-${confidence}`}
                x={marginLeft - 10}
                y={getYPosition(confidence) + cellHeight / 2 + 4}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                {(confidence * 100).toFixed(0)}%
              </text>
            ))}
            <text
              x={20}
              y={svgHeight / 2}
              textAnchor="middle"
              className="text-sm fill-foreground font-medium"
              transform={`rotate(-90, 20, ${svgHeight / 2})`}
            >
              Win Probability (%)
            </text>

            {/* Color legend */}
            <g transform={`translate(${svgWidth - marginRight + 20}, ${marginTop})`}>
              <text className="text-xs fill-foreground font-medium" y={-10}>ROI %</text>
              {[
                { roi: 100, label: '>100%' },
                { roi: 75, label: '75%' },
                { roi: 50, label: '50%' },
                { roi: 20, label: '20%' },
                { roi: 0, label: '0%' },
                { roi: -20, label: '-20%' },
                { roi: -50, label: '<-50%' },
              ].map((item, i) => (
                <g key={item.roi} transform={`translate(0, ${i * 25})`}>
                  <rect
                    width={20}
                    height={20}
                    fill={getColorForROI(item.roi)}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                  />
                  <text x={25} y={15} className="text-xs fill-muted-foreground">
                    {item.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>

          {/* Tooltip */}
          {hoveredCell && (
            <div
              className="fixed z-50 bg-popover text-popover-foreground rounded-md border shadow-md p-3 text-sm pointer-events-none"
              style={{
                left: mousePos.x + 15,
                top: mousePos.y + 15,
              }}
            >
              <div className="space-y-1">
                <div className="font-semibold border-b pb-1 mb-1">
                  Entry Point: N={hoveredCell.entryN}
                </div>
                <div>Confidence: {(hoveredCell.confidenceLevel * 100).toFixed(0)}%</div>
                <div className={hoveredCell.roi >= 0 ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                  ROI: {formatPercent(hoveredCell.roi)}
                </div>
                <div className={hoveredCell.profitLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  Profit: {formatETH(hoveredCell.profitLoss)}
                </div>
                <div className="text-muted-foreground text-xs border-t pt-1 mt-1">
                  <div>Pool Size: {formatETH(hoveredCell.poolSize)}</div>
                  <div>Net Cost: {formatETH(hoveredCell.netCost)}</div>
                  <div>Mints Required: {hoveredCell.mintsNeeded}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
