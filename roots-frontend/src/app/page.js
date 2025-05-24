"use client";

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

export default function HomePage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analytics/leaderboard`
        );
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <main className="min-h-screen px-4 py-12 bg-gray-100 text-gray-900">
      <section className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Graphinity Roots</h1>
        <p className="text-gray-600 text-lg">
          A customizable LinkTree alternative built for creators, brands, and
          devs.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/register"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="border border-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          🔥 Most Viewed Profiles
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-center text-gray-500">No data available yet.</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <div
                key={user.username}
                className="bg-white shadow rounded p-4 flex justify-between"
              >
                <span className="font-medium">
                  #{index + 1}{" "}
                  <Link
                    href={`/roots/${user.username}`}
                    className="text-blue-600 hover:underline"
                  >
                    {user.username}
                  </Link>
                </span>
                <span>{user.views} views</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
