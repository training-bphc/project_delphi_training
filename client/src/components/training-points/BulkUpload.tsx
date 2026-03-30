import { useEffect, useState } from 'react';
import styles from './bulkUpload.module.css';
import type { TrainingCategory } from '@/../shared/types';

interface BulkUploadProps {
  categories: TrainingCategory[];
  onUpload: (emails: string[], categoryId: number, points: number) => Promise<void>;
  isLoading?: boolean;
}

function BulkUpload({ categories, onUpload, isLoading = false }: BulkUploadProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.category_id ?? 0);
  const [points, setPoints] = useState<number>(1);
  const [fileError, setFileError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].category_id);
    }
  }, [categories, categoryId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').map((line) => line.trim());
        const emailList = lines.filter((line) => line.length > 0 && line.includes('@'));

        if (emailList.length === 0) {
          setFileError('No valid emails found in file');
          return;
        }

        setEmails(emailList);
        setShowForm(true);
      } catch (error) {
        setFileError('Error reading file');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (emails.length === 0) {
      setFileError('No emails loaded');
      return;
    }

    if (!categoryId) {
      setFileError('Please select a category');
      return;
    }

    if (points <= 0) {
      setFileError('Points must be greater than 0');
      return;
    }

    try {
      await onUpload(emails, categoryId, points);
      setEmails([]);
      setCategoryId(categories[0]?.category_id ?? 0);
      setPoints(1);
      setShowForm(false);
      setFileError('');
    } catch (error) {
      setFileError('Upload failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Bulk Add Training Points</h2>
      <p>Upload a CSV file with email addresses to assign training points to multiple students at once.</p>

      <div className={styles.uploadSection}>
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          disabled={isLoading}
          id="csvFile"
          className={styles.fileInput}
        />
        <label htmlFor="csvFile" className={styles.fileLabel}>
          Choose CSV File
        </label>
      </div>

      {fileError && <div className={styles.error}>{fileError}</div>}

      {showForm && emails.length > 0 && (
        <div className={styles.formSection}>
          <p>
            <strong>{emails.length} email(s) loaded</strong>
          </p>

          <div className={styles.formGroup}>
            <label>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              disabled={isLoading}
            >
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Points to Assign</label>
            <input
              type="number"
              min="0"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              disabled={isLoading}
            />
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? 'Uploading...' : 'Upload & Assign'}
            </button>
            <button
              onClick={() => {
                setEmails([]);
                setShowForm(false);
                setFileError('');
              }}
              disabled={isLoading}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkUpload;
