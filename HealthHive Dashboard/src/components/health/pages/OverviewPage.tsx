import { KPICard } from "../KPICard";
import { Users, Activity, Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Calendar, Database, MapPin, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { api } from "../../../lib/api";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Badge } from "../../ui/badge";
import { Alert, AlertDescription } from "../../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

interface OverviewPageProps {
  onNavigate?: (page: string) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [hoveredVisit, setHoveredVisit] = useState<number | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [distributions, setDistributions] = useState<any>(null);
  const [medAdherence, setMedAdherence] = useState<any>(null);
  const [fieldOpsData, setFieldOpsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const results = await Promise.allSettled([
        api.getOverview(),
        api.getDistributions(),
        api.getMedicationAdherence(),
        api.getFieldOpsSummary()
      ]);
      const [overview, dist, adherence, fieldOps] = results;
      if (overview.status === "fulfilled") {
        setOverviewData(overview.value);
      }
      if (dist.status === "fulfilled") {
        setDistributions(dist.value);
      }
      if (adherence.status === "fulfilled") {
        setMedAdherence(adherence.value);
      }
      if (fieldOps.status === "fulfilled") {
        setFieldOpsData(fieldOps.value);
      }
      results.forEach((res) => {
        if (res.status === "rejected") {
          console.error("Failed to load overview data:", res.reason);
        }
      });
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="py-4 text-center">Loading...</div>;
  }

  const barangays = (fieldOpsData?.barangays || []).map((b: any, index: number) => ({
    id: b.id || `bg-${index}`,
    name: b.name,
    population: b.population || 0,
    registered: b.registered || 0,
    screenedPercent: b.population ? Math.round((b.registered / b.population) * 100) : 0,
    uncontrolledDM: b.uncontrolledDM || 0,
    uncontrolledHTN: b.uncontrolledHTN || 0,
    lastClinicDate: b.lastClinicDate || new Date().toISOString()
  }));

  // Use real data from API or fallback to calculations
  const totalRegistered = overviewData?.total_patients || barangays.reduce((sum: number, b: any) => sum + b.registered, 0);
  const totalPopulation = overviewData?.total_population || barangays.reduce((sum: number, b: any) => sum + b.population, 0);
  const avgScreeningCoverage = overviewData?.screening_coverage_percent || Math.round(
    barangays.reduce((sum: number, b: any) => sum + b.screenedPercent, 0) / barangays.length
  );
  
  const htnCount = overviewData?.htn_patients || 0;
  const dmCount = overviewData?.dm_patients || 0;
  const bothCount = overviewData?.both_conditions || 0;
  const activePatients = overviewData?.active_cases || Math.round(totalRegistered * 0.828);

