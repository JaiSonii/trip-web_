"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Loading from "../drivers/loading";

const UserProfile: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("user_id");
  const [userPhone, setUserPhone] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<"driver" | "accountant">("driver"); // default role
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [report, setReport] = useState<string | null>(null);

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as "driver" | "accountant");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/users/grant-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        phone,
        role,
      }),
    });

    if (response.ok) {
      alert("Access granted successfully");
      setPhone("");
      setRole("driver"); // Reset to default role
    } else {
      alert("Failed to grant access");
      setError("Failed to grant access");
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

  const handleGenerateReport = async () => {
    if (!month || !year) {
      alert("Please select both month and year");
      return;
    }

    const response = await fetch(
      `/api/generateReport?month=${month}&year=${year}`
    );

    if (response.ok) {
      const reportHtml = await response.text();

      // Open report in a new window
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(reportHtml);
        newWindow.document.close();
      } else {
        setError("Failed to open report in a new window");
      }
    } else {
      setError("Failed to generate report");
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
        <div className="mb-8">
          <p className="text-lg text-gray-700">
            User Phone: <span className="font-medium">{userPhone}</span>
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Grant Access to Another User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
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

        <h2 className="text-2xl font-semibold text-gray-800 mt-10 mb-4">
          Generate Report
        </h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="">Select Month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>

            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mt-4">
              Year
            </label>
            <input
              id="year"
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., 2024"
              required
            />
          </div>

          <Button type="button" className="mt-6" onClick={handleGenerateReport}>
            Generate Report
          </Button>
        </div>

        <div className="p-10 text-center text-sm">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      </div>
    </Suspense>
  );
};

export default UserProfile;
