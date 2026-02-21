import { useContext } from 'react';
import styles from './trainingPoints.module.css';
import { RecordsContext, type Record } from '../../App';

interface TrainingCategory {
  name: string;
  targetPoints: number;
  currentPoints: number;
}

const initialCategories: TrainingCategory[] = [
  {
    name: 'Sectorial Briefs',
    targetPoints: 8,
    currentPoints: 0,
  },
  {
    name: 'Mock Assessments',
    targetPoints: 8,
    currentPoints: 0,
  },
  {
    name: 'Mock Interviews',
    targetPoints: 12,
    currentPoints: 0,
  },
  {
    name: 'Mini Assessments',
    targetPoints: 2,
    currentPoints: 0,
  },
  {
    name: 'NT-Excel',
    targetPoints: 3,
    currentPoints: 0,
  },
  {
    name: 'NT-SQL',
    targetPoints: 3,
    currentPoints: 0,
  },
  {
    name: 'NT-Python',
    targetPoints: 5,
    currentPoints: 0,
  },
  {
    name: 'Guest Lectures / Workshops',
    targetPoints: 10,
    currentPoints: 0,
  },
  {
    name: 'Hackathons/Competitions',
    targetPoints: 10,
    currentPoints: 0,
  },
  {
    name: 'Bonus Points',
    targetPoints: 15,
    currentPoints: 0,
  },
];

interface TrainingPointsProps {
  studentId?: string;
  studentEmail?: string;
}

const CUTOFF_POINTS = 75;

function TrainingPoints({ studentId, studentEmail }: TrainingPointsProps) {
  const context = useContext(RecordsContext);

  if (!context) {
    return <div>Loading...</div>;
  }

  // Calculate points by category from verified records
  const categories = initialCategories.map((cat) => {
    const categoryRecords = context.records?.filter(
      (record: Record) =>
        record.category === cat.name &&
        record.verification_status === 'Verified' &&
        (
          (!studentId && !studentEmail) ||
          record.bits_id === studentId ||
          record.email_id.toLowerCase() === (studentEmail || '').toLowerCase()
        )
    ) || [];

    const currentPoints = categoryRecords.reduce(
      (sum: number, record: Record) => sum + (record.points || 0),
      0
    );

    return { ...cat, currentPoints };
  });

  const totalPoints = categories.reduce((sum, cat) => sum + cat.currentPoints, 0);

  return (
    <div className={styles.page}>
      <section className={styles.summaryRow}>
        <div className={styles.summaryLeft}>
          <div className={styles.pointsCard}>
            <span className={styles.pointsValue}>{totalPoints} / {CUTOFF_POINTS}</span>
          </div>
          <span className={styles.infoText}>What are Training Points?</span>
        </div>
      </section>

      <section className={styles.categoryWise}>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <div key={category.name} className={styles.categoryCard}>
              <span className={styles.categoryTitle}>{category.name}</span>
              <span className={styles.categoryPoints}>{category.currentPoints} / {category.targetPoints}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TrainingPoints;
