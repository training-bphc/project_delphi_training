import { useContext } from 'react';
import styles from './trainingPoints.module.css';
import { RecordsContext, type Record } from '../../App';

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

  const categories = context.categories.map((cat) => {
    const categoryRecords = context.records?.filter(
      (record: Record) =>
        record.category_id === cat.category_id &&
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

    return {
      categoryId: cat.category_id,
      name: cat.category_name,
      targetPoints: cat.max_points,
      currentPoints,
    };
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
            <div key={category.categoryId} className={styles.categoryCard}>
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
