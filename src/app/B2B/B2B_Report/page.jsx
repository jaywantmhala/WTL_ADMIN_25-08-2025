"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";
import Navbar from "../../../container/components/Navbar";

// Helper: Convert base64 data URL => Blob (if needed)
function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default function AllB2B() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [b2bList, setB2BList] = useState([]);

  // Form data with additional fields for actual File objects
  const [formData, setFormData] = useState({
    companyName: "",
    contactNo: "",
    alternateMobileNo: "",
    city: "",
    businessGmail: "",
    bankName: "",
    bankAccountNo: "",
    ifscCode: "",
    panNo: "",
    companyOtherDetails: "",
    gmail: "",
    password: "",
    companyLogo: null,            // Base64 preview
    companyLogoFile: null,        // Actual File object
    govtApprovalCertificate: null,
    govtApprovalCertificateFile: null,
    companyDocs: null,
    companyDocsFile: null,
    panDocs: null,
    panDocsFile: null,
  });

  // Fetch B2B list from backend
  const fetchB2BList = async () => {
    try {
      const res = await fetch("https://api.worldtriplink.com/b2b/all");
      if (!res.ok) throw new Error("Failed to fetch B2B data");
      const data = await res.json();
      console.log("Fetched B2B List:", data);
      setB2BList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchB2BList();
  }, []);

  // Convert file inputs to base64 for preview and store actual file object
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      console.log(`${name} file loaded for preview.`);
      setFormData((prev) => ({
        ...prev,
        [name]: reader.result, // Base64 preview
        [name + "File"]: file,  // Actual file object
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form to POST /b2b/add
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      // Append text fields
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("contactNo", formData.contactNo);
      formDataToSend.append("alternateMobileNo", formData.alternateMobileNo);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("businessGmail", formData.businessGmail);
      formDataToSend.append("bankName", formData.bankName);
      formDataToSend.append("bankAccountNo", formData.bankAccountNo);
      formDataToSend.append("ifscCode", formData.ifscCode);
      formDataToSend.append("panNo", formData.panNo);
      formDataToSend.append("companyOtherDetails", formData.companyOtherDetails || "");
      formDataToSend.append("gmail", formData.gmail);
      formDataToSend.append("password", formData.password);

      // Append files using their actual file objects and original names
      if (formData.companyLogoFile) {
        console.log("Uploading Company Logo:", formData.companyLogoFile.name);
        formDataToSend.append("companyLogo", formData.companyLogoFile, formData.companyLogoFile.name);
      }
      if (formData.govtApprovalCertificateFile) {
        console.log("Uploading Govt Approval Certificate:", formData.govtApprovalCertificateFile.name);
        formDataToSend.append("govtApprovalCertificate", formData.govtApprovalCertificateFile, formData.govtApprovalCertificateFile.name);
      }
      if (formData.companyDocsFile) {
        console.log("Uploading Company Docs:", formData.companyDocsFile.name);
        formDataToSend.append("companyDocs", formData.companyDocsFile, formData.companyDocsFile.name);
      }
      if (formData.panDocsFile) {
        console.log("Uploading PAN Docs:", formData.panDocsFile.name);
        formDataToSend.append("panDocs", formData.panDocsFile, formData.panDocsFile.name);
      }

      const response = await fetch("https://api.worldtriplink.com/b2b/add", {
        method: "POST",
        body: formDataToSend,
      });
      if (!response.ok) {
        throw new Error("Failed to save B2B");
      }
      const savedRecord = await response.json();
      console.log("B2B record saved:", savedRecord);

      // Refresh the list
      await fetchB2BList();

      // Reset form & close modal
      setFormData({
        companyName: "",
        contactNo: "",
        alternateMobileNo: "",
        city: "",
        businessGmail: "",
        bankName: "",
        bankAccountNo: "",
        ifscCode: "",
        panNo: "",
        companyOtherDetails: "",
        gmail: "",
        password: "",
        companyLogo: null,
        companyLogoFile: null,
        govtApprovalCertificate: null,
        govtApprovalCertificateFile: null,
        companyDocs: null,
        companyDocsFile: null,
        panDocs: null,
        panDocsFile: null,
      });
      setShowModal(false);
    } catch (err) {
      console.error("Error saving B2B:", err);
    }
  };

  // Helper: Build final image URL from file path
  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads/")) {
      return "https://api.worldtriplink.com" + path;
    }
    return "https://api.worldtriplink.com/uploads/" + path;
  };

  // Delete a B2B record by ID
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`https://api.worldtriplink.com/b2b/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete record");
      const message = await res.text();
      console.log("Delete message:", message);
      // Refresh the list after deletion
      await fetchB2BList();
    } catch (err) {
      console.error("Error deleting B2B:", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - fixed and not scrollable */}
      <div className="h-full">
        <Navbar />
      </div>
      
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">B2B List</h2>
  
          {/* Search & Add B2B */}
          <div className="mb-4 flex items-center gap-4">
            <input
              type="text"
              className="w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
  
          {/* Delete Heading */}
          <h3 className="text-xl font-bold mb-2">Delete</h3>
  
          {/* B2B Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Company Name</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Business Email</th>
                  <th className="p-3 text-center">View</th>
                  <th className="p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {b2bList
                  .filter((b2b) =>
                    (b2b.companyName?.toLowerCase() || "").includes(search.toLowerCase())
                  )
                  .map((b2b, index) => (
                    <tr key={b2b.id || index} className="border-b bg-gray-100">
                      <td className="p-3">{b2b.id}</td>
                      <td className="p-3">{b2b.companyName}</td>
                      <td className="p-3">{b2b.contactNo}</td>
                      <td className="p-3">{b2b.cityName}</td>
                      <td className="p-3">{b2b.businessGmail}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => router.push(`/B2B/b2b-details/${b2b.id}`)}
                          className="text-blue-600 hover:text-blue-800 transition duration-200"
                        >
                          <FaEye size={20} />
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(b2b.id)}
                          className="text-red-600 hover:text-red-800 transition duration-200"
                        >
                          <FaTrash size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Modal for Adding B2B */}
      {showModal && (
             <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
           <div className="bg-white p-5 rounded-lg shadow-lg w-1/2 max-h-[70vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add B2B Form</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                className="w-full p-2 mb-2 border rounded"
                value={formData.companyName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="contactNo"
                placeholder="Contact No."
                className="w-full p-2 mb-2 border rounded"
                value={formData.contactNo}
                onChange={handleChange}
              />
              <input
                type="text"
                name="alternateMobileNo"
                placeholder="Alternate Mobile No."
                className="w-full p-2 mb-2 border rounded"
                value={formData.alternateMobileNo}
                onChange={handleChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                className="w-full p-2 mb-2 border rounded"
                value={formData.city}
                onChange={handleChange}
              />
              <input
                type="text"
                name="businessGmail"
                placeholder="Business Email"
                className="w-full p-2 mb-2 border rounded"
                value={formData.businessGmail}
                onChange={handleChange}
              />
              <input
                type="text"
                name="bankName"
                placeholder="Bank Name"
                className="w-full p-2 mb-2 border rounded"
                value={formData.bankName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="bankAccountNo"
                placeholder="Bank Account No"
                className="w-full p-2 mb-2 border rounded"
                value={formData.bankAccountNo}
                onChange={handleChange}
              />
              <input
                type="text"
                name="ifscCode"
                placeholder="IFSC Code"
                className="w-full p-2 mb-2 border rounded"
                value={formData.ifscCode}
                onChange={handleChange}
              />
              <input
                type="text"
                name="panNo"
                placeholder="PAN No."
                className="w-full p-2 mb-2 border rounded"
                value={formData.panNo}
                onChange={handleChange}
              />
              <textarea
                name="companyOtherDetails"
                placeholder="Company Other Details"
                className="w-full p-2 mb-2 border rounded"
                value={formData.companyOtherDetails}
                onChange={handleChange}
              />
             

              <label className="block mb-1 font-semibold">Company Logo</label>
              <input
                type="file"
                name="companyLogo"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleFileChange}
              />
              <label className="block mb-1 font-semibold">Govt Approval Certificate</label>
              <input
                type="file"
                name="govtApprovalCertificate"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleFileChange}
              />
              <label className="block mb-1 font-semibold">Company Docs</label>
              <input
                type="file"
                name="companyDocs"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleFileChange}
              />
              <label className="block mb-1 font-semibold">PAN Docs</label>
              <input
                type="file"
                name="panDocs"
                className="w-full p-2 mb-2 border rounded"
                onChange={handleFileChange}
              />

              <div className="flex justify-end gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Submit
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      </div>
  );
}
