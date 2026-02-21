import styles from './addTrainingPoints.module.css';

interface AddTrainingCSVProps {
  studentId: string;
  onSubmit?: () => void;
}

function AddTrainingCSV({ studentId, onSubmit }: AddTrainingCSVProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement CSV parsing and submission
    console.log('CSV file selected for student:', studentId, file.name);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <div className={styles.container}>
      <h2>Add Training via CSV</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="csvFile">Upload CSV File</label>
          <input
            type="file"
            id="csvFile"
            name="csvFile"
            accept=".csv"
            required
            onChange={handleFileChange}
          />
        </div>

        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          CSV should have columns: name, email_id, date, category
        </p>

        <button type="submit" className={styles.submitButton}>
          Upload and Verify
        </button>
      </form>
    </div>
  );
}

export default AddTrainingCSV;
