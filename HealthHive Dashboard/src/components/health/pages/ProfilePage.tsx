import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Shield,
  Bell,
  Key,
  Activity,
  Clock,
  CheckCircle2,
  Edit,
  Camera
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "../../ui/alert";
import { Switch } from "../../ui/switch";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    toast.success('Password change request initiated. Check your email.');
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-0.5">My Profile</h2>
          <p className="text-slate-600 text-xs">Manage your account and preferences</p>
        </div>
        <Button 
          className="bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs px-3 gap-1.5"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit size={12} />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Alert className="border-[#D4DBDE] bg-[#F3F0FF]">
        <CheckCircle2 className="h-3 w-3 text-[#7C3AED]" />
        <AlertDescription className="text-[#1E1E1E] text-xs">
          <strong>Account Active.</strong> Last login: Today at 14:30 • Role: Programme Manager
        </AlertDescription>
      </Alert>

      {/* Profile Header Card */}
      <Card className="border-[#D4DBDE]">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-[#7C3AED]">
                <AvatarFallback className="bg-[#7C3AED] text-white text-xl">MS</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9]"
                >
                  <Camera size={12} />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-[#1E1E1E]">Dr. Maria Santos</h3>
                  <p className="text-[#4D6186] text-xs">Programme Manager</p>
                </div>
                <Badge className="bg-[#10B981] text-xs">Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-[#4D6186]">
                  <Mail size={12} />
                  <span>maria.santos@healthhive.ph</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#4D6186]">
                  <Phone size={12} />
                  <span>+63 917 123 4567</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#4D6186]">
                  <MapPin size={12} />
                  <span>Jagna RHU, Bohol</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#4D6186]">
                  <Briefcase size={12} />
                  <span>NGO/Government</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-3">
        <TabsList className="h-8 p-1 bg-[#F3F0FF] border border-[#D4DBDE]">
          <TabsTrigger 
            value="personal" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <User size={12} />
            Personal Info
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Shield size={12} />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Bell size={12} />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Activity size={12} />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#4D6186]">First Name</Label>
                  <Input 
                    defaultValue="Maria" 
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#4D6186]">Last Name</Label>
                  <Input 
                    defaultValue="Santos" 
                    disabled={!isEditing}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#4D6186]">Email Address</Label>
                <Input 
                  type="email"
                  defaultValue="maria.santos@healthhive.ph" 
                  disabled={!isEditing}
                  className="h-7 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#4D6186]">Phone Number</Label>
                <Input 
                  defaultValue="+63 917 123 4567" 
                  disabled={!isEditing}
                  className="h-7 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#4D6186]">Title/Position</Label>
                <Input 
                  defaultValue="Programme Manager" 
                  disabled={!isEditing}
                  className="h-7 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-[#4D6186]">Organization</Label>
                <Input 
                  defaultValue="Jagna Rural Health Unit" 
                  disabled={!isEditing}
                  className="h-7 text-xs"
                />
              </div>

              {isEditing && (
                <div className="pt-2 flex gap-2">
                  <Button 
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs flex-1"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-7 text-xs flex-1 border-[#D4DBDE]"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Role & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F3F0FF] border border-[#7C3AED] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Current Role</p>
                  <p className="text-[10px] text-[#7C3AED]">Programme Manager - Full Access</p>
                </div>
                <Badge className="bg-[#7C3AED] text-[10px]">Admin</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[#4D6186]">Permissions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'View Analytics',
                    'Manage Patients',
                    'Field Operations',
                    'Data Quality',
                    'Stock Management',
                    'User Administration',
                    'DHIS2 Sync',
                    'Export Reports'
                  ].map((permission, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-[#1E1E1E]">
                      <CheckCircle2 size={12} className="text-[#10B981]" />
                      {permission}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Password & Authentication</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Password</p>
                  <p className="text-[10px] text-[#4D6186]">Last changed 45 days ago</p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                  onClick={handleChangePassword}
                >
                  <Key size={12} className="mr-1" />
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Two-Factor Authentication</p>
                  <p className="text-[10px] text-[#4D6186]">Add extra security to your account</p>
                </div>
                <Badge className="bg-[#F59E0B] text-[10px]">Not Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Session Timeout</p>
                  <p className="text-[10px] text-[#4D6186]">Auto-logout after inactivity</p>
                </div>
                <Badge className="bg-[#7C3AED] text-[10px]">30 minutes</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Login History</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {[
                  { time: 'Today at 14:30', location: 'Jagna, Bohol', device: 'Chrome on Windows', status: 'Current' },
                  { time: 'Today at 09:15', location: 'Jagna, Bohol', device: 'Chrome on Windows', status: 'Success' },
                  { time: 'Nov 4 at 16:45', location: 'Jagna, Bohol', device: 'Mobile App', status: 'Success' },
                  { time: 'Nov 4 at 08:30', location: 'Jagna, Bohol', device: 'Chrome on Windows', status: 'Success' },
                ].map((login, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-[#D4DBDE] rounded hover:bg-[#F9FAFB]">
                    <div className="flex items-center gap-3">
                      <Clock size={12} className="text-[#7C3AED]" />
                      <div>
                        <p className="text-xs text-[#1E1E1E]">{login.time}</p>
                        <p className="text-[10px] text-[#4D6186]">{login.location} • {login.device}</p>
                      </div>
                    </div>
                    <Badge className={login.status === 'Current' ? 'bg-[#7C3AED]' : 'bg-[#10B981]'} variant="secondary">
                      <span className="text-[10px]">{login.status}</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Email Alerts</p>
                  <p className="text-[10px] text-[#4D6186]">Receive notifications via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              {emailNotifications && (
                <div className="ml-3 space-y-2 pl-3 border-l-2 border-[#7C3AED]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Daily Summary</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Weekly Reports</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Data Quality Alerts</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Stock Alerts</p>
                    <Switch />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">SMS Notifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">SMS Alerts</p>
                  <p className="text-[10px] text-[#4D6186]">Receive urgent alerts via SMS</p>
                </div>
                <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
              </div>

              {smsAlerts && (
                <div className="ml-3 space-y-2 pl-3 border-l-2 border-[#7C3AED]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Critical Data Issues</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">System Outages</p>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Stock Out Alerts</p>
                    <Switch />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">In-App Notifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#1E1E1E]">Field Visit Reminders</p>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#1E1E1E]">Patient Follow-ups</p>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#1E1E1E]">Sync Notifications</p>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {[
                  { time: '2 hours ago', action: 'Updated patient record JAG-000123', type: 'edit' },
                  { time: '3 hours ago', action: 'Generated monthly analytics report', type: 'export' },
                  { time: '5 hours ago', action: 'Scheduled field visit to Poblacion', type: 'schedule' },
                  { time: 'Yesterday', action: 'Synced 45 records to DHIS2', type: 'sync' },
                  { time: 'Yesterday', action: 'Reviewed data quality issues', type: 'review' },
                  { time: '2 days ago', action: 'Added new user: Nurse Ana Cruz', type: 'admin' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 border border-[#D4DBDE] rounded hover:bg-[#F9FAFB]">
                    <div className="p-1.5 rounded-md bg-[#F3F0FF]">
                      <Activity size={12} className="text-[#7C3AED]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[#1E1E1E]">{activity.action}</p>
                      <p className="text-[10px] text-[#4D6186]">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
            <p className="text-[10px] text-[#1E1E1E]">
              <strong>Activity Log:</strong> Your activity is tracked for security and audit purposes. Data is retained for 90 days.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
