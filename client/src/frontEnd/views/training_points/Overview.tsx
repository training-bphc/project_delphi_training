import Table from "../../components/layout/Table";
import CreateNewRecord from "../../components/layout/createNewRecord";
import styles from "./trainingPoints.module.css";
import { useContext } from "react";
import { RecordsContext } from "../../../App";

// Overview page: displays heading, create record input, and table
function Overview() {
  const { records } = useContext(RecordsContext);
  return (
    <div className={styles.page}>
      <span>
        <h1 style={{ textAlign: "center", fontSize: "4vw" }}>OVERVIEW</h1>
        <CreateNewRecord />
        <Table fetchRows={async () => records} />
      </span>
    </div>
  );
}

export default Overview;
