import { useState } from 'react';
import styles from './createNewRecord.module.css';
import type { CreateRecordPayload } from '../../App';

interface CreateNewRecordProps {
  handleCreateRecord: (record: CreateRecordPayload) => Promise<void>;
}

const EMAIL_DOMAIN = '@hyderabad.bits-pilani.ac.in';

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function CreateNewRecord({ handleCreateRecord }: CreateNewRecordProps) {
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
        category: formData.get('category') as string,
        added_by: formData.get('added_by') as string,
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

          <div className={styles.formGroup}>
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

          <div className={styles.formGroup}>
            <label htmlFor="added_by">Added By</label>
            <input
              type="text"
              id="added_by"
              name="added_by"
              required
              placeholder="Your ID or name"
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
