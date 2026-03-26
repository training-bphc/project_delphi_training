import { useContext, useState } from "react";
import VerificationRequestsTable from "../../../components/VerificationRequestsTable";
import styles from "./NewStudentRequestTab.module.css";
import { RecordsContext } from "../../../App";

function NewandPendingRequestsTab() {
  const context = useContext(RecordsContext);
  if (!context) {
    return <div>Loading...</div>;
  }

  const { verificationRequests, handleVerifyRequest, handleRejectRequest } =
    context;
  const [proofRequestId, setProofRequestId] = useState<number | null>(null);
  const [decisionRequestId, setDecisionRequestId] = useState<number | null>(
    null,
  );
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Filter pending verification requests
  const pendingRequests = verificationRequests.filter(
    (request) => request.status === "Pending",
  );

  const proofRequest =
    pendingRequests.find((request) => request.request_id === proofRequestId) ||
    null;
  const decisionRequest =
    pendingRequests.find(
      (request) => request.request_id === decisionRequestId,
    ) || null;

  const handleOpenReview = async (requestId: number) => {
    setProofRequestId(requestId);
  };

  const handleOpenRejectModal = async (requestId: number) => {
    setRejectRequestId(requestId);
    setRejectionReason("");
  };

  const handleAccept = async () => {
    if (!decisionRequest) {
      return;
    }

    try {
      setIsSubmittingAction(true);
      await handleVerifyRequest(decisionRequest.request_id);
      setDecisionRequestId(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSubmitReject = async () => {
    if (!rejectRequestId || !rejectionReason.trim()) {
      return;
    }

    try {
      setIsSubmittingAction(true);
      await handleRejectRequest(rejectRequestId, rejectionReason.trim());
      setRejectRequestId(null);
      setRejectionReason("");
      if (decisionRequestId === rejectRequestId) {
        setDecisionRequestId(null);
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <section className={styles.container}>
      <h2>Pending Requests</h2>
      <p>Student submissions waiting for TU review.</p>
      <VerificationRequestsTable
        requests={pendingRequests}
        handleVerify={handleOpenReview}
        handleReject={handleOpenRejectModal}
        isLoading={isSubmittingAction}
      />

      {proofRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Proof Review</h3>
            <p>
              Open the submitted proof link and review before making a decision.
            </p>
            {proofRequest.proof_links[0] ? (
              <a
                href={proofRequest.proof_links[0]}
                target="_blank"
                rel="noreferrer"
                className={styles.modalLink}
              >
                Open Google Drive Proof
              </a>
            ) : (
              <p>No proof link provided.</p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setProofRequestId(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  setDecisionRequestId(proofRequest.request_id);
                  setProofRequestId(null);
                }}
              >
                Continue to Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {decisionRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Verification Decision</h3>
            <p>Choose whether to accept or reject this verification request.</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setDecisionRequestId(null)}
                disabled={isSubmittingAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.rejectBtn}
                onClick={() => setRejectRequestId(decisionRequest.request_id)}
                disabled={isSubmittingAction}
              >
                Reject
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleAccept}
                disabled={isSubmittingAction}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectRequestId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Reject Request</h3>
            <p>Provide a rejection reason visible to the student.</p>
            <textarea
              className={styles.textarea}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter reason for rejection"
              rows={4}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setRejectRequestId(null);
                  setRejectionReason("");
                }}
                disabled={isSubmittingAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.rejectBtn}
                onClick={handleSubmitReject}
                disabled={isSubmittingAction || !rejectionReason.trim()}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default NewandPendingRequestsTab;
