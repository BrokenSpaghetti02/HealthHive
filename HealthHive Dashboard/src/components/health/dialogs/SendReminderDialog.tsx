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
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import { MessageSquare, Mail, Phone } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendReminderDialog({ open, onOpenChange }: SendReminderDialogProps) {
  const [channels, setChannels] = useState({
    sms: true,
    messenger: true,
    call: false,
  });
  const [message, setMessage] = useState(
    "Hi! This is a reminder from HealthHive. Your follow-up visit is scheduled. Please come to the BHC for your BP check and medication refill. Stay healthy!"
  );

  const handleSend = () => {
    const activeChannels = Object.entries(channels)
      .filter(([_, active]) => active)
      .map(([channel]) => channel.toUpperCase())
      .join(", ");

    toast.success(`Reminders sent via ${activeChannels}`, {
      description: "Patients will receive notifications shortly",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">Send Reminders</DialogTitle>
          <DialogDescription className="text-[#4D6186] text-xs">
            Send follow-up reminders to patients via SMS, Messenger, or phone call
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#1E1E1E] text-xs">Select Communication Channels</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sms"
                  checked={channels.sms}
                  onCheckedChange={(checked) => setChannels({ ...channels, sms: checked as boolean })}
                />
                <Label htmlFor="sms" className="flex items-center gap-2 text-xs cursor-pointer">
                  <MessageSquare size={14} className="text-[#7C3AED]" />
                  SMS Text Message (12 patients)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="messenger"
                  checked={channels.messenger}
                  onCheckedChange={(checked) => setChannels({ ...channels, messenger: checked as boolean })}
                />
                <Label htmlFor="messenger" className="flex items-center gap-2 text-xs cursor-pointer">
                  <Mail size={14} className="text-[#7C3AED]" />
                  Facebook Messenger (8 patients)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="call"
                  checked={channels.call}
                  onCheckedChange={(checked) => setChannels({ ...channels, call: checked as boolean })}
                />
                <Label htmlFor="call" className="flex items-center gap-2 text-xs cursor-pointer">
                  <Phone size={14} className="text-[#7C3AED]" />
                  Phone Call Follow-up (3 high-priority)
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-[#1E1E1E] text-xs">Message Content</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] text-xs border-[#D4DBDE]"
              placeholder="Enter reminder message..."
            />
            <p className="text-[10px] text-[#4D6186]">
              Characters: {message.length} / 160 (1 SMS)
            </p>
          </div>

          <div className="p-3 bg-[#F3F0FF] rounded-md border border-[#D4DBDE]">
            <p className="text-xs text-[#1E1E1E]">
              <strong>Recipients:</strong> 12 patients with upcoming visits in the next 7 days
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#D4DBDE] text-xs">
            Cancel
          </Button>
          <Button onClick={handleSend} className="bg-[#7C3AED] hover:bg-[#6D28D9] text-xs">
            Send Reminders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
