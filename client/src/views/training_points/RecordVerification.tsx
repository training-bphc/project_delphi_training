import AppLayout from "../../components/AppLayout";
import Table from "../../components/layout/Table";
import styles from "./trainingPoints.module.css";
// import { useMemo, useState } from "react";

function RecordVerification() {

  return (
    <AppLayout>
      <div className={styles.page}>
        <span> 
          <h1 style={{textAlign: "center", fontSize: "4vw"}}>Records for Verification</h1>
          <Table></Table>
        </span>
      </div>
    </AppLayout>
  );
}

export default RecordVerification;