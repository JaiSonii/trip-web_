"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Loading from "@/app/user/loading";

const ReportPage: React.FC = () => {
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
      <div className=" p-8 bg-white max-w-lg rounded-lg">
        

        <h2 className="text-2xl font-bold text-bottomNavBarColor mb-4">
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

          <Button type="button" className="mt-6 w-full" onClick={handleGenerateReport}>
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

export default ReportPage;
