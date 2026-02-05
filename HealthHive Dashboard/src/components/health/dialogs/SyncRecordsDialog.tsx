import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { Badge } from "../../ui/badge";
import { CheckCircle, Upload, AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface SyncRecordsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SyncRecordsDialog({ open, onClose }: SyncRecordsDialogProps) {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'complete'>('idle');

  const handleSync = async () => {
    setSyncing(true);
    setStatus('syncing');
    setProgress(0);

    // Simulate sync progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncing(false);
          setStatus('complete');
          toast.success('Sync Complete', {
            description: '156 records successfully synchronized to DHIS2.'
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleClose = () => {
    if (!syncing) {
      setStatus('idle');
      setProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">Sync Records to DHIS2</DialogTitle>
          <DialogDescription className="text-xs text-[#4D6186]">
            Synchronize pending records to the DHIS2 backend server
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-3">
          {status === 'idle' && (
            <>
              <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
                <p className="text-xs text-[#1E1E1E]">
                  <strong>156 records</strong> are pending sync to the DHIS2 backend server.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4D6186]">Patient registrations</span>
                  <Badge variant="outline" className="text-[10px] h-4">84 records</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4D6186]">Follow-up visits</span>
                  <Badge variant="outline" className="text-[10px] h-4">52 records</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4D6186]">Lab results</span>
                  <Badge variant="outline" className="text-[10px] h-4">20 records</Badge>
                </div>
              </div>
            </>
          )}

          {status === 'syncing' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-[#7C3AED] animate-pulse" />
                <span className="text-xs text-[#1E1E1E]">Syncing records to DHIS2...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-[#4D6186] text-center">{progress}% complete</div>
            </div>
          )}

          {status === 'complete' && (
            <div className="space-y-3 text-center py-4">
              <CheckCircle size={48} className="text-green-600 mx-auto" />
              <div>
                <p className="text-[#1E1E1E] text-sm">Sync Completed Successfully!</p>
                <p className="text-xs text-[#4D6186] mt-1">All 156 records have been synchronized.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose} className="h-7 text-xs">
                Cancel
              </Button>
              <Button onClick={handleSync} className="h-7 text-xs bg-[#7C3AED] hover:bg-[#6D28D9] gap-1">
                <Upload size={12} />
                Start Sync
              </Button>
            </>
          )}
          {status === 'syncing' && (
            <Button disabled className="h-7 text-xs">
              Syncing...
            </Button>
          )}
          {status === 'complete' && (
            <Button onClick={handleClose} className="h-7 text-xs bg-[#7C3AED] hover:bg-[#6D28D9]">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
