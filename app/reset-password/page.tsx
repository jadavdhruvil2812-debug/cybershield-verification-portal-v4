"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setSuccess("✅ Password changed successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 1800);

    } catch {
      setError("Server connection failed.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-5">

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-white">
          Reset Password
        </h1>

        <p className="mt-2 text-slate-400">
          Create a new secure password.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-green-300">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              New Password
            </label>

            <div className="relative">

              <input
                type={show1 ? "text" : "password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white focus:border-cyan-500 outline-none"
              />

              <button
                type="button"
                onClick={()=>setShow1(!show1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {show1 ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Confirm Password
            </label>

            <div className="relative">

              <input
                type={show2 ? "text" : "password"}
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white focus:border-cyan-500 outline-none"
              />

              <button
                type="button"
                onClick={()=>setShow2(!show2)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {show2 ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>

            </div>

          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-black hover:bg-cyan-400"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

        </form>

      </div>

    </div>
  );
}