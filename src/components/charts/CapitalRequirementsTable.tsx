import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRealData } from "@/lib/parseRealCSV";
import { generateRiskAnalysis, type RiskAnalysis } from "@/lib/investorAnalysis";
import { Loader2 } from "lucide-react";

const CapitalRequirementsTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [riskData, setRiskData] = useState<RiskAnalysis[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRealData();
      const entryPoints = Array.from({ length: 21 }, (_, i) => 11 + i * 20);
      const analysis = generateRiskAnalysis(data.mintingData, entryPoints);
      setRiskData(analysis);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capital Requirements by Entry Point</CardTitle>
        <CardDescription>
          Full mint price capital needed for different confidence levels (assumes unlimited games to average out risk)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Entry N</TableHead>
                <TableHead className="text-right">Pool Size</TableHead>
                <TableHead className="text-right">Expected Profit</TableHead>
                <TableHead className="text-right">50% Capital</TableHead>
                <TableHead className="text-right">90% Capital</TableHead>
                <TableHead className="text-right">99% Capital</TableHead>
                <TableHead className="text-right">ROI (90%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskData.map((risk) => {
                const roi90 = ((risk.poolSizeAtEntry - risk.percentile90Capital * 0.2) / (risk.percentile90Capital * 0.2)) * 100;
                
                return (
                  <TableRow key={risk.entryN}>
                    <TableCell className="font-medium">{risk.entryN}</TableCell>
                    <TableCell className="text-right">{formatCurrency(risk.poolSizeAtEntry)}</TableCell>
                    <TableCell className={`text-right font-medium ${risk.expectedProfit > 0 ? 'text-chart-4' : 'text-destructive'}`}>
                      {formatCurrency(risk.expectedProfit)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(risk.percentile50Capital)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(risk.percentile90Capital)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(risk.percentile99Capital)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${roi90 > 0 ? 'text-chart-4' : 'text-destructive'}`}>
                      {roi90.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground space-y-1">
          <p>• <strong>Expected Profit:</strong> Pool Size - (256 mints × 20% fee)</p>
          <p>• <strong>90% Capital:</strong> Total mint prices needed to have 90% chance of winning (589 mints)</p>
          <p>• <strong>ROI (90%):</strong> Return on investment if you deploy 90th percentile capital</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CapitalRequirementsTable;
