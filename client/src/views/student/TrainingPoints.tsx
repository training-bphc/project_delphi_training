import { useState, useEffect } from 'react';
import styles from './trainingPoints.module.css';
import { useAuth } from '../../contexts/auth';
import TrainingPointsInfo from '@/components/training-points/TrainingPointsInfo';
import type { Record, TrainingCategory } from '@/shared/types';

interface TrainingPointsProps {
  studentId?: string;
  studentEmail?: string;
}

const CUTOFF_POINTS = 75;

function TrainingPoints({ studentId, studentEmail }: TrainingPointsProps) {
  const { token } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchRecords();
    fetchCategories();
  }, [token]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/records', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      const data = await response.json();
      const recordsPayload: Record[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.records)
          ? data.records
          : [];

      setRecords(recordsPayload);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      const categoriesPayload: TrainingCategory[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.categories)
          ? data.categories
          : [];

      setCategories(categoriesPayload);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const categoryData = categories.map((cat) => {
    const categoryRecords = records?.filter(
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
      description: cat.description || 'No description available.',
      targetPoints: cat.max_points,
      currentPoints,
    };
  });

  const totalPoints = categoryData.reduce((sum, cat) => sum + cat.currentPoints, 0);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <section className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Training Points</h1>
      </section>

      <section className={styles.summaryRow}>
        <div className={styles.summaryLeft}>
          <div className={styles.pointsCard}>
            <span className={styles.pointsValue}>{totalPoints} / {CUTOFF_POINTS}</span>
          </div>
          <button
            className={styles.infoText}
            onClick={() => setShowFAQ(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Some common FAQ
          </button>
        </div>
      </section>

      {showFAQ && <TrainingPointsInfo onClose={() => setShowFAQ(false)} />}

      <section className={styles.categoryWise}>
        <div className={styles.categoryGrid}>
          {categoryData.map((category) => (
            <div key={category.categoryId} className={styles.categoryCard}>
              <div className={styles.categoryHeadingRow}>
                <span className={styles.categoryTitle}>{category.name}</span>
              </div>
              <span className={styles.categoryPoints}>{category.currentPoints} / {category.targetPoints}</span>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${Math.min(
                      100,
                      category.targetPoints > 0
                        ? (category.currentPoints / category.targetPoints) * 100
                        : 0,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TrainingPoints;
