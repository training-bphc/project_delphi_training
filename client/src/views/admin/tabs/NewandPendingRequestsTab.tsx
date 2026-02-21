import { useContext } from 'react';
import Table from '../../../components/Table';
import styles from './NewStudentRequestTab.module.css';
import { RecordsContext } from '../../../App';

function NewandPendingRequestsTab() {
  const context = useContext(RecordsContext);
  if (!context) {
    return <div>Loading...</div>;
  }

  const { records, handleVerify } = context;

  // Filter new and pending records
  const pendingRecords = records.filter(
    (record) => record.verification_status === 'Pending'
  );

  return (
    <section className={styles.container}>
      <h2>New & Pending Student Requests</h2>
      <p>
        Shows newly submitted student requests awaiting TU decision, and records
        with status <b>"Pending"</b>.
      </p>
      <Table
        records={pendingRecords}
        handleVerify={handleVerify}
        showVerifyButton={true}
      />
    </section>
  );
}

export default NewandPendingRequestsTab;
