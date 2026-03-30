import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import VerificationRequestsTable from '../../components/common/VerificationRequestsTable';
import styles from './VerifiedRequests.module.css';
import type { VerificationRequest } from '@/shared/types';

function VerifiedRequests() {
  const { token } = useAuth();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchVerificationRequests();
  }, [token]);

  const fetchVerificationRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/verification-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch verification requests: ${response.statusText}`);
      }

      const data = await response.json();
      const requestsPayload: VerificationRequest[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.requests)
          ? data.requests
          : [];

      setVerificationRequests(requestsPayload);
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
      setVerificationRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizedRequests = verificationRequests.filter(
    (request) => request.status !== 'Pending'
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
