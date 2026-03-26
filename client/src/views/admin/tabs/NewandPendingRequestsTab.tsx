import { useContext } from 'react';
import VerificationRequestsTable from '../../../components/VerificationRequestsTable';
import styles from './NewStudentRequestTab.module.css';
import { RecordsContext } from '../../../App';

function NewandPendingRequestsTab() {
  const context = useContext(RecordsContext);
  if (!context) {
    return <div>Loading...</div>;
  }

  const { verificationRequests, handleVerifyRequest, handleRejectRequest } = context;

  // Filter pending verification requests
  const pendingRequests = verificationRequests.filter(
    (request) => request.status === 'Pending'
  );

  return (
    <section className={styles.container}>
      <h2>Pending Requests</h2>
      <p>
        Student submissions waiting for TU review.
      </p>
      <VerificationRequestsTable
        requests={pendingRequests}
        handleVerify={handleVerifyRequest}
        handleReject={handleRejectRequest}
      />
    </section>
  );
}

export default NewandPendingRequestsTab;
