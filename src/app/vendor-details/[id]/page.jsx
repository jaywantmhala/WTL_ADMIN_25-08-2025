"use client";
// import { useEffect, useState } from "react";
import React, { useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../container/components/Navbar";

const VendorDetails = ({ params }) => {
  const { id } = React.use(params);
  const [vendor, setVendor] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewImages, setPreviewImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const fetchVendorDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(` https://api.worldtriplink.com/vendors/${id}`);
        const data = await response.json();
        setVendor(data);
        console.log("Image",data.vendorImage)
        setFormData(data);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      }
      setLoading(false);
    };

    fetchVendorDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreviewImages((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const form = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        form.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch(
        ` https://api.worldtriplink.com/vendors/update-fields/vendor/${id}`,
        {
          method: "PUT",
          body: form,
        }
      );

      if (response.ok) {
        const result = await response.json();
        // alert("Vendor updated successfully!");
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 1000);

        setIsModalOpen(false);
        setVendor(result);
        setFormData(result);
        setPreviewImages({});
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        alert("Error updating vendor.");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      alert("Error updating vendor.");
    }
  };

  return (
    <Navbar>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-6">
        <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-5xl flex gap-8">
          {/* Left: Vendor Info */}
          <div className="w-1/2 space-y-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center">
              Vendor Details
            </h2>

            {showSuccessPopup && (
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="bg-green-500 text-white p-4 text-center animate-slide-down">
              Vendor Updated successfully!
            </div>
          </div>
        )}

            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : vendor ? (
              <div className="border p-6 rounded-lg shadow-inner bg-white space-y-4">
                <h3 className="text-xl font-bold text-blue-800">
                  {vendor.vendorCompanyName}
                </h3>
                <p className="text-gray-600">{vendor.city}</p>
                <div className="text-sm space-y-1 text-gray-700">
                  <p><strong>Contact:</strong> {vendor.contactNo}</p>
                  <p><strong>Alt Contact:</strong> {vendor.alternateMobileNo}</p>
                  <p><strong>Email:</strong> {vendor.vendorEmail}</p>
                  <p><strong>Bank:</strong> {vendor.bankName}</p>
                  <p><strong>Account No:</strong> {vendor.bankAccountNo}</p>
                  <p><strong>IFSC:</strong> {vendor.ifscCode}</p>
                  <p><strong>Aadhar No:</strong> {vendor.aadharNo}</p>
                  <p><strong>PAN No:</strong> {vendor.panNo}</p>
                </div>
              </div>
            ) : (
              <p className="text-red-500 text-center">Vendor not found!</p>
            )}

            <button
              className="w-full mt-4 bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 shadow"
              onClick={() => setIsModalOpen(true)}
            >
              ✏️ Edit Vendor
            </button>
            <button
              className="w-full mt-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              onClick={() => router.push("/vendors/all-vendors")}
            >
              ← Back to Vendors
            </button>
          </div>

          {/* Right: Vendor Documents Changes || Done From Here About Cloudinary */}
          <div className="w-1/2 space-y-6">
            <img src={vendor?.vendorImage?.replace("/uploads/", "")}
alt="Vendor"
              className="w-40 h-40 rounded-lg object-cover mx-auto border shadow-md"
            />
            <div className="space-y-2">
              <a
                href={vendor?.panPhoto?.replace("/uploads/", "")}
                target="_blank"
                className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded"
              >
                View PAN Card
              </a>
              <a
                href={vendor?.aadharPhoto?.replace("/uploads/", "")}
                target="_blank"
                className="block bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded"
              >
                View Aadhar
              </a>
              <a
                href={vendor?.govtApprovalCertificate.replace("/uploads/", "")}
                target="_blank"
                className="block bg-purple-500 hover:bg-purple-600 text-white text-center py-2 rounded"
              >
                View Certificate
              </a>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 rounded-xl shadow-lg relative">
              <h2 className="text-2xl font-semibold text-center mb-6 text-blue-700">
                Edit Vendor Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Text Inputs */}
                {[
                  { name: "vendorCompanyName", label: "Company Name" },
                  { name: "contactNo", label: "Contact Number" },
                  { name: "alternateMobileNo", label: "Alternate Contact" },
                  { name: "city", label: "City" },
                  { name: "vendorEmail", label: "Email Address" },
                  { name: "bankName", label: "Bank Name" },
                  { name: "bankAccountNo", label: "Bank Account No" },
                  { name: "ifscCode", label: "IFSC Code" },
                  { name: "aadharNo", label: "Aadhar Number" },
                  { name: "panNo", label: "PAN Number" },
                  { name: "udyogAadharNo", label: "Udyog Aadhar Number" },
                  { name: "vendorOtherDetails", label: "Other Details" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      name={name}
                      value={formData[name] || ""}
                      placeholder={label}
                      onChange={handleChange}
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:border-blue-400"
                    />
                  </div>
                ))}

                {/* File Inputs */}
                {[
                  { name: "vendorImage", label: "Profile Image" },
                  { name: "aadharPhoto", label: "Aadhar Photo" },
                  { name: "panPhoto", label: "PAN Photo" },
                  { name: "govtApprovalCertificate", label: "Govt Certificate" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <img
                      src={
                        previewImages[name]
                          ? previewImages[name]
                          : vendor && vendor[name]
                          ? ` https://api.worldtriplink.com/${vendor[name]}`
                          : ""
                      }
                      alt={label}
                      className="w-full h-24 object-cover rounded border mb-1"
                    />
                    <input
                      type="file"
                      name={name}
                      accept="image/*"
                      onChange={handleChange}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6 gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white px-5 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

export default VendorDetails;