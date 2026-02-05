import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { barangays } from "../../../data/mockData";

interface ScheduleVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleVisitDialog({ open, onOpenChange }: ScheduleVisitDialogProps) {
  const [date, setDate] = useState<Date>();
  const [barangay, setBarangay] = useState("");
  const [team, setTeam] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const handleSchedule = () => {
    if (!date || !barangay || !team || !timeSlot) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Visit scheduled successfully", {
      description: `${barangay} - ${date.toLocaleDateString()} at ${timeSlot}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">Schedule Field Visit</DialogTitle>
          <DialogDescription className="text-[#4D6186] text-xs">
            Plan a mobile clinic visit to a barangay
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#1E1E1E] text-xs">Visit Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left text-xs border-[#D4DBDE] h-8"
                  >
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {date ? date.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-[#1E1E1E] text-xs">Time Slot *</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className="border-[#D4DBDE] h-8 text-xs">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8am-12pm" className="text-xs">8:00 AM - 12:00 PM</SelectItem>
                  <SelectItem value="1pm-5pm" className="text-xs">1:00 PM - 5:00 PM</SelectItem>
                  <SelectItem value="full-day" className="text-xs">Full Day (8 AM - 5 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#1E1E1E] text-xs flex items-center gap-1">
              <MapPin size={12} />
              Barangay *
            </Label>
            <Select value={barangay} onValueChange={setBarangay}>
              <SelectTrigger className="border-[#D4DBDE] h-8 text-xs">
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((bg) => (
                  <SelectItem key={bg.id} value={bg.name} className="text-xs">
                    {bg.name} ({bg.registered} registered patients)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#1E1E1E] text-xs flex items-center gap-1">
              <Users size={12} />
              Field Team *
            </Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger className="border-[#D4DBDE] h-8 text-xs">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team-a" className="text-xs">Team A - Maria Santos</SelectItem>
                <SelectItem value="team-b" className="text-xs">Team B - Juan dela Cruz</SelectItem>
                <SelectItem value="team-c" className="text-xs">Team C - Rosa Garcia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[#1E1E1E] text-xs">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Special instructions, equipment needed, etc."
              className="text-xs border-[#D4DBDE] h-8"
            />
          </div>

          <div className="p-3 bg-[#F3F0FF] rounded-md border border-[#D4DBDE]">
            <p className="text-xs text-[#1E1E1E]">
              <strong>Note:</strong> The selected team will be notified via SMS. Make sure to prepare field kits before the visit date.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#D4DBDE] text-xs">
            Cancel
          </Button>
          <Button onClick={handleSchedule} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-xs">
            Schedule Visit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
