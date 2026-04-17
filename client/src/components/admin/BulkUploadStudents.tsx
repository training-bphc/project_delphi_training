import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { bulkUploadStudents } from "@/lib/api/studentApi";
import type { BulkUploadResult } from "@/lib/api/studentApi";
import { Upload, CheckCircle, AlertCircle, X } from "lucide-react";

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
        <Button className="gap-2" size="lg">
          <Upload className="h-4 w-4" />
          Add Students
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[70vw] max-w-2xl shadow-2xl" showCloseButton={false}>
        <div className="flex items-center justify-center mb-4 relative">
          <div className="flex items-center gap-2 justify-center">
            <Upload className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Bulk Upload Students</h2>
          </div>
          <DialogClose className="absolute right-0 p-2 rounded-full hover:bg-gray-200 hover:bg-opacity-50 transition-colors">
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Drag and drop your CSV file here
              </p>
              <p className="text-xs text-gray-500">or</p>
              <label className="inline-block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <span className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-indigo-700 disabled:bg-gray-400">
                  Browse Files
                </span>
              </label>
            </div>
          </div>

          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-900">
                Selected: {file.name}
              </p>
              <p className="text-xs text-green-700">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Uploading..." : "Upload CSV"}
          </Button>

          {result && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-blue-900 mb-2">Upload Result</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-blue-800">
                    <strong>Total Processed:</strong> {result.data.summary.total_processed}
                  </p>
                  <p className="text-green-700">
                    <strong>✓ Successful:</strong> {result.data.summary.successful}
                  </p>
                  <p className="text-red-700">
                    <strong>✗ Failed:</strong> {result.data.summary.failed}
                  </p>
                </div>
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

          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 text-center">
            <p className="font-semibold text-amber-900 mb-3 flex items-center justify-center gap-2">
              ⚠️ Important to Note
            </p>
            <p className="font-mono text-xs text-amber-900 mb-3 bg-white p-2 rounded border border-amber-200">
              email, student_name, roll_number, start_year, end_year, cgpa
            </p>
            <p className="text-sm text-amber-800">
              Ensure your CSV file follows the exact format above with these columns in order.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}