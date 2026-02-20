import React from "react";
import styles from "./PendingRecordsForVerificationTab.module.css";

// Tab for displaying pending or rejected records
function PendingRecordsForVerificationTab() {
  return (
    <div className={styles.tabContainer}>
      {/* Tab heading */}
      <h2>Pending Records for Verification</h2>
      {/* Description */}
      <p>
        Shows only records with status "Pending" or "Rejected". Helps in
        tracking incomplete or student-actionable items.
        <br />
        <b>Note I will add sample data before we add the sqlinjections</b>
      </p>
      {/* Add table or list of pending/rejected records here */}
    </div>
  );
}

export default PendingRecordsForVerificationTab;
