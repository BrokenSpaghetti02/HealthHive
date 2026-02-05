import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface ResolveConflictsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ResolveConflictsDialog({ open, onClose }: ResolveConflictsDialogProps) {
  const conflicts = [
    {
      id: 1,
      patient: 'JAG-000145',
      name: 'Maria Santos',
      field: 'Blood Pressure',
      localValue: '142/88',
      serverValue: '138/86',
      timestamp: '2025-10-28 14:23'
    },
    {
      id: 2,
      patient: 'JAG-000156',
      name: 'Juan dela Cruz',
      field: 'HbA1c',
      localValue: '7.8%',
      serverValue: '7.6%',
      timestamp: '2025-10-29 09:15'
    },
    {
      id: 3,
      patient: 'JAG-000167',
      name: 'Rosa Garcia',
      field: 'Weight',
      localValue: '68 kg',
      serverValue: '67 kg',
      timestamp: '2025-10-30 11:42'
    }
  ];

  const [resolved, setResolved] = useState<number[]>([]);

  const handleResolve = (id: number, useLocal: boolean) => {
    setResolved([...resolved, id]);
    toast.success('Conflict Resolved', {
      description: `Using ${useLocal ? 'local' : 'server'} value for conflict #${id}`
    });
  };

  const handleResolveAll = () => {
    toast.success('All Conflicts Resolved', {
      description: 'All data conflicts have been resolved using local values.'
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E] flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#F97316]" />
            Resolve Data Conflicts
          </DialogTitle>
          <DialogDescription className="text-xs text-[#4D6186]">
            Review and resolve conflicts between local and server data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-2">
            <p className="text-xs text-[#1E1E1E]">
              <strong>{conflicts.length} conflicts</strong> found between local data and server data. Please review and select the correct value for each conflict.
            </p>
          </div>

          {conflicts.map((conflict) => (
            <div 
              key={conflict.id} 
              className={`border rounded-lg p-3 ${
                resolved.includes(conflict.id) 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-[#D4DBDE]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#1E1E1E]">{conflict.name}</span>
                    <Badge variant="outline" className="text-[10px] h-3.5 px-1">{conflict.patient}</Badge>
                  </div>
                  <div className="text-[10px] text-[#4D6186] mt-0.5">
                    Field: <strong>{conflict.field}</strong> • {conflict.timestamp}
                  </div>
                </div>
                {resolved.includes(conflict.id) && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
              </div>

              {!resolved.includes(conflict.id) && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="border border-[#7C3AED] rounded-md p-2 bg-[#F3F0FF]">
                    <div className="text-[10px] text-[#4D6186] mb-1">Local Value</div>
                    <div className="text-xs text-[#1E1E1E] mb-2">{conflict.localValue}</div>
                    <Button 
                      size="sm" 
                      className="w-full h-6 text-[10px] bg-[#7C3AED] hover:bg-[#6D28D9]"
                      onClick={() => handleResolve(conflict.id, true)}
                    >
                      Use This
                    </Button>
                  </div>

                  <div className="border border-[#D4DBDE] rounded-md p-2 bg-[#F9FAFB]">
                    <div className="text-[10px] text-[#4D6186] mb-1">Server Value</div>
                    <div className="text-xs text-[#1E1E1E] mb-2">{conflict.serverValue}</div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full h-6 text-[10px] border-[#D4DBDE]"
                      onClick={() => handleResolve(conflict.id, false)}
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="h-7 text-xs">
            Cancel
          </Button>
          <Button 
            onClick={handleResolveAll} 
            className="h-7 text-xs bg-[#7C3AED] hover:bg-[#6D28D9]"
          >
            Use All Local Values
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
