import styles from './addTrainingPoints.module.css';

interface AddTrainingEmailProps {
  studentId: string;
  onSubmit?: () => void;
}

function AddTrainingEmail({ studentId, onSubmit }: AddTrainingEmailProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement email-based submission
    console.log('Email submission for student:', studentId);
    onSubmit?.();
  };

  return (
    <div className={styles.container}>
      <h2>Add Training via Email</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="your.email@example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="emailSubject">Email Subject</label>
          <input
            type="text"
            id="emailSubject"
            name="emailSubject"
            required
            placeholder="e.g., Request verification - Internship"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            placeholder="Describe the training activity..."
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Send for Verification
        </button>
      </form>
    </div>
  );
}

export default AddTrainingEmail;
