"use client";

import { useState, useRef } from "react";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UploadCloud, AlertCircle, FileText, Check, X } from "lucide-react";

interface UploadStats {
  processed: number;
  skipped: number;
  failed: number;
  total: number;
}

const CSVUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_FILE_TYPES = [
    "text/csv",
    "application/vnd.ms-excel", // Some systems use this for CSV
    "application/csv",
  ];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload a CSV file.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    const error = validateFile(selectedFile);
    if (error) {
        toast.error("Invalid File", {
            description: error
        });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setUploadError(null);
    setUploadStats(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    const error = validateFile(droppedFile);
    if (error) {
        toast.error("Invalid File", {
            description: error
        });
      return;
    }

    setFile(droppedFile);
    setUploadError(null);
    setUploadStats(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulated progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const increment = Math.random() * 15;
          const newProgress = prev + increment;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 500);

      const response = await fetch("/api/transactions/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const result = await response.json();
      
      // Example stats - would come from the API response
      setUploadStats({
        processed: result.processed || 0,
        skipped: result.skipped || 0,
        failed: result.failed || 0,
        total: result.total || 0,
      });

      toast("Upload Successful", {
        description: `Successfully processed ${result.processed || 0} transactions.`,
      });
    } catch (error) {
      setUploadProgress(0);
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred");
      
      toast.error("Upload Failed", {
        description: error instanceof Error ? error.message : "Failed to upload file",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setUploadStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
        <CardDescription>
          Upload a CSV file to import your transactions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* File Drop Zone */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer
            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
            disabled={isUploading}
          />
          
          <UploadCloud 
            className={`h-10 w-10 mb-2 ${isDragging ? "text-primary" : "text-muted-foreground"}`} 
          />
          
          <p className="text-sm font-medium mb-1">
            {isDragging ? "Drop your file here" : "Drag & drop your CSV file here"}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            or click to browse files
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: 5MB (CSV only)
          </p>
        </div>

        {/* Selected File */}
        {file && (
          <div className="bg-secondary p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="truncate">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Upload Success Stats */}
        {uploadStats && (
          <div className="bg-muted p-3 rounded-md space-y-2">
            <div className="flex items-center text-sm font-medium text-green-600">
              <Check className="h-4 w-4 mr-2" />
              Upload Complete
            </div>
            <ul className="text-xs space-y-1">
              <li className="flex justify-between">
                <span>Processed:</span>
                <span className="font-medium">{uploadStats.processed}</span>
              </li>
              {uploadStats.skipped > 0 && (
                <li className="flex justify-between text-amber-600">
                  <span>Skipped:</span>
                  <span className="font-medium">{uploadStats.skipped}</span>
                </li>
              )}
              {uploadStats.failed > 0 && (
                <li className="flex justify-between text-red-600">
                  <span>Failed:</span>
                  <span className="font-medium">{uploadStats.failed}</span>
                </li>
              )}
              <li className="flex justify-between border-t pt-1 mt-1">
                <span>Total:</span>
                <span className="font-medium">{uploadStats.total}</span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        {uploadStats ? (
          <Button onClick={resetUpload} className="w-full">
            Upload Another File
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={resetUpload}
              disabled={!file || isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={isUploading ? "opacity-80" : ""}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default CSVUpload;
