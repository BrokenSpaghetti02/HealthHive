import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface RequestSupplyDialogProps {
  open: boolean;
  onClose: () => void;
  itemName?: string;
}

export function RequestSupplyDialog({ open, onClose, itemName }: RequestSupplyDialogProps) {
  const [formData, setFormData] = useState({
    item: itemName || '',
    quantity: '',
    urgency: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast.success('Supply Request Submitted', {
      description: `Request for ${formData.quantity} units of ${formData.item} has been submitted successfully.`
    });
    
    onClose();
    setFormData({ item: '', quantity: '', urgency: '', reason: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">Request Supply</DialogTitle>
          <DialogDescription className="text-xs text-[#4D6186]">
            Submit a request for medical supplies or equipment
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="item" className="text-xs text-[#4D6186]">Item Name</Label>
            <Input
              id="item"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              placeholder="Enter item name"
              className="h-7 text-xs mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="quantity" className="text-xs text-[#4D6186]">Quantity Needed</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Enter quantity"
              className="h-7 text-xs mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="urgency" className="text-xs text-[#4D6186]">Urgency Level</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
              <SelectTrigger className="h-7 text-xs mt-1">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent" className="text-xs">Urgent (1-3 days)</SelectItem>
                <SelectItem value="high" className="text-xs">High (1 week)</SelectItem>
                <SelectItem value="normal" className="text-xs">Normal (2-4 weeks)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason" className="text-xs text-[#4D6186]">Reason for Request</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Provide details about why this supply is needed"
              className="text-xs mt-1 min-h-[60px]"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="h-7 text-xs">
              Cancel
            </Button>
            <Button type="submit" className="h-7 text-xs bg-[#7C3AED] hover:bg-[#6D28D9]">
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
