
import React from "react";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";

interface EmptyStateProps {
  onAddNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddNew }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed animate-fade-in">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-5">
        <FilePlus className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No applications yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Start tracking your job applications by adding your first entry.
      </p>
      <Button onClick={onAddNew} className="animate-pulse">
        Add Your First Application
      </Button>
    </div>
  );
};

export default EmptyState;
