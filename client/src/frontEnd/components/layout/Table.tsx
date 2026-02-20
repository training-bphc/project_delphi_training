import React, { useEffect, useState } from "react";
import styles from "./Table.module.css";

// Table component fetches SAMPLETESTDATA from backend and displays it
function Table() {
  // State for table rows

  // Load data from sampleData.json
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetch("/src/sampleDataBase/sampleData.json")
      .then((res) => res.json())
      .then((data) => setRows(data));
  }, []);

  // SQL integration placeholder:
  // useEffect(() => {
  //   fetch("/api/sampletestdata")
  //     .then((res) => res.json())
  //     .then((data) => setRows(data));
  // }, []);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>BITS ID</th>
            <th>Email</th>
            <th>Date</th>
            <th>Category</th>
            <th>Added By</th>
            <th>Verification Status</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={row.S_no}>
              <td>{row.S_no}</td>
              <td>{row.name}</td>
              <td>{row.bits_id}</td>
              <td>{row.email_id}</td>
              <td>{row.date}</td>
              <td>{row.category}</td>
              <td>{row.added_by}</td>
              <td>{row.verification_status}</td>
              <td>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* SQL integration placeholder: Replace above with fetched data when ready */}
    </div>
  );
}

// ...existing code...
export default Table;
