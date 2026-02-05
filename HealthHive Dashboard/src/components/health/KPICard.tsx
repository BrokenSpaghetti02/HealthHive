import { Card, CardContent } from "../ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  sparklineData?: number[];
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
}

export function KPICard({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon,
  sparklineData,
  subtitle,
  trend
}: KPICardProps) {
  // Use trend prop if provided, otherwise fall back to change/isPositive
  const showTrend = trend || (change ? { value: parseFloat(change), isPositive: isPositive ?? true } : null);
  
  return (
    <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-[#4D6186] text-xs mb-0.5">{title}</p>
            <div className="text-2xl text-[#1E1E1E] mb-0.5">{value}</div>
            {subtitle && (
              <p className="text-[#4D6186] text-[10px] mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="p-1.5 rounded-md bg-[#F3F0FF]">
            {icon}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {showTrend && (
            <div className={`flex items-center gap-0.5 text-xs ${showTrend.isPositive ? 'text-[#7C3AED]' : 'text-[#CD5E31]'}`}>
              {showTrend.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{showTrend.value}%</span>
            </div>
          )}
          
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-6 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.map((val, idx) => ({ value: val, index: idx }))}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#7C3AED" 
                    strokeWidth={1.5} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
