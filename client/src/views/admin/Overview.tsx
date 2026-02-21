import './Overview.css';
import { useContext } from 'react';
import Table from '../../components/Table';
import CreateNewRecord from '../../components/layout/createNewRecord';
import { RecordsContext } from '../../App';

function Overview() {
  const context = useContext(RecordsContext);
  if (!context) {
    return <div>Loading...</div>;
  }

  const { records, handleVerify, handleCreateRecord } = context;

  return (
    <main className="overviewContent">
      <h1 className="overviewHeading">OVERVIEW</h1>
      <Table records={records} handleVerify={handleVerify} />
      <CreateNewRecord handleCreateRecord={handleCreateRecord} />
    </main>
  );
}

export default Overview;
