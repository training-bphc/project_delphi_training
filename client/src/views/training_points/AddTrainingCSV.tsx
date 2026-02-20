import AppLayout from "../../components/AppLayout";
import styles from "./addTrainingCards.module.css";

function AddViaEmail() {
  return (
    <AppLayout>
      <div className={styles.page}>
        <div className={styles.card}>
          <h2>Add Training Points</h2>

          <label className={styles.upload}>
          <input type="file" accept=".csv" />
          <span className={styles.uploadText}>
            Drag & drop CSV here<br />
            or click to upload
          </span>
          </label>
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