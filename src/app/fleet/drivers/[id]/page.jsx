"use client";
import React, { useEffect, useState } from "react";
import { FaCar } from "react-icons/fa";
import Navbar from "../../../../container/components/Navbar";
import { useParams } from "next/navigation";
import axios from "axios";

const ArrowPage = () => {
  const [cab, setCab] = useState({});
  const params = useParams();
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    axios
      .get(` https://api.worldtriplink.com/driverAdmin/${params.id}`)
      .then((response) => {
        setCab(response.data);
      })
      .catch((error) => console.error("Error fetching vehicle:", error));
  }, [params.id]);

  const updateStatus = (status) => {
    axios
      .put(
        ` https://api.worldtriplink.com/driverAdmin/${params.id}/status`,
        { status },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        setSuccessMessage(`Status updated successfully to ${response.data.status}`);
        setShowSuccessModal(true);
        setCab((prev) => ({ ...prev, status: response.data.status }));
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="h-full">
        <Navbar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4">
          <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg shadow-md">
            <FaCar className="text-blue-500 text-xl" />
            <h2 className="text-lg font-semibold text-gray-700">Driver Details</h2>
          </div>

          <div className="relative flex items-center bg-white p-6 rounded-lg shadow-lg mt-10">
            {/* Left: Show all images here */}
            <div className="w-1/2 flex flex-col space-y-6">
              {cab.driverImgSelfie && (
                <div>
                  <h3 className="text-gray-700 font-semibold mb-2">Driver Selfie</h3>
                  <img
                    src={cab.driverImgSelfie}
                    alt="Driver Selfie"
                    className="w-full h-[300px] object-cover rounded-lg"
                  />
                </div>
              )}

              {cab.aadhar && (
                <div>
                  <h3 className="text-gray-700 font-semibold mb-2">Aadhar</h3>
                  <img
                    src={cab.aadhar}
                    alt="Aadhar"
                    className="w-full h-[200px] object-cover rounded-lg"
                  />
                </div>
              )}

              {cab.drLicenceNum && (
                <div>
                  <h3 className="text-gray-700 font-semibold mb-2">Driver License</h3>
                  <img
                    src={cab.drLicenceNum}
                    alt="License"
                    className="w-full h-[200px] object-cover rounded-lg"
                  />
                </div>
              )}

              {cab.pvcNo && (
                <div>
                  <h3 className="text-gray-700 font-semibold mb-2">PVC</h3>
                  <img
                    src={cab.pvcNo}
                    alt="PVC"
                    className="w-full h-[200px] object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Right: Approve/Reject */}
            <div className="w-[28%] flex flex-col justify-start p-4 space-y-6 mt-10 ml-6">
              <button
                onClick={() => updateStatus("COMPLETED")}
                className={`bg-green-500 text-white py-2 px-4 rounded-lg ${
                  cab.status === "COMPLETED" ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                }`}
                disabled={cab.status === "COMPLETED"}
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus("PENDING")}
                className={`bg-red-500 text-white py-2 px-4 rounded-lg ${
                  cab.status === "PENDING" ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
                }`}
                disabled={cab.status === "PENDING"}
              >
                Reject
              </button>
            </div>
          </div>

          {/* Optional: Success message */}
          {showSuccessModal && (
            <div className="mt-6 text-green-600 font-semibold">
              {successMessage}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="ml-4 text-sm text-blue-500 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrowPage;
