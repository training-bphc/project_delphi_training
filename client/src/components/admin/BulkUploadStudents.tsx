import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { bulkUploadStudents } from "@/lib/api/studentApi";
import type { BulkUploadResult } from "@/lib/api/studentApi";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import "./BulkUploadStudents.css";

interface BulkUploadStudentsProps {
  token: string;
  onUploadComplete?: () => void;
}

export default function BulkUploadStudents({
  token,
  onUploadComplete,
}: BulkUploadStudentsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
        setResult(null);
      } else {
        toast.error("Please upload a CSV file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsLoading(true);
    try {
      const uploadResult = await bulkUploadStudents(file, token);
      setResult(uploadResult);

      if (uploadResult.success) {
        toast.success(
          `Successfully uploaded ${uploadResult.data.summary.successful} students`,
        );
        if (onUploadComplete) {
          onUploadComplete();
        }
        // Close dialog after successful upload
        setTimeout(() => {
          setIsOpen(false);
          setFile(null);
          setResult(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 1500);
      } else {
        toast.error(`Upload failed: ${uploadResult.message}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload students",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      IT: "bg-blue-100 text-blue-800",
      ET: "bg-purple-100 text-purple-800",
      Core: "bg-green-100 text-green-800",
      FinTech: "bg-amber-100 text-amber-800",
    };
    return colors[sector] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="addStudentsButton addTrainingPointsButton" style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <Upload className="h-4 w-4" />
          Add Students
        </button>
      </DialogTrigger>
      <DialogContent className="bg-transparent shadow-none border-0 p-0 w-auto max-w-2xl !left-1/2 !-translate-x-1/2 !top-1/2 !-translate-y-1/2 !ring-0 !gap-0" showCloseButton={true}>
        <div className="bulkUploadModal">
          <h2>Bulk Upload Students</h2>

          <div className="bulkUploadForm">
          <div
            className={`fileUploadArea ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div>
              <p className="primary">
                Drag and drop your CSV file here
              </p>
              <p className="secondary">or</p>
              <label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <span>
                  Click here to select the file
                </span>
                {/* <Button className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-indigo-700 disabled:bg-gray-400">
                  Browse Files
                </Button> */}
              </label>
            </div>
          </div>

          {file && (
            <div className="fileInfo">
              <p className="name">Selected: {file.name}</p>
              <p className="size">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <div className="formatRequirements">
            <p className="header">⚠️ Important to Note:</p>
            <p className="details">
              Ensure your CSV file follows the exact format with these columns in order:
            </p>
            <p className="details" style={{ marginTop: "8px", fontFamily: "monospace" }}>
              email, student_name, roll_number, start_year, end_year, cgpa
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="uploadButton"
          >
            {isLoading ? "Uploading..." : "Upload CSV"}
          </button>

          {result && (
            <div className="uploadResult">
              <h4>Upload Result</h4>
              <div className="stats">
                <p>
                  <strong>Total Processed:</strong> {result.data.summary.total_processed}
                </p>
                <p className="success">
                  <strong>✓ Successful:</strong> {result.data.summary.successful}
                </p>
                <p className="error">
                  <strong>✗ Failed:</strong> {result.data.summary.failed}
                </p>
              </div>

              {result.data.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-red-900 flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Errors ({result.data.errors.length})
                  </h5>
                  <div className="space-y-2">
                    {result.data.errors.map((error, index) => (
                      <div
                        key={index}
                        className="bg-red-50 border-l-4 border-red-500 p-3 text-sm"
                      >
                        <p className="text-red-900 font-medium text-center">
                          Row {error.row}: {error.error}
                        </p>
                        {error.email && (
                          <p className="text-red-700 text-xs mt-1 text-center">{error.email}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.data.students.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-green-900 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Successfully Uploaded Students
                  </h5>
                  <div className="space-y-2">
                    {result.data.students.map((student, index) => (
                      <div key={index} className="bg-green-50 border-l-4 border-green-500 p-3 text-sm text-center">
                        <p className="text-green-900 font-medium">
                          {student.student_name} ({student.roll_number})
                        </p>
                        <p className="text-green-700 text-xs">{student.email}</p>
                        <div className="flex gap-2 mt-2 justify-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${getSectorColor(student.sector)}`}>
                            {student.sector}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800">
                            Batch {student.end_year}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}