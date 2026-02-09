"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Could not create account.");
      setStatus("error");
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-600">
            Set up an account to save and review scans.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Name (optional)
            <input
              className="h-11 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Email
            <input
              className="h-11 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
            Password
            <input
              className="h-11 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600">
          Already have an account?{" "}
          <a className="font-medium text-zinc-900" href="/login">
            Sign in
          </a>
        </p>
      </main>
    </div>
  );
}
