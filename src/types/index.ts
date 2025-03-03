
export interface JobApplication {
  id: string;
  companyName: string;
  jobLink: string;
  resumeFile?: File | null;
  coverLetterFile?: File | null;
  createdAt: Date;
  notes?: string;
}

export type FileUpload = {
  file: File | null;
  preview: string | null;
};
