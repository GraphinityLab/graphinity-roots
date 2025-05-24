'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{8,}$/;

  // ✅ Redirect if already logged in
  useEffect(() => {
    const stored = localStorage.getItem('graphinity_user');
    if (stored) {
      const user = JSON.parse(stored);
      toast.error('Please log out before registering a new account');
      router.replace(`/${user.username}/edit`);
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.email !== form.confirmEmail) {
      toast.error('Emails do not match');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!passwordRegex.test(form.password)) {
      toast.error(
        'Password must be 8+ chars with uppercase, number, and special character.'
      );
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Registration failed');
        return;
      }

      localStorage.setItem('graphinity_user', JSON.stringify(data.user));
      toast.success('Registration successful!');
      router.push(`/${data.user.username}/edit`);
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white shadow-md rounded p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold">Register</h1>

        <input
          name="username"
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={form.username}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="confirmEmail"
          type="email"
          placeholder="Confirm Email"
          className="w-full border p-2 rounded"
          value={form.confirmEmail}
          onChange={handleChange}
        />

        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full border p-2 rounded pr-10"
            value={form.password}
            onChange={handleChange}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <div className="relative">
          <input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            className="w-full border p-2 rounded pr-10"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <p className="text-xs text-gray-500">
          Password must be 8+ characters, include uppercase, number, special character.
        </p>

        <button className="bg-black text-white px-4 py-2 rounded w-full hover:bg-gray-800">
          Register
        </button>

        <p className="text-sm text-center text-gray-600 mt-2">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </main>
  );
}
