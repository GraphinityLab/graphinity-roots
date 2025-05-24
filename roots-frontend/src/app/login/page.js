"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const stored = localStorage.getItem("graphinity_user");
    if (stored) {
      const user = JSON.parse(stored);
      router.replace(`/${user.username}/edit`);
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      localStorage.setItem("graphinity_user", JSON.stringify(data.user));
      toast.success("Login successful!");
      router.push(`/${data.user.username}/edit`);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white shadow-md rounded p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          name="emailOrUsername"
          type="text"
          placeholder="Username or Email"
          className="w-full border p-2 rounded"
          value={form.emailOrUsername}
          onChange={handleChange}
        />

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-2 rounded pr-10"
            value={form.password}
            onChange={handleChange}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800">
          Login
        </button>

        <p className="text-sm text-center text-gray-600 mt-2">
          Don{"'"}t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