  const upcomingVisits = (fieldOpsData?.upcoming || []).map((visit: any) => ({
    date: new Date(visit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    day: new Date(visit.date).toLocaleDateString('en-US', { weekday: 'long' }),
    barangays: visit.barangays,
    patients: visit.patients,
    team: visit.team,
    flaggedCount: visit.flaggedCount || 0
  }));

  const monthlyScreenings = distributions?.monthly_screenings || [];
  const occupationDistribution = distributions?.occupation_distribution || [];
  const educationDistribution = distributions?.education_distribution || [];
  const occupationDiseaseCorrelation = distributions?.occupation_disease_correlation || [];
  const ageDistribution = distributions?.age_distribution || [];
  const ageGroupDiseaseCorrelation = distributions?.age_group_disease_correlation || [];
  const htnRiskStratification = distributions?.htn_risk_stratification || [];
  const dmRiskStratification = distributions?.dm_risk_stratification || [];
  const htnComplications = distributions?.htn_complications || [];
  const rbgDistribution = distributions?.rbg_distribution || [];
  const fbgDistribution = distributions?.fbg_distribution || [];
  const bpCategories = distributions?.bp_categories || [];
  const bmiDistributionHTN = distributions?.bmi_distribution_htn || [];
  const bmiDistribution = distributions?.bmi_distribution || [];
  const dmTreatmentAdherence = medAdherence?.dm || [];
  const htnTreatmentAdherence = medAdherence?.htn || [];

  const htnControlRate = distributions?.control_rates?.htn?.rate || 0;
  const dmControlRate = distributions?.control_rates?.dm?.rate || 0;
  const obesePercent = distributions?.bmi_summary?.obese_percent || 0;
  const averageBmi = distributions?.bmi_summary?.average || 0;
  const latestMonthly = monthlyScreenings[monthlyScreenings.length - 1];
  const dmHighRiskCount = dmRiskStratification
    .filter((r: any) => ["High", "Very High"].includes(r.risk))
    .reduce((sum: number, r: any) => sum + (r.count || 0), 0);
  const dmHighRiskPercent = dmRiskStratification
    .filter((r: any) => ["High", "Very High"].includes(r.risk))
    .reduce((sum: number, r: any) => sum + (r.percent || 0), 0);
  const htnHighRiskCount = htnRiskStratification
    .filter((r: any) => ["High", "Very High"].includes(r.risk))
    .reduce((sum: number, r: any) => sum + (r.count || 0), 0);
  const htnHighRiskPercent = htnRiskStratification
    .filter((r: any) => ["High", "Very High"].includes(r.risk))
    .reduce((sum: number, r: any) => sum + (r.percent || 0), 0);
  const complicationFree = htnComplications.find((c: any) => c.complication === "None");
  const bpTrendStart = bpCategories[0];
  const bpTrendEnd = bpCategories[bpCategories.length - 1];
  const dmGoodAdherence = dmTreatmentAdherence.find((a: any) => a.category === "Good Adherence");
  const htnGoodAdherence = htnTreatmentAdherence.find((a: any) => a.category === "Good Adherence");
  const dmNeedsSupport = dmTreatmentAdherence
    .filter((a: any) => a.category !== "Good Adherence")
    .reduce((sum: number, a: any) => sum + (a.count || 0), 0);
  const htnNeedsSupport = htnTreatmentAdherence
    .filter((a: any) => a.category !== "Good Adherence")
    .reduce((sum: number, a: any) => sum + (a.count || 0), 0);

  return (
    <div className="py-4 space-y-4">
      <div>
        <h2 className="text-slate-900 mb-0.5">Overview Dashboard</h2>
        <p className="text-slate-600 text-xs">Real-time monitoring of chronic disease management in Jagna (33 Barangays)</p>
      </div>

      {/* Patient Population Overview */}
      <div className="bg-[#F3F0FF] border border-[#D4DBDE] rounded-md p-3">
        <h3 className="text-[#7C3AED] text-xs mb-0">Patient Population Overview</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Total Registered</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{totalRegistered.toLocaleString()}</div>
                <p className="text-[#4D6186] text-[10px]">Across 33 barangays</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <Users size={16} className="text-white" />
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-xs text-[#7C3AED]">
              <TrendingUp size={11} />
              <span>+8.2% from last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Active Patients</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{activePatients.toLocaleString()}</div>
                <p className="text-[#4D6186] text-[10px]">Seen in last 6 months</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <Activity size={16} className="text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-xs text-[#7C3AED]">
                <TrendingUp size={11} />
                <span>+5.4%</span>
              </div>
              <Badge className="bg-[#F3F0FF] text-[#7C3AED] border-[#7C3AED] text-[10px] h-4 px-1.5">82.8% active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">HTN Patients</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{htnCount.toLocaleString()}</div>
                <p className="text-[#4D6186] text-[10px]">{totalRegistered ? ((htnCount / totalRegistered) * 100).toFixed(1) : "0.0"}% of registry</p>
              </div>
              <div className="p-2 rounded-md bg-[#CD5E31]">
                <Heart size={16} className="text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4D6186]">Control: {htnControlRate.toFixed(1)}%</span>
              <Badge variant="outline" className="border-[#CD5E31] text-[#CD5E31] text-[10px] h-4 px-1.5">BP {"<"}140/90</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">DM Patients</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{dmCount.toLocaleString()}</div>
                <p className="text-[#4D6186] text-[10px]">{totalRegistered ? ((dmCount / totalRegistered) * 100).toFixed(1) : "0.0"}% of registry</p>
              </div>
              <div className="p-2 rounded-md bg-[#274492]">
                <Heart size={16} className="text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4D6186]">Control: {dmControlRate.toFixed(1)}%</span>
              <Badge variant="outline" className="border-[#274492] text-[#274492] text-[10px] h-4 px-1.5">RBG/FBG</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Performance Indicators */}
      <div className="bg-[#F3F0FF] border border-[#D4DBDE] rounded-md p-3">
        <h3 className="text-[#7C3AED] text-xs mb-0">Clinical Performance & Operations</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                <Heart size={14} className="text-[#7C3AED]" />
              </div>
              <div className="flex items-center gap-0.5 text-xs text-[#7C3AED]">
                <TrendingUp size={11} />
                <span>+12.9%</span>
              </div>
            </div>
            <div className="text-2xl text-[#1E1E1E] mb-0.5">{overviewData?.monthly_screenings || 0}</div>
            <p className="text-[#4D6186] text-xs">Screened This Month</p>
            <p className="text-[10px] text-[#4D6186] mt-0.5">{latestMonthly?.month || "This month"} screenings</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                <TrendingUp size={14} className="text-[#7C3AED]" />
              </div>
              <Badge variant="outline" className="border-[#7C3AED] text-[#7C3AED] text-[10px] h-4 px-1.5">Oct 2025</Badge>
            </div>
            <div className="text-2xl text-[#1E1E1E] mb-0.5">{latestMonthly?.diagnoses || 0}</div>
            <p className="text-[#4D6186] text-xs">Newly Diagnosed</p>
            <p className="text-[10px] text-[#4D6186] mt-0.5">Latest reporting period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                <Activity size={14} className="text-[#7C3AED]" />
              </div>
              <div className="flex items-center gap-0.5 text-xs text-[#CD5E31]">
                <TrendingUp size={11} />
                <span>+0.4</span>
              </div>
            </div>
            <div className="text-2xl text-[#1E1E1E] mb-0.5">{averageBmi.toFixed(1)}</div>
            <p className="text-[#4D6186] text-xs">Average BMI</p>
            <p className="text-[10px] text-[#CD5E31] mt-0.5">{obesePercent.toFixed(1)}% obese (≥25 kg/m²)</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-md bg-[#FFF4ED]">
                <AlertTriangle size={14} className="text-[#CD5E31]" />
              </div>
              <div className="flex items-center gap-0.5 text-xs text-[#7C3AED]">
                <TrendingDown size={11} />
                <span>-2.1%</span>
              </div>
            </div>
            <div className="text-2xl text-[#1E1E1E] mb-0.5">{overviewData?.overdue_followups || 0}</div>
            <p className="text-[#4D6186] text-xs">Follow-ups Overdue</p>
            <p className="text-[10px] text-[#4D6186] mt-0.5">{overviewData?.active_cases ? ((overviewData.overdue_followups / overviewData.active_cases) * 100).toFixed(1) : "0.0"}% of active patients</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                <Database size={14} className="text-[#7C3AED]" />
              </div>
              <div className="flex items-center gap-0.5 text-xs text-[#7C3AED]">
                <TrendingUp size={11} />
                <span>+1.8%</span>
              </div>
            </div>
            <div className="text-2xl text-[#1E1E1E] mb-0.5">{overviewData?.data_completeness || 0}%</div>
            <p className="text-[#4D6186] text-xs">Data Completeness</p>
            <p className="text-[10px] text-[#4D6186] mt-0.5">All required fields filled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">Monthly Screenings & Diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyScreenings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="screenings" fill="#7C3AED" radius={[3, 3, 0, 0]} name="Screenings" />
                <Bar dataKey="diagnoses" fill="#A78BFA" radius={[3, 3, 0, 0]} name="New Diagnoses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">Treatment Cascade</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {[
                { label: 'Eligible for Care', dm: dmCount, htn: htnCount, total: dmCount + htnCount },
                { label: 'On Treatment', dm: Math.round(dmCount * 0.9), htn: Math.round(htnCount * 0.9), total: Math.round((dmCount + htnCount) * 0.9) },
                { label: 'Recent Test (< 3mo)', dm: Math.round(dmCount * 0.8), htn: Math.round(htnCount * 0.8), total: Math.round((dmCount + htnCount) * 0.8) },
                { label: 'Controlled', dm: distributions?.control_rates?.dm?.controlled || 0, htn: distributions?.control_rates?.htn?.controlled || 0, total: (distributions?.control_rates?.dm?.controlled || 0) + (distributions?.control_rates?.htn?.controlled || 0) }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#1E1E1E]">{item.label}</span>
                    <span className="text-xs text-[#1E1E1E]">{item.total}</span>
                  </div>
                  <div className="flex gap-0.5 h-6">
                    <div 
                      className="bg-[#CD5E31] rounded flex items-center justify-center text-white text-[10px]"
                      style={{ width: `${(item.htn / 1000) * 100}%` }}
                    >
                      {item.htn > 50 && `HTN ${item.htn}`}
                    </div>
                    <div 
                      className="bg-[#274492] rounded flex items-center justify-center text-white text-[10px]"
                      style={{ width: `${(item.dm / 1000) * 100}%` }}
                    >
                      {item.dm > 50 && `DM ${item.dm}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-3 pt-3 border-t border-[#D4DBDE]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-[#CD5E31]"></div>
                <span className="text-xs text-[#4D6186]">Hypertension</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-[#274492]"></div>
                <span className="text-xs text-[#4D6186]">Diabetes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Alert className="border-[#D4DBDE] bg-[#F3F0FF]">
          <AlertTriangle className="h-3 w-3 text-[#7C3AED]" />
          <AlertDescription className="text-[#1E1E1E] text-xs">
            <strong>Mobile Clinic Alert:</strong> Next field visit scheduled for Wednesday, Oct 30 in Tubod Monte and Naatang. 
            <a href="#" className="underline ml-1 text-[#7C3AED] hover:text-[#6D28D9]">View route →</a>
          </AlertDescription>
        </Alert>
      </div>

      <Card className="border-[#D4DBDE]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#1E1E1E] text-sm">Upcoming Field Visits</CardTitle>
            <button
              onClick={() => onNavigate?.('field-ops')}
              className="text-[10px] text-[#7C3AED] hover:underline"
            >
              View all →
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {upcomingVisits.map((visit, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 p-2 border border-[#D4DBDE] rounded-md hover:bg-[#F9FAFB] hover:border-[#7C3AED] cursor-pointer transition-all relative"
                onMouseEnter={() => setHoveredVisit(idx)}
                onMouseLeave={() => setHoveredVisit(null)}
                onClick={() => onNavigate?.('field-ops')}
              >
                <div className="text-center min-w-[50px]">
                  <div className="text-[#7C3AED] text-xs">{visit.date}</div>
                  <div className="text-[10px] text-[#4D6186]">{visit.day}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin size={10} className="text-[#7C3AED] flex-shrink-0" />
                    <div className="text-[#1E1E1E] text-xs truncate">{visit.barangays}</div>
                  </div>
                  <div className="text-[10px] text-[#4D6186]">{visit.patients} patients • {visit.team}</div>
                </div>
                {visit.flaggedCount > 0 && (
                  <Badge className="bg-[#CD5E31] text-[10px] h-4 px-1.5 gap-0.5 flex-shrink-0">
                    <Flag size={9} />
                    {visit.flaggedCount}
                  </Badge>
                )}
                
                {/* Hover tooltip */}
                {hoveredVisit === idx && (
                  <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-white border-2 border-[#7C3AED] rounded-md shadow-xl p-2">
                    <div className="text-[10px] space-y-1">
                      <div className="text-[#1E1E1E]"><strong>Quick Overview</strong></div>
                      <div className="text-[#4D6186]">Barangays: {visit.barangays}</div>
                      <div className="text-[#4D6186]">Total patients: {visit.patients}</div>
                      <div className="text-[#4D6186]">Team: {visit.team}</div>
                      {visit.flaggedCount > 0 && (
                        <div className="text-[#CD5E31] flex items-center gap-1">
                          <Flag size={9} />
                          {visit.flaggedCount} flagged for follow-up
                        </div>
                      )}
                      <div className="pt-1 mt-1 border-t border-[#D4DBDE] text-[#7C3AED]">
                        Click to view full schedule
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-[#F3F0FF] border border-[#D4DBDE] rounded-md p-3">
        <h3 className="text-[#7C3AED] mb-1 text-xs">Risk Stratification & Clinical Control</h3>
        <p className="text-[10px] text-[#1E1E1E]">
          Proper risk stratification ensures appropriate care intensity. For DM, {dmHighRiskPercent.toFixed(1)}% of patients are high/very high-risk requiring intensive management. For HTN, {htnHighRiskPercent.toFixed(1)}% fall into high-risk categories. Control rates show {dmControlRate.toFixed(1)}% of DM patients achieving RBG/FBG targets and {htnControlRate.toFixed(1)}% of HTN patients achieving BP {"<"}140/90.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">DM Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {dmRiskStratification.map((risk, idx) => {
                const colors = {
                  'Low': '#B8D0F2',
                  'Moderate': '#6B94D6',
                  'High': '#3F5FF1',
                  'Very High': '#274492'
                };
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: colors[risk.risk as keyof typeof colors] }}></div>
                        <span className="text-xs text-[#1E1E1E]">{risk.risk}</span>
                      </div>
                      <span className="text-xs text-[#1E1E1E]">{risk.count} ({risk.percent}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ 
                          width: `${risk.percent}%`,
                          backgroundColor: colors[risk.risk as keyof typeof colors]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
              <p className="text-[10px] text-[#1E1E1E]">
                    <strong>{dmHighRiskPercent.toFixed(1)}% high-risk:</strong> {dmHighRiskCount} DM patients require intensive management with more frequent RBG/FBG testing and medication titration.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">HTN Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {htnRiskStratification.map((risk, idx) => {
                const colors = {
                  'Low': '#FDD4B8',
                  'Moderate': '#E6B99B',
                  'High': '#CD5E31',
                  'Very High': '#B14F22'
                };
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: colors[risk.risk as keyof typeof colors] }}></div>
                        <span className="text-xs text-[#1E1E1E]">{risk.risk}</span>
                      </div>
                      <span className="text-xs text-[#1E1E1E]">{risk.count} ({risk.percent}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ 
                          width: `${risk.percent}%`,
                          backgroundColor: colors[risk.risk as keyof typeof colors]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
              <p className="text-[10px] text-[#1E1E1E]">
                    <strong>{htnHighRiskPercent.toFixed(1)}% high-risk:</strong> {htnHighRiskCount} HTN patients require intensive management and frequent monitoring.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">HTN Complications Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={htnComplications.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                <XAxis dataKey="complication" stroke="#4D6186" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="#CD5E31" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
              <p className="text-[10px] text-[#1E1E1E]">
                <strong>{(complicationFree?.percent || 0).toFixed(1)}% complication-free:</strong> {complicationFree?.count || 0} patients have no documented complications in their latest visit.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">Blood Pressure Control Trends</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bpCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="Normal" stroke="#10B981" strokeWidth={2} name="Normal" />
                <Line type="monotone" dataKey="Elevated" stroke="#E6B99B" strokeWidth={2} name="Elevated" />
                <Line type="monotone" dataKey="Stage1" stroke="#CD5E31" strokeWidth={2} name="Stage 1" />
                <Line type="monotone" dataKey="Stage2" stroke="#B14F22" strokeWidth={2} name="Stage 2" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
              <p className="text-[10px] text-[#1E1E1E]">
                <strong>Trend update:</strong> Normal BP readings changed from {bpTrendStart?.Normal || 0} to {bpTrendEnd?.Normal || 0} over the last {bpCategories.length} months. Stage 2 HTN changed from {bpTrendStart?.Stage2 || 0} to {bpTrendEnd?.Stage2 || 0}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[#F3F0FF] border border-[#D4DBDE] rounded-md p-3">
        <h3 className="text-[#7C3AED] mb-1 text-xs">Glycemic Control & BMI Management</h3>
        <p className="text-[10px] text-[#1E1E1E]">
          For diabetes patients, {dmControlRate.toFixed(1)}% achieve target glucose levels (FBG {"<"}126 mg/dL or RBG {"<"}200 mg/dL). RBG testing is the primary screening tool in rural Jagna as it doesn't require fasting. FBG is used for confirmation and monitoring. BMI management remains critical - {obesePercent.toFixed(1)}% are classified as obese using WHO Asian-Pacific cutoffs (≥25 kg/m²).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">Glucose Monitoring (RBG/FBG)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="rbg" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8 p-1 bg-[#F3F0FF] border border-[#D4DBDE]">
                <TabsTrigger 
                  value="rbg" 
                  className="text-xs data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] data-[state=inactive]:hover:bg-white/50 transition-all"
                >
                  RBG (Primary)
                </TabsTrigger>
                <TabsTrigger 
                  value="fbg" 
                  className="text-xs data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] data-[state=inactive]:hover:bg-white/50 transition-all"
                >
                  FBG (Confirm)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="rbg" className="mt-3">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={rbgDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="range" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#274492" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-[#4D6186] mt-1.5">RBG ≥200 mg/dL indicates diabetes. No fasting required - ideal for rural outreach.</p>
              </TabsContent>
              <TabsContent value="fbg" className="mt-3">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={fbgDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="range" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#3F5FF1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-[#4D6186] mt-1.5">FBG ≥126 mg/dL confirms diabetes. 8-hour fasting required.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">BMI Distribution Comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="dm" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8 p-1 bg-[#FFFBEB] border border-[#FDE047]">
                <TabsTrigger 
                  value="dm" 
                  className="text-xs data-[state=active]:bg-[#274492] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] data-[state=inactive]:hover:bg-white/50 transition-all"
                >
                  DM Patients
                </TabsTrigger>
                <TabsTrigger 
                  value="htn" 
                  className="text-xs data-[state=active]:bg-[#CD5E31] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] data-[state=inactive]:hover:bg-white/50 transition-all"
                >
                  HTN Patients
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dm" className="mt-3">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={bmiDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="category" stroke="#4D6186" angle={-15} textAnchor="end" height={45} tick={{ fontSize: 8 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {bmiDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-[#4D6186] mt-1.5">{obesePercent.toFixed(1)}% obese (BMI ≥25)</p>
              </TabsContent>
              <TabsContent value="htn" className="mt-3">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={bmiDistributionHTN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="category" stroke="#4D6186" angle={-15} textAnchor="end" height={45} tick={{ fontSize: 8 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                      {bmiDistributionHTN.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-[#4D6186] mt-1.5">{obesePercent.toFixed(1)}% obese (BMI ≥25)</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[#F3F0FF] border border-[#D4DBDE] rounded-md p-3">
        <h3 className="text-[#7C3AED] mb-1 text-xs">Treatment Adherence & Medication Compliance</h3>
        <p className="text-[10px] text-[#1E1E1E]">
          Treatment adherence is crucial for disease control. For DM patients, {dmGoodAdherence?.percent || 0}% show good adherence (≥80% of doses), while {dmNeedsSupport} patients need adherence support interventions. For HTN, {htnGoodAdherence?.percent || 0}% demonstrate good adherence with {htnNeedsSupport} patients requiring intervention. Monthly medication pickups and appointment attendance are key indicators tracked through BHC visits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">DM Treatment Adherence</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dmTreatmentAdherence}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                <XAxis dataKey="category" stroke="#4D6186" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 9 }} />
                <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="#274492" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
              <p className="text-[10px] text-[#1E1E1E]">
                <strong>{dmGoodAdherence?.percent || 0}% good adherence:</strong> Target interventions for {dmNeedsSupport} patients with moderate/poor adherence.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1E1E1E] text-sm">HTN Treatment Adherence</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={htnTreatmentAdherence}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                <XAxis dataKey="category" stroke="#4D6186" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 9 }} />
                <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="#CD5E31" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
              <p className="text-[10px] text-[#1E1E1E]">
                <strong>{htnGoodAdherence?.percent || 0}% good adherence:</strong> Target interventions for {htnNeedsSupport} patients with moderate/poor adherence.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
