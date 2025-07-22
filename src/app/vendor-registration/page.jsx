"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const initialVendorState = {
    vendorCompanyName: "",
    contactNo: "",
    alternateMobileNo: "",
    city: "",
    vendorEmail: "",
    bankName: "",
    bankAccountNo: "",
    ifscCode: "",
    aadharNo: "",
    panNo: "",
    udyogAadharNo: "",
    govtApprovalCertificate: null,
    vendorDocs: null,
    vendorImage: null,
    aadharPhoto: null,
    panPhoto: null,
    vendorOtherDetails: "",
  };

  const examplePlaceholders = {
    vendorCompanyName: "Ex. ABC Pvt Ltd",
    contactNo: "Ex. 1234567890",
    alternateMobileNo: "Ex. 0987654321",
    city: "Ex. Pune",
    vendorEmail: "Ex. abc@gmail.com",
    bankName: "Ex. State Bank of India",
    bankAccountNo: "Ex. 1234567890123456",
    ifscCode: "Ex. SBIN0001234",
    aadharNo: "Ex. 1234-5678-9012",
    panNo: "Ex. ABCDE1234F",
    udyogAadharNo: "Ex. 123456789012345",
    govtApprovalCertificate: "Upload certificate file",
    vendorDocs: "Upload vendor documents",
    vendorImage: "Upload vendor image",
    aadharPhoto: "Upload Aadhar photo",
    panPhoto: "Upload PAN photo",
    vendorOtherDetails: "Any additional details",
  };

  const [vendor, setVendor] = useState(initialVendorState);
  const [hasMounted, setHasMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formDisabled, setFormDisabled] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const handleFileChange = (e) => {
    setVendor((prev) => ({
      ...prev,
      [e.target.name]: e.target.files[0],
    }));
  };

  const handleChange = (e) => {
    setVendor((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(vendor).forEach((key) => {
      if (vendor[key]) {
        formData.append(key, vendor[key]);
      }
    });

    try {
      const res = await fetch("http://localhost:8085/vendors/add", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setVendor(initialVendorState);
        setErrorMsg("");
        setSuccessMsg("Registration submitted successfully! Please check your email.");
        setFormDisabled(true);
      } else {
        const errorText = await res.text();
        setErrorMsg(
          errorText
            ? `Form submission failed: ${errorText}`
            : "Form submission failed due to a server error. Please try again later."
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMsg(
        "An error occurred while submitting the form. Please check your network connection and try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Vendor Registration
          </h2>
        </div>
        <div className="p-8">
          {successMsg ? (
            <div className="text-center text-green-600 font-bold text-xl">
              {successMsg}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(vendor).map((key) => (
                  <div key={key} className="flex flex-col">
                    <label
                      htmlFor={key}
                      className="mb-2 text-sm font-semibold text-gray-700"
                    >
                      {(() => {
                        switch (key) {
                          case "vendorCompanyName":
                            return "Vendor Company Name";
                          case "contactNo":
                            return "Contact Number";
                          case "alternateMobileNo":
                            return "Alternate Mobile Number";
                          case "city":
                            return "City";
                          case "vendorEmail":
                            return "Vendor Email";
                          case "bankName":
                            return "Bank Name";
                          case "bankAccountNo":
                            return "Bank Account Number";
                          case "ifscCode":
                            return "IFSC Code";
                          case "aadharNo":
                            return "Aadhar Number";
                          case "panNo":
                            return "PAN Number";
                          case "udyogAadharNo":
                            return "Udyog Aadhar Number";
                          case "govtApprovalCertificate":
                            return "Government Approval Certificate";
                          case "vendorDocs":
                            return "Vendor Documents";
                          case "vendorImage":
                            return "Vendor Image";
                          case "aadharPhoto":
                            return "Aadhar Photo";
                          case "panPhoto":
                            return "PAN Photo";
                          case "vendorOtherDetails":
                            return "Other Details";
                          default:
                            return key;
                        }
                      })()}
                    </label>
                    {key.includes("Photo") ||
                    key.includes("Image") ||
                    key.includes("Docs") ||
                    key.includes("Certificate") ? (
                      <input
                        id={key}
                        name={key}
                        type="file"
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        onChange={handleFileChange}
                        disabled={formDisabled}
                      />
                    ) : (
                      <input
                        id={key}
                        name={key}
                        type="text"
                        placeholder={examplePlaceholders[key]}
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        value={vendor[key]}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        disabled={formDisabled}
                      />
                    )}
                  </div>
                ))}
              </div>
              {errorMsg && (
                <div className="text-center text-red-500 font-medium">
                  {errorMsg}
                </div>
              )}
              <div className="text-center">
                <button
                  type="submit"
                  className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition duration-300 text-white font-semibold px-8 py-3 rounded-full shadow-lg"
                  disabled={formDisabled}
                >
                  Submit Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
