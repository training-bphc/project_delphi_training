import styles from './Table.module.css';

interface VerificationRequest {
  request_id: number;
  student_id: number;
  student_email?: string;
  category: string;
  description?: string;
  proof_links: string[];
  status: 'Pending' | 'Verified' | 'Rejected';
  awarded_by?: string | null;
  created_at: string;
  updated_at: string;
}

interface VerificationRequestsTableProps {
  requests: VerificationRequest[];
  handleVerify?: (requestId: number) => Promise<void>;
  handleReject?: (requestId: number) => Promise<void>;
  isLoading?: boolean;
}

function VerificationRequestsTable({
  requests,
  handleVerify,
  handleReject,
  isLoading = false,
}: VerificationRequestsTableProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Date</th>
            <th>Category</th>
            <th>Proof Links</th>
            <th>Status</th>
            {(handleVerify || handleReject) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.request_id}>
              <td>{request.student_email || `Student #${request.student_id}`}</td>
              <td>{new Date(request.created_at).toLocaleDateString()}</td>
              <td>{request.category}</td>
              <td>
                {request.proof_links.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {request.proof_links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        Link {index + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <span
                  className={`${styles.status} ${styles[request.status.toLowerCase()]}`}
                >
                  {request.status}
                </span>
              </td>
              {(handleVerify || handleReject) && (
                <td>
                  {request.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {handleVerify && (
                        <button
                          onClick={() => handleVerify(request.request_id)}
                          className={`${styles.verifyBtn}`}
                          disabled={isLoading}
                        >
                          Verify
                        </button>
                      )}
                      {handleReject && (
                        <button
                          onClick={() => handleReject(request.request_id)}
                          className={`${styles.rejectBtn}`}
                          disabled={isLoading}
                        >
                          Reject
                        </button>
                      )}
                    </div>
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

export default VerificationRequestsTable;
