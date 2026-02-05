import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export function PriorityHeatMap({ barangays }: { barangays: any[] }) {
  const [hoveredBarangay, setHoveredBarangay] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate visit priority for each barangay
  const getVisitPriority = (bg: any) => {
    const totalUncontrolled = bg.uncontrolledDM + bg.uncontrolledHTN;
    const controlRate = bg.registered > 0 
      ? ((bg.registered - totalUncontrolled) / bg.registered) * 100 
      : 100;
    
    // Days since last clinic
    const clinicDate = bg.lastClinicDate ? new Date(bg.lastClinicDate) : new Date();
    const daysSinceClinic = Math.floor(
      (new Date().getTime() - clinicDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Priority score (lower is more urgent)
    const priorityScore = controlRate - (daysSinceClinic * 0.5);
    
    if (priorityScore < 40) return { level: 'Urgent', color: '#DC2626', score: priorityScore };
    if (priorityScore < 55) return { level: 'High', color: '#F97316', score: priorityScore };
    if (priorityScore < 70) return { level: 'Moderate', color: '#FCD34D', score: priorityScore };
    return { level: 'Routine', color: '#10B981', score: priorityScore };
  };

  const getTextColor = (bgColor: string): string => {
    const darkColors = ['#DC2626', '#F97316', '#B14F22', '#CD5E31'];
    return darkColors.includes(bgColor) ? '#FFFFFF' : '#1E1E1E';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Group and sort barangays by priority
  const barangaysWithPriority = barangays.map(bg => ({
    ...bg,
    priority: getVisitPriority(bg)
  })).sort((a, b) => a.priority.score - b.priority.score);

  const currentBarangay = hoveredBarangay 
    ? barangaysWithPriority.find(b => b.id === hoveredBarangay) 
    : null;

  // Count by priority
  const priorityCounts = barangaysWithPriority.reduce((acc, bg) => {
    acc[bg.priority.level] = (acc[bg.priority.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="border-[#D4DBDE]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#1E1E1E] text-sm">Visit Priority Map - All Barangays</CardTitle>
          <div className="flex gap-1.5">
            <Badge className="bg-[#DC2626] text-[10px] h-4 px-1.5">{priorityCounts['Urgent'] || 0} Urgent</Badge>
            <Badge className="bg-[#F97316] text-[10px] h-4 px-1.5">{priorityCounts['High'] || 0} High</Badge>
            <Badge className="bg-[#FCD34D] text-[#1E1E1E] text-[10px] h-4 px-1.5">{priorityCounts['Moderate'] || 0} Moderate</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-2 mb-3">
          <p className="text-[10px] text-[#1E1E1E]">
            <strong>Priority based on:</strong> Control rates + days since last clinic visit. Darker colors indicate more urgent need for mobile clinic deployment.
          </p>
        </div>

        {/* Priority heat map grid */}
        <div className="bg-gradient-to-br from-[#F9FAFB] to-[#E0E7FF] rounded-md border border-[#D4DBDE] p-2">
          <div className="grid grid-cols-6 gap-1.5">
            {barangaysWithPriority.map((bg) => {
              const bgColor = bg.priority.color;
              const textColor = getTextColor(bgColor);
              
              return (
                <div
                  key={bg.id}
                  className="relative rounded cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:z-10 border border-white/50"
                  style={{ 
                    backgroundColor: bgColor,
                    paddingBottom: '100%'
                  }}
                  onMouseEnter={() => setHoveredBarangay(bg.id)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredBarangay(null)}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                    <span className="text-[8px] text-center leading-tight" style={{ color: textColor }}>
                      {bg.name}
                    </span>
                    <span className="text-[7px] mt-0.5" style={{ color: textColor, opacity: 0.9 }}>
                      {bg.uncontrolledDM + bg.uncontrolledHTN}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hover tooltip */}
        {hoveredBarangay && currentBarangay && (
          <div 
            className="fixed z-50 bg-white border-2 border-[#7C3AED] rounded-md shadow-xl p-2 pointer-events-none text-xs"
            style={{
              left: `${mousePosition.x + 12}px`,
              top: `${mousePosition.y + 12}px`,
              maxWidth: '200px'
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-[#1E1E1E] truncate pr-1">{currentBarangay.name}</div>
              <Badge 
                className="text-[9px] h-3.5 px-1 flex-shrink-0"
                style={{ backgroundColor: currentBarangay.priority.color }}
              >
                {currentBarangay.priority.level}
              </Badge>
            </div>
            <div className="space-y-1 text-[9px] text-[#4D6186]">
              <div className="flex justify-between">
                <span>Uncontrolled:</span>
                <strong className="text-[#1E1E1E]">{currentBarangay.uncontrolledDM + currentBarangay.uncontrolledHTN}</strong>
              </div>
              <div className="flex justify-between">
                <span>HTN:</span>
                <span className="text-[#CD5E31]">{currentBarangay.uncontrolledHTN}</span>
              </div>
              <div className="flex justify-between">
                <span>DM:</span>
                <span className="text-[#274492]">{currentBarangay.uncontrolledDM}</span>
              </div>
              <div className="flex justify-between">
                <span>Last clinic:</span>
                <span>{new Date(currentBarangay.lastClinicDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Population:</span>
                <span>{currentBarangay.population.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#DC2626' }} />
            <span className="text-[9px] text-[#4D6186]">Urgent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#F97316' }} />
            <span className="text-[9px] text-[#4D6186]">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FCD34D' }} />
            <span className="text-[9px] text-[#4D6186]">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10B981' }} />
            <span className="text-[9px] text-[#4D6186]">Routine</span>
          </div>
        </div>

        {/* Top 5 Priority Barangays */}
        <div className="mt-3 bg-white border border-[#D4DBDE] rounded-md p-2">
          <div className="text-[10px] text-[#1E1E1E] mb-2">
            <strong>Top 5 Priority Areas</strong>
          </div>
          <div className="space-y-1.5">
            {barangaysWithPriority.slice(0, 5).map((bg, idx) => (
              <div key={bg.id} className="flex items-center justify-between p-1.5 bg-[#F9FAFB] rounded">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white" style={{ backgroundColor: bg.priority.color }}>
                    {idx + 1}
                  </div>
                  <span className="text-[10px] text-[#1E1E1E]">{bg.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-[#CD5E31]">{bg.uncontrolledHTN} HTN</span>
                  <span className="text-[#274492]">{bg.uncontrolledDM} DM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
