import { useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import healthHiveLogo from "figma:asset/dd98ebb2972f77280b64c77bb5a5873e31757242.png";
import { api } from "../../../lib/api";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>("medical");

  const roles = [
    { id: 'medical', label: 'Medical Professional' },
    { id: 'ngo', label: 'NGO/Government' },
    { id: 'health', label: 'Public health team' },
    { id: 'analyst', label: 'Data Analyst' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.login(username, password);
      toast.success(`Welcome back, ${response.user.full_name}!`);
      onLogin();
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white border-0 shadow-xl rounded-3xl my-4">
        <CardContent className="pt-6 pb-6 px-8">
          {/* Logo and Branding */}
          <div className="text-center mb-4">
            {/* HealthHive Logo */}
            <div className="flex justify-center mb-3">
              <img 
                src={healthHiveLogo} 
                alt="HealthHive Dashboard Logo" 
                className="w-auto h-28 object-contain"
              />
            </div>
            <p className="text-base text-[#1E1E1E] mb-4">
              Jagna Health Data Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[#1E1E1E]">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 bg-[#F3F4F6] border-0 rounded-lg"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#1E1E1E]">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 bg-[#F3F4F6] border-0 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#1E1E1E]">Select Role</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`h-11 px-3 rounded-xl border-2 transition-all ${
                      selectedRole === role.id
                        ? 'bg-[#A78BFA] text-white border-[#A78BFA]'
                        : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#A78BFA]'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-[#A78BFA] hover:bg-[#9333EA] text-white rounded-xl"
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-5 space-y-0.5">
            <p className="text-xs text-[#6B7280]">
              Demo credentials: admin / admin123
            </p>
            <p className="text-sm text-[#6B7280]">Jagna, Bohol, Philippines</p>
            <p className="text-sm text-[#6B7280]">Offline-first · DHIS2 Integration</p>
            <p className="text-sm text-[#9CA3AF] mt-2">In collaboration with Philos Health</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}