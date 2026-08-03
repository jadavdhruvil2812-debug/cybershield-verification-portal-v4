"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General",
    rating: 5,
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "rating"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");
    

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit feedback.");
      }

      setSuccess("✅ Thank you! Your feedback has been submitted.");
      setTimeout(() => {
  setSuccess("");
}, 3000);

      setForm({
        name: "",
        email: "",
        category: "General",
        rating: 5,
        message: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
       setTimeout(() => {
  setError("");
}, 3000);
      } else {
        setError("Something went wrong.");
        setTimeout(() => {
  setError("");
}, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold text-transparent">
  Feedback Center
</h1>

        <p className="text-slate-400 mb-10">
          Help us improve CyberShield by sharing your feedback.
        </p>

      <form
  onSubmit={handleSubmit}
  className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl transition-all duration-300 hover:border-cyan-500"
>
  <div className="grid gap-6 md:grid-cols-2">
    <div>
      <label className="mb-2 block text-sm font-medium">
        Full Name
      </label>

      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium">
        Email
      </label>

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
      />
    </div>
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium">
      Category
    </label>

    <select
      name="category"
      value={form.category}
      onChange={handleChange}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
    >
      <option>General</option>
      <option>Bug Report</option>
      <option>Feature Request</option>
      <option>Security</option>
      <option>UI/UX</option>
      <option>Other</option>
    </select>
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium">
      Rating
    </label>

    <select
      name="rating"
      value={form.rating}
      onChange={handleChange}
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
    >
      <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
      <option value={4}>⭐⭐⭐⭐ Very Good</option>
      <option value={3}>⭐⭐⭐ Good</option>
      <option value={2}>⭐⭐ Fair</option>
      <option value={1}>⭐ Poor</option>
    </select>
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium">
      Your Feedback
    </label>

    <textarea
      rows={6}
      name="message"
      value={form.message}
      onChange={handleChange}
      required
      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"
      placeholder="Write your feedback..."
    />
  </div>

  {success && (
    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
      {success}
    </div>
  )}

  {error && (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
      {error}
    </div>
  )}

  <button
    type="submit"
    disabled={loading}
    className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
  >
   {loading ? (
  <span className="flex items-center justify-center gap-2">
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    Submitting...
  </span>
) : (
  "Submit Feedback"
)}
  </button>
</form>
      </div>
    </div>
  );
}