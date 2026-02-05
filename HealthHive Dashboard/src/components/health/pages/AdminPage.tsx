import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { 
  Settings, 
  Users, 
  Database, 
  Shield,
  MapPin,
  Pill,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  Plus,
  Key,
  Globe,
  History
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "../../ui/alert";
import { Switch } from "../../ui/switch";
import { api } from "../../../lib/api";

export function AdminPage() {
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const [summary, usersResponse, logsResponse] = await Promise.all([
          api.getAdminSummary(),
          api.getAdminUsers(),
          api.getAuditLogs()
        ]);
        setAdminSummary(summary);
        setUsers(usersResponse.users || []);
        setAuditLogs(logsResponse.logs || []);
      } catch (error) {
        console.error("Failed to load admin data:", error);
      }
    }
    loadAdmin();
  }, []);

  const handleSyncNow = () => {
    toast.success('Manual sync initiated. Data will be synchronized with DHIS2.');
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  const handleAddUser = () => {
    toast.success('Add user dialog would open here');
  };

  const handleEdit = (item: string) => {
    toast.success(`Edit ${item}`);
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-0.5">Administration & Settings</h2>
          <p className="text-slate-600 text-xs">System configuration, user management, and DHIS2 integration</p>
        </div>
        <Button 
          className="bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs px-3 gap-1.5"
          onClick={handleSaveSettings}
        >
          <CheckCircle2 size={12} />
          Save Settings
        </Button>
      </div>

      {/* System Status */}
      <Alert className="border-[#D4DBDE] bg-[#F3F0FF]">
        <CheckCircle2 className="h-3 w-3 text-[#7C3AED]" />
        <AlertDescription className="text-[#1E1E1E] text-xs">
          <strong>All systems operational.</strong> DHIS2 connected • Last sync: {adminSummary?.last_sync ? new Date(adminSummary.last_sync).toLocaleString() : "N/A"} • {adminSummary?.active_users || 0} active users
        </AlertDescription>
      </Alert>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Active Users</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{adminSummary?.active_users || 0}</div>
                <p className="text-[#4D6186] text-[10px]">All roles assigned</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <Users size={16} className="text-white" />
              </div>
            </div>
            <Badge className="bg-[#7C3AED] text-[10px] h-4 px-1.5">Active</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">DHIS2 Status</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">Connected</div>
                <p className="text-[#4D6186] text-[10px]">Last sync 2h ago</p>
              </div>
              <div className="p-2 rounded-md bg-[#10B981]">
                <Database size={16} className="text-white" />
              </div>
            </div>
            <Badge className="bg-[#10B981] text-[10px] h-4 px-1.5">
              <CheckCircle2 size={10} className="mr-0.5" />
              Healthy
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Barangays</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{adminSummary?.barangays || 0}</div>
                <p className="text-[#4D6186] text-[10px]">All configured</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <MapPin size={16} className="text-white" />
              </div>
            </div>
            <Badge className="bg-[#7C3AED] text-[10px] h-4 px-1.5">Jagna, Bohol</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-[#D4DBDE]">
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-[#4D6186] text-xs mb-0.5">Medications</p>
                <div className="text-2xl text-[#1E1E1E] mb-0.5">{adminSummary?.medications || 0}</div>
                <p className="text-[#4D6186] text-[10px]">Active items</p>
              </div>
              <div className="p-2 rounded-md bg-[#7C3AED]">
                <Pill size={16} className="text-white" />
              </div>
            </div>
            <Badge className="bg-[#7C3AED] text-[10px] h-4 px-1.5">DM & HTN</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-3">
        <TabsList className="h-8 p-1 bg-[#F3F0FF] border border-[#D4DBDE]">
          <TabsTrigger 
            value="users" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Users size={12} />
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="config" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Settings size={12} />
            Configuration
          </TabsTrigger>
          <TabsTrigger 
            value="dhis2" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Database size={12} />
            DHIS2
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#1E1E1E] text-sm">User Management</h3>
              <p className="text-[#4D6186] text-xs">Manage system users and permissions</p>
            </div>
            <Button 
              className="bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs px-3 gap-1.5"
              onClick={handleAddUser}
            >
              <Plus size={12} />
              Add User
            </Button>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">User Directory</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Last Login</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-[#F9FAFB]">
                      <TableCell className="text-xs text-[#1E1E1E]">{user.name}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="border-[#7C3AED] text-[#7C3AED] text-[10px]">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#10B981] text-[10px]">{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#4D6186]">{user.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 text-[#7C3AED] hover:bg-[#F3F0FF]"
                          onClick={() => handleEdit(user.name)}
                        >
                          <Edit size={12} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                  <div>
                    <p className="text-xs text-[#1E1E1E] mb-0.5">Email Notifications</p>
                    <p className="text-[10px] text-[#4D6186]">Send alerts for critical events</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                  <div>
                    <p className="text-xs text-[#1E1E1E] mb-0.5">Session Timeout</p>
                    <p className="text-[10px] text-[#4D6186]">Auto-logout after inactivity</p>
                  </div>
                  <Badge className="bg-[#7C3AED] text-[10px]">30 min</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                  <div>
                    <p className="text-xs text-[#1E1E1E] mb-0.5">Password Policy</p>
                    <p className="text-[10px] text-[#4D6186]">Min 8 chars, special char required</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 text-xs text-[#7C3AED] hover:bg-[#F3F0FF]"
                    onClick={() => handleEdit('password policy')}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <div>
            <h3 className="text-[#1E1E1E] text-sm">System Configuration</h3>
            <p className="text-[#4D6186] text-xs">Configure barangays, medications, and option sets</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                      <MapPin size={14} className="text-[#7C3AED]" />
                    </div>
                    <CardTitle className="text-[#1E1E1E] text-sm">Barangays</CardTitle>
                  </div>
                  <Badge className="bg-[#7C3AED] text-[10px]">33 Total</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {['Poblacion', 'Tubod Monte', 'Naatang', 'Cantagay', 'Looc', 'Bogo'].map((barangay, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 border border-[#D4DBDE] rounded hover:bg-[#F9FAFB]"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={10} className="text-[#7C3AED]" />
                        <span className="text-xs text-[#1E1E1E]">{barangay}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 text-[#7C3AED] hover:bg-[#F3F0FF]"
                        onClick={() => handleEdit(barangay)}
                      >
                        <Edit size={10} />
                      </Button>
                    </div>
                  ))}
                  <p className="text-[10px] text-[#4D6186] pt-1 text-center">+ 27 more barangays</p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#D4DBDE]">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                    onClick={() => handleEdit('barangays')}
                  >
                    <Eye size={12} className="mr-1" />
                    View All 33
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                      <Pill size={14} className="text-[#7C3AED]" />
                    </div>
                    <CardTitle className="text-[#1E1E1E] text-sm">Medications</CardTitle>
                  </div>
                  <Badge className="bg-[#7C3AED] text-[10px]">8 Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {[
                    { name: 'Metformin 500mg', type: 'DM' },
                    { name: 'Amlodipine 5mg', type: 'HTN' },
                    { name: 'Losartan 50mg', type: 'HTN' },
                    { name: 'Glimepiride 2mg', type: 'DM' },
                  ].map((med, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 border border-[#D4DBDE] rounded hover:bg-[#F9FAFB]"
                    >
                      <div className="flex items-center gap-2">
                        <Pill size={10} className={med.type === 'DM' ? 'text-[#274492]' : 'text-[#CD5E31]'} />
                        <span className="text-xs text-[#1E1E1E]">{med.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 text-[#7C3AED] hover:bg-[#F3F0FF]"
                        onClick={() => handleEdit(med.name)}
                      >
                        <Edit size={10} />
                      </Button>
                    </div>
                  ))}
                  <p className="text-[10px] text-[#4D6186] pt-1 text-center">+ 4 more medications</p>
                </div>
                <div className="mt-3 pt-3 border-t border-[#D4DBDE]">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                    onClick={() => handleEdit('medications')}
                  >
                    <Eye size={12} className="mr-1" />
                    View All 8
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: 'Occupation Categories', value: '9 types' },
                  { name: 'Education Levels', value: '5 levels' },
                  { name: 'Income Brackets', value: '5 ranges' },
                  { name: 'Validation Rules', value: '15 rules' },
                ].map((option, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded hover:bg-[#F9FAFB]"
                  >
                    <div>
                      <p className="text-xs text-[#1E1E1E]">{option.name}</p>
                      <p className="text-[10px] text-[#4D6186]">{option.value}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs text-[#7C3AED] hover:bg-[#F3F0FF]"
                      onClick={() => handleEdit(option.name)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DHIS2 Tab */}
        <TabsContent value="dhis2" className="space-y-4">
          <div>
            <h3 className="text-[#1E1E1E] text-sm">DHIS2 Integration</h3>
            <p className="text-[#4D6186] text-xs">Manage DHIS2 connection and data synchronization</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#10B981]">
                    <Database size={14} className="text-white" />
                  </div>
                  <CardTitle className="text-[#1E1E1E] text-sm">Connection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F0FDF4] border border-[#10B981] rounded">
                  <div>
                    <p className="text-xs text-[#1E1E1E] mb-0.5">DHIS2 Status</p>
                    <p className="text-[10px] text-[#10B981]">Connected</p>
                  </div>
                  <CheckCircle2 size={20} className="text-[#10B981]" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#4D6186]">Server</span>
                    <span className="text-[#1E1E1E]">dhis2.doh.gov.ph</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4D6186]">Version</span>
                    <span className="text-[#1E1E1E]">2.40.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4D6186]">Organization</span>
                    <span className="text-[#1E1E1E]">Jagna RHU</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                  onClick={() => toast.success('Connection test successful')}
                >
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[#D4DBDE]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                    <RefreshCw size={14} className="text-[#7C3AED]" />
                  </div>
                  <CardTitle className="text-[#1E1E1E] text-sm">Synchronization</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F3F0FF] border border-[#7C3AED] rounded">
                  <div>
                    <p className="text-xs text-[#1E1E1E] mb-0.5">Last Sync</p>
                    <p className="text-[10px] text-[#7C3AED]">2 hours ago</p>
                  </div>
                  <Clock size={20} className="text-[#7C3AED]" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#1E1E1E]">Auto-Sync</p>
                      <p className="text-[10px] text-[#4D6186]">Every 6 hours</p>
                    </div>
                    <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#4D6186]">Next Sync</span>
                    <span className="text-[#1E1E1E]">Nov 4, 20:00</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-[#4D6186]">Synced Today</span>
                    <span className="text-[#1E1E1E]">127 records</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs gap-1.5"
                  onClick={handleSyncNow}
                >
                  <RefreshCw size={12} />
                  Sync Now
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                  <History size={14} className="text-[#7C3AED]" />
                </div>
                <CardTitle className="text-[#1E1E1E] text-sm">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {auditLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2 border border-[#D4DBDE] rounded hover:bg-[#F9FAFB]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-[#7C3AED] text-xs min-w-[40px]">{log.time}</div>
                      <div>
                        <p className="text-xs text-[#1E1E1E]">{log.user}</p>
                        <p className="text-[10px] text-[#4D6186]">{log.action}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#10B981] text-[10px]">
                      <CheckCircle2 size={10} className="mr-0.5" />
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
            <p className="text-[10px] text-[#1E1E1E]">
              <strong>DHIS2 Integration:</strong> HealthHive syncs patient records and treatment data to DHIS2 every 6 hours. Manual sync available for immediate upload.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Info */}
      <Card className="border-[#D4DBDE]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#1E1E1E] text-sm">System Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-[#4D6186] text-xs mb-0.5">Dashboard Version</p>
              <p className="text-[#1E1E1E] text-xs">1.2.4</p>
            </div>
            <div>
              <p className="text-[#4D6186] text-xs mb-0.5">Mobile App</p>
              <p className="text-[#1E1E1E] text-xs">1.2.2</p>
            </div>
            <div>
              <p className="text-[#4D6186] text-xs mb-0.5">DHIS2</p>
              <p className="text-[#1E1E1E] text-xs">2.40.3</p>
            </div>
            <div>
              <p className="text-[#4D6186] text-xs mb-0.5">Updated</p>
              <p className="text-[#1E1E1E] text-xs">Oct 2025</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#D4DBDE]">
            <p className="text-[10px] text-[#4D6186]">
              <strong>HealthHive Dashboard</strong> developed in collaboration with Philos Health
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
