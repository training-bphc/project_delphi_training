import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "../../views/admin/TrainingPoints.css";
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
  isLoading?: boolean;
  hideStatus?: boolean;
  showProofLinks?: boolean;
}

function VerificationRequestsTable({
  requests,
  handleVerify,
  isLoading = false,
  hideStatus = false,
  showProofLinks = false,
}: VerificationRequestsTableProps) {
  return (
    <Table className="studentTrainingPointsTable">
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          {showProofLinks && <TableHead>Proof Links</TableHead>}
          {!hideStatus && <TableHead>Status</TableHead>}
          {handleVerify && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.request_id}>
            <TableCell>
              {(
                (request as any).student_name || (request as any).name ||
                (((request as any).student_first_name || (request as any).student_last_name) && `${(request as any).student_first_name || ''} ${(request as any).student_last_name || ''}`.trim()) ||
                request.student_email ||
                `Student #${request.student_id}`
              )}
            </TableCell>
            <TableCell>{request.student_email || '-'}</TableCell>
            <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{request.category}</TableCell>
            {showProofLinks && (
              <TableCell>
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
                        Link
                      </a>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
            )}
            {!hideStatus && (
              <TableCell>
                <span
                  className={`${styles.status} ${styles[request.status.toLowerCase()]}`}
                >
                  {request.status}
                </span>
              </TableCell>
            )}
            {handleVerify && (
              <TableCell>
                {request.status === 'Pending' && (
                  <button
                    onClick={() => handleVerify(request.request_id)}
                    className={`${styles.verifyBtn}`}
                    disabled={isLoading}
                  >
                    Review Request
                  </button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default VerificationRequestsTable;
