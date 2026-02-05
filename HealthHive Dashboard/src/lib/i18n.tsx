import { createContext, useContext, useMemo, useState } from "react";

type LanguageCode = "en" | "tl" | "ceb";

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    "topbar.search": "Search patients, barangays...",
    "topbar.online": "Online",
    "topbar.offline": "Offline",
    "topbar.thisMonth": "This Month",
    "topbar.last90": "Last 90 Days",
    "topbar.ytd": "Year to Date",
    "topbar.custom": "Custom Range",
    "sidebar.overview": "Overview",
    "sidebar.analytics": "Analytics",
    "sidebar.fieldOps": "Field Ops",
    "sidebar.registry": "Registry",
    "sidebar.dataQuality": "Data Quality",
    "sidebar.resources": "Resources",
    "sidebar.admin": "Admin",
    "sidebar.subtitle": "Jagna Health DMS",
    "sidebar.location": "Jagna, Bohol, Philippines",
    "sidebar.version": "v1.2.4 • Oct 2025",
    "sidebar.collab": "In collaboration with Philos Health",
    "settings.languageTitle": "Language",
    "settings.languageDescription": "Select your preferred language",
  },
  tl: {
    "topbar.search": "Maghanap ng pasyente, barangay...",
    "topbar.online": "Online",
    "topbar.offline": "Offline",
    "topbar.thisMonth": "Ngayong Buwan",
    "topbar.last90": "Huling 90 Araw",
    "topbar.ytd": "Taon hanggang ngayon",
    "topbar.custom": "Custom Range",
    "sidebar.overview": "Pangkalahatan",
    "sidebar.analytics": "Analitika",
    "sidebar.fieldOps": "Operasyon sa Field",
    "sidebar.registry": "Rehistro",
    "sidebar.dataQuality": "Kalidad ng Datos",
    "sidebar.resources": "Mga Resource",
    "sidebar.admin": "Admin",
    "sidebar.subtitle": "Jagna Health DMS",
    "sidebar.location": "Jagna, Bohol, Pilipinas",
    "sidebar.version": "v1.2.4 • Okt 2025",
    "sidebar.collab": "Kasama ang Philos Health",
    "settings.languageTitle": "Wika",
    "settings.languageDescription": "Piliin ang iyong wika",
  },
  ceb: {
    "topbar.search": "Pangita pasyente, barangay...",
    "topbar.online": "Online",
    "topbar.offline": "Offline",
    "topbar.thisMonth": "Karong Bulana",
    "topbar.last90": "Miaging 90 ka Adlaw",
    "topbar.ytd": "Tuig hangtod karon",
    "topbar.custom": "Custom Range",
    "sidebar.overview": "Overview",
    "sidebar.analytics": "Analytics",
    "sidebar.fieldOps": "Field Ops",
    "sidebar.registry": "Registry",
    "sidebar.dataQuality": "Data Quality",
    "sidebar.resources": "Resources",
    "sidebar.admin": "Admin",
    "sidebar.subtitle": "Jagna Health DMS",
    "sidebar.location": "Jagna, Bohol, Pilipinas",
    "sidebar.version": "v1.2.4 • Okt 2025",
    "sidebar.collab": "Kauban ang Philos Health",
    "settings.languageTitle": "Pinulongan",
    "settings.languageDescription": "Pili-a ang imong pinulongan",
  },
};

const LanguageContext = createContext<{
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("language");
    return (saved as LanguageCode) || "en";
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string) => translations[language]?.[key] || key;

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
