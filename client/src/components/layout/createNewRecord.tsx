import { useState } from 'react';
import styles from './createNewRecord.module.css';
import type { CreateRecordPayload, TrainingCategory } from '../../App';
import { useAuth } from '../../contexts/auth';

interface CreateNewRecordProps {
  handleCreateRecord: (record: CreateRecordPayload) => Promise<void>;
  categories: TrainingCategory[];
}

const EMAIL_DOMAIN = '@hyderabad.bits-pilani.ac.in';

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CreateNewRecord({ handleCreateRecord, categories }: CreateNewRecordProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailLocalPart, setEmailLocalPart] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const newRecord: CreateRecordPayload = {
        email_id: `${(formData.get('email_local') as string).trim()}${EMAIL_DOMAIN}`,
        date: formData.get('date') as string,
        category_id: Number(formData.get('category_id')),
        added_by: user?.email || '',
        points: Number(formData.get('points')),
      };

      await handleCreateRecord(newRecord);
      setIsOpen(false);
      setEmailLocalPart('');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Failed to create record:', error);
      alert('Failed to create record');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleBtn}
      >
        {isOpen ? 'Cancel' : 'Add New Record'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email_id">Email</label>
            <div className={styles.emailInputGroup}>
              <input
                type="text"
                id="email_id"
                name="email_local"
                required
                value={emailLocalPart}
                onChange={(e) => setEmailLocalPart(e.target.value.trim())}
                placeholder="f202xyyyy"
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
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.formGroup} ${styles.pointsGroup}`}>
            <label htmlFor="points">Points</label>
            <input
              type="number"
              id="points"
              name="points"
              required
              min={0}
              step={1}
              defaultValue={0}
              placeholder="Enter points"
            />
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitBtn}>
            {isLoading ? 'Creating...' : 'Create Record'}
          </button>
        </form>
        
      )}
    </div>
  );
}

export default CreateNewRecord;
