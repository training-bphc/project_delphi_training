import './Overview.css';
import { useContext, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import Table from '../../components/Table';
import CreateNewRecord from '../../components/layout/createNewRecord';
import BulkUpload from '../../components/layout/BulkUpload';
import { RecordsContext } from '../../App';

const TRAINING_CATEGORIES = [
  'Sectorial Briefs',
  'Mock Assessments',
  'Mock Interviews',
  'Mini Assessments',
  'NT-Excel',
  'NT-SQL',
  'NT-Python',
  'Guest Lectures / Workshops',
  'Hackathons/Competitions',
  'Bonus Points',
];

function Overview() {
  const context = useContext(RecordsContext);
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { records, handleCreateRecord } = context;

  const handleBulkUpload = async (emails: string[], category: string, points: number) => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/records/bulk-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          emails,
          category,
          points,
          added_by: user?.email || 'admin',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bulk upload failed');
      }

      const data = await response.json();
      alert(`Successfully added ${data.data.success} records. ${data.data.failed} failed.`);
      
      // Refresh records
      window.location.reload();
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      alert(`Bulk upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="overviewContent">
      <h1 className="overviewHeading">OVERVIEW</h1>
      <BulkUpload
        categories={TRAINING_CATEGORIES}
        onUpload={handleBulkUpload}
        isLoading={isUploading}
      />
      <Table records={records} />
      <CreateNewRecord handleCreateRecord={handleCreateRecord} />
    </main>
  );
}

export default Overview;
