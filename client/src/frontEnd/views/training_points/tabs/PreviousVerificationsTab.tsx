import React from "react";
import styles from "./PreviousVerificationsTab.module.css";

import { getVerifiedRows } from "../../../../sampleDataBase/sampleDataUtil";
import Table from "../../../components/layout/Table";

function PreviousVerificationsTab() {
  return (
    <div className={styles.tabContainer}>
      {/* Tab heading */}
      <h2>Previous Verifications</h2>
      <p>
        Stores all finalized (accepted) records only. This acts as a permanent
        audit log.
      </p>
      <Table fetchRows={getVerifiedRows} />
    </div>
  );
}

export default PreviousVerificationsTab;
