import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { barangays } from "../../data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Upload, Table as TableIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

type MapLayer = 'dm-control' | 'htn-control' | 'screening' | 'missed';

const colorRamps = {
  sequential: ['#EAF0F6', '#D4DBDE', '#92A4C1', '#4D6186', '#274492'],
  diverging: {
    low: ['#EAF0F6', '#D4DBDE', '#92A4C1'],
    high: ['#FCEFE8', '#E6B99B', '#CD5E31', '#B14F22']
  }
};

export function MapView() {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('dm-control');
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  const layers = [
    { id: 'dm-control' as MapLayer, label: 'Control Rate DM', color: '#274492' },
    { id: 'htn-control' as MapLayer, label: 'Control Rate HTN', color: '#3F5FF1' },
    { id: 'screening' as MapLayer, label: 'Screening Coverage', color: '#4D6186' },
    { id: 'missed' as MapLayer, label: 'Missed Follow-ups', color: '#CD5E31' },
  ];

  const getBarangayColor = (barangay: any) => {
    // Handle undefined or null barangay
    if (!barangay) return colorRamps.sequential[2]; // Default to middle color
    
    let value = 0;
    switch (activeLayer) {
      case 'dm-control':
        value = barangay.registered > 0 ? ((barangay.registered - barangay.uncontrolledDM) / barangay.registered) * 100 : 0;
        break;
      case 'htn-control':
        value = barangay.registered > 0 ? ((barangay.registered - barangay.uncontrolledHTN) / barangay.registered) * 100 : 0;
        break;
      case 'screening':
        value = barangay.screenedPercent || 0;
        break;
      case 'missed':
        value = barangay.registered > 0 ? (barangay.uncontrolledDM + barangay.uncontrolledHTN) / barangay.registered * 100 : 0;
        break;
    }

    // Map value to color ramp (0-100 scale)
    if (value < 20) return colorRamps.sequential[0];
    if (value < 40) return colorRamps.sequential[1];
    if (value < 60) return colorRamps.sequential[2];
    if (value < 80) return colorRamps.sequential[3];
    return colorRamps.sequential[4];
  };

  const selected = selectedBarangay ? barangays.find(b => b.id === selectedBarangay) : null;

  // Helper function to safely get barangay by name
  const getBarangay = (name: string) => {
    return barangays.find(b => b.name === name) || barangays[0]; // Fallback to first barangay if not found
  };

  const sparklineData = [65, 68, 72, 70, 75, 78].map((val, idx) => ({ value: val, index: idx }));

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#1E1E1E] text-[12px]">Jagna Municipality Choropleth Map</CardTitle>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="gap-1.5 h-6 px-2.5 text-xs">
                <Upload size={12} />
                Import GeoJSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 h-6 px-2.5 text-xs"
                onClick={() => setShowDataTable(true)}
              >
                <TableIcon size={12} />
                View Data Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Layer toggles */}
          <div className="flex gap-1.5 mb-4">
            {layers.map(layer => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded border transition-colors h-5 px-2 gap-1 ${
                  activeLayer === layer.id 
                    ? "bg-[#274492] text-white border-[#274492] hover:bg-[#3F5FF1] hover:border-[#3F5FF1]" 
                    : "bg-white text-[#1E1E1E] border-[#D4DBDE] hover:bg-[#F9FAFB]"
                }`}
                style={{ fontSize: '11px' }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }}></div>
                {layer.label}
              </button>
            ))}
          </div>

          {/* Map container */}
          <div className="relative bg-gradient-to-br from-[#FFF9E6] to-[#F0EFE3] rounded-lg border border-[#D4DBDE] overflow-hidden">
            {/* SVG Map with geographic barangay polygons */}
            <svg className="w-full h-full" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid meet">
              {/* Ocean/water background */}
              <rect x="450" y="0" width="150" height="800" fill="#B8D4E8" opacity="0.3" />
              <rect x="0" y="650" width="600" height="150" fill="#B8D4E8" opacity="0.3" />
              
              {/* North compass */}
              <g transform="translate(550, 30)">
                <circle cx="0" cy="0" r="18" fill="white" stroke="#4D6186" strokeWidth="1.5"/>
                <path d="M 0,-12 L 4,8 L 0,4 L -4,8 Z" fill="#274492"/>
                <text x="0" y="-15" fontSize="10" fontWeight="bold" fill="#274492" textAnchor="middle">N</text>
              </g>

              {/* Barangay polygons - based on Jagna map layout */}
              {/* Northwestern region */}
              <path d="M 50,80 L 120,60 L 180,90 L 160,140 L 90,150 Z" fill={getBarangayColor(getBarangay('Alejawan'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Alejawan').id)} />
              <text x="115" y="110" fontSize="9" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Alejawan</text>
              
              {/* Canjulao - northwest coastal */}
              <path d="M 50,150 L 90,150 L 100,220 L 50,240 Z" fill={getBarangayColor(getBarangay('Canjulao'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Canjulao').id)} />
              <text x="75" y="195" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Canjulao</text>
              
              {/* Balili - north central */}
              <path d="M 120,60 L 200,50 L 240,80 L 220,130 L 180,90 Z" fill={getBarangayColor(getBarangay('Balili'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Balili').id)} />
              <text x="185" y="85" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Balili</text>
              
              {/* Banlasan */}
              <path d="M 200,50 L 280,70 L 290,120 L 240,130 L 220,90 Z" fill={getBarangayColor(getBarangay('Banlasan'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Banlasan').id)} />
              <text x="250" y="95" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Banlasan</text>
              
              {/* Lonoy - northeast coastal */}
              <path d="M 290,120 L 360,140 L 380,190 L 320,200 L 290,160 Z" fill={getBarangayColor(getBarangay('Lonoy'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Lonoy').id)} />
              <text x="330" y="165" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Lonoy</text>
              
              {/* Cabungaan */}
              <path d="M 90,150 L 160,140 L 180,190 L 140,210 L 100,220 Z" fill={getBarangayColor(getBarangay('Cabungaan'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Cabungaan').id)} />
              <text x="135" y="180" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Cabungaan</text>
              
              {/* Kinagbaan - central */}
              <path d="M 180,190 L 240,180 L 260,230 L 210,250 L 180,220 Z" fill={getBarangayColor(getBarangay('Kinagbaan'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Kinagbaan').id)} />
              <text x="220" y="215" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Kinagbaan</text>
              
              {/* Tubod Monte - central highland */}
              <path d="M 240,180 L 310,190 L 320,240 L 270,250 L 240,220 Z" fill={getBarangayColor(getBarangay('Tubod Monte'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Tubod Monte').id)} />
              <text x="280" y="220" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Tubod Monte</text>
              
              {/* Looc - east */}
              <path d="M 320,200 L 380,190 L 400,240 L 360,260 L 320,240 Z" fill={getBarangayColor(getBarangay('Looc'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Looc').id)} />
              <text x="360" y="230" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Looc</text>
              
              {/* Cantagay - central east */}
              <path d="M 320,240 L 380,250 L 390,310 L 330,320 L 300,280 Z" fill={getBarangayColor(getBarangay('Cantagay'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Cantagay').id)} />
              <text x="355" y="285" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Cantagay</text>
              
              {/* Poblacion - central */}
              <path d="M 210,250 L 270,250 L 280,310 L 230,330 L 190,300 Z" fill={getBarangayColor(getBarangay('Poblacion'))} stroke="#8B7355" strokeWidth="2" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Poblacion').id)} />
              <text x="240" y="290" fontSize="9" fontWeight="bold" fill="#1E1E1E" opacity="0.8" textAnchor="middle" className="pointer-events-none">Poblacion</text>
              
              {/* Naatang - west central */}
              <path d="M 100,220 L 140,210 L 180,260 L 150,310 L 90,300 Z" fill={getBarangayColor(getBarangay('Naatang'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Naatang').id)} />
              <text x="135" y="260" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Naatang</text>
              
              {/* Larapan */}
              <path d="M 150,310 L 190,300 L 210,350 L 170,370 L 130,350 Z" fill={getBarangayColor(getBarangay('Larapan'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Larapan').id)} />
              <text x="170" y="335" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Larapan</text>
              
              {/* Tejero */}
              <path d="M 230,330 L 280,310 L 300,360 L 260,380 L 210,360 Z" fill={getBarangayColor(getBarangay('Tejero'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Tejero').id)} />
              <text x="255" y="350" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Tejero</text>
              
              {/* Can-ipol - east */}
              <path d="M 300,280 L 360,290 L 380,340 L 330,360 L 300,320 Z" fill={getBarangayColor(getBarangay('Can-ipol'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Can-ipol').id)} />
              <text x="335" y="320" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Can-ipol</text>
              
              {/* Pangdan - southeast */}
              <path d="M 330,360 L 390,350 L 410,410 L 360,430 L 320,400 Z" fill={getBarangayColor(getBarangay('Pangdan'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Pangdan').id)} />
              <text x="365" y="390" fontSize="8" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Pangdan</text>
              
              {/* Southern barangays */}
              <path d="M 170,370 L 210,360 L 230,410 L 190,430 L 150,410 Z" fill={getBarangayColor(getBarangay('Bunga Ilaya'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Bunga Ilaya').id)} />
              <text x="195" y="395" fontSize="7" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Bunga Ilaya</text>
              
              <path d="M 230,410 L 270,400 L 290,450 L 250,470 L 210,450 Z" fill={getBarangayColor(getBarangay('Bunga Mar'))} stroke="#8B7355" strokeWidth="1.5" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedBarangay(getBarangay('Bunga Mar').id)} />
              <text x="250" y="435" fontSize="7" fill="#1E1E1E" opacity="0.7" textAnchor="middle" className="pointer-events-none">Bunga Mar</text>
              
              {/* Remaining barangays - simplified representation */}
              {barangays.slice(17).map((bg, idx) => {
                const row = Math.floor(idx / 4);
                const col = idx % 4;
                const x = 80 + col * 100;
                const y = 500 + row * 70;
                return (
                  <g key={bg.id}>
                    <rect
                      x={x}
                      y={y}
                      width="80"
                      height="60"
                      fill={getBarangayColor(bg)}
                      stroke="#8B7355"
                      strokeWidth="1.5"
                      rx="4"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedBarangay(bg.id)}
                    />
                    <text
                      x={x + 40}
                      y={y + 35}
                      fontSize="7"
                      fill="#1E1E1E"
                      opacity="0.7"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {bg.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-[#D4DBDE]">
              <div className="text-xs mb-2 text-[#1E1E1E]">
                {layers.find(l => l.id === activeLayer)?.label}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#1E1E1E]/60">Low</span>
                <div className="flex gap-0.5">
                  {colorRamps.sequential.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-4 first:rounded-l last:rounded-r"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#1E1E1E]/60">High</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data table view - all 33 barangays */}
      <Sheet open={showDataTable} onOpenChange={setShowDataTable}>
        <SheetContent className="w-[800px] max-w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[#1E1E1E]">All Barangays Data - Jagna Municipality (33 Total)</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F9FAFB] border-b border-[#D4DBDE]">
                  <tr>
                    <th className="text-left p-2 text-[#1E1E1E]">#</th>
                    <th className="text-left p-2 text-[#1E1E1E]">Barangay</th>
                    <th className="text-right p-2 text-[#1E1E1E]">Population</th>
                    <th className="text-right p-2 text-[#1E1E1E]">Registered</th>
                    <th className="text-right p-2 text-[#1E1E1E]">Screening %</th>
                    <th className="text-right p-2 text-[#1E1E1E]">DM (Unctl)</th>
                    <th className="text-right p-2 text-[#1E1E1E]">HTN (Unctl)</th>
                    <th className="text-left p-2 text-[#1E1E1E]">Last Clinic</th>
                  </tr>
                </thead>
                <tbody>
                  {barangays.map((bg, idx) => (
                    <tr key={bg.id} className="border-b border-[#D4DBDE] hover:bg-[#F9FAFB] cursor-pointer" onClick={() => {
                      setShowDataTable(false);
                      setSelectedBarangay(bg.id);
                    }}>
                      <td className="p-2 text-slate-500">{idx + 1}</td>
                      <td className="p-2 text-[#1E1E1E]">{bg.name}</td>
                      <td className="p-2 text-right text-[#1E1E1E]">{bg.population.toLocaleString()}</td>
                      <td className="p-2 text-right text-[#1E1E1E]">{bg.registered}</td>
                      <td className="p-2 text-right">
                        <Badge variant={bg.screenedPercent >= 80 ? "default" : "outline"} className={bg.screenedPercent >= 80 ? "bg-teal-600" : ""}>
                          {bg.screenedPercent}%
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <Badge className="bg-[#CD5E31] hover:bg-[#B14F22]">{bg.uncontrolledDM}</Badge>
                      </td>
                      <td className="p-2 text-right">
                        <Badge className="bg-[#CD5E31] hover:bg-[#B14F22]">{bg.uncontrolledHTN}</Badge>
                      </td>
                      <td className="p-2 text-sm text-slate-600">
                        {new Date(bg.lastClinicDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Barangay detail drawer */}
      <Sheet open={!!selectedBarangay} onOpenChange={() => setSelectedBarangay(null)}>
        <SheetContent className="w-[400px] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-[#1E1E1E]">{selected.name}</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#1E1E1E]/60 mb-1">Population</p>
                    <div className="text-[#1E1E1E]">{selected.population.toLocaleString()}</div>
                  </div>
                  <div>
                    <p className="text-sm text-[#1E1E1E]/60 mb-1">Registered Patients</p>
                    <div className="text-[#1E1E1E]">{selected.registered}</div>
                  </div>
                  <div>
                    <p className="text-sm text-[#1E1E1E]/60 mb-1">Screening Coverage</p>
                    <div className="text-[#1E1E1E]">{selected.screenedPercent}%</div>
                  </div>
                  <div>
                    <p className="text-sm text-[#1E1E1E]/60 mb-1">Last Clinic Date</p>
                    <div className="text-[#1E1E1E] text-sm">
                      {new Date(selected.lastClinicDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#1E1E1E]/60 mb-2">Uncontrolled Cases</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded">
                      <span className="text-sm text-[#1E1E1E]">Diabetes Mellitus</span>
                      <Badge className="bg-[#CD5E31] hover:bg-[#B14F22]">
                        {selected.uncontrolledDM}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded">
                      <span className="text-sm text-[#1E1E1E]">Hypertension</span>
                      <Badge className="bg-[#CD5E31] hover:bg-[#B14F22]">
                        {selected.uncontrolledHTN}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#1E1E1E]/60 mb-2">6-Month Control Trend</p>
                  <div className="h-24 bg-[#F9FAFB] rounded-lg p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#274492" 
                          strokeWidth={2} 
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-[#1E1E1E]/60 mt-2">
                    Control rate improving by +13 pts over 6 months
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#1E1E1E]/60 mb-2">Top Needs</p>
                  <div className="space-y-1">
                    <Badge variant="outline">Follow-up visits</Badge>
                    <Badge variant="outline" className="ml-1">Medication refills</Badge>
                    <Badge variant="outline" className="ml-1">HbA1c testing</Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
