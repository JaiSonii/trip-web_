"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import Loading from "@/app/user/loading";
import generatePDF from "react-to-pdf";
import { X } from "lucide-react";

const ReportPage: React.FC = () => {
  const params = useSearchParams();
  const userId = params.get("user_id");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const contentRef = useRef<any>(null)

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
      setReportContent(reportHtml);
      setModalOpen(true); // Open modal-like div to display the report
    } else {
      setError("Failed to generate report");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDF(contentRef, { filename: `Report-${month}-${year}.pdf` });
    } catch (error) {
      alert('Failed to download pdf')
    }
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="max-w-4xl container border border-gray-300 shadow-md rounded-lg p-8">
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
        </div>

        {isModalOpen && reportContent && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white max-w-4xl max-h-[700px] w-full p-6 rounded-lg shadow-lg overflow-auto">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold mb-4">Generated Report</h3>
                <Button variant='ghost' size='icon' onClick={() => setModalOpen(false)}><X /></Button>
              </div>

              <div ref={contentRef}
                className="overflow-auto border border-gray-300 rounded-md p-4"
                dangerouslySetInnerHTML={{ __html: reportContent }}
              />
              <Button className="mt-4 w-full" onClick={handleDownloadPDF}>
                Download as PDF
              </Button>

            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default ReportPage;
