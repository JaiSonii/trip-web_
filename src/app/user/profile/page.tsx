"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const UserProfile: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get('user_id');
  const [userPhone, setUserPhone] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<'driver' | 'accountant'>('driver'); // default role
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as 'driver' | 'accountant');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/users/grant-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        phone,
        role,
      }),
    });

    if (response.ok) {
      alert('Access granted successfully');
      setPhone('');
      setRole('driver'); // Reset to default role
    } else {
      alert('Failed to grant access');
      setError('Failed to grant access');
    }
  };

  useEffect(() => {
    const fetchUserPhone = async () => {
      const response = await fetch(`/api/login`);
      const data = await response.json();
      setUserPhone(data.user.phone);
    };

    if (userId) {
      fetchUserPhone();
    }
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
      <div className="mb-8">
        <p className="text-lg text-gray-700">User Phone: <span className="font-medium">{userPhone}</span></p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Grant Access to Another User</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          />
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mt-4">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={handleRoleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          >
            <option value="driver">Driver</option>
            <option value="accountant">Accountant</option>
          </select>
        </div>

        <Button type="submit" className="mt-6">
          Grant Access
        </Button>
      </form>

      <div className="p-10 text-center text-sm">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>
    </div>
  );
};

export default UserProfile;
