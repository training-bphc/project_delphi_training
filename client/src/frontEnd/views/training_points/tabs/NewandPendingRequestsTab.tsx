import React from "react";
import styles from "./NewStudentRequestTab.module.css";

// Example data for new and pending student requests
const requests = [
  {
    s_no: 1,
    name: "Duth",
    email: "duth@bits-pilani.ac.in",
    bits_id: "20240001",
    date: "22-02-2026",
    category: "Workshop",
    added_by: "Student",
    verified_status: "Pending",
  },
  // Add more sample data as needed
];

import { getPendingRows } from "../../../../sampleDataBase/sampleDataUtil";
import Table from "../../../components/layout/Table";

// Tab for displaying new and pending/rejected student requests
function NewandPendingRequestsTab() {
  return (
    <div className={styles.tabContainer}>
      {/* Tab heading */}
      <h2>New & Pending Student Requests</h2>
      {/* Description */}
      <p>
        Shows newly submitted student requests awaiting TU decision, and records
        with status <b>"Pending"</b> or <b>"Rejected"</b>.<br />
        Helps in tracking incomplete or student-actionable items.
        <br />
        <b>Note: Sample data is shown before SQL integration.</b>
      </p>
      {/* Table of requests */}
      <Table fetchRows={getPendingRows} />
    </div>
  );
}

export default NewandPendingRequestsTab;
