import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "../admin/TrainingPoints.css";
import styles from "./addVerification.module.css";
import type { FormEvent } from "react";
import type { VerificationRequest, CreateVerificationRequestPayload } from "@/shared/types";

function AddVerification() {
  const { user, token } = useAuth();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Fetch data on mount
  useEffect(() => {
    fetchVerificationRequests();
  }, [token]);

  const fetchVerificationRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/verification-requests", {
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
      console.error("Failed to fetch verification requests:", error);
      setVerificationRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVerificationRequest = async (
    request: CreateVerificationRequestPayload,
  ) => {
    try {
      const response = await fetch("/api/verification-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Failed to create verification request: ${response.statusText}`,
        );
      }

      await fetchVerificationRequests();
    } catch (error) {
      console.error("Failed to create verification request:", error);
      throw error;
    }
  };

  const studentName = user?.name || "";
  const studentEmail = user?.email || "";

  if (isLoading || !user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!proofLink.trim()) {
      setMessage("Please enter a Google Drive proof link.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleCreateVerificationRequest({
        student_name: studentName,
        student_email: studentEmail,
        proof_link: proofLink.trim(),
      });

      setProofLink("");
      setMessage("Verification request submitted successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit verification request",
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = verificationRequests.filter((r) => r.status === "Pending");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return styles.verified;
      case "Pending":
        return styles.pending;
      case "Rejected":
        return styles.rejected;
      default:
        return "";
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Verification Requests</h1>
      </section>

      <Card className={styles.formCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Submit Verification Request</h2>
          <p className={styles.subtitle}>Submit proof for admin verification</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="student_name">Name</label>
            <Input id="student_name" value={studentName} readOnly disabled />
          </div>

          <div className={styles.field}>
            <label htmlFor="student_email">Email</label>
            <Input id="student_email" value={studentEmail} readOnly disabled />
          </div>

          <div className={`${styles.field} ${styles.fullRow}`}>
            <label htmlFor="proof_link">
              Proof Link (Google Drive / Certificate)
            </label>
            <Input
              id="proof_link"
              type="url"
              placeholder="https://drive.google.com/..."
              value={proofLink}
              onChange={(event) => setProofLink(event.target.value)}
              required
            />
          </div>

          <div className={styles.formActions}>
            <Button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>

        {message && (
          <p className={`${styles.message} ${styles[messageType]}`}>{message}</p>
        )}
      </Card>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeaderSection}>
          <h2 className={styles.tableHeading}>Your Pending Requests</h2>
          <p className={styles.tableDescription}>Submissions waiting for admin review and decision.</p>
        </div>

        <div className="studentTrainingPointsTableWrap">
          <Table className="studentTrainingPointsTable">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className={styles.reasonCol}>Rejection Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className={styles.emptyState}>
                    No pending verification requests. Submit one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((request) => (
                  <TableRow key={request.request_id}>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.proof_links && request.proof_links[0] ? (
                        <a
                          className={styles.link}
                          href={request.proof_links[0]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{request.awarded_points ?? "-"}</TableCell>
                    <TableCell>
                      <span className={`${styles.status} ${getStatusColor(request.status || "")}`}>
                        {request.status
                          ? request.status.charAt(0).toUpperCase() +
                            request.status.slice(1).toLowerCase()
                          : ""}
                      </span>
                    </TableCell>
                    <TableCell className={styles.reasonCol}>
                      {request.status === "Rejected"
                        ? request.rejection_reason || "No reason provided"
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default AddVerification;
