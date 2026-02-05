import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { AlertTriangle, CheckCircle2, Database, Wifi, Clock, TrendingUp, Shield, FileCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Progress } from "../../ui/progress";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useState } from "react";
import { SyncRecordsDialog } from "../dialogs/SyncRecordsDialog";
import { ResolveConflictsDialog } from "../dialogs/ResolveConflictsDialog";
import { ValidationRulesDialog } from "../dialogs/ValidationRulesDialog";

export function DataQualityPage() {
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showConflictsDialog, setShowConflictsDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const issues = [
    { type: 'Missing DOB', count: 18, severity: 'Medium', barangay: 'Multiple', impact: 'Age-based analysis affected' },
    { type: 'Missing contact info', count: 45, severity: 'Low', barangay: 'Multiple', impact: 'Cannot send reminders' },
    { type: 'Implausible BP (>250)', count: 3, severity: 'High', barangay: 'Poblacion', impact: 'Data integrity issue' },
    { type: 'Duplicate entries', count: 7, severity: 'High', barangay: 'Multiple', impact: 'Inflated patient count' },
    { type: 'Missing GPS coordinates', count: 28, severity: 'Low', barangay: 'Naatang, Looc', impact: 'Map visualization incomplete' },
    { type: 'HbA1c out of range', count: 2, severity: 'High', barangay: 'Cantagay', impact: 'Unreliable DM control metric' },
    { type: 'Missing last visit date', count: 12, severity: 'Medium', barangay: 'Multiple', impact: 'Follow-up scheduling affected' },
    { type: 'Incomplete medication list', count: 34, severity: 'Medium', barangay: 'Multiple', impact: 'Stock planning inaccurate' },
  ];

  const completenessMetrics = [
    { field: 'Patient ID', completeness: 100, critical: true },
    { field: 'Name', completeness: 100, critical: true },
    { field: 'Date of Birth', completeness: 98.7, critical: true },
    { field: 'Sex', completeness: 100, critical: true },
    { field: 'Barangay', completeness: 100, critical: true },
    { field: 'Contact Number', completeness: 96.7, critical: false },
    { field: 'Latest BP (HTN patients)', completeness: 94.2, critical: true },
    { field: 'Latest RBG/FBG (DM patients)', completeness: 91.8, critical: true },
    { field: 'Latest HbA1c (DM patients)', completeness: 89.5, critical: false },
    { field: 'Current Medications', completeness: 92.1, critical: true },
    { field: 'GPS Coordinates', completeness: 97.9, critical: false },
    { field: 'Occupation', completeness: 95.4, critical: false },
    { field: 'Last Visit Date', completeness: 99.1, critical: true },
    { field: 'Next Follow-up Date', completeness: 88.3, critical: false },
  ];

  const syncHistory = [
    { date: 'Nov 1', synced: 142, failed: 2, conflicts: 1 },
    { date: 'Oct 31', synced: 156, failed: 0, conflicts: 0 },
    { date: 'Oct 30', synced: 134, failed: 3, conflicts: 2 },
    { date: 'Oct 29', synced: 148, failed: 1, conflicts: 0 },
    { date: 'Oct 28', synced: 152, failed: 0, conflicts: 1 },
    { date: 'Oct 27', synced: 128, failed: 4, conflicts: 3 },
    { date: 'Oct 26', synced: 145, failed: 1, conflicts: 0 },
  ];

  const qualityTrends = [
    { month: 'May', completeness: 91.2, accuracy: 87.5 },
    { month: 'Jun', completeness: 92.1, accuracy: 89.2 },
    { month: 'Jul', completeness: 93.4, accuracy: 90.8 },
    { month: 'Aug', completeness: 93.8, accuracy: 92.1 },
    { month: 'Sep', completeness: 94.1, accuracy: 93.4 },
    { month: 'Oct', completeness: 94.6, accuracy: 94.2 },
  ];

  const barangayQuality = [
    { barangay: 'Poblacion', completeness: 98.2, issues: 8 },
    { barangay: 'Naatang', completeness: 91.5, issues: 15 },
    { barangay: 'Looc', completeness: 93.7, issues: 12 },
    { barangay: 'Cantagay', completeness: 96.1, issues: 6 },
    { barangay: 'Tubod', completeness: 94.8, issues: 9 },
    { barangay: 'Pagina', completeness: 92.3, issues: 14 },
    { barangay: 'Cambugason', completeness: 95.4, issues: 7 },
    { barangay: 'Ipil', completeness: 93.1, issues: 11 },
  ];

  const validationRules = [
    { rule: 'BP Systolic Range', range: '70-250 mmHg', violations: 3, status: 'active' },
    { rule: 'BP Diastolic Range', range: '40-150 mmHg', violations: 2, status: 'active' },
    { rule: 'RBG Range', range: '40-600 mg/dL', violations: 1, status: 'active' },
    { rule: 'FBG Range', range: '40-400 mg/dL', violations: 1, status: 'active' },
    { rule: 'Age Range', range: '18-120 years', violations: 0, status: 'active' },
    { rule: 'Contact Number Format', range: '11 digits starting with 09', violations: 8, status: 'active' },
    { rule: 'Unique Patient ID', range: 'No duplicates', violations: 7, status: 'active' },
    { rule: 'Future Date Check', range: 'Visit dates not in future', violations: 0, status: 'active' },
  ];

  return (
    <div className="py-4 space-y-4">
      <div>
        <h2 className="text-slate-900 mb-0.5">Data Quality & Completeness</h2>
        <p className="text-slate-600 text-xs">Monitor data integrity, sync status, and validation across all 33 barangays</p>
      </div>

      {/* Overview explanation */}
      <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
        <h3 className="text-[#1E1E1E] mb-1 text-xs">Data Quality Framework</h3>
        <p className="text-[10px] text-[#1E1E1E]">
          Ensuring high data quality is critical for accurate analytics, effective patient care, and DHIS2 integration. This page monitors completeness (are all required fields filled?), accuracy (are values within valid ranges?), timeliness (is data synced regularly?), and consistency (are there duplicates or conflicts?). Target: 95% overall completeness, {"<"}5 high-severity issues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-slate-600 text-xs mb-0.5">Records Pending Sync</p>
                <div className="text-slate-900 text-2xl">12</div>
                <p className="text-[#7C3AED] text-xs mt-0.5">From 3 field workers</p>
              </div>
              <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                <Wifi size={14} className="text-[#7C3AED]" />
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs"
              onClick={() => setShowSyncDialog(true)}
            >
              Sync Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-slate-600 text-xs mb-0.5">Conflicts to Resolve</p>
                <div className="text-slate-900 text-2xl">3</div>
                <p className="text-orange-600 text-xs mt-0.5">2 duplicates, 1 version mismatch</p>
              </div>
              <div className="p-1.5 rounded-md bg-orange-100">
                <AlertTriangle size={14} className="text-orange-600" />
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full h-7 text-xs border-[#D4DBDE]"
              onClick={() => setShowConflictsDialog(true)}
            >
              Review
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-slate-600 text-xs mb-0.5">Overall Completeness</p>
                <div className="text-slate-900 text-2xl">94.6%</div>
                <p className="text-teal-600 text-xs mt-0.5">Above 90% threshold</p>
              </div>
              <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                <Database size={14} className="text-[#7C3AED]" />
              </div>
            </div>
            <Progress value={94.6} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-slate-600 text-xs mb-0.5">Data Accuracy Rate</p>
                <div className="text-slate-900 text-2xl">94.2%</div>
                <p className="text-teal-600 text-xs mt-0.5">12 validation violations</p>
              </div>
              <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                <Shield size={14} className="text-[#7C3AED]" />
              </div>
            </div>
            <Progress value={94.2} className="h-1.5" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-3">
        <TabsList className="h-7">
          <TabsTrigger value="issues" className="text-xs px-3">Data Issues</TabsTrigger>
          <TabsTrigger value="completeness" className="text-xs px-3">Field Completeness</TabsTrigger>
          <TabsTrigger value="validation" className="text-xs px-3">Validation Rules</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs px-3">Quality Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
            <h3 className="text-[#1E1E1E] mb-1 text-xs">Active Data Quality Issues</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              These issues require attention to maintain data integrity. High-severity issues (duplicates, implausible values) affect analytics accuracy and should be resolved immediately. Medium-severity issues (missing dates, incomplete lists) impact operational planning. Low-severity issues (missing GPS, contact info) reduce functionality but don't affect core metrics.
            </p>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#1E1E1E] text-sm">Issue Summary</CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-red-100 text-red-700 text-[10px] h-4 px-1.5">
                    6 High Severity
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 text-[10px] h-4 px-1.5">
                    3 Medium Severity
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700 text-[10px] h-4 px-1.5">
                    2 Low Severity
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Issue Type</TableHead>
                    <TableHead className="text-[10px]">Count</TableHead>
                    <TableHead className="text-[10px]">Severity</TableHead>
                    <TableHead className="text-[10px]">Affected Barangay</TableHead>
                    <TableHead className="text-[10px]">Impact</TableHead>
                    <TableHead className="text-[10px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-[#1E1E1E] py-2">{issue.type}</TableCell>
                      <TableCell className="py-2">{issue.count}</TableCell>
                      <TableCell className="py-2">
                        <Badge 
                          variant={
                            issue.severity === 'High' ? 'destructive' :
                            issue.severity === 'Medium' ? 'secondary' :
                            'outline'
                          }
                          className="text-[10px] h-4 px-1.5"
                        >
                          {issue.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 py-2">{issue.barangay}</TableCell>
                      <TableCell className="text-[10px] text-slate-600 py-2">{issue.impact}</TableCell>
                      <TableCell className="py-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2 border-[#D4DBDE]">Fix</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Top 8 Barangays by Data Quality Issues</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barangayQuality}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="barangay" stroke="#4D6186" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="issues" fill="#7C3AED" radius={[3, 3, 0, 0]} name="Issues Count" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Priority areas:</strong> Naatang (15 issues) and Pagina (14 issues) require data cleaning support. Focus field worker training and data validation in these barangays.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Sync History (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={syncHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="date" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="synced" fill="#7C3AED" name="Synced" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="failed" fill="#EF4444" name="Failed" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="conflicts" fill="#F59E0B" name="Conflicts" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Good sync rate:</strong> 97.8% success rate over 7 days. Oct 27 spike in failures due to network outage. Average 145 records synced daily from field workers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completeness" className="space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
            <h3 className="text-[#1E1E1E] mb-1 text-xs">Field Completeness Analysis</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Field completeness measures the percentage of patient records with each data field filled. Critical fields (marked with ⚠️) are required for program operations: Patient ID, Name, DOB, Sex, Barangay, vital measurements (BP, glucose), medications, and last visit date. Target: 100% for critical fields, 95% for non-critical fields.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Critical Fields (Required for Operations)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {completenessMetrics.filter(m => m.critical).map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#1E1E1E]">{metric.field}</span>
                          <Badge className="bg-red-100 text-red-700 text-[10px] h-4 px-1">⚠️</Badge>
                        </div>
                        <span className="text-xs text-[#1E1E1E]">{metric.completeness}%</span>
                      </div>
                      <Progress 
                        value={metric.completeness} 
                        className="h-1.5"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Excellent critical data:</strong> All critical fields above 90%. Latest glucose (91.8%) and medications (92.1%) need improvement for comprehensive DM management.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[#1E1E1E] text-sm">Non-Critical Fields (Enhance Functionality)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {completenessMetrics.filter(m => !m.critical).map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#1E1E1E]">{metric.field}</span>
                        <span className="text-xs text-[#1E1E1E]">{metric.completeness}%</span>
                      </div>
                      <Progress 
                        value={metric.completeness} 
                        className="h-1.5"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-xs text-[#1E1E1E]">
                    <strong>Good supplementary data:</strong> GPS (97.9%), contact (96.7%), and occupation (95.4%) enable mapping, messaging, and demographic analysis. Next follow-up dates (88.3%) need improvement for proactive scheduling.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Completeness by Barangay (Top 8 by Total Records)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barangayQuality} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                  <XAxis type="number" stroke="#4D6186" tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <YAxis dataKey="barangay" type="category" stroke="#4D6186" width={85} tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Bar dataKey="completeness" fill="#7C3AED" name="Completeness %" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                <p className="text-xs text-[#1E1E1E]">
                  <strong>Variation by location:</strong> Poblacion leads with 98.2% completeness, while Naatang (91.5%) and Pagina (92.3%) need targeted data collection support from field coordinators.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
            <h3 className="text-[#1E1E1E] mb-1 text-xs">Data Validation Rules</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Automated validation rules check data accuracy at entry and sync. Rules prevent implausible values (BP {">"} 250), ensure proper formatting (11-digit phone numbers), detect duplicates, and catch logical errors (future visit dates). Each violation is flagged for review to maintain data quality for analytics and DHIS2 reporting.
            </p>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Active Validation Rules & Violations</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Validation Rule</TableHead>
                    <TableHead className="text-[10px]">Valid Range/Criteria</TableHead>
                    <TableHead className="text-[10px]">Violations</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationRules.map((rule, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-[#1E1E1E] py-2">{rule.rule}</TableCell>
                      <TableCell className="text-slate-600 py-2 text-[10px]">{rule.range}</TableCell>
                      <TableCell className="py-2">
                        {rule.violations === 0 ? (
                          <span className="flex items-center gap-1 text-teal-600">
                            <CheckCircle2 size={12} /> 0
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle size={12} /> {rule.violations}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge className="bg-teal-100 text-teal-700 text-[10px] h-4 px-1.5">
                          {rule.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        {rule.violations > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs px-2 border-[#D4DBDE]"
                            onClick={() => setShowValidationDialog(true)}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                <p className="text-xs text-[#1E1E1E]">
                  <strong>Total: 22 validation violations</strong> across 8 active rules. Focus on contact number formatting (8 violations) and duplicate patient IDs (7 violations) for immediate correction. Most clinical measurements within valid ranges.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-3">
            <h3 className="text-[#1E1E1E] mb-1 text-xs">Data Quality Improvement Trends</h3>
            <p className="text-[10px] text-[#1E1E1E]">
              Track data quality improvements over time. Completeness measures the percentage of filled fields, while accuracy measures validation compliance. Upward trends indicate effective field worker training, better mobile forms, and stronger data governance. Target: 95% completeness and 95% accuracy by December 2025.
            </p>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">6-Month Quality Trend (May - Oct 2025)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={qualityTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                  <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} domain={[85, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="completeness" stroke="#7C3AED" strokeWidth={2} name="Completeness %" />
                  <Line type="monotone" dataKey="accuracy" stroke="#3F5FF1" strokeWidth={2} name="Accuracy %" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                <p className="text-xs text-[#1E1E1E]">
                  <strong>Steady improvement:</strong> Completeness increased 3.4 percentage points (91.2% → 94.6%) and accuracy improved 6.7 points (87.5% → 94.2%) over 6 months. Recent field worker training (Aug 2025) accelerated accuracy gains.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-slate-600 text-xs mb-0.5">Improvement (6 months)</p>
                    <div className="text-slate-900 text-2xl">+3.4%</div>
                    <p className="text-teal-600 text-xs mt-0.5">Completeness gain</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-teal-100">
                    <TrendingUp size={14} className="text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-slate-600 text-xs mb-0.5">Last Updated</p>
                    <div className="text-slate-900 text-sm">2 hours ago</div>
                    <p className="text-[#7C3AED] text-xs mt-0.5">Oct 31, 2025 2:45 PM</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                    <Clock size={14} className="text-[#7C3AED]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-slate-600 text-xs mb-0.5">Total Records Validated</p>
                    <div className="text-slate-900 text-2xl">1,378</div>
                    <p className="text-teal-600 text-xs mt-0.5">100% registry coverage</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                    <FileCheck size={14} className="text-[#7C3AED]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SyncRecordsDialog open={showSyncDialog} onClose={() => setShowSyncDialog(false)} />
      <ResolveConflictsDialog open={showConflictsDialog} onClose={() => setShowConflictsDialog(false)} />
      <ValidationRulesDialog open={showValidationDialog} onClose={() => setShowValidationDialog(false)} />
    </div>
  );
}
