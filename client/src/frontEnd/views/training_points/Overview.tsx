import Table from "../../components/layout/Table";
import CreateNewRecord from "../../components/layout/createNewRecord";
import styles from "./trainingPoints.module.css";

// Overview page: displays heading, create record input, and table
function Overview() {
  return (
    <div className={styles.page}>
      <span>
        {/* Page heading */}
        <h1 style={{ textAlign: "center", fontSize: "4vw" }}>OVERVIEW</h1>
        {/* Input for new record */}
        <CreateNewRecord />
        {/* Table of records */}
        <Table />
      </span>
    </div>
  );
}

export default Overview;
