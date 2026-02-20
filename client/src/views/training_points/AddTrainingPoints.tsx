import AppLayout from "../../components/AppLayout";
import styles from "./addTrainingPoints.module.css";

function AddTrainingPoints() {
    return (
        <AppLayout>
                <div className={styles.page}>
                    <h1 className={styles.title}>
                        Add Training Points
                    </h1>

                    <div className={styles.cards}>
                        <div className={styles.card}> 
                            <h2> Add via Email(s) </h2> 
                        </div>
                        <div className={styles.card}>
                            <h2> Add via CSV file </h2>
                        </div>
                    </div>
                </div>
        </AppLayout>
    )
}

export default AddTrainingPoints