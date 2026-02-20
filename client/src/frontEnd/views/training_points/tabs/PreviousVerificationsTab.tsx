import React from "react";
import styles from "./PreviousVerificationsTab.module.css";

// Tab for displaying finalized (accepted) records
function PreviousVerificationsTab() {
  return (
    <div className={styles.tabContainer}>
      {/* Tab heading */}
      <h2>Previous Verifications</h2>
      {/* Description */}
      <p>
        Stores all finalized (accepted) records only. This acts as a permanent
        audit log.
      </p>
      {/* Add table or list of finalized records here */}
    </div>
  );
}

export default PreviousVerificationsTab;
