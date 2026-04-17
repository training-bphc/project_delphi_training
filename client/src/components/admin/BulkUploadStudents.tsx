import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { bulkUploadStudents } from "@/lib/api/studentApi";
import type { BulkUploadResult } from "@/lib/api/studentApi";
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
        setFile(null);
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

  return (
    <div className="bulk-upload-container">
      <div className="bulk-upload-card">
        <h3>Bulk Upload Students</h3>

        <div
          className={`upload-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-zone-content">
            <p>Drag and drop your CSV file here</p>
            <p className="or-text">or</p>
            <label className="file-input-label">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <span>Browse Files</span>
            </label>
          </div>
        </div>

        {file && (
          <div className="selected-file">
            <p>
              <strong>Selected:</strong> {file.name}
            </p>
            <p className="file-size">({(file.size / 1024).toFixed(2)} KB)</p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="upload-button"
        >
          {isLoading ? "Uploading..." : "Upload CSV"}
        </Button>

        {result && (
          <div className="upload-result">
            <div className="result-summary">
              <h4>Upload Result</h4>
              <p>
                <strong>Total Processed:</strong>{" "}
                {result.data.summary.total_processed}
              </p>
              <p className="success">
                <strong>Successful:</strong> {result.data.summary.successful}
              </p>
              <p className="error">
                <strong>Failed:</strong> {result.data.summary.failed}
              </p>
            </div>

            {result.data.errors.length > 0 && (
              <div className="errors-section">
                <h5>Errors ({result.data.errors.length})</h5>
                <div className="errors-list">
                  {result.data.errors.map((error, index) => (
                    <div key={index} className="error-item">
                      <p>
                        <strong>Row {error.row}:</strong> {error.error}
                      </p>
                      {error.email && <p className="email">{error.email}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.data.students.length > 0 && (
              <div className="students-section">
                <h5>Successfully Uploaded Students</h5>
                <div className="students-list">
                  {result.data.students.map((student, index) => (
                    <div key={index} className="student-item">
                      <p>
                        <strong>{student.student_name}</strong> ({student.roll_number})
                      </p>
                      <p className="email">{student.email}</p>
                      <p className="details">
                        {student.sector} | Batch {student.end_year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="csv-format-hint">
          <p>
            <strong>CSV Format Required:</strong> email, student_name, roll_number,
            start_year, end_year, cgpa, sector
          </p>
          <p>
            <strong>Sectors:</strong> IT, ET, Core, FinTech
          </p>
        </div>
      </div>
    </div>
  );
}