import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { 
  BarChart, 
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { api } from "../../../lib/api";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Download, Filter, Calendar, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useEffect, useState } from "react";

export function AnalyticsPage() {
  const [cohortTimeRange, setCohortTimeRange] = useState('6months');
  const [cohortView, setCohortView] = useState('summary');
  const [distributions, setDistributions] = useState<any>(null);
  const [htnTrends, setHtnTrends] = useState<any[]>([]);
  const [dmTrends, setDmTrends] = useState<any[]>([]);
  const [cohortSeries, setCohortSeries] = useState<any[]>([]);
  const [fieldOpsData, setFieldOpsData] = useState<any>(null);
  const [medAdherence, setMedAdherence] = useState<any>(null);

  useEffect(() => {
    async function loadAnalytics() {
      const results = await Promise.allSettled([
        api.getDistributions(),
        api.getHtnTrends(),
        api.getDmTrends(),
        api.getCohortSeries(),
        api.getFieldOpsSummary(),
        api.getMedicationAdherence()
      ]);
      const [dist, htn, dm, cohort, fieldOps, adherence] = results;
      if (dist.status === "fulfilled") setDistributions(dist.value);
      if (htn.status === "fulfilled") setHtnTrends(htn.value.trends || []);
      if (dm.status === "fulfilled") setDmTrends(dm.value.trends || []);
      if (cohort.status === "fulfilled") setCohortSeries(cohort.value.series || []);
      if (fieldOps.status === "fulfilled") setFieldOpsData(fieldOps.value);
      if (adherence.status === "fulfilled") setMedAdherence(adherence.value);
      results.forEach((res) => {
        if (res.status === "rejected") {
          console.error("Failed to load analytics data:", res.reason);
        }
      });
    }
    loadAnalytics();
  }, []);

  const barangays = fieldOpsData?.barangays || [];
  const topBarangaysHTN = barangays
    .map((bg: any) => ({
      name: bg.name,
      uncontrolled: bg.uncontrolledHTN || 0,
      total: bg.registered || 0
    }))
    .sort((a: any, b: any) => b.uncontrolled - a.uncontrolled)
    .slice(0, 8);

  const topBarangaysDM = barangays
    .map((bg: any) => ({
      name: bg.name,
      uncontrolled: bg.uncontrolledDM || 0,
      total: bg.registered || 0
    }))
    .sort((a: any, b: any) => b.uncontrolled - a.uncontrolled)
    .slice(0, 8);

  const fbgDistribution = distributions?.fbg_distribution || [];
  const rbgDistribution = distributions?.rbg_distribution || [];
  const bpCategories = distributions?.bp_categories || [];
  const htnRiskStratification = distributions?.htn_risk_stratification || [];
  const dmRiskStratification = distributions?.dm_risk_stratification || [];
  const occupationDiseaseCorrelation = distributions?.occupation_disease_correlation || [];
  const medicationDistribution = distributions?.medication_distribution || [];
  const ageGroupDiseaseCorrelation = distributions?.age_group_disease_correlation || [];
  const htnTreatmentAdherence = medAdherence?.htn || [];
  const dmTreatmentAdherence = medAdherence?.dm || [];

  const htnTotal = htnRiskStratification.reduce((sum: number, r: any) => sum + (r.count || 0), 0);
  const dmTotal = dmRiskStratification.reduce((sum: number, r: any) => sum + (r.count || 0), 0);
  const htnControlRate = distributions?.control_rates?.htn?.rate || 0;
  const dmControlRate = distributions?.control_rates?.dm?.rate || 0;
  const medicationPercents = medicationDistribution.map((m: any) => m.percent || 0);
  const medicationMin = medicationPercents.length ? Math.min(...medicationPercents) : 0;
  const medicationMax = medicationPercents.length ? Math.max(...medicationPercents) : 0;
  const retention6 = cohortSeries.filter((c: any) => c.month6 !== null && c.enrolled > 0);
  const retention12 = cohortSeries.filter((c: any) => c.month12 !== null && c.enrolled > 0);
  const avgRetention6 = retention6.length
    ? (retention6.reduce((sum: number, c: any) => sum + (c.month6 / c.enrolled) * 100, 0) / retention6.length)
    : 0;
  const avgRetention12 = retention12.length
    ? (retention12.reduce((sum: number, c: any) => sum + (c.month12 / c.enrolled) * 100, 0) / retention12.length)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-4 space-y-4 analytics-print-root">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-slate-900 mb-0.5">Chronic Disease Analytics</h2>
          <p className="text-slate-600 text-xs">Comprehensive monitoring and analysis of hypertension and diabetes programs across 33 barangays, tracking patient control rates, treatment adherence, risk stratification, and geographic patterns to guide targeted interventions.</p>
        </div>
        <Button onClick={handlePrint} size="sm" variant="outline" className="h-7 text-xs gap-1.5 no-print">
          <Printer size={12} />
          Print PDF
        </Button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .analytics-print-root [data-state="inactive"] { display: none !important; }
          .analytics-print-root { background: #fff !important; }
          .analytics-print-root .recharts-wrapper,
          .analytics-print-root .recharts-surface,
          .analytics-print-root .border,
          .analytics-print-root .rounded-md,
          .analytics-print-root .rounded-xl,
          .analytics-print-root .card { break-inside: avoid; }
          .analytics-print-root .shadow,
          .analytics-print-root .shadow-md,
          .analytics-print-root .hover\\:shadow-md { box-shadow: none !important; }
        }
      `}</style>

      <Tabs defaultValue="hypertension" className="space-y-3">
        <TabsList className="h-7 no-print">
          <TabsTrigger value="hypertension" className="text-xs px-3">Hypertension</TabsTrigger>
          <TabsTrigger value="diabetes" className="text-xs px-3">Diabetes Mellitus</TabsTrigger>
          <TabsTrigger value="cohorts" className="text-xs px-3">Cohort Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="hypertension" className="space-y-4 print-section">
          <div className="bg-[#FFF4ED] border border-[#D4DBDE] rounded-md p-3">
            <h3 className="text-[#CD5E31] mb-1 text-xs">Hypertension Program Overview</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Hypertension affects {htnTotal} patients across all barangays in Jagna. With a {htnControlRate.toFixed(1)}% control rate (BP {'<'}140/90 mmHg), the HTN-first program focuses on identifying uncontrolled cases, ensuring medication adherence, and scheduling timely BP follow-ups through BHC and messenger outreach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">Total HTN Patients</p>
                <div className="text-slate-900 text-2xl">{htnTotal}</div>
                <p className="text-[#CD5E31] text-xs mt-0.5">{htnTotal ? ((htnTotal / Math.max(htnTotal + dmTotal, 1)) * 100).toFixed(1) : "0.0"}% of registry</p>
              </CardContent>
            </Card>
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">Controlled (BP {'<'}140/90)</p>
                <div className="text-slate-900 text-2xl">{distributions?.control_rates?.htn?.controlled || 0}</div>
                <p className="text-teal-600 text-xs mt-0.5">{htnControlRate.toFixed(1)}% control rate</p>
              </CardContent>
            </Card>
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">Uncontrolled (BP {'≥'}140/90)</p>
                <div className="text-slate-900 text-2xl">{Math.max(htnTotal - (distributions?.control_rates?.htn?.controlled || 0), 0)}</div>
                <p className="text-orange-600 text-xs mt-0.5">Need follow-up</p>
              </CardContent>
            </Card>
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">High Risk (Stage 2+)</p>
                <div className="text-slate-900 text-2xl">{htnRiskStratification.filter((r: any) => ["High", "Very High"].includes(r.risk)).reduce((sum: number, r: any) => sum + (r.count || 0), 0)}</div>
                <p className="text-orange-600 text-xs mt-0.5">BP {'≥'}160/100 or complications</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
            <h3 className="text-[#1E1E1E] mb-1 text-xs">Priority Areas for Outreach</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Focus outreach and BHC follow-ups on barangays with highest uncontrolled HTN counts. Target high-risk patients for messenger nudges to ensure timely BP checks and medication refills.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Top 8 Barangays by Uncontrolled HTN</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topBarangaysHTN} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis type="number" stroke="#4D6186" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="name" type="category" stroke="#4D6186" width={80} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="uncontrolled" fill="#CD5E31" name="Uncontrolled" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Action:</strong> Prioritize outreach to {topBarangaysHTN[0]?.name} ({topBarangaysHTN[0]?.uncontrolled} uncontrolled), {topBarangaysHTN[1]?.name} ({topBarangaysHTN[1]?.uncontrolled}), and {topBarangaysHTN[2]?.name} ({topBarangaysHTN[2]?.uncontrolled}) for BP follow-up campaigns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Risk Stratification</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {htnRiskStratification.map((risk, idx) => {
                    const colors = {
                      'Low': '#274492',
                      'Moderate': '#92A4C1',
                      'High': '#E6B99B',
                      'Very High': '#CD5E31'
                    };
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: colors[risk.risk as keyof typeof colors] }}></div>
                            <span className="text-xs text-[#1E1E1E]">{risk.risk} Risk</span>
                          </div>
                          <span className="text-xs text-[#1E1E1E]">{risk.count} ({risk.percent}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${risk.percent}%`,
                              backgroundColor: colors[risk.risk as keyof typeof colors]
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-[#4D6186] mt-0.5">{risk.description}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>{htnRiskStratification.filter((r: any) => ["High", "Very High"].includes(r.risk)).reduce((sum: number, r: any) => sum + (r.count || 0), 0)} high-risk patients</strong> (High + Very High) require intensive monitoring, monthly BP checks, and messenger follow-up.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Treatment Adherence</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={htnTreatmentAdherence}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="category" stroke="#4D6186" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 9 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#4D6186" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>202 HTN patients</strong> (35%) with moderate/poor adherence need medication counseling and reminder system via messenger for BP control.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">BP Control Trends (6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={bpCategories}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="Normal" stroke="#274492" strokeWidth={2} name="Normal" />
                    <Line type="monotone" dataKey="Stage1" stroke="#E6B99B" strokeWidth={2} name="Stage 1" />
                    <Line type="monotone" dataKey="Stage2" stroke="#CD5E31" strokeWidth={2} name="Stage 2" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Positive trend:</strong> Stage 2 HTN declining (-31%), normal BP readings increasing (+28%). Continue BHC follow-up and messenger nudge strategy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Medication Distribution (HTN)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {medicationDistribution.filter((_, idx) => idx < 2).map((med, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#1E1E1E]">{med.medication}</span>
                      <span className="text-xs text-[#1E1E1E]">{med.distributed} / {med.patients} ({med.percent}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#CD5E31] transition-all"
                        style={{ width: `${med.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                <p className="text-xs text-[#1E1E1E]">
                  <strong>High coverage:</strong> Medication coverage ranges from {medicationMin.toFixed(1)}% to {medicationMax.toFixed(1)}%. Focus on patients not yet receiving treatment and optimize dual therapy for uncontrolled cases.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">High-Risk Occupations for HTN</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-3 mb-3">
                {occupationDiseaseCorrelation.slice(0, 3).map((occ, idx) => (
                  <div key={idx} className="p-3 bg-[#F9FAFB] rounded-md border border-[#D4DBDE]">
                    <div className="text-xs text-[#4D6186] mb-0.5">{occ.occupation}</div>
                    <div className="text-[#1E1E1E] text-sm mb-0.5">{occ.htnCount} patients</div>
                    <Badge className="bg-[#CD5E31] text-[10px] h-4 px-1.5">{occ.htnPrevalence}% prevalence</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#4D6186]">
                <strong>Key Finding:</strong> Unemployed/retired (15%), fishermen (9%), and farmers have highest HTN prevalence. High-sodium diets from preserved fish and salt are major contributors. Target dietary counseling for these groups.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diabetes" className="space-y-4 print-section">
          <div className="bg-[#EAF0F6] border border-[#D4DBDE] rounded-md p-3">
            <h3 className="text-[#274492] mb-1 text-xs">Diabetes Mellitus Program Overview</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Diabetes affects {dmTotal} patients across all barangays. Due to limited laboratory access in rural Jagna, we rely primarily on <strong>Random Blood Glucose (RBG)</strong> for initial screening and point-of-care monitoring. <strong>Fasting Blood Glucose (FBG)</strong> is performed for patients with elevated RBG (≥200 mg/dL) to confirm diagnosis and monitor control. HbA1c testing is available but limited. Current adherence rate is {dmTreatmentAdherence.find((a: any) => a.category === "Good Adherence")?.percent || 0}%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">Total DM Patients</p>
                <div className="text-slate-900 text-2xl">{dmTotal}</div>
                <p className="text-teal-600 text-xs mt-0.5">{dmTotal ? ((dmTotal / Math.max(htnTotal + dmTotal, 1)) * 100).toFixed(1) : "0.0"}% of registry</p>
              </CardContent>
            </Card>
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">Controlled (RBG/FBG)</p>
                <div className="text-slate-900 text-2xl">{distributions?.control_rates?.dm?.controlled || 0}</div>
                <p className="text-teal-600 text-xs mt-0.5">{dmControlRate.toFixed(1)}% control rate</p>
              </CardContent>
            </Card>
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">Uncontrolled</p>
                <div className="text-slate-900 text-2xl">{Math.max(dmTotal - (distributions?.control_rates?.dm?.controlled || 0), 0)}</div>
                <p className="text-orange-600 text-xs mt-0.5">RBG {'≥'}200 or FBG {'≥'}126</p>
              </CardContent>
            </Card>
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <p className="text-slate-600 text-xs mb-0.5">High Risk</p>
                <div className="text-slate-900 text-2xl">{dmRiskStratification.filter((r: any) => ["High", "Very High"].includes(r.risk)).reduce((sum: number, r: any) => sum + (r.count || 0), 0)}</div>
                <p className="text-orange-600 text-xs mt-0.5">Very high glucose + complications</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#EAF0F6] border border-[#D4DBDE] rounded-md p-3">
            <h3 className="text-[#274492] mb-1 text-xs">Glucose Monitoring Strategy</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              <strong>Two-tier approach:</strong> (1) <strong>RBG screening</strong> - done at outreach for all patients, anytime testing, ≥200 mg/dL indicates diabetes. (2) <strong>FBG confirmation</strong> - performed on patients with high RBG, requires 8-hour fasting, ≥126 mg/dL confirms diabetes. This accessible approach enables point-of-care monitoring at BHC outreach without requiring laboratory infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Random Blood Glucose (RBG) - Primary Screening</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={rbgDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="range" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#274492" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Primary screening tool:</strong> RBG testing doesn't require fasting - ideal for rural outreach. {rbgDistribution.slice(2).reduce((sum, item) => sum + item.count, 0)} patients with elevated RBG (≥200 mg/dL) flagged for FBG confirmation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Fasting Blood Glucose (FBG) - For High RBG</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={fbgDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="range" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#3F5FF1" radius={[3, 3, 0, 0]} name="DM Patients" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Follow-up test:</strong> FBG performed on patients with RBG ≥200. Requires 8-hour fasting. Target: FBG {'<'}126 mg/dL. {fbgDistribution.slice(2).reduce((sum, item) => sum + item.count, 0)} patients with confirmed diabetic FBG levels.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Top 8 Barangays by Uncontrolled DM</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topBarangaysDM} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis type="number" stroke="#4D6186" tick={{ fontSize: 9 }} />
                    <YAxis dataKey="name" type="category" stroke="#4D6186" width={80} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10 }} />
                    <Bar dataKey="uncontrolled" fill="#CD5E31" name="Uncontrolled" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Action:</strong> Prioritize glucose testing outreach to {topBarangaysDM[0]?.name} ({topBarangaysDM[0]?.uncontrolled} uncontrolled), {topBarangaysDM[1]?.name} ({topBarangaysDM[1]?.uncontrolled}), and {topBarangaysDM[2]?.name} ({topBarangaysDM[2]?.uncontrolled}).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Risk Stratification</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {dmRiskStratification.map((risk, idx) => {
                    const colors = {
                      'Low': '#274492',
                      'Moderate': '#92A4C1',
                      'High': '#E6B99B',
                      'Very High': '#CD5E31'
                    };
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded" style={{ backgroundColor: colors[risk.risk as keyof typeof colors] }}></div>
                            <span className="text-xs text-[#1E1E1E]">{risk.risk} Risk</span>
                          </div>
                          <span className="text-xs text-[#1E1E1E]">{risk.count} ({risk.percent}%)</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${risk.percent}%`,
                              backgroundColor: colors[risk.risk as keyof typeof colors]
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-[#4D6186] mt-0.5">{risk.description}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>{dmRiskStratification.filter((r: any) => ["High", "Very High"].includes(r.risk)).reduce((sum: number, r: any) => sum + (r.count || 0), 0)} high-risk patients</strong> (High + Very High) require intensive management and frequent glucose monitoring.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Treatment Adherence</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={dmTreatmentAdherence}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="category" stroke="#4D6186" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 9 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#274492" radius={[3, 3, 0, 0]} name="DM Patients" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>135 DM patients</strong> (32%) with moderate/poor adherence need medication counseling and reminder system for glucose control.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Medication Distribution (DM)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mt-3">
                  {medicationDistribution.filter((_, idx) => idx >= 2 && idx < 4).map((med, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#1E1E1E]">{med.medication}</span>
                        <span className="text-xs text-[#1E1E1E]">{med.distributed} / {med.patients} ({med.percent}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#274492] transition-all"
                          style={{ width: `${med.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>High Metformin coverage:</strong> 92% of DM patients receive first-line therapy. 34% on dual therapy with Glimepiride.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">High-Risk Occupations for DM</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-3 mb-3">
                {occupationDiseaseCorrelation.slice(0, 3).map((occ, idx) => (
                  <div key={idx} className="p-3 bg-[#F9FAFB] rounded-md border border-[#D4DBDE]">
                    <div className="text-xs text-[#4D6186] mb-0.5">{occ.occupation}</div>
                    <div className="text-[#1E1E1E] text-sm mb-0.5">{occ.dmCount} patients</div>
                    <Badge className="bg-[#274492] text-[10px] h-4 px-1.5">{occ.dmPrevalence}% prevalence</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#4D6186]">
                <strong>Key Finding:</strong> Unemployed/retired individuals show highest DM prevalence (9.1%), while farmers have most absolute cases (142) due to population size. Sedentary occupations show elevated rates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4 print-section">
          {/* Full-width header card */}
          <div className="bg-[#F3F0FF] border border-[#D4DBDE] rounded-md p-3">
            <h3 className="text-[#7C3AED] mb-1 text-xs">Cohort & Demographics Analysis</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Critical metrics for patient retention (88% at 12 months), demographic patterns, and risk factors to guide targeted interventions across all 33 barangays.
            </p>
          </div>

          {/* Filters and actions */}
          <div className="flex gap-2 items-center justify-end no-print">
            <Select value={cohortView} onValueChange={setCohortView}>
              <SelectTrigger className="w-[140px] h-7 text-xs border-[#D4DBDE]">
                <Filter size={12} className="mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary" className="text-xs">Summary View</SelectItem>
                <SelectItem value="detailed" className="text-xs">Detailed View</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cohortTimeRange} onValueChange={setCohortTimeRange}>
              <SelectTrigger className="w-[120px] h-7 text-xs border-[#D4DBDE]">
                <Calendar size={12} className="mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months" className="text-xs">Last 3 Months</SelectItem>
                <SelectItem value="6months" className="text-xs">Last 6 Months</SelectItem>
                <SelectItem value="12months" className="text-xs">Last 12 Months</SelectItem>
                <SelectItem value="all" className="text-xs">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-[#D4DBDE]">
              <Download size={12} />
              Download Report
            </Button>
          </div>

          {/* Summary Dashboard View */}
          {cohortView === 'summary' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="border-[#D4DBDE]">
                  <CardContent className="p-3">
                    <p className="text-[#4D6186] text-xs mb-0.5">6-Month Retention</p>
                    <div className="text-[#1E1E1E] text-2xl">91%</div>
                    <p className="text-teal-600 text-xs mt-0.5">Above target (90%)</p>
                  </CardContent>
                </Card>
                <Card className="border-[#D4DBDE]">
                  <CardContent className="p-3">
                    <p className="text-[#4D6186] text-xs mb-0.5">12-Month Retention</p>
                    <div className="text-[#1E1E1E] text-2xl">88%</div>
                    <p className="text-teal-600 text-xs mt-0.5">Above target (80%)</p>
                  </CardContent>
                </Card>
                <Card className="border-[#D4DBDE]">
                  <CardContent className="p-3">
                    <p className="text-[#4D6186] text-xs mb-0.5">High-Risk Occupation</p>
                    <div className="text-[#1E1E1E] text-2xl">15%</div>
                    <p className="text-[#CD5E31] text-xs mt-0.5">Unemployed/Retired</p>
                  </CardContent>
                </Card>
                <Card className="border-[#D4DBDE]">
                  <CardContent className="p-3">
                    <p className="text-[#4D6186] text-xs mb-0.5">Peak Age Group</p>
                    <div className="text-[#1E1E1E] text-2xl">60-69</div>
                    <p className="text-[#CD5E31] text-xs mt-0.5">16% HTN, 12% DM</p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
                <h3 className="text-[#1E1E1E] mb-1 text-xs">Key Insights</h3>
                <ul className="text-[10px] text-[#1E1E1E] space-y-1 ml-4 list-disc">
                  <li><strong>Strong retention:</strong> 91% of patients remain engaged at 6 months, exceeding 90% target</li>
                  <li><strong>High-risk groups:</strong> Focus on unemployed/retired (15% HTN) and 60-69 age group (highest prevalence)</li>
                  <li><strong>Occupation impact:</strong> Farmers show highest absolute case burden (316 total cases) due to population size</li>
                  <li><strong>Age threshold:</strong> Disease prevalence increases sharply after age 40 - prioritize screening for 40+ populations</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-[#D4DBDE]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#1E1E1E] text-sm">Retention Trend (Summary)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={180}>
                <LineChart data={cohortSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                        <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="month6" stroke="#274492" strokeWidth={2} name="6-Month" />
                        <Line type="monotone" dataKey="month12" stroke="#3F5FF1" strokeWidth={2} name="12-Month" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#D4DBDE]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#1E1E1E] text-sm">Top 5 High-Risk Occupations</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {occupationDiseaseCorrelation.slice(0, 5).map((occ, idx) => (
                        <div key={idx} className="p-2 bg-[#F9FAFB] rounded border border-[#D4DBDE]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#1E1E1E]">{occ.occupation}</span>
                            <div className="flex gap-1">
                              <Badge className="bg-[#CD5E31] text-[10px] h-4 px-1.5">{occ.htnPrevalence}% HTN</Badge>
                              <Badge className="bg-[#274492] text-[10px] h-4 px-1.5">{occ.dmPrevalence}% DM</Badge>
                            </div>
                          </div>
                          <div className="text-[10px] text-[#4D6186]">
                            {occ.htnCount + occ.dmCount} total cases
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Detailed View */}
          {cohortView === 'detailed' && (
            <>
              <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
                <h3 className="text-[#1E1E1E] mb-1 text-xs">Program Retention & Follow-up</h3>
                <p className="text-[10px] text-[#1E1E1E]">
                  Patient retention in chronic disease programs is critical for long-term outcomes. Tracking 6-month and 12-month follow-up rates by enrollment cohort helps identify drop-off points and improve engagement strategies. Target retention rates: 90% at 6 months, 80% at 12 months.
                </p>
              </div>

              <Card className="border-[#D4DBDE]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[#1E1E1E] text-sm">6-Month and 12-Month Retention by Enrollment Cohort</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={210}>
                    <LineChart data={cohortSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                      <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="enrolled" stroke="#C4B5FD" strokeWidth={1.5} name="Enrolled" />
                      <Line type="monotone" dataKey="month6" stroke="#A78BFA" strokeWidth={1.5} name="6-Month" />
                      <Line type="monotone" dataKey="month12" stroke="#7C3AED" strokeWidth={1.5} name="12-Month" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                    <p className="text-xs text-[#1E1E1E]">
                      <strong>Retention snapshot:</strong> Average {avgRetention6.toFixed(1)}% retention at 6 months and {avgRetention12.toFixed(1)}% at 12 months based on available cohorts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
                <h3 className="text-[#1E1E1E] mb-1 text-xs">Occupation-Disease Correlation</h3>
                <p className="text-[10px] text-[#1E1E1E]">
                  Understanding which occupations are most affected helps target interventions. Farmers and fishermen show higher HTN prevalence due to high-sodium diets and physical stress, while sedentary occupations (office workers, vendors) show elevated DM rates. Unemployed/retired individuals have highest prevalence due to age and reduced activity.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-[#D4DBDE]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#1E1E1E] text-sm">Disease Prevalence by Occupation</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="max-h-[420px] overflow-y-auto pr-1">
                      <ResponsiveContainer width="100%" height={occupationDiseaseCorrelation.length * 21}>
                        <BarChart data={occupationDiseaseCorrelation} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                          <XAxis type="number" stroke="#4D6186" tick={{ fontSize: 9 }} />
                          <YAxis dataKey="occupation" type="category" stroke="#4D6186" width={105} tick={{ fontSize: 8 }} />
                          <Tooltip contentStyle={{ fontSize: 10 }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="htnPrevalence" fill="#CD5E31" name="HTN Prevalence %" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="dmPrevalence" fill="#274492" name="DM Prevalence %" radius={[0, 0, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                      <p className="text-xs text-[#1E1E1E]">
                        <strong>All 17 Occupation Categories:</strong> Unemployed/seeking work shows highest prevalence (9.1% DM, 15% HTN) reflecting retired population, while students show lowest rates. Target high-risk occupations for preventive screenings.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#D4DBDE]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#1E1E1E] text-sm">Absolute Disease Count by Occupation</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="max-h-[420px] overflow-y-auto pr-1">
                      <ResponsiveContainer width="100%" height={occupationDiseaseCorrelation.length * 24}>
                        <BarChart data={occupationDiseaseCorrelation} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                          <XAxis type="number" stroke="#4D6186" tick={{ fontSize: 9 }} />
                          <YAxis dataKey="occupation" type="category" stroke="#4D6186" width={105} tick={{ fontSize: 8 }} />
                          <Tooltip contentStyle={{ fontSize: 10 }} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="htnCount" fill="#3F5FF1" name="HTN Cases" radius={[0, 3, 3, 0]} />
                          <Bar dataKey="dmCount" fill="#274492" name="DM Cases" radius={[0, 0, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                      <p className="text-xs text-[#1E1E1E]">
                        <strong>Highest burden:</strong> Farmers (316 total cases) and Fishermen (159 total cases) due to large population sizes and high prevalence rates. Focus intervention efforts on these occupational groups.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
                <h3 className="text-[#1E1E1E] mb-1 text-xs">Age-Specific Disease Prevalence</h3>
                <p className="text-[10px] text-[#1E1E1E]">
                  Age is the strongest predictor of chronic disease. Prevalence increases sharply after age 40, with peak rates in the 60-69 age group. Understanding age-specific patterns helps prioritize screening for at-risk age groups and plan age-appropriate interventions.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-[#D4DBDE]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#1E1E1E] text-sm">Disease Prevalence by Age Group</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={ageGroupDiseaseCorrelation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                        <XAxis dataKey="ageGroup" stroke="#4D6186" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="htnPrevalence" fill="#CD5E31" name="HTN Prevalence %" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="dmPrevalence" fill="#274492" name="DM Prevalence %" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-3 p-3 bg-[#F3F0FF] rounded-md border border-[#D4DBDE]">
                      <p className="text-xs text-[#1E1E1E]">
                        <strong>Key Pattern:</strong> DM prevalence peaks at 60-69 (12%), HTN at 60-69 (16%). Very low in under-30 population ({'<'}2%). Focus screening on 40+ age groups where prevalence increases significantly.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#D4DBDE]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#1E1E1E] text-sm">Absolute Disease Count by Age Group</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={210}>
                      <BarChart data={ageGroupDiseaseCorrelation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                        <XAxis dataKey="ageGroup" stroke="#4D6186" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="htnCount" fill="#3F5FF1" name="HTN Cases" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="dmCount" fill="#274492" name="DM Cases" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-3 p-3 bg-[#F3F0FF] rounded-md border border-[#D4DBDE]">
                      <p className="text-xs text-[#1E1E1E]">
                        <strong>Highest burden:</strong> 50-59 age group has highest absolute number of cases (316 total). Focus screening and intervention on 40+ age groups where both DM and HTN cases increase sharply.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
