import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Phone, MapPin, Navigation } from "lucide-react";
import { Progress } from "../../ui/progress";

interface TeamMembersDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TeamMembersDialog({ open, onClose }: TeamMembersDialogProps) {
  const teamMembers = [
    { 
      name: 'Maria Santos', 
      role: 'Team A Leader',
      area: 'Tubod Monte, Naatang',
      status: 'Active',
      visits: '4/6',
      phone: '+63 912 345 6789',
      currentLocation: 'Naatang'
    },
    { 
      name: 'Juan dela Cruz', 
      role: 'Team B Leader',
      area: 'Poblacion, Cantagay',
      status: 'Active',
      visits: '6/8',
      phone: '+63 917 234 5678',
      currentLocation: 'Cantagay'
    },
    { 
      name: 'Rosa Garcia', 
      role: 'Team C Leader',
      area: 'Looc, Bogo',
      status: 'Break',
      visits: '3/5',
      phone: '+63 920 456 7890',
      currentLocation: 'Looc Clinic'
    },
    { 
      name: 'Pedro Reyes', 
      role: 'Field Coordinator',
      area: 'Mobile Supervision',
      status: 'Active',
      visits: 'N/A',
      phone: '+63 918 765 4321',
      currentLocation: 'Office'
    },
    { 
      name: 'Elena Cruz', 
      role: 'Data Officer',
      area: 'Data Management',
      status: 'Office',
      visits: 'N/A',
      phone: '+63 915 678 9012',
      currentLocation: 'Main Office'
    },
    { 
      name: 'Ramon Santos', 
      role: 'Supply Officer',
      area: 'Logistics',
      status: 'Office',
      visits: 'N/A',
      phone: '+63 919 234 5678',
      currentLocation: 'Warehouse'
    }
  ];

  const activeTeams = teamMembers.filter(m => m.status === 'Active').length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">Field Team Members</DialogTitle>
          <DialogDescription className="text-xs text-[#4D6186]">
            View all field team members and their current status
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          <div className="bg-[#F3F0FF] border border-[#7C3AED] rounded-md p-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[#4D6186] text-xs mb-0.5">Total Staff</div>
                <div className="text-[#1E1E1E] text-2xl">{teamMembers.length}</div>
              </div>
              <div>
                <div className="text-[#4D6186] text-xs mb-0.5">Active in Field</div>
                <div className="text-[#1E1E1E] text-2xl">{activeTeams}</div>
              </div>
              <div>
                <div className="text-[#4D6186] text-xs mb-0.5">Coverage</div>
                <div className="text-[#1E1E1E] text-2xl">8</div>
                <div className="text-[#4D6186] text-[10px]">Barangays today</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="border border-[#D4DBDE] rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs text-[#1E1E1E] mb-0.5">{member.name}</div>
                    <div className="text-[10px] text-[#4D6186]">{member.role}</div>
                  </div>
                  <Badge 
                    className={`text-[10px] h-4 px-1.5 ${
                      member.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : member.status === 'Break'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-[#F3F0FF] text-[#7C3AED]'
                    }`}
                  >
                    {member.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-2">
                  <div className="flex items-center gap-1 text-[10px] text-[#4D6186]">
                    <MapPin size={10} />
                    <span>{member.area}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#4D6186]">
                    <Navigation size={10} />
                    <span>Currently: {member.currentLocation}</span>
                  </div>
                </div>

                {member.visits !== 'N/A' && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-[#4D6186]">Progress</span>
                      <span className="text-[#7C3AED]">{member.visits} visits</span>
                    </div>
                    <Progress 
                      value={parseInt(member.visits.split('/')[0]) / parseInt(member.visits.split('/')[1]) * 100} 
                      className="h-1.5" 
                    />
                  </div>
                )}

                <div className="flex gap-1.5">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 h-6 text-[10px] border-[#D4DBDE] gap-1"
                  >
                    <Phone size={10} />
                    Call
                  </Button>
                  {member.status === 'Active' && (
                    <Button 
                      size="sm" 
                      className="flex-1 h-6 text-[10px] bg-[#7C3AED] hover:bg-[#6D28D9] gap-1"
                    >
                      <Navigation size={10} />
                      Track
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
