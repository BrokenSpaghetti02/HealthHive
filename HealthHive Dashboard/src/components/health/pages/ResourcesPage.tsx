import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Pill, 
  Wrench, 
  Droplet,
  Calendar,
  Clock,
  PackageCheck,
  PackageX,
  ShoppingCart,
  Activity,
  CheckCircle2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { useEffect, useState } from "react";
import { RequestSupplyDialog } from "../dialogs/RequestSupplyDialog";
import { Progress } from "../../ui/progress";
import { api } from "../../../lib/api";

export function ResourcesPage() {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [resources, setResources] = useState<any>(null);

  useEffect(() => {
    async function loadResources() {
      try {
        const data = await api.getResourcesSummary();
        setResources(data);
      } catch (error) {
        console.error("Failed to load resources:", error);
      }
    }
    loadResources();
  }, []);

  const stockItems = resources?.stock_items || [];
  const medicalTools = resources?.equipment_items || [];
  const medicalConsumables = resources?.consumables || [];
  const burndownData = resources?.burndown || [];
  const monthlyUsageData = resources?.usage || [];
  const pendingOrders = resources?.pending_orders || [];

  const getStockStatus = (daysOfSupply: number) => {
    if (daysOfSupply < 30) return { label: 'Critical', color: 'bg-[#B14F22] hover:bg-[#B14F22]', textColor: 'text-white' };
    if (daysOfSupply < 60) return { label: 'Low', color: 'bg-[#CD5E31] hover:bg-[#CD5E31]', textColor: 'text-white' };
    if (daysOfSupply < 90) return { label: 'Fair', color: 'bg-[#FDE047] hover:bg-[#FDE047]', textColor: 'text-[#1E1E1E]' };
    return { label: 'Good', color: 'bg-[#7C3AED] hover:bg-[#7C3AED]', textColor: 'text-white' };
  };

  const handleRequestSupply = (itemName?: string) => {
    setSelectedItem(itemName || '');
    setShowRequestDialog(true);
  };

  // Calculate overall metrics
  const totalMedications = stockItems.filter(item => item.id.startsWith('med')).length;
  const criticalMedications = stockItems.filter(item => item.id.startsWith('med') && item.daysOfSupply < 30).length;
  const lowMedications = stockItems.filter(item => item.id.startsWith('med') && item.daysOfSupply < 60).length;
  const totalConsumables = medicalConsumables.length;
  const criticalConsumables = medicalConsumables.filter(item => item.daysOfSupply < 30).length;
  const totalEquipment = medicalTools.reduce((sum, tool) => sum + tool.currentStock, 0);
  const equipmentInUse = medicalTools.reduce((sum, tool) => sum + tool.inUse, 0);

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-0.5">Resources & Stock Management</h2>
          <p className="text-slate-600 text-xs">Track medications, equipment, and medical supplies inventory across Jagna</p>
        </div>
        <Button 
          className="bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs px-3 gap-1.5"
          onClick={() => handleRequestSupply()}
        >
          <ShoppingCart size={12} />
          Request Supplies
        </Button>
      </div>

      {/* Overview KPI Cards */}
      <div className="bg-[#F3F0FF] border border-[#D4DBDE] rounded-md p-3">
        <h3 className="text-[#7C3AED] text-xs mb-0">Inventory Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Total Medications</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{totalMedications}</div>
                <p className="text-[#4D6186] text-[10px]">Active stock items</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <Pill size={16} className="text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {criticalMedications > 0 ? (
                <Badge className="bg-[#B14F22] text-[10px] h-4 px-1.5">
                  {criticalMedications} Critical
                </Badge>
              ) : (
                <Badge className="bg-[#7C3AED] text-[10px] h-4 px-1.5">
                  <CheckCircle2 size={10} className="mr-0.5" />
                  All Good
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Equipment</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{totalEquipment}</div>
                <p className="text-[#4D6186] text-[10px]">{equipmentInUse} in use</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <Wrench size={16} className="text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <Progress value={(equipmentInUse / totalEquipment) * 100} className="h-1.5" />
              <p className="text-[10px] text-[#4D6186]">{Math.round((equipmentInUse / totalEquipment) * 100)}% utilization rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Consumables</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{totalConsumables}</div>
                <p className="text-[#4D6186] text-[10px]">Supply categories</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <Droplet size={16} className="text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {criticalConsumables > 0 ? (
                <Badge className="bg-[#CD5E31] text-[10px] h-4 px-1.5">
                  {criticalConsumables} Low Stock
                </Badge>
              ) : (
                <Badge className="bg-[#7C3AED] text-[10px] h-4 px-1.5">
                  <CheckCircle2 size={10} className="mr-0.5" />
                  All Good
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Pending Orders</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{pendingOrders.length}</div>
                <p className="text-[#4D6186] text-[10px]">Delivery scheduled</p>
              </div>
              <div className="p-2 rounded-md bg-[#FFFBEB] border border-[#FDE047]">
                <PackageCheck size={16} className="text-[#7C3AED]" />
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-xs text-[#7C3AED]">
              <Calendar size={11} />
              <span>Next: {pendingOrders[0]?.eta || "N/A"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pharmacy" className="space-y-3">
        <TabsList className="h-8 p-1 bg-[#F3F0FF] border border-[#D4DBDE]">
          <TabsTrigger 
            value="pharmacy" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Pill size={12} />
            Pharmacy / Medications
          </TabsTrigger>
          <TabsTrigger 
            value="tools" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Wrench size={12} />
            Tools & Equipment
          </TabsTrigger>
          <TabsTrigger 
            value="consumables" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Droplet size={12} />
            Medical Consumables
          </TabsTrigger>
        </TabsList>

        {/* Pharmacy / Medications Tab */}
        <TabsContent value="pharmacy" className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {stockItems.filter(item => item.id.startsWith('med')).map((item) => {
              const status = getStockStatus(item.daysOfSupply);
              const stockPercentage = (item.currentStock / (item.reorderPoint * 2)) * 100;
              const belowReorder = item.currentStock < item.reorderPoint;
              
              return (
                <Card 
                  key={item.id} 
                  className={`border-[#D4DBDE] hover:shadow-lg transition-all cursor-pointer ${
                    belowReorder ? 'ring-2 ring-[#CD5E31]' : ''
                  }`}
                  onClick={() => handleRequestSupply(item.name)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-slate-900 text-xs mb-1">{item.name}</p>
                        <div className="text-slate-900 text-2xl">{item.daysOfSupply}</div>
                        <p className="text-[#4D6186] text-[10px]">days supply</p>
                      </div>
                      <div className={`p-1.5 rounded ${belowReorder ? 'bg-[#FFF4ED]' : 'bg-[#F3F0FF]'}`}>
                        <Pill size={14} className={belowReorder ? 'text-[#CD5E31]' : 'text-[#7C3AED]'} />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Progress value={stockPercentage} className="h-1.5" />
                      <div className="flex items-center justify-between">
                        <Badge className={`${status.color} ${status.textColor} text-[10px] h-4 px-1.5`}>
                          {status.label}
                        </Badge>
                        <span className="text-[10px] text-[#4D6186]">{item.currentStock.toLocaleString()} units</span>
                      </div>
                    </div>
                    
                    {belowReorder && (
                      <div className="mt-2 pt-2 border-t border-[#D4DBDE]">
                        <div className="flex items-center gap-1 text-[#CD5E31]">
                          <AlertTriangle size={10} />
                          <span className="text-[10px]">Below reorder point</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E1E1E] text-sm">Stock Burn-down Forecast</CardTitle>
                  <Badge variant="outline" className="border-[#7C3AED] text-[#7C3AED] text-[10px]">90 Days</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={burndownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="metformin" stroke="#274492" strokeWidth={2} name="Metformin" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="amlodipine" stroke="#CD5E31" strokeWidth={2} name="Amlodipine" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="losartan" stroke="#7C3AED" strokeWidth={2} name="Losartan" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-[10px] text-[#1E1E1E]">
                    <strong>Stock alert:</strong> Amlodipine and Losartan will reach critical levels by December. Schedule reorder immediately.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#1E1E1E] text-sm">Monthly Usage Trends</CardTitle>
                  <Badge variant="outline" className="border-[#7C3AED] text-[#7C3AED] text-[10px]">6 Months</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D4DBDE" />
                    <XAxis dataKey="month" stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#4D6186" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="metformin" fill="#274492" radius={[3, 3, 0, 0]} name="Metformin" />
                    <Bar dataKey="amlodipine" fill="#CD5E31" radius={[3, 3, 0, 0]} name="Amlodipine" />
                    <Bar dataKey="losartan" fill="#7C3AED" radius={[3, 3, 0, 0]} name="Losartan" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
                  <p className="text-[10px] text-[#1E1E1E]">
                    <strong>Consistent usage:</strong> Average monthly consumption remains stable. Current stock levels adequate for planned operations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 text-sm">Medication Inventory Details</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-6 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                  onClick={() => handleRequestSupply()}
                >
                  <PackageX size={11} className="mr-1" />
                  Restock All Critical
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Medication</TableHead>
                    <TableHead className="text-xs">Current Stock</TableHead>
                    <TableHead className="text-xs">Monthly Use</TableHead>
                    <TableHead className="text-xs">Days of Supply</TableHead>
                    <TableHead className="text-xs">Reorder Point</TableHead>
                    <TableHead className="text-xs">Next Delivery</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockItems.filter(item => item.id.startsWith('med')).map((item) => {
                    const status = getStockStatus(item.daysOfSupply);
                    const belowReorder = item.currentStock < item.reorderPoint;
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-[#F9FAFB]">
                        <TableCell className="text-slate-900 text-xs">{item.name}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <span>{item.currentStock.toLocaleString()}</span>
                            {belowReorder && <AlertTriangle size={12} className="text-[#CD5E31]" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{item.avgMonthlyUse.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5">
                            {item.daysOfSupply < 60 ? (
                              <TrendingDown size={12} className="text-[#CD5E31]" />
                            ) : (
                              <Activity size={12} className="text-[#7C3AED]" />
                            )}
                            <span>{item.daysOfSupply} days</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{item.reorderPoint.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar size={11} className="text-[#4D6186]" />
                            {new Date(item.nextDeliveryETA).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} ${status.textColor} text-[10px]`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 text-xs text-[#7C3AED] hover:text-[#6D28D9] hover:bg-[#F3F0FF]"
                            onClick={() => handleRequestSupply(item.name)}
                          >
                            Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools & Equipment Tab */}
        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {medicalTools.map((tool) => {
              const utilizationRate = (tool.inUse / tool.currentStock) * 100;
              return (
                <Card key={tool.id} className="border-[#D4DBDE] hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-slate-900 text-xs mb-1">{tool.name}</p>
                        <div className="text-slate-900 text-xl">{tool.currentStock} units</div>
                        <p className="text-[#4D6186] text-[10px]">{tool.inUse} in use • {tool.available} available</p>
                      </div>
                      <div className={`p-1.5 rounded ${tool.condition === 'Good' ? 'bg-[#F3F0FF]' : 'bg-[#FFFBEB]'}`}>
                        <Wrench size={14} className={tool.condition === 'Good' ? 'text-[#7C3AED]' : 'text-[#FDE047]'} />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Progress value={utilizationRate} className="h-1.5" />
                      <div className="flex items-center justify-between">
                        <Badge className={tool.condition === 'Good' ? 'bg-[#7C3AED]' : 'bg-[#FDE047] text-[#1E1E1E]'}>
                          {tool.condition}
                        </Badge>
                        <span className="text-[10px] text-[#4D6186]">{Math.round(utilizationRate)}% in use</span>
                      </div>
                    </div>

                    {tool.nextService !== 'N/A' && (
                      <div className="mt-2 pt-2 border-t border-[#D4DBDE]">
                        <div className="flex items-center gap-1 text-[#4D6186]">
                          <Clock size={10} />
                          <span className="text-[10px]">Next service: {new Date(tool.nextService).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-900 text-sm">Equipment Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Equipment</TableHead>
                    <TableHead className="text-xs">Quantity</TableHead>
                    <TableHead className="text-xs">Utilization</TableHead>
                    <TableHead className="text-xs">Condition</TableHead>
                    <TableHead className="text-xs">Last Calibration</TableHead>
                    <TableHead className="text-xs">Next Service</TableHead>
                    <TableHead className="text-xs">Days Until Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalTools.map((tool) => {
                    const utilizationRate = Math.round((tool.inUse / tool.currentStock) * 100);
                    const daysUntilService = tool.nextService !== 'N/A' 
                      ? Math.ceil((new Date(tool.nextService).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <TableRow key={tool.id} className="hover:bg-[#F9FAFB]">
                        <TableCell className="text-slate-900 text-xs">{tool.name}</TableCell>
                        <TableCell className="text-xs">{tool.currentStock} units</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#7C3AED]" 
                                style={{ width: `${utilizationRate}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-[#4D6186]">{utilizationRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={tool.condition === 'Good' ? 'bg-[#7C3AED] text-[10px]' : 'bg-[#FDE047] text-[#1E1E1E] text-[10px]'}>
                            {tool.condition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{tool.lastCalibration}</TableCell>
                        <TableCell className="text-xs">{tool.nextService}</TableCell>
                        <TableCell className="text-xs">
                          {daysUntilService !== null ? (
                            <Badge 
                              variant="outline" 
                              className={`${
                                daysUntilService < 30 
                                  ? 'border-[#CD5E31] text-[#CD5E31]' 
                                  : 'border-[#7C3AED] text-[#7C3AED]'
                              } text-[10px]`}
                            >
                              {daysUntilService} days
                            </Badge>
                          ) : (
                            <span className="text-[#4D6186]">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Consumables Tab */}
        <TabsContent value="consumables" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {medicalConsumables.slice(0, 6).map((item) => {
              const status = getStockStatus(item.daysOfSupply);
              const stockPercentage = (item.currentStock / (item.reorderPoint * 1.5)) * 100;
              const belowReorder = item.currentStock < item.reorderPoint;
              
              return (
                <Card 
                  key={item.id} 
                  className={`border-[#D4DBDE] hover:shadow-lg transition-all cursor-pointer ${
                    belowReorder ? 'ring-2 ring-[#CD5E31]' : ''
                  }`}
                  onClick={() => handleRequestSupply(item.name)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="text-slate-900 text-xs">{item.name}</p>
                        </div>
                        <div className="text-slate-900 text-2xl">{item.daysOfSupply}</div>
                        <p className="text-[#4D6186] text-[10px]">days supply</p>
                      </div>
                      <div className={`p-1.5 rounded ${belowReorder ? 'bg-[#FFF4ED]' : 'bg-[#F3F0FF]'}`}>
                        <Droplet size={14} className={belowReorder ? 'text-[#CD5E31]' : 'text-[#7C3AED]'} />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Progress value={stockPercentage} className="h-1.5" />
                      <div className="flex items-center justify-between">
                        <Badge className={`${status.color} ${status.textColor} text-[10px] h-4 px-1.5`}>
                          {status.label}
                        </Badge>
                        <span className="text-[10px] text-[#4D6186]">{item.currentStock.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#D4DBDE]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#4D6186]">{item.category}</span>
                        {belowReorder && (
                          <div className="flex items-center gap-0.5 text-[#CD5E31]">
                            <AlertTriangle size={10} />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 text-sm">Consumables Inventory</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-6 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                  onClick={() => handleRequestSupply()}
                >
                  <PackageX size={11} className="mr-1" />
                  Restock Critical Items
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Item</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Current Stock</TableHead>
                    <TableHead className="text-xs">Monthly Use</TableHead>
                    <TableHead className="text-xs">Days of Supply</TableHead>
                    <TableHead className="text-xs">Reorder Point</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalConsumables.map((item) => {
                    const status = getStockStatus(item.daysOfSupply);
                    const belowReorder = item.currentStock < item.reorderPoint;
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-[#F9FAFB]">
                        <TableCell className="text-slate-900 text-xs">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#D4DBDE] text-[#4D6186] text-[10px]">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-2">
                            <span>{item.currentStock.toLocaleString()}</span>
                            {belowReorder && <AlertTriangle size={12} className="text-[#CD5E31]" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{item.avgMonthlyUse.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5">
                            {item.daysOfSupply < 60 ? (
                              <TrendingDown size={12} className="text-[#CD5E31]" />
                            ) : (
                              <Activity size={12} className="text-[#7C3AED]" />
                            )}
                            <span>{item.daysOfSupply} days</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{item.reorderPoint.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={`${status.color} ${status.textColor} text-[10px]`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 text-xs text-[#7C3AED] hover:text-[#6D28D9] hover:bg-[#F3F0FF]"
                            onClick={() => handleRequestSupply(item.name)}
                          >
                            Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Supply Dialog */}
      <RequestSupplyDialog 
        open={showRequestDialog} 
        onClose={() => {
          setShowRequestDialog(false);
          setSelectedItem('');
        }} 
        itemName={selectedItem}
      />
    </div>
  );
}
