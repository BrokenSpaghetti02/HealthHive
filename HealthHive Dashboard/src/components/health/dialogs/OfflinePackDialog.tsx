import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";
import { Printer, Download, FileText, Users, MapPin } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface OfflinePackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfflinePackDialog({ open, onOpenChange }: OfflinePackDialogProps) {
  const [includes, setIncludes] = useState({
    patients: true,
    routes: true,
    forms: true,
    medications: true,
  });
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleDownload = () => {
    toast.success("Offline pack downloaded", {
      description: "PDF saved to your downloads folder",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1E1E1E]">Offline Pack - Print Preview</DialogTitle>
            <DialogDescription className="text-[#4D6186] text-xs">
              Download or print field visit materials for offline use
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#1E1E1E] text-xs">Include in Pack</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="patients"
                    checked={includes.patients}
                    onCheckedChange={(checked) => setIncludes({ ...includes, patients: checked as boolean })}
                  />
                  <Label htmlFor="patients" className="flex items-center gap-2 text-xs cursor-pointer">
                    <Users size={14} className="text-[#7C3AED]" />
                    Patient List (12 patients for today's route)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="routes"
                    checked={includes.routes}
                    onCheckedChange={(checked) => setIncludes({ ...includes, routes: checked as boolean })}
                  />
                  <Label htmlFor="routes" className="flex items-center gap-2 text-xs cursor-pointer">
                    <MapPin size={14} className="text-[#7C3AED]" />
                    Route Map & Directions
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="forms"
                    checked={includes.forms}
                    onCheckedChange={(checked) => setIncludes({ ...includes, forms: checked as boolean })}
                  />
                  <Label htmlFor="forms" className="flex items-center gap-2 text-xs cursor-pointer">
                    <FileText size={14} className="text-[#7C3AED]" />
                    Blank Assessment Forms (20 copies)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="medications"
                    checked={includes.medications}
                    onCheckedChange={(checked) => setIncludes({ ...includes, medications: checked as boolean })}
                  />
                  <Label htmlFor="medications" className="flex items-center gap-2 text-xs cursor-pointer">
                    <FileText size={14} className="text-[#7C3AED]" />
                    Medication Distribution Sheet
                  </Label>
                </div>
              </div>
            </div>

            {/* Print Preview */}
            <div ref={printRef} className="border border-[#D4DBDE] rounded-md p-4 bg-white print-preview">
              <div className="space-y-4">
                <div className="border-b border-[#D4DBDE] pb-3">
                  <h3 className="text-sm text-[#1E1E1E]">Jagna Health Data Management System</h3>
                  <p className="text-xs text-[#4D6186]">HealthHive Dashboard - Field Visit Pack</p>
                  <p className="text-xs text-[#4D6186]">Date: {new Date().toLocaleDateString()}</p>
                </div>

                {includes.patients && (
                  <div className="space-y-2">
                    <h4 className="text-xs text-[#1E1E1E]">Today's Patient List</h4>
                    <div className="space-y-1">
                      {[
                        { name: "Ana Reyes", barangay: "Tubod Monte", reason: "HTN Follow-up", bp: "156/92" },
                        { name: "Maria Cruz", barangay: "Naatang", reason: "DM Check", bp: "138/84" },
                        { name: "Carlos Santos", barangay: "Poblacion", reason: "Medication Refill", bp: "128/82" },
                      ].map((patient, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-[#F9FAFB] rounded">
                          <div>
                            <span className="text-[#1E1E1E]">{idx + 1}. {patient.name}</span>
                            <span className="text-[#4D6186] ml-2">({patient.barangay})</span>
                          </div>
                          <div className="text-[#4D6186]">{patient.reason}</div>
                        </div>
                      ))}
                      <div className="text-[10px] text-[#4D6186] italic">... and 9 more patients</div>
                    </div>
                  </div>
                )}

                {includes.routes && (
                  <div className="space-y-2">
                    <h4 className="text-xs text-[#1E1E1E]">Route Summary</h4>
                    <div className="text-[10px] space-y-1">
                      <p className="text-[#4D6186]">Total Distance: 10.2 km</p>
                      <p className="text-[#4D6186]">Estimated Time: 2.5 hours</p>
                      <p className="text-[#4D6186]">Stops: Tubod Monte → Naatang → Poblacion</p>
                    </div>
                  </div>
                )}

                {includes.medications && (
                  <div className="space-y-2">
                    <h4 className="text-xs text-[#1E1E1E]">Medication Checklist</h4>
                    <div className="space-y-1">
                      {[
                        { med: "Metformin 500mg", qty: "120 tablets" },
                        { med: "Amlodipine 5mg", qty: "90 tablets" },
                        { med: "Losartan 50mg", qty: "60 tablets" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] p-1.5 bg-[#F9FAFB] rounded">
                          <span className="text-[#1E1E1E]">{item.med}</span>
                          <span className="text-[#4D6186]">{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-[#D4DBDE] pt-3">
                  <p className="text-[10px] text-[#4D6186]">
                    Generated on {new Date().toLocaleString()} | Team A - Maria Santos
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F3F0FF] rounded-md border border-[#D4DBDE]">
              <p className="text-xs text-[#1E1E1E]">
                <strong>Note:</strong> This pack includes essential information for field operations without internet connectivity.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#D4DBDE] text-xs">
              Cancel
            </Button>
            <Button onClick={handleDownload} variant="outline" className="gap-1.5 border-[#D4DBDE] text-xs">
              <Download size={12} />
              Download PDF
            </Button>
            <Button onClick={handlePrint} className="gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-xs">
              <Printer size={12} />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview, .print-preview * {
            visibility: visible;
          }
          .print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
