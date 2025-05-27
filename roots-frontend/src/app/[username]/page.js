"use client";

import {
  useEffect,
  useState,
} from 'react';

import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function PublicProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}roots/${username}`
        );
        if (!res.ok) {
          setNotFound(true);
          return;
        }

        const data = await res.json();
        setUser(data);

        // Record view
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}${username}/view`,
          {
            method: "POST",
          }
        );
      } catch (err) {
        console.error("Error loading profile:", err);
        setNotFound(true);
      }
    };

    fetchUser();
  }, [username]);

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Profile not found.</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen p-8 flex flex-col items-center text-center"
      style={{
        backgroundColor: user.theme?.background || "#ffffff",
        color: user.theme?.color || "#000000",
        fontFamily: user.theme?.font || "sans-serif",
      }}
    >
      {user.profileImage && (
        <div className="w-24 h-24 mb-4 relative rounded-full overflow-hidden">
          <Image
            src={user.profileImage}
            alt="Profile"
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">@{user.username}</h1>
      {user.bio && <p className="text-gray-600 mb-6 max-w-md">{user.bio}</p>}

      <div className="w-full max-w-sm space-y-4">
        {user.links?.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border px-4 py-3 rounded shadow hover:shadow-lg transition"
          >
            {link.icon && (
              <Image
                src={link.icon}
                alt="icon"
                width={20}
                height={20}
                className="rounded"
              />
            )}
            <span>{link.title}</span>
          </a>
        ))}
      </div>
    </main>
  );
}
