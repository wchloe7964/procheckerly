"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Create the client directly inside the component
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the confirmation link!");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono p-6">
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
        <h1 className="text-white text-lg font-bold tracking-tighter mb-8 text-center uppercase">
          System / Enrollment
        </h1>
        <input
          type="email"
          placeholder="ADMIN_EMAIL"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border border-zinc-900 p-3 text-white focus:outline-none focus:border-blue-900 transition-all"
        />
        <input
          type="password"
          placeholder="ACCESS_KEY"
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border border-zinc-900 p-3 text-white focus:outline-none focus:border-blue-900 transition-all"
        />
        <button className="w-full bg-white text-black font-bold p-3 hover:bg-zinc-200 transition-all uppercase text-xs tracking-widest">
          Initialize Account
        </button>
      </form>
    </div>
  );
}
