
import React, { useCallback, useState } from "react";
import { type FileUpload } from "@/types";
import { formatFileSize, getFileIcon } from "@/lib/file-utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FileUploaderProps {
  label: string;
  accept?: string;
  value: FileUpload;
  onChange: (value: FileUpload) => void;
  helperText?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  accept,
  value,
  onChange,
  helperText
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      onChange({ file, preview: url });
    }
  }, [onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      onChange({ file, preview: url });
    }
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange({ file: null, preview: null });
  }, [onChange]);

  const inputId = `file-upload-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2 w-full">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      
      <div
        className={`file-drop-area ${isDragging ? 'dragging' : ''} ${value.file ? 'border-primary/30 bg-secondary/50' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {value.file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center bg-accent rounded">
                <span className="text-primary text-xs">{getFileIcon(value.file.name)}</span>
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[240px]">{value.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(value.file.size)}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <label
                htmlFor={inputId}
                className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
              >
                <span className="underline underline-offset-4">Choose a file</span> or drag it here
              </label>
              {helperText && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
              )}
            </div>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
        />
      </div>
    </div>
  );
};

export default FileUploader;
