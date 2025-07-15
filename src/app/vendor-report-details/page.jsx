"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../container/components/Navbar";
import { Suspense } from "react";  // Ensure you import Suspense

export default function VendorReportDetails() {
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Wrapping the whole content in Suspense */}
      <InnerVendorReportDetails />
    </Suspense>
  );
}

function InnerVendorReportDetails() {
  const searchParams = useSearchParams();
  const vendor = searchParams.get("vendor") || "Unknown Vendor";
  const router = useRouter();

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        {/* Main Report Container */}
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Vendor Report Details</h1>
          <p className="text-lg mb-4">
            Details for vendor: <span className="font-semibold text-blue-600">{vendor}</span>
          </p>

          {/* Report Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card icon="💰" title="Business" value="₹ /-" color="green" />
            <Card icon="🚖" title="New Trips" value="238" color="blue" />
            <Card icon="🚘" title="Pending Trips" value="0" color="purple" />
            <Card icon="✅" title="Completed Trips" value="0" color="black" />
            <Card icon="❌" title="Cancelled Trips" value="0" color="red" />
            <Card icon="🔄" title="Ongoing Trips" value="0" color="blue" />
            <Card icon="🟨" title="One Way" value="0" color="yellow" />
            <Card icon="🔵" title="Round Trip" value="0" color="blue" />
            <Card icon="🟥" title="Rental" value="0" color="red" />
          </div>

          {/* Rates Section */}
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold">Rates</h2>
            <p className="text-gray-600">One Way: 0</p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.push("/vendor-report")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to List
          </button>
        </div>
      </div>
    </Navbar>
  );
}

// Card Component for Displaying Metrics
const Card = ({ icon, title, value, color }) => (
  <div className={`p-4 rounded-lg shadow-md bg-white flex flex-col items-center border-l-4 border-${color}-500`}>
    <div className={`text-${color}-500 text-3xl`}>{icon}</div>
    <p className="text-lg font-bold">{value}</p>
    <p className="text-gray-600">{title}</p>
  </div>
);
