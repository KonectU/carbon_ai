"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setStatus("error");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-600">
            Access your saved scans and estimates.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6"
        >
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
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600">
          New here?{" "}
          <a className="font-medium text-zinc-900" href="/signup">
            Create an account
          </a>
        </p>
      </main>
    </div>
  );
}
