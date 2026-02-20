import styles from "./Table.module.css";

const users = [
  {
    s_no: 1,
    name: "Viswa Somayajula",
    email: "f20240546@bits-pilani.ac.in",
    bits_id: "20240546",
    date: "01-01-2026",
    category: "Hackathon",
    added_by: "Student",
    verified_status: "No",
  },
  {
    s_no: 2,
    name: "Vedant Barve",
    email: "f20231100@bits-pilani.ac.in",
    bits_id: "20231100",
    date: "01-02-2026",
    category: "Lecture Session ",
    added_by: "Training Unit",
    verified_status: "Yes",
  },
  {
    s_no: 3,
    name: "Madhav",
    email: "f20230046@bits-pilani.ac.in",
    bits_id: "20230046",
    date: "20-02-2026",
    category: "Workshop",
    added_by: "Training Unit",
    verified_status: "Yes",
  },
  {
    s_no: 4,
    name: "Siddharth",
    email: "f20231106@bits-pilani.ac.in",
    bits_id: "20231106",
    date: "21-02-2026",
    category: "Seminar",
    added_by: "Training Unit",
    verified_status: "No",
  },
];

function Table() {
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
            <th>
              Category
              <select id="category_selct">
                <option value="all">All</option>
                <option value="hackathon">Hackathon</option>
                <option value="lecture">Lecture Session</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="category5">Category 5</option>
                <option value="category6">Category 6</option>
                <option value="category7">Category 7</option>
                <option value="category8">Category 8</option>
              </select>
            </th>
            <th>
              Added By
              <select id="added_by_select">
                <option value="all">All</option>
                <option value="student">Student</option>
                <option value="training_unit">Training Unit</option>
              </select>
            </th>
            <th>
              Verified Status
              <select id="verified_status_select">
                <option value="all">All</option>
                <option value="verified">Yes</option>
                <option value="not_verified">No</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
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
export default Table;
