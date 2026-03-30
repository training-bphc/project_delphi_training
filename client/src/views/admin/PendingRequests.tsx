import { useContext, useState } from "react";
import VerificationRequestsTable from "../../components/common/VerificationRequestsTable";
import styles from "./PendingRequests.module.css";
import { RecordsContext } from "../../App";

function PendingRequests() {
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
  const [awardedPointsInput, setAwardedPointsInput] = useState("");
  const [decisionError, setDecisionError] = useState("");
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

  const decisionCategoryMax = decisionRequest
    ? context.categories.find(
        (category) => category.category_id === decisionRequest.category_id,
      )?.max_points || 0
    : 0;

  const decisionCurrentTotal = decisionRequest
    ? context.records
        .filter(
          (record) =>
            record.bits_id === decisionRequest.student_bits_id &&
            record.category_id === decisionRequest.category_id &&
            record.verification_status === "Verified",
        )
        .reduce((sum, record) => sum + (record.points || 0), 0)
    : 0;

  const decisionRemaining = Math.max(0, decisionCategoryMax - decisionCurrentTotal);

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

    const normalized = awardedPointsInput.trim();
    const parsedPoints = Number(normalized);

    if (normalized.length === 0 || !Number.isInteger(parsedPoints) || parsedPoints < 0) {
      setDecisionError("Points must be a non-negative integer.");
      return;
    }

    if (parsedPoints > decisionRemaining) {
      setDecisionError(`Points exceed allowed limit. Allowed range: 0-${decisionRemaining}.`);
      return;
    }

    try {
      setDecisionError("");
      setIsSubmittingAction(true);
      await handleVerifyRequest(decisionRequest.request_id, parsedPoints);
      setDecisionRequestId(null);
      setAwardedPointsInput("");
    } catch (error) {
      setDecisionError(
        error instanceof Error ? error.message : "Failed to verify request",
      );
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
                  setAwardedPointsInput("");
                  setDecisionError("");
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
            <div className={styles.fieldGroup}>
              <label htmlFor="awarded_points">Points to Assign</label>
              <input
                id="awarded_points"
                className={styles.numberInput}
                type="number"
                min={0}
                max={decisionRemaining}
                step={1}
                value={awardedPointsInput}
                onChange={(event) => setAwardedPointsInput(event.target.value)}
                placeholder="Enter integer points"
                disabled={isSubmittingAction}
              />
              <p className={styles.limitHint}>
                Allowed range: 0-{decisionRemaining} (Category max {decisionCategoryMax}, already awarded {decisionCurrentTotal})
              </p>
            </div>

            {decisionError && <p className={styles.errorText}>{decisionError}</p>}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => {
                  setDecisionRequestId(null);
                  setDecisionError("");
                  setAwardedPointsInput("");
                }}
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

export default PendingRequests;
