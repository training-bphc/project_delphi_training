import styles from './Table.module.css';

interface Record {
  s_no: number;
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category: string;
  added_by: string;
  verification_status: 'Pending' | 'Verified';
  points?: number;
}

interface TableProps {
  records: Record[];
  handleVerify?: (sNo: number) => void;
  showVerifyButton?: boolean;
}

function Table({ records, handleVerify, showVerifyButton = false }: TableProps) {
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
            <th>Points</th>
            <th>Added By</th>
            <th>Status</th>
            {showVerifyButton && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.s_no}>
              <td>{record.s_no}</td>
              <td>{record.name}</td>
              <td>{record.bits_id}</td>
              <td>{record.email_id}</td>
              <td>{record.date}</td>
              <td>{record.category}</td>
              <td>{record.points}</td>
              <td>{record.added_by}</td>
              <td>
                <span
                  className={`${styles.status} ${styles[record.verification_status.toLowerCase()]}`}
                >
                  {record.verification_status}
                </span>
              </td>
              {showVerifyButton && (
                <td>
                  {record.verification_status === 'Pending' && handleVerify && (
                    <button
                      onClick={() => handleVerify(record.s_no)}
                      className={styles.verifyBtn}
                    >
                      Verify
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
