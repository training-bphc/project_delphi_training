import { useContext, useMemo, useState } from "react";
import { RecordsContext } from "../../App";
import { useAuth } from "../../contexts/auth";
import styles from "./addVerification.module.css";

import type { FormEvent } from "react";
function AddVerification() {
  const context = useContext(RecordsContext);
  const { user } = useAuth();
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  if (!context || !user) {
    return <div>Loading...</div>;
  }

  const studentName = user.name || "";
  const studentEmail = user.email || "";

  const rejectedRequests = useMemo(
    () =>
      context.verificationRequests.filter(
        (request) => request.status === "Rejected",
      ),
    [context.verificationRequests],
  );

  const pendingRequests = useMemo(
    () =>
      context.verificationRequests.filter(
        (request) => request.status === "Pending",
      ),
    [context.verificationRequests],
  );

  const verifiedRequests = useMemo(
    () =>
      context.verificationRequests.filter(
        (request) => request.status === "Verified",
      ),
    [context.verificationRequests],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!proofLink.trim()) {
      setMessage("Please enter a Google Drive proof link.");
      return;
    }

    setIsSubmitting(true);
    try {
      await context.handleCreateVerificationRequest({
        student_name: studentName,
        student_email: studentEmail,
        proof_link: proofLink.trim(),
      });

      setProofLink("");
      setMessage("Verification request submitted successfully.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Add Verification</h2>
      <p className={styles.subtitle}>
        Submit hackathon proof for admin verification.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="student_name">Name</label>
          <input
            id="student_name"
            name="student_name"
            value={studentName}
            readOnly
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="student_email">Mail ID</label>
          <input
            id="student_email"
            name="student_email"
            value={studentEmail}
            readOnly
          />
        </div>

        <div className={`${styles.field} ${styles.fullRow}`}>
          <label htmlFor="proof_link">
            Hackathon Proof (Certificate/Proof of Work)
          </label>
          <input
            id="proof_link"
            name="proof_link"
            type="url"
            placeholder="https://drive.google.com/..."
            value={proofLink}
            onChange={(event) => setProofLink(event.target.value)}
            required
          />
        </div>

        <button
          className={styles.submitBtn}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Request Verification"}
        </button>
      </form>

      {message && <p className={styles.message}>{message}</p>}

      <h3 className={styles.sectionTitle}>Pending Verifications</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Proof Link</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.length === 0 ? (
              <tr>
                <td colSpan={3}>No pending verification requests.</td>
              </tr>
            ) : (
              pendingRequests.map((request) => (
                <tr key={request.request_id}>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    {request.proof_links[0] ? (
                      <a
                        className={styles.link}
                        href={request.proof_links[0]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Proof
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles.pending}`}>
                      Pending
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Verified Request</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Proof Link</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {verifiedRequests.length === 0 ? (
              <tr>
                <td colSpan={3}>No verified requests yet.</td>
              </tr>
            ) : (
              verifiedRequests.map((request) => (
                <tr key={request.request_id}>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    {request.proof_links[0] ? (
                      <a
                        className={styles.link}
                        href={request.proof_links[0]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Proof
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles.verified}`}>
                      Verified
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Rejected Verifications</h3>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Proof Link</th>
              <th>Status</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {rejectedRequests.length === 0 ? (
              <tr>
                <td colSpan={4}>No rejected verification requests.</td>
              </tr>
            ) : (
              rejectedRequests.map((request) => (
                <tr key={request.request_id}>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    {request.proof_links[0] ? (
                      <a
                        className={styles.link}
                        href={request.proof_links[0]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Proof
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles.rejected}`}>
                      Rejected
                    </span>
                  </td>
                  <td>{request.rejection_reason || "No reason provided"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AddVerification;
