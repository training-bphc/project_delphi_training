const API_BASE_URL = "";

export async function fetchStudentTrainingPointsMap(
  emails: string[],
  token: string
): Promise<{ [email: string]: number }> {
  const response = await fetch("/api/training-points/by-emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ emails }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch training points");
  }

  return response.json();
}