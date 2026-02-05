import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ValidationRulesDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ValidationRulesDialog({ open, onClose }: ValidationRulesDialogProps) {
  const validationIssues = [
    {
      id: 1,
      patient: 'JAG-000178',
      name: 'Pedro Santos',
      rule: 'BP Systolic Range',
      issue: 'Systolic BP 212 exceeds maximum threshold (200)',
      severity: 'high',
      value: '212/110'
    },
    {
      id: 2,
      patient: 'JAG-000189',
      name: 'Linda Cruz',
      rule: 'HbA1c Format',
      issue: 'HbA1c value format invalid',
      severity: 'medium',
      value: '8.9'
    },
    {
      id: 3,
      patient: 'JAG-000192',
      name: 'Ramon Torres',
      rule: 'Age-Weight Consistency',
      issue: 'Weight seems unusually low for age group',
      severity: 'low',
      value: '42 kg (Age 58)'
    },
    {
      id: 4,
      patient: 'JAG-000201',
      name: 'Elena Reyes',
      rule: 'Medication Dosage',
      issue: 'Metformin dosage exceeds recommended maximum',
      severity: 'high',
      value: '2500mg daily'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-[#DC2626] text-white';
      case 'medium':
        return 'bg-[#F97316] text-white';
      case 'low':
        return 'bg-[#FCD34D] text-[#1E1E1E]';
      default:
        return 'bg-[#D4DBDE] text-[#1E1E1E]';
    }
  };

  const handleReview = (id: number) => {
    toast.success('Issue Reviewed', {
      description: `Validation issue #${id} marked for manual review.`
    });
  };

  const handleReviewAll = () => {
    toast.success('All Issues Flagged', {
      description: 'All validation issues have been flagged for manual review.'
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E] flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#F97316]" />
            Validation Rule Violations
          </DialogTitle>
          <DialogDescription className="text-xs text-[#4D6186]">
            Review records that violate data validation rules
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          <div className="bg-[#FFFBEB] border border-[#FDE047] rounded-md p-2">
            <p className="text-xs text-[#1E1E1E]">
              <strong>{validationIssues.length} records</strong> have data quality issues that violate validation rules. Review each issue and take appropriate action.
            </p>
          </div>

          {validationIssues.map((issue) => (
            <div key={issue.id} className="border border-[#D4DBDE] rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#1E1E1E]">{issue.name}</span>
                    <Badge variant="outline" className="text-[10px] h-3.5 px-1">{issue.patient}</Badge>
                    <Badge className={`text-[10px] h-3.5 px-1 ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-[#4D6186]">
                    Rule: <strong>{issue.rule}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-md p-2 mb-2">
                <div className="flex items-start gap-2">
                  <Info size={12} className="text-[#DC2626] mt-0.5 flex-shrink-0" />
                  <div className="text-[10px] text-[#1E1E1E]">{issue.issue}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-[#4D6186]">
                  Value: <span className="text-[#1E1E1E]">{issue.value}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-6 text-[10px] border-[#D4DBDE]"
                  onClick={() => handleReview(issue.id)}
                >
                  Mark for Review
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
          <Button 
            onClick={handleReviewAll} 
            className="h-7 text-xs bg-[#7C3AED] hover:bg-[#6D28D9]"
          >
            Flag All for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
