import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VerificationRequestsTable from "../../components/common/VerificationRequestsTable";
import styles from "./PendingRequests.module.css";
import type {
  VerificationRequest,
  Record as RecordType,
  TrainingCategory,
} from "@/shared/types";

function PendingRequests() {
  const { token } = useAuth();
  const [verificationRequests, setVerificationRequests] = useState<
    VerificationRequest[]
  >([]);
  const [records, setRecords] = useState<RecordType[]>([]);
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proofRequestId, setProofRequestId] = useState<number | null>(null);
  const [decisionRequestId, setDecisionRequestId] = useState<number | null>(
    null,
  );
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [awardedPointsInput, setAwardedPointsInput] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchVerificationRequests();
    fetchRecords();
    fetchCategories();
  }, [token]);

  const fetchVerificationRequests = async () => {
    try {
      const response = await fetch("/api/verification-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch verification requests: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const requestsPayload: VerificationRequest[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.requests)
          ? data.requests
          : [];

      setVerificationRequests(requestsPayload);
    } catch (error) {
      console.error("Failed to fetch verification requests:", error);
      setVerificationRequests([]);
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      const data = await response.json();
      const recordsPayload: RecordType[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.records)
          ? data.records
          : [];

      setRecords(recordsPayload);
    } catch (error) {
      console.error("Failed to fetch records:", error);
      setRecords([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      const categoriesPayload: TrainingCategory[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.categories)
          ? data.categories
          : [];

      setCategories(categoriesPayload);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const handleVerifyRequest = async (requestId: number, points: number) => {
    try {
      const response = await fetch(
        `/api/verification-requests/${requestId}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ points }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Failed to verify request: ${response.statusText}`,
        );
      }

      await fetchRecords();
      await fetchVerificationRequests();
    } catch (error) {
      console.error("Failed to verify request:", error);
      throw error;
    }
  };

  const handleRejectRequest = async (
    requestId: number,
    rejectionReason: string,
  ) => {
    try {
      const response = await fetch(
        `/api/verification-requests/${requestId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejection_reason: rejectionReason }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to reject request: ${response.statusText}`);
      }

      await fetchRecords();
      await fetchVerificationRequests();
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Failed to reject request");
    }
  };

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
    ? categories.find(
        (category) => category.category_id === decisionRequest.category_id,
      )?.max_points || 0
    : 0;

  const decisionCurrentTotal = decisionRequest
    ? records
        .filter(
          (record) =>
            record.bits_id === decisionRequest.student_bits_id &&
            record.category_id === decisionRequest.category_id &&
            record.verification_status === "Verified",
        )
        .reduce((sum, record) => sum + (record.points || 0), 0)
    : 0;

  const decisionRemaining = Math.max(
    0,
    decisionCategoryMax - decisionCurrentTotal,
  );

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

    if (
      normalized.length === 0 ||
      !Number.isInteger(parsedPoints) ||
      parsedPoints < 0
    ) {
      setDecisionError("Points must be a non-negative integer.");
      return;
    }

    if (parsedPoints > decisionRemaining) {
      setDecisionError(
        `Points exceed allowed limit. Allowed range: 0-${decisionRemaining}.`,
      );
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
    <div className={styles.page}>
      <section className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pending Requests</h1>
      </section>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeaderSection}>
          <h2 className={styles.tableHeading}>
            Student Submissions
          </h2>
          <p className={styles.tableDescription}>
            Submissions waiting for Training Unit review and decision.
          </p>
        </div>
        <VerificationRequestsTable
          requests={pendingRequests}
          handleVerify={handleOpenReview}
          isLoading={isSubmittingAction}
          hideStatus={true}
        />
      </div>

      {proofRequest && (
        <Dialog
          open={!!proofRequest}
          onOpenChange={() => setProofRequestId(null)}
        >
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>Proof Review</DialogTitle>
              <DialogDescription>
                Open the submitted proof link and review before making a
                decision.
              </DialogDescription>
            </DialogHeader>
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
            <DialogFooter>
              <Button
                variant="outline"
                id="proofCloseBtn"
                className={styles.proofCloseBtn}
                data-button-type="proof-close"
                onClick={() => setProofRequestId(null)}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                }}
              >
                Close
              </Button>
              <Button
                id="continueDecisionBtn"
                className={styles.continueDecisionBtn}
                data-button-type="continue-decision"
                onClick={() => {
                  setDecisionRequestId(proofRequest.request_id);
                  setProofRequestId(null);
                  setAwardedPointsInput("");
                  setDecisionError("");
                }}
                style={{
                  backgroundColor: "#596373",
                  color: "#ffffff",
                  border: "none",
                }}
              >
                Continue to Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {decisionRequest && (
        <Dialog
          open={!!decisionRequest}
          onOpenChange={() => setDecisionRequestId(null)}
        >
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>Verification Decision</DialogTitle>
              <DialogDescription>
                Choose whether to accept or reject this verification request.
              </DialogDescription>
            </DialogHeader>
            <div className={styles.fieldGroup}>
              <label htmlFor="awarded_points">Points to Assign</label>
              <Input
                id="awarded_points"
                type="number"
                min={0}
                max={decisionRemaining}
                step={1}
                value={awardedPointsInput}
                onChange={(event) => setAwardedPointsInput(event.target.value)}
                placeholder="Enter integer points"
                disabled={isSubmittingAction}
                className={styles.numberInput}
              />
              <p className={styles.limitHint}>
                Allowed range: 0-{decisionRemaining} (Category max{" "}
                {decisionCategoryMax}, already awarded {decisionCurrentTotal})
              </p>
            </div>

            {decisionError && (
              <p className={styles.errorText}>{decisionError}</p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                id="decisionCancelBtn"
                className={styles.decisionCancelBtn}
                data-button-type="decision-cancel"
                onClick={() => {
                  setDecisionRequestId(null);
                  setDecisionError("");
                  setAwardedPointsInput("");
                }}
                disabled={isSubmittingAction}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                id="decisionRejectBtn"
                className={styles.decisionRejectBtn}
                data-button-type="decision-reject"
                onClick={() => setRejectRequestId(decisionRequest.request_id)}
                disabled={isSubmittingAction}
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  border: "none",
                }}
              >
                Reject
              </Button>
              <Button
                id="decisionAcceptBtn"
                className={styles.decisionAcceptBtn}
                data-button-type="decision-accept"
                onClick={handleAccept}
                disabled={isSubmittingAction}
                style={{
                  backgroundColor: "#d1fae5",
                  color: "#065f46",
                  border: "none",
                }}
              >
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {rejectRequestId && (
        <Dialog
          open={!!rejectRequestId}
          onOpenChange={() => setRejectRequestId(null)}
        >
          <DialogContent className={styles.dialogContent}>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
              <DialogDescription>
                Provide a rejection reason visible to the student.
              </DialogDescription>
            </DialogHeader>
            <textarea
              className={styles.textarea}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter reason for rejection"
              rows={4}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectRequestId(null);
                  setRejectionReason("");
                }}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className={styles.decisionRejectBtn}
                onClick={handleSubmitReject}
                disabled={isSubmittingAction || !rejectionReason.trim()}
              >
                Submit Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default PendingRequests;
