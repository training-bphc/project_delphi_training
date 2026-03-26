import { useContext } from 'react';
import styles from './addTrainingPoints.module.css';
import { RecordsContext } from '../../App';
import type { CreateRecordPayload } from '../../App';

interface AddTrainingPointsProps {
  studentId: string;
  onRecordAdded?: () => void;
}

const EMAIL_DOMAIN = '@hyderabad.bits-pilani.ac.in';

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
      email_id: `${(formData.get('email_local') as string).trim()}${EMAIL_DOMAIN}`,
      date: formData.get('date') as string,
      category_id: Number(formData.get('category_id')),
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
          <div className={styles.emailInputGroup}>
            <input
              type="text"
              id="email"
              name="email_local"
              required
              placeholder="f20230046"
              pattern="^[^@\s]+$"
              title="Enter only the email part before @"
            />
            <span className={styles.emailDomain}>{EMAIL_DOMAIN}</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            defaultValue={getTodayDateString()}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <select id="category" name="category_id" required defaultValue="">
            <option value="">Select a category</option>
            {context.categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
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
