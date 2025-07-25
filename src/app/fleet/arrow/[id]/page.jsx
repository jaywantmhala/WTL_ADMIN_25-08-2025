"use client";
import React, { useEffect, useState } from "react";
import { FaCar } from "react-icons/fa";
import Navbar from "../../../../container/components/Navbar";
import { useParams } from "next/navigation";
import axios from "axios";

const ArrowPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [cab, setCab] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const params = useParams();
  console.log(params.id);

  const openModal = (title) => {
    setModalTitle(title);
    setShowModal(true);
  };

  useEffect(() => {
    fetch(` http://localhost:8085/cabAdmin/${params.id}`)
      .then((response) => response.json())
      .then((data) => setCab(data))
      .catch((error) => console.error("Error fetching vehicles:", error));
  }, [params.id]);

  const [message, setMessage] = useState("");

  const updateStatus = (status) => {
    if (status !== "COMPLETED" && status !== "PENDING") {
      setMessage("Invalid status! Status must be 'COMPLETED' or 'PENDING'.");
      return;
    }

    axios
      .put(
        ` http://localhost:8085/cabAdmin/${params.id}/status`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setMessage(`Status updated successfully to ${response.data.status}`);
        setSuccessMessage(`Status updated successfully to ${response.data.status}`);
        setShowSuccessModal(true);
        setCab((prevCab) => ({ ...prevCab, status: response.data.status }));
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          setMessage("CabAdmin not found!");
        } else {
          setMessage("An error occurred while updating the status.");
        }
      });
  };

  return (
    <Navbar>
      <div className="container mx-auto p-4">
        <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg shadow-md">
          <FaCar className="text-blue-500 text-xl" />
          <h2 className="text-lg font-semibold text-gray-700">Vehicle Details</h2>
        </div>

        <div className="relative flex items-center bg-white p-6 rounded-lg shadow-lg mt-10">
          <div className="w-1/2 h-[500px] flex flex-col justify-center items-center">
            {cab.cabImage && (
              <img
                src={cab.cabImage}
                alt="Car"
                className="w-full h-full object-cover"
              />
            )}

            <div className="flex justify-start mt-8 space-x-6">
              <span className="text-gray-700 font-medium">Front side</span>
              <span className="text-gray-700 font-medium">Back side</span>
              <span className="text-gray-700 font-medium">Side side</span>
            </div>

            <div className="flex justify-start mt-4 space-x-6">
              <div className="flex flex-col items-center">
                {cab.frontImage && (
                  <img
                    src={cab.frontImage}
                    alt="Front"
                    className="w-16 h-16 object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col items-center">
                {cab.backImage && (
                  <img
                    src={cab.backImage}
                    alt="Side"
                    className="w-16 h-16 object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col items-center">
                {cab.sideImage && (
                  <img
                    src={cab.sideImage}
                    alt="Main"
                    className="w-16 h-16 object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="w-[28%] flex flex-col justify-start p-4 space-y-6 mt-10 ml-6">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                Car RC Number
              </span>
              <button
                className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                onClick={() => openModal("Car RC Number")}
              >
                Show Image
              </button>
            </div>
            <hr className="border-t-2 border-gray-300" />

            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                Insurance
              </span>
              <button
                className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                onClick={() => openModal("Insurance")}
              >
                Show Image
              </button>
            </div>
            <hr className="border-t-2 border-gray-300" />

            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                Permit
              </span>
              <button
                className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                onClick={() => openModal("Permit")}
              >
                Show Image
              </button>
            </div>
            <hr className="border-t-2 border-gray-300" />

            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-gray-700 w-full">
                Fitness Certificate
              </span>
              <button
                className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                onClick={() => openModal("Fitness Certificate")}
              >
                Show Image
              </button>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex space-x-4">
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 pt-20">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
              <h2 className="text-xl font-semibold mb-4 text-black">{modalTitle}</h2>

              {modalTitle === "Car RC Number" && cab.cabImage && (
                <img src={cab.cabImage} alt={modalTitle} className="w-full h-full object-cover mb-5" />
              )}
              {modalTitle === "Insurance" && cab.insurance && (
                <img src={cab.insurance} alt={modalTitle} className="w-full h-full object-cover mb-5" />
              )}
              {modalTitle === "Permit" && cab.permit && (
                <img src={cab.permit} alt={modalTitle} className="w-full h-full object-cover mb-5" />
              )}
              {modalTitle === "Fitness Certificate" && cab.fitnessCert && (
                <img src={cab.fitnessCert} alt={modalTitle} className="w-full h-full object-cover mb-5" />
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
      </div>

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
    </Navbar>
  );
};

export default ArrowPage;
