import { Patient } from "../../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { QrCode, Download, Calendar, Phone, MapPin, Printer } from "lucide-react";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface PatientModalProps {
  patient: Patient | null;
  open: boolean;
  onClose: () => void;
}

export function PatientModal({ patient, open, onClose }: PatientModalProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString();
  };

  if (!patient) return null;

  const handleScheduleFollowUp = () => {
    toast.success('Follow-up Scheduled', {
      description: `Follow-up appointment for ${patient.name} has been scheduled for ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}`
    });
  };

  const handleGenerateQR = () => {
    setShowQRCode(true);
    toast.success('QR Code Generated', {
      description: `QR code for ${patient.name} (${patient.id}) has been generated`
    });
  };

  const handleExportPDF = () => {
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print Dialog Opened', {
      description: 'Patient record prepared for printing'
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very High': return 'bg-red-600 hover:bg-red-700';
      case 'High': return 'bg-orange-600 hover:bg-orange-700';
      case 'Medium': return 'bg-yellow-600 hover:bg-yellow-700';
      default: return 'bg-green-600 hover:bg-green-700';
    }
  };

  const getConditionColor = (condition: string) => {
    if (condition === 'DM') {
      return 'bg-white text-[#274492] border-[#274492] border-2 hover:bg-blue-50';
    } else if (condition === 'HTN') {
      return 'bg-white text-[#CD5E31] border-[#CD5E31] border-2 hover:bg-orange-50';
    }
    return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-slate-900 mb-2">
                {patient.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm text-slate-600">
                <span>{patient.id}</span>
                <span>•</span>
                <span>{patient.sex === 'M' ? 'Male' : 'Female'}, {patient.age} years</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {patient.barangay}
                </span>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {patient.conditions.sort((a, b) => {
                if (a === 'HTN' && b === 'DM') return -1;
                if (a === 'DM' && b === 'HTN') return 1;
                return 0;
              }).map(condition => (
                <Badge key={condition} className={getConditionColor(condition)}>
                  {condition}
                </Badge>
              ))}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="summary" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* Clinical Status */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm text-slate-700 mb-3">Clinical Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                  <Badge className={getRiskColor(patient.risk)}>
                    {patient.risk}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Control Status</p>
                  <Badge variant={patient.controlStatus === 'Controlled' ? 'default' : 'destructive'}>
                    {patient.controlStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Last Visit</p>
                  <p className="text-sm text-slate-900">{formatDate(patient.lastVisit)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Next Due</p>
                  <p className="text-sm text-slate-900">{formatDate(patient.nextDue)}</p>
                </div>
              </div>
            </div>

            {/* Vital Signs & Metrics */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm text-slate-700 mb-3">Latest Vital Signs & Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {patient.conditions.includes('HTN') && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Blood Pressure</p>
                    <p className="text-slate-900">{patient.latestBP || 'N/A'}</p>
                    {patient.latestBP && <p className="text-xs text-slate-500">mmHg</p>}
                  </div>
                )}
                {patient.conditions.includes('DM') && (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Random Blood Glucose</p>
                      <p className="text-slate-900">{patient.latestRBG || 'N/A'}</p>
                      {patient.latestRBG && <p className="text-xs text-slate-500">mg/dL</p>}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Fasting Blood Glucose</p>
                      <p className="text-slate-900">{patient.latestFBG || 'N/A'}</p>
                      {patient.latestFBG && <p className="text-xs text-slate-500">mg/dL</p>}
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs text-slate-500 mb-1">BMI</p>
                  <p className="text-slate-900">
                    {patient.latestBMI ? (
                      <>
                        {patient.latestBMI.toFixed(1)}
                        {patient.latestBMI < 18.5 && <span className="text-xs text-blue-600 ml-1">(Underweight)</span>}
                        {patient.latestBMI >= 18.5 && patient.latestBMI < 23 && <span className="text-xs text-green-600 ml-1">(Normal)</span>}
                        {patient.latestBMI >= 23 && patient.latestBMI < 25 && <span className="text-xs text-yellow-600 ml-1">(Overweight)</span>}
                        {patient.latestBMI >= 25 && patient.latestBMI < 30 && <span className="text-xs text-orange-600 ml-1">(Obese I)</span>}
                        {patient.latestBMI >= 30 && <span className="text-xs text-red-600 ml-1">(Obese II)</span>}
                      </>
                    ) : 'N/A'}
                  </p>
                  {patient.latestBMI && <p className="text-xs text-slate-500">kg/m²</p>}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Height / Weight</p>
                  <p className="text-slate-900">
                    {patient.height && patient.weight 
                      ? `${patient.height} cm / ${patient.weight} kg` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Demographics & Contact */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm text-slate-700 mb-3">Demographics & Contact</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contact Number</p>
                  <div className="flex items-center gap-2 text-sm text-slate-900">
                    <Phone size={14} />
                    <span>{patient.contact || 'Not provided'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Occupation</p>
                  <p className="text-sm text-slate-900">{patient.occupation || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Education</p>
                  <p className="text-sm text-slate-900">{patient.education || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Marital Status</p>
                  <p className="text-sm text-slate-900">{patient.maritalStatus || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-slate-600 mb-2">Current Medications</p>
              <div className="space-y-2">
                {patient.medications?.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    <span>{med}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                className="bg-[#7C3AED] hover:bg-[#6D28D9] gap-2 text-xs h-7"
                onClick={handleScheduleFollowUp}
              >
                <Calendar size={14} />
                Schedule Follow-up
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 text-xs h-7 border-[#D4DBDE]"
                onClick={handleGenerateQR}
              >
                <QrCode size={14} />
                Generate QR
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 text-xs h-7 border-[#D4DBDE]"
                onClick={handleExportPDF}
              >
                <Download size={14} />
                Export PDF
              </Button>
            </div>

            {/* QR Code Display */}
            {showQRCode && (
              <div className="mt-4 p-4 border border-[#D4DBDE] rounded-lg bg-white text-center">
                <div className="text-xs text-[#4D6186] mb-2">Patient QR Code</div>
                <div className="w-32 h-32 mx-auto bg-[#F9FAFB] border-2 border-[#D4DBDE] rounded flex items-center justify-center">
                  <QrCode size={80} className="text-[#1E1E1E]" />
                </div>
                <div className="text-[10px] text-[#4D6186] mt-2">{patient.id}</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 h-6 text-[10px]"
                  onClick={() => setShowQRCode(false)}
                >
                  Close
                </Button>
              </div>
            )}

            {/* Print Preview */}
            {showPrintPreview && (
              <div className="mt-4 border-2 border-[#7C3AED] rounded-lg bg-white overflow-hidden">
                <div className="bg-[#F3F0FF] p-2 border-b border-[#7C3AED] flex items-center justify-between">
                  <div className="text-xs text-[#1E1E1E]">Print Preview</div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="h-6 text-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] gap-1"
                      onClick={handlePrint}
                    >
                      <Printer size={10} />
                      Print
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-[10px]"
                      onClick={() => setShowPrintPreview(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
                <div className="p-4 text-xs space-y-2 max-h-60 overflow-y-auto">
                  <div className="text-center mb-3">
                    <div className="text-sm">HealthHive Dashboard - Jagna Health DMS</div>
                    <div className="text-[10px] text-[#4D6186]">Patient Medical Record</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Patient ID:</strong> {patient.id}</div>
                    <div><strong>Name:</strong> {patient.name}</div>
                    <div><strong>Age/Sex:</strong> {patient.age} / {patient.sex}</div>
                    <div><strong>Barangay:</strong> {patient.barangay}</div>
                    <div><strong>Conditions:</strong> {patient.conditions.join(', ')}</div>
                    <div><strong>Risk Level:</strong> {patient.risk}</div>
                    <div><strong>Control Status:</strong> {patient.controlStatus}</div>
                    {patient.latestBP && <div><strong>Latest BP:</strong> {patient.latestBP}</div>}
                    {patient.latestHbA1c && <div><strong>Latest HbA1c:</strong> {patient.latestHbA1c}</div>}
                    {patient.latestBMI && <div><strong>BMI:</strong> {patient.latestBMI}</div>}
                  </div>
                  {patient.medications && patient.medications.length > 0 && (
                    <div className="mt-2">
                      <strong>Medications:</strong>
                      <ul className="ml-4 mt-1 text-[10px]">
                        {patient.medications.map((med, idx) => (
                          <li key={idx}>• {med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-3">
            {[
              { date: '2025-10-10', event: 'Follow-up Visit', bp: '156/92', notes: 'BP slightly elevated' },
              { date: '2025-09-12', event: 'HbA1c Test', hba1c: '8.6%', notes: 'Uncontrolled DM' },
              { date: '2025-08-10', event: 'Medication Dispensed', meds: 'Metformin 500mg x90' },
              { date: '2025-07-05', event: 'Initial Screening', bp: '148/88', notes: 'Diagnosed with HTN' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 pb-3 border-b last:border-0">
                <div className="text-sm text-slate-500 w-24">{item.date}</div>
                <div className="flex-1">
                  <p className="text-slate-900">{item.event}</p>
                  {item.bp && <p className="text-sm text-slate-600">BP: {item.bp}</p>}
                  {item.hba1c && <p className="text-sm text-slate-600">HbA1c: {item.hba1c}</p>}
                  {item.meds && <p className="text-sm text-slate-600">{item.meds}</p>}
                  {item.notes && <p className="text-sm text-slate-500 mt-1">{item.notes}</p>}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="forms" className="text-center py-8">
            <p className="text-slate-500">No forms available</p>
          </TabsContent>

          <TabsContent value="attachments" className="text-center py-8">
            <p className="text-slate-500">No attachments</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
