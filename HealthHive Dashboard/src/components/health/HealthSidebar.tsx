import { 
  LayoutDashboard, 
  BarChart3, 
  MapPin,
  Users,
  CheckCircle2,
  Package,
  Settings,
  Activity
} from "lucide-react";
import logoImage from "figma:asset/fc3c5a096c4a448138b96cbb3f4e9c7bad3b777e.png";
import { useLanguage } from "../../lib/i18n";

interface HealthSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function HealthSidebar({ activeTab, onTabChange }: HealthSidebarProps) {
  const { t } = useLanguage();
  const navItems = [
    { id: 'overview', label: t("sidebar.overview"), icon: LayoutDashboard },
    { id: 'analytics', label: t("sidebar.analytics"), icon: BarChart3 },
    { id: 'field-ops', label: t("sidebar.fieldOps"), icon: MapPin },
    { id: 'registry', label: t("sidebar.registry"), icon: Users },
    { id: 'data-quality', label: t("sidebar.dataQuality"), icon: CheckCircle2 },
    { id: 'resources', label: t("sidebar.resources"), icon: Package },
    { id: 'admin', label: t("sidebar.admin"), icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#202123] text-white w-[168px] p-2">
      <div className="mb-4 px-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <img src={logoImage} alt="HealthHive Logo" className="w-5 h-5 object-contain" />
          <h1 className="text-sm">HealthHive</h1>
        </div>
        <p className="text-[#D4DBDE] text-[10px]">{t("sidebar.subtitle")}</p>
      </div>
      
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-1.5 px-1.5 py-1.5 rounded-md transition-colors text-left text-xs ${
                activeTab === item.id 
                  ? 'bg-[#7C3AED] text-white' 
                  : 'text-[#D4DBDE] hover:bg-[#1E1E1E] hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#1E1E1E] pt-2 px-1">
        <p className="text-[#D4DBDE]/60 text-[10px]">{t("sidebar.location")}</p>
        <p className="text-[#D4DBDE]/60 text-[10px] mt-0.5">{t("sidebar.version")}</p>
        <p className="text-[#D4DBDE]/40 text-[9px] mt-1">{t("sidebar.collab")}</p>
      </div>
    </div>
  );
}