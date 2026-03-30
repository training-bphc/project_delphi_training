import { useContext } from 'react';
import VerificationRequestsTable from '../../components/common/VerificationRequestsTable';
import styles from './VerifiedRequests.module.css';
import { RecordsContext } from '../../App';

function VerifiedRequests() {
  const context = useContext(RecordsContext);
  if (!context) {
    return <div>Loading...</div>;
  }

  const { verificationRequests } = context;

  const finalizedRequests = verificationRequests.filter(
    (request) => request.status !== 'Pending'
  );

  return (
    <section className={styles.container}>
      <h2>Previous Verifications</h2>
      <p>
        Finalized request decisions with proof links.
      </p>
      <VerificationRequestsTable requests={finalizedRequests} />
    </section>
  );
}

export default VerifiedRequests;
