
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobApplication } from "@/types";
import { Calendar, ExternalLink, Trash2, FileText, Edit2, Download, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ApplicationCardProps {
  application: JobApplication;
  onDelete: (id: string) => void;
  onEdit: (application: JobApplication) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onDelete,
  onEdit,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleDownload = (file: File | null | undefined, fileName: string) => {
    if (!file) return;
    
    // Create a URL for the file
    const url = URL.createObjectURL(file);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium truncate">
            <Button 
              variant="link" 
              className="p-0 h-auto font-medium text-lg text-left justify-start hover:no-underline" 
              onClick={() => setDetailsOpen(true)}
            >
              {application.companyName}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Applied {formatDistanceToNow(application.createdAt, { addSuffix: true })}</span>
          </div>
          
          {application.jobLink && (
            <div className="pt-2">
              <a
                href={application.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm inline-flex items-center text-primary hover:underline"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                View Job Posting
              </a>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {application.resumeFile && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleDownload(application.resumeFile, `resume-${application.companyName}.pdf`)}
              >
                <Download className="h-3 w-3 mr-1" />
                Resume
              </Button>
            )}
            
            {application.coverLetterFile && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleDownload(application.coverLetterFile, `cover-letter-${application.companyName}.pdf`)}
              >
                <Download className="h-3 w-3 mr-1" />
                Cover Letter
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={() => setDetailsOpen(true)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>
          
          {application.notes && (
            <div className="pt-1">
              <p className="text-sm text-muted-foreground truncate">
                {application.notes.length > 120
                  ? `${application.notes.substring(0, 120)}...`
                  : application.notes}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/30 pt-3 pb-3 px-6 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(application)}
            className="text-muted-foreground hover:text-primary"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(application.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{application.companyName}</DialogTitle>
            <DialogDescription>
              Applied {formatDistanceToNow(application.createdAt, { addSuffix: true })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {application.jobLink && (
              <div>
                <h4 className="text-sm font-medium mb-1">Job Link</h4>
                <a
                  href={application.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm inline-flex items-center text-primary hover:underline break-all"
                >
                  <ExternalLink className="mr-1 h-3 w-3 flex-shrink-0" />
                  {application.jobLink}
                </a>
              </div>
            )}
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Application Documents</h4>
              <div className="flex flex-col gap-2">
                {application.resumeFile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleDownload(application.resumeFile, `resume-${application.companyName}.pdf`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">No resume uploaded</p>
                )}
                
                {application.coverLetterFile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => handleDownload(application.coverLetterFile, `cover-letter-${application.companyName}.pdf`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Cover Letter
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">No cover letter uploaded</p>
                )}
              </div>
            </div>
            
            <Separator />
            
            {application.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(application)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationCard;
