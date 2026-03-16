export async function syncServerSession(
  accessToken: string | null,
): Promise<void> {
  if (process.env.NODE_ENV === "test") return;

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessToken }),
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || "Failed to sync server session");
  }
}

export async function clearServerSession(): Promise<void> {
  if (process.env.NODE_ENV === "test") return;

  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}
