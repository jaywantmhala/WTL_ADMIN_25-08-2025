"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa"; // ✅ ADD: FaSpinner import
import axios from "axios";

const Outsourceform = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicleNameAndRegNo: "",
    vehicleRcNo: "",
    carNoPlate: "",
    carOtherDetails: "",
  });

  const [files, setFiles] = useState({
    insurance: null,
    permit: null,
    authorization: null,
    carImage: null,
    frontImage: null,
    backImage: null,
    sideImage: null,
  });

  const [isLoading, setIsLoading] = useState(false); // ✅ RENAMED: isSubmitting to isLoading for consistency
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Track success popup visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({
      ...files,
      [name]: selectedFiles[0], // Store the first selected file
    });
  };

  // ✅ UPDATED: Handle submit with loading state
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true); // ✅ START: Set loading to true when submission starts

    const data = new FormData();
    data.append("vehicleNameAndRegNo", formData.vehicleNameAndRegNo);
    data.append("vehicleRcNo", formData.vehicleRcNo);
    data.append("carNoPlate", formData.carNoPlate);
    data.append("carOtherDetails", formData.carOtherDetails);

    // Append files to FormData
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        data.append(key, files[key]);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:8085/vehicle/save",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);

      // ✅ SUCCESS: Show success popup
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false); // Hide popup after 3 seconds
        onClose();
        onSuccess();
      }, 3000);

      // ✅ OPTIONAL: Reset form on success
      handleReset();
      
    } catch (error) {
      // ✅ ERROR: Stop loading and show error message
      console.error("Error saving vehicle:", error);
      alert("Failed to save vehicle. Please try again.");
    } finally {
      // ✅ FINALLY: Always stop loading regardless of success/error
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      vehicleNameAndRegNo: "",
      vehicleRcNo: "",
      carNoPlate: "",
      carOtherDetails: "",
    });
    setFiles({
      insurance: null,
      permit: null,
      authorization: null,
      carImage: null,
      frontImage: null,
      backImage: null,
      sideImage: null,
    });
  };

  // ✅ UPDATED: Prevent modal closing when loading
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay" && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-0 left-0 right-0 z-[1000]">
          <div className="bg-green-500 text-white p-4 text-center animate-slide-down">
            Vehicle saved successfully!
          </div>
        </div>
      )}

      {/* Modal */}
      <div
        id="modal-overlay"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={handleOutsideClick}
      >
        <div className="bg-white w-[95%] max-w-5xl h-auto max-h-[90vh] rounded-lg shadow-lg p-6 relative">
          
          {/* ✅ LOADING OVERLAY: Show spinner when loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <div className="flex flex-col items-center">
                <FaSpinner className="animate-spin text-4xl text-blue-500 mb-2" />
                <span className="text-lg font-medium text-gray-700">Saving Vehicle...</span>
                <span className="text-sm text-gray-500">Please wait</span>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4 text-center">
            Add Outsource Vehicle
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-2">
              <div>
                <label className="font-medium">Vehicle Name & Reg. No.</label>
                <input
                  type="text"
                  name="vehicleNameAndRegNo"
                  value={formData.vehicleNameAndRegNo}
                  onChange={handleChange}
                  disabled={isLoading} // ✅ Disable inputs when loading
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Vehicle RC No.</label>
                <input
                  type="text"
                  name="vehicleRcNo"
                  value={formData.vehicleRcNo}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Car Plate No.</label>
                <input
                  type="text"
                  name="carNoPlate"
                  value={formData.carNoPlate}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Insurance</label>
                <input
                  type="file"
                  name="insurance"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Permit</label>
                <input
                  type="file"
                  name="permit"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Authorization</label>
                <input
                  type="file"
                  name="authorization"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Car Image</label>
                <input
                  type="file"
                  name="carImage"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Front Image</label>
                <input
                  type="file"
                  name="frontImage"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Back Image</label>
                <input
                  type="file"
                  name="backImage"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Side Image</label>
                <input
                  type="file"
                  name="sideImage"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-medium">Car's Other Details</label>
                <textarea
                  name="carOtherDetails"
                  value={formData.carOtherDetails}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                ></textarea>
              </div>
            </div>

            {/* ✅ UPDATED: Buttons with loading state */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Close
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
              >
                Reset
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 rounded-md font-medium transition duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Outsourceform;