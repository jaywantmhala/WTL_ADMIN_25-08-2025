"use client";
import Navbar from "../../../container/components/Navbar"
export default function SuccessPage() {
    return (
      <Navbar>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-green-500">✅ Request Sent Successfully!</h2>
          <p className="text-gray-700 mt-4">We have received your request. We will get back to you soon.</p>
          <a
            href="/request-vendor"
            className="mt-6 inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Go Back
          </a>
        </div>
      </div>
      </Navbar>
    );
  }
  