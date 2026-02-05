import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import { CheckCircle, Clock, MapPin } from "lucide-react";
import { Progress } from "../../ui/progress";

interface TodaysVisitsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TodaysVisitsDialog({ open, onClose }: TodaysVisitsDialogProps) {
  const todaysVisits = [
    { patient: 'Ana Reyes', id: 'JAG-000123', barangay: 'Tubod Monte', time: '08:00 AM', status: 'completed' },
    { patient: 'Jose Mendoza', id: 'JAG-000128', barangay: 'Tubod Monte', time: '08:30 AM', status: 'completed' },
    { patient: 'Roberto Diaz', id: 'JAG-000130', barangay: 'Cantagay', time: '10:00 AM', status: 'completed' },
    { patient: 'Maria Santos', id: 'JAG-000145', barangay: 'Poblacion', time: '11:00 AM', status: 'completed' },
    { patient: 'Juan dela Cruz', id: 'JAG-000156', barangay: 'Poblacion', time: '11:30 AM', status: 'completed' },
    { patient: 'Rosa Garcia', id: 'JAG-000167', barangay: 'Naatang', time: '01:00 PM', status: 'completed' },
    { patient: 'Pedro Santos', id: 'JAG-000178', barangay: 'Poblacion', time: '02:00 PM', status: 'completed' },
    { patient: 'Linda Cruz', id: 'JAG-000189', barangay: 'Tubod Monte', time: '02:30 PM', status: 'completed' },
    { patient: 'Ramon Torres', id: 'JAG-000192', barangay: 'Cantagay', time: '03:00 PM', status: 'pending' },
    { patient: 'Elena Reyes', id: 'JAG-000201', barangay: 'Cantagay', time: '03:30 PM', status: 'pending' },
    { patient: 'Carmen Lopez', id: 'JAG-000212', barangay: 'Naatang', time: '04:00 PM', status: 'pending' },
    { patient: 'Miguel Garcia', id: 'JAG-000223', barangay: 'Naatang', time: '04:30 PM', status: 'pending' },
  ];

  const completed = todaysVisits.filter(v => v.status === 'completed').length;
  const total = todaysVisits.length;
  const percentage = Math.round((completed / total) * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">Today's Visits - November 1, 2025</DialogTitle>
          <DialogDescription className="text-xs text-[#4D6186]">
            View all scheduled patient visits for today
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          <div className="bg-[#F3F0FF] border border-[#7C3AED] rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[#1E1E1E] text-sm mb-0.5">Progress: {completed} of {total} visits</div>
                <div className="text-[#4D6186] text-xs">4 barangays covered today</div>
              </div>
              <div className="text-[#7C3AED] text-2xl">{percentage}%</div>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="space-y-2">
            {todaysVisits.map((visit, idx) => (
              <div 
                key={idx}
                className={`border rounded-lg p-2 ${
                  visit.status === 'completed' 
                    ? 'border-[#D4DBDE] bg-[#F9FAFB]' 
                    : 'border-[#7C3AED] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {visit.status === 'completed' ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <Clock size={16} className="text-[#7C3AED]" />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#1E1E1E]">{visit.patient}</span>
                        <Badge variant="outline" className="text-[9px] h-3.5 px-1">{visit.id}</Badge>
                      </div>
                      <div className="text-[10px] text-[#4D6186] flex items-center gap-1 mt-0.5">
                        <MapPin size={9} />
                        {visit.barangay} • {visit.time}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={`text-[10px] h-4 px-1.5 ${
                      visit.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-[#F3F0FF] text-[#7C3AED]'
                    }`}
                  >
                    {visit.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
