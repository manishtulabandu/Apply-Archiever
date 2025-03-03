
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { JobApplication, FileUpload as FileUploadType } from "@/types";
import FileUploader from "@/components/ui/file-upload";
import { v4 as uuidv4 } from "uuid";

interface ApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (application: JobApplication) => void;
  initialData?: JobApplication;
}

const emptyFileUpload: FileUploadType = { file: null, preview: null };

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [resumeUpload, setResumeUpload] = useState<FileUploadType>(emptyFileUpload);
  const [coverLetterUpload, setCoverLetterUpload] = useState<FileUploadType>(emptyFileUpload);
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName);
      setJobLink(initialData.jobLink || "");
      setNotes(initialData.notes || "");
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [initialData, open]);

  const resetForm = () => {
    setCompanyName("");
    setJobLink("");
    setResumeUpload(emptyFileUpload);
    setCoverLetterUpload(emptyFileUpload);
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const application: JobApplication = {
      id: initialData?.id || uuidv4(),
      companyName,
      jobLink,
      resumeFile: resumeUpload.file,
      coverLetterFile: coverLetterUpload.file,
      createdAt: initialData?.createdAt || new Date(),
      notes,
    };
    
    onSave(application);
    onOpenChange(false);
    if (!isEditing) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl">
              {isEditing ? "Edit Application" : "Add New Application"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your job application details below."
                : "Fill in the details of your job application."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 space-y-6 max-h-[60vh] overflow-y-auto py-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobLink">Job Link</Label>
              <Input
                id="jobLink"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                placeholder="https://example.com/job-posting"
                type="url"
              />
            </div>
            
            <FileUploader
              label="Resume"
              accept=".pdf,.doc,.docx"
              value={resumeUpload}
              onChange={setResumeUpload}
              helperText="PDF, DOC, or DOCX up to 5MB"
            />
            
            <FileUploader
              label="Cover Letter"
              accept=".pdf,.doc,.docx"
              value={coverLetterUpload}
              onChange={setCoverLetterUpload}
              helperText="PDF, DOC, or DOCX up to 5MB"
            />
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this application"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 bg-muted/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationForm;
