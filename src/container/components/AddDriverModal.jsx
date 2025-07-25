"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa"; // ✅ ADD: FaSpinner import
import axios from "axios";

const AddDriverModal = ({ isOpen, onClose, onSuccess}) => {
  const [formData, setFormData] = useState({
    DriverName: "",
    contactNo: "",
    AltMobNum: "",
    Adress: "",
    otherDetails: "",
    aadhaNo: "",
    drLicenseNo: "",
    pvcNo2: "",
    status: "",
    emailId: "",
  });

  const [files, setFiles] = useState({
    DriverImgSelfie: null,
    Aadhar: null,
    authorizationImage: null,
    DrLicenceNum: null,
    PvcNo: null,
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State for success popup
  const [isLoading, setIsLoading] = useState(false); // ✅ ADD: Loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: selectedFiles[0], // Store the first selected file
    }));
  };

  // ✅ UPDATED: Handle submit with loading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ START: Set loading to true when submission starts
    setIsLoading(true);

    const data = new FormData();
    data.append("DriverName", formData.DriverName);
    data.append("contactNo", formData.contactNo);
    data.append("AltMobNum", formData.AltMobNum);
    data.append("Adress", formData.Adress);
    data.append("otherDetails", formData.otherDetails);
    data.append("aadhaNo", formData.aadhaNo);
    data.append("drLicenseNo", formData.drLicenseNo);
    data.append("pvcNo2", formData.pvcNo2);
    data.append("status", "PENDING");
    data.append("emailId", formData.emailId);

    // Append files to FormData
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        data.append(key, files[key]);
      }
    });

    try {
      const response = await axios.post(
        " http://localhost:8085/driverAdmin/save",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ SUCCESS: Show success popup and reset form
      setShowSuccessPopup(true); // Show success popup
      setTimeout(() => {
        setShowSuccessPopup(false); // Hide success popup after 3 seconds
        onClose(); // Close the modal
        onSuccess(); // Trigger the callback to refresh the driver list
      }, 3000);

      // ✅ OPTIONAL: Reset form data on success
      setFormData({
        DriverName: "",
        contactNo: "",
        AltMobNum: "",
        Adress: "",
        otherDetails: "",
        aadhaNo: "",
        drLicenseNo: "",
        pvcNo2: "",
        status: "",
        emailId: "",
      });
      setFiles({
        DriverImgSelfie: null,
        Aadhar: null,
        authorizationImage: null,
        DrLicenceNum: null,
        PvcNo: null,
      });

      console.log(response.data);
    } catch (error) {
      // ✅ ERROR: Stop loading and show error message
      console.error("Error saving driver:", error);
      alert("Failed to save driver. Please try again.");
    } finally {
      // ✅ FINALLY: Always stop loading regardless of success/error
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // ✅ Handle Reset Form with consistent keys
  const handleReset = () => {
    setFormData({
      DriverName: "",
      contactNo: "",
      AltMobNum: "",
      emailId: "",
      Adress: "",
      aadhaNo: "",
      drLicenseNo: "",
      pvcNo2: "",
      otherDetails: "",
      status: "",
    });
    setFiles({
      DriverImgSelfie: null,
      Aadhar: null,
      authorizationImage: null,
      DrLicenceNum: null,
      PvcNo: null,
    });
  };

  // ✅ Handle Modal Close when clicking outside
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay" && !isLoading) { // ✅ Prevent closing when loading
      onClose();
    }
  };

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="bg-green-500 text-white p-4 text-center animate-slide-down">
            Driver saved successfully!
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
                <span className="text-lg font-medium text-gray-700">Saving Driver...</span>
                <span className="text-sm text-gray-500">Please wait</span>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4 text-center">
            Add Driver Form
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto px-2">
              <div>
                <label className="font-medium">Driver Name</label>
                <input
                  type="text"
                  name="DriverName"
                  value={formData.DriverName}
                  onChange={handleChange}
                  disabled={isLoading} // ✅ Disable inputs when loading
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Contact No.</label>
                <input
                  type="text"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Alternate Mobile No.</label>
                <input
                  type="text"
                  name="AltMobNum"
                  value={formData.AltMobNum}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Driver's Email ID</label>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-medium">Address</label>
                <textarea
                  name="Adress"
                  value={formData.Adress}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                ></textarea>
              </div>

              <div>
                <label className="font-medium">Driver's Image/Selfie</label>
                <input
                  type="file"
                  name="DriverImgSelfie"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Adhaar Card No.</label>
                <input
                  type="text"
                  name="aadhaNo"
                  value={formData.aadhaNo}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter Adhaar Card No."
                />
                <input
                  type="file"
                  name="Aadhar"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">Driving Licence No.</label>
                <input
                  type="text"
                  name="drLicenseNo"
                  value={formData.drLicenseNo}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter Driving Licence No."
                />
                <input
                  type="file"
                  name="DrLicenceNum"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="font-medium">PVC No.</label>
                <input
                  type="text"
                  name="pvcNo2"
                  value={formData.pvcNo2}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter PVC No."
                />
                <input
                  type="file"
                  name="PvcNo"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className={`border p-2 rounded-md w-full ${
                    isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-medium">Other Details</label>
                <textarea
                  name="otherDetails"
                  value={formData.otherDetails}
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

export default AddDriverModal;