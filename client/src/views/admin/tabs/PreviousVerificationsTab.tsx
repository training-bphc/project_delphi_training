import { useContext } from 'react';
import Table from '../../../components/Table';
import styles from './PreviousVerificationsTab.module.css';
import { RecordsContext } from '../../../App';

function PreviousVerificationsTab() {
  const context = useContext(RecordsContext);
  if (!context) {
    return <div>Loading...</div>;
  }

  const { records } = context;

  // Filter previously verified records
  const verifiedRecords = records.filter(
    (record) => record.verification_status === 'Verified'
  );

  return (
    <section className={styles.container}>
      <h2>Previous Verifications</h2>
      <p>
        Stores all finalized (accepted) records only. This acts as a permanent
        audit log.
      </p>
      <Table records={verifiedRecords} />
    </section>
  );
}

export default PreviousVerificationsTab;
