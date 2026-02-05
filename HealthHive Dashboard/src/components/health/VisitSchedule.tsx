import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { GripVertical, MapPin, Phone, MessageSquare, Navigation } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { PatientModal } from "./PatientModal";
import { Patient } from "../../types";
import { toast } from "sonner@2.0.3";

export function VisitSchedule({ visits }: { visits: any[] }) {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleCall = (patientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Calling Patient', {
      description: `Initiating call to ${patientName}...`
    });
  };

  const handleSMS = (patientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('SMS Sent', {
      description: `Reminder SMS sent to ${patientName}`
    });
  };

  const handleOptimizeRoute = () => {
    toast.success('Route Optimized', {
      description: 'Visit order has been optimized for shortest distance (10.2 km → 8.7 km)'
    });
  };

  const handleStartNavigation = () => {
    toast.success('Navigation Started', {
      description: 'Opening Google Maps with route to first patient...'
    });
  };

  const enhancedVisits = useMemo(() => visits.map(visit => {
    let urgency = 'Medium';
    let urgencyColor = '#FCD34D';
    const reason = visit.reason || '';
    if (reason.includes('overdue') || reason.includes('Very High')) {
      urgency = 'Urgent';
      urgencyColor = '#DC2626';
    } else if (reason.includes('High')) {
      urgency = 'High';
      urgencyColor = '#F97316';
    }
    return {
      ...visit,
      urgency,
      urgencyColor
    };
  }), [visits]);

  // Group visits by barangay
  const visitsByBarangay = enhancedVisits.reduce((acc, visit) => {
    if (!acc[visit.barangay]) {
      acc[visit.barangay] = [];
    }
    acc[visit.barangay].push(visit);
    return acc;
  }, {} as Record<string, typeof enhancedVisits>);

  return (
    <Card className="border-[#D4DBDE]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#1E1E1E] text-sm">Today's Visit Schedule</CardTitle>
          <Badge className="bg-[#7C3AED] text-[10px] h-4 px-1.5">Team A</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Barangay Overview */}
        <div className="mb-3 p-2 bg-[#FFFBEB] border border-[#FDE047] rounded-md">
          <div className="text-[10px] text-[#1E1E1E] mb-1.5">
            <strong>Route Plan:</strong> {Object.keys(visitsByBarangay).length} barangays • {visits.length} patients
          </div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(visitsByBarangay).map(([barangay, barangayVisits]) => {
              const urgentCount = barangayVisits.filter(v => v.urgency === 'Urgent').length;
              return (
                <div key={barangay} className="flex items-center gap-1 bg-white rounded px-1.5 py-0.5 border border-[#D4DBDE]">
                  <MapPin size={10} className="text-[#7C3AED]" />
                  <span className="text-[9px] text-[#1E1E1E]">{barangay}</span>
                  <span className="text-[9px] text-[#4D6186]">({barangayVisits.length})</span>
                  {urgentCount > 0 && (
                    <Badge className="bg-[#DC2626] text-[8px] h-3 px-1 ml-0.5">{urgentCount}</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Visit List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {enhancedVisits.map((visit, idx) => (
            <div 
              key={visit.patientId}
              className={`border rounded-md p-2 hover:bg-[#F9FAFB] cursor-pointer transition-colors ${
                selectedVisit === visit.patientId ? 'bg-[#EAF0F6] border-[#7C3AED]' : 'border-[#D4DBDE]'
              }`}
              onClick={() => {
                setSelectedVisit(visit.patientId);
                if (visit.patient) {
                  setSelectedPatient(visit.patient);
                }
              }}
            >
              <div className="flex items-start gap-2">
                {/* Order indicator */}
                <div className="flex items-center gap-1.5">
                  <GripVertical size={12} className="text-[#4D6186]" />
                  <div 
                    className="w-5 h-5 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                    style={{ backgroundColor: visit.urgencyColor }}
                  >
                    {idx + 1}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Patient name and distance */}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[#1E1E1E] truncate text-xs">{visit.patientName || visit.patient?.name || visit.patientId}</span>
                    <div className="flex items-center gap-1">
                      <Badge 
                        className="text-[9px] h-4 px-1.5 flex-shrink-0"
                        style={{ backgroundColor: visit.urgencyColor }}
                      >
                        {visit.urgency}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-[#D4DBDE] ml-1">{visit.distance}</Badge>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="text-xs text-[#4D6186] mb-1">
                    <div className="flex items-center gap-0.5">
                      <MapPin size={10} />
                      {visit.barangay}
                    </div>
                  </div>
                  
                  {/* Reason and vitals */}
                  <div className="text-xs space-y-0.5">
                    <div className="text-[#1E1E1E]">{visit.reason}</div>
                    <div className="text-[#4D6186] text-[10px] flex gap-3">
                      {visit.lastBP && (
                        <span>
                          <span className="text-[#CD5E31]">BP:</span> {visit.lastBP}
                        </span>
                      )}
                      {visit.lastHbA1c && (
                        <span>
                          <span className="text-[#274492]">HbA1c:</span> {visit.lastHbA1c}
                        </span>
                      )}
                      {(visit.patient?.conditions || visit.conditions) && (
                        <span className="text-[#4D6186]">
                          {(visit.patient?.conditions || visit.conditions || []).map((c: string) => (
                            <Badge 
                              key={c} 
                              variant="outline" 
                              className={`text-[8px] h-3 px-1 ml-1 ${
                                c === 'HTN' ? 'border-[#CD5E31] text-[#CD5E31]' : 'border-[#274492] text-[#274492]'
                              }`}
                            >
                              {c}
                            </Badge>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-1.5">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px] gap-0.5 border-[#D4DBDE] px-1.5"
                      onClick={(e) => handleCall(visit.patientName || visit.patient?.name || "Patient", e)}
                    >
                      <Phone size={10} />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px] gap-0.5 border-[#D4DBDE] px-1.5"
                      onClick={(e) => handleSMS(visit.patientName || visit.patient?.name || "Patient", e)}
                    >
                      <MessageSquare size={10} />
                      SMS
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Route Summary */}
        <div className="mt-3 p-3 bg-[#EAF0F6] rounded-lg border border-[#D4DBDE]">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#4D6186]">Total distance</span>
              <span className="text-[#274492]">10.2 km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#4D6186]">Est. time</span>
              <span className="text-[#274492]">2.5 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#4D6186]">Patients</span>
              <span className="text-[#274492]">{visits.length} visits</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#4D6186]">Urgent cases</span>
              <span className="text-[#DC2626]">{enhancedVisits.filter(v => v.urgency === 'Urgent').length}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button 
            variant="outline" 
            className="gap-1.5 border-[#D4DBDE] text-xs h-7"
            onClick={handleOptimizeRoute}
          >
            <Navigation size={14} />
            Optimize Route
          </Button>
          <Button 
            className="gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-xs h-7"
            onClick={handleStartNavigation}
          >
            <Navigation size={14} />
            Start Navigation
          </Button>
        </div>
      </CardContent>

      <PatientModal 
        patient={selectedPatient}
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </Card>
  );
}
