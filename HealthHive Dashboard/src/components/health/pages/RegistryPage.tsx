import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Search, Download, Filter, ArrowUpDown, ArrowUp, ArrowDown, Flag } from "lucide-react";
import { Patient } from "../../../types";
import { PatientModal } from "../PatientModal";
import { api } from "../../../lib/api";

type SortField = 'id' | 'name' | 'age' | 'sex' | 'barangay' | 'lastVisit' | 'nextDue' | 'risk' | 'controlStatus' | 'flaggedForFollowUp';
type SortDirection = 'asc' | 'desc' | null;

export function RegistryPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isActive = true;
    let debounce: number | undefined;

    async function loadPatients(search?: string, showLoading: boolean = false) {
      try {
        if (showLoading) {
          setIsSearching(true);
        }
        const response = await api.getPatients({ limit: 1000, search });
        const normalizeSex = (value: string) => (value === 'Male' ? 'M' : value === 'Female' ? 'F' : value);
        const normalizeConditions = (conditions: string[]) => {
          if (!conditions) return [];
          const normalized = new Set<string>();
          conditions.forEach((condition) => {
            if (['Hypertension', 'HTN'].includes(condition)) normalized.add('HTN');
            if (['Diabetes', 'Diabetes Mellitus Type 2', 'DM'].includes(condition)) normalized.add('DM');
          });
          return Array.from(normalized);
        };
        const normalizeRisk = (risk?: string) => (risk === 'Elevated' ? 'Medium' : risk);
        // Map backend data to frontend Patient type
        const mappedPatients = response.patients.map((p: any) => ({
          ...p,
          id: p.patient_id,
          name: p.name || `${p.first_name} ${p.last_name}`,
          sex: normalizeSex(p.sex),
          age: p.age,
          barangay: p.barangay,
          conditions: normalizeConditions(p.conditions),
          lastVisit: p.last_visit_date || 'Never',
          nextDue: p.next_visit_date || 'TBD',
          risk: normalizeRisk(p.risk_level) || 'Low',
          controlStatus: p.control_status || 'Unknown',
          contact: p.contact,
          latestRBG: p.latest_rbg ?? p.latest_glucose,
          latestFBG: p.latest_fbg,
          latestBMI: p.bmi ?? p.latest_bmi,
          height: p.height,
          weight: p.weight,
          medications: Array.isArray(p.current_medications)
            ? p.current_medications.map((med: any) => `${med.name} ${med.dosage}`.trim())
            : undefined,
          flaggedForFollowUp: typeof p.flagged_for_follow_up === 'boolean'
            ? p.flagged_for_follow_up
            : ['High', 'Very High'].includes(p.risk_level)
        }));
        if (isActive) {
          setPatients(mappedPatients);
        }
      } catch (error) {
        console.error("Failed to load patients:", error);
        setPatients([]);
      } finally {
        if (isActive) {
          if (showLoading) {
            setIsSearching(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    }
    if (searchTerm.trim().length > 0) {
      debounce = window.setTimeout(() => loadPatients(searchTerm.trim(), true), 300);
    } else {
      setIsLoading(true);
      loadPatients();
    }

    return () => {
      isActive = false;
      if (debounce) window.clearTimeout(debounce);
    };
  }, [searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={11} className="ml-0.5 opacity-40" />;
    if (sortDirection === 'asc') return <ArrowUp size={11} className="ml-0.5" />;
    if (sortDirection === 'desc') return <ArrowDown size={11} className="ml-0.5" />;
    return <ArrowUpDown size={11} className="ml-0.5 opacity-40" />;
  };

  const riskOrder = { 'Normal': 0, 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };
  const controlOrder = { 'N/A': 0, 'Controlled': 1, 'Unassigned': 2, 'Unknown': 3, 'Uncontrolled': 4 };
  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  let filteredPatients = patients;

  if (sortField && sortDirection) {
    filteredPatients = [...filteredPatients].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'risk') {
        aVal = riskOrder[a.risk as keyof typeof riskOrder];
        bVal = riskOrder[b.risk as keyof typeof riskOrder];
      } else if (sortField === 'controlStatus') {
        aVal = controlOrder[a.controlStatus as keyof typeof controlOrder];
        bVal = controlOrder[b.controlStatus as keyof typeof controlOrder];
      } else if (sortField === 'lastVisit' || sortField === 'nextDue') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === 'flaggedForFollowUp') {
        aVal = a.flaggedForFollowUp ? 1 : 0;
        bVal = b.flaggedForFollowUp ? 1 : 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Very High': return 'bg-red-700 text-white hover:bg-red-800';
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Normal': return 'bg-green-100 text-green-700 hover:bg-green-200';
      default: return 'outline';
    }
  };

  const getControlColor = (status: string) => {
    if (status === 'N/A') return 'outline';
    if (status === 'Unassigned') return 'secondary';
    return status === 'Controlled' ? 'default' : 'destructive';
  };

  const getConditionColor = (condition: string) => {
    if (condition === 'DM') {
      return 'bg-white text-[#274492] border-[#274492] border-2';
    } else if (condition === 'HTN') {
      return 'bg-white text-[#CD5E31] border-[#CD5E31] border-2';
    }
    return 'border-slate-300';
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading patients...</div>;
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-0.5">Patient Registry</h2>
          <p className="text-slate-600 text-xs">Comprehensive patient database and records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5 h-7 text-xs px-2">
            <Filter size={12} />
            Filters
          </Button>
          <Button variant="outline" className="gap-1.5 h-7 text-xs px-2">
            <Download size={12} />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                type="search" 
                placeholder="Search by ID, name, or barangay..." 
                className="pl-8 h-7 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs text-slate-600">
          {filteredPatients.length} of {patients.length} patients
          {isSearching && <span className="ml-2 text-[10px] text-slate-500">Searching...</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    Patient ID
                    {getSortIcon('id')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center gap-1">
                    Age
                    {getSortIcon('age')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('sex')}
                >
                  <div className="flex items-center gap-1">
                    Sex
                    {getSortIcon('sex')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('barangay')}
                >
                  <div className="flex items-center gap-1">
                    Barangay
                    {getSortIcon('barangay')}
                  </div>
                </TableHead>
                <TableHead className="py-1.5 h-7">Conditions</TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('lastVisit')}
                >
                  <div className="flex items-center gap-1">
                    Last Visit
                    {getSortIcon('lastVisit')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('nextDue')}
                >
                  <div className="flex items-center gap-1">
                    Next Due
                    {getSortIcon('nextDue')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('risk')}
                >
                  <div className="flex items-center gap-1">
                    Risk
                    {getSortIcon('risk')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('controlStatus')}
                >
                  <div className="flex items-center gap-1">
                    Control
                    {getSortIcon('controlStatus')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-slate-50 py-1.5 h-7"
                  onClick={() => handleSort('flaggedForFollowUp')}
                >
                  <div className="flex items-center gap-1">
                    Flagged
                    {getSortIcon('flaggedForFollowUp')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient, idx) => (
                <TableRow 
                  key={patient.id} 
                  className={`cursor-pointer hover:bg-slate-50 ${idx % 2 === 1 ? 'bg-[#F9FAFB]' : 'bg-white'}`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <TableCell className="text-teal-600 py-1 h-7">{patient.id}</TableCell>
                  <TableCell className="text-slate-900 py-1 h-7">{patient.name}</TableCell>
                  <TableCell className="py-1 h-7">{patient.age}</TableCell>
                  <TableCell className="py-1 h-7">{patient.sex}</TableCell>
                  <TableCell className="py-1 h-7">{patient.barangay}</TableCell>
                  <TableCell className="py-1 h-7">
                    <div className="flex gap-0.5">
                      {patient.conditions.length > 0 ? (
                        // Sort conditions to prioritize HTN first, then DM
                        patient.conditions.sort((a, b) => {
                          if (a === 'HTN' && b === 'DM') return -1;
                          if (a === 'DM' && b === 'HTN') return 1;
                          return 0;
                        }).map(condition => (
                          <Badge key={condition} className={`${getConditionColor(condition)} text-[10px] h-4 px-1.5`}>
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-slate-500">
                          None
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 h-7">
                    {formatDate(patient.lastVisit)}
                  </TableCell>
                  <TableCell className="py-1 h-7">
                    {formatDate(patient.nextDue)}
                  </TableCell>
                  <TableCell className="py-1 h-7">
                    <Badge 
                      variant={patient.risk === 'Very High' ? undefined : getRiskColor(patient.risk) as any} 
                      className={patient.risk === 'Very High' ? `${getRiskColor(patient.risk)} text-[10px] h-4 px-1.5` : 'text-[10px] h-4 px-1.5'}
                    >
                      {patient.risk}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 h-7">
                    <Badge variant={getControlColor(patient.controlStatus) as any} className="text-[10px] h-4 px-1.5">
                      {patient.controlStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 h-7">
                    {patient.flaggedForFollowUp ? (
                      <div className="flex items-center gap-1">
                        <Flag size={12} className="text-[#CD5E31]" fill="#CD5E31" />
                        <span className="text-[10px] text-[#CD5E31]">Yes</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-xs">No patients found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      <PatientModal 
        patient={selectedPatient}
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
}
