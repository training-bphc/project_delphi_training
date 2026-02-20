import AppLayout from "../../components/AppLayout";
import styles from "./trainingPoints.module.css";
import { useMemo, useState } from "react";

const initialCategories = [
  { name: "Category 1", points: 0 },
  { name: "Category 2", points: 0 },
  { name: "Category 3", points: 0 },
  { name: "Category 4", points: 0 },
  { name: "Category 5", points: 0 },
  { name: "Category 6", points: 0 },
  { name: "Category 7", points: 0 },
  { name: "Category 8", points: 0 },
];

function TrainingPoints() {
  const [categories] = useState(initialCategories);

  const totalPoints = useMemo(
    () => categories.reduce((sum, c) => sum + c.points, 0),
    [categories]
  );

  return (
    <AppLayout>
      <div className={styles.page}>
        <section className={styles.summaryRow}>
          <div className={styles.summaryLeft}>
            <div className={styles.pointsCard}>
              <span className={styles.pointsValue}>{totalPoints} / 75</span>
            </div>

            <span className={styles.infoText}>
              What are Training Points?
            </span>
          </div>

          <button className={styles.addButton}>
            + Add Training Points
          </button>
        </section>

        <section className={styles.categoryWise}>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <div key={index} className={styles.categoryCard}>
                <span className={styles.categoryTitle}>
                  {category.name}
                </span>
                <span className={styles.categoryPoints}>
                  {category.points} points
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default TrainingPoints;