"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";
import Navbar from "../../container/components/Navbar";

const AllVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newVendor, setNewVendor] = useState({
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
    vendorImage: null,
    aadharPhoto: null,
    panPhoto: null,
    vendorOtherDetails: "",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const response = await fetch(" https://api.worldtriplink.com/vendors/allVendors");
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
      setLoading(false);
    };

    fetchVendors();
  }, []);

  const handleFileChange = (e) => {
    setNewVendor((prev) => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(newVendor).forEach((key) => {
      if (newVendor[key]) {
        formData.append(key, newVendor[key]);
      }
    });

    try {
      const response = await fetch(" https://api.worldtriplink.com/vendors/add", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Vendor added successfully");
        setShowForm(false);
        const updatedVendor = await response.json();
        setVendors((prev) => [...prev, updatedVendor]);
        setNewVendor({
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
          vendorImage: null,
          aadharPhoto: null,
          panPhoto: null,
          vendorOtherDetails: "",
        });
      } else {
        alert("Error adding vendor");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const response = await fetch(` https://api.worldtriplink.com/vendors/delete/${vendorId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Vendor deleted successfully");
        setVendors((prev) => prev.filter((vendor) => vendor.id !== vendorId));
      } else {
        alert("Error deleting vendor");
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Filter vendors based on the search input
  const filteredVendors = vendors.filter((vendor) =>
    vendor.vendorCompanyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
    {/* Sidebar - fixed and not scrollable */}
    <div className="h-full">
      <Navbar />
    </div>
    
    {/* Main content - scrollable */}
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          All Vendor Details
        </h2>
  
        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by vendor name..."
            className="w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
  
        {showForm && (
          <form className="bg-gray-100 p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
            <h3 className="text-xl font-semibold mb-4">Add New Vendor</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(newVendor).map((key) => (
                <div key={key} className="flex flex-col">
                  <label htmlFor={key} className="mb-1 font-semibold">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </label>
                  {(key.includes("Photo") ||
                    key.includes("Image") ||
                    key.includes("Docs") ||
                    key.includes("Certificate")) ? (
                    <input
                      id={key}
                      name={key}
                      type="file"
                      className="p-2 border border-gray-300 rounded-lg"
                      onChange={handleFileChange}
                    />
                  ) : (
                    <input
                      id={key}
                      type="text"
                      placeholder={key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      className="p-2 border border-gray-300 rounded-lg"
                      value={newVendor[key]}
                      onChange={(e) =>
                        setNewVendor((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg">
              Submit
            </button>
          </form>
        )}
  
        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="p-3 text-left">Vendor Name</th>
                  <th className="p-3 text-left">Contact No.</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Udyog Aadhar</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Bank</th>
                  <th className="p-3 text-left">Aadhar</th>
                  <th className="p-3 text-center">View</th>
                  <th className="p-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b bg-gray-100">
                    <td className="p-3">{vendor.vendorCompanyName}</td>
                    <td className="p-3">{vendor.contactNo}</td>
                    <td className="p-3">{vendor.city}</td>
                    <td className="p-3">{vendor.udyogAadharNo}</td>
                    <td className="p-3">{vendor.vendorEmail}</td>
                    <td className="p-3">{vendor.bankName}</td>
                    <td className="p-3">{vendor.aadharNo}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => router.push(`/vendor-details/${vendor.id}`)}
                        className="text-blue-600 hover:text-blue-800 transition duration-200"
                      >
                        <FaEye size={20} />
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(vendor.id)}
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
        )}
      </div>
    </div>
  </div>
  );
};

export default AllVendors;
