import { Search, Bell, User, Wifi, WifiOff, Download, Languages } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { useLanguage } from "../../lib/i18n";

interface TopBarProps {
  onDateRangeChange: (range: string) => void;
  dateRange: string;
  onLogout?: () => void;
  onNavigate?: (tab: string) => void;
}

export function TopBar({ onDateRangeChange, dateRange, onLogout, onNavigate }: TopBarProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState(12);
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    toast.success('Logged out successfully');
    if (onLogout) {
      onLogout();
    }
  };

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <div className="bg-white border-b border-[#D4DBDE] px-4 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#4D6186]" size={14} />
            <Input 
              type="search" 
              placeholder={t("topbar.search")}
              className="pl-8 h-7 text-xs border-[#D4DBDE]"
            />
          </div>

          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-36 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">{t("topbar.thisMonth")}</SelectItem>
              <SelectItem value="last-90">{t("topbar.last90")}</SelectItem>
              <SelectItem value="ytd">{t("topbar.ytd")}</SelectItem>
              <SelectItem value="custom">{t("topbar.custom")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-1.5 h-7 text-xs px-2"
            onClick={() => setIsOnline(!isOnline)}
          >
            {isOnline ? (
              <>
                <Wifi size={12} className="text-[#274492]" />
                <span className="text-[#1E1E1E]">{t("topbar.online")}</span>
              </>
            ) : (
              <>
                <WifiOff size={12} className="text-[#4D6186]" />
                <span className="text-[#1E1E1E]">{t("topbar.offline")}</span>
              </>
            )}
            {syncQueue > 0 && (
              <Badge variant="secondary" className="ml-0.5 text-[10px] h-4 px-1">{syncQueue}</Badge>
            )}
          </Button>

          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-[#D4DBDE] bg-[#F9FAFB]">
            <Languages size={11} className="text-[#4D6186]" />
            <div className="flex gap-0">
              {[
                { code: 'en', label: 'EN' },
                { code: 'tl', label: 'TL' },
                { code: 'ceb', label: 'CEB' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`h-5 px-1.5 text-[10px] transition-colors ${
                    language === lang.code 
                      ? 'bg-[#274492] text-white' 
                      : 'bg-transparent text-[#4D6186] hover:bg-[#EAF0F6]'
                  } ${
                    lang.code === 'en' ? 'rounded-l' : 
                    lang.code === 'ceb' ? 'rounded-r' : ''
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <Button variant="ghost" size="icon" className="h-7 w-7 relative">
            <Bell size={14} />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <User size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">Programme Manager</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs" onClick={() => handleNavigate('profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => handleNavigate('settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-[#CD5E31]" onClick={handleLogout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
