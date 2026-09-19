"use client";

import { useState } from "react";

type RegistrationRow = {
  id: string;
  full_name: string;
  phone_number: string;
  role: "attendee" | "speaker";
  created_at: string;
};

function toCsv(rows: RegistrationRow[]) {
  const headers = ["id", "full_name", "phone_number", "role", "created_at"];

  const escapeCell = (value: string | number) => {
    const text = String(value ?? "");

    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  const csvLines = [headers.map(escapeCell).join(",")];

  rows.forEach((row) => {
    csvLines.push(
      [
        row.id,
        row.full_name,
        row.phone_number,
        row.role,
        row.created_at,
      ]
        .map(escapeCell)
        .join(","),
    );
  });

  return csvLines.join("\n");
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);

  async function fetchRegistrations() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/registrations?password=${encodeURIComponent(password)}`,
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to access admin area.");
      }

      setRegistrations(payload.registrations || []);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : "Access denied.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void fetchRegistrations();
  }

  function handleExport() {
    if (!registrations.length) {
      return;
    }

    const csv = toCsv(registrations);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `praise-feast-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#120c1d] px-4 py-12 text-[#f8f5f2]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#d7bfd5]">Admin access</p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Praise Feast registrations
            </h1>
          </div>

          <a
            href="/"
            className="inline-flex rounded-full border border-[#f0c767]/40 bg-white/5 px-4 py-2 text-sm font-semibold text-[#f7d98d] hover:bg-white/10"
          >
            Back to event page
          </a>
        </div>

        {!isAuthenticated ? (
          <div className="max-w-md rounded-[2rem] border border-white/10 bg-[#1c1329]/90 p-6 shadow-[0_24px_80px_rgba(16,9,25,0.45)]">
            <h2 className="text-xl font-bold text-white">Protected admin portal</h2>
            <p className="mt-3 text-sm text-[#d9c3e4]">
              Enter the admin password to view registrations and export them as CSV.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#f8f5f2]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#130d1d] px-4 py-3 text-white outline-none transition focus:border-[#f0c767]"
                  placeholder="Enter admin password"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full bg-[#d4a24d] px-5 py-3 text-sm font-bold text-[#1b1120] transition hover:bg-[#f0c767] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Checking access..." : "Open dashboard"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-[#1c1329]/90 p-5 shadow-[0_24px_80px_rgba(16,9,25,0.45)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.25em] text-[#d7bfd5]">Overview</div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {registrations.length} registration{registrations.length === 1 ? "" : "s"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={!registrations.length}
                className="rounded-full bg-[#d4a24d] px-5 py-3 text-sm font-bold text-[#1b1120] transition hover:bg-[#f0c767] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Export CSV
              </button>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1c1329]/90 shadow-[0_24px_80px_rgba(16,9,25,0.45)]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-[#f8f5f2]">
                  <thead className="bg-[#120c1d] text-[#d7bfd5]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length ? (
                      registrations.map((row) => (
                        <tr key={row.id} className="border-t border-white/10">
                          <td className="px-4 py-3">{row.full_name}</td>
                          <td className="px-4 py-3">{row.phone_number}</td>
                          <td className="px-4 py-3 capitalize">{row.role}</td>
                          <td className="px-4 py-3">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-[#d9c3e4]">
                          No registrations have been saved yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
