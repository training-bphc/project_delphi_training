import './Overview.css';
import { useContext, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import Table from '../../components/Table';
import CreateNewRecord from '../../components/layout/createNewRecord';
import BulkUpload from '../../components/layout/BulkUpload';
import { RecordsContext } from '../../App';

function Overview() {
  const context = useContext(RecordsContext);
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { records, categories, handleCreateRecord, handleRefreshRecords } = context;

  const handleBulkUpload = async (emails: string[], categoryId: number, points: number) => {
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
          category_id: categoryId,
          points,
          added_by: user?.email || 'admin',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bulk upload failed');
      }

      const data = await response.json();
      const result = data.data as {
        success: number;
        failed: number;
        errors?: Array<{ email: string; error: string }>;
      };

      let message = `Successfully added ${result.success} records. ${result.failed} failed.`;
      if (result.failed > 0 && result.errors && result.errors.length > 0) {
        const errorLines = result.errors
          .slice(0, 10)
          .map((entry) => `- ${entry.email}: ${entry.error}`)
          .join('\n');
        message += `\n\nFailed emails:\n${errorLines}`;

        if (result.errors.length > 10) {
          message += `\n...and ${result.errors.length - 10} more`;
        }
      }

      alert(message);

      await handleRefreshRecords();
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
        categories={categories}
        onUpload={handleBulkUpload}
        isLoading={isUploading}
      />
      <Table records={records} />
      <CreateNewRecord handleCreateRecord={handleCreateRecord} categories={categories} />
    </main>
  );
}

export default Overview;
