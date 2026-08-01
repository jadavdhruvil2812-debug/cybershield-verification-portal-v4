export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="max-w-md w-full p-8 rounded-xl border border-slate-700 bg-slate-900">
        <h1 className="text-3xl font-bold mb-4">Sign Up</h1>

        <p className="text-slate-400 mb-6">
          Authentication module is temporarily disabled for the project demo.
        </p>

        <button
          className="w-full bg-blue-600 py-3 rounded-lg"
          disabled
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
}