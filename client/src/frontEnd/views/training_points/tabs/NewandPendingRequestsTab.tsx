import React, { useContext } from "react";
import styles from "./NewStudentRequestTab.module.css";
import Table from "../../../components/layout/Table";
import { RecordsContext } from "../../../../App";

// Tab for displaying new and pending/rejected student requests
function NewandPendingRequestsTab() {
  const { records, handleVerify } = useContext(RecordsContext);
  const pendingRows = records.filter(
    (row: any) => row.verification_status === "Pending",
  );
  return (
    <div className={styles.tabContainer}>
      <h2>New & Pending Student Requests</h2>
      <p>
        Shows newly submitted student requests awaiting TU decision, and records
        with status <b>"Pending"</b> or <b>"Rejected"</b>.<br />
        Helps in tracking incomplete or student-actionable items.
        <br />
        <b>Note: Sample data is shown before SQL integration.</b>
      </p>
      <Table
        fetchRows={async () => pendingRows}
        showToggle
        onToggle={handleVerify}
      />
    </div>
  );
}

export default NewandPendingRequestsTab;
