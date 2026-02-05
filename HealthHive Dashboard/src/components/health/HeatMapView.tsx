import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { barangays } from "../../data/mockData";

type HeatMapMetric = 'dm-control' | 'htn-control' | 'screening' | 'missed';

// Categorize barangays by coastal/inland
const coastalBarangays = [
  'Canjulao', 'Lonoy', 'Looc', 'Cantagay', 'Pangdan', 'Can-ipol',
  'Alejawan', 'Calabacita', 'Balili', 'Tubod Bitoon'
];

const inlandBarangays = barangays
  .map(b => b.name)
  .filter(name => !coastalBarangays.includes(name));

export function HeatMapView() {
  const [activeMetric, setActiveMetric] = useState<HeatMapMetric>('htn-control');
  const [hoveredBarangay, setHoveredBarangay] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const metrics = [
    { id: 'htn-control' as HeatMapMetric, label: 'HTN Control', color: '#CD5E31' },
    { id: 'dm-control' as HeatMapMetric, label: 'DM Control', color: '#274492' },
    { id: 'screening' as HeatMapMetric, label: 'Screening', color: '#7C3AED' },
    { id: 'missed' as HeatMapMetric, label: 'Missed Follow-up', color: '#B14F22' },
  ];

  const getMetricValue = (barangay: any): number => {
    if (!barangay) return 0;
    
    switch (activeMetric) {
      case 'htn-control':
        // % controlled HTN patients
        const htnTotal = Math.round(barangay.registered * 0.42); // 42% HTN prevalence
        return htnTotal > 0 ? Math.round(((htnTotal - barangay.uncontrolledHTN) / htnTotal) * 100) : 0;
      case 'dm-control':
        // % controlled DM patients
        const dmTotal = Math.round(barangay.registered * 0.305); // 30.5% DM prevalence
        return dmTotal > 0 ? Math.round(((dmTotal - barangay.uncontrolledDM) / dmTotal) * 100) : 0;
      case 'screening':
        return barangay.screenedPercent || 0;
      case 'missed':
        // % of patients with missed follow-ups
        return barangay.registered > 0 
          ? Math.round((barangay.uncontrolledDM + barangay.uncontrolledHTN) / barangay.registered * 100) 
          : 0;
      default:
        return 0;
    }
  };

  const getHeatColor = (value: number): string => {
    // For missed follow-ups, higher is worse (darker red = more urgent)
    if (activeMetric === 'missed') {
      if (value >= 80) return '#B14F22'; // Darkest red - most urgent
      if (value >= 60) return '#CD5E31'; // Dark orange - urgent
      if (value >= 40) return '#E6B99B'; // Light orange - moderate
      if (value >= 20) return '#FCEFE8'; // Very light - low concern
      return '#F9FAFB'; // Almost white - okay
    }
    
    // For positive metrics (control rates, screening), lower is worse (darker = more urgent)
    // Higher percentages = better = lighter colors
    if (value >= 80) return '#10B981'; // Green - excellent/okay
    if (value >= 60) return '#34D399'; // Light green - good
    if (value >= 40) return '#FCD34D'; // Yellow - needs attention
    if (value >= 20) return '#F97316'; // Orange - urgent
    return '#DC2626'; // Red - most urgent/critical
  };

  const getTextColor = (bgColor: string): string => {
    // Return white text for darker backgrounds, dark text for lighter ones
    const darkColors = ['#B14F22', '#CD5E31', '#274492', '#3F5FF1'];
    return darkColors.includes(bgColor) ? '#FFFFFF' : '#1E1E1E';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  const currentBarangay = hoveredBarangay ? barangays.find(b => b.id === hoveredBarangay) : null;
  const currentValue = currentBarangay ? getMetricValue(currentBarangay) : 0;

  return (
    <Card className="border-[#D4DBDE]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#1E1E1E] text-sm">Jagna Municipality Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Metric toggles - more compact */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded text-xs transition-all h-6 px-2.5 gap-1.5 border ${
                activeMetric === metric.id 
                  ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm" 
                  : "bg-white text-[#1E1E1E] border-[#D4DBDE] hover:bg-[#F9FAFB] hover:border-[#7C3AED]"
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: activeMetric === metric.id ? 'white' : metric.color }}></div>
              {metric.label}
            </button>
          ))}
        </div>

        {/* Heat map grid - more compact */}
        <div className="space-y-3">
          {/* Coastal Barangays */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Badge className="bg-[#7C3AED] text-[10px] h-4 px-1.5">Coastal</Badge>
              <span className="text-[10px] text-[#4D6186]">{coastalBarangays.length} barangays</span>
            </div>
            <div className="relative bg-gradient-to-br from-[#E0E7FF] to-[#F9FAFB] rounded-md border border-[#D4DBDE] p-2">
              <div className="grid grid-cols-5 gap-1.5">
                {barangays
                  .filter(bg => coastalBarangays.includes(bg.name))
                  .map((bg) => {
                    const value = getMetricValue(bg);
                    const bgColor = getHeatColor(value);
                    const textColor = getTextColor(bgColor);
                    
                    return (
                      <div
                        key={bg.id}
                        className="relative rounded cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:z-10 border border-white/50"
                        style={{ 
                          backgroundColor: bgColor,
                          paddingBottom: '100%' // aspect ratio square
                        }}
                        onMouseEnter={() => setHoveredBarangay(bg.id)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoveredBarangay(null)}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                          <span className="text-[8px] text-center leading-tight" style={{ color: textColor }}>
                            {bg.name}
                          </span>
                          <span className="text-[9px] mt-0.5" style={{ color: textColor, fontWeight: 600 }}>
                            {value}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Inland Barangays */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Badge className="bg-[#A78BFA] text-[10px] h-4 px-1.5">Inland</Badge>
              <span className="text-[10px] text-[#4D6186]">{inlandBarangays.length} barangays</span>
            </div>
            <div className="relative bg-gradient-to-br from-[#FEF3C7] to-[#F9FAFB] rounded-md border border-[#D4DBDE] p-2">
              <div className="grid grid-cols-5 gap-1.5">
                {barangays
                  .filter(bg => inlandBarangays.includes(bg.name))
                  .map((bg) => {
                    const value = getMetricValue(bg);
                    const bgColor = getHeatColor(value);
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
                          <span className="text-[9px] mt-0.5" style={{ color: textColor, fontWeight: 600 }}>
                            {value}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Hover tooltip - compact and close to cursor */}
        {hoveredBarangay && currentBarangay && (
          <div 
            className="fixed z-50 bg-white border-2 border-[#7C3AED] rounded-md shadow-xl p-2 pointer-events-none text-xs"
            style={{
              left: `${mousePosition.x + 12}px`,
              top: `${mousePosition.y + 12}px`,
              maxWidth: '180px'
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-[#1E1E1E] truncate pr-1">{currentBarangay.name}</div>
              <Badge className="bg-[#7C3AED] text-[9px] h-3.5 px-1 flex-shrink-0">
                {coastalBarangays.includes(currentBarangay.name) ? 'Coastal' : 'Inland'}
              </Badge>
            </div>
            <div className="text-[#7C3AED] text-lg mb-0.5">
              <strong>{currentValue}%</strong>
            </div>
            <div className="text-[9px] text-[#4D6186] mb-1.5">
              {metrics.find(m => m.id === activeMetric)?.label}
            </div>
            <div className="pt-1.5 border-t border-[#D4DBDE] text-[9px] text-[#4D6186] space-y-0.5">
              <div>Pop: {currentBarangay.population.toLocaleString()}</div>
              <div>Registered: {currentBarangay.registered}</div>
              <div>Screened: {currentBarangay.screenedPercent}%</div>
            </div>
          </div>
        )}

        {/* Legend - compact */}
        <div className="mt-3 bg-white p-2 rounded-md border border-[#D4DBDE]">
          <div className="text-[9px] mb-1.5 text-[#1E1E1E]">
            <strong>{metrics.find(m => m.id === activeMetric)?.label}</strong> Scale
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-[#4D6186]">{activeMetric === 'missed' ? 'Okay' : 'Urgent'}</span>
            <div className="flex gap-0.5 flex-1">
              {activeMetric === 'missed' ? (
                <>
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#F9FAFB' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#FCEFE8' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#E6B99B' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#CD5E31' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#B14F22' }} />
                </>
              ) : (
                <>
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#DC2626' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#F97316' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#FCD34D' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#34D399' }} />
                  <div className="h-3 flex-1 rounded-sm" style={{ backgroundColor: '#10B981' }} />
                </>
              )}
            </div>
            <span className="text-[9px] text-[#4D6186]">{activeMetric === 'missed' ? 'Urgent' : 'Okay'}</span>
          </div>
        </div>

        {/* Summary stats - compact */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <div className="p-1.5 bg-[#F9FAFB] rounded border border-[#D4DBDE]">
            <div className="text-[9px] text-[#4D6186] mb-0.5">Average</div>
            <div className="text-xs text-[#1E1E1E]">
              {Math.round(barangays.reduce((sum, bg) => sum + getMetricValue(bg), 0) / barangays.length)}%
            </div>
          </div>
          <div className="p-1.5 bg-[#F9FAFB] rounded border border-[#D4DBDE]">
            <div className="text-[9px] text-[#4D6186] mb-0.5">Highest</div>
            <div className="text-xs text-[#1E1E1E]">
              {Math.max(...barangays.map(bg => getMetricValue(bg)))}%
            </div>
          </div>
          <div className="p-1.5 bg-[#F9FAFB] rounded border border-[#D4DBDE]">
            <div className="text-[9px] text-[#4D6186] mb-0.5">Lowest</div>
            <div className="text-xs text-[#1E1E1E]">
              {Math.min(...barangays.map(bg => getMetricValue(bg)))}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
