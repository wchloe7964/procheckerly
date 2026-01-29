"use server";

export async function getRemoteLoot(tenantId: string) {
  // Use the server-side environment variable
  const REMOTE_API = process.env.NEXT_PUBLIC_REMOTE_API;

  try {
    const res = await fetch(`${REMOTE_API}?tenant=${tenantId}`, {
      method: "GET",
      cache: "no-store", // Ensures we always get fresh loot
    });

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Fetch failed on server:", error);
    return [];
  }
}
