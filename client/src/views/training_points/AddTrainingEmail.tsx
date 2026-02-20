import AppLayout from "../../components/AppLayout";
import styles from "./addTrainingCards.module.css";

function AddViaEmail() {
  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.card}>
          <h2>Add Training Points</h2>

          <input
            className={styles.input}
            placeholder="Enter email(s) separated by commas"
          />

          <input
            className={styles.input}
            placeholder="Enter name of event"
          />

          <input
            className={styles.input}
            placeholder="Enter category"
          />

          <button className={styles.button}>
            + Add Training Points
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

export default AddViaEmail;