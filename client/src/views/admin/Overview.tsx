import './Overview.css';
import { useContext, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/auth';
import CreateNewRecord from '../../components/training-points/createNewRecord';
import BulkUpload from '../../components/training-points/BulkUpload';
import { RecordsContext } from '../../App';

interface StudentOverviewRow {
  bitsId: string;
  name: string;
  email: string;
  totalPoints: number;
  pendingCount: number;
  lastUpdated: string;
  categoryPoints: Array<{ category: string; points: number }>;
}

function Overview() {
  const context = useContext(RecordsContext);
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { records, categories, handleCreateRecord, handleRefreshRecords } = context;

  const studentRows = useMemo<StudentOverviewRow[]>(() => {
    const pendingByEmail = new Map<string, number>();
    context.verificationRequests.forEach((request) => {
      if (request.status === 'Pending' && request.student_email) {
        const key = request.student_email.toLowerCase();
        pendingByEmail.set(key, (pendingByEmail.get(key) || 0) + 1);
      }
    });

    const grouped = new Map<string, StudentOverviewRow>();

    records.forEach((record) => {
      const key = `${record.email_id.toLowerCase()}|${record.bits_id}`;
      const existing = grouped.get(key) || {
        bitsId: record.bits_id,
        name: record.name,
        email: record.email_id,
        totalPoints: 0,
        pendingCount: 0,
        lastUpdated: record.date,
        categoryPoints: [],
      };

      const normalizedDate = new Date(record.date).getTime();
      const existingDate = new Date(existing.lastUpdated).getTime();
      if (!Number.isNaN(normalizedDate) && normalizedDate > existingDate) {
        existing.lastUpdated = record.date;
      }

      if (record.verification_status === 'Verified') {
        existing.totalPoints += record.points || 0;
        const categoryItem = existing.categoryPoints.find((cat) => cat.category === record.category);
        if (categoryItem) {
          categoryItem.points += record.points || 0;
        } else {
          existing.categoryPoints.push({ category: record.category, points: record.points || 0 });
        }
      }

      existing.pendingCount = pendingByEmail.get(record.email_id.toLowerCase()) || 0;
      grouped.set(key, existing);
    });

    return [...grouped.values()].sort(
      (a, b) => b.pendingCount - a.pendingCount || b.totalPoints - a.totalPoints,
    );
  }, [context.verificationRequests, records]);

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

      <section className="studentOverviewSection">
        <div className="studentOverviewHeaderRow">
          <h2>Student Progress Summary</h2>
          <span>{studentRows.length} students</span>
        </div>

        <div className="studentOverviewTableWrap">
          <table className="studentOverviewTable">
            <thead>
              <tr>
                <th>Student</th>
                <th>BITS ID</th>
                <th>Email</th>
                <th>Total Points</th>
                <th>Pending Requests</th>
                <th>Last Updated</th>
                <th>Category Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map((student) => (
                <tr key={`${student.email}-${student.bitsId}`}>
                  <td>{student.name}</td>
                  <td>{student.bitsId}</td>
                  <td>{student.email}</td>
                  <td>{student.totalPoints}</td>
                  <td>{student.pendingCount}</td>
                  <td>{student.lastUpdated}</td>
                  <td>
                    <details>
                      <summary>View</summary>
                      <div className="categoryBreakdown">
                        {categories.map((category) => {
                          const found = student.categoryPoints.find(
                            (item) => item.category === category.category_name,
                          );
                          return (
                            <div key={`${student.email}-${category.category_id}`} className="categoryPill">
                              <span>{category.category_name}</span>
                              <strong>{found?.points || 0}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CreateNewRecord handleCreateRecord={handleCreateRecord} categories={categories} />
    </main>
  );
}

export default Overview;
