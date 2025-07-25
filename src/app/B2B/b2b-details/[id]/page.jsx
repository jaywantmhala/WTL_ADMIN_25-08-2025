"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../../../container/components/Navbar";

export default function B2BDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [selectedB2B, setSelectedB2B] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchB2B() {
      try {
        const response = await fetch(` http://localhost:8085/b2b/${params.id}`);
        if (!response.ok) throw new Error("B2B not found");
        const data = await response.json();
        setSelectedB2B(data);
      } catch (error) {
        console.error("Error fetching B2B details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchB2B();
  }, [params.id]);

  const openModal = (title, src) => {
    setModalTitle(title);
    setImageSrc(src);
    setShowModal(true);
  };

  const handleClose = () => router.back();

  if (loading) {
    return (
      <Navbar>
        <div className="container mx-auto p-4">
          <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">Loading B2B Details...</h2>
          </div>
        </div>
      </Navbar>
    );
  }

  if (!selectedB2B) {
    return (
      <Navbar>
        <div className="container mx-auto p-4">
          <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">B2B Record not found</h2>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="container mx-auto p-4">
        <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">B2B Partner Details</h2>
        </div>

        <div className="relative flex items-center bg-white p-6 rounded-lg shadow-lg mt-10">
          {/* Left Panel - Company Logo and Info */}
          <div className="w-1/2 h-[500px] flex flex-col justify-center items-center">
            {selectedB2B.companyLogo && (
              <img
              src={selectedB2B?.companyLogo?.replace(" http://localhost:8085/uploads/", "")}
              alt="Company Logo"
                className="w-full h-full object-contain"
              />
            )}

            <div className="flex flex-col justify-start mt-8 space-y-4 w-full">
              <div>
                <span className="text-gray-700 font-medium">Company Name: </span>
                <span>{selectedB2B.companyName || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Contact: </span>
                <span>{selectedB2B.contactNo || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Email: </span>
                <span>{selectedB2B.businessEmail || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">City: </span>
                <span>{selectedB2B.city || "N/A"}</span>
              </div>
              
            </div>
          </div>

          {/* Right Panel - Documents */}
          <div className="w-[28%] flex flex-col justify-start p-4 space-y-6 mt-10 ml-6">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                Govt Approval Certificate
              </span>
              {selectedB2B.govtApprovalCertificate ? (
                <button
                  className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                  onClick={() => openModal("Govt Approval Certificate", selectedB2B.govtApprovalCertificate?.replace(" http://localhost:8085/uploads/", ""))}
                >
                  Show Image
                </button>
              ) : (
                <span className="text-gray-500">Not Available</span>
              )}
            </div>
            <hr className="border-t-2 border-gray-300" />

            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                Company Documents
              </span>
              {selectedB2B.companyDocs ? (
                <button
                  className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                  onClick={() => openModal("Company Documents", selectedB2B.companyDocs?.replace(" http://localhost:8085/uploads/", ""))}
                >
                  Show Image
                </button>
              ) : (
                <span className="text-gray-500">Not Available</span>
              )}
            </div>
            <hr className="border-t-2 border-gray-300" />

            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                PAN Documents
              </span>
              {selectedB2B.panDocs ? (
                <button
                  className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                  onClick={() => openModal("PAN Documents", selectedB2B.panDocs?.replace(" http://localhost:8085/uploads/", ""))}
                >
                  Show Image
                </button>
              ) : (
                <span className="text-gray-500">Not Available</span>
              )}
            </div>
            <hr className="border-t-2 border-gray-300" />

            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                PAN Number
              </span>
              <span>{selectedB2B.panNo || "N/A"}</span>
            </div>
          </div>

          {/* Close Button */}
          <div className="absolute top-4 right-4 flex space-x-4">
            <button
              onClick={handleClose}
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 pt-20">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
              <h2 className="text-xl font-semibold mb-4 text-black">{modalTitle}</h2>

              {imageSrc && (
                <img src={imageSrc} alt={modalTitle} className="w-full h-full object-cover mb-5" />
              )}

              <button
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 w-full"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[350px] mt-20 slide-in">
              <h2 className="text-xl font-semibold mb-4 text-black">Success</h2>
              <p className="text-gray-700 mb-4">{successMessage}</p>
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 w-full"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Slide-in animation CSS */}
        <style jsx>{`
          @keyframes slideIn {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .slide-in {
            animation: slideIn 0.5s ease-out;
          }
        `}</style>
      </div>
    </Navbar>
  );
}