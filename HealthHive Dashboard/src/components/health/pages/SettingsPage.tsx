import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { 
  Settings,
  Palette,
  Globe,
  Download,
  Database,
  Bell,
  Shield,
  Zap,
  HardDrive,
  Wifi,
  Clock,
  CheckCircle2,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../lib/i18n";
import { toast } from "sonner@2.0.3";
import { Alert, AlertDescription } from "../../ui/alert";
import { Switch } from "../../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Slider } from "../../ui/slider";

export function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [dataRetention, setDataRetention] = useState([90]);

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  const handleResetSettings = () => {
    toast.success('Settings reset to defaults');
  };

  const handleClearCache = () => {
    toast.success('Cache cleared successfully');
  };

  const handleExportData = () => {
    toast.success('Exporting data... Download will begin shortly.');
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-0.5">Settings</h2>
          <p className="text-slate-600 text-xs">Configure application preferences and system settings</p>
        </div>
        <Button 
          className="bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-xs px-3 gap-1.5"
          onClick={handleSaveSettings}
        >
          <CheckCircle2 size={12} />
          Save All Settings
        </Button>
      </div>

      <Alert className="border-[#D4DBDE] bg-[#F3F0FF]">
        <Settings className="h-3 w-3 text-[#7C3AED]" />
        <AlertDescription className="text-[#1E1E1E] text-xs">
          <strong>System Preferences.</strong> Changes apply immediately • Some settings require app restart
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="appearance" className="space-y-3">
        <TabsList className="h-8 p-1 bg-[#F3F0FF] border border-[#D4DBDE]">
          <TabsTrigger 
            value="appearance" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Palette size={12} />
            Appearance
          </TabsTrigger>
          <TabsTrigger 
            value="language" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Globe size={12} />
            Language
          </TabsTrigger>
          <TabsTrigger 
            value="data" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Database size={12} />
            Data & Sync
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            className="text-xs px-4 gap-1.5 data-[state=active]:bg-[#7C3AED] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-[#4D6186] transition-all"
          >
            <Zap size={12} />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Theme</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Sun, label: 'Light', value: 'light' },
                  { icon: Moon, label: 'Dark', value: 'dark' },
                  { icon: Monitor, label: 'System', value: 'system' }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      (!darkMode && theme.value === 'light') || (darkMode && theme.value === 'dark')
                        ? 'border-[#7C3AED] bg-[#F3F0FF]'
                        : 'border-[#D4DBDE] bg-white hover:border-[#7C3AED]'
                    }`}
                    onClick={() => {
                      if (theme.value === 'dark') setDarkMode(true);
                      else if (theme.value === 'light') setDarkMode(false);
                      toast.success(`Theme changed to ${theme.label}`);
                    }}
                  >
                    <theme.icon size={20} className="mx-auto mb-1 text-[#7C3AED]" />
                    <p className="text-xs text-[#1E1E1E]">{theme.label}</p>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-[#FFFBEB] rounded border border-[#FDE047]">
                <p className="text-[10px] text-[#1E1E1E]">
                  <strong>Note:</strong> Dark mode is coming soon. Currently only Light theme is available.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Compact View</p>
                  <p className="text-[10px] text-[#4D6186]">Show more data in less space</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Show Tooltips</p>
                  <p className="text-[10px] text-[#4D6186]">Display helpful hints on hover</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Animations</p>
                  <p className="text-[10px] text-[#4D6186]">Enable UI transitions and animations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="p-3 border border-[#D4DBDE] rounded">
                <p className="text-xs text-[#1E1E1E] mb-2">Disease Color Coding</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#CD5E31]"></div>
                    <span className="text-xs text-[#1E1E1E]">Hypertension (HTN)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#274492]"></div>
                    <span className="text-xs text-[#1E1E1E]">Diabetes (DM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#7C3AED]"></div>
                    <span className="text-xs text-[#1E1E1E]">General/System</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#FDE047] border border-[#FDE047]"></div>
                    <span className="text-xs text-[#1E1E1E]">Insights</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">{t("settings.languageTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs text-[#4D6186]">{t("settings.languageDescription")}</p>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tl">Tagalog (Filipino)</SelectItem>
                    <SelectItem value="ceb">Cebuano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-[#F3F0FF] border border-[#7C3AED] rounded">
                <div className="flex items-start gap-2">
                  <Globe size={14} className="text-[#7C3AED] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#1E1E1E] mb-1">
                      Current: {language === "en" ? "English" : language === "tl" ? "Tagalog" : "Cebuano"}
                    </p>
                    <p className="text-[10px] text-[#4D6186]">
                      Language changes will apply to all menus, buttons, and system text. Medical terms remain in English for accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs text-[#4D6186]">Date Format</p>
                <Select defaultValue="mdy">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY (US)</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY (Philippines)</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD (ISO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-[#4D6186]">Time Format</p>
                <Select defaultValue="12">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12-hour (2:30 PM)</SelectItem>
                    <SelectItem value="24">24-hour (14:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs text-[#4D6186]">Number Format</p>
                <Select defaultValue="comma">
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">1,234.56 (Comma)</SelectItem>
                    <SelectItem value="space">1 234.56 (Space)</SelectItem>
                    <SelectItem value="period">1.234,56 (Period)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Sync Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Synchronization</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Auto-Sync with DHIS2</p>
                  <p className="text-[10px] text-[#4D6186]">Automatically sync data every 6 hours</p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              {autoSync && (
                <div className="ml-3 pl-3 border-l-2 border-[#7C3AED] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Sync Frequency</p>
                    <Select defaultValue="6h">
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Every hour</SelectItem>
                        <SelectItem value="3h">Every 3 hours</SelectItem>
                        <SelectItem value="6h">Every 6 hours</SelectItem>
                        <SelectItem value="12h">Every 12 hours</SelectItem>
                        <SelectItem value="24h">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Last Sync</p>
                    <Badge className="bg-[#10B981] text-[10px]">2 hours ago</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#1E1E1E]">Next Sync</p>
                    <Badge className="bg-[#7C3AED] text-[10px]">In 4 hours</Badge>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Offline Mode</p>
                  <p className="text-[10px] text-[#4D6186]">Work without internet connection</p>
                </div>
                <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
              </div>

              <div className="pt-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                  onClick={() => toast.success('Manual sync initiated')}
                >
                  <Database size={12} className="mr-1" />
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#4D6186]">Data Retention Period</p>
                  <Badge className="bg-[#7C3AED] text-[10px]">{dataRetention[0]} days</Badge>
                </div>
                <Slider 
                  value={dataRetention} 
                  onValueChange={setDataRetention}
                  min={30}
                  max={365}
                  step={30}
                  className="py-2"
                />
                <div className="flex justify-between text-[10px] text-[#4D6186]">
                  <span>30 days</span>
                  <span>365 days</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Local Storage Used</p>
                  <p className="text-[10px] text-[#4D6186]">124 MB of 500 MB</p>
                </div>
                <Badge className="bg-[#10B981] text-[10px]">25% Used</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                  onClick={handleClearCache}
                >
                  <HardDrive size={12} className="mr-1" />
                  Clear Cache
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                  onClick={handleExportData}
                >
                  <Download size={12} className="mr-1" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-3 bg-[#FFFBEB] rounded-md border border-[#FDE047]">
            <p className="text-[10px] text-[#1E1E1E]">
              <strong>Data Privacy:</strong> All patient data is encrypted and synced securely to DHIS2. Local data is automatically cleared after the retention period.
            </p>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Enable Analytics Caching</p>
                  <p className="text-[10px] text-[#4D6186]">Faster chart loading, uses more storage</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Preload Patient Data</p>
                  <p className="text-[10px] text-[#4D6186]">Load frequently accessed records in background</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">High Quality Maps</p>
                  <p className="text-[10px] text-[#4D6186]">Better detail, slower loading</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Developer Options</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Debug Mode</p>
                  <p className="text-[10px] text-[#4D6186]">Show detailed error messages</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-3 border border-[#D4DBDE] rounded">
                <div>
                  <p className="text-xs text-[#1E1E1E] mb-0.5">Show API Logs</p>
                  <p className="text-[10px] text-[#4D6186]">Display DHIS2 API request logs</p>
                </div>
                <Switch />
              </div>

              <Button 
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3F0FF]"
                onClick={() => toast.success('Console opened')}
              >
                Open Developer Console
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#D4DBDE]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1E1E1E] text-sm">Reset Options</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              <Button 
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs border-[#F59E0B] text-[#F59E0B] hover:bg-[#FFF7ED]"
                onClick={handleResetSettings}
              >
                Reset All Settings
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs border-[#CD5E31] text-[#CD5E31] hover:bg-[#FFF5F5]"
                onClick={() => toast.error('This action is not reversible')}
              >
                Clear All Local Data
              </Button>
            </CardContent>
          </Card>

          <div className="p-3 bg-[#FEF2F2] rounded-md border border-[#CD5E31]">
            <p className="text-[10px] text-[#1E1E1E]">
              <strong>Warning:</strong> Advanced settings can affect app performance and data integrity. Only modify if you understand the implications.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* System Information */}
      <Card className="border-[#D4DBDE]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#1E1E1E] text-sm">System Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-[#4D6186] mb-0.5">App Version</p>
              <p className="text-[#1E1E1E]">1.2.4</p>
            </div>
            <div>
              <p className="text-[#4D6186] mb-0.5">Build</p>
              <p className="text-[#1E1E1E]">2025.11.05</p>
            </div>
            <div>
              <p className="text-[#4D6186] mb-0.5">Environment</p>
              <p className="text-[#1E1E1E]">Production</p>
            </div>
            <div>
              <p className="text-[#4D6186] mb-0.5">Server</p>
              <p className="text-[#1E1E1E]">PH-Central</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
