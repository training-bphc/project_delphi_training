import React from "react";
import styles from "./NewStudentRequestTab.module.css";

// Example data for new student requests
const newRequests = [
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
];

// Tab for displaying new student requests
function NewStudentRequestTab() {
  return (
    <div className={styles.tabContainer}>
      {/* Tab heading */}
      <h2>New Student Requests</h2>
      {/* Table of new requests */}
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
            <th>Verified Status</th>
          </tr>
        </thead>
        <tbody>
          {newRequests.map((user) => (
            <tr key={user.bits_id}>
              <td>{user.s_no}</td>
              <td>{user.name}</td>
              <td>{user.bits_id}</td>
              <td>{user.email}</td>
              <td>{user.date}</td>
              <td>{user.category}</td>
              <td>{user.added_by}</td>
              <td>{user.verified_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NewStudentRequestTab;
