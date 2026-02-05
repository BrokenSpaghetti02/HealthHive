import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { MapPin, Navigation, Download, Send, GripVertical, Users, CheckCircle, Clock, AlertCircle, AlertTriangle, Package, Calendar, Phone, MessageSquare, Flag } from "lucide-react";
import { api } from "../../../lib/api";
import { PriorityHeatMap } from "../PriorityHeatMap";
import { VisitSchedule } from "../VisitSchedule";
import { KPICard } from "../KPICard";
import { Alert, AlertDescription } from "../../ui/alert";
import { Progress } from "../../ui/progress";
import { useEffect, useState } from "react";
import { SendReminderDialog } from "../dialogs/SendReminderDialog";
import { ScheduleVisitDialog } from "../dialogs/ScheduleVisitDialog";
import { OfflinePackDialog } from "../dialogs/OfflinePackDialog";
import { TodaysVisitsDialog } from "../dialogs/TodaysVisitsDialog";
import { TeamMembersDialog } from "../dialogs/TeamMembersDialog";
import { PatientModal } from "../PatientModal";
import { Patient } from "../../../types";

export function FieldOpsPage() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSendReminder, setShowSendReminder] = useState(false);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [showOfflinePack, setShowOfflinePack] = useState(false);
  const [showTodaysVisits, setShowTodaysVisits] = useState(false);
  const [showTeamMembers, setShowTeamMembers] = useState(false);
  const [fieldOpsData, setFieldOpsData] = useState<any>(null);

  useEffect(() => {
    async function loadFieldOps() {
      try {
        const data = await api.getFieldOpsSummary();
        setFieldOpsData(data);
      } catch (error) {
        console.error("Failed to load field ops data:", error);
      }
    }
    loadFieldOps();
  }, []);

  const visits = fieldOpsData?.visits || [];
  const barangays = fieldOpsData?.barangays || [];
  const upcoming = fieldOpsData?.upcoming || [];
  const teams = fieldOpsData?.teams || [];

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#1E1E1E] mb-0.5">Field Operations</h2>
          <p className="text-[#4D6186] text-xs">Plan and optimize mobile clinic routes across Jagna barangays</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-1.5 border-[#D4DBDE] h-7 text-xs px-2"
            onClick={() => setShowSendReminder(true)}
          >
            <Send size={12} />
            Send Reminders
          </Button>
          <Button 
            variant="outline" 
            className="gap-1.5 border-[#D4DBDE] h-7 text-xs px-2"
            onClick={() => setShowOfflinePack(true)}
          >
            <Download size={12} />
            Offline Pack
          </Button>
          <Button 
            className="gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs px-2"
            onClick={() => setShowScheduleVisit(true)}
          >
            <Calendar size={12} />
            Schedule Visit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div onClick={() => setShowTodaysVisits(true)} className="cursor-pointer">
          <KPICard
            title="Today's Visits"
            value={(fieldOpsData?.kpis?.today_visits || 0).toString()}
            subtitle="Scheduled and completed"
            icon={<Calendar className="text-[#7C3AED]" size={14} />}
            trend={{ value: 15, isPositive: true }}
          />
        </div>
        <KPICard
          title="This Week"
          value={(fieldOpsData?.kpis?.week_visits || 0).toString()}
          subtitle="Visits in last 7 days"
          icon={<CheckCircle className="text-[#7C3AED]" size={14} />}
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Overdue Visits"
          value={(fieldOpsData?.kpis?.overdue_visits || 0).toString()}
          subtitle="Require follow-up"
          icon={<AlertCircle className="text-[#CD5E31]" size={14} />}
          trend={{ value: 5, isPositive: false }}
        />
        <div onClick={() => setShowTeamMembers(true)} className="cursor-pointer">
          <KPICard
            title="Team Members"
            value={(fieldOpsData?.kpis?.team_members || 0).toString()}
            subtitle="Active users"
            icon={<Users className="text-[#7C3AED]" size={14} />}
          />
        </div>
      </div>

      {/* Field Team Status */}
      <Card className="border-[#D4DBDE]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#1E1E1E] text-sm">Field Team Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {teams.map((team: any, idx: number) => (
              <div 
                key={idx} 
                className="border border-[#D4DBDE] rounded-md p-3 cursor-pointer hover:border-[#7C3AED] hover:bg-[#F9FAFB] transition-colors"
                onClick={() => setShowTeamMembers(true)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[#1E1E1E] text-xs">{team.name}</div>
                  <Badge 
                    variant="outline" 
                    className={`${team.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'} text-[10px] h-4 px-1.5`}
                  >
                    {team.status}
                  </Badge>
                </div>
                <div className="text-xs text-[#4D6186] mb-2">{team.area}</div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4D6186]">Progress</span>
                    <span className="text-[#274492]">{team.visits} visits</span>
                  </div>
                  <Progress value={parseInt(team.visits.split('/')[0]) / parseInt(team.visits.split('/')[1]) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Map and Schedule */}
      <Tabs defaultValue="today" className="space-y-3">
        <TabsList className="bg-[#F9FAFB] border border-[#D4DBDE] h-7">
          <TabsTrigger value="today" className="text-xs px-3">Visit Updates</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs px-3">Upcoming Visits</TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs px-3">Overdue Follow-ups</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs px-3">Resources & Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3">
          <Alert className="border-[#FDE047] bg-[#FFFBEB]">
            <AlertCircle className="h-3 w-3 text-[#92400E]" />
            <AlertDescription className="text-[#1E1E1E] text-xs">
              <strong>Weather Advisory:</strong> Clear skies expected. Roads to Tubod Monte may be slippery after recent rain.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <PriorityHeatMap barangays={barangays} />
            </div>
            <div className="space-y-3">
              <VisitSchedule visits={visits} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader>
              <CardTitle className="text-[#1E1E1E] text-sm">Upcoming Scheduled Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcoming.map((schedule: any, idx: number) => (
                  <div key={idx} className="border border-[#D4DBDE] rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="text-center min-w-[60px]">
                          <div className="text-[#274492] text-sm">{new Date(schedule.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div className="text-[10px] text-[#4D6186]">{new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                        </div>
                        <div>
                          <div className="text-[#1E1E1E] text-xs mb-1">{schedule.barangays}</div>
                          <div className="text-[10px] text-[#4D6186] mb-1">{schedule.patients} patients scheduled</div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-[#D4DBDE] text-[10px] h-4 px-1.5">{schedule.team}</Badge>
                            {schedule.flaggedCount > 0 && (
                              <Badge className="bg-[#CD5E31] text-[10px] h-4 px-1.5 gap-0.5">
                                <Flag size={10} />
                                {schedule.flaggedCount} flagged
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#D4DBDE] h-6 text-[10px] px-2">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#1E1E1E] text-sm">Overdue Follow-ups - Flagged Patients</CardTitle>
                <Badge className="bg-[#CD5E31] text-[10px] h-4 px-1.5 gap-0.5">
                  <Flag size={10} />
                  {visits.length} flagged
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {visits.map((visit: any) => {
                    return (
                      <div key={visit.patientId} className="border border-[#D4DBDE] rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[#1E1E1E] text-xs">{visit.patientName}</span>
                              <Badge className="text-[10px] h-4 px-1.5">{visit.patientId}</Badge>
                              <Badge className="text-[10px] h-4 px-1.5 bg-[#CD5E31] text-white">High</Badge>
                            </div>
                            <div className="text-[10px] text-[#4D6186] mb-1.5 flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                <MapPin size={10} />
                                {visit.barangay}
                              </div>
                              <span>•</span>
                              <span className="text-[#CD5E31]">Overdue follow-up</span>
                            </div>
                            <div className="text-[10px] text-[#1E1E1E] mb-1">{visit.reason}</div>
                            <div className="flex gap-1 flex-wrap">
                              {(visit.conditions || []).map((condition: string) => (
                                <Badge 
                                  key={condition}
                                  variant="outline"
                                  className={`text-[9px] h-3.5 px-1 ${
                                    condition === 'HTN' 
                                      ? 'border-[#CD5E31] text-[#CD5E31]' 
                                      : 'border-[#274492] text-[#274492]'
                                  }`}
                                >
                                  {condition}
                                </Badge>
                              ))}
                              {visit.lastBP && (
                                <span className="text-[9px] text-[#4D6186]">BP: {visit.lastBP}</span>
                              )}
                              {visit.lastHbA1c && (
                                <span className="text-[9px] text-[#4D6186]">HbA1c: {visit.lastHbA1c}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-[#D4DBDE] h-6 text-[10px] px-2 gap-0.5"
                              onClick={() => setSelectedPatient(visit.patient || null)}
                            >
                              <Phone size={10} />
                              Call
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-[#7C3AED] hover:bg-[#6D28D9] h-6 text-[10px] px-2"
                              onClick={() => setShowScheduleVisit(true)}
                            >
                              Schedule
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
            <h3 className="text-[#1E1E1E] mb-1 text-xs">Field Resources Management</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Essential equipment and medication inventory for field operations. Ensure adequate supplies before mobile clinic visits. Critical items flagged for restocking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[#4D6186] text-xs mb-0.5">Field Equipment</p>
                    <div className="text-[#1E1E1E] text-2xl">18</div>
                    <p className="text-teal-600 text-xs mt-0.5">All functional</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                    <Package size={14} className="text-[#7C3AED]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[#4D6186] text-xs mb-0.5">Test Strips Available</p>
                    <div className="text-[#1E1E1E] text-2xl">2,400</div>
                    <p className="text-teal-600 text-xs mt-0.5">40 days supply</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                    <AlertTriangle size={14} className="text-[#7C3AED]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[#4D6186] text-xs mb-0.5">Medications Loaded</p>
                    <div className="text-[#1E1E1E] text-2xl">1,330</div>
                    <p className="text-teal-600 text-xs mt-0.5">Tablets for distribution</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                    <Package size={14} className="text-[#7C3AED]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Medical Equipment Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {[
                    { item: 'BP Monitors (Digital)', qty: 12, status: 'Good', calibration: 'Sep 15, 2025' },
                    { item: 'Glucometers', qty: 15, status: 'Good', calibration: 'Oct 1, 2025' },
                    { item: 'Stethoscopes', qty: 10, status: 'Good', calibration: 'N/A' },
                    { item: 'Weighing Scales', qty: 6, status: 'Fair', calibration: 'Jul 10, 2025' },
                    { item: 'Height Boards', qty: 6, status: 'Good', calibration: 'N/A' },
                  ].map((equipment, idx) => (
                    <div key={idx} className="p-2 border border-[#D4DBDE] rounded-md bg-[#F9FAFB]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#1E1E1E]">{equipment.item}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] h-4 px-1.5 ${
                            equipment.status === 'Good' 
                              ? 'border-teal-500 text-teal-700 bg-teal-50' 
                              : 'border-amber-500 text-amber-700 bg-amber-50'
                          }`}
                        >
                          {equipment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#4D6186]">
                        <span>{equipment.qty} units available</span>
                        <span>Last calib: {equipment.calibration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Medication for Field Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {[
                    { name: 'Metformin 500mg', qty: 450, days: 45, status: 'Good' },
                    { name: 'Amlodipine 5mg', qty: 380, days: 38, status: 'Fair' },
                    { name: 'Losartan 50mg', qty: 320, days: 32, status: 'Low' },
                    { name: 'Glimepiride 2mg', qty: 180, days: 28, status: 'Low' },
                  ].map((med, idx) => (
                    <div key={idx} className="p-2 border border-[#D4DBDE] rounded-md bg-[#F9FAFB]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#1E1E1E]">{med.name}</span>
                        <Badge 
                          className={`text-[10px] h-4 px-1.5 ${
                            med.status === 'Good' 
                              ? 'bg-[#7C3AED] hover:bg-[#6D28D9]' 
                              : med.status === 'Fair'
                              ? 'bg-[#E6B99B] hover:bg-[#CD5E31] text-[#1E1E1E]'
                              : 'bg-[#CD5E31] hover:bg-[#B14F22]'
                          }`}
                        >
                          {med.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#4D6186]">
                        <span>{med.qty} tablets loaded</span>
                        <span>{med.days} days supply</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Stock Alert:</strong> Losartan and Glimepiride below 30-day supply. Coordinate with main pharmacy for restocking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Medical Consumables Inventory</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'Glucose Test Strips', stock: 2400, days: 40, monthly: 1800 },
                  { name: 'Lancets', stock: 5000, days: 75, monthly: 2000 },
                  { name: 'Alcohol Swabs', stock: 3000, days: 75, monthly: 1200 },
                  { name: 'Cotton Balls', stock: 1500, days: 56, monthly: 800 },
                  { name: 'Syringes (3ml)', stock: 800, days: 60, monthly: 400 },
                  { name: 'Bandages', stock: 500, days: 75, monthly: 200 },
                ].map((item, idx) => (
                  <div key={idx} className="p-2 border border-[#D4DBDE] rounded-md">
                    <div className="text-xs text-[#1E1E1E] mb-1">{item.name}</div>
                    <div className="text-lg text-[#7C3AED] mb-0.5">{item.stock}</div>
                    <div className="text-[10px] text-[#4D6186] space-y-0.5">
                      <div>{item.days} days supply</div>
                      <div>{item.monthly}/mo average use</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SendReminderDialog open={showSendReminder} onOpenChange={setShowSendReminder} />
      <ScheduleVisitDialog open={showScheduleVisit} onOpenChange={setShowScheduleVisit} />
      <OfflinePackDialog open={showOfflinePack} onOpenChange={setShowOfflinePack} />
      <TodaysVisitsDialog open={showTodaysVisits} onClose={() => setShowTodaysVisits(false)} />
      <TeamMembersDialog open={showTeamMembers} onClose={() => setShowTeamMembers(false)} />
      <PatientModal 
        patient={selectedPatient}
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
}
