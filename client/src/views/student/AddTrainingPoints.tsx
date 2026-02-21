import { useContext } from 'react';
import styles from './addTrainingPoints.module.css';
import { RecordsContext } from '../../App';
import type { CreateRecordPayload } from '../../App';

interface AddTrainingPointsProps {
  studentId: string;
  onRecordAdded?: () => void;
}

function AddTrainingPoints({ studentId, onRecordAdded }: AddTrainingPointsProps) {
  const context = useContext(RecordsContext);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { handleCreateRecord } = context;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newRecord: CreateRecordPayload = {
      name: formData.get('name') as string,
      bits_id: studentId,
      email_id: formData.get('email') as string,
      date: formData.get('date') as string,
      category: formData.get('category') as string,
      added_by: studentId,
      points: 0,
    };

    await handleCreateRecord(newRecord);
    onRecordAdded?.();
  };

  return (
    <div className={styles.container}>
      <h2>Add Training Points</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Activity Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="e.g., Final Year Internship"
          />
        </div>

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
          <label htmlFor="date">Date</label>
          <input type="date" id="date" name="date" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" required defaultValue="">
            <option value="">Select a category</option>
            <option value="Sectorial Briefs">Sectorial Briefs</option>
            <option value="Mock Assessments">Mock Assessments</option>
            <option value="Mock Interviews">Mock Interviews</option>
            <option value="Mini Assessments">Mini Assessments</option>
            <option value="NT-Excel">NT-Excel</option>
            <option value="NT-SQL">NT-SQL</option>
            <option value="NT-Python">NT-Python</option>
            <option value="Guest Lectures / Workshops">Guest Lectures / Workshops</option>
            <option value="Hackathons/Competitions">Hackathons/Competitions</option>
            <option value="Bonus Points">Bonus Points</option>
          </select>
        </div>

        <button type="submit" className={styles.submitButton}>
          Submit for Verification
        </button>
      </form>
    </div>
  );
}

export default AddTrainingPoints;
