import React, { useContext } from "react";
import styles from "./PreviousVerificationsTab.module.css";
import Table from "../../../components/layout/Table";
import { RecordsContext } from "../../../../App";

function PreviousVerificationsTab() {
  const { records } = useContext(RecordsContext);
  const verifiedRows = records.filter(
    (row: any) => row.verification_status === "Verified",
  );
  return (
    <div className={styles.tabContainer}>
      <h2 style={{ color: "#27ae60" }}>Previous Verifications</h2>
      <p>
        Stores all finalized (accepted) records only. This acts as a permanent
        audit log.
      </p>
      <Table fetchRows={async () => verifiedRows} />
    </div>
  );
}

export default PreviousVerificationsTab;
