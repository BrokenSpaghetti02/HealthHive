import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconColor: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon: Icon,
  iconColor 
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-slate-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon size={20} className="text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-slate-900">{value}</div>
        <p className={`text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
